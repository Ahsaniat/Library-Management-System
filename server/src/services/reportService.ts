import { Op, fn, col, literal } from 'sequelize';
import { User, Book, BookCopy, Loan, Fine, Payment, Category, Author, Library } from '../models';
import { LoanStatus, BookStatus, FineStatus } from '../types';
import logger from '../utils/logger';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface CirculationStats {
  totalCheckouts: number;
  totalReturns: number;
  activeLoans: number;
  overdueLoans: number;
  renewals: number;
}

interface BookStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  popularBooks: Array<{ bookId: string; title: string; borrowCount: number }>;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  usersByRole: Array<{ role: string; count: number }>;
}

interface FinancialStats {
  totalFinesGenerated: number;
  totalFinesCollected: number;
  totalFinesPending: number;
  totalFinesWaived: number;
}

interface OverdueReport {
  loans: Array<{
    loanId: string;
    userId: string;
    userName: string;
    userEmail: string;
    bookTitle: string;
    barcode: string;
    dueDate: Date;
    daysOverdue: number;
    estimatedFine: number;
  }>;
  totalOverdue: number;
  totalEstimatedFines: number;
}

interface InventoryReport {
  totalBooks: number;
  totalCopies: number;
  byStatus: Array<{ status: string; count: number }>;
  byCondition: Array<{ condition: string; count: number }>;
  byCategory: Array<{ category: string; count: number }>;
  byLibrary: Array<{ library: string; count: number }>;
}

export class ReportService {
  async getCirculationStats(range?: DateRange): Promise<CirculationStats> {
    const dateFilter = range ? {
      borrowedAt: { [Op.between]: [range.startDate, range.endDate] },
    } : {};

    const returnDateFilter = range ? {
      returnedAt: { [Op.between]: [range.startDate, range.endDate] },
    } : { returnedAt: { [Op.ne]: null } };

    const [totalCheckouts, totalReturns, activeLoans, overdueLoans, loansWithRenewals] = await Promise.all([
      Loan.count({ where: dateFilter }),
      Loan.count({ where: { ...returnDateFilter, status: LoanStatus.RETURNED } }),
      Loan.count({ where: { status: LoanStatus.ACTIVE } }),
      Loan.count({
        where: {
          status: LoanStatus.ACTIVE,
          dueDate: { [Op.lt]: new Date() },
        },
      }),
      Loan.sum('renewalCount', { where: dateFilter }) ?? 0,
    ]);

    return {
      totalCheckouts,
      totalReturns,
      activeLoans,
      overdueLoans,
      renewals: loansWithRenewals as number,
    };
  }

  async getBookStats(): Promise<BookStats> {
    const [totalBooks, totalCopies, availableCopies, borrowedCopies] = await Promise.all([
      Book.count(),
      BookCopy.count(),
      BookCopy.count({ where: { status: BookStatus.AVAILABLE } }),
      BookCopy.count({ where: { status: BookStatus.BORROWED } }),
    ]);

    const popularBooks = await Loan.findAll({
      attributes: [
        [col('bookCopy.book_id'), 'bookId'],
        [fn('COUNT', col('Loan.id')), 'borrowCount'],
      ],
      include: [{
        model: BookCopy,
        as: 'bookCopy',
        attributes: [],
        include: [{
          model: Book,
          as: 'book',
          attributes: ['title'],
        }],
      }],
      group: ['bookCopy.book_id', 'bookCopy->book.id'],
      order: [[fn('COUNT', col('Loan.id')), 'DESC']],
      limit: 10,
      raw: true,
      nest: true,
    }) as unknown as Array<{ bookId: string; borrowCount: number; bookCopy: { book: { title: string } } }>;

    return {
      totalBooks,
      totalCopies,
      availableCopies,
      borrowedCopies,
      popularBooks: popularBooks.map((p) => ({
        bookId: p.bookId,
        title: p.bookCopy?.book?.title ?? 'Unknown',
        borrowCount: Number(p.borrowCount),
      })),
    };
  }

  async getUserStats(range?: DateRange): Promise<UserStats> {
    const dateFilter = range ? {
      createdAt: { [Op.between]: [range.startDate, range.endDate] },
    } : {};

    const [totalUsers, activeUsers, newRegistrations, usersByRole] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      User.count({ where: dateFilter }),
      User.findAll({
        attributes: ['role', [fn('COUNT', col('id')), 'count']],
        group: ['role'],
        raw: true,
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      newRegistrations: range ? newRegistrations : totalUsers,
      usersByRole: (usersByRole as unknown as Array<{ role: string; count: string }>).map((r) => ({
        role: r.role,
        count: Number(r.count),
      })),
    };
  }

  async getFinancialStats(range?: DateRange): Promise<FinancialStats> {
    const dateFilter = range ? {
      createdAt: { [Op.between]: [range.startDate, range.endDate] },
    } : {};

    const [totalGenerated, totalCollected, totalPending, totalWaived] = await Promise.all([
      Fine.sum('amount', { where: dateFilter }) ?? 0,
      Payment.sum('amount', { where: dateFilter }) ?? 0,
      Fine.sum('amount', { where: { ...dateFilter, status: FineStatus.PENDING } }) ?? 0,
      Fine.sum('amount', { where: { ...dateFilter, status: FineStatus.WAIVED } }) ?? 0,
    ]);

    return {
      totalFinesGenerated: Number(totalGenerated),
      totalFinesCollected: Number(totalCollected),
      totalFinesPending: Number(totalPending),
      totalFinesWaived: Number(totalWaived),
    };
  }

  async getOverdueReport(): Promise<OverdueReport> {
    const now = new Date();

    const overdueLoans = await Loan.findAll({
      where: {
        status: LoanStatus.ACTIVE,
        dueDate: { [Op.lt]: now },
      },
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'borrower', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
      order: [['dueDate', 'ASC']],
    });

    const loans = overdueLoans.map((loan) => {
      const borrower = loan.get('borrower') as User;
      const bookCopy = loan.get('bookCopy') as BookCopy & { book?: Book };
      const daysOverdue = Math.ceil((now.getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const estimatedFine = daysOverdue * 0.5;

      return {
        loanId: loan.id,
        userId: borrower.id,
        userName: `${borrower.firstName} ${borrower.lastName}`,
        userEmail: borrower.email,
        bookTitle: bookCopy?.book?.title ?? 'Unknown',
        barcode: bookCopy?.barcode ?? '',
        dueDate: loan.dueDate,
        daysOverdue,
        estimatedFine,
      };
    });

    return {
      loans,
      totalOverdue: loans.length,
      totalEstimatedFines: loans.reduce((sum, l) => sum + l.estimatedFine, 0),
    };
  }

  async getInventoryReport(): Promise<InventoryReport> {
    const [totalBooks, totalCopies, byStatus, byCondition, byCategory, byLibrary] = await Promise.all([
      Book.count(),
      BookCopy.count(),
      BookCopy.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
      BookCopy.findAll({
        attributes: ['condition', [fn('COUNT', col('id')), 'count']],
        group: ['condition'],
        raw: true,
      }),
      Book.findAll({
        attributes: [[col('category.name'), 'category'], [fn('COUNT', col('Book.id')), 'count']],
        include: [{ model: Category, as: 'category', attributes: [] }],
        group: ['category.id'],
        raw: true,
      }),
      BookCopy.findAll({
        attributes: [[col('library.name'), 'library'], [fn('COUNT', col('BookCopy.id')), 'count']],
        include: [{ model: Library, as: 'library', attributes: [] }],
        group: ['library.id'],
        raw: true,
      }),
    ]);

    return {
      totalBooks,
      totalCopies,
      byStatus: (byStatus as unknown as Array<{ status: string; count: string }>).map((s) => ({
        status: s.status,
        count: Number(s.count),
      })),
      byCondition: (byCondition as unknown as Array<{ condition: string; count: string }>).map((c) => ({
        condition: c.condition,
        count: Number(c.count),
      })),
      byCategory: (byCategory as unknown as Array<{ category: string; count: string }>).map((c) => ({
        category: c.category ?? 'Uncategorized',
        count: Number(c.count),
      })),
      byLibrary: (byLibrary as unknown as Array<{ library: string; count: string }>).map((l) => ({
        library: l.library ?? 'Main Library',
        count: Number(l.count),
      })),
    };
  }

  async getDashboardStats(): Promise<{
    circulation: CirculationStats;
    books: BookStats;
    users: UserStats;
    financial: FinancialStats;
  }> {
    const [circulation, books, users, financial] = await Promise.all([
      this.getCirculationStats(),
      this.getBookStats(),
      this.getUserStats(),
      this.getFinancialStats(),
    ]);

    return { circulation, books, users, financial };
  }
}

export const reportService = new ReportService();
