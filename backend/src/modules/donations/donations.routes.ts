import { Router } from 'express';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';
import { createDonation } from './donations.controller';

// Montado em /donations. Tudo exige autenticação.
export const donationsRoutes = Router();

donationsRoutes.use(authGuard);

// Apenas doador cria doação (entidade/admin não doam como doador)
donationsRoutes.post('/', roleGuard('donor'), createDonation);
