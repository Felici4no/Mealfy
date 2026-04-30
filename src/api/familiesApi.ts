import { apiRequest } from './apiClient';

export const familiesApi = {
  getPublicFamilies: () => apiRequest('/families/public', 'GET'),
  getFamilyById: (id: string) => apiRequest(`/families/${id}`, 'GET'),
  createFamily: (data: any) => apiRequest('/families', 'POST', data),
  updateFamilyStatus: (id: string, data: any) => apiRequest(`/families/${id}/status`, 'PATCH', data),
};
