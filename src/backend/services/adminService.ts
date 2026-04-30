import { adminApi } from '../../api/adminApi';
import { randomDelay } from '../utils/delay';

export const adminService = {
  getPendingEntities: async () => {
    try {
      const response = await adminApi.getPendingEntities();
      if (response) return response;
    } catch (e) {
      console.warn('Backend Admin failed, falling back to local mock.', e);
    }
    
    await randomDelay(300, 600);
    const users = JSON.parse(localStorage.getItem('users_db') || '[]');
    return users.filter((u: any) => u.role === 'entity' && u.status === 'pending');
  },

  approveEntity: async (userId: string) => {
    try {
      await adminApi.approveEntity(userId);
      return true;
    } catch (e) {
      console.warn('Backend Approve failed, falling back to local mock.', e);
    }

    await randomDelay(500, 800);
    const USERS_KEY = 'users_db';
    const ENTITIES_KEY = 'entities_db';
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const entities = JSON.parse(localStorage.getItem(ENTITIES_KEY) || '[]');
    
    const uIdx = users.findIndex((u: any) => u.id === userId);
    if (uIdx !== -1) {
      users[uIdx].status = 'approved';
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      const eIdx = entities.findIndex((e: any) => e.id === users[uIdx].entityId);
      if (eIdx !== -1) {
        entities[eIdx].status = 'approved';
        localStorage.setItem(ENTITIES_KEY, JSON.stringify(entities));
      }
    }
    return true;
  },

  rejectEntity: async (userId: string) => {
    try {
      await adminApi.rejectEntity(userId);
      return true;
    } catch (e) {
      console.warn('Backend Reject failed, falling back to local mock.', e);
    }

    await randomDelay(500, 800);
    const USERS_KEY = 'users_db';
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const uIdx = users.findIndex((u: any) => u.id === userId);
    if (uIdx !== -1) {
      users[uIdx].status = 'rejected';
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return true;
  }
};
