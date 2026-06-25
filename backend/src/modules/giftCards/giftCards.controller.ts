import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { importGiftCardsSchema } from './giftCards.validator';
import * as giftCardsService from './giftCards.service';

function adminId(req: Request): string {
  if (!req.auth) throw new AppError('Não autenticado', 401, 'unauthenticated');
  return req.auth.userId;
}

export async function importGiftCards(req: Request, res: Response): Promise<Response> {
  const data = importGiftCardsSchema.parse(req.body);
  const summary = await giftCardsService.importGiftCards(adminId(req), data);
  return res.status(201).json(summary);
}
