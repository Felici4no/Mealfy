import { Request, Response, NextFunction } from 'express';
import { MockDatabase } from '../../database/mock-db';
import { AppError } from '../errors/AppError';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] || req.headers['authorization']?.toString().replace('Bearer ', '');

  if (!userId) {
    throw new AppError('Authentication required', 401);
  }

  const users = await MockDatabase.read<any>('users');
  const user = users.find((u: any) => u.id === userId);

  if (!user) {
    throw new AppError('User not found or invalid session', 401);
  }

  req.user = user;
  next();
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
