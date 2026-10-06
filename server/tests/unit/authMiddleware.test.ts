import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  authenticate,
  authorize,
  requireRefreshToken,
  optionalRefreshToken,
} from '../../src/middleware/auth';
import { signAccessToken } from '../../src/utils/jwt';
import { UserRole } from '../../src/types';
import User from '../../src/models/User';
import { UnauthorizedError, ForbiddenError } from '../../src/utils/errors';

vi.mock('../../src/models/User', () => ({
  default: { findByPk: vi.fn() },
}));

const mockedFindByPk = User.findByPk as unknown as ReturnType<typeof vi.fn>;

function makeReq(overrides: Record<string, unknown> = {}): Request {
  return { headers: {}, body: {}, ...overrides } as unknown as Request;
}

const asRes = (): Response => ({}) as unknown as Response;

const subject = {
  id: 'user-1',
  email: 'member@example.com',
  role: UserRole.MEMBER,
  tokenVersion: 3,
};

function dbUser(overrides: Record<string, unknown> = {}): User {
  return {
    id: 'user-1',
    email: 'member@example.com',
    role: UserRole.MEMBER,
    isActive: true,
    tokenVersion: 3,
    ...overrides,
  } as unknown as User;
}

describe('authenticate', () => {
  beforeEach(() => {
    mockedFindByPk.mockReset();
  });

  it('rejects requests without a bearer token', async () => {
    await expect(authenticate(makeReq(), asRes(), vi.fn())).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it('rejects malformed tokens', async () => {
    const req = makeReq({ headers: { authorization: 'Bearer not-a-jwt' } });
    await expect(authenticate(req, asRes(), vi.fn())).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it('attaches the user when the token and account are valid', async () => {
    mockedFindByPk.mockResolvedValue(dbUser());
    const next = vi.fn();
    const token = signAccessToken(subject);
    const req = makeReq({ headers: { authorization: `Bearer ${token}` } });

    await authenticate(req, asRes(), next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({
      id: 'user-1',
      email: 'member@example.com',
      role: UserRole.MEMBER,
    });
  });

  it('rejects deactivated accounts', async () => {
    mockedFindByPk.mockResolvedValue(dbUser({ isActive: false }));
    const token = signAccessToken(subject);
    const req = makeReq({ headers: { authorization: `Bearer ${token}` } });

    await expect(authenticate(req, asRes(), vi.fn())).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it('rejects tokens invalidated by a tokenVersion bump', async () => {
    mockedFindByPk.mockResolvedValue(dbUser({ tokenVersion: 4 }));
    const token = signAccessToken(subject);
    const req = makeReq({ headers: { authorization: `Bearer ${token}` } });

    await expect(authenticate(req, asRes(), vi.fn())).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });
});

describe('authorize', () => {
  it('allows a permitted role', () => {
    const next = vi.fn();
    const req = makeReq({
      user: { id: '1', email: 'admin@example.com', role: UserRole.ADMIN },
    });

    authorize(UserRole.ADMIN)(req, asRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects an unauthenticated request', () => {
    expect(() => authorize(UserRole.ADMIN)(makeReq(), asRes(), vi.fn())).toThrow(
      UnauthorizedError
    );
  });

  it('rejects a role that is not permitted', () => {
    const req = makeReq({
      user: { id: '1', email: 'member@example.com', role: UserRole.MEMBER },
    });

    expect(() => authorize(UserRole.ADMIN)(req, asRes(), vi.fn())).toThrow(ForbiddenError);
  });
});

describe('refresh token extraction', () => {
  it('reads the token from the body', () => {
    const req = makeReq({ body: { refreshToken: 'body-token' } });
    const next = vi.fn();

    requireRefreshToken(req, asRes(), next);

    expect(req.refreshTokenRaw).toBe('body-token');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('falls back to the refresh cookie', () => {
    const req = makeReq({ cookies: { refreshToken: 'cookie-token' } });
    const next = vi.fn();

    requireRefreshToken(req, asRes(), next);

    expect(req.refreshTokenRaw).toBe('cookie-token');
  });

  it('throws when no refresh token is present', () => {
    expect(() => requireRefreshToken(makeReq(), asRes(), vi.fn())).toThrow(
      UnauthorizedError
    );
  });

  it('does not throw for optional extraction', () => {
    const req = makeReq();
    const next = vi.fn();

    optionalRefreshToken(req, asRes(), next);

    expect(req.refreshTokenRaw).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
