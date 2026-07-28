import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/AppError';

/**
 * Família vinculada ao beneficiário logado. 403 se não houver vínculo.
 * Inclui dependentes: o beneficiário é o dono do próprio cadastro e a tela
 * precisa deles para mostrar quantas crianças estão cobertas.
 */
export async function getMyFamily(userId: string) {
  const family = await prisma.family.findFirst({
    where: { beneficiaryUserId: userId },
    include: { dependents: true },
  });
  if (!family) throw new AppError('Nenhuma família vinculada a este beneficiário.', 403, 'no_family');
  return family;
}

/** Gift cards liberados para a família do beneficiário (mais recentes primeiro). */
export async function listMyGiftCards(userId: string) {
  const family = await getMyFamily(userId);
  return prisma.giftCard.findMany({
    where: { familyId: family.id, status: 'used' },
    orderBy: { usedAt: 'desc' },
  });
}

export async function getMyGiftCard(userId: string, giftCardId: string) {
  const family = await getMyFamily(userId);
  const gc = await prisma.giftCard.findUnique({ where: { id: giftCardId } });
  if (!gc || gc.familyId !== family.id) {
    throw new AppError('Gift card não encontrado', 404, 'gift_card_not_found');
  }
  return gc;
}
