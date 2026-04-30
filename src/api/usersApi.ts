import { apiRequest } from './apiClient';

export const usersApi = {
  updateImpactPreferences: (preferences: any) => apiRequest('/auth/me/preferences', 'PATCH', preferences),
};
