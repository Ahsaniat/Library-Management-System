export enum UserRole {
  ADMIN = 'admin',
  LIBRARIAN = 'librarian',
  MEMBER = 'member',
  GUEST = 'guest',
}

export enum BookStatus {
  AVAILABLE = 'available',
  BORROWED = 'borrowed',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
  LOST = 'lost',
  DAMAGED = 'damaged',
}

export enum LoanStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
}

export enum ReservationStatus {
  PENDING = 'pending',
  READY = 'ready',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  profilePhoto?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Author {
  id: string;
  name: string;
  biography?: string;
  photo?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Publisher {
  id: string;
  name: string;
  website?: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  subtitle?: string;
  description?: string;
  publishedYear?: number;
  edition?: string;
  language: string;
  pageCount?: number;
  coverImage?: string;
  averageRating: number;
  totalRatings: number;
  author?: Author;
  category?: Category;
  publisher?: Publisher;
  copies?: BookCopy[];
  reviews?: Review[];
  createdAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  title?: string;
  content?: string;
  createdAt: string;
  user?: { id: string; firstName: string; lastName: string };
}

export interface BookCopy {
  id: string;
  bookId: string;
  barcode: string;
  status: BookStatus;
  condition: 'new' | 'good' | 'fair' | 'poor';
  location?: string;
}

export interface Loan {
  id: string;
  bookCopyId: string;
  userId: string;
  status: LoanStatus;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  renewalCount: number;
  maxRenewals: number;
  bookCopy?: BookCopy & { book?: Book };
}

export interface Reservation {
  id: string;
  bookId: string;
  userId: string;
  status: ReservationStatus;
  queuePosition: number;
  reservedAt: string;
  expiresAt?: string;
  book?: Book;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  isPublic: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'online' | 'other';
  receiptNumber: string;
  paidAt: string;
}

export interface Fine {
  id: string;
  loanId: string;
  userId: string;
  amount: number;
  paidAmount: number;
  reason: string;
  status: 'pending' | 'paid' | 'waived' | 'partial';
  paidAt?: string;
  waivedAt?: string;
  waiverReason?: string;
  createdAt: string;
  payments?: Payment[];
  loan?: {
    id: string;
    dueDate: string;
    bookCopy?: { id: string; barcode: string; book?: { id: string; title: string } };
  };
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  requestId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  /** Only returned to non-browser clients that opt in via a transport header. */
  refreshToken?: string;
}
