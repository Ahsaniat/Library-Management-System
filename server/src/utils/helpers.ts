import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { PaginationParams, PaginatedResponse } from '../types';

export function generateRequestId(): string {
  return uuidv4();
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function calculatePagination<T>(
  data: T[],
  totalItems: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalItems / params.limit);
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      totalItems,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function generateBarcode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `LIB-${timestamp}-${random}`.toUpperCase();
}

export function calculateDueDate(loanDays: number = 14): Date {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + loanDays);
  return dueDate;
}

export function calculateFine(dueDate: Date, finePerDay: number = 0.5): number {
  const now = new Date();
  if (now <= dueDate) return 0;
  const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  return parseFloat((daysOverdue * finePerDay).toFixed(2));
}

export function isValidISBN(isbn: string): boolean {
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  if (cleanISBN.length === 10) {
    return isValidISBN10(cleanISBN);
  }
  if (cleanISBN.length === 13) {
    return isValidISBN13(cleanISBN);
  }
  return false;
}

function isValidISBN10(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(isbn[i] ?? '0', 10);
    if (isNaN(digit)) return false;
    sum += digit * (10 - i);
  }
  const lastChar = isbn[9]?.toUpperCase() ?? '0';
  sum += lastChar === 'X' ? 10 : parseInt(lastChar, 10);
  return sum % 11 === 0;
}

function isValidISBN13(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(isbn[i] ?? '0', 10);
    if (isNaN(digit)) return false;
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  return sum % 10 === 0;
}
