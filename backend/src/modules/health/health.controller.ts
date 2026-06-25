import type { Request, Response } from 'express';

/**
 * Healthcheck da API. Na Fase 1A reporta apenas o status do serviço.
 * Na Fase 1B passa a incluir o status da conexão com o banco.
 */
export function getHealth(_req: Request, res: Response): Response {
  return res.json({
    status: 'ok',
    service: 'mealfy-backend',
    env: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
}
