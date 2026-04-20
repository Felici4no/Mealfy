import React, { useState } from 'react';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import RankingDetailsModal from '../components/modals/RankingDetailsModal';
import { Settings, CreditCard, HelpCircle, Heart, Trophy, MessageCircle } from 'lucide-react';
import './Profile.css';

const Profile: React.FC = () => {
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);

  const history = [
    { id: 1, date: '10 Out 2026', amount: 25, impact: '1 dia de alimentação', status: 'Concluído' },
    { id: 2, date: '10 Set 2026', amount: 40, impact: 'Apoio ampliado', status: 'Concluído' },
  ];

  return (
    <div className="profile-page">
      <AppHeader title="Meu Perfil" rightAction={<Button variant="ghost" icon={<Settings size={22} className="text-primary" />} />} />
      
      <main className="content">
        <section className="profile-header p-4 pb-6">
          <div className="avatar-container mb-3">
            <div className="avatar">A</div>
            <div className="ranking-badge" onClick={() => setIsRankingModalOpen(true)}>Top 5%</div>
          </div>
          <h2 className="user-name">Alexandre Doador</h2>
          <p className="user-email text-outline">alexandre@example.com</p>
        </section>

        <section className="impact-summary-container p-4">
          <div 
            className="impact-summary shadow-glow-soft cursor-pointer" 
            onClick={() => setIsRankingModalOpen(true)}
          >
            <div className="impact-item">
              <span className="impact-value">R$ 130</span>
              <span className="impact-label">Doados</span>
            </div>
            <div className="impact-divider"></div>
            <div className="impact-item">
              <span className="impact-value">5</span>
              <span className="impact-label">Refeições</span>
            </div>
            <div className="impact-divider"></div>
            <div className="impact-item">
              <span className="impact-value">#142</span>
              <span className="impact-label">Ranking</span>
            </div>
          </div>
        </section>

        <section className="founder-message p-4 mb-2">
          <div className="message-box">
            <div className="message-icon">
              <MessageCircle size={20} className="text-secondary" />
            </div>
            <div className="message-content">
              <p className="quote">"Sua constância muda a vida de quem não tem o que comer hoje. Obrigado por fazer parte da família Mealfy."</p>
              <span className="author">— Equipe Mealfy</span>
            </div>
          </div>
        </section>

        <section className="history-section p-4">
          <div className="section-header flex justify-between items-center mb-4">
            <h3 className="section-title">Minhas doações</h3>
            <Button variant="ghost" size="small" className="text-primary">Ver tudo</Button>
          </div>
          
          <div className="history-list flex-col gap-3">
            {history.map(item => (
              <div key={item.id} className="history-card">
                <div className="history-icon-wrapper">
                  <Heart size={16} className="text-primary" />
                </div>
                <div className="history-info">
                  <span className="history-impact">{item.impact}</span>
                  <span className="history-date text-outline">{item.date} • {item.status}</span>
                </div>
                <div className="history-amount">
                  R$ {item.amount}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="action-menu p-4 flex-col gap-2">
          <Button variant="ghost" className="menu-btn" icon={<CreditCard size={20} />}>Gerenciar Recorrência</Button>
          <Button 
            variant="ghost" 
            className="menu-btn" 
            icon={<Trophy size={20} />} 
            onClick={() => setIsRankingModalOpen(true)}
          >
            Meu Ranking Exclusivo
          </Button>
          <Button variant="ghost" className="menu-btn" icon={<HelpCircle size={20} />}>Suporte e Ajuda</Button>
        </section>
      </main>

      <RankingDetailsModal 
        isOpen={isRankingModalOpen} 
        onClose={() => setIsRankingModalOpen(false)} 
      />
    </div>
  );
};

export default Profile;
