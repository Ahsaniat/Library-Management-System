import { describe, it, expect } from 'vitest';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  durationToMs,
} from '../../src/utils/jwt';
import { UserRole } from '../../src/types';

const subject = {
  id: 'user-1',
  email: 'member@example.com',
  role: UserRole.MEMBER,
  tokenVersion: 1,
};

describe('jwt utils', () => {
  it('signs and verifies an access token with its claims', () => {
    const token = signAccessToken(subject);
    const payload = verifyAccessToken(token);

    expect(payload.id).toBe('user-1');
    expect(payload.role).toBe(UserRole.MEMBER);
    expect(payload.tokenVersion).toBe(1);
  });

  it('signs and verifies a refresh token', () => {
    const token = signRefreshToken(subject);
    const payload = verifyRefreshToken(token);

    expect(payload.id).toBe('user-1');
    expect(payload.tokenVersion).toBe(1);
  });

  it('issues unique refresh tokens even within the same second', () => {
    const first = signRefreshToken(subject);
    const second = signRefreshToken(subject);
    expect(first).not.toBe(second);
  });

  it('does not accept an access token as a refresh token', () => {
    const accessToken = signAccessToken(subject);
    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });

  it('rejects tampered tokens', () => {
    const token = signAccessToken(subject);
    expect(() => verifyAccessToken(`${token}tampered`)).toThrow();
  });

  it('converts duration strings to milliseconds', () => {
    expect(durationToMs('15m', 0)).toBe(15 * 60 * 1000);
    expect(durationToMs('7d', 0)).toBe(7 * 24 * 60 * 60 * 1000);
    expect(durationToMs('30s', 0)).toBe(30 * 1000);
    expect(durationToMs('garbage', 42)).toBe(42);
  });
});
