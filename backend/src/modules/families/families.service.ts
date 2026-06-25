import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/AppError';
import { maskTail } from '../../shared/utils/mask';
import { createAuditLog } from '../auditLogs/auditLog.service';
import type { UserRole } from '@prisma/client';
import type { CreateFamilyInput, UpdateFamilyInput, ListFamiliesQuery } from './families.validator';

export interface Actor {
  userId: string;
  role: UserRole;
}

const familyInclude = { dependents: true } as const;

/** Resolve a entidade do usuário logado (papel entity). 403 se não houver. */
async function resolveActorEntityId(actor: Actor): Promise<string> {
  const entity = await prisma.entity.findUnique({ where: { userId: actor.userId } });
  if (!entity) throw new AppError('Perfil de entidade não encontrado', 403, 'no_entity_profile');
  return entity.id;
}

/** Carrega a família e garante que o ator (entity) é dono; admin sempre passa. */
async function loadOwnedFamily(actor: Actor, id: string) {
  const family = await prisma.family.findUnique({ where: { id }, include: familyInclude });
  if (!family) throw new AppError('Família não encontrada', 404, 'family_not_found');
  if (actor.role === 'admin') return family;
  if (actor.role === 'entity') {
    const entityId = await resolveActorEntityId(actor);
    if (family.entityId !== entityId) throw new AppError('Acesso negado', 403, 'forbidden');
    return family;
  }
  throw new AppError('Acesso negado', 403, 'forbidden');
}

export async function createFamily(actor: Actor, input: CreateFamilyInput) {
  let entityId: string | null = null;
  if (actor.role === 'entity') entityId = await resolveActorEntityId(actor);
  else if (actor.role === 'admin') entityId = input.entityId ?? null;
  else throw new AppError('Acesso negado', 403, 'forbidden');

  const family = await prisma.family.create({
    data: {
      responsibleName: input.responsibleName,
      displayName: input.displayName,
      entityId,
      city: input.city,
      state: input.state.toUpperCase(),
      neighborhood: input.neighborhood,
      community: input.community,
      approximateAddress: input.approximateAddress,
      latitude: input.latitude,
      longitude: input.longitude,
      cpfMasked: maskTail(input.cpf),
      nisMasked: maskTail(input.nis),
      preferredGiftCardProvider: input.preferredGiftCardProvider,
      socialDescription: input.socialDescription,
      verificationStatus: 'manual',
      approvalStatus: 'pending',
      dataSource: 'manual',
      dependents: {
        create: input.dependents.map((d) => ({
          name: d.name,
          age: d.age,
          relationship: d.relationship,
          isEligibleMinor: d.age >= 0 && d.age <= 17,
        })),
      },
    },
    include: familyInclude,
  });

  await createAuditLog({
    actorUserId: actor.userId,
    action: 'create_family',
    entityType: 'family',
    entityId: family.id,
    metadata: { entityId, dependents: input.dependents.length },
  });

  return family;
}

/** Lista respeitando o papel: admin (todas), entity (suas), demais (só aprovadas). */
export async function listFamiliesForActor(actor: Actor, filters: ListFamiliesQuery) {
  const state = filters.state?.toUpperCase();
  if (actor.role === 'admin') {
    return prisma.family.findMany({
      where: { approvalStatus: filters.approvalStatus, state },
      include: familyInclude,
      orderBy: { createdAt: 'desc' },
    });
  }
  if (actor.role === 'entity') {
    const entityId = await resolveActorEntityId(actor);
    return prisma.family.findMany({
      where: { entityId, approvalStatus: filters.approvalStatus, state },
      include: familyInclude,
      orderBy: { createdAt: 'desc' },
    });
  }
  return prisma.family.findMany({
    where: { approvalStatus: 'approved', state },
    include: familyInclude,
    orderBy: { createdAt: 'desc' },
  });
}

/** Leitura por id respeitando o papel; retorna a "view" adequada para serialização. */
export async function getFamilyForActor(actor: Actor, id: string) {
  const family = await prisma.family.findUnique({ where: { id }, include: familyInclude });
  if (!family) throw new AppError('Família não encontrada', 404, 'family_not_found');

  if (actor.role === 'admin') return { family, view: 'managed' as const };
  if (actor.role === 'entity') {
    const entityId = await resolveActorEntityId(actor);
    if (family.entityId !== entityId) throw new AppError('Acesso negado', 403, 'forbidden');
    return { family, view: 'managed' as const };
  }
  // doador/beneficiário só enxergam família aprovada (e sem PII)
  if (family.approvalStatus !== 'approved') {
    throw new AppError('Família não encontrada', 404, 'family_not_found');
  }
  return { family, view: 'donor' as const };
}

export async function updateFamily(actor: Actor, id: string, input: UpdateFamilyInput) {
  await loadOwnedFamily(actor, id);
  const family = await prisma.family.update({
    where: { id },
    data: { ...input, state: input.state?.toUpperCase() },
    include: familyInclude,
  });
  await createAuditLog({
    actorUserId: actor.userId,
    action: 'update_family',
    entityType: 'family',
    entityId: id,
  });
  return family;
}

async function loadFamilyOr404(id: string) {
  const family = await prisma.family.findUnique({ where: { id }, include: familyInclude });
  if (!family) throw new AppError('Família não encontrada', 404, 'family_not_found');
  return family;
}

/**
 * Aprova a família. REGRA CRÍTICA: só aprova se houver ao menos um dependente
 * elegível (0–17). NIS/CadÚnico não aprova sozinho — aprovação é sempre manual.
 */
export async function approveFamily(actor: Actor, id: string) {
  const family = await loadFamilyOr404(id);
  const hasEligibleMinor = family.dependents.some((d) => d.isEligibleMinor);
  if (!hasEligibleMinor) {
    throw new AppError(
      'Família precisa de ao menos um dependente de 0 a 17 anos para ser aprovada',
      422,
      'no_eligible_minor',
    );
  }
  const updated = await prisma.family.update({
    where: { id },
    data: { approvalStatus: 'approved' },
    include: familyInclude,
  });
  await createAuditLog({ actorUserId: actor.userId, action: 'approve_family', entityType: 'family', entityId: id });
  return updated;
}

export async function rejectFamily(actor: Actor, id: string, reason?: string) {
  await loadFamilyOr404(id);
  const updated = await prisma.family.update({
    where: { id },
    data: { approvalStatus: 'rejected' },
    include: familyInclude,
  });
  await createAuditLog({ actorUserId: actor.userId, action: 'reject_family', entityType: 'family', entityId: id, metadata: reason ? { reason } : undefined });
  return updated;
}

export async function blockFamily(actor: Actor, id: string, reason?: string) {
  await loadFamilyOr404(id);
  const updated = await prisma.family.update({
    where: { id },
    data: { approvalStatus: 'blocked' },
    include: familyInclude,
  });
  await createAuditLog({ actorUserId: actor.userId, action: 'block_family', entityType: 'family', entityId: id, metadata: reason ? { reason } : undefined });
  return updated;
}

/** Mapa público: só famílias aprovadas e com localização. Serializado p/ doador. */
export async function getMapFamilies(filters: { state?: string }) {
  return prisma.family.findMany({
    where: {
      approvalStatus: 'approved',
      latitude: { not: null },
      longitude: { not: null },
      state: filters.state?.toUpperCase(),
    },
    include: familyInclude,
    orderBy: { createdAt: 'desc' },
  });
}
