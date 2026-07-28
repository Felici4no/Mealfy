import type { Request, Response } from 'express';
import type { GiftCard } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import * as beneficiaryService from './beneficiary.service';
import { toBeneficiaryGiftCard } from '../giftCards/giftCards.dto';
import { toDonorFamily, type FamilyWithDependents } from '../families/families.dto';

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

/**
 * GET /beneficiary/family — família do beneficiário logado.
 *
 * O app dependia de `user.beneficiaryId`, que só existia no cache local vindo
 * do mock: um beneficiário real logava e via a tela vazia. O vínculo verdadeiro
 * é `families.beneficiaryUserId`, e é ele que esta rota resolve.
 *
 * Sobre o DTO: reusa a visão do doador (sem CPF/NIS nem endereço completo) e
 * acrescenta os status de aprovação/verificação, que o próprio titular precisa
 * ver para saber se o cadastro ainda está em análise.
 */
export async function getMyFamily(req: Request, res: Response): Promise<Response> {
  const family = await beneficiaryService.getMyFamily(userId(req));
  return res.json({
    family: {
      ...toDonorFamily(family as FamilyWithDependents),
      approvalStatus: family.approvalStatus,
      verificationStatus: family.verificationStatus,
    },
  });
}

export async function listMyGiftCards(req: Request, res: Response): Promise<Response> {
  const cards = await beneficiaryService.listMyGiftCards(userId(req));
  return res.json({ giftCards: cards.map(present) });
}

export async function getMyGiftCard(req: Request, res: Response): Promise<Response> {
  const gc = await beneficiaryService.getMyGiftCard(userId(req), req.params.id);
  return res.json({ giftCard: present(gc) });
}
