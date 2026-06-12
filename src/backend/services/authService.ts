import type { User, UserRole, AuthorizingEntity } from '../types';
import { mockAuthProvider, AuthError, type RegisterData } from './authProvider';
import { mockEntities } from '../mockData/users';
import { storage } from '../utils/storage';
import { randomDelay } from '../utils/delay';
import { authApi } from '../../api/authApi';
import { handleApiError } from '../utils/fallback';

// Re-exporta para uso pelos consumidores
export { AuthError, type AuthErrorCode } from './authProvider';

const SESSION_KEY = 'current_user';
const ENTITIES_KEY = 'entities_db';

export const authService = {
  // ─── Novos métodos reais (delegam ao MockAuthProvider) ───────────────────

  /**
   * Autenticação por e-mail e senha.
   * Busca credenciais mockadas + registros locais. Nunca retorna senha no User.
   */
  signInWithEmail: (email: string, password: string): Promise<User> =>
    mockAuthProvider.signInWithEmail(email, password),

  /**
   * Login com Google (simulado em DEV).
   * Recebe o usuário selecionado no modal — não chama OAuth real.
   */
  signInWithGoogle: (selectedUser: User): Promise<User> =>
    mockAuthProvider.signInWithGoogle(selectedUser),

  /**
   * Retorna usuários mockados ativos para o seletor Google (DEV).
   * Somente role !== 'admin' e status === 'active'.
   */
  getActiveMockUsers: (): User[] => mockAuthProvider.getActiveMockUsers(),

  /**
   * Recuperação de senha (mock).
   * Sempre resolve — nunca revela se o e-mail existe.
   */
  resetPassword: (email: string): Promise<void> =>
    mockAuthProvider.resetPassword(email),

  /**
   * Cadastro de novo usuário.
   * Salva perfil e credencial em chaves separadas do localStorage.
   */
  registerUser: (data: RegisterData): Promise<User> =>
    mockAuthProvider.registerUser(data),

  // ─── Recuperação de sessão ─────────────────────────────────────────────────

  getCurrentSession: (): Promise<User | null> =>
    mockAuthProvider.getCurrentUser(),

  logout: async (): Promise<void> => {
    await mockAuthProvider.signOut();
  },

  // ─── Métodos legados — mantidos para compatibilidade com Register.tsx ──────

  /**
   * @deprecated Usado somente por fluxos legados (Register.tsx).
   * Não utilizar em novas telas. Migrar para registerUser() quando possível.
   */
  registerDonor: async (data: Partial<User>): Promise<User> => {
    try {
      const newUser = await authApi.registerDonor(data);
      if (newUser) {
        storage.set(SESSION_KEY, newUser);
        return newUser;
      }
    } catch (e) {
      handleApiError(e, 'Register Donor');
    }

    return mockAuthProvider.registerUser({
      name: data.name || 'Doador',
      email: data.email || '',
      password: '123456', // senha padrão mock
      role: 'donor',
      phone: data.phone,
    });
  },

  /**
   * @deprecated Usado somente por fluxos legados (Register.tsx).
   * Não utilizar em novas telas. Migrar para registerUser() quando possível.
   */
  registerEntity: async (data: Partial<AuthorizingEntity>): Promise<User> => {
    try {
      const newUser = await authApi.registerEntity({
        ...data,
        cnpj: data.cnpj,
        region: data.region,
        type: data.type,
      });
      if (newUser) {
        storage.set(SESSION_KEY, newUser);
        return newUser;
      }
    } catch (e) {
      handleApiError(e, 'Register Entity');
    }

    await randomDelay(800, 1200);

    // Cria entidade no storage para o dashboard
    const entities = storage.get<AuthorizingEntity[]>(ENTITIES_KEY, mockEntities);
    const newEntity: AuthorizingEntity = {
      id: `e-${Date.now()}`,
      name: data.name || 'Nova Entidade',
      cnpj: data.cnpj || '',
      type: data.type || 'ONG',
      responsibleName: data.responsibleName || '',
      email: data.email || '',
      phone: data.phone || '',
      region: data.region || '',
      addressOrDistrict: data.addressOrDistrict,
      websiteOrInstagram: data.websiteOrInstagram,
      shortDescription: data.shortDescription,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    entities.push(newEntity);
    storage.set(ENTITIES_KEY, entities);

    const newUser = await mockAuthProvider.registerUser({
      name: data.responsibleName || data.name || 'Entidade',
      email: data.email || '',
      password: '123456',
      role: 'entity',
      phone: data.phone,
    });

    // Atualiza entityId no usuário registrado
    const registered = storage.get<User[]>('registered_users', []);
    const idx = registered.findIndex((u) => u.id === newUser.id);
    if (idx !== -1) {
      registered[idx] = { ...registered[idx], entityId: newEntity.id };
      storage.set('registered_users', registered);
    }

    return { ...newUser, entityId: newEntity.id };
  },

  /**
   * @deprecated Não utilizar em novas telas.
   * loginAsRole permitia entrar escolhendo a role manualmente — porta lateral removida da UI.
   */
  loginAsRole: async (_role: UserRole, _identifier: string): Promise<User> => {
    // Bloqueado intencionalmente — a nova UI não deve chamar este método.
    // Mantido somente para não quebrar imports enquanto a migração é finalizada.
    throw new AuthError(
      'provider_unavailable',
      '[loginAsRole] Método legado desativado. Use signInWithEmail().'
    );
  },

  /**
   * @deprecated Não utilizar em novas telas.
   */
  loginWithGoogle: async (_role: UserRole): Promise<User> => {
    throw new AuthError(
      'provider_unavailable',
      '[loginWithGoogle] Método legado desativado. Use signInWithGoogle().'
    );
  },

  fetchSession: async (): Promise<User | null> => {
    return mockAuthProvider.getCurrentUser();
  },
};
