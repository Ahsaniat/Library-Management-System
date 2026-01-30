import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, isValidISBN, calculateFine, calculateDueDate, generateBarcode } from '../../src/utils/helpers';

describe('Helpers', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);
      
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const result = await comparePassword('wrongPassword', hash);
      
      expect(result).toBe(false);
    });
  });

  describe('isValidISBN', () => {
    it('should validate correct ISBN-10', () => {
      expect(isValidISBN('0-306-40615-2')).toBe(true);
      expect(isValidISBN('0306406152')).toBe(true);
    });

    it('should validate correct ISBN-13', () => {
      expect(isValidISBN('978-0-306-40615-7')).toBe(true);
      expect(isValidISBN('9780306406157')).toBe(true);
    });

    it('should reject invalid ISBN', () => {
      expect(isValidISBN('1234567890')).toBe(false);
      expect(isValidISBN('invalid')).toBe(false);
      expect(isValidISBN('')).toBe(false);
    });
  });

  describe('calculateFine', () => {
    it('should return 0 for future due date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      expect(calculateFine(futureDate)).toBe(0);
    });

    it('should calculate fine for overdue books', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      
      const fine = calculateFine(pastDate, 0.5);
      expect(fine).toBeGreaterThan(0);
      expect(fine).toBe(1.5);
    });
  });

  describe('calculateDueDate', () => {
    it('should return date 14 days in future by default', () => {
      const dueDate = calculateDueDate();
      const now = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(14);
    });

    it('should return date with custom days', () => {
      const dueDate = calculateDueDate(7);
      const now = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(7);
    });
  });

  describe('generateBarcode', () => {
    it('should generate unique barcodes', () => {
      const barcode1 = generateBarcode();
      const barcode2 = generateBarcode();
      
      expect(barcode1).not.toBe(barcode2);
    });

    it('should have correct prefix', () => {
      const barcode = generateBarcode();
      
      expect(barcode.startsWith('LIB-')).toBe(true);
    });
  });
});
