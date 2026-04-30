import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { familyService } from '../backend/services/familyService';
import { rankingService } from '../backend/services/rankingService';
import type { Family } from '../backend/types';
import { Trophy, Loader2, Heart } from 'lucide-react';
import StoriesRanking from '../components/ui/StoriesRanking';
import BottomSheet from '../components/ui/BottomSheet';
import { useToast } from '../context/ToastContext';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCommunity } = useAppContext();
  const { showToast } = useToast();
  const [families, setFamilies] = useState<Family[]>([]);
  const [topDonors, setTopDonors] = useState<any[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportAmount, setSupportAmount] = useState<number | null>(null);
  const [isSupporting, setIsSupporting] = useState(false);

  useEffect(() => {
    rankingService.getTopDonors().then(setTopDonors);
    
    if (selectedCommunity) {
      setLoadingFamilies(true);
      familyService.getFamiliesByCommunity(selectedCommunity.id).then(res => {
        setFamilies(res);
        setLoadingFamilies(false);
      });
    }
  }, [selectedCommunity]);

  const familiesHelped = families.filter(f => f.supportStatus === 'supported').length;
  const familiesNeedsHelp = families.filter(f => f.supportStatus === 'needs_help').length;

  return (
    <div className="home-page">
      <AppHeader transparent />
      
      <div className="ranking-preview-section pt-20">
        <header className="home-social-header px-4 mb-3">
          <div>
            <span className="eyebrow">Comunidade ativa</span>
            <h2>Pessoas movendo impacto hoje</h2>
          </div>
          <span className="impact-badge">🏆</span>
        </header>
        <StoriesRanking 
          donors={topDonors} 
          onSelectDonor={(d) => {
            const isAnon = d.isAnonymous || d.privacySettings?.anonymousMode;
            const msg = `Doador: ${isAnon ? 'Anônimo' : d.name} • Total: R$ ${d.totalDonated}${(!isAnon && d.instagram && d.privacySettings?.showInstagram !== false) ? ` • IG: ${d.instagram}` : ''}`;
            showToast(msg, 'info');
          }} 
        />
      </div>

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
            Sua doação para {selectedCommunity?.name} se transforma rapidamente em refeições quentes.
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
        <h2 className="section-title text-center mb-4 text-primary font-bold">
          Impacto em {selectedCommunity?.name}
        </h2>
        
        {loadingFamilies ? (
          <div className="text-center text-outline my-8 flex-col items-center gap-2">
             <Loader2 className="animate-spin mx-auto text-primary" size={24} />
             <span className="text-xs">Atualizando dados...</span>
          </div>
        ) : families.length === 0 ? (
          <div className="text-center my-8 p-6 bg-surface-highest rounded-2xl border border-outline/10 mx-4">
             <p className="text-sm text-outline italic">Ainda não há famílias cadastradas em {selectedCommunity?.name}.</p>
             <Button variant="ghost" size="small" className="mt-2 text-primary" onClick={() => navigate('/register-family')}>Indique uma família</Button>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number text-secondary">{familiesHelped + familiesNeedsHelp}</span>
              <span className="stat-label">Cadastradas</span>
            </div>
            <div className="stat-card">
              <span className={`stat-number ${familiesNeedsHelp > 0 ? 'text-error' : 'text-success'}`}>
                {familiesNeedsHelp} 
                <span style={{fontSize: '1rem', marginLeft: 4}}>
                  {familiesNeedsHelp > 0 ? '💔' : '💚'}
                </span>
              </span>
              <span className="stat-label">Precisam Agora</span>
            </div>
            <div className="stat-card">
              <span className="stat-number text-success">
                {familiesHelped}
                <span style={{fontSize: '1rem', marginLeft: 4}}>❤️</span>
              </span>
              <span className="stat-label">Apoiadas</span>
            </div>
          </div>
        )}
        <Button 
          variant="outline" 
          fullWidth
          className="mt-4 border-outline text-outline"
          onClick={() => navigate(`/community/${selectedCommunity?.id}`)}
        >
          Visualizar a Fome nesta Região
        </Button>
      </div>

      <div className="home-institutional p-4 text-center">
        <h3 className="text-xs font-bold text-outline/40 uppercase tracking-widest mb-1">Impacted by</h3>
        <div className="flex items-center justify-center gap-2">
          <span className="font-serif text-xl font-black text-primary italic">AWL for Tech</span>
        </div>
      </div>



      <div className="support-development-section p-4 my-4 bg-primary/5 rounded-xl mx-4 border border-primary/10">
        <p className="text-sm italic text-outline mb-3">
          "Cada prato que chega à mesa de uma criança é uma vitória contra a invisibilidade da fome." — Chris
        </p>
        <div className="dev-support-card">
           <h4 className="font-bold text-primary mb-1">Ajude o desenvolvimento</h4>
           <p className="text-xs text-outline mb-3">Apoie o desenvolvimento da plataforma e o marketing para levar alimento a mais famílias.</p>
           <Button variant="outline" size="small" fullWidth onClick={() => setIsSupportOpen(true)}>
             Apoiar Plataforma
           </Button>
        </div>
      </div>
      
      <div className="bottom-spacing"></div>

      <BottomSheet isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} title="Apoiar Plataforma">
        <p className="text-sm text-outline mb-4">Seu apoio ajuda a manter o servidor online e a levar a plataforma para mais comunidades pelo Brasil.</p>
        <div className="flex gap-3 mb-6">
           <Button 
             variant={supportAmount === 10 ? 'primary' : 'outline'} 
             fullWidth 
             onClick={() => setSupportAmount(10)}
           >
             R$ 10
           </Button>
           <Button 
             variant={supportAmount === 20 ? 'primary' : 'outline'} 
             fullWidth 
             onClick={() => setSupportAmount(20)}
           >
             R$ 20
           </Button>
        </div>
        <Button 
          variant="primary" 
          fullWidth 
          size="large"
          disabled={!supportAmount || isSupporting}
          loading={isSupporting}
          icon={!isSupporting ? <Heart size={18} /> : undefined}
          onClick={() => {
             setIsSupporting(true);
             setTimeout(() => {
                setIsSupporting(false);
                setIsSupportOpen(false);
                showToast(`Obrigado pelo apoio de R$ ${supportAmount}!`, 'success');
                setSupportAmount(null);
             }, 1500);
          }}
        >
          {isSupporting ? 'Processando...' : 'Confirmar Apoio'}
        </Button>
      </BottomSheet>
    </div>
  );
};

export default Home;
