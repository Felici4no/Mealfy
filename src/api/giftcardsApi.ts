import { apiRequest } from './apiClient';

// ──────────────────────────────────────────────────────────────────────────────
// Contrato REAL do backend (backend/src/modules/beneficiary):
//   GET /beneficiary/gift-cards       → vales do beneficiário (código DECIFRADO)
//   GET /beneficiary/gift-cards/:id   → um vale específico
// Apenas role beneficiary (doador/admin → 403). O doador NUNCA vê o código.
// ──────────────────────────────────────────────────────────────────────────────

export const beneficiaryApi = {
  /** Vales do beneficiário autenticado (código completo, só no endpoint dele). */
  getMyGiftCards: () => apiRequest('/beneficiary/gift-cards', 'GET'),
  /** Um vale específico do beneficiário autenticado. */
  getMyGiftCard: (id: string) => apiRequest(`/beneficiary/gift-cards/${id}`, 'GET'),
};

/** @deprecated Use beneficiaryApi. Mantido para não quebrar imports antigos. */
export const giftcardsApi = {
  getMyGiftCards: () => apiRequest('/beneficiary/gift-cards', 'GET'),
};
