import { apiRequest } from './apiClient';

export const donationsApi = {
  createDonation: (data: any) => apiRequest('/donations', 'POST', data),
  createBatchDonation: (familyIds: string[]) => apiRequest('/donations/batch', 'POST', { familyIds }),
  createRegionalDonation: (communityId: string, totalAmount: number) => apiRequest('/donations/regional', 'POST', { communityId, totalAmount }),
  getMyDonations: () => apiRequest('/donations/me', 'GET'),
};
