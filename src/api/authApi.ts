import { apiRequest } from './apiClient';

export interface BackendPublicUser {
  id: string;
  name: string;
  email: string;
  role: 'donor' | 'entity' | 'beneficiary' | 'admin';
  avatarUrl: string | null;
  instagram: string | null;
  phone: string | null;
  status: 'active' | 'pending' | 'suspended' | 'blocked';
  createdAt: string;
}

export interface AuthResponse {
  user: BackendPublicUser;
  token: string;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; role: 'donor' | 'entity' }) =>
    apiRequest<AuthResponse>('/auth/register', 'POST', data),

  login: (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/login', 'POST', { email, password }),

  getMe: () => apiRequest<{ user: BackendPublicUser }>('/me', 'GET'),
};
