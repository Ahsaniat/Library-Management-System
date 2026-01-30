import { Op, Transaction } from 'sequelize';
import { Reservation, Book, BookCopy, User } from '../models';
import sequelize from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { ReservationStatus, BookStatus } from '../types';
import logger from '../utils/logger';

interface CreateReservationData {
  bookId: string;
  userId: string;
}

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

      await reservation.update(
        {
          status: ReservationStatus.CANCELLED,
          notes: reason,
        },
        { transaction: t }
      );

      await this.reorderQueue(reservation.bookId, reservation.queuePosition, t);

      logger.info({
        action: 'reservation_cancelled',
        reservationId: reservation.id,
        userId,
      });

      return reservation;
    });
  }

  async getUserReservations(userId: string): Promise<Reservation[]> {
    return Reservation.findAll({
      where: { userId },
      include: [
        { model: Book, as: 'book', attributes: ['id', 'title', 'isbn', 'coverImage'] },
      ],
      order: [['reservedAt', 'DESC']],
    });
  }

  async getBookReservations(bookId: string): Promise<Reservation[]> {
    return Reservation.findAll({
      where: {
        bookId,
        status: { [Op.in]: [ReservationStatus.PENDING, ReservationStatus.READY] },
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
      order: [['queuePosition', 'ASC']],
    });
  }

  async processExpiredReservations(): Promise<number> {
    const now = new Date();
    const expiredReservations = await Reservation.findAll({
      where: {
        status: ReservationStatus.READY,
        expiresAt: { [Op.lt]: now },
      },
    });

    for (const reservation of expiredReservations) {
      await sequelize.transaction(async (t: Transaction) => {
        await reservation.update(
          { status: ReservationStatus.EXPIRED },
          { transaction: t }
        );
        await this.reorderQueue(reservation.bookId, reservation.queuePosition, t);
      });
    }

    if (expiredReservations.length > 0) {
      logger.info({
        action: 'expired_reservations_processed',
        count: expiredReservations.length,
      });
    }

    return expiredReservations.length;
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
