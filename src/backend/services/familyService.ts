import type { Family, DonorIndication } from '../types';
import { mockFamilies } from '../mockData/families';
import { storage } from '../utils/storage';
import { randomDelay } from '../utils/delay';

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
  }
};
