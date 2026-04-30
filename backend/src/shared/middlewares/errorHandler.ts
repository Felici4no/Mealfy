import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  request: Request,
  response: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    console.error('[ZodError]', JSON.stringify(err.issues, null, 2));
    return response.status(400).json({
      status: 'error',
      message: 'Validation error',
      issues: err.issues,
    });
  }

  console.error(err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
