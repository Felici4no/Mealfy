import type { User } from '../types';
import { mockUsers } from '../mockData/users';
import { storage } from '../utils/storage';
import { randomDelay } from '../utils/delay';

const SESSION_KEY = 'current_user';
const USERS_KEY = 'users_db';

export const authService = {
  // Initiates our DB in localStorage if it doesn't exist
  initDB: () => {
    const users = storage.get(USERS_KEY, null);
    if (!users) {
      storage.set(USERS_KEY, mockUsers);
    }
  },

  getCurrentSession: async (): Promise<User | null> => {
    await randomDelay(200, 500); // Simulate network load briefly
    return storage.get(SESSION_KEY, null);
  },

  loginWithGoogle: async (): Promise<User> => {
    await randomDelay(800, 1200);
    authService.initDB();
    const users = storage.get<User[]>(USERS_KEY, mockUsers);
    const user = users[0]; // Just picking the configured mock user
    storage.set(SESSION_KEY, user);
    return user;
  },

  loginWithApple: async (): Promise<User> => {
    return authService.loginWithGoogle();
  },

  loginWithPhone: async (phone: string): Promise<User> => {
    await randomDelay(800, 1500);
    authService.initDB();
    const users = storage.get<User[]>(USERS_KEY, mockUsers);
    const user = users[0]; // Picking the configured mock user
    user.phone = phone;
    storage.set(SESSION_KEY, user);
    return user;
  },

  logout: async (): Promise<void> => {
    await randomDelay(500, 1000);
    storage.remove(SESSION_KEY);
  }
};
