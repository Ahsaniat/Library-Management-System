import { Op, Transaction } from 'sequelize';
import { BookCopy, Book, Loan } from '../models';
import sequelize from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { BookStatus, LoanStatus } from '../types';
import { generateBarcode } from '../utils/helpers';
import logger from '../utils/logger';

interface ListOptions {
  page?: number;
  limit?: number;
}

interface CreateCopyData {
  bookId: string;
  barcode?: string;
  condition?: 'new' | 'good' | 'fair' | 'poor';
  location?: string;
  shelf?: string;
  section?: string;
  floor?: string;
  notes?: string;
  libraryId?: string;
}

interface UpdateCopyData {
  status?: BookStatus;
  condition?: 'new' | 'good' | 'fair' | 'poor';
  location?: string;
  shelf?: string;
  section?: string;
  floor?: string;
  notes?: string;
  libraryId?: string;
}

const DEFAULT_PAGE_SIZE = 50;

export class CopyService {
  async listByBook(
    bookId: string,
    options: ListOptions = {}
  ): Promise<{ rows: BookCopy[]; count: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? DEFAULT_PAGE_SIZE;

    return BookCopy.findAndCountAll({
      where: { bookId },
      order: [['barcode', 'ASC']],
      limit,
      offset: (page - 1) * limit,
    });
  }

  async create(data: CreateCopyData): Promise<BookCopy> {
    const book = await Book.findByPk(data.bookId);
    if (!book) {
      throw new NotFoundError('Book');
    }

    const barcode = data.barcode?.trim() || generateBarcode();
    const existing = await BookCopy.findOne({ where: { barcode } });
    if (existing) {
      throw new ConflictError('A copy with this barcode already exists');
    }

    const copy = await BookCopy.create({
      bookId: book.id,
      barcode,
      status: BookStatus.AVAILABLE,
      condition: data.condition ?? 'good',
      location: data.location,
      shelf: data.shelf,
      section: data.section,
      floor: data.floor,
      notes: data.notes,
      libraryId: data.libraryId,
    });

    logger.info({ action: 'book_copy_created', copyId: copy.id, bookId: book.id });
    return copy;
  }

  async update(id: string, data: UpdateCopyData): Promise<BookCopy> {
    const copy = await BookCopy.findByPk(id);
    if (!copy) {
      throw new NotFoundError('Book copy');
    }

    const activeLoan = await Loan.count({
      where: { bookCopyId: id, status: LoanStatus.ACTIVE },
    });

    if (activeLoan > 0 && data.status && data.status !== BookStatus.BORROWED) {
      throw new ConflictError('Cannot change the status of a copy that is on loan');
    }

    await copy.update(data);
    logger.info({ action: 'book_copy_updated', copyId: id, status: copy.status });
    return copy;
  }

  async remove(id: string): Promise<void> {
    return sequelize.transaction(async (t: Transaction) => {
      const copy = await BookCopy.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });

      if (!copy) {
        throw new NotFoundError('Book copy');
      }

      const activeLoan = await Loan.count({
        where: { bookCopyId: id, status: { [Op.in]: [LoanStatus.ACTIVE, LoanStatus.OVERDUE] } },
        transaction: t,
      });

      if (activeLoan > 0) {
        throw new ConflictError('Cannot remove a copy that is on loan');
      }

      await copy.destroy({ transaction: t });
      logger.info({ action: 'book_copy_removed', copyId: id });
    });
  }
}

export const copyService = new CopyService();
