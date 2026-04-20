import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Community } from '../backend/types';
import { authService } from '../backend/services/authService';
import { communityService } from '../backend/services/communityService';
import SplashScreen from '../components/ui/SplashScreen';

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (method: 'google'|'apple'|'phone', arg?: string) => Promise<void>;
  logout: () => Promise<void>;
  communities: Community[];
  selectedCommunity: Community | null;
  setSelectedCommunity: (community: Community) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Fetch session
        const sessionUser = await authService.getCurrentSession();
        if (sessionUser) {
          setIsAuthenticated(true);
          setUser(sessionUser);
        }

        // Fetch initial communities
        const comms = await communityService.getCommunities();
        setCommunities(comms);
        setSelectedCommunity(comms[0] || null);

      } catch (err) {
        console.error("Erro inicializando app", err);
      } finally {
        setIsInitializing(false);
      }
    };

    initApp();
  }, []);

  const login = async (method: 'google'|'apple'|'phone', arg?: string) => {
    let loggedUser: User;
    if (method === 'google') loggedUser = await authService.loginWithGoogle();
    else if (method === 'apple') loggedUser = await authService.loginWithApple();
    else loggedUser = await authService.loginWithPhone(arg || '');

    setUser(loggedUser);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isInitializing) {
    return <SplashScreen />;
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        communities,
        selectedCommunity,
        setSelectedCommunity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
