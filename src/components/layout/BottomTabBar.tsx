import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Soup, User, MapPin, LayoutDashboard, Users, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './BottomTabBar.css';

const BottomTabBar: React.FC = () => {
  const { user } = useAppContext();

  if (!user) return null;

  // Donor Navigation: Início | Mapa | Alimente | Perfil
  if (user.role === 'donor') {
    return (
      <nav className="bottom-tab-bar glassmorphism">
        <NavLink to="/" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <Home size={22} />
          <span>Início</span>
        </NavLink>
        <NavLink to="/map" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <MapPin size={22} />
          <span>Mapa</span>
        </NavLink>
        <NavLink to="/donate" className={({ isActive }) => `tab-item donate-tab ${isActive ? 'active' : ''}`}>
          <div className="donate-icon-wrapper">
            <Soup size={26} color="white" />
          </div>
          <span>Alimente</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <User size={22} />
          <span>Perfil</span>
        </NavLink>
      </nav>
    );
  }

  // Entity Navigation
  if (user.role === 'entity') {
    return (
      <nav className="bottom-tab-bar glassmorphism">
        <NavLink to="/entity/dashboard" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={22} />
          <span>Painel</span>
        </NavLink>
        <NavLink to="/register-family" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <Users size={22} />
          <span>Cadastrar</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <User size={22} />
          <span>Perfil</span>
        </NavLink>
      </nav>
    );
  }

  // Beneficiary Navigation
  if (user.role === 'beneficiary') {
    return (
      <nav className="bottom-tab-bar glassmorphism">
        <NavLink to="/beneficiary/dashboard" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <Home size={22} />
          <span>Início</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <User size={22} />
          <span>Perfil</span>
        </NavLink>
      </nav>
    );
  }

  // Admin Navigation
  if (user.role === 'admin') {
    return (
      <nav className="bottom-tab-bar glassmorphism">
        <NavLink to="/unauthorized" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <ShieldCheck size={22} />
          <span>Admin</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
          <User size={22} />
          <span>Perfil</span>
        </NavLink>
      </nav>
    );
  }

  // Default Fallback
  return (
    <nav className="bottom-tab-bar glassmorphism">
      <NavLink to="/dashboard-redirect" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>Início</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        <User size={22} />
        <span>Perfil</span>
      </NavLink>
    </nav>
  );
};

export default BottomTabBar;
