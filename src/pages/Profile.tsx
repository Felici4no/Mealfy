import React, { useState, useEffect } from 'react';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import RankingDetailsModal from '../components/modals/RankingDetailsModal';
import { CreditCard, HelpCircle, Heart, Trophy, MessageCircle, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { donationService } from '../backend/services/donationService';
import { rankingService } from '../backend/services/rankingService';
import type { Donation, GiftCard } from '../backend/types';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, logout } = useAppContext();
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [history, setHistory] = useState<{donation: Donation, giftCard: GiftCard}[]>([]);
  const [rankingInfo, setRankingInfo] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        const [histResponse, rankResponse] = await Promise.all([
          donationService.getDonationHistoryByUser(user.id),
          rankingService.getUserRanking(user.id)
        ]);
        setHistory(histResponse);
        setRankingInfo(rankResponse);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="profile-page">
      <AppHeader title="Meu Perfil" rightAction={<Button variant="ghost" onClick={logout} icon={<LogOut size={22} className="text-outline" />} />} />
      
      <main className="content">
        <section className="profile-header p-4 pb-6">
          <div className="avatar-container mb-3">
            <div className="avatar">{user.avatar || user.name.charAt(0)}</div>
            <div className="ranking-badge" onClick={() => setIsRankingModalOpen(true)}>
              {rankingInfo ? rankingInfo.rankingPercentile : '...'}
            </div>
          </div>
          <h2 className="user-name">{user.name}</h2>
          <p className="user-email text-outline">{user.email || user.phone}</p>
        </section>

        <section className="impact-summary-container p-4">
          <div 
            className="impact-summary shadow-glow-soft cursor-pointer" 
            onClick={() => setIsRankingModalOpen(true)}
          >
            <div className="impact-item">
              <span className="impact-value">
                {loading ? '...' : `R$ ${rankingInfo?.totalDonated || 0}`}
              </span>
              <span className="impact-label">Doados</span>
            </div>
            <div className="impact-divider"></div>
            <div className="impact-item">
              <span className="impact-value">
                {loading ? '...' : history.length}
              </span>
              <span className="impact-label">Gift Cards</span>
            </div>
            <div className="impact-divider"></div>
            <div className="impact-item">
              <span className="impact-value">
                {loading ? '...' : `#${rankingInfo?.rankingPosition || '—'}`}
              </span>
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
          
          {loading ? (
             <div className="text-center p-4 text-outline text-sm">Carregando histórico...</div>
          ) : history.length === 0 ? (
             <div className="text-center p-4 text-outline text-sm">Você ainda não realizou doações.</div>
          ) : (
            <div className="history-list flex-col gap-3">
              {history.slice(0, 3).map((item, i) => (
                <div key={i} className="history-card">
                  <div className="history-icon-wrapper">
                    <Heart size={16} className="text-primary" />
                  </div>
                  <div className="history-info">
                    <span className="history-impact">{item.giftCard.label}</span>
                    <span className="history-date text-outline">
                      {new Date(item.donation.createdAt).toLocaleDateString('pt-BR')} • {item.giftCard.status === 'redeemed' ? 'Resgatado' : 'Enviado'}
                    </span>
                  </div>
                  <div className="history-amount">
                    R$ {item.donation.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {rankingInfo && (
        <RankingDetailsModal 
          isOpen={isRankingModalOpen} 
          onClose={() => setIsRankingModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default Profile;
