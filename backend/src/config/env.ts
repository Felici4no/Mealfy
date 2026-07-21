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
  // Gift card provider (Fase 7) — só `manual_inventory` implementado; os demais
  // valores existem só como documentação de intenção (pendência comercial).
  GIFT_CARD_PROVIDER: z
    .enum(['manual_inventory', 'todo_incomm', 'incentive_me', 'ding_connect', 'ifood_card', 'stub'])
    .default('manual_inventory'),

  // ─── Login social (Fase 8) ───────────────────────────────────────────────
  // Todos opcionais: cada provedor só é habilitado quando suas credenciais existem.
  // Sem credenciais, o endpoint responde 501 provider_not_configured (não quebra o boot).
  // Papel padrão de quem se cadastra via login social (nunca cria admin/beneficiary).
  OAUTH_DEFAULT_ROLE: z.enum(['donor', 'entity']).default('donor'),

  // Google — Client ID Web (usado para validar o `aud` do ID token vindo do app).
  GOOGLE_CLIENT_ID: z.string().optional(),

  // Facebook / Meta — App ID + secret (o secret monta o app-token de verificação).
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),

  // Apple — Services ID (client_id) usado como `aud` do ID token da Apple.
  APPLE_CLIENT_ID: z.string().optional(),

  // Gov.br — OIDC Authorization Code. Ambiente de homologação por padrão.
  GOVBR_CLIENT_ID: z.string().optional(),
  GOVBR_CLIENT_SECRET: z.string().optional(),
  GOVBR_REDIRECT_URI: z.string().optional(),
  GOVBR_ENV: z.enum(['staging', 'production']).default('staging'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[env] Variáveis de ambiente inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
