import type { Family, FamilyDependent } from '@prisma/client';

export type FamilyWithDependents = Family & { dependents: FamilyDependent[] };

const effectiveProvider = (f: Family) => f.todayRequestedProvider ?? f.preferredGiftCardProvider ?? null;
const eligibleMinors = (deps: FamilyDependent[]) => deps.filter((d) => d.isEligibleMinor).length;

/**
 * Visão do DOADOR / mapa público.
 * NUNCA inclui CPF/NIS, endereço completo, nomes de dependentes ou vínculo de entidade.
 * Apenas dados seguros e o suficiente para o impacto.
 */
export function toDonorFamily(f: FamilyWithDependents) {
  return {
    id: f.id,
    displayName: f.displayName,
    city: f.city,
    state: f.state,
    neighborhood: f.neighborhood,
    community: f.community,
    approximateAddress: f.approximateAddress,
    latitude: f.latitude,
    longitude: f.longitude,
    supportStatus: f.supportStatus,
    requestedProvider: effectiveProvider(f),
    childrenCount: eligibleMinors(f.dependents),
    socialDescription: f.socialDescription,
    needToday: f.needToday,
    lastFedAt: f.lastFedAt,
    lastGiftCardProvider: f.lastGiftCardProvider,
    lastDonorName: f.lastDonorName,
    lastDonorInstagram: f.lastDonorInstagram,
  };
}

/**
 * Visão de ENTIDADE / ADMIN (gestão). CPF/NIS sempre mascarados; endereço
 * completo (criptografado) NUNCA é serializado. Inclui dependentes e status.
 */
export function toManagedFamily(f: FamilyWithDependents) {
  return {
    id: f.id,
    entityId: f.entityId,
    responsibleName: f.responsibleName,
    displayName: f.displayName,
    cpfMasked: f.cpfMasked,
    nisMasked: f.nisMasked,
    city: f.city,
    state: f.state,
    neighborhood: f.neighborhood,
    community: f.community,
    approximateAddress: f.approximateAddress,
    latitude: f.latitude,
    longitude: f.longitude,
    preferredGiftCardProvider: f.preferredGiftCardProvider,
    todayRequestedProvider: f.todayRequestedProvider,
    supportStatus: f.supportStatus,
    approvalStatus: f.approvalStatus,
    verificationStatus: f.verificationStatus,
    dataSource: f.dataSource,
    socialDescription: f.socialDescription,
    needToday: f.needToday,
    lastFedAt: f.lastFedAt,
    dependents: f.dependents.map((d) => ({
      id: d.id,
      name: d.name,
      age: d.age,
      relationship: d.relationship,
      isEligibleMinor: d.isEligibleMinor,
    })),
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  };
}
