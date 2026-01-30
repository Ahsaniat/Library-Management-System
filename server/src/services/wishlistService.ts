import { Op, Transaction } from 'sequelize';
import { Wishlist, Book, Author, Category } from '../models';
import sequelize from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';

interface AddToWishlistData {
  userId: string;
  bookId: string;
  notes?: string;
  priority?: number;
}

export class WishlistService {
  async add(data: AddToWishlistData): Promise<Wishlist> {
    const book = await Book.findByPk(data.bookId);
    if (!book) {
      throw new NotFoundError('Book');
    }

    const existing = await Wishlist.findOne({
      where: { userId: data.userId, bookId: data.bookId },
    });

    if (existing) {
      throw new ConflictError('Book is already in your wishlist');
    }

    const item = await Wishlist.create({
      userId: data.userId,
      bookId: data.bookId,
      notes: data.notes,
      priority: data.priority ?? 0,
    });

    logger.info({
      action: 'wishlist_item_added',
      wishlistId: item.id,
      userId: data.userId,
      bookId: data.bookId,
    });

    return item;
  }

  async remove(userId: string, bookId: string): Promise<void> {
    const item = await Wishlist.findOne({
      where: { userId, bookId },
    });

    if (!item) {
      throw new NotFoundError('Wishlist item');
    }

    await item.destroy();

    logger.info({
      action: 'wishlist_item_removed',
      userId,
      bookId,
    });
  }

  async getUserWishlist(userId: string): Promise<Wishlist[]> {
    return Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Book,
          as: 'book',
          include: [
            { model: Author, as: 'author', attributes: ['id', 'name'] },
            { model: Category, as: 'category', attributes: ['id', 'name'] },
          ],
        },
      ],
      order: [['priority', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  async isInWishlist(userId: string, bookId: string): Promise<boolean> {
    const count = await Wishlist.count({
      where: { userId, bookId },
    });
    return count > 0;
  }

  async updatePriority(userId: string, bookId: string, priority: number): Promise<Wishlist> {
    const item = await Wishlist.findOne({
      where: { userId, bookId },
    });

    if (!item) {
      throw new NotFoundError('Wishlist item');
    }

    await item.update({ priority });
    return item;
  }

  async updateNotes(userId: string, bookId: string, notes: string): Promise<Wishlist> {
    const item = await Wishlist.findOne({
      where: { userId, bookId },
    });

    if (!item) {
      throw new NotFoundError('Wishlist item');
    }

    await item.update({ notes });
    return item;
  }
}

export const wishlistService = new WishlistService();
