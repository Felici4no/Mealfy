import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';
import * as regionsService from './regions.service';

// Montado em /regions.
export const regionsRoutes = Router();

const searchSchema = z.object({
  q: z.string().min(2, 'Informe ao menos 2 letras'),
  state: z.string().length(2).optional(),
});

/**
 * Busca de município para o cadastro. Autenticada — quem cadastra família é
 * entidade/admin, e não há motivo para expor a base inteira publicamente.
 */
regionsRoutes.get('/search', authGuard, async (req: Request, res: Response) => {
  const { q, state } = searchSchema.parse(req.query);
  return res.json({ regions: await regionsService.searchRegions(q, state) });
});

/**
 * Regiões com famílias aprovadas + contagem — é o que o mapa desenha.
 * Autenticada porque o mapa já vive atrás de login.
 */
regionsRoutes.get('/map', authGuard, async (_req: Request, res: Response) => {
  return res.json({ regions: await regionsService.listRegionsWithFamilies() });
});

/**
 * Importa a lista do IBGE. Admin: é operação de manutenção, não de uso normal,
 * e depende de rede externa.
 */
regionsRoutes.post(
  '/import-ibge',
  authGuard,
  roleGuard('admin'),
  async (_req: Request, res: Response) => {
    return res.json(await regionsService.importFromIbge());
  },
);
