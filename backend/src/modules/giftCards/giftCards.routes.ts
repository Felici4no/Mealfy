import { Router } from 'express';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';
import { importGiftCards } from './giftCards.controller';

// Montado em /admin — somente admin. (estoque/listagem/invalidação nas Fases 3D/3E)
export const giftCardsRoutes = Router();

giftCardsRoutes.use(authGuard, roleGuard('admin'));

giftCardsRoutes.post('/gift-cards/import', importGiftCards);
