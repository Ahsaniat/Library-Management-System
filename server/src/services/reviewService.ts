import { Transaction } from 'sequelize';
import { Review, Book, User, Loan, BookCopy } from '../models';
import sequelize from '../config/database';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors';
import { LoanStatus } from '../types';
import logger from '../utils/logger';

interface CreateReviewData {
  bookId: string;
  userId: string;
  rating: number;
  title?: string;
  content?: string;
}

interface ListOptions {
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE_SIZE = 20;

export class ReviewService {
  async create(data: CreateReviewData): Promise<Review> {
    const book = await Book.findByPk(data.bookId);
    if (!book) {
      throw new NotFoundError('Book');
    }

    const existing = await Review.findOne({
      where: { bookId: data.bookId, userId: data.userId },
    });

    if (existing) {
      throw new ConflictError('You have already reviewed this book');
    }

    // A review is only accepted from someone who has borrowed the title.
    const hasBorrowed = await Loan.count({
      where: { userId: data.userId, status: LoanStatus.RETURNED },
      include: [{ model: BookCopy, as: 'bookCopy', where: { bookId: data.bookId } }],
    });

    if (hasBorrowed === 0) {
      throw new ForbiddenError('You can only review books you have borrowed and returned');
    }

    const review = await sequelize.transaction(async (t: Transaction) => {
      const created = await Review.create(
        {
          bookId: data.bookId,
          userId: data.userId,
          rating: data.rating,
          title: data.title,
          content: data.content,
          isApproved: true,
        },
        { transaction: t }
      );

      const aggregate = await Review.findAll({
        where: { bookId: data.bookId, isApproved: true },
        attributes: ['rating'],
        transaction: t,
      });

      const totalRatings = aggregate.length;
      const averageRating =
        aggregate.reduce((sum, item) => sum + item.rating, 0) / totalRatings;

      await Book.update(
        { averageRating: parseFloat(averageRating.toFixed(2)), totalRatings },
        { where: { id: data.bookId }, transaction: t }
      );

      return created;
    });

    logger.info({ action: 'review_created', reviewId: review.id, bookId: data.bookId });
    return review;
  }

  async listByBook(
    bookId: string,
    options: ListOptions = {}
  ): Promise<{ rows: Review[]; count: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? DEFAULT_PAGE_SIZE;

    return Review.findAndCountAll({
      where: { bookId, isApproved: true },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });
  }

  async remove(reviewId: string, userId: string, isAdmin: boolean): Promise<void> {
    return sequelize.transaction(async (t: Transaction) => {
      const review = await Review.findByPk(reviewId, { transaction: t, lock: t.LOCK.UPDATE });

      if (!review) {
        throw new NotFoundError('Review');
      }

      if (!isAdmin && review.userId !== userId) {
        throw new ForbiddenError('You can only delete your own reviews');
      }

      const bookId = review.bookId;
      await review.destroy({ transaction: t });

      const aggregate = await Review.findAll({
        where: { bookId, isApproved: true },
        attributes: ['rating'],
        transaction: t,
      });

      const totalRatings = aggregate.length;
      const averageRating =
        totalRatings === 0
          ? 0
          : aggregate.reduce((sum, item) => sum + item.rating, 0) / totalRatings;

      await Book.update(
        { averageRating: parseFloat(averageRating.toFixed(2)), totalRatings },
        { where: { id: bookId }, transaction: t }
      );

      logger.info({ action: 'review_deleted', reviewId, bookId });
    });
  }
}

export const reviewService = new ReviewService();
