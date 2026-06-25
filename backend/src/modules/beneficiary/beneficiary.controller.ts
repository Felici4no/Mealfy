import type { Request, Response } from 'express';
import type { GiftCard } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import * as beneficiaryService from './beneficiary.service';
import { toBeneficiaryGiftCard } from '../giftCards/giftCards.dto';

function userId(req: Request): string {
  if (!req.auth) throw new AppError('Não autenticado', 401, 'unauthenticated');
  return req.auth.userId;
}

const providerName = (p: GiftCard['provider']) =>
  p === 'ninetynine' ? '99 Mercado' : p === 'ifood' ? 'iFood' : 'Carrefour';

/** Único lugar que decifra o código (DTO do beneficiário) + instrução de uso. */
function present(gc: GiftCard) {
  return {
    ...toBeneficiaryGiftCard(gc),
    codeMasked: gc.codeMasked,
    familyId: gc.familyId,
    instructions: `Abra o app ${providerName(gc.provider)} e use o código acima para resgatar seu benefício.`,
  };
}

export async function listMyGiftCards(req: Request, res: Response): Promise<Response> {
  const cards = await beneficiaryService.listMyGiftCards(userId(req));
  return res.json({ giftCards: cards.map(present) });
}

export async function getMyGiftCard(req: Request, res: Response): Promise<Response> {
  const gc = await beneficiaryService.getMyGiftCard(userId(req), req.params.id);
  return res.json({ giftCard: present(gc) });
}
