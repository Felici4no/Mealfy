# Mealfy Backend (MVP)

Backend **real** do Mealfy — independente do app mobile (React/Vite/Capacitor).
Foi pensado para subir isoladamente no **Railway/Render** apontando para esta pasta `/backend`.

> ⚠️ Não confundir com `src/backend/` **dentro do app mobile**: aquilo é a camada de
> serviços/mocks do front. O backend real é **somente esta pasta**.

## Stack
- Node.js + Express
- TypeScript
- Prisma ORM + PostgreSQL
- Zod (validação de payloads)
- JWT + bcrypt/argon2 (fases seguintes)
- Pix **mockado** inicialmente; gift cards importados internamente

## Como rodar (local)
```bash
cd backend
cp .env.example .env      # ajuste as variáveis
npm install
npm run dev               # sobe a API em http://localhost:3000
```

Healthcheck:
```bash
curl http://localhost:3000/health
# { "status": "ok", "service": "mealfy-backend", ... }
```

## Scripts
| Script | O que faz |
|---|---|
| `npm run dev` | sobe a API com reload (ts-node-dev) |
| `npm run build` | compila TypeScript para `dist/` |
| `npm start` | roda o build (`dist/server.js`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run prisma:generate` | gera o Prisma Client |
| `npm run prisma:migrate` | aplica migrations em dev |
| `npm run prisma:seed` | popula dados de teste (dev/staging) |
| `npm run prisma:studio` | abre o Prisma Studio |

## Estrutura
```
backend/
  package.json  tsconfig.json  .env.example  README.md
  prisma/
    schema.prisma   (Fase 1B/1C)
    seed.ts         (Fase 1D)
  src/
    config/env.ts
    database/prisma.ts   (Fase 1B)
    shared/{errors,middlewares,utils}/
    modules/
      health/            (pronto)
      auth/ users/ entities/ families/ giftCards/
      donations/ payments/ admin/ favorites/ auditLogs/   (Fase 2+)
    app.ts  server.ts
```

## Status
- **Fase 1A — Fundação da API:** ✅ Express + TS + `/health` + env validado por Zod.
- Próximas fases (Prisma/Postgres, schema, seed, deploy) — ver
  [`docs/BACKEND_AUDIT_AND_IMPLEMENTATION_PLAN.md`](../docs/BACKEND_AUDIT_AND_IMPLEMENTATION_PLAN.md).

> Os arquivos `ARCHITECTURE.md`, `API_ROUTES.md`, `MOCK_DATA.md`, `AUDITORIA_TECNICA.md`,
> `AUDIT_NOTES.md`, `CRUD_E_ARQUITETURA_DO_BANCO.md` descrevem o **antigo scaffold mockado**
> (file-JSON) e estão **obsoletos** — serão removidos/arquivados ao longo da migração.
