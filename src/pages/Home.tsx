import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCommunity } = useAppContext();

  return (
    <div className="home-page">
      <AppHeader transparent />
      
      <div className="hero-section">
        <div className="hero-image-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Criança sorrindo" 
          className="hero-image"
        />
        <div className="hero-content">
          <h1 className="hero-headline">Doe hoje.<br/>Alimente uma criança.</h1>
          <p className="hero-subtext">
            Sua doação para {selectedCommunity.name} se transforma rapidamente em refeições quentes para famílias em situação de vulnerabilidade.
          </p>
          
          <div className="hero-actions">
            <Button 
              size="large" 
              fullWidth 
              onClick={() => navigate('/donate')}
              className="cta-donate shadow-glow"
            >
              Fazer uma doação
            </Button>
            <Button 
              variant="outline" 
              size="large" 
              fullWidth
              onClick={() => navigate('/explore')}
              className="cta-secondary text-inverted border-inverted"
            >
              Explorar ações na região
            </Button>
          </div>
        </div>
      </div>

      <div className="social-proof-section p-4">
        <h2 className="section-title text-center mb-4 text-primary font-bold">Juntos já conseguimos</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number text-secondary">42k</span>
            <span className="stat-label">Refeições</span>
          </div>
          <div className="stat-card">
            <span className="stat-number text-secondary">1.2k</span>
            <span className="stat-label">Famílias</span>
          </div>
          <div className="stat-card">
            <span className="stat-number text-secondary">18</span>
            <span className="stat-label">Comunidades</span>
          </div>
        </div>
      </div>
      
      <div className="bottom-spacing"></div>
    </div>
  );
};

export default Home;
