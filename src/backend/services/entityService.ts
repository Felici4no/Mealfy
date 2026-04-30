import type { AuthorizingEntity } from '../types';
import { storage } from '../utils/storage';
import { randomDelay } from '../utils/delay';

const ENTITIES_KEY = 'entities_db';

export const entityService = {
  getEntities: async (): Promise<AuthorizingEntity[]> => {
    await randomDelay();
    return storage.get<AuthorizingEntity[]>(ENTITIES_KEY, [
      {
        id: 'ent-1',
        name: 'ONG Alimento para Todos',
        cnpj: '12.345.678/0001-99',
        type: 'ONG',
        status: 'approved',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ent-2',
        name: 'Igreja da Comunidade',
        cnpj: '98.765.432/0001-00',
        type: 'igreja',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ]);
  },

  getEntityById: async (id: string): Promise<AuthorizingEntity | null> => {
    const all = await entityService.getEntities();
    return all.find(e => e.id === id) || null;
  },

  registerEntity: async (data: Omit<AuthorizingEntity, 'id' | 'status' | 'createdAt'>): Promise<AuthorizingEntity> => {
    await randomDelay(500, 1000);
    const entities = await entityService.getEntities();
    const newEntity: AuthorizingEntity = {
      ...data,
      id: `ent-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    entities.push(newEntity);
    storage.set(ENTITIES_KEY, entities);
    return newEntity;
  }
};
