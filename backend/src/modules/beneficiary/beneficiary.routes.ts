import { Router } from 'express';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';
import { listMyGiftCards, getMyGiftCard } from './beneficiary.controller';

// Montado em /beneficiary — somente o próprio beneficiário (doador/admin => 403).
export const beneficiaryRoutes = Router();

beneficiaryRoutes.use(authGuard, roleGuard('beneficiary'));

beneficiaryRoutes.get('/gift-cards', listMyGiftCards);
beneficiaryRoutes.get('/gift-cards/:id', getMyGiftCard);
