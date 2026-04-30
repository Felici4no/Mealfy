import type { DonorIndication } from '../types';
import { storage } from '../utils/storage';
import { randomDelay } from '../utils/delay';

const INDICATIONS_KEY = 'indications_db';

export const donorIndicationService = {
  createIndication: async (data: Omit<DonorIndication, 'id' | 'status' | 'createdAt'>): Promise<DonorIndication> => {
    await randomDelay(400, 800);
    const indications = storage.get<DonorIndication[]>(INDICATIONS_KEY, []);
    const newIndication: DonorIndication = {
      ...data,
      id: `ind-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    indications.push(newIndication);
    storage.set(INDICATIONS_KEY, indications);
    return newIndication;
  },

  getIndicationsByUser: async (userId: string): Promise<DonorIndication[]> => {
    await randomDelay(300, 500);
    const indications = storage.get<DonorIndication[]>(INDICATIONS_KEY, []);
    return indications.filter(i => i.indicatedByUserId === userId);
  }
};
