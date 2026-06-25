import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/AppError';
import { createAuditLog } from '../auditLogs/auditLog.service';
import type { UserStatus } from '@prisma/client';

/** Atualiza o status de uma entidade (aprovar/bloquear) e audita. */
export async function setEntityStatus(
  actorUserId: string,
  entityId: string,
  status: UserStatus,
  action: 'approve_entity' | 'block_entity',
) {
  const entity = await prisma.entity.findUnique({ where: { id: entityId } });
  if (!entity) throw new AppError('Entidade não encontrada', 404, 'entity_not_found');

  const updated = await prisma.entity.update({ where: { id: entityId }, data: { status } });
  // Mantém o status do usuário coerente quando bloqueado.
  if (status === 'blocked') {
    await prisma.user.update({ where: { id: entity.userId }, data: { status: 'blocked' } });
  } else if (status === 'active') {
    await prisma.user.update({ where: { id: entity.userId }, data: { status: 'active' } });
  }

  await createAuditLog({ actorUserId, action, entityType: 'entity', entityId });
  return updated;
}
