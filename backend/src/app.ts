import 'express-async-errors';
import express, { type Application } from 'express';
import cors from 'cors';

import { env } from './config/env';
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { entitiesRoutes } from './modules/entities/entities.routes';
import { familiesRoutes } from './modules/families/families.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { giftCardsRoutes } from './modules/giftCards/giftCards.routes';
import { donationsRoutes } from './modules/donations/donations.routes';
import { beneficiaryRoutes } from './modules/beneficiary/beneficiary.routes';
import { notFoundHandler } from './shared/middlewares/notFound';
import { errorHandler } from './shared/middlewares/errorHandler';

/**
 * Monta a aplicação Express (sem dar listen — facilita testes).
 * Cada módulo registra suas rotas aqui conforme as fases avançam.
 */
export function createApp(): Application {
  const app = express();

  const corsOrigin =
    env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  // Módulos
  app.use('/health', healthRoutes);
  app.use('/auth', authRoutes);
  app.use('/me', usersRoutes);
  app.use('/entity', entitiesRoutes);
  app.use('/families', familiesRoutes);
  app.use('/donations', donationsRoutes);
  app.use('/beneficiary', beneficiaryRoutes);
  app.use('/admin', adminRoutes);
  app.use('/admin', giftCardsRoutes);

  // 404 + erro global (sempre por último)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
