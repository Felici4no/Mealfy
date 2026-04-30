import { MockDatabase } from '../../database/mock-db';
import { User } from '../../shared/types';

export class RankingService {
  static async getGlobalRanking(): Promise<any[]> {
    const users = await MockDatabase.read<User>('users');
    
    // Only donors who want to show on ranking
    const ranking = users
      .filter(u => u.role === 'donor' && u.privacySettings?.showOnRanking !== false)
      .map(u => {
        if (u.privacySettings?.anonymousMode) {
          return {
            id: u.id,
            name: 'Doador Anônimo',
            avatar: '👤',
            totalDonated: u.totalDonated,
            isAnonymous: true
          };
        }

        return {
          id: u.id,
          name: u.name,
          totalDonated: u.totalDonated,
          instagram: u.privacySettings?.showInstagram ? u.email : undefined, // Using email as mock instagram link
          isAnonymous: false
        };
      })
      .sort((a, b) => b.totalDonated - a.totalDonated);

    return ranking;
  }
}
