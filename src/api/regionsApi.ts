import { apiRequest } from './apiClient';

export interface Region {
  id: string;
  name: string;
  city: string;
  state: string;
  familiesCount: number;
  urgentCount: number;
}

export const regionsApi = {
  getRegions: () => apiRequest('/regions', 'GET'),
};
