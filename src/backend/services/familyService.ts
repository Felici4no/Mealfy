import type { Family } from '../types';
import { mockFamilies } from '../mockData/families';
import { storage } from '../utils/storage';
import { randomDelay } from '../utils/delay';

const FAMILIES_KEY = 'families_db';

export const familyService = {
  initDB: () => {
    if (!storage.get(FAMILIES_KEY, null)) {
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
  }
};
