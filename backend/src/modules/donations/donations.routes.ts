import { Router } from 'express';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';
import { createDonation, confirmPaymentMock, getDonation, cancelDonation } from './donations.controller';

// Montado em /donations. Tudo exige autenticação.
export const donationsRoutes = Router();

donationsRoutes.use(authGuard);

// Apenas doador cria doação (entidade/admin não doam como doador)
donationsRoutes.post('/', roleGuard('donor'), createDonation);

// Leitura role-aware (doador vê a sua; admin/entidade conforme posse)
donationsRoutes.get('/:id', getDonation);

// Confirmação MOCK (dev/staging) — somente admin (e bloqueada em produção no controller)
donationsRoutes.post('/:id/confirm-payment-mock', roleGuard('admin'), confirmPaymentMock);

// Cancelar (apenas pending_payment) — doador dono ou admin
donationsRoutes.post('/:id/cancel', roleGuard('donor', 'admin'), cancelDonation);
