import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import BottomSheet from '../components/ui/BottomSheet';
import { CreditCard, HelpCircle, Heart, Trophy, MessageCircle, LogOut, Clock, Settings, QrCode, Share2, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { donationService } from '../backend/services/donationService';
import { rankingService } from '../backend/services/rankingService';
import ImpactRegionSelector from '../components/modals/ImpactRegionSelector';
import { useToast } from '../context/ToastContext';
import './Profile.css';

interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

const Profile: React.FC = () => {
  const { user, logout, updateUserPrivacy, selectedRegion } = useAppContext();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [history, setHistory] = useState<any[]>([]);
  const [rankingInfo, setRankingInfo] = useState<any>(null);
  
  // Sheet and Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRegionSelectorOpen, setIsRegionSelectorOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);

  // Load user data & history
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        if (user.role === 'donor') {
          const [histResponse, rankResponse] = await Promise.all([
            donationService.getDonationHistoryByUser(user.id),
            rankingService.getUserRanking(user.id)
          ]);
          setHistory(histResponse);
          setRankingInfo(rankResponse);
        } else {
          setHistory([]);
          setRankingInfo(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  if (!user) return null;

  // Mock Achievements badges list
  const badges: Badge[] = [
    { id: 'b1', name: 'Pioneiro', desc: 'Realizou o primeiro apoio', icon: <Award size={20} />, unlocked: true },
    { id: 'b2', name: 'Guardião Regional', desc: 'Apoiou famílias em Heliópolis', icon: <Award size={20} />, unlocked: true },
    { id: 'b3', name: 'Multiplicador', desc: 'Apoiou 5 ou mais famílias', icon: <Award size={20} />, unlocked: true },
    { id: 'b4', name: 'Lacre de Ouro', desc: 'Apoiou a tecnologia Mealfy', icon: <Award size={20} />, unlocked: true },
    { id: 'b5', name: 'Líder de Rede', desc: 'Completou 10 apoios ativos', icon: <Award size={20} />, unlocked: false },
    { id: 'b6', name: 'Mealfy Champion', desc: 'Alcançou o top 10 do ranking', icon: <Award size={20} />, unlocked: false },
  ];

  // Helper values
  const totalSpent = rankingInfo?.totalDonated || 480;
  const rankPos = rankingInfo?.rankingPosition || 12;
  const supportsCount = history.length || 6;
  const currentLevel = "Nível 4: Guardião Alimentar";
  const nextLevelProgress = 8;
  const nextLevelTotal = 10;
  const focusRegion = selectedRegion || 'Heliópolis';

  const handleSharePublicCard = () => {
    const username = user.privacySettings?.anonymousMode ? 'apoiador-anonimo' : user.name.toLowerCase().replace(/\s+/g, '-');
    const url = `https://mealfy.app/p/${username}`;
    navigator.clipboard.writeText(url);
    showToast('Link da Ficha Pública copiado para a área de transferência!', 'success');
  };

  return (
    <div className="profile-page">
      <AppHeader 
        title="Meu Perfil" 
        rightAction={
          <Button 
            variant="ghost" 
            onClick={() => setIsSettingsOpen(true)} 
            icon={<Settings size={22} className="text-outline" />} 
          />
        } 
      />
      
      <main className="content">
        {/* ── Profile Header ── */}
        <section className="profile-header p-4 pb-6">
          <div className="avatar-container mb-3">
            <div className="avatar">
              {user.privacySettings?.anonymousMode ? 'A' : (user.avatar || user.name.charAt(0))}
            </div>
            {user.role === 'donor' && (
              <div className="ranking-badge" onClick={() => setIsAchievementsModalOpen(true)}>
                {currentLevel.split(':')[0]}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center">
            <h2 className="user-name">
              {user.privacySettings?.anonymousMode ? 'Apoiador Anônimo' : user.name}
            </h2>
            <div className={`role-badge-pill text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-1 mb-1 ${
              user.role === 'donor' ? 'bg-primary/20 text-primary' : 
              user.role === 'entity' ? 'bg-secondary/20 text-secondary' : 
              user.role === 'beneficiary' ? 'bg-success/20 text-success' : 'bg-outline/20 text-outline'
            }`}>
              {user.role === 'donor' ? 'Apoiador' : user.role === 'entity' ? `Entidade (${user.status || 'pending'})` : user.role === 'beneficiary' ? 'Beneficiário' : 'Admin'}
            </div>
            <p className="user-email text-outline">{user.email || user.phone}</p>
          </div>
        </section>

        {/* ── Impact Summary (Donor Only) ── */}
        {user.role === 'donor' && (
          <section className="impact-summary-container">
            <div className="impact-summary shadow-glow-soft">
              <div className="impact-item">
                <span className="impact-value">
                  R$ {totalSpent}
                </span>
                <span className="impact-label">Apoiado</span>
              </div>
              <div className="impact-divider"></div>
              <div className="impact-item">
                <span className="impact-value">
                  {supportsCount}
                </span>
                <span className="impact-label">Refeições</span>
              </div>
              <div className="impact-divider"></div>
              <div className="impact-item">
                <span className="impact-value">
                  #{rankPos}
                </span>
                <span className="impact-label">Ranking</span>
              </div>
            </div>
          </section>
        )}

        {/* ── Achievements Card (Donor Only) ── */}
        {user.role === 'donor' && (
          <section 
            className="achievement-card"
            onClick={() => setIsAchievementsModalOpen(true)}
          >
            <div className="achievement-header">
              <span className="achievement-title">Sua Evolução Alimentar</span>
              <span className="achievement-level">{currentLevel}</span>
            </div>
            <div className="achievement-progress-container">
              <div 
                className="achievement-progress-bar" 
                style={{ width: `${(nextLevelProgress / nextLevelTotal) * 100}%` }}
              ></div>
            </div>
            <div className="achievement-footer flex justify-between">
              <span>{nextLevelProgress} de {nextLevelTotal} apoios concluídos</span>
              <span className="font-bold text-primary">Ver insígnias ›</span>
            </div>
          </section>
        )}

        {/* ── Wikipedia-style Infobox Card (Donor Only) ── */}
        {user.role === 'donor' && (
          <section className="wikipedia-infobox-container">
            <h3 className="infobox-title">Ficha Pública de Impacto</h3>
            
            <table className="infobox-table">
              <tbody>
                <tr className="infobox-row">
                  <td className="infobox-label">Apoiador</td>
                  <td className="infobox-value">
                    {user.privacySettings?.anonymousMode ? 'Apoiador Anônimo' : user.name}
                  </td>
                </tr>
                <tr className="infobox-row">
                  <td className="infobox-label">Patente</td>
                  <td className="infobox-value">{currentLevel}</td>
                </tr>
                <tr className="infobox-row">
                  <td className="infobox-label">Foco Regional</td>
                  <td className="infobox-value">{focusRegion}</td>
                </tr>
                <tr className="infobox-row">
                  <td className="infobox-label">Impacto Estimado</td>
                  <td className="infobox-value">{supportsCount * 4} crianças nutridas</td>
                </tr>
                {user.privacySettings?.showInstagram && user.instagram && (
                  <tr className="infobox-row">
                    <td className="infobox-label">Rede Social</td>
                    <td className="infobox-value text-secondary font-bold">{user.instagram}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="infobox-qr-wrapper">
              <QrCode size={110} className="text-primary" />
              <span className="infobox-qr-label">Escanear Ficha de Apoiador</span>
            </div>

            <Button 
              variant="outline" 
              fullWidth 
              size="small" 
              icon={<Share2 size={16} />}
              onClick={handleSharePublicCard}
            >
              Compartilhar Ficha Pública
            </Button>
          </section>
        )}

        {/* ── Custom Quote ── */}
        <section className="quote-section">
          <p className="quote-text">
            “Não se iluda: quando você alimenta uma pessoa de verdade, ou estende a mão para cobrir um prato vago, você descobre que esse vazio nunca esteve neles, estava em você.”
          </p>
          <p className="quote-author">— Christiano Montalvão</p>
        </section>

        {/* ── Support History (Donor Only) ── */}
        {user.role === 'donor' && (
          <section className="history-section">
            <h3 className="section-title mb-3">Histórico de Apoios</h3>
            
            {loading ? (
               <div className="text-center p-8 text-outline text-sm">
                  <Clock className="animate-spin mx-auto mb-2 text-primary" size={20} />
                  Carregando histórico...
               </div>
            ) : history.length === 0 ? (
               <div className="text-center p-10 bg-white rounded-md border border-outline/5">
                  <Heart size={32} className="text-outline/20 mx-auto mb-3" />
                  <p className="text-sm text-outline mb-4">Você ainda não realizou apoios.</p>
                  <Button variant="outline" size="small" onClick={() => navigate('/donate')}>Realizar meu primeiro apoio</Button>
               </div>
            ) : (
              <div className="history-list flex flex-col gap-2">
                {history.slice(0, 3).map((item, i) => (
                  <div key={i} className="history-card">
                    <div className="history-icon-wrapper">
                      <Heart size={16} className="text-primary" />
                    </div>
                    <div className="history-info">
                      <span className="history-impact">{item.giftCard.label || 'Apoio Alimentar Coletivo'}</span>
                      <span className="history-date text-outline">
                        {new Date(item.donation.createdAt).toLocaleDateString('pt-BR')} • {item.giftCard.status === 'redeemed' ? 'Resgatado' : 'Disponibilizado'}
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
        )}

        {/* ── Actions Menu ── */}
        <section className="action-menu">
          {user.role === 'donor' && (
            <>
              <Button 
                variant="ghost" 
                className="menu-btn" 
                icon={<CreditCard size={20} className="text-outline" />}
                onClick={() => navigate('/recurrence')}
              >
                Gerenciar Apoios Recorrentes
              </Button>
              <Button 
                variant="ghost" 
                className="menu-btn" 
                icon={<Trophy size={20} className="text-outline" />} 
                onClick={() => setIsAchievementsModalOpen(true)}
              >
                Meu Ranking e Medalhas
              </Button>
            </>
          )}
          
          {(user.role === 'donor' || user.role === 'entity') && (
            <Button 
              variant="ghost" 
              className="menu-btn" 
              icon={<Heart size={20} className="text-outline" />} 
              onClick={() => navigate(user.role === 'donor' ? '/indicate-family' : '/register-family')}
            >
              {user.role === 'donor' ? 'Indicar Família para Apoio' : 'Cadastrar Família Beneficiária'}
            </Button>
          )}

          {user.role === 'entity' && (
            <Button 
              variant="ghost" 
              className="menu-btn" 
              icon={<MessageCircle size={20} className="text-outline" />} 
              onClick={() => navigate('/entity/dashboard')}
            >
              Ir para Painel da Entidade
            </Button>
          )}

          {user.role === 'beneficiary' && (
            <Button 
              variant="ghost" 
              className="menu-btn" 
              icon={<MessageCircle size={20} className="text-outline" />} 
              onClick={() => navigate('/beneficiary/dashboard')}
            >
              Ver Meus Vale-Refeições Ativos
            </Button>
          )}

          <Button 
            variant="ghost" 
            className="menu-btn" 
            icon={<HelpCircle size={20} className="text-outline" />}
            onClick={() => navigate('/help')}
          >
            Suporte e Ajuda
          </Button>
        </section>
      </main>

      {/* ── Settings BottomSheet ── */}
      <BottomSheet isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Configurações da Conta">
         <div className="flex flex-col gap-4">
           {user.role === 'donor' && (
              <div className="bg-surface-highest/60 rounded-lg border border-outline/10 p-4 flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="font-semibold text-sm">Região preferencial de apoio</span>
                       <span className="text-xs text-outline">{focusRegion}</span>
                    </div>
                    <Button variant="ghost" size="small" onClick={() => { setIsSettingsOpen(false); setIsRegionSelectorOpen(true); }} className="text-primary text-xs">
                       Alterar
                    </Button>
                 </div>
                 
                 <div className="flex justify-between items-center border-t border-outline/10 pt-4">
                    <div className="flex flex-col">
                       <span className="font-semibold text-sm">Exibir no Ranking Público</span>
                       <span className="text-xs text-outline">Seu nome e impacto ficam visíveis na rede</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={user.privacySettings?.showOnRanking} 
                      onChange={(e) => updateUserPrivacy({ showOnRanking: e.target.checked })}
                    />
                 </div>
                 
                 <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="font-semibold text-sm">Mostrar link do Instagram</span>
                       <span className="text-xs text-outline">Exibe link do seu perfil na ficha pública</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={user.privacySettings?.showInstagram} 
                      onChange={(e) => updateUserPrivacy({ showInstagram: e.target.checked })}
                    />
                 </div>
              </div>
           )}

           <div className="bg-surface-highest/60 rounded-lg border border-outline/10 p-4 flex justify-between items-center">
              <div className="flex flex-col">
                 <span className="font-semibold text-sm">Modo Anônimo</span>
                 <span className="text-xs text-outline">Oculta foto e nome real na plataforma</span>
              </div>
              <input 
                type="checkbox" 
                checked={user.privacySettings?.anonymousMode} 
                onChange={(e) => updateUserPrivacy({ anonymousMode: e.target.checked })}
              />
           </div>

           <Button variant="outline" className="border-error text-error mt-4" fullWidth icon={<LogOut size={18} />} onClick={logout}>
              Sair da conta
           </Button>
          </div>
      </BottomSheet>

      {/* ── Custom Achievements Modal ── */}
      {isAchievementsModalOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4 blur-bg">
          <div className="bg-white max-w-sm w-full p-6 border border-outline/10 rounded-lg relative">
            <h3 className="font-bold text-lg text-primary mb-2 flex items-center gap-2">
              <Trophy className="text-secondary" size={22} />
              Suas Medalhas de Impacto
            </h3>
            <p className="text-xs text-outline mb-4">Apoie mais famílias para desbloquear patentes e engajar a comunidade.</p>
            
            <div className="badge-grid mb-6">
              {badges.map((b) => (
                <div key={b.id} className={`badge-item ${b.unlocked ? '' : 'locked'}`} title={b.desc}>
                  <div className="badge-icon-container">
                    {b.icon}
                  </div>
                  <span className="badge-name">{b.name}</span>
                  <span className="badge-desc">{b.unlocked ? 'Desbloqueado' : 'Bloqueado'}</span>
                </div>
              ))}
            </div>

            <Button 
              variant="primary" 
              fullWidth 
              onClick={() => setIsAchievementsModalOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      {/* Impact region selector modal */}
      <ImpactRegionSelector 
        isOpen={isRegionSelectorOpen} 
        onClose={() => setIsRegionSelectorOpen(false)} 
      />
    </div>
  );
};

export default Profile;
