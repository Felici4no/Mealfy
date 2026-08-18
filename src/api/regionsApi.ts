import { apiRequest } from './apiClient';

/**
 * Região onde a rede atua — um município do IBGE com famílias cadastradas.
 *
 * Substitui a lista de 4 comunidades fixas no código do app, que não conversava
 * com os dados reais: Maré tinha família e não estava na lista; São Miguel
 * Paulista estava na lista e não tinha família nenhuma.
 */
export interface Region {
  id: string;
  ibgeCode: number;
  name: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  /** Famílias aprovadas na região — o alcance da rede ali. */
  familiesTotal: number;
  /** Famílias que pediram apoio no ciclo de hoje — quem precisa agora. */
  familiesInNeed: number;
}

export const regionsApi = {
  /** Regiões com famílias, ordenadas por quem tem mais gente pedindo hoje. */
  getRegions: () => apiRequest<{ regions: Region[] }>('/regions', 'GET'),

  /** Busca de município (cadastro de família). Aceita nome com ou sem acento. */
  searchRegions: (q: string, state?: string) =>
    apiRequest<{ regions: { id: string; ibgeCode: number; name: string; state: string }[] }>(
      `/regions/search?q=${encodeURIComponent(q)}${state ? `&state=${state}` : ''}`,
      'GET',
    ),
};
