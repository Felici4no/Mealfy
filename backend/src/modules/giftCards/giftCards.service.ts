import crypto from 'crypto';
import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/AppError';
import {
  encryptGiftCardCode,
  hashGiftCardCode,
  maskGiftCardCode,
} from '../../shared/crypto/crypto.service';
import { createAuditLog } from '../auditLogs/auditLog.service';
import type { GiftCardProvider, GiftCardStatus } from '@prisma/client';
import type { ImportGiftCardsInput, ListGiftCardsQuery } from './giftCards.validator';

/**
 * Importação manual de códigos pelo admin. Faz limpeza, dedupe (no payload e
 * contra o banco via codeHash), cifra (AES-256-GCM) e cria batch + eventos +
 * audit log de forma transacional. NUNCA retorna o código em claro.
 */
export async function importGiftCards(actorUserId: string, input: ImportGiftCardsInput) {
  const totalReceived = input.codes.length;
  const cleaned = input.codes.map((c) => c.trim()).filter((c) => c.length > 0);
  const totalInvalid = totalReceived - cleaned.length; // linhas vazias

  // Dedupe dentro do próprio payload (por hash)
  const seen = new Set<string>();
  const unique: string[] = [];
  let payloadDuplicates = 0;
  for (const code of cleaned) {
    const h = hashGiftCardCode(code);
    if (seen.has(h)) {
      payloadDuplicates++;
      continue;
    }
    seen.add(h);
    unique.push(code);
  }

  // Dedupe contra o banco (codeHash já existente)
  const existing = await prisma.giftCard.findMany({
    where: { codeHash: { in: unique.map(hashGiftCardCode) } },
    select: { codeHash: true },
  });
  const existingHashes = new Set(existing.map((e) => e.codeHash));
  const toImport = unique.filter((c) => !existingHashes.has(hashGiftCardCode(c)));
  const totalDuplicated = payloadDuplicates + (unique.length - toImport.length);

  if (toImport.length === 0) {
    throw new AppError(
      'Nenhum código novo para importar (todos duplicados ou inválidos).',
      422,
      'nothing_to_import',
    );
  }

  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

  const batch = await prisma.$transaction(async (tx) => {
    const b = await tx.giftCardBatch.create({
      data: {
        provider: input.provider,
        batchName: input.batchName,
        importedByUserId: actorUserId,
        totalCodes: toImport.length,
        amount: input.amount,
      },
    });

    const rows = toImport.map((code) => ({
      id: crypto.randomUUID(),
      provider: input.provider,
      codeEncrypted: encryptGiftCardCode(code),
      codeMasked: maskGiftCardCode(code),
      codeHash: hashGiftCardCode(code),
      amount: input.amount,
      status: 'available' as const,
      batchId: b.id,
      expiresAt,
    }));

    await tx.giftCard.createMany({ data: rows });
    await tx.giftCardEvent.createMany({
      data: rows.map((r) => ({ giftCardId: r.id, eventType: 'imported', userId: actorUserId })),
    });
    return b;
  });

  await createAuditLog({
    actorUserId,
    action: 'import_gift_cards',
    entityType: 'gift_card_batch',
    entityId: batch.id,
    metadata: {
      provider: input.provider,
      imported: toImport.length,
      duplicated: totalDuplicated,
      invalid: totalInvalid,
    },
  });

  const warnings: string[] = [];
  if (totalDuplicated > 0) warnings.push(`${totalDuplicated} código(s) duplicado(s) ignorado(s).`);
  if (totalInvalid > 0) warnings.push(`${totalInvalid} linha(s) vazia(s) ignorada(s).`);

  return {
    batchId: batch.id,
    provider: input.provider,
    totalReceived,
    totalImported: toImport.length,
    totalDuplicated,
    totalInvalid,
    importedCount: toImport.length,
    warnings,
  };
}

const PROVIDERS: GiftCardProvider[] = ['ifood', 'ninetynine', 'carrefour'];
const STATUSES: GiftCardStatus[] = ['available', 'reserved', 'used', 'expired', 'invalid'];

/** Estoque por provider: contagem de cada status + total. */
export async function getStock() {
  const grouped = await prisma.giftCard.groupBy({ by: ['provider', 'status'], _count: true });
  return PROVIDERS.map((provider) => {
    const row: Record<string, number | string> = { provider, total: 0 };
    for (const s of STATUSES) row[s] = 0;
    for (const g of grouped.filter((x) => x.provider === provider)) {
      row[g.status] = g._count;
      row.total = (row.total as number) + g._count;
    }
    return row;
  });
}

/** Lista paginada (mascarada) com filtros. */
export async function listGiftCards(filters: ListGiftCardsQuery) {
  const where = {
    provider: filters.provider,
    status: filters.status,
    batchId: filters.batchId,
  };
  const [total, items] = await Promise.all([
    prisma.giftCard.count({ where }),
    prisma.giftCard.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
  ]);
  return { items, total, page: filters.page, limit: filters.limit };
}

export async function listBatches() {
  return prisma.giftCardBatch.findMany({ orderBy: { createdAt: 'desc' } });
}
