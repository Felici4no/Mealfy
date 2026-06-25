import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors/AppError';
import {
  importGiftCardsSchema,
  listGiftCardsQuerySchema,
  invalidateGiftCardSchema,
} from './giftCards.validator';
import * as giftCardsService from './giftCards.service';
import { toAdminGiftCard } from './giftCards.dto';

function adminId(req: Request): string {
  if (!req.auth) throw new AppError('Não autenticado', 401, 'unauthenticated');
  return req.auth.userId;
}

export async function importGiftCards(req: Request, res: Response): Promise<Response> {
  const data = importGiftCardsSchema.parse(req.body);
  const summary = await giftCardsService.importGiftCards(adminId(req), data);
  return res.status(201).json(summary);
}

export async function getStock(_req: Request, res: Response): Promise<Response> {
  return res.json({ stock: await giftCardsService.getStock() });
}

export async function listGiftCards(req: Request, res: Response): Promise<Response> {
  const filters = listGiftCardsQuerySchema.parse(req.query);
  const { items, total, page, limit } = await giftCardsService.listGiftCards(filters);
  return res.json({ items: items.map(toAdminGiftCard), total, page, limit });
}

export async function listBatches(_req: Request, res: Response): Promise<Response> {
  return res.json({ batches: await giftCardsService.listBatches() });
}

export async function invalidateGiftCard(req: Request, res: Response): Promise<Response> {
  const { reason } = invalidateGiftCardSchema.parse(req.body ?? {});
  const gc = await giftCardsService.invalidateGiftCard(adminId(req), req.params.id, reason);
  return res.json({ giftCard: toAdminGiftCard(gc) });
}
