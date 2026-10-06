import { describe, it, expect } from 'vitest';
import { calculatePagination } from '../../src/utils/helpers';

describe('calculatePagination', () => {
  it('computes page metadata for a middle page', () => {
    const result = calculatePagination(['a', 'b'], 45, { page: 2, limit: 20 });

    expect(result.pagination).toEqual({
      page: 2,
      limit: 20,
      totalItems: 45,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    });
  });

  it('marks the first page without a previous page', () => {
    const result = calculatePagination(['a'], 5, { page: 1, limit: 10 });
    expect(result.pagination.hasPrev).toBe(false);
    expect(result.pagination.hasNext).toBe(false);
  });

  it('handles empty results', () => {
    const result = calculatePagination([], 0, { page: 1, limit: 20 });
    expect(result.pagination.totalPages).toBe(0);
    expect(result.pagination.hasNext).toBe(false);
  });
});
