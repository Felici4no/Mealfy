import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Community {
  id: number;
  name: string;
  distance: string;
  families: number;
  priority: string;
  urgencyColor: 'error' | 'warning' | 'success';
}

const defaultCommunities: Community[] = [
  { id: 1, name: 'Heliópolis', distance: '1.2 km', families: 340, priority: 'Alta urgência', urgencyColor: 'error' },
  { id: 2, name: 'Paraisópolis', distance: '3.5 km', families: 210, priority: 'Alta urgência', urgencyColor: 'error' },
  { id: 3, name: 'Cidade Tiradentes', distance: '8.0 km', families: 156, priority: 'Atenção', urgencyColor: 'warning' },
  { id: 4, name: 'São Miguel Paulista', distance: '10.5 km', families: 98, priority: 'Estável', urgencyColor: 'success' },
];

interface AppContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  selectedCommunity: Community;
  setSelectedCommunity: (community: Community) => void;
  communities: Community[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community>(defaultCommunities[0]);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        selectedCommunity,
        setSelectedCommunity,
        communities: defaultCommunities,
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
