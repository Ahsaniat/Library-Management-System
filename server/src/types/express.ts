export interface UserPayload {
  id: string;
  email: string;
  role: 'admin' | 'librarian' | 'member' | 'guest';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserPayload;
      requestId?: string;
      refreshTokenRaw?: string;
    }
  }
}

export {};
