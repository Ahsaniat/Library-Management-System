import sequelize from '../config/database';
import User from './User';
import Book from './Book';
import BookCopy from './BookCopy';
import Author from './Author';
import Category from './Category';
import Publisher from './Publisher';
import Library from './Library';
import Loan from './Loan';
import Reservation from './Reservation';
import Fine from './Fine';
import Payment from './Payment';
import Review from './Review';
import Notification from './Notification';
import AuditLog from './AuditLog';
import Setting from './Setting';

Book.belongsTo(Author, { foreignKey: 'authorId', as: 'author' });
Author.hasMany(Book, { foreignKey: 'authorId', as: 'books' });

Book.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Book, { foreignKey: 'categoryId', as: 'books' });

Book.belongsTo(Publisher, { foreignKey: 'publisherId', as: 'publisher' });
Publisher.hasMany(Book, { foreignKey: 'publisherId', as: 'books' });

Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });
Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });

BookCopy.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });
Book.hasMany(BookCopy, { foreignKey: 'bookId', as: 'copies' });

BookCopy.belongsTo(Library, { foreignKey: 'libraryId', as: 'library' });
Library.hasMany(BookCopy, { foreignKey: 'libraryId', as: 'bookCopies' });

User.belongsTo(Library, { foreignKey: 'libraryId', as: 'library' });
Library.hasMany(User, { foreignKey: 'libraryId', as: 'users' });

Loan.belongsTo(BookCopy, { foreignKey: 'bookCopyId', as: 'bookCopy' });
BookCopy.hasMany(Loan, { foreignKey: 'bookCopyId', as: 'loans' });

Loan.belongsTo(User, { foreignKey: 'userId', as: 'borrower' });
User.hasMany(Loan, { foreignKey: 'userId', as: 'loans' });

Loan.belongsTo(User, { foreignKey: 'librarianId', as: 'librarian' });

Reservation.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });
Book.hasMany(Reservation, { foreignKey: 'bookId', as: 'reservations' });

Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });

Fine.belongsTo(Loan, { foreignKey: 'loanId', as: 'loan' });
Loan.hasMany(Fine, { foreignKey: 'loanId', as: 'fines' });

Fine.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Fine, { foreignKey: 'userId', as: 'fines' });

Fine.belongsTo(User, { foreignKey: 'waivedBy', as: 'waivedByUser' });

Payment.belongsTo(Fine, { foreignKey: 'fineId', as: 'fine' });
Fine.hasMany(Payment, { foreignKey: 'fineId', as: 'payments' });

Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });

Payment.belongsTo(User, { foreignKey: 'processedBy', as: 'processedByUser' });

Review.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });
Book.hasMany(Review, { foreignKey: 'bookId', as: 'reviews' });

Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });

Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  sequelize,
  User,
  Book,
  BookCopy,
  Author,
  Category,
  Publisher,
  Library,
  Loan,
  Reservation,
  Fine,
  Payment,
  Review,
  Notification,
  AuditLog,
  Setting,
};
