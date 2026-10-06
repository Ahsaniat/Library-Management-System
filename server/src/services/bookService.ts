import { Op, WhereOptions, Includeable, Transaction } from 'sequelize';
import { Book, Author, Category, Publisher, BookCopy, Review } from '../models';
import sequelize from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { PaginationParams, PaginatedResponse, BookStatus } from '../types';
import { calculatePagination } from '../utils/helpers';
import logger from '../utils/logger';

const MAX_COPIES_PER_REQUEST = 1000;

interface BookSearchParams extends PaginationParams {
  q?: string;
  category?: string;
  author?: string;
  publisher?: string;
  year?: number;
  available?: boolean;
  language?: string;
}

interface CreateBookData {
  isbn: string;
  title: string;
  subtitle?: string;
  description?: string;
  publishedYear?: number;
  edition?: string;
  language?: string;
  pageCount?: number;
  coverImage?: string;
  authorId?: string;
  publisherId?: string;
  categoryId?: string;
  authorName?: string;
  publisherName?: string;
  categories?: string[];
  numberOfCopies?: number;
  averageRating?: number;
  totalRatings?: number;
}

export class BookService {
  private static readonly SORTABLE_COLUMNS: Record<string, string> = {
    title: 'title',
    publishedYear: 'publishedYear',
    averageRating: 'averageRating',
    totalRatings: 'totalRatings',
    createdAt: 'createdAt',
  };

  async search(params: BookSearchParams): Promise<PaginatedResponse<Book>> {
    const { page = 1, limit = 20, sortBy = 'title', sortOrder = 'asc' } = params;
    const offset = (page - 1) * limit;

    const where: WhereOptions = {};
    const include: Includeable[] = [
      { model: Author, as: 'author', attributes: ['id', 'name'] },
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Publisher, as: 'publisher', attributes: ['id', 'name'] },
    ];

    if (params.q) {
      const matchingAuthors = await Author.findAll({
        where: { name: { [Op.iLike]: `%${params.q}%` } },
        attributes: ['id'],
      });

      const searchConditions: WhereOptions[] = [
        { title: { [Op.iLike]: `%${params.q}%` } },
        { isbn: { [Op.iLike]: `%${params.q}%` } },
        { description: { [Op.iLike]: `%${params.q}%` } },
      ];

      if (matchingAuthors.length > 0) {
        searchConditions.push({
          authorId: { [Op.in]: matchingAuthors.map((author) => author.id) },
        });
      }

      where[Op.or as unknown as string] = searchConditions;
    }

    if (params.category) {
      where.categoryId = params.category;
    }

    if (params.author) {
      where.authorId = params.author;
    }

    if (params.publisher) {
      where.publisherId = params.publisher;
    }

    if (params.year) {
      where.publishedYear = params.year;
    }

    if (params.language) {
      where.language = params.language;
    }

    // A single include is used for both display and availability filtering so
    // the query never joins book_copies twice under the same alias.
    include.push({
      model: BookCopy,
      as: 'copies',
      attributes: ['id', 'barcode', 'status', 'condition'],
      ...(params.available
        ? { where: { status: BookStatus.AVAILABLE }, required: true }
        : {}),
    });

    const sortColumn = BookService.SORTABLE_COLUMNS[sortBy] ?? 'title';
    const direction = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const { rows, count } = await Book.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [[sortColumn, direction]],
      distinct: true,
    });

    return calculatePagination(rows, count, { page, limit });
  }

  async getCategories(): Promise<Category[]> {
    return Category.findAll({ order: [['name', 'ASC']] });
  }

  async findById(id: string): Promise<Book> {
    const book = await Book.findByPk(id, {
      include: [
        { model: Author, as: 'author' },
        { model: Category, as: 'category' },
        { model: Publisher, as: 'publisher' },
        {
          model: BookCopy,
          as: 'copies',
          attributes: ['id', 'barcode', 'status', 'condition', 'location'],
        },
        {
          model: Review,
          as: 'reviews',
          limit: 10,
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!book) {
      throw new NotFoundError('Book');
    }

    return book;
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    return Book.findOne({
      where: { isbn },
      include: [
        { model: Author, as: 'author' },
        { model: Category, as: 'category' },
      ],
    });
  }

  async create(data: CreateBookData): Promise<Book> {
    return sequelize.transaction(async (t: Transaction) => {
      const existing = await Book.findOne({ where: { isbn: data.isbn }, transaction: t });
      if (existing) {
        throw new ConflictError('Book with this ISBN already exists');
      }

      let authorId: string | undefined = data.authorId;
      if (!authorId && data.authorName) {
        const [author] = await Author.findOrCreate({
          where: { name: data.authorName },
          defaults: { name: data.authorName },
          transaction: t,
        });
        authorId = author.id;
      }

      let publisherId: string | undefined = data.publisherId;
      if (!publisherId && data.publisherName) {
        const [publisher] = await Publisher.findOrCreate({
          where: { name: data.publisherName },
          defaults: { name: data.publisherName },
          transaction: t,
        });
        publisherId = publisher.id;
      }

      let categoryId: string | undefined = data.categoryId;
      if (!categoryId && data.categories && data.categories.length > 0) {
        const categoryName = data.categories[0] as string;
        const [category] = await Category.findOrCreate({
          where: { name: categoryName },
          defaults: { name: categoryName },
          transaction: t,
        });
        categoryId = category.id;
      }

      const bookData: {
        isbn: string;
        title: string;
        subtitle?: string;
        description?: string;
        publishedYear?: number;
        edition?: string;
        language: string;
        pageCount?: number;
        coverImage?: string;
        authorId?: string;
        publisherId?: string;
        categoryId?: string;
        averageRating?: number;
        totalRatings?: number;
      } = {
        isbn: data.isbn,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        publishedYear: data.publishedYear,
        edition: data.edition,
        language: data.language || 'en',
        pageCount: data.pageCount,
        coverImage: data.coverImage,
        averageRating: data.averageRating || 0,
        totalRatings: data.totalRatings || 0,
      };

      if (authorId) bookData.authorId = authorId;
      if (publisherId) bookData.publisherId = publisherId;
      if (categoryId) bookData.categoryId = categoryId;

      const book = await Book.create(bookData, { transaction: t });

      const numberOfCopies = Math.min(data.numberOfCopies ?? 1, MAX_COPIES_PER_REQUEST);
      if (numberOfCopies > 0) {
        const copies = [];
        for (let i = 0; i < numberOfCopies; i++) {
          copies.push({
            bookId: book.id,
            barcode: `${data.isbn}-${String(i + 1).padStart(3, '0')}`,
            status: BookStatus.AVAILABLE,
            condition: 'good' as const,
          });
        }
        await BookCopy.bulkCreate(copies, { transaction: t });
      }

      logger.info({ action: 'book_created', bookId: book.id, isbn: book.isbn, copies: numberOfCopies });
      return book;
    });
  }

  async update(id: string, data: Partial<CreateBookData> & { numberOfCopies?: number }): Promise<Book> {
    return sequelize.transaction(async (t: Transaction) => {
      const book = await Book.findByPk(id, {
        include: [{ model: BookCopy, as: 'copies' }],
        transaction: t,
      });
      if (!book) {
        throw new NotFoundError('Book');
      }

      if (data.isbn && data.isbn !== book.isbn) {
        const existing = await Book.findOne({ where: { isbn: data.isbn }, transaction: t });
        if (existing) {
          throw new ConflictError('Book with this ISBN already exists');
        }
      }

      const updateData: Partial<CreateBookData> = { ...data };
      delete (updateData as { numberOfCopies?: number }).numberOfCopies;

      await book.update(updateData, { transaction: t });

      if (typeof data.numberOfCopies === 'number') {
        if (data.numberOfCopies > MAX_COPIES_PER_REQUEST) {
          throw new ValidationError(
            `A book cannot have more than ${MAX_COPIES_PER_REQUEST} copies`
          );
        }

        const currentCopies = (book as Book & { copies?: BookCopy[] }).copies ?? [];
        const currentCount = currentCopies.length;
        const targetCount = data.numberOfCopies;

        if (targetCount > currentCount) {
          const nextSequence = await this.nextBarcodeSequence(book.id, t);
          const newCopies = [];
          for (let i = 0; i < targetCount - currentCount; i++) {
            newCopies.push({
              bookId: book.id,
              barcode: `${book.isbn}-${String(nextSequence + i).padStart(3, '0')}`,
              status: BookStatus.AVAILABLE,
              condition: 'good' as const,
            });
          }
          await BookCopy.bulkCreate(newCopies, { transaction: t });
        } else if (targetCount < currentCount) {
          const availableCopies = currentCopies.filter(c => c.status === BookStatus.AVAILABLE);
          const copiesToRemove = availableCopies.slice(0, currentCount - targetCount);
          if (copiesToRemove.length > 0) {
            await BookCopy.destroy({
              where: { id: copiesToRemove.map(c => c.id) },
              transaction: t,
            });
          }
        }
      }

      logger.info({ action: 'book_updated', bookId: book.id });
      return book;
    });
  }

  async delete(id: string): Promise<void> {
    const book = await Book.findByPk(id, {
      include: [{ model: BookCopy, as: 'copies' }],
    });

    if (!book) {
      throw new NotFoundError('Book');
    }

    const copies = (book as Book & { copies?: BookCopy[] }).copies ?? [];
    const hasActiveLoans = copies.some(
      (copy) => copy.status === BookStatus.BORROWED
    );

    if (hasActiveLoans) {
      throw new ConflictError('Cannot delete book with active loans');
    }

    await book.destroy();
    logger.info({ action: 'book_deleted', bookId: id });
  }

  async getPopular(limit: number = 10): Promise<Book[]> {
    return Book.findAll({
      order: [['totalRatings', 'DESC'], ['averageRating', 'DESC']],
      limit,
      include: [
        { model: Author, as: 'author', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });
  }

  async getRecentlyAdded(limit: number = 10): Promise<Book[]> {
    return Book.findAll({
      order: [['createdAt', 'DESC']],
      limit,
      include: [
        { model: Author, as: 'author', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });
  }

  async updateRating(bookId: string): Promise<void> {
    const reviews = await Review.findAll({
      where: { bookId, isApproved: true },
      attributes: ['rating'],
    });

    if (reviews.length === 0) {
      await Book.update({ averageRating: 0, totalRatings: 0 }, { where: { id: bookId } });
      return;
    }

    const totalRatings = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    await Book.update(
      { averageRating: parseFloat(averageRating.toFixed(2)), totalRatings },
      { where: { id: bookId } }
    );
  }

  /** Continues the ISBN-based copy sequence instead of random suffixes. */
  private async nextBarcodeSequence(bookId: string, t: Transaction): Promise<number> {
    const copies = await BookCopy.findAll({
      where: { bookId },
      attributes: ['barcode'],
      transaction: t,
    });

    let highest = 0;
    for (const copy of copies) {
      const standard = /-(\d{3})$/.exec(copy.barcode);
      const legacy = /-(\d{3})-[0-9a-f]{4}$/i.exec(copy.barcode);
      const value = standard?.[1] ?? legacy?.[1];
      if (value) {
        highest = Math.max(highest, parseInt(value, 10));
      }
    }

    return highest + 1;
  }
}

export const bookService = new BookService();
