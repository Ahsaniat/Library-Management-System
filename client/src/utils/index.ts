import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  ja: 'Japanese',
};

export function formatLanguage(code?: string): string {
  if (!code) return 'Unknown';
  return LANGUAGE_LABELS[code.toLowerCase()] ?? code;
}

interface ApiErrorShape {
  response?: { data?: { error?: string; message?: string } };
  message?: string;
}

/** Extracts the API error envelope instead of axios' generic status message. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiErrorShape;
  return (
    apiError?.response?.data?.error ??
    apiError?.response?.data?.message ??
    apiError?.message ??
    fallback
  );
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  BDT: '৳',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

/** Formats a monetary value in the configured currency (dollar and taka supported). */
export function formatCurrency(amount: number | string | undefined, currency = 'USD'): string {
  const value = Number(amount ?? 0);
  const code = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code];
  const formatted = value.toFixed(2);
  return symbol ? `${symbol}${formatted}` : `${code} ${formatted}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
