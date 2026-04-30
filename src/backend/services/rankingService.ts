import type { User } from '../types';
import { storage } from '../utils/storage';
import { randomDelay } from '../utils/delay';

import { rankingApi } from '../../api/rankingApi';

export const rankingService = {
  getUserRanking: async (userId: string): Promise<Pick<User, 'rankingPosition' | 'rankingPercentile' | 'totalDonated'>> => {
    await randomDelay(300, 600);
    const sessionUser = storage.get<User>('current_user', {} as User);
    if (sessionUser && sessionUser.id === userId) {
      // Dynamic ranking simulation based on totalDonated
      let position = 142;
      let percentile = 'Top 5%';
      
      if (sessionUser.totalDonated > 200) {
        position = 80;
        percentile = 'Top 2%';
      }
      if (sessionUser.totalDonated > 500) {
        position = 12;
        percentile = 'Top 1%';
      }

      return {
        rankingPosition: position,
        rankingPercentile: percentile,
        totalDonated: sessionUser.totalDonated
      };
    }
    
    return {
      rankingPosition: 0,
      rankingPercentile: '',
      totalDonated: 0
    };
  },

  getTopDonors: async (): Promise<Pick<User, 'id' | 'name' | 'totalDonated' | 'avatar' | 'instagram' | 'privacySettings'>[]> => {
    try {
      const apiRanking = await rankingApi.getRanking();
      if (apiRanking) return apiRanking;
    } catch (e) {
      console.warn('Backend Ranking failed, falling back to local mock.', e);
    }

    await randomDelay(300, 700);
    // In a real app, this would filter by privacySettings.showOnRanking
    return [
      { 
        id: 'u-1', 
        name: 'Marina R.', 
        totalDonated: 12500, 
        avatar: 'M', 
        instagram: '@marina.rm',
        privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false }
      },
      { 
        id: 'u-2', 
        name: 'Carlos S.', 
        totalDonated: 9400, 
        avatar: 'C', 
        instagram: '@csilva',
        privacySettings: { showOnRanking: true, showInstagram: false, anonymousMode: false }
      },
      { 
        id: 'u-3', 
        name: 'Doador Solidário', 
        totalDonated: 8200, 
        avatar: 'D', 
        privacySettings: { showOnRanking: true, showInstagram: false, anonymousMode: true }
      },
      { 
        id: 'u-4', 
        name: 'João H.', 
        totalDonated: 5100, 
        avatar: 'J', 
        instagram: '@joao_he',
        privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false }
      },
      { 
        id: 'u-5', 
        name: 'Alessandra M.', 
        totalDonated: 4050, 
        avatar: 'A', 
        instagram: '@ale_mm',
        privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false }
      },
    ];
  }
};
