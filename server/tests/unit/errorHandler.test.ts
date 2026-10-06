import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { errorHandler, notFoundHandler } from '../../src/middleware/errorHandler';
import { NotFoundError } from '../../src/utils/errors';

function makeRes(): Response {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as Response;
}

function makeReq(): Request {
  return { requestId: 'req-1', path: '/books/1', method: 'GET' } as unknown as Request;
}

describe('errorHandler', () => {
  it('serializes operational AppErrors with their status code', () => {
    const res = makeRes();

    errorHandler(new NotFoundError('Book'), makeReq(), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: 'Book not found', code: 'NOT_FOUND' })
    );
  });

  it('hides unknown errors behind a 500 response', () => {
    const res = makeRes();

    errorHandler(new Error('database exploded'), makeReq(), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, requestId: 'req-1' })
    );
  });
});

describe('notFoundHandler', () => {
  it('returns a 404 payload', () => {
    const res = makeRes();

    notFoundHandler(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: 'Not Found' })
    );
  });
});
