import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import User from '../models/User';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

/**
 * Verifies the access token and re-checks the account against the database so
 * that deactivated users and revoked sessions (bumped tokenVersion) are
 * rejected immediately instead of waiting for the access token to expire.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);

  let decoded: TokenPayload;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }

  const user = await User.findByPk(decoded.id, {
    attributes: ['id', 'email', 'role', 'isActive', 'tokenVersion'],
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Session is no longer valid');
  }

  if (user.tokenVersion !== decoded.tokenVersion) {
    throw new UnauthorizedError('Session has been revoked');
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  next();
}

export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}

/**
 * Public-route personalization only. This remains stateless: it must not be
 * used to gate access to data (use `authenticate` for that).
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    // Ignore invalid tokens for optional auth
  }

  next();
}

function readRefreshToken(req: Request): string | undefined {
  const bodyToken = (req.body as { refreshToken?: string } | undefined)?.refreshToken;
  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies
    ?.refreshToken;
  return bodyToken || cookieToken;
}

/** Requires a refresh token and exposes it to the controller as `req.refreshTokenRaw`. */
export function requireRefreshToken(req: Request, _res: Response, next: NextFunction): void {
  const token = readRefreshToken(req);

  if (!token) {
    throw new UnauthorizedError('Refresh token required');
  }

  req.refreshTokenRaw = token;
  next();
}

/** Attaches a refresh token when present; used by the idempotent logout route. */
export function optionalRefreshToken(req: Request, _res: Response, next: NextFunction): void {
  req.refreshTokenRaw = readRefreshToken(req);
  next();
}
