import 'dotenv/config';
import { z } from 'zod';

/**
 * Validação central das variáveis de ambiente.
 * Na fundação (Fase 1A) validamos apenas o núcleo da API.
 * DATABASE_URL e segredos passam a ser exigidos nas fases seguintes.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default('*'),
  // Banco — opcional na fundação; obrigatório a partir da Fase 1B em runtime real.
  DATABASE_URL: z.string().optional(),
  // Auth (Fase 2) — opcional no schema; o jwt util exige em runtime quando usado.
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  // Gift cards (Fase 3) — 32 bytes em hex (64 chars); o crypto service valida o formato.
  ENCRYPTION_KEY: z.string().optional(),
  // Pagamentos Pix (Fase 5)
  PAYMENT_PROVIDER: z.enum(['mock']).default('mock'),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),
  PIX_EXPIRATION_MINUTES: z.coerce.number().int().positive().default(30),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[env] Variáveis de ambiente inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
