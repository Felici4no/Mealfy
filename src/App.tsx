import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import BottomTabBar from './components/layout/BottomTabBar';

import Home from './pages/Home';
import DonationChoice from './pages/DonationChoice';
import Auth from './pages/Auth';
import Success from './pages/Success';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import CommunityDetails from './pages/CommunityDetails';
import MapView from './pages/MapView';
import FamilyDetails from './pages/FamilyDetails';
import BigDonation from './pages/BigDonation';
import Support from './pages/Support';
import Help from './pages/Help';
import Recurrence from './pages/Recurrence';

import './App.css';

// Component to protect private routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Global Layout wrapper
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  // We hide the bottom tab bar on certain screens (Auth, Donation, Success)
  const hideTabBarRoutes = ['/auth', '/donate', '/success'];
  const showTabBar = !hideTabBarRoutes.includes(location.pathname);

  return (
    <div className="app-wrapper">
      <div className={`page-content ${showTabBar ? 'with-tab-bar' : ''}`}>
        {children}
      </div>
      {showTabBar && <BottomTabBar />}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            {/* Donation Flow - Can be accessed by anonymous */}
            <Route path="/donate" element={<DonationChoice />} />
            <Route path="/big-donation" element={<BigDonation />} />
            <Route path="/success" element={<Success />} />
            <Route path="/community/:id" element={<CommunityDetails />} />
            <Route path="/family/:id" element={<FamilyDetails />} />
            <Route path="/support" element={<Support />} />
            <Route path="/help" element={<Help />} />

            {/* Private Routes */}
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/explore" 
              element={
                <PrivateRoute>
                  <Explore />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/map" 
              element={
                <PrivateRoute>
                  <MapView />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/recurrence" 
              element={
                <PrivateRoute>
                  <Recurrence />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
