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
  createdAt: string;
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
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
  refreshToken: string;
}
