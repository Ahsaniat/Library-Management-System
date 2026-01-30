import { Request, Response, NextFunction } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  role: 'admin' | 'librarian' | 'member' | 'guest';
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      requestId?: string;
    }
  }
}

export {};
