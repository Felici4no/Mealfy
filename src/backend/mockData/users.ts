import type { User, AuthorizingEntity } from '../types';

// ──────────────────────────────────────────────────────────────────────────────
// Senha centralizada — exclusivamente para o ambiente de demonstração (mock).
// Nunca expor em componentes de UI nem em mealfy_current_user.
// ──────────────────────────────────────────────────────────────────────────────
export const MOCK_PASSWORD = '123456';

// Identidades públicas dos usuários de demonstração.
// O tipo User não contém senha.
export const mockUsers: User[] = [
  {
    id: 'u-12345',
    name: 'Alexandre Doador',
    email: 'doador@mealfy.com',
    role: 'donor',
    phone: '+5511999998888',
    avatar: 'A',
    totalDonated: 130,
    rankingPosition: 142,
    rankingPercentile: 'Top 5%',
    favoriteCommunityId: 'c1',
    status: 'active',
    privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false },
  },
  {
    id: 'u-entity-1',
    name: 'Maria Silva',
    email: 'entidade@mealfy.com',
    role: 'entity',
    phone: '+5511988887777',
    avatar: 'M',
    totalDonated: 0,
    rankingPosition: 0,
    rankingPercentile: '',
    entityId: 'e-esperanca',
    status: 'active',
  },
  {
    id: 'u-beneficiary-1',
    name: 'João Beneficiário',
    email: 'beneficiario@mealfy.com',
    role: 'beneficiary',
    phone: '+5511977776666',
    avatar: 'J',
    totalDonated: 0,
    rankingPosition: 0,
    rankingPercentile: '',
    status: 'active',
  },
];

// Credenciais separadas das identidades.
// Usadas apenas pelo MockAuthProvider — nunca por componentes ou contexto.
export interface MockUserCredential {
  userId: string;
  email: string;
  password: string;
}

export const mockCredentials: MockUserCredential[] = [
  { userId: 'u-12345',        email: 'doador@mealfy.com',       password: MOCK_PASSWORD },
  { userId: 'u-entity-1',     email: 'entidade@mealfy.com',     password: MOCK_PASSWORD },
  { userId: 'u-beneficiary-1',email: 'beneficiario@mealfy.com', password: MOCK_PASSWORD },
];

// Entidades de demonstração (não mudam)
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
    createdAt: new Date().toISOString(),
  },
];
