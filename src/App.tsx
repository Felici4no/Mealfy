import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomTabBar from './components/layout/BottomTabBar';

// Placeholder Pages (we will create these next)
import Home from './pages/Home';
import DonationChoice from './pages/DonationChoice';
import Auth from './pages/Auth';
import Success from './pages/Success';
import Explore from './pages/Explore';
import Profile from './pages/Profile';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <div className="mobile-mockup">
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/donate" element={<DonationChoice />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/success" element={<Success />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <BottomTabBar />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
