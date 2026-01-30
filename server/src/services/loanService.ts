import { Op, Transaction } from 'sequelize';
import { Loan, BookCopy, User, Book, Fine, Reservation } from '../models';
import sequelize from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { LoanStatus, BookStatus, ReservationStatus } from '../types';
import { calculateDueDate, calculateFine } from '../utils/helpers';
import logger from '../utils/logger';

interface CheckoutData {
  bookCopyId: string;
  userId: string;
  librarianId?: string;
  dueDate?: Date;
  isSelfCheckout?: boolean;
}

interface SelfCheckoutData {
  bookId: string;
  userId: string;
}

interface CheckinResult {
  loan: Loan;
  fine?: { amount: number; reason: string };
}

export class LoanService {
  async selfCheckout(data: SelfCheckoutData): Promise<Loan> {
    return sequelize.transaction(async (t: Transaction) => {
      const availableCopy = await BookCopy.findOne({
        where: {
          bookId: data.bookId,
          status: BookStatus.AVAILABLE,
        },
        include: [{ model: Book, as: 'book' }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!availableCopy) {
        throw new ConflictError('No available copies for self-checkout');
      }

      const user = await User.findByPk(data.userId, { transaction: t });
      if (!user || !user.isActive) {
        throw new NotFoundError('User');
      }

      const activeFines = await Fine.count({
        where: { userId: data.userId, status: 'pending' },
        transaction: t,
      });

      if (activeFines > 0) {
        throw new ValidationError('You have unpaid fines. Please clear them before borrowing.');
      }

      const activeLoans = await Loan.count({
        where: { userId: data.userId, status: LoanStatus.ACTIVE },
        transaction: t,
      });

      const maxLoans = 5;
      if (activeLoans >= maxLoans) {
        throw new ValidationError(`You have reached the maximum of ${maxLoans} active loans`);
      }

      const existingLoan = await Loan.findOne({
        where: {
          userId: data.userId,
          status: LoanStatus.ACTIVE,
        },
        include: [
          {
            model: BookCopy,
            as: 'bookCopy',
            where: { bookId: data.bookId },
          },
        ],
        transaction: t,
      });

      if (existingLoan) {
        throw new ConflictError('You already have an active loan for this book');
      }

      const dueDate = calculateDueDate(14);

      await availableCopy.update({ status: BookStatus.BORROWED }, { transaction: t });

      const loan = await Loan.create(
        {
          bookCopyId: availableCopy.id,
          userId: data.userId,
          dueDate,
          status: LoanStatus.ACTIVE,
        },
        { transaction: t }
      );

      await Reservation.update(
        { status: ReservationStatus.FULFILLED, fulfilledAt: new Date() },
        {
          where: {
            bookId: data.bookId,
            userId: data.userId,
            status: { [Op.in]: [ReservationStatus.PENDING, ReservationStatus.READY] },
          },
          transaction: t,
        }
      );

      logger.info({
        action: 'self_checkout',
        loanId: loan.id,
        bookCopyId: availableCopy.id,
        bookId: data.bookId,
        userId: data.userId,
      });

      return loan;
    });
  }

  async checkout(data: CheckoutData): Promise<Loan> {
    return sequelize.transaction(async (t: Transaction) => {
      const bookCopy = await BookCopy.findByPk(data.bookCopyId, {
        include: [{ model: Book, as: 'book' }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!bookCopy) {
        throw new NotFoundError('Book copy');
      }

      if (bookCopy.status !== BookStatus.AVAILABLE) {
        throw new ConflictError(`Book is not available (status: ${bookCopy.status})`);
      }

      const user = await User.findByPk(data.userId, { transaction: t });
      if (!user || !user.isActive) {
        throw new NotFoundError('User');
      }

      const activeFines = await Fine.count({
        where: { userId: data.userId, status: 'pending' },
        transaction: t,
      });

      if (activeFines > 0) {
        throw new ValidationError('User has unpaid fines');
      }

      const activeLoans = await Loan.count({
        where: { userId: data.userId, status: LoanStatus.ACTIVE },
        transaction: t,
      });

      const maxLoans = 5;
      if (activeLoans >= maxLoans) {
        throw new ValidationError(`Maximum ${maxLoans} active loans allowed`);
      }

      const dueDate = data.dueDate ?? calculateDueDate(14);

      await bookCopy.update({ status: BookStatus.BORROWED }, { transaction: t });

      const loan = await Loan.create(
        {
          bookCopyId: data.bookCopyId,
          userId: data.userId,
          librarianId: data.librarianId,
          dueDate,
          status: LoanStatus.ACTIVE,
        },
        { transaction: t }
      );

      await Reservation.update(
        { status: ReservationStatus.FULFILLED, fulfilledAt: new Date() },
        {
          where: {
            bookId: bookCopy.bookId,
            userId: data.userId,
            status: ReservationStatus.READY,
          },
          transaction: t,
        }
      );

      logger.info({
        action: 'book_checkout',
        loanId: loan.id,
        bookCopyId: data.bookCopyId,
        userId: data.userId,
      });

      return loan;
    });
  }

  async checkin(bookCopyId: string, librarianId?: string, notes?: string): Promise<CheckinResult> {
    return sequelize.transaction(async (t: Transaction) => {
      const loan = await Loan.findOne({
        where: { bookCopyId, status: LoanStatus.ACTIVE },
        include: [{ model: BookCopy, as: 'bookCopy' }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!loan) {
        throw new NotFoundError('Active loan for this book');
      }

      const now = new Date();
      const isOverdue = now > loan.dueDate;

      await loan.update(
        {
          status: LoanStatus.RETURNED,
          returnedAt: now,
          notes: notes ?? loan.notes,
        },
        { transaction: t }
      );

      await BookCopy.update(
        { status: BookStatus.AVAILABLE },
        { where: { id: bookCopyId }, transaction: t }
      );

      let fineResult: { amount: number; reason: string } | undefined;

      if (isOverdue) {
        const fineAmount = calculateFine(loan.dueDate);
        if (fineAmount > 0) {
          await Fine.create(
            {
              loanId: loan.id,
              userId: loan.userId,
              amount: fineAmount,
              reason: 'Overdue return',
            },
            { transaction: t }
          );
          fineResult = { amount: fineAmount, reason: 'Overdue return' };
        }
      }

      const bookCopy = loan.get('bookCopy') as BookCopy;
      await this.processNextReservation(bookCopy.bookId, t);

      logger.info({
        action: 'book_checkin',
        loanId: loan.id,
        bookCopyId,
        isOverdue,
        fine: fineResult?.amount,
      });

      return { loan, fine: fineResult };
    });
  }

  async renew(loanId: string, userId: string): Promise<Loan> {
    return sequelize.transaction(async (t: Transaction) => {
      const loan = await Loan.findOne({
        where: { id: loanId, userId, status: LoanStatus.ACTIVE },
        include: [{ model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!loan) {
        throw new NotFoundError('Active loan');
      }

      if (loan.renewalCount >= loan.maxRenewals) {
        throw new ValidationError('Maximum renewals reached');
      }

      const now = new Date();
      if (now > loan.dueDate) {
        throw new ValidationError('Cannot renew overdue loan');
      }

      const bookCopy = loan.get('bookCopy') as BookCopy;
      const pendingReservations = await Reservation.count({
        where: {
          bookId: bookCopy.bookId,
          status: { [Op.in]: [ReservationStatus.PENDING, ReservationStatus.READY] },
        },
        transaction: t,
      });

      if (pendingReservations > 0) {
        throw new ValidationError('Book has pending reservations');
      }

      const newDueDate = calculateDueDate(14);
      await loan.update(
        {
          dueDate: newDueDate,
          renewalCount: loan.renewalCount + 1,
        },
        { transaction: t }
      );

      logger.info({
        action: 'loan_renewed',
        loanId: loan.id,
        renewalCount: loan.renewalCount + 1,
      });

      return loan;
    });
  }

  async getOverdueLoans(): Promise<Loan[]> {
    return Loan.findAll({
      where: {
        status: LoanStatus.ACTIVE,
        dueDate: { [Op.lt]: new Date() },
      },
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'borrower', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
      order: [['dueDate', 'ASC']],
    });
  }

  async getUserLoans(userId: string, status?: LoanStatus): Promise<Loan[]> {
    const where: { userId: string; status?: LoanStatus } = { userId };
    if (status) {
      where.status = status;
    }

    return Loan.findAll({
      where,
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
      ],
      order: [['borrowedAt', 'DESC']],
    });
  }

  private async processNextReservation(bookId: string, t: Transaction): Promise<void> {
    const nextReservation = await Reservation.findOne({
      where: { bookId, status: ReservationStatus.PENDING },
      order: [['queuePosition', 'ASC']],
      transaction: t,
    });

    if (nextReservation) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);

      await nextReservation.update(
        {
          status: ReservationStatus.READY,
          expiresAt,
          notifiedAt: new Date(),
        },
        { transaction: t }
      );

      logger.info({
        action: 'reservation_ready',
        reservationId: nextReservation.id,
        userId: nextReservation.userId,
      });
    }
  }
}

export const loanService = new LoanService();
