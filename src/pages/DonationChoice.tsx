import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import CommunitySelectorModal from '../components/modals/CommunitySelectorModal';
import { useAppContext } from '../context/AppContext';
import { MapPin, Info } from 'lucide-react';
import './DonationChoice.css';

const DonationChoice: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCommunity, isAuthenticated } = useAppContext();
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);

  const amounts = [
    { value: 25, impact: '1 dia de alimentação para uma criança' },
    { value: 40, impact: 'Apoio ampliado para duas crianças' },
  ];

  const handleContinue = () => {
    // If not authenticated, we could prompt login, OR go straight to success as a guest checkout since they can do anonymous donation
    navigate('/success');
  };

  return (
    <div className="donation-choice-page">
      <AppHeader title="Doação" showBack onBack={() => {
        // Se visitante, voltar para auth se lá foi de onde veio? 
        // O router lida bem. Se veio de Auth e clica back, vai pra Auth.
        navigate(-1);
      }} />
      
      <main className="content p-4">
        <h1 className="page-title text-primary mb-2">Escolha como deseja ajudar</h1>
        <p className="page-subtitle mb-6">Sua generosidade se transforma em esperança na mesa de quem precisa.</p>
        
        <section className="region-selector mb-6">
          <div className="region-card">
            <div className="region-icon">
              <MapPin size={20} className="text-secondary" />
            </div>
            <div className="region-info">
              <span className="region-label">Comunidade selecionada</span>
              <span className="region-value">{selectedCommunity.name} (Próximo)</span>
            </div>
            <button 
              className="change-region-btn text-primary"
              onClick={() => setIsCommunityModalOpen(true)}
            >
              Alterar
            </button>
          </div>
        </section>

        <section className="amounts-section mb-6">
          <div className="amount-cards-grid">
            {amounts.map((item) => (
              <div 
                key={item.value}
                className={`amount-card ${selectedAmount === item.value ? 'selected' : ''}`}
                onClick={() => setSelectedAmount(item.value)}
              >
                <div className="amount-value">R$ {item.value}</div>
                <div className="amount-impact">{item.impact}</div>
              </div>
            ))}
            
            <div 
              className={`amount-card custom-amount ${selectedAmount === null ? 'selected' : ''}`}
              onClick={() => setSelectedAmount(null)}
            >
              <div className="amount-value">Outro valor</div>
              <div className="amount-impact">Defina como quer ajudar</div>
            </div>
          </div>
        </section>

        <section className="recurrence-section mb-6">
          <h3 className="section-subtitle">Tipo de doação</h3>
          <div className="recurrence-toggle">
            <button 
              className={`toggle-btn ${!isRecurrent ? 'active' : ''}`}
              onClick={() => setIsRecurrent(false)}
            >
              Única
            </button>
            <button 
              className={`toggle-btn ${isRecurrent ? 'active' : ''}`}
              onClick={() => setIsRecurrent(true)}
            >
              Mensal
            </button>
          </div>
          {isRecurrent && (
            <div className="recurrence-info mt-4 flex items-center gap-2 text-outline">
              <Info size={16} />
              <span style={{ fontSize: '0.8rem' }}>A doação mensal ajuda a manter o apoio constante às famílias.</span>
            </div>
          )}
        </section>

      </main>

      <div className="fixed-bottom-action">
        <Button 
          size="large" 
          fullWidth 
          onClick={handleContinue}
          className="shadow-glow"
        >
          {selectedAmount ? `Continuar com R$ ${selectedAmount}` : 'Continuar'}
        </Button>
      </div>

      <CommunitySelectorModal 
        isOpen={isCommunityModalOpen} 
        onClose={() => setIsCommunityModalOpen(false)} 
      />
    </div>
  );
};

export default DonationChoice;
