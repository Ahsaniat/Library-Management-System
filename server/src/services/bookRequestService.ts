import { Op, Transaction } from 'sequelize';
import { BookRequest, User, Book } from '../models';
import { BookRequestStatus } from '../models/BookRequest';
import sequelize from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

interface CreateBookRequestData {
  userId: string;
  title: string;
  author?: string;
  isbn?: string;
  reason?: string;
}

interface ProcessBookRequestData {
  status: BookRequestStatus;
  adminNotes?: string;
  processedBy: string;
}

export class BookRequestService {
  async create(data: CreateBookRequestData): Promise<BookRequest> {
    if (data.isbn) {
      const existingBook = await Book.findOne({ where: { isbn: data.isbn } });
      if (existingBook) {
        throw new ConflictError('Book with this ISBN already exists in the library');
      }
    }

    const pendingCount = await BookRequest.count({
      where: {
        userId: data.userId,
        status: BookRequestStatus.PENDING,
      },
    });

    if (pendingCount >= 5) {
      throw new ValidationError('Maximum 5 pending book requests allowed');
    }

    const request = await BookRequest.create({
      userId: data.userId,
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      reason: data.reason,
      status: BookRequestStatus.PENDING,
    });

    logger.info({
      action: 'book_request_created',
      requestId: request.id,
      userId: data.userId,
      title: data.title,
    });

    return request;
  }

  async getUserRequests(userId: string): Promise<BookRequest[]> {
    return BookRequest.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async getAllRequests(status?: BookRequestStatus): Promise<BookRequest[]> {
    const where: { status?: BookRequestStatus } = {};
    if (status) {
      where.status = status;
    }

    return BookRequest.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] },
        { model: User, as: 'processor', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async getById(id: string): Promise<BookRequest> {
    const request = await BookRequest.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] },
        { model: User, as: 'processor', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
    });

    if (!request) {
      throw new NotFoundError('Book request');
    }

    return request;
  }

  async process(id: string, data: ProcessBookRequestData): Promise<BookRequest> {
    return sequelize.transaction(async (t: Transaction) => {
      const request = await BookRequest.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });

      if (!request) {
        throw new NotFoundError('Book request');
      }

      if (request.status !== BookRequestStatus.PENDING) {
        throw new ConflictError('Request has already been processed');
      }

      await request.update(
        {
          status: data.status,
          adminNotes: data.adminNotes,
          processedBy: data.processedBy,
          processedAt: new Date(),
        },
        { transaction: t }
      );

      logger.info({
        action: 'book_request_processed',
        requestId: request.id,
        status: data.status,
        processedBy: data.processedBy,
      });

      return request;
    });
  }

  async cancel(id: string, userId: string): Promise<BookRequest> {
    const request = await BookRequest.findOne({
      where: { id, userId, status: BookRequestStatus.PENDING },
    });

    if (!request) {
      throw new NotFoundError('Pending book request');
    }

    await request.update({ status: BookRequestStatus.REJECTED, adminNotes: 'Cancelled by user' });

    logger.info({
      action: 'book_request_cancelled',
      requestId: request.id,
      userId,
    });

    return request;
  }
}

export const bookRequestService = new BookRequestService();
