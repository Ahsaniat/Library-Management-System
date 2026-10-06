import crypto from 'crypto';
import { Op, Transaction } from 'sequelize';
import { Fine, Payment, User, Loan, BookCopy, Book } from '../models';
import sequelize from '../config/database';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';
import { FineStatus } from '../types';
import logger from '../utils/logger';

interface ListOptions {
  page?: number;
  limit?: number;
}

interface FineFilters {
  status?: FineStatus;
  userId?: string;
}

interface PaymentData {
  amount: number;
  method: 'cash' | 'card' | 'online' | 'other';
  transactionId?: string;
  notes?: string;
  processedBy?: string;
}

const DEFAULT_PAGE_SIZE = 50;
const CENT_TOLERANCE = 0.011;

export class FineService {
  async getUserFines(
    userId: string,
    options: ListOptions = {}
  ): Promise<{ rows: Fine[]; count: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? DEFAULT_PAGE_SIZE;

    return Fine.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Loan,
          as: 'loan',
          attributes: ['id', 'dueDate', 'returnedAt'],
          include: [
            {
              model: BookCopy,
              as: 'bookCopy',
              attributes: ['id', 'barcode'],
              include: [{ model: Book, as: 'book', attributes: ['id', 'title'] }],
            },
          ],
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['id', 'amount', 'paymentMethod', 'receiptNumber', 'paidAt'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });
  }

  async getAllFines(
    filters: FineFilters = {},
    options: ListOptions = {}
  ): Promise<{ rows: Fine[]; count: number }> {
    const where: { status?: FineStatus; userId?: string } = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;

    const page = options.page ?? 1;
    const limit = options.limit ?? DEFAULT_PAGE_SIZE;

    return Fine.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });
  }

  /** Outstanding balance across pending and partially paid fines. */
  async getOutstandingTotal(userId: string): Promise<number> {
    const fines = await Fine.findAll({
      where: {
        userId,
        status: { [Op.in]: [FineStatus.PENDING, FineStatus.PARTIAL] },
      },
      attributes: ['amount', 'paidAmount'],
    });

    const total = fines.reduce(
      (sum, fine) => sum + (Number(fine.amount) - Number(fine.paidAmount)),
      0
    );
    return Math.max(0, Number(total.toFixed(2)));
  }

  async hasOutstandingFines(userId: string): Promise<boolean> {
    return (await this.getOutstandingTotal(userId)) > CENT_TOLERANCE;
  }

  async pay(
    fineId: string,
    data: PaymentData
  ): Promise<{ fine: Fine; payment: Payment }> {
    return sequelize.transaction(async (t: Transaction) => {
      const fine = await Fine.findByPk(fineId, { transaction: t, lock: t.LOCK.UPDATE });

      if (!fine) {
        throw new NotFoundError('Fine');
      }

      if (fine.status === FineStatus.WAIVED) {
        throw new ConflictError('Fine has been waived');
      }

      const outstanding = Number(fine.amount) - Number(fine.paidAmount);
      if (outstanding <= CENT_TOLERANCE) {
        throw new ConflictError('Fine is already fully paid');
      }

      if (data.amount > outstanding + CENT_TOLERANCE) {
        throw new ValidationError(
          `Payment exceeds the outstanding balance of ${outstanding.toFixed(2)}`
        );
      }

      const receiptNumber = `RCPT-${Date.now().toString(36).toUpperCase()}-${crypto
        .randomBytes(3)
        .toString('hex')
        .toUpperCase()}`;

      const payment = await Payment.create(
        {
          fineId: fine.id,
          userId: fine.userId,
          amount: data.amount,
          paymentMethod: data.method,
          transactionId: data.transactionId,
          receiptNumber,
          processedBy: data.processedBy,
          notes: data.notes,
        },
        { transaction: t }
      );

      const paidAmount = Number((Number(fine.paidAmount) + data.amount).toFixed(2));
      const fullyPaid = paidAmount >= Number(fine.amount) - CENT_TOLERANCE;

      await fine.update(
        {
          paidAmount,
          status: fullyPaid ? FineStatus.PAID : FineStatus.PARTIAL,
          paidAt: fullyPaid ? new Date() : fine.paidAt,
        },
        { transaction: t }
      );

      logger.info({
        action: 'fine_payment_recorded',
        fineId: fine.id,
        paymentId: payment.id,
        amount: data.amount,
        fullyPaid,
      });

      return { fine, payment };
    });
  }

  async waive(
    fineId: string,
    reason: string,
    waivedBy: string
  ): Promise<Fine> {
    return sequelize.transaction(async (t: Transaction) => {
      const fine = await Fine.findByPk(fineId, { transaction: t, lock: t.LOCK.UPDATE });

      if (!fine) {
        throw new NotFoundError('Fine');
      }

      if (Number(fine.paidAmount) > 0) {
        throw new ConflictError('A partially paid fine cannot be waived');
      }

      if (fine.status === FineStatus.WAIVED) {
        throw new ConflictError('Fine is already waived');
      }

      await fine.update(
        {
          status: FineStatus.WAIVED,
          waivedAt: new Date(),
          waivedBy,
          waiverReason: reason,
        },
        { transaction: t }
      );

      logger.info({ action: 'fine_waived', fineId: fine.id, waivedBy });
      return fine;
    });
  }
}

export const fineService = new FineService();
