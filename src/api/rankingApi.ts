import { apiRequest } from './apiClient';

export const rankingApi = {
  getRanking: () => apiRequest('/ranking', 'GET'),
};
