import { apiRequest } from './apiClient';

export const authApi = {
  registerDonor: (data: any) => apiRequest('/auth/register/donor', 'POST', data),
  registerEntity: (data: any) => apiRequest('/auth/register/entity', 'POST', data),
  loginMock: (email: string) => apiRequest('/auth/login/mock', 'POST', { email, password: 'mock-password' }),
  getMe: () => apiRequest('/auth/me', 'GET'),
};
