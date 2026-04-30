import { apiRequest } from './apiClient';

export const giftcardsApi = {
  getMyGiftCards: () => apiRequest('/donations/me', 'GET'), // Backend returns history with giftcards
};
