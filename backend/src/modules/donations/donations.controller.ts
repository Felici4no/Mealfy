import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { env } from '../../config/env';
import { createDonationSchema } from './donations.validator';
import * as donationsService from './donations.service';
import { toDonorDonation, toAdminDonation } from './donations.dto';

function actorOf(req: Request) {
  if (!req.auth) throw new AppError('Não autenticado', 401, 'unauthenticated');
  return { userId: req.auth.userId, role: req.auth.role };
}

export async function createDonation(req: Request, res: Response): Promise<Response> {
  const actor = actorOf(req);
  const data = createDonationSchema.parse(req.body);
  const { donation, family } = await donationsService.createDonationIntent(actor.userId, data);
  return res.status(201).json({
    donation: toDonorDonation(donation, family, actor.userId),
    message: 'Doação criada. Aguardando confirmação de pagamento.',
  });
}

/**
 * Confirmação MOCK (dev/staging) — admin only e BLOQUEADA em produção.
 * O Pix real (webhook) chega na Fase 5.
 */
export async function confirmPaymentMock(req: Request, res: Response): Promise<Response> {
  const actor = actorOf(req);
  if (env.NODE_ENV === 'production') {
    throw new AppError('Confirmação mock indisponível em produção.', 403, 'mock_disabled_in_prod');
  }
  const { donation, family } = await donationsService.confirmDonationPaymentMock(actor.userId, req.params.id);
  return res.json({
    donation: toAdminDonation(donation, family),
    message: 'Pagamento confirmado (mock). Gift card liberado para a família.',
  });
}
