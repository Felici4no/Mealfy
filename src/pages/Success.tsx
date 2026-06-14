import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Check, Share2, History, HeartHandshake, Copy, MessageCircle, AtSign, Mail } from 'lucide-react';
import BottomSheet from '../components/ui/BottomSheet';
import { useToast } from '../context/ToastContext';
import './Success.css';

const Success: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Read data passed from DonationChoice or BigDonation
  const donationResult = location.state?.donationResult as any;
  const totalAmount = location.state?.totalAmount as number | undefined;

  // If user accesses /success directly, send back
  if (!donationResult) {
    navigate('/');
    return null;
  }

  const messages = [
    "Você não está sozinho.",
    "Com carinho, este apoio foi enviado para você e os pequenos.",
    "Estou torcendo por você e sua família."
  ];

  const copyShareLink = () => {
    navigator.clipboard.writeText('https://mealfy.com');
    showToast('Link de compartilhamento copiado!', 'success');
    setIsShareModalOpen(false);
  };

  return (
    <div className="success-page">
      <div className="success-hero flex flex-col items-center justify-center text-center p-4">
        <div className="success-icon-container mb-4">
          <div className="success-icon-bg bg-success">
            <Check size={48} color="white" />
          </div>
        </div>
        <h1 className="success-title text-primary mb-2">Muito obrigado!</h1>
        
        <p className="success-subtitle text-outline mb-6">
          Seu apoio foi transformado imediatamente no <strong>{donationResult.giftCard.label}</strong> e designado para a família de <strong>{donationResult.familyAssigned.representativeName}</strong>.
        </p>

        <div className="receipt-card mb-6">
          <div className="receipt-row">
            <span className="receipt-label">Valor do Apoio</span>
            <span className="receipt-value text-secondary">R$ {totalAmount ? totalAmount.toFixed(2) : '35,00'}</span>
          </div>
          <div className="receipt-divider"></div>
          <div className="receipt-row">
            <span className="receipt-label">Destinatário</span>
            <span className="receipt-value">{donationResult.familyAssigned.representativeName}</span>
          </div>
          <div className="receipt-divider"></div>
          <div className="receipt-row">
            <span className="receipt-label">Código Vale</span>
            <span className="receipt-value font-mono font-bold text-primary">{donationResult.giftCard.code}</span>
          </div>
          <div className="receipt-divider"></div>
          <div className="receipt-row">
            <span className="receipt-label">Status</span>
            <span className="receipt-value text-success font-bold">Gerado & Disponível</span>
          </div>
        </div>
      </div>

      <div className="message-section p-4">
        <h3 className="section-title mb-3 text-primary">Envie uma mensagem de força</h3>
        <p className="section-desc mb-4">Escolha uma mensagem para acompanhar seu apoio. Ela será exibida no painel da família.</p>
        
        <div className="message-options flex flex-col gap-3 mb-6">
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`message-card p-3 rounded border flex items-center gap-3 cursor-pointer transition-all ${
                selectedMessage === index ? 'border-primary bg-primary/5' : 'border-outline/10 bg-white'
              }`}
              onClick={() => setSelectedMessage(index)}
            >
              <HeartHandshake size={20} className={selectedMessage === index ? 'text-primary' : 'text-outline'} />
              <span className="message-text text-sm text-text-main">{msg}</span>
            </div>
          ))}
        </div>

        <div className="action-buttons flex flex-col gap-3">
          <Button 
            className="shadow-glow" 
            size="large" 
            fullWidth
            onClick={() => navigate('/map')}
          >
            Acompanhar no mapa regional
          </Button>
          
          <div className="secondary-actions flex gap-3 mt-2">
            <Button 
              variant="outline" 
              fullWidth 
              icon={<Share2 size={18} />}
              onClick={() => setIsShareModalOpen(true)}
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

      {/* Share BottomSheet */}
      <BottomSheet isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Compartilhar Conquista">
        <p className="text-sm text-outline mb-6">Mostre aos seus amigos como você está ajudando a combater a fome infantil hoje!</p>
        
        <div className="flex flex-col gap-3">
          <button 
            className="flex items-center gap-3 p-4 bg-surface rounded-md border border-outline/10 text-left hover:bg-surface-highest transition-all"
            onClick={() => { showToast('Simulando envio pelo WhatsApp...', 'info'); setIsShareModalOpen(false); }}
          >
            <MessageCircle size={20} className="text-success" />
            <span className="font-semibold text-sm">Enviar no WhatsApp</span>
          </button>
          
          <button 
            className="flex items-center gap-3 p-4 bg-surface rounded-md border border-outline/10 text-left hover:bg-surface-highest transition-all"
            onClick={() => { showToast('Simulando postagem no Instagram Stories...', 'info'); setIsShareModalOpen(false); }}
          >
            <AtSign size={20} className="text-secondary" />
            <span className="font-semibold text-sm">Compartilhar no Stories</span>
          </button>
          
          <button 
            className="flex items-center gap-3 p-4 bg-surface rounded-md border border-outline/10 text-left hover:bg-surface-highest transition-all"
            onClick={() => { showToast('Simulando envio por E-mail...', 'info'); setIsShareModalOpen(false); }}
          >
            <Mail size={20} className="text-primary" />
            <span className="font-semibold text-sm">Enviar por E-mail</span>
          </button>

          <button 
            className="flex items-center gap-3 p-4 bg-surface rounded-md border border-outline/10 text-left hover:bg-surface-highest transition-all"
            onClick={copyShareLink}
          >
            <Copy size={20} className="text-outline" />
            <span className="font-semibold text-sm">Copiar Link</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};

export default Success;
