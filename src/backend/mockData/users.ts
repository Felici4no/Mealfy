import { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u-12345',
    name: 'Alexandre Doador',
    email: 'alexandre@example.com',
    phone: '+5511999998888',
    avatar: 'A',
    totalDonated: 130, // matches previous default
    rankingPosition: 142,
    rankingPercentile: 'Top 5%',
    favoriteCommunityId: 'c1'
  }
];
