import { User } from '../types';
import { storage } from '../utils/storage';
import { randomDelay } from '../utils/delay';

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
  }
};
