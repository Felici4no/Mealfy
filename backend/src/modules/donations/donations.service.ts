import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/AppError';
import { createAuditLog } from '../auditLogs/auditLog.service';
import { wasFedThisCycle, getCurrentCycleStart } from '../../shared/utils/feedCycle';
import type { GiftCardProvider, UserRole, Family } from '@prisma/client';
import type { CreateDonationInput } from './donations.validator';

export interface Actor {
  userId: string;
  role: UserRole;
}

type FamilyWithDeps = Family & { dependents: { isEligibleMinor: boolean }[] };

/** Resolve o provider: today → preferred → enviado na doação. 422 se nenhum. */
export function resolveDonationProvider(
  family: Pick<Family, 'todayRequestedProvider' | 'preferredGiftCardProvider'>,
  inputProvider?: GiftCardProvider,
): GiftCardProvider {
  const provider = family.todayRequestedProvider ?? family.preferredGiftCardProvider ?? inputProvider ?? null;
  if (!provider) {
    throw new AppError('Nenhum provider definido para esta família.', 422, 'no_provider');
  }
  return provider;
}

async function loadEligibleFamily(familyId: string): Promise<FamilyWithDeps> {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: { dependents: { select: { isEligibleMinor: true } } },
  });
  if (!family) throw new AppError('Família não encontrada', 404, 'family_not_found');
  if (family.approvalStatus !== 'approved') {
    throw new AppError('Família não está aprovada para receber doação.', 422, 'family_not_approved');
  }
  if (!family.dependents.some((d) => d.isEligibleMinor)) {
    throw new AppError('Família sem dependente de 0 a 17 anos.', 422, 'no_eligible_minor');
  }
  return family;
}

/**
 * Cria a intenção de doação (status `pending_payment`). NÃO libera gift card
 * nem marca a família como alimentada — isso só ocorre na confirmação (Fase 4D).
 */
export async function createDonationIntent(donorUserId: string, input: CreateDonationInput) {
  const family = await loadEligibleFamily(input.familyId);

  // Bloqueio diário (autoritativo): 1 doação/família por ciclo (reset 08h SP).
  if (wasFedThisCycle(family.lastFedAt)) {
    throw new AppError('Esta família já foi alimentada hoje. Próxima liberação às 08h.', 409, 'already_fed_today');
  }

  const provider = resolveDonationProvider(family, input.provider);

  const stock = await prisma.giftCard.count({ where: { provider, status: 'available' } });
  if (stock <= 0) {
    throw new AppError(`Sem códigos disponíveis para ${provider}.`, 409, 'no_stock');
  }

  const donation = await prisma.donation.create({
    data: {
      donorId: donorUserId,
      familyId: family.id,
      amount: input.amount,
      provider,
      status: 'pending_payment',
    },
  });

  await createAuditLog({
    actorUserId: donorUserId,
    action: 'create_donation',
    entityType: 'donation',
    entityId: donation.id,
    metadata: { familyId: family.id, provider, amount: input.amount },
  });

  return { donation, family };
}

/**
 * Confirmação MOCK de pagamento (dev/admin) — Fase 4. O Pix real vem na Fase 5.
 * Tudo numa transação atômica e na ordem certa:
 *   1) guarda diária: marca a família alimentada SE não foi neste ciclo (senão aborta — nenhum vale é gasto);
 *   2) libera 1 gift card `available` do provider (available → used, FOR UPDATE SKIP LOCKED);
 *   3) completa a doação.
 * Nunca libera vale antes desta confirmação.
 */
/**
 * Finaliza a doação APÓS pagamento confirmado (idempotente). Usado pela confirmação
 * mock (Fase 4/5) e pelo webhook do Pix (Fase 5). Atômico e na ordem certa:
 *   1) guarda diária (marca família alimentada se não foi no ciclo — senão aborta);
 *   2) libera 1 gift card available do provider (available → used);
 *   3) completa a doação e marca o pagamento como pago.
 */
export async function finalizeDonationAfterPayment(donationId: string, actorUserId?: string | null) {
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });
  if (!donation) throw new AppError('Doação não encontrada', 404, 'donation_not_found');

  const familySelect = { id: true, displayName: true, city: true, state: true } as const;

  // Idempotência (webhook pode chegar repetido): já completa => no-op.
  if (donation.status === 'completed') {
    const family = await prisma.family.findUnique({ where: { id: donation.familyId }, select: familySelect });
    return { donation, family, alreadyCompleted: true };
  }
  if (donation.status !== 'pending_payment') {
    throw new AppError(`Doação em estado inválido para finalizar (${donation.status}).`, 409, 'invalid_state');
  }

  const donor = await prisma.user.findUnique({
    where: { id: donation.donorId },
    select: { name: true, instagram: true },
  });
  const cycleStart = getCurrentCycleStart();

  const result = await prisma.$transaction(async (tx) => {
    // 1) guarda diária atômica
    const fed = await tx.$queryRaw<Array<{ id: string }>>`
      UPDATE "families" SET "lastFedAt" = now(), "supportStatus" = 'fed',
        "lastDonationId" = ${donationId}, "lastDonorId" = ${donation.donorId},
        "lastDonorName" = ${donor?.name ?? null}, "lastDonorInstagram" = ${donor?.instagram ?? null},
        "lastGiftCardProvider" = ${donation.provider}::"GiftCardProvider", "updatedAt" = now()
      WHERE "id" = ${donation.familyId} AND ("lastFedAt" IS NULL OR "lastFedAt" < ${cycleStart})
      RETURNING "id";`;
    if (fed.length === 0) {
      throw new AppError('Esta família já foi alimentada hoje.', 409, 'already_fed_today');
    }

    // 2) libera 1 gift card available do provider
    const gc = await tx.$queryRaw<Array<{ id: string }>>`
      UPDATE "gift_cards" SET "status" = 'used', "usedAt" = now(),
        "donationId" = ${donationId}, "familyId" = ${donation.familyId}, "updatedAt" = now()
      WHERE "id" = (
        SELECT "id" FROM "gift_cards"
        WHERE "provider" = ${donation.provider}::"GiftCardProvider" AND "status" = 'available'
        ORDER BY "createdAt" ASC LIMIT 1 FOR UPDATE SKIP LOCKED
      )
      RETURNING "id";`;
    if (gc.length === 0) {
      throw new AppError(`Sem códigos disponíveis para ${donation.provider}.`, 409, 'no_stock');
    }
    const giftCardId = gc[0].id;

    // 3) completa a doação + marca pagamento pago
    const updated = await tx.donation.update({
      where: { id: donationId },
      data: { status: 'completed', giftCardId, completedAt: new Date() },
    });
    if (donation.paymentId) {
      await tx.payment.update({ where: { id: donation.paymentId }, data: { status: 'paid', paidAt: new Date() } });
    }
    await tx.giftCardEvent.create({ data: { giftCardId, eventType: 'released', donationId } });
    return { donation: updated, giftCardId };
  });

  await createAuditLog({
    actorUserId: actorUserId ?? null,
    action: 'release_gift_card',
    entityType: 'gift_card',
    entityId: result.giftCardId,
    metadata: { donationId },
  });

  const family = await prisma.family.findUnique({ where: { id: donation.familyId }, select: familySelect });
  return { donation: result.donation, family, alreadyCompleted: false };
}

/** Confirmação MOCK (dev/admin). Só confirma `pending_payment`; delega a finalização. */
export async function confirmDonationPaymentMock(adminUserId: string, donationId: string) {
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });
  if (!donation) throw new AppError('Doação não encontrada', 404, 'donation_not_found');
  if (donation.status !== 'pending_payment') {
    throw new AppError(
      `Só é possível confirmar doações com pagamento pendente (status atual: ${donation.status}).`,
      409,
      'invalid_state',
    );
  }
  const result = await finalizeDonationAfterPayment(donationId, adminUserId);
  await createAuditLog({
    actorUserId: adminUserId,
    action: 'confirm_payment_mock',
    entityType: 'donation',
    entityId: donationId,
    metadata: { provider: donation.provider },
  });
  return result;
}

export async function cancelDonation(actor: Actor, donationId: string) {
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });
  if (!donation) throw new AppError('Doação não encontrada', 404, 'donation_not_found');
  if (actor.role === 'donor' && donation.donorId !== actor.userId) {
    throw new AppError('Acesso negado', 403, 'forbidden');
  }
  if (donation.status !== 'pending_payment') {
    throw new AppError(
      `Só é possível cancelar doações com pagamento pendente (status atual: ${donation.status}).`,
      409,
      'cannot_cancel',
    );
  }
  const updated = await prisma.donation.update({
    where: { id: donationId },
    data: { status: 'canceled', canceledAt: new Date() },
  });
  await createAuditLog({
    actorUserId: actor.userId,
    action: 'cancel_donation',
    entityType: 'donation',
    entityId: donationId,
  });
  return updated;
}

// ── Leituras ────────────────────────────────────────────────────────────────

export async function getDonationForActor(actor: Actor, donationId: string) {
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });
  if (!donation) throw new AppError('Doação não encontrada', 404, 'donation_not_found');

  const family = await prisma.family.findUnique({
    where: { id: donation.familyId },
    select: { id: true, displayName: true, city: true, state: true, entityId: true },
  });

  if (actor.role === 'admin') return { donation, family, view: 'admin' as const };
  if (actor.role === 'donor') {
    if (donation.donorId !== actor.userId) throw new AppError('Acesso negado', 403, 'forbidden');
    return { donation, family, view: 'donor' as const };
  }
  if (actor.role === 'entity') {
    const entity = await prisma.entity.findUnique({ where: { userId: actor.userId } });
    if (!entity || family?.entityId !== entity.id) throw new AppError('Acesso negado', 403, 'forbidden');
    return { donation, family, view: 'admin' as const };
  }
  throw new AppError('Acesso negado', 403, 'forbidden');
}

export async function listMyDonations(donorUserId: string) {
  const donations = await prisma.donation.findMany({
    where: { donorId: donorUserId },
    orderBy: { createdAt: 'desc' },
  });
  const familyIds = [...new Set(donations.map((d) => d.familyId))];
  const families = await prisma.family.findMany({
    where: { id: { in: familyIds } },
    select: { id: true, displayName: true, city: true, state: true },
  });
  const byId = new Map(families.map((f) => [f.id, f]));
  return donations.map((d) => ({ donation: d, family: byId.get(d.familyId) }));
}

export async function listFamilyDonations(actor: Actor, familyId: string) {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    select: { id: true, displayName: true, city: true, state: true, entityId: true },
  });
  if (!family) throw new AppError('Família não encontrada', 404, 'family_not_found');
  if (actor.role === 'entity') {
    const entity = await prisma.entity.findUnique({ where: { userId: actor.userId } });
    if (!entity || family.entityId !== entity.id) throw new AppError('Acesso negado', 403, 'forbidden');
  } else if (actor.role !== 'admin') {
    throw new AppError('Acesso negado', 403, 'forbidden');
  }
  const donations = await prisma.donation.findMany({
    where: { familyId },
    orderBy: { createdAt: 'desc' },
  });
  return { family, donations };
}
