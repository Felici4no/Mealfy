import { apiRequest } from './apiClient';

export const usersApi = {
  updateImpactPreferences: (preferences: any) => apiRequest('/auth/me/preferences', 'PATCH', preferences),
  updatePrivacy: (settings: { showOnRanking?: boolean; showInstagram?: boolean; anonymousMode?: boolean }) =>
    apiRequest('/me/privacy', 'PATCH', settings),
};
