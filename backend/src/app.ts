import 'express-async-errors';
import express, { type Application } from 'express';
import cors from 'cors';

import { env } from './config/env';
import { healthRoutes } from './modules/health/health.routes';
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

  // 404 + erro global (sempre por último)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
