import type { User, AuthorizingEntity } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u-12345',
    name: 'Alexandre Doador',
    email: 'alexandre@example.com',
    role: 'donor',
    phone: '+5511999998888',
    avatar: 'A',
    totalDonated: 130, // matches previous default
    rankingPosition: 142,
    rankingPercentile: 'Top 5%',
    favoriteCommunityId: 'c1'
  }
];

export const mockEntities: AuthorizingEntity[] = [
  {
    id: 'e-esperanca',
    name: 'Instituto Esperança',
    cnpj: '00.000.000/0001-00',
    type: 'instituto',
    responsibleName: 'Maria Silva',
    email: 'contato@institutoesperanca.org',
    phone: '+5511988887777',
    region: 'São Paulo - SP',
    status: 'approved',
    createdAt: new Date().toISOString()
  }
];
