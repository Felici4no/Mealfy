import { Family } from '../types';
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
    await randomDelay(400, 1000);
    familyService.initDB();
    return storage.get<Family[]>(FAMILIES_KEY, mockFamilies);
  },

  getFamiliesByCommunity: async (communityId: string): Promise<Family[]> => {
    await randomDelay(300, 700);
    const families = storage.get<Family[]>(FAMILIES_KEY, mockFamilies);
    return families.filter(f => f.communityId === communityId);
  },

  updateFamilyStatus: async (familyId: string, newStatus: 'needs_help' | 'supported'): Promise<Family> => {
    await randomDelay(300, 500);
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
