import type { Family, DonorIndication } from '../types';
import { mockFamilies } from '../mockData/families';
import { storage } from '../utils/storage';
import { randomDelay } from '../utils/delay';
import { normalizeString } from '../utils/normalizeUtils';

import { familiesApi } from '../../api/familiesApi';
import { indicationsApi } from '../../api/indicationsApi';

const FAMILIES_KEY = 'families_db';
const INDICATIONS_KEY = 'donor_indications_db';

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

  addIndication: async (data: Omit<DonorIndication, 'id' | 'status' | 'createdAt'>): Promise<DonorIndication> => {
    try {
      const newIndication = await indicationsApi.createIndication(data);
      if (newIndication) return newIndication;
    } catch (e) {
      console.warn('Backend Add Indication failed, falling back to local mock.', e);
    }

    await randomDelay(500, 1000);
    const indications = storage.get<DonorIndication[]>(INDICATIONS_KEY, []);
    
    const newIndication: DonorIndication = {
      ...data,
      id: `ind-${Date.now()}`,
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

  convertIndicationToFamily: async (indicationId: string, user: any, sourceLabel: string): Promise<Family> => {
    try {
      const newFamily = await indicationsApi.convertIndication(indicationId);
      if (newFamily) return newFamily;
    } catch (e) {
      console.warn('Backend Convert Indication failed, falling back to local mock.', e);
    }

    await randomDelay(800, 1500);
    
    // 1. Validar se a indicação existe e não foi convertida
    const indications = storage.get<DonorIndication[]>(INDICATIONS_KEY, []);
    const indicationIdx = indications.findIndex(i => i.id === indicationId);
    
    if (indicationIdx === -1) {
      throw new Error('Indicação não encontrada.');
    }

    if (indications[indicationIdx].status === 'converted') {
      throw new Error('Esta indicação já foi convertida em beneficiário oficial.');
    }

    // 2. Validar permissões da entidade (status approved)
    if (user.role === 'entity' && user.status !== 'approved') {
      throw new Error('Sua entidade ainda está pendente de aprovação. Somente entidades aprovadas podem validar famílias.');
    }

    // 3. Validar região compatível (se for entidade)
    if (user.role === 'entity') {
      const entities = storage.get<any[]>('entities_db', []);
      const entityData = entities.find(e => e.id === user.entityId);
      
      const indRegion = normalizeString(indications[indicationIdx].region);
      const entityRegion = normalizeString(entityData?.region?.split('-')[0]);

      if (!indRegion.includes(entityRegion) && !entityRegion.includes(indRegion)) {
        throw new Error(`Esta indicação está fora da sua região de atuação (${entityData?.region}).`);
      }
    }

    // 4. Criar a Família
    const families = storage.get<Family[]>(FAMILIES_KEY, mockFamilies);
    const newFamily: Family = {
      id: `f-conv-${Date.now()}`,
      representativeName: indications[indicationIdx].representativeName,
      neighborhood: indications[indicationIdx].region,
      city: 'São Paulo',
      state: 'SP',
      communityId: 'c1',
      shortAddress: indications[indicationIdx].region,
      description: indications[indicationIdx].observation,
      childrenCount: indications[indicationIdx].childrenCount,
      children: [],
      mainNeed: 'Alimentação Básica',
      status: 'approved',
      supportStatus: 'needs_help',
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
