import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';
import config from '../config';
import logger from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
      logger.warn('Email service not configured - SMTP credentials missing');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
      });
      this.isConfigured = true;
      logger.info('Email service initialized');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email not sent - service not configured', { to: options.to });
      return false;
    }

    try {
      const info: SentMessageInfo = await this.transporter.sendMail({
        from: config.smtp.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      logger.info({
        action: 'email_sent',
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      });
      return true;
    } catch (error) {
      logger.error('Failed to send email:', { error, to: options.to });
      return false;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string, verificationToken: string): Promise<boolean> {
    const verifyUrl = `${config.cors.origin}/verify-email/${verificationToken}`;
    const template = this.getWelcomeTemplate(firstName, verifyUrl);
    return this.sendEmail({ to: email, ...template });
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${config.cors.origin}/reset-password/${resetToken}`;
    const template = this.getPasswordResetTemplate(firstName, resetUrl);
    return this.sendEmail({ to: email, ...template });
  }

  async sendDueReminderEmail(email: string, firstName: string, bookTitle: string, dueDate: Date): Promise<boolean> {
    const template = this.getDueReminderTemplate(firstName, bookTitle, dueDate);
    return this.sendEmail({ to: email, ...template });
  }

  async sendOverdueNoticeEmail(email: string, firstName: string, bookTitle: string, daysOverdue: number, fine: number): Promise<boolean> {
    const template = this.getOverdueTemplate(firstName, bookTitle, daysOverdue, fine);
    return this.sendEmail({ to: email, ...template });
  }

  async sendReservationReadyEmail(email: string, firstName: string, bookTitle: string, expiresAt: Date): Promise<boolean> {
    const template = this.getReservationReadyTemplate(firstName, bookTitle, expiresAt);
    return this.sendEmail({ to: email, ...template });
  }

  async sendFineNoticeEmail(email: string, firstName: string, amount: number, reason: string): Promise<boolean> {
    const template = this.getFineNoticeTemplate(firstName, amount, reason);
    return this.sendEmail({ to: email, ...template });
  }

  private getWelcomeTemplate(firstName: string, verifyUrl: string): EmailTemplate {
    return {
      subject: 'Welcome to Library Management System - Verify Your Email',
      html: `
        <h1>Welcome, ${firstName}!</h1>
        <p>Thank you for registering with the Library Management System.</p>
        <p>Please verify your email by clicking the link below:</p>
        <p><a href="${verifyUrl}" style="background-color:#3b82f6;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Verify Email</a></p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${verifyUrl}</p>
        <p>This link will expire in 24 hours.</p>
      `,
      text: `Welcome, ${firstName}!\n\nThank you for registering. Please verify your email by visiting: ${verifyUrl}\n\nThis link expires in 24 hours.`,
    };
  }

  private getPasswordResetTemplate(firstName: string, resetUrl: string): EmailTemplate {
    return {
      subject: 'Password Reset Request - Library Management System',
      html: `
        <h1>Password Reset</h1>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}" style="background-color:#3b82f6;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
      text: `Hi ${firstName},\n\nWe received a password reset request. Visit: ${resetUrl}\n\nThis link expires in 1 hour.`,
    };
  }

  private getDueReminderTemplate(firstName: string, bookTitle: string, dueDate: Date): EmailTemplate {
    const formattedDate = dueDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return {
      subject: `Reminder: "${bookTitle}" is due soon`,
      html: `
        <h1>Book Due Reminder</h1>
        <p>Hi ${firstName},</p>
        <p>This is a friendly reminder that the following book is due soon:</p>
        <p><strong>${bookTitle}</strong></p>
        <p>Due Date: <strong>${formattedDate}</strong></p>
        <p>Please return or renew the book before the due date to avoid late fees.</p>
      `,
      text: `Hi ${firstName},\n\nReminder: "${bookTitle}" is due on ${formattedDate}.\n\nPlease return or renew to avoid late fees.`,
    };
  }

  private getOverdueTemplate(firstName: string, bookTitle: string, daysOverdue: number, fine: number): EmailTemplate {
    return {
      subject: `Overdue Notice: "${bookTitle}" - $${fine.toFixed(2)} fine`,
      html: `
        <h1>Overdue Book Notice</h1>
        <p>Hi ${firstName},</p>
        <p>The following book is <strong>${daysOverdue} days overdue</strong>:</p>
        <p><strong>${bookTitle}</strong></p>
        <p>Current fine: <strong style="color:red;">$${fine.toFixed(2)}</strong></p>
        <p>Please return the book as soon as possible. Fines continue to accumulate at $0.50 per day.</p>
      `,
      text: `Hi ${firstName},\n\n"${bookTitle}" is ${daysOverdue} days overdue.\nCurrent fine: $${fine.toFixed(2)}\n\nPlease return immediately.`,
    };
  }

  private getReservationReadyTemplate(firstName: string, bookTitle: string, expiresAt: Date): EmailTemplate {
    const formattedDate = expiresAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return {
      subject: `Your reservation is ready: "${bookTitle}"`,
      html: `
        <h1>Reservation Ready!</h1>
        <p>Hi ${firstName},</p>
        <p>Great news! The book you reserved is now available for pickup:</p>
        <p><strong>${bookTitle}</strong></p>
        <p>Please pick up the book by <strong>${formattedDate}</strong> or your reservation will expire.</p>
      `,
      text: `Hi ${firstName},\n\n"${bookTitle}" is ready for pickup!\n\nPick up by ${formattedDate} or your reservation expires.`,
    };
  }

  private getFineNoticeTemplate(firstName: string, amount: number, reason: string): EmailTemplate {
    return {
      subject: `Fine Notice: $${amount.toFixed(2)} - Library Management System`,
      html: `
        <h1>Fine Notice</h1>
        <p>Hi ${firstName},</p>
        <p>A fine has been added to your account:</p>
        <p>Amount: <strong style="color:red;">$${amount.toFixed(2)}</strong></p>
        <p>Reason: ${reason}</p>
        <p>Please pay this fine at your earliest convenience to avoid restrictions on borrowing.</p>
      `,
      text: `Hi ${firstName},\n\nFine added: $${amount.toFixed(2)}\nReason: ${reason}\n\nPlease pay at your earliest convenience.`,
    };
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) return false;
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
