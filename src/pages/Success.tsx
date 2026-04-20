import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Check, Share2, History, HeartHandshake } from 'lucide-react';
import type { Donation, GiftCard, Family } from '../backend/types';
import './Success.css';

const Success: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);

  // Read data passed from DonationChoice or BigDonation
  const donationResult = location.state?.donationResult as {
    donation: Donation,
    giftCard: GiftCard,
    familyAssigned: Family
  } | undefined;

  const bigDonationResult = location.state?.bigDonationResult as any; // BigDonationResult

  // If user accesses /success without donating, send back
  if (!donationResult && !bigDonationResult) {
    navigate('/');
    return null;
  }

  const messages = [
    "Você não está sozinho.",
    "Com carinho, esta ajuda foi enviada para você e os pequenos.",
    "Estou torcendo por você e sua família."
  ];

  return (
    <div className="success-page">
      <div className="success-hero flex-col items-center justify-center text-center p-4">
        <div className="success-icon-container mb-4">
          <div className="success-icon-bg">
            <Check size={48} color="white" />
          </div>
        </div>
        <h1 className="success-title text-primary mb-2">Muito obrigado!</h1>
        
        {bigDonationResult ? (
          <>
            <p className="success-subtitle text-outline mb-6">
              Sua grande doação gerou um <strong>{bigDonationResult.supportTierDesc}</strong> e foi distribuída blindando <strong>{bigDonationResult.impactedFamiliesCount} famílias</strong> na região.
            </p>
            <div className="receipt-card mb-6">
              <div className="receipt-row">
                <span className="receipt-label">Valor Total</span>
                <span className="receipt-value text-secondary">R$ {bigDonationResult.totalDistributedAmount},00</span>
              </div>
              <div className="receipt-divider"></div>
              <div className="receipt-row">
                <span className="receipt-label">Famílias Salvas</span>
                <span className="receipt-value">{bigDonationResult.impactedFamiliesCount} Famílias</span>
              </div>
              <div className="receipt-divider"></div>
              <div className="receipt-row">
                <span className="receipt-label">Gift Cards Emitidos</span>
                <span className="receipt-value">{bigDonationResult.giftCards.length} Vouchers</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="success-subtitle text-outline mb-6">
              Sua doação foi transformada imediatamente no <strong>{donationResult!.giftCard.label}</strong> e designado para a família de <strong>{donationResult!.familyAssigned.representativeName}</strong> ({donationResult!.familyAssigned.childrenCount} filhos).
            </p>

            <div className="receipt-card mb-6">
              <div className="receipt-row">
                <span className="receipt-label">Valor doado</span>
                <span className="receipt-value text-secondary">R$ {donationResult!.donation.amount},00</span>
              </div>
              <div className="receipt-divider"></div>
              <div className="receipt-row">
                <span className="receipt-label">Destino</span>
                <span className="receipt-value">{donationResult!.familyAssigned.neighborhood}</span>
              </div>
              <div className="receipt-divider"></div>
              <div className="receipt-row">
                <span className="receipt-label">Emissor</span>
                <span className="receipt-value" style={{ fontSize: '0.85rem' }}>{donationResult!.giftCard.provider}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="message-section p-4">
        <h3 className="section-title mb-3 text-primary">Envie uma mensagem de força</h3>
        <p className="section-desc mb-4">Escolha uma mensagem para acompanhar sua doação. Ela será entregue junto com a refeição.</p>
        
        <div className="message-options flex-col gap-3 mb-6">
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`message-card ${selectedMessage === index ? 'selected' : ''}`}
              onClick={() => setSelectedMessage(index)}
            >
              <HeartHandshake size={20} className={selectedMessage === index ? 'text-primary' : 'text-outline'} />
              <span className="message-text">{msg}</span>
            </div>
          ))}
        </div>

        <div className="action-buttons flex-col gap-3">
          <Button 
            className="shadow-glow" 
            size="large" 
            fullWidth
            onClick={() => navigate('/explore')}
          >
            Acompanhar impacto da região
          </Button>
          
          <div className="secondary-actions flex gap-3 mt-2">
            <Button 
              variant="outline" 
              fullWidth 
              icon={<Share2 size={18} />}
            >
              Compartilhar
            </Button>
            <Button 
              variant="outline" 
              fullWidth 
              icon={<History size={18} />}
              onClick={() => navigate('/profile')}
            >
              Meu Perfil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
