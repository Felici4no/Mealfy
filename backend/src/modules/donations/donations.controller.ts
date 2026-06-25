import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { createDonationSchema } from './donations.validator';
import * as donationsService from './donations.service';
import { toDonorDonation } from './donations.dto';

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
