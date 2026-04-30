import { apiRequest } from './apiClient';

export const donationsApi = {
  createDonation: (data: any) => apiRequest('/donations', 'POST', data),
  createBatchDonation: (familyIds: string[]) => apiRequest('/donations/batch', 'POST', { familyIds }),
  getMyDonations: () => apiRequest('/donations/me', 'GET'),
};
