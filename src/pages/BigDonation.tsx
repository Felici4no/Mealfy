import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { donationService } from '../backend/services/donationService';
import type { Community } from '../backend/types';
import { ShieldAlert, Loader2, Info } from 'lucide-react';
import './DonationChoice.css'; // Reuse amounts grid

const BigDonation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppContext();
  
  const community = location.state?.community as Community | undefined;
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!community) {
    navigate('/explore');
    return null;
  }

  const amounts = [
    { value: 100, impact: 'Apoio ampliado regional' },
    { value: 250, impact: 'Geração de grande impacto local' },
    { value: 500, impact: 'Transformação massiva de famílias' },
  ];

  const handleContinue = async () => {
    if (!selectedAmount) return;
    
    setIsProcessing(true);
    try {
      const result = await donationService.createBigDonation({
        totalAmount: selectedAmount,
        communityId: community.id,
        donorId: user?.id || `anon-${Date.now()}`,
      });

      navigate('/success', { state: { bigDonationResult: result } });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao processar doação coletiva.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="donation-choice-page">
      <AppHeader title="Apoio Regional" showBack onBack={() => navigate(-1)} />
      
      <main className="content p-4">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert size={28} className="text-secondary" />
          <h1 className="page-title text-primary m-0">Doação Ampliada</h1>
        </div>
        <p className="page-subtitle mb-6">Seu apoio será distribuído automaticamente entre as famílias que mais precisam em <strong>{community.name}</strong>.</p>
        
        <section className="amounts-section mb-6">
          <div className="amount-cards-grid">
            {amounts.map((item) => (
              <div 
                key={item.value}
                className={`amount-card ${selectedAmount === item.value ? 'selected' : ''} ${isProcessing ? 'disabled' : ''}`}
                onClick={() => { if(!isProcessing) setSelectedAmount(item.value) }}
                style={{ gridColumn: 'span 2' }} // Big cards for Big Donation
              >
                <div className="amount-value">R$ {item.value}</div>
                <div className="amount-impact">{item.impact}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="info-box p-4 bg-surface-highest rounded-md flex gap-3">
          <Info size={24} className="text-primary shrink-0" />
          <p className="text-sm">
            Nós mapeamos as famílias elegíveis nesta região e distribuiremos o valor de forma inteligente criando múltiplos Gift Cards. O recibo final detalhará o impacto real distribuído.
          </p>
        </section>
      </main>

      <div className="fixed-bottom-action">
        <Button 
          size="large" 
          fullWidth 
          onClick={handleContinue}
          className="shadow-glow"
          disabled={!selectedAmount || isProcessing}
          icon={isProcessing ? <Loader2 className="animate-spin" size={20} /> : undefined}
          variant="secondary"
        >
          {isProcessing ? 'Processando doação...' : (selectedAmount ? `Distribuir R$ ${selectedAmount}` : 'Continuar')}
        </Button>
      </div>
    </div>
  );
};

export default BigDonation;
