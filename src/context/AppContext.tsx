import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { storage } from '../backend/utils/storage';
import type { User, Community, PrivacySettings } from '../backend/types';
import { authService } from '../backend/services/authService';
import { communityService } from '../backend/services/communityService';
import { usersApi } from '../api/usersApi';
import SplashScreen from '../components/ui/SplashScreen';

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  /** Nova autenticação por email/senha — usa MockAuthProvider */
  signIn: (email: string, password: string) => Promise<void>;
  /** Login Google simulado — recebe o usuário escolhido no modal DEV */
  signInWithGoogle: (selectedUser: User) => Promise<void>;
  /** Encerra a sessão e limpa os dados locais do usuário */
  logout: () => Promise<void>;
  /** Recarrega o usuário da sessão local — usado por Register.tsx após cadastro */
  fetchSession: () => Promise<void>;
  communities: Community[];
  selectedCommunity: Community | null;
  setSelectedCommunity: (community: Community) => void;
  updateUserPrivacy: (settings: Partial<PrivacySettings>) => Promise<void>;
  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;
  clearSelectedRegion: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [selectedRegion, setSelectedRegionState] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const sessionUser = await authService.getCurrentSession();
        if (sessionUser) {
          setIsAuthenticated(true);
          setUser(sessionUser);
          if (sessionUser.role === 'donor' && sessionUser.impactPreferences?.preferredRegion) {
            setSelectedRegionState(sessionUser.impactPreferences.preferredRegion);
          }
        }
        const comms = await communityService.getCommunities();
        setCommunities(comms);
        setSelectedCommunity(comms[0] || null);
      } catch (err) {
        console.error('Erro inicializando app', err);
      } finally {
        setIsInitializing(false);
        setTimeout(() => setShowSplash(false), 400);
      }
    };
    initApp();
  }, []);

  // ─── Helpers de sessão ───────────────────────────────────────────────────

  const applySession = (loggedUser: User) => {
    if (!loggedUser.privacySettings) {
      loggedUser.privacySettings = { showOnRanking: true, showInstagram: true, anonymousMode: false };
    }
    setUser(loggedUser);
    setIsAuthenticated(true);
    if (loggedUser.role === 'donor' && loggedUser.impactPreferences?.preferredRegion) {
      setSelectedRegionState(loggedUser.impactPreferences.preferredRegion);
    }
  };

  // ─── Nova autenticação — delegada ao MockAuthProvider via authService ────

  const signIn = async (email: string, password: string): Promise<void> => {
    const loggedUser = await authService.signInWithEmail(email, password);
    applySession(loggedUser);
  };

  const signInWithGoogle = async (selectedUser: User): Promise<void> => {
    const loggedUser = await authService.signInWithGoogle(selectedUser);
    applySession(loggedUser);
  };

  // ─── Sessão e logout ────────────────────────────────────────────────────

  const fetchSession = async (): Promise<void> => {
    const sessionUser = await authService.getCurrentSession();
    if (sessionUser) {
      setUser(sessionUser);
      setIsAuthenticated(true);
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setSelectedRegionState(null);
  };

  // ─── Região e privacidade ───────────────────────────────────────────────

  const setSelectedRegion = async (region: string | null) => {
    setSelectedRegionState(region);
    if (user && user.role === 'donor') {
      const newPreferences = { ...user.impactPreferences, preferredRegion: region || undefined };
      try {
        await usersApi.updateImpactPreferences(newPreferences);
      } catch (e) {
        console.warn('Failed to save preference in API', e);
      }
      const newUser = { ...user, impactPreferences: newPreferences };
      setUser(newUser);
      const users = storage.get<User[]>('users_db', []);
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        users[idx] = newUser;
        storage.set('users_db', users);
      }
      storage.set('current_user', newUser);
    }
  };

  const clearSelectedRegion = () => setSelectedRegion(null);

  const updateUserPrivacy = async (settings: Partial<PrivacySettings>): Promise<void> => {
    if (!user) return;
    const newUser = {
      ...user,
      privacySettings: { ...user.privacySettings!, ...settings },
    };
    setUser(newUser);
    const users = storage.get<User[]>('users_db', []);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = newUser;
      storage.set('users_db', users);
    }
    storage.set('current_user', newUser);
  };

  if (showSplash) {
    return <SplashScreen isLoaded={!isInitializing} />;
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        signIn,
        signInWithGoogle,
        logout,
        fetchSession,
        communities,
        selectedCommunity,
        setSelectedCommunity,
        updateUserPrivacy,
        selectedRegion,
        setSelectedRegion,
        clearSelectedRegion,
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
