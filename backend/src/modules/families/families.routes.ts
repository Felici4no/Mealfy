import { Router } from 'express';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';
import { list, map, getOne, create, update, approve, reject, block, requestDailySupport } from './families.controller';
import { listFamilyDonations } from '../donations/donations.controller';

// Montado em /families. Tudo exige autenticação.
export const familiesRoutes = Router();

familiesRoutes.use(authGuard);

familiesRoutes.get('/', list); // role-aware (admin/entity => gestão; demais => aprovadas)
familiesRoutes.get('/map', map); // só aprovadas + localização; serialização de doador
familiesRoutes.get('/:id', getOne);
familiesRoutes.get('/:id/donations', listFamilyDonations); // admin / entidade dona

familiesRoutes.post('/', roleGuard('entity', 'admin'), create);
familiesRoutes.patch('/:id', roleGuard('entity', 'admin'), update);

// Provider do dia (família/entidade) — não libera vale nem cria doação
familiesRoutes.post('/:id/request-daily-support', roleGuard('entity', 'admin'), requestDailySupport);

// Aprovação/moderação — apenas admin
familiesRoutes.post('/:id/approve', roleGuard('admin'), approve);
familiesRoutes.post('/:id/reject', roleGuard('admin'), reject);
familiesRoutes.post('/:id/block', roleGuard('admin'), block);
