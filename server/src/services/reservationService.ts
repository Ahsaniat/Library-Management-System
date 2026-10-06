import { Op, Transaction } from 'sequelize';
import { Reservation, Book, BookCopy, User } from '../models';
import sequelize from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { ReservationStatus, BookStatus, NotificationType } from '../types';
import { notificationService } from './notificationService';
import { settingService } from './settingService';
import logger from '../utils/logger';

interface CreateReservationData {
  bookId: string;
  userId: string;
}

interface ListOptions {
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE_SIZE = 50;

export class ReservationService {
  async create(data: CreateReservationData): Promise<Reservation> {
    return sequelize.transaction(async (t: Transaction) => {
      const book = await Book.findByPk(data.bookId, {
        include: [{ model: BookCopy, as: 'copies' }],
        transaction: t,
      });

      if (!book) {
        throw new NotFoundError('Book');
      }

      const user = await User.findByPk(data.userId, { transaction: t });
      if (!user || !user.isActive) {
        throw new NotFoundError('User');
      }

      const existingReservation = await Reservation.findOne({
        where: {
          bookId: data.bookId,
          userId: data.userId,
          status: { [Op.in]: [ReservationStatus.PENDING, ReservationStatus.READY] },
        },
        transaction: t,
      });

      if (existingReservation) {
        throw new ConflictError('You already have an active reservation for this book');
      }

      const copies = (book as Book & { copies?: BookCopy[] }).copies ?? [];
      const availableCopy = copies.find(
        (copy) => copy.status === BookStatus.AVAILABLE
      );

      if (availableCopy) {
        throw new ValidationError('Book is available for checkout, no need to reserve');
      }

      const lastReservation = await Reservation.findOne({
        where: { bookId: data.bookId },
        order: [['queuePosition', 'DESC']],
        transaction: t,
      });

      const queuePosition = lastReservation ? lastReservation.queuePosition + 1 : 1;

      const reservation = await Reservation.create(
        {
          bookId: data.bookId,
          userId: data.userId,
          queuePosition,
          status: ReservationStatus.PENDING,
        },
        { transaction: t }
      );

      logger.info({
        action: 'reservation_created',
        reservationId: reservation.id,
        bookId: data.bookId,
        userId: data.userId,
        queuePosition,
      });

      return reservation;
    });
  }

  async cancel(reservationId: string, userId: string, reason?: string): Promise<Reservation> {
    return sequelize.transaction(async (t: Transaction) => {
      const reservation = await Reservation.findOne({
        where: {
          id: reservationId,
          userId,
          status: { [Op.in]: [ReservationStatus.PENDING, ReservationStatus.READY] },
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!reservation) {
        throw new NotFoundError('Active reservation');
      }

      const wasReady = reservation.status === ReservationStatus.READY;

      await reservation.update(
        {
          status: ReservationStatus.CANCELLED,
          notes: reason,
        },
        { transaction: t }
      );

      await this.reorderQueue(reservation.bookId, reservation.queuePosition, t);

      // Releasing a ready hold must immediately offer the copy to the next
      // member in the queue.
      if (wasReady) {
        await this.promoteNextReservation(reservation.bookId, t);
      }

      logger.info({
        action: 'reservation_cancelled',
        reservationId: reservation.id,
        userId,
      });

      return reservation;
    });
  }

  async getUserReservations(
    userId: string,
    options: ListOptions = {}
  ): Promise<{ rows: Reservation[]; count: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? DEFAULT_PAGE_SIZE;

    return Reservation.findAndCountAll({
      where: { userId },
      include: [
        { model: Book, as: 'book', attributes: ['id', 'title', 'isbn', 'coverImage'] },
      ],
      order: [['reservedAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });
  }

  async getBookReservations(
    bookId: string,
    options: ListOptions = {}
  ): Promise<{ rows: Reservation[]; count: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? DEFAULT_PAGE_SIZE;

    return Reservation.findAndCountAll({
      where: {
        bookId,
        status: { [Op.in]: [ReservationStatus.PENDING, ReservationStatus.READY] },
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
      order: [['queuePosition', 'ASC']],
      limit,
      offset: (page - 1) * limit,
    });
  }

  /**
   * Promotes the next pending reservation for a title to READY and notifies the
   * member. Must run inside an existing transaction and takes a row lock so two
   * concurrent returns cannot promote the same reservation twice.
   */
  async promoteNextReservation(bookId: string, t: Transaction): Promise<Reservation | null> {
    const next = await Reservation.findOne({
      where: { bookId, status: ReservationStatus.PENDING },
      order: [['queuePosition', 'ASC']],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!next) {
      return null;
    }

    const holdDays = await settingService.getNumber('reservation.holdDays', 3);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + holdDays);

    await next.update(
      {
        status: ReservationStatus.READY,
        expiresAt,
        notifiedAt: new Date(),
      },
      { transaction: t }
    );

    await this.notifyReservationReady(next, t);

    logger.info({
      action: 'reservation_ready',
      reservationId: next.id,
      bookId,
      userId: next.userId,
    });

    return next;
  }

  async processExpiredReservations(): Promise<number> {
    const expiredReservations = await Reservation.findAll({
      where: {
        status: ReservationStatus.READY,
        expiresAt: { [Op.lt]: new Date() },
      },
    });

    let processed = 0;

    for (const candidate of expiredReservations) {
      await sequelize.transaction(async (t: Transaction) => {
        const reservation = await Reservation.findByPk(candidate.id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (
          !reservation ||
          reservation.status !== ReservationStatus.READY ||
          !reservation.expiresAt ||
          reservation.expiresAt.getTime() >= Date.now()
        ) {
          return;
        }

        await reservation.update({ status: ReservationStatus.EXPIRED }, { transaction: t });
        await this.reorderQueue(reservation.bookId, reservation.queuePosition, t);
        // A lapsed hold must not stall the queue: the next member is offered
        // the title immediately.
        await this.promoteNextReservation(reservation.bookId, t);
        processed++;
      });
    }

    if (processed > 0) {
      logger.info({ action: 'expired_reservations_processed', count: processed });
    }

    return processed;
  }

  private async notifyReservationReady(reservation: Reservation, t: Transaction): Promise<void> {
    const [user, book] = await Promise.all([
      User.findByPk(reservation.userId, { transaction: t }),
      Book.findByPk(reservation.bookId, { transaction: t }),
    ]);

    if (!user || !book) {
      return;
    }

    await notificationService.createAndSend({
      userId: user.id,
      type: NotificationType.RESERVATION_READY,
      title: 'Reservation ready for pickup',
      message: `"${book.title}" is ready for pickup. Please collect it before the hold expires.`,
      email: user.email,
      firstName: user.firstName,
      data: {
        bookTitle: book.title,
        expiresAt: reservation.expiresAt?.toISOString(),
        reservationId: reservation.id,
      },
    });
  }

  private async reorderQueue(
    bookId: string,
    cancelledPosition: number,
    t: Transaction
  ): Promise<void> {
    await Reservation.update(
      { queuePosition: sequelize.literal('queue_position - 1') },
      {
        where: {
          bookId,
          queuePosition: { [Op.gt]: cancelledPosition },
          status: ReservationStatus.PENDING,
        },
        transaction: t,
      }
    );
  }
}

export const reservationService = new ReservationService();
