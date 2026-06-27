import { apiRequest } from './apiClient';

export const familiesApi = {
  getMapFamilies: (filters?: { state?: string }) => {
    const qs = filters?.state ? `?state=${encodeURIComponent(filters.state)}` : '';
    return apiRequest(`/families/map${qs}`, 'GET');
  },
  getFamilyById: (id: string) => apiRequest(`/families/${id}`, 'GET'),

  /**
   * @deprecated Path não existe no backend (fora do escopo da Fase 6B —
   * usado só por familyService.getFamilies/getFamiliesByCommunity, que ainda
   * não foram conectados). Mantido para não quebrar esses fluxos; sempre
   * cai no fallback mock local.
   */
  getPublicFamilies: (filters?: { region?: string; communityId?: string }) => {
    let query = '';
    if (filters?.region) query += `region=${encodeURIComponent(filters.region)}&`;
    if (filters?.communityId) query += `communityId=${encodeURIComponent(filters.communityId)}&`;
    return apiRequest(`/families/public${query ? '?' + query : ''}`, 'GET');
  },
};
