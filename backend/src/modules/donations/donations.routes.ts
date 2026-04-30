import { Router } from 'express';
import { DonationsController } from './donations.controller';
import { authMiddleware } from '../../shared/middlewares/auth';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const donationsRoutes = Router();

donationsRoutes.post('/', authMiddleware, roleGuard(['donor']), DonationsController.create);
donationsRoutes.post('/batch', authMiddleware, roleGuard(['donor']), DonationsController.batch);
donationsRoutes.get('/me', authMiddleware, roleGuard(['donor']), DonationsController.listMe);

export { donationsRoutes };
