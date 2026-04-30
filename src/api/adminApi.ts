import { apiRequest } from './apiClient';

export const adminApi = {
  getPendingEntities: () => apiRequest('/admin/entities/pending', 'GET'),
  approveEntity: (id: string) => apiRequest(`/admin/entities/${id}/approve`, 'PATCH'),
  rejectEntity: (id: string) => apiRequest(`/admin/entities/${id}/reject`, 'PATCH'),
};
