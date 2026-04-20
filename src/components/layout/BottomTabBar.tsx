import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Heart, Map, User } from 'lucide-react';
import './BottomTabBar.css';

const BottomTabBar: React.FC = () => {
  return (
    <nav className="bottom-tab-bar">
      <NavLink to="/" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
        <span>Início</span>
      </NavLink>
      <NavLink to="/donate" className={({ isActive }) => `tab-item donate-tab ${isActive ? 'active' : ''}`}>
        <div className="donate-icon-wrapper">
          <Heart size={28} color="white" fill="white" />
        </div>
        <span>Doar</span>
      </NavLink>
      <NavLink to="/explore" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        <Map size={24} />
        <span>Regiões</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        <User size={24} />
        <span>Perfil</span>
      </NavLink>
    </nav>
  );
};

export default BottomTabBar;
