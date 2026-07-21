import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/AppError';

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('Usuário não encontrado', 404, 'user_not_found');
  return user;
}

/** Atualiza preferências de visibilidade no ranking. */
export async function updatePrivacy(
  userId: string,
  settings: { showOnRanking?: boolean; showInstagram?: boolean; anonymousMode?: boolean },
) {
  await getUserById(userId);
  return prisma.user.update({ where: { id: userId }, data: settings });
}

/** Atualiza apenas campos simples e seguros do próprio perfil. */
export async function updateUser(
  userId: string,
  data: { name?: string; avatarUrl?: string | null; instagram?: string | null; phone?: string | null },
) {
  await getUserById(userId);
  return prisma.user.update({ where: { id: userId }, data });
}
