import type { Family, DonorIndication } from '../types';
import { mockFamilies } from '../mockData/families';
import { storage } from '../utils/storage';
import { randomDelay } from '../utils/delay';
import { normalizeString } from '../utils/normalizeUtils';

const FAMILIES_KEY = 'families_db';
const INDICATIONS_KEY = 'indications_db';

export const familyService = {
  initDB: () => {
    const existing = storage.get<Family[]>(FAMILIES_KEY, null as any);
    // If DB is empty OR the first family is missing the latitude property (meaning it's the old schema)
    if (!existing || (existing.length > 0 && existing[0].latitude === undefined)) {
      storage.set(FAMILIES_KEY, mockFamilies);
    }
  },

  getFamilies: async (): Promise<Family[]> => {
    await randomDelay();
    familyService.initDB();
    return storage.get<Family[]>(FAMILIES_KEY, mockFamilies);
  },

  getFamiliesByCommunity: async (communityId: string): Promise<Family[]> => {
    await randomDelay();
    const families = storage.get<Family[]>(FAMILIES_KEY, mockFamilies);
    return families.filter(f => f.communityId === communityId);
  },

  updateFamilyStatus: async (familyId: string, newStatus: 'needs_help' | 'supported'): Promise<Family> => {
    await randomDelay(200, 400); 
    const families = storage.get<Family[]>(FAMILIES_KEY, mockFamilies);
    const idx = families.findIndex(f => f.id === familyId);
    if (idx !== -1) {
      families[idx].supportStatus = newStatus;
      storage.set(FAMILIES_KEY, families);
      return families[idx];
    }
    throw new Error('Family not found');
  },

  addFamily: async (familyData: Omit<Family, 'id'>): Promise<Family> => {
    await randomDelay(300, 600);
    const families = storage.get<Family[]>(FAMILIES_KEY, mockFamilies);
    
    const newFamily: Family = {
      ...familyData,
      id: `f-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    
    families.unshift(newFamily); // Add to the beginning
    storage.set(FAMILIES_KEY, families);
    return newFamily;
  },

  addIndication: async (indicationData: Omit<DonorIndication, 'id' | 'status' | 'createdAt'>): Promise<DonorIndication> => {
    await randomDelay(300, 600);
    const indications = storage.get<DonorIndication[]>(INDICATIONS_KEY, []);
    
    const newIndication: DonorIndication = {
      ...indicationData,
      id: `ind-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    indications.unshift(newIndication);
    storage.set(INDICATIONS_KEY, indications);
    return newIndication;
  },

  getIndications: async (): Promise<DonorIndication[]> => {
    await randomDelay(200, 400);
    return storage.get<DonorIndication[]>(INDICATIONS_KEY, []);
  },

  updateIndicationStatus: async (id: string, status: 'pending' | 'approved' | 'rejected' | 'converted'): Promise<DonorIndication> => {
    await randomDelay(300, 500);
    const indications = storage.get<DonorIndication[]>(INDICATIONS_KEY, []);
    const idx = indications.findIndex(i => i.id === id);
    if (idx !== -1) {
      indications[idx].status = status;
      storage.set(INDICATIONS_KEY, indications);
      return indications[idx];
    }
    throw new Error('Indicação não encontrada');
  },

  convertIndicationToFamily: async (indicationId: string, user: any, sourceLabel: string, entityId?: string): Promise<Family> => {
    await randomDelay(500, 800);
    const indications = storage.get<DonorIndication[]>(INDICATIONS_KEY, []);
    const idx = indications.findIndex(i => i.id === indicationId);
    
    if (idx === -1) throw new Error('Indicação não encontrada');
    const indication = indications[idx];

    // Proteção 1: Evitar conversão duplicada
    if (indication.status === 'converted') {
      throw new Error('Esta indicação já foi convertida em família.');
    }

    // Proteção 2: Impedir entidade pending de converter
    if (user?.role === 'entity' && (user?.status === 'pending' || user?.status === 'rejected')) {
      throw new Error('Entidades em análise ou rejeitadas não podem converter indicações.');
    }

    // Proteção 3: Validar região (exceto admin)
    if (user?.role !== 'admin') {
      // Pega a entidade para validar a região real dela
      const entities = storage.get<any[]>('entities_db', []);
      const entityData = entities.find(e => e.id === user?.entityId);
      
      const indRegion = normalizeString(indication.region);
      // Extrai apenas a cidade principal se houver formato "Cidade - UF"
      const entityRegion = normalizeString(entityData?.region?.split('-')[0]);

      if (!indRegion.includes(entityRegion) && !entityRegion.includes(indRegion)) {
        throw new Error('Você não pode converter uma indicação fora da sua região de atuação.');
      }
    }

    // Cria a família a partir da indicação
    const newFamilyData: Omit<Family, 'id'> = {
      communityId: 'c1', // Mock genérico
      representativeName: indication.representativeName,
      neighborhood: indication.region,
      city: 'São Paulo', // Mock genérico
      state: 'SP', // Mock genérico
      shortAddress: indication.region,
      description: indication.observation,
      childrenCount: indication.childrenCount,
      children: Array.from({ length: indication.childrenCount }).map((_, i) => ({
        id: `c-ind-${i}`,
        name: `Criança ${i+1}`,
        age: 5,
        school: 'Escola Local'
      })),
      mainNeed: 'Alimentação Básica',
      supportStatus: 'needs_help',
      distanceToUser: '2.5 km',
      priorityLevel: 3,
      latitude: -23.612 + (Math.random() * 0.05),
      longitude: -46.593 + (Math.random() * 0.05),
      authorizingEntityId: entityId,
      createdByEntityId: entityId,
      sourceType: 'entity',
      sourceLabel: sourceLabel,
      sourceEntityName: user?.name,
      originalIndicationId: indication.id,
      status: 'approved'
    };

    const families = storage.get<Family[]>(FAMILIES_KEY, mockFamilies);
    const newFamily: Family = {
      ...newFamilyData,
      id: `f-conv-${Date.now()}`
    };
    
    families.unshift(newFamily);
    storage.set(FAMILIES_KEY, families);

    // Marca a indicação como convertida
    indications[idx].status = 'converted';
    storage.set(INDICATIONS_KEY, indications);

    return newFamily;
  }
};
