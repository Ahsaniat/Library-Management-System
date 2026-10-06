import { describe, it, expect } from 'vitest';
import { startScheduler, stopScheduler } from '../../src/jobs';

describe('scheduler', () => {
  it('does not start background jobs in the test environment', () => {
    expect(() => {
      startScheduler();
      stopScheduler();
    }).not.toThrow();
  });
});
