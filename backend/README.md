# Mealfy Backend (MVP)

Backend **real** do Mealfy — Express + TypeScript + Prisma + PostgreSQL, **independente** do
app mobile (React/Vite/Capacitor). Pensado para subir isoladamente no **Railway/Render**
apontando para esta pasta `/backend`.

> ⚠️ Não confundir com `src/backend/` **dentro do app mobile**: aquilo é a camada de
> serviços/mocks do front. O backend real é **somente esta pasta** (`/backend`).

---

## Stack
- Node.js 22 + Express 4
- TypeScript
- Prisma ORM + PostgreSQL
- Zod (validação de payloads / env)
- JWT + bcrypt/argon2 → **Fase 2**
- Pix **mockado** inicialmente; gift cards importados internamente

## Estrutura
```
backend/
  package.json  tsconfig.json  tsconfig.seed.json
  .env.example  .gitignore  Dockerfile  .dockerignore  README.md
  prisma/
    schema.prisma                 # 14 tabelas + 13 enums
    migrations/<ts>_init/          # migration inicial (versionada)
    seed.ts                        # dados de dev/staging (idempotente)
  src/
    config/env.ts                  # validação de env (Zod)
    database/prisma.ts             # Prisma Client singleton + getDatabaseStatus()
    shared/{errors,middlewares}/   # AppError, errorHandler, notFound
    modules/health/                # GET /health (pronto)
    app.ts  server.ts
```

---

## 1. Rodar localmente

Pré-requisito: um PostgreSQL acessível (local, Docker, Supabase, Railway ou Render).

```bash
cd backend
cp .env.example .env          # preencha DATABASE_URL (e o resto)
npm install
npm run prisma:generate       # gera o Prisma Client
npm run prisma:migrate        # cria/aplica as migrations no banco (dev)
npm run prisma:seed           # popula dados de teste (dev/staging)
npm run dev                   # API em http://localhost:3000
```

Sem um Postgres à mão? Você ainda consegue:
```bash
npm run typecheck             # tsc --noEmit (src)
npm run typecheck:seed        # tsc do seed
npm run build                 # prisma generate + tsc
npx prisma validate           # valida o schema
```
(Apenas `prisma:migrate`/`prisma:seed`/`prisma:studio` exigem um banco real.)

## 2. Variáveis de ambiente (`.env`)

| Variável | Obrigatória | Quando | Descrição |
|---|:---:|---|---|
| `NODE_ENV` | não | sempre | `development` \| `test` \| `production` |
| `PORT` | não | sempre | porta (default 3000; Railway/Render injetam) |
| `CORS_ORIGIN` | não | sempre | origens permitidas (`*` ou lista por vírgula) |
| `DATABASE_URL` | **sim** | a partir de migrate/seed/runtime DB | string do PostgreSQL |
| `JWT_SECRET` | sim* | Fase 2 (auth) | segredo do JWT |
| `ENCRYPTION_KEY` | sim* | Fase 3 (gift cards) | chave AES-256 dos códigos |
| `PAYMENT_PROVIDER` | não | Fase 5 | `mock` no MVP |
| `PAYMENT_WEBHOOK_SECRET` | sim* | Fase 5 | assinatura do webhook Pix |
| `PIX_EXPIRATION_MINUTES` | não | Fase 5 | expiração da cobrança (default 30) |
| `EMAIL_PROVIDER` / `EMAIL_API_KEY` | não | Fase 6 | e-mail (mock no MVP) |
| `APP_URL` / `ADMIN_URL` | não | deploy | URLs públicas (CORS) |

`*` = obrigatória quando a fase correspondente entrar.

## 3. Migrations

```bash
# Desenvolvimento (cria migration a partir do schema e aplica):
npm run prisma:migrate

# Produção/staging (aplica migrations já versionadas, sem gerar novas):
npm run prisma:deploy        # = prisma migrate deploy
```
A migration inicial (`prisma/migrations/<ts>_init`) já está versionada — em um banco novo,
`prisma:deploy` cria as 14 tabelas e 13 enums.

## 4. Seed (dev/staging)

```bash
npm run prisma:seed
```
Cria: admin, entidade aprovada, doador; famílias SP/RJ (2 aprovadas com dependente 0–17,
1 pendente, 1 bloqueada); lotes de gift card para `ifood`/`ninetynine`/`carrefour`.
É **idempotente** (upsert) — pode rodar de novo sem duplicar.
> ⚠️ Nunca rode o seed em produção (dados/códigos são fictícios).

## 5. Healthcheck

```bash
curl http://localhost:3000/health
# { "status": "ok", "service": "mealfy-backend", "database": "connected", ... }
```
`database` reflete a conexão: `connected` | `disconnected` | `not_configured`.

---

## 6. Deploy no Railway / Render

A API sobe **isoladamente** (não depende do Vite/Capacitor). Configure o serviço apontando
para a pasta `backend`:

| Config | Valor |
|---|---|
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Pre-deploy / Release** | `npm run prisma:deploy` (aplica migrations) |
| **Health Check Path** | `/health` |

**Environment Variables** (mínimo):
```
DATABASE_URL=postgresql://...
JWT_SECRET=<defina>
CORS_ORIGIN=https://seu-app,https://seu-admin
ENCRYPTION_KEY=<defina>
PAYMENT_PROVIDER=mock
NODE_ENV=production
```

Passos:
1. Provisione um **PostgreSQL** (Supabase/Railway/Render) e copie a `DATABASE_URL`.
2. Crie o serviço Web apontando Root Directory = `backend`.
3. Defina as variáveis acima.
4. No primeiro deploy, rode as migrations: `npm run prisma:deploy`
   (ou deixe o **Dockerfile** fazer — o `CMD` roda `migrate deploy` antes de subir).
5. (Opcional, só staging) rode `npm run prisma:seed`.
6. Confirme `GET /health` retornando `database: "connected"`.

### Docker (opcional)
Há um `Dockerfile` pronto (node:22-slim + openssl). Build/start:
```bash
docker build -t mealfy-backend ./backend
docker run -p 3000:3000 --env-file backend/.env mealfy-backend
```

### App mobile apontando para a API
No app (`Mealfy-repo/.env`): `VITE_API_URL=https://sua-api...` e rebuild do APK.

---

## API — rotas (Fase 2)

Todas as rotas (exceto `/auth/*` e `/health`) exigem `Authorization: Bearer <token>`.

**Usuários seedados** (senha `123456`): `admin@mealfy.com` (admin) · `entidade@mealfy.com` (entity) · `doador@mealfy.com` (donor).

**Obter token:**
```bash
TOKEN=$(curl -s -X POST localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@mealfy.com","password":"123456"}' | jq -r .token)
curl localhost:3000/me -H "Authorization: Bearer $TOKEN"
```

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/register` | público | `{name,email,password,role}` — role `donor`\|`entity` (admin/beneficiary recusados) |
| POST | `/auth/login` | público | `{email,password}` → `{token,user}` |
| GET | `/me` | autenticado | usuário atual (sem hash) |
| PATCH | `/me` | autenticado | atualiza name/avatarUrl/instagram/phone |
| GET | `/entity/dashboard` | entity | resumo das famílias da entidade |
| GET | `/entity/families` | entity | famílias da própria entidade |
| POST | `/entity/families` | entity | cria família (`>=1` dependente) |
| PATCH | `/entity/families/:id` | entity | edita família da própria entidade |
| GET | `/families` | autenticado | role-aware (admin/entity=gestão; demais=aprovadas) |
| GET | `/families/map` | autenticado | só aprovadas + localização; **sem PII** |
| GET | `/families/:id` | autenticado | serialização por papel |
| POST | `/families` | entity·admin | cria família |
| PATCH | `/families/:id` | entity·admin | edita (entity só a sua) |
| POST | `/families/:id/approve` | admin | aprova (exige dependente 0–17) |
| POST | `/families/:id/reject` | admin | reprova |
| POST | `/families/:id/block` | admin | bloqueia |
| POST | `/families/:id/request-daily-support` | entity·admin | `{provider}` do dia |
| GET | `/admin/audit-logs` | admin | ações críticas |
| POST | `/admin/entities/:id/approve` | admin | aprova entidade |
| POST | `/admin/entities/:id/block` | admin | bloqueia entidade |

**Exemplo — entidade cria família e admin aprova:**
```bash
ET=$(curl -s -X POST localhost:3000/auth/login -H 'Content-Type: application/json' -d '{"email":"entidade@mealfy.com","password":"123456"}' | jq -r .token)
AD=$(curl -s -X POST localhost:3000/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@mealfy.com","password":"123456"}' | jq -r .token)
FID=$(curl -s -X POST localhost:3000/entity/families -H "Authorization: Bearer $ET" -H 'Content-Type: application/json' \
  -d '{"responsibleName":"Joao","displayName":"Familia X","city":"Sao Paulo","state":"SP","latitude":-23.5,"longitude":-46.6,"dependents":[{"name":"Kid","age":10}]}' | jq -r .family.id)
curl -s -X POST localhost:3000/families/$FID/approve -H "Authorization: Bearer $AD" | jq .family.approvalStatus
curl -s localhost:3000/families/map -H "Authorization: Bearer $AD" | jq '.families[].id'
```

> **Regras garantidas no backend:** senha com bcrypt (nunca em claro) · `/me` sem hash ·
> aprovação exige dependente 0–17 · doador nunca recebe CPF/NIS/endereço · entidade só
> gerencia as suas famílias · approve/reject/block auditados.

## Status das fases
- **Fase 1A** ✅ Fundação da API (Express + TS + `/health` + env Zod).
- **Fase 1B** ✅ Prisma + PostgreSQL (client singleton + status no health).
- **Fase 1C** ✅ Schema inicial (14 tabelas, 13 enums) + migration inicial.
- **Fase 1D** ✅ Seed dev/staging idempotente.
- **Fase 1E** ✅ Preparação de deploy Railway/Render (build/start/Dockerfile).
- **Fase 1F** ✅ Esta documentação.
- **Fase 1G** ✅ Validação em **PostgreSQL real** (ver abaixo).
- **Fase 2** ✅ Auth (bcrypt+JWT) · /me · entidades · famílias + dependentes ·
  regra 0–17 · aprovação manual · mapa/ficha · provider diário · audit logs.

### Validação em PostgreSQL real (Fase 1G)
Fluxo provado de ponta a ponta contra um Postgres 17 real:
`prisma migrate deploy` (migration `*_init` aplicada) → `prisma:seed` → `npm run build`/`typecheck`
verdes → API local com `GET /health` retornando **`database: "connected"`**.

Dados conferidos no banco (e **idempotentes** — re-seed não duplica):

| Tabela | Qtde | Detalhe |
|---|---:|---|
| users | 3 | admin, entity, donor |
| entities | 1 | aprovada |
| families | 4 | 2 approved · 1 pending · 1 blocked |
| family_dependents | 5 | aprovada SP tem menores elegíveis (8 e 14 anos) |
| gift_card_batches | 3 | ifood · ninetynine · carrefour |
| gift_cards | 15 | 5 por provider, todos `available` |

> Sem Postgres à mão? Dá para reproduzir com um Postgres local/cloud em `DATABASE_URL`,
> ou com um Postgres embarcado de dev (ex.: pacote `embedded-postgres`).

### Próximos passos — Fase 3 (Gift cards)
- Tabelas `gift_cards`/`gift_card_batches` já no schema — falta o fluxo:
- Importação manual pelo admin (`POST /admin/gift-cards/import`) + estoque por provider.
- **Criptografia real** (AES-256-GCM com `ENCRYPTION_KEY`) substituindo o placeholder do seed.
- Reserva/liberação **transacional** e segura (sem reuso de código) — preparando a Fase 4 (doações) e 5 (Pix).

Plano completo: [`../docs/BACKEND_AUDIT_AND_IMPLEMENTATION_PLAN.md`](../docs/BACKEND_AUDIT_AND_IMPLEMENTATION_PLAN.md).

> Os arquivos `ARCHITECTURE.md`, `API_ROUTES.md`, `MOCK_DATA.md`, `AUDITORIA_TECNICA.md`,
> `AUDIT_NOTES.md`, `CRUD_E_ARQUITETURA_DO_BANCO.md` descrevem o **antigo scaffold mockado**
> (file-JSON) e estão **obsoletos** — serão removidos/arquivados na Fase 2.
