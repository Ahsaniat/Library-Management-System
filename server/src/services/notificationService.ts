import { Op, Transaction } from 'sequelize';
import { Notification, User } from '../models';
import sequelize from '../config/database';
import { NotificationType } from '../types';
import { emailService } from './emailService';
import logger from '../utils/logger';

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: object;
  sendEmail?: boolean;
}

interface NotificationWithEmail extends CreateNotificationData {
  email: string;
  firstName: string;
}

export class NotificationService {
  async create(data: CreateNotificationData): Promise<Notification> {
    const notification = await Notification.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
    });

    logger.info({
      action: 'notification_created',
      notificationId: notification.id,
      userId: data.userId,
      type: data.type,
    });

    return notification;
  }

  async createAndSend(data: NotificationWithEmail): Promise<Notification> {
    const notification = await this.create(data);

    if (data.sendEmail !== false) {
      let emailSent = false;

      switch (data.type) {
        case NotificationType.DUE_REMINDER:
          emailSent = await emailService.sendDueReminderEmail(
            data.email,
            data.firstName,
            (data.data as { bookTitle: string })?.bookTitle ?? 'Unknown',
            new Date((data.data as { dueDate: string })?.dueDate ?? Date.now())
          );
          break;
        case NotificationType.OVERDUE_NOTICE:
          emailSent = await emailService.sendOverdueNoticeEmail(
            data.email,
            data.firstName,
            (data.data as { bookTitle: string })?.bookTitle ?? 'Unknown',
            (data.data as { daysOverdue: number })?.daysOverdue ?? 0,
            (data.data as { fine: number })?.fine ?? 0
          );
          break;
        case NotificationType.RESERVATION_READY:
          emailSent = await emailService.sendReservationReadyEmail(
            data.email,
            data.firstName,
            (data.data as { bookTitle: string })?.bookTitle ?? 'Unknown',
            new Date((data.data as { expiresAt: string })?.expiresAt ?? Date.now())
          );
          break;
        case NotificationType.FINE_NOTICE:
          emailSent = await emailService.sendFineNoticeEmail(
            data.email,
            data.firstName,
            (data.data as { amount: number })?.amount ?? 0,
            (data.data as { reason: string })?.reason ?? 'Library fine'
          );
          break;
        default:
          logger.info('No email template for notification type:', data.type);
      }

      if (emailSent) {
        await notification.update({ isSent: true, sentAt: new Date() });
      }
    }

    return notification;
  }

  async getUserNotifications(
    userId: string,
    options: { unreadOnly?: boolean; limit?: number; offset?: number } = {}
  ): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const where: { userId: string; isRead?: boolean } = { userId };
    if (options.unreadOnly) {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: options.limit ?? 20,
        offset: options.offset ?? 0,
      }),
      Notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, unreadCount };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { id: notificationId, userId } }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId, isRead: false } }
    );
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    await Notification.destroy({ where: { id: notificationId, userId } });
  }

  async sendDueReminders(): Promise<number> {
    const { Loan, BookCopy, Book } = await import('../models');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const loansWithinRange = await Loan.findAll({
      where: {
        status: 'active',
        dueDate: { [Op.gte]: tomorrow, [Op.lt]: dayAfter },
      },
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'borrower' },
      ],
    });

    let sentCount = 0;
    for (const loan of loansWithinRange) {
      const borrower = loan.get('borrower') as User;
      const bookCopy = loan.get('bookCopy') as { book?: { title: string } };
      const bookTitle = bookCopy?.book?.title ?? 'Unknown';

      await this.createAndSend({
        userId: borrower.id,
        type: NotificationType.DUE_REMINDER,
        title: 'Book Due Tomorrow',
        message: `"${bookTitle}" is due tomorrow. Please return or renew.`,
        email: borrower.email,
        firstName: borrower.firstName,
        data: { bookTitle, dueDate: loan.dueDate.toISOString(), loanId: loan.id },
      });
      sentCount++;
    }

    logger.info({ action: 'due_reminders_sent', count: sentCount });
    return sentCount;
  }

  async sendOverdueNotices(): Promise<number> {
    const { Loan, BookCopy, Book, Fine } = await import('../models');
    
    const now = new Date();

    const overdueLoans = await Loan.findAll({
      where: {
        status: 'active',
        dueDate: { [Op.lt]: now },
      },
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'borrower' },
      ],
    });

    let sentCount = 0;
    for (const loan of overdueLoans) {
      const borrower = loan.get('borrower') as User;
      const bookCopy = loan.get('bookCopy') as { book?: { title: string } };
      const bookTitle = bookCopy?.book?.title ?? 'Unknown';
      const daysOverdue = Math.ceil((now.getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const fine = daysOverdue * 0.5;

      await this.createAndSend({
        userId: borrower.id,
        type: NotificationType.OVERDUE_NOTICE,
        title: 'Overdue Book Notice',
        message: `"${bookTitle}" is ${daysOverdue} days overdue. Current fine: $${fine.toFixed(2)}`,
        email: borrower.email,
        firstName: borrower.firstName,
        data: { bookTitle, daysOverdue, fine, loanId: loan.id },
      });
      sentCount++;
    }

    logger.info({ action: 'overdue_notices_sent', count: sentCount });
    return sentCount;
  }
}

export const notificationService = new NotificationService();
