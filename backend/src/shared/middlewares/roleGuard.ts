import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const roleGuard = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError('Permission denied', 403);
    }

    next();
  };
};
