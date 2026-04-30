import { Router } from 'express';
import { IndicationsController } from './indications.controller';
import { authMiddleware } from '../../shared/middlewares/auth';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const indicationsRoutes = Router();

indicationsRoutes.post('/', authMiddleware, roleGuard(['donor']), IndicationsController.create);
indicationsRoutes.get('/', authMiddleware, roleGuard(['entity', 'admin']), IndicationsController.list);
indicationsRoutes.post('/:id/convert', authMiddleware, roleGuard(['entity', 'admin']), IndicationsController.convert);
indicationsRoutes.patch('/:id/status', authMiddleware, roleGuard(['admin']), IndicationsController.updateStatus);

export { indicationsRoutes };
