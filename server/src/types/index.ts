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

export enum FineStatus {
  PENDING = 'pending',
  PAID = 'paid',
  WAIVED = 'waived',
  PARTIAL = 'partial',
}

export enum NotificationType {
  DUE_REMINDER = 'due_reminder',
  OVERDUE_NOTICE = 'overdue_notice',
  RESERVATION_READY = 'reservation_ready',
  FINE_NOTICE = 'fine_notice',
  GENERAL = 'general',
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  requestId?: string;
}
