import type { GiftCard } from '@prisma/client';

/**
 * DTO admin de gift card — NUNCA inclui `codeEncrypted`, `codeHash` nem o código puro.
 * Só o `codeMasked` é exposto.
 */
export function toAdminGiftCard(g: GiftCard) {
  return {
    id: g.id,
    provider: g.provider,
    codeMasked: g.codeMasked,
    amount: g.amount,
    status: g.status,
    batchId: g.batchId,
    expiresAt: g.expiresAt,
    reservedAt: g.reservedAt,
    usedAt: g.usedAt,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  };
}
