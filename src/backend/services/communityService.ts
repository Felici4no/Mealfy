import { Community } from '../types';
import { mockCommunities } from '../mockData/communities';
import { storage } from '../utils/storage';
import { randomDelay } from '../utils/delay';

const COMMUNITIES_KEY = 'communities_db';

export const communityService = {
  initDB: () => {
    if (!storage.get(COMMUNITIES_KEY, null)) {
      storage.set(COMMUNITIES_KEY, mockCommunities);
    }
  },

  getCommunities: async (): Promise<Community[]> => {
    await randomDelay(300, 800);
    communityService.initDB();
    return storage.get<Community[]>(COMMUNITIES_KEY, mockCommunities);
  },

  getCommunityById: async (id: string): Promise<Community | undefined> => {
    await randomDelay(200, 500);
    const communities = storage.get<Community[]>(COMMUNITIES_KEY, mockCommunities);
    return communities.find(c => c.id === id);
  }
};
