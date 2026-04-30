import type { User, UserRole } from '../types';
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
    await randomDelay(200, 500);
    return storage.get(SESSION_KEY, null);
  },

  loginWithGoogle: async (role: UserRole = 'donor'): Promise<User> => {
    await randomDelay(800, 1200);
    authService.initDB();
    const users = storage.get<User[]>(USERS_KEY, mockUsers);
    // Find first user with that role or use mock
    const user = users.find(u => u.role === role) || {
      ...users[0],
      role: role,
      id: `u-${role}-${Date.now()}`
    };
    storage.set(SESSION_KEY, user);
    return user;
  },

  loginAsRole: async (role: UserRole, identifier: string): Promise<User> => {
    await randomDelay(800, 1500);
    authService.initDB();
    const users = storage.get<User[]>(USERS_KEY, mockUsers);
    
    // Simulate finding or creating
    let user = users.find(u => u.role === role && (u.email === identifier || u.phone === identifier));
    
    if (!user) {
      user = {
        id: `u-${role}-${Date.now()}`,
        name: identifier.split('@')[0] || identifier,
        email: identifier.includes('@') ? identifier : `${identifier}@mealfy.org`,
        role: role,
        totalDonated: 0,
        rankingPosition: 0,
        rankingPercentile: '',
        status: role === 'entity' ? 'pending' : 'active'
      };
      users.push(user);
      storage.set(USERS_KEY, users);
    }

    storage.set(SESSION_KEY, user);
    return user;
  },

  logout: async (): Promise<void> => {
    await randomDelay(500, 1000);
    storage.remove(SESSION_KEY);
  }
};
