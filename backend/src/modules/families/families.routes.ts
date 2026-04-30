import { Router } from 'express';
import { FamiliesController } from './families.controller';
import { authMiddleware } from '../../shared/middlewares/auth';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const familiesRoutes = Router();

familiesRoutes.get('/public', FamiliesController.getPublic);
familiesRoutes.get('/:id', authMiddleware, FamiliesController.getById);
familiesRoutes.post('/', authMiddleware, roleGuard(['entity', 'admin']), FamiliesController.create);
familiesRoutes.patch('/:id/status', authMiddleware, roleGuard(['admin']), FamiliesController.updateStatus);

export { familiesRoutes };
