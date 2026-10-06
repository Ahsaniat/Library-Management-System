import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config';
import { UserRole } from '../types';

export const JWT_ISSUER = 'library-management-system';
export const JWT_AUDIENCE = 'library-api';
export const JWT_ALGORITHM = 'HS256';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  tokenVersion: number;
  iat: number;
  exp: number;
}

interface TokenSubject {
  id: string;
  email: string;
  role: UserRole;
  tokenVersion: number;
}

function signingOptions(expiresIn: string): SignOptions {
  return {
    algorithm: JWT_ALGORITHM,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };
}

function claimPayload(subject: TokenSubject): Omit<TokenPayload, 'iat' | 'exp'> {
  return {
    id: subject.id,
    email: subject.email,
    role: subject.role,
    tokenVersion: subject.tokenVersion,
  };
}

export function signAccessToken(subject: TokenSubject): string {
  return jwt.sign(claimPayload(subject), config.jwt.secret, signingOptions(config.jwt.expiresIn));
}

export function signRefreshToken(subject: TokenSubject): string {
  return jwt.sign(
    claimPayload(subject),
    config.jwt.refreshSecret,
    signingOptions(config.jwt.refreshExpiresIn)
  );
}

function verify(token: string, secret: string): TokenPayload {
  return jwt.verify(token, secret, {
    algorithms: [JWT_ALGORITHM],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  }) as TokenPayload;
}

export function verifyAccessToken(token: string): TokenPayload {
  return verify(token, config.jwt.secret);
}

export function verifyRefreshToken(token: string): TokenPayload {
  return verify(token, config.jwt.refreshSecret);
}

/** Converts JWT duration strings such as `15m`, `7d` or `30s` to milliseconds. */
export function durationToMs(value: string, fallbackMs: number): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return fallbackMs;

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * (multipliers[unit as string] ?? 1);
}
