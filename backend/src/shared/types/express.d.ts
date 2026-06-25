import type { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      /** Preenchido pelo authGuard a partir do JWT. */
      auth?: { userId: string; role: UserRole };
    }
  }
}

export {};
