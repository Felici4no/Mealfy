import type { Donation, Family } from '@prisma/client';

type FamilyLite = Pick<Family, 'id' | 'displayName' | 'city' | 'state'> | null | undefined;

const donorMessage = (status: Donation['status']): string | null => {
  switch (status) {
    case 'completed':
      return 'Família recebeu o apoio.';
    case 'pending_payment':
      return 'Pagamento pendente.';
    case 'canceled':
      return 'Doação cancelada.';
    case 'failed':
      return 'Doação não concluída.';
    default:
      return null;
  }
};

/**
 * Visão do DOADOR — NUNCA inclui o código do gift card (nem mascarado).
 * Mostra impacto: status, provider e "alimentada por você".
 */
export function toDonorDonation(d: Donation, family?: FamilyLite, currentUserId?: string) {
  return {
    id: d.id,
    status: d.status,
    amount: d.amount,
    provider: d.provider,
    familyId: d.familyId,
    familyName: family?.displayName ?? null,
    city: family?.city ?? null,
    state: family?.state ?? null,
    createdAt: d.createdAt,
    completedAt: d.completedAt,
    message: donorMessage(d.status),
    providerLabel:
      d.status === 'completed' ? `Vale ${providerLabel(d.provider)} enviado para a família.` : null,
    fedByYou: d.status === 'completed' && d.donorId === currentUserId,
  };
}

/** Visão ADMIN/ENTIDADE — também NUNCA inclui o código. */
export function toAdminDonation(d: Donation, family?: FamilyLite) {
  return {
    id: d.id,
    donorId: d.donorId,
    familyId: d.familyId,
    familyName: family?.displayName ?? null,
    amount: d.amount,
    provider: d.provider,
    status: d.status,
    giftCardId: d.giftCardId,
    paymentId: d.paymentId,
    failureReason: d.failureReason,
    createdAt: d.createdAt,
    completedAt: d.completedAt,
    canceledAt: d.canceledAt,
  };
}

export function providerLabel(provider: Donation['provider']): string {
  if (provider === 'ninetynine') return '99 Mercado';
  if (provider === 'ifood') return 'iFood';
  return 'Carrefour';
}
