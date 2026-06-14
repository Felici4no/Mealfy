import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { familyService } from '../backend/services/familyService';
import type { Family } from '../backend/types';
import { Trophy, Loader as Loader2, Heart, Share2, AtSign, X, Copy, MessageCircle, Mail, QrCode } from 'lucide-react';
import StoriesRanking from '../components/ui/StoriesRanking';
import BottomSheet from '../components/ui/BottomSheet';
import ImpactRegionSelector from '../components/modals/ImpactRegionSelector';
import { useToast } from '../context/ToastContext';
import './Home.css';

// Mock list of 20 fixed donors
const MOCK_DONORS_LIST = [
  { id: 'md-1', name: 'Alexandre A.', totalDonated: 1500, instagram: '@alex_melf', avatar: 'A', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-2', name: 'Bernardo S.', totalDonated: 1200, instagram: '@bernardo_s', avatar: 'B', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-3', name: 'Clara C.', totalDonated: 950, instagram: '@clara_c', avatar: 'C', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-4', name: 'Daniel M.', totalDonated: 800, instagram: '@danielm', avatar: 'D', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-5', name: 'Eduarda L.', totalDonated: 750, instagram: '@eduarda_l', avatar: 'E', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-6', name: 'Felipe S.', totalDonated: 700, instagram: '@felipe_s', avatar: 'F', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-7', name: 'Gabriela L.', totalDonated: 650, instagram: '@gabi_lima', avatar: 'G', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-8', name: 'Apoiador Anon', totalDonated: 600, isAnonymous: true, avatar: 'A', privacySettings: { anonymousMode: true } },
  { id: 'md-9', name: 'Igor G.', totalDonated: 550, instagram: '@igor_g', avatar: 'I', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-10', name: 'Julia M.', totalDonated: 500, instagram: '@ju_martins', avatar: 'J', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-11', name: 'Kleber C.', totalDonated: 450, instagram: '@kleber_c', avatar: 'K', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-12', name: 'Luiza R.', totalDonated: 400, instagram: '@luiza_r', avatar: 'L', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-13', name: 'Matheus N.', totalDonated: 350, instagram: '@matheus_n', avatar: 'M', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-14', name: 'Natália S.', totalDonated: 300, instagram: '@nat_s', avatar: 'N', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-15', name: 'Otávio F.', totalDonated: 250, instagram: '@otavio_f', avatar: 'O', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-16', name: 'Patricia K.', totalDonated: 200, instagram: '@patricia_k', avatar: 'P', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-17', name: 'Ricardo T.', totalDonated: 150, instagram: '@ricardo_t', avatar: 'R', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-18', name: 'Sofia V.', totalDonated: 120, instagram: '@sofia_v', avatar: 'S', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-19', name: 'Tiago M.', totalDonated: 100, instagram: '@tiago_m', avatar: 'T', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
  { id: 'md-20', name: 'Victor H.', totalDonated: 90, instagram: '@victor_h', avatar: 'V', privacySettings: { showOnRanking: true, showInstagram: true, anonymousMode: false } },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { selectedRegion } = useAppContext();
  const { showToast } = useToast();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  
  // Modals state
  const [isRegionSelectorOpen, setIsRegionSelectorOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedDonorProfile, setSelectedDonorProfile] = useState<any | null>(null);
  
  // Platform Support
  const [supportAmountText, setSupportAmountText] = useState('');
  const [isSupporting, setIsSupporting] = useState(false);

  useEffect(() => {
    setLoadingFamilies(true);
    const filters = selectedRegion ? { region: selectedRegion } : undefined;
    familyService.getFamilies(filters).then(res => {
      setFamilies(res);
      setLoadingFamilies(false);
    });
  }, [selectedRegion]);

  const familiesHelped = families.filter(f => f.supportStatus === 'supported' || f.supportStatus === 'fed').length;
  const familiesNeedsHelp = families.filter(f => f.supportStatus === 'needs_help').length;

  // Dynamic regional feeding text (2-3 variations based on selection)
  const getDynamicFeedingText = () => {
    if (!selectedRegion) {
      return 'Sua ajuda se transforma rapidamente em refeições quentes e segurança alimentar para crianças vulneráveis.';
    }
    const region = selectedRegion.toLowerCase();
    if (region.includes('heliópolis')) {
      return 'Sua contribuição para Heliópolis se transforma em refeições quentes e cestas básicas entregues no mesmo dia.';
    }
    if (region.includes('paraisópolis')) {
      return 'Seu apoio para Paraisópolis fortalece a cozinha comunitária e garante merendas nutritivas.';
    }
    if (region.includes('tiradentes')) {
      return 'Sua ação em Cidade Tiradentes blinda as crianças do bairro contra a insegurança alimentar.';
    }
    return `Sua contribuição para ${selectedRegion} garante alimentação de qualidade para famílias atendidas localmente.`;
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText('https://mealfy.com');
    showToast('Link de compartilhamento copiado!', 'success');
    setIsShareModalOpen(false);
  };

  const simulatePlatformSupport = () => {
    const amt = parseFloat(supportAmountText);
    if (isNaN(amt) || amt <= 0) {
      showToast('Por favor, informe um valor válido para apoiar.', 'error');
      return;
    }
    setIsSupporting(true);
    setTimeout(() => {
      setIsSupporting(false);
      setIsSupportOpen(false);
      showToast(`Obrigado por apoiar a plataforma com R$ ${amt.toFixed(2)}!`, 'success');
      setSupportAmountText('');
    }, 1500);
  };

  const handleSelectDonor = (donor: any) => {
    if (donor.isSorteio) {
      showToast('Sorteio 21+: Qualquer pessoa que apoiar hoje tem a chance de aparecer no topo do carrossel de impacto!', 'info');
      return;
    }
    setSelectedDonorProfile(donor);
  };

  return (
    <div className="home-page">
      {/* ── Top Header Brand ── */}
      <div className="home-top">
        <div className="home-brand-row">
          <div className="flex items-center gap-2">
            <span className="home-brand">Mealfy</span>
            <button 
              className="text-outline hover:text-primary transition-all p-1"
              onClick={() => window.open('https://instagram.com/mealfy', '_blank')}
              aria-label="Instagram da Mealfy"
            >
              <AtSign size={18} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="home-top-action flex items-center cursor-pointer" onClick={() => setIsRegionSelectorOpen(true)}>
              <span className="text-xs font-bold mr-1 text-primary">
                {selectedRegion ? `Em: ${selectedRegion}` : 'Escolha onde apoiar'}
              </span>
              <Trophy size={16} className="text-secondary" />
            </div>
            <button 
              className="p-2 bg-surface-highest/60 hover:bg-surface-highest rounded-md border border-outline/10 text-primary"
              onClick={handleShareClick}
              aria-label="Compartilhar"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <div className="home-social-copy">
          <span className="home-eyebrow">Comunidade ativa</span>
          <h2 className="home-social-title">Pessoas movendo impacto hoje</h2>
        </div>

        {/* Stories Ranking Component */}
        <StoriesRanking 
          donors={MOCK_DONORS_LIST} 
          onSelectDonor={handleSelectDonor} 
        />
      </div>

      {/* ── Hero Headline ── */}
      <div className="hero-section">
        <div className="hero-image-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Criança sorrindo" 
          className="hero-image"
        />
        <div className="hero-content">
          <h1 className="hero-headline">Alimente uma criança.<br/>Combata a fome.</h1>
          <p className="hero-subtext">
            {getDynamicFeedingText()}
          </p>
          
          <div className="hero-actions">
            <Button 
              size="large" 
              fullWidth 
              onClick={() => navigate('/donate')}
              className="cta-donate shadow-glow"
            >
              Alimente uma criança
            </Button>
            <Button 
              variant="outline" 
              size="large" 
              fullWidth
              onClick={() => navigate('/map')}
              className="cta-secondary text-inverted border-inverted"
            >
              Explorar mapa regional
            </Button>
          </div>
        </div>
      </div>

      {/* ── Impact Statistics ── */}
      <div className="social-proof-section p-4">
        <h2 className="section-title text-center mb-4 text-primary font-bold">
          Impacto em {selectedRegion || 'todas as regiões'}
        </h2>
        
        {loadingFamilies ? (
          <div className="text-center text-outline my-8 flex flex-col items-center gap-2">
             <Loader2 className="animate-spin mx-auto text-primary" size={24} />
             <span className="text-xs">Atualizando dados...</span>
          </div>
        ) : families.length === 0 ? (
          <div className="text-center my-8 p-6 bg-surface-highest rounded-xl border border-outline/10 mx-4">
             <p className="text-sm text-outline italic">Ainda não há famílias cadastradas nesta região.</p>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number text-secondary">4</span>
              <span className="stat-label">Regiões</span>
            </div>
            <div className="stat-card">
              <span className={`stat-number ${familiesNeedsHelp > 0 ? 'text-error' : 'text-success'}`}>
                {familiesNeedsHelp}
              </span>
              <span className="stat-label">Precisam Agora</span>
            </div>
            <div className="stat-card">
              <span className="stat-number text-success">
                {familiesHelped}
              </span>
              <span className="stat-label">Apoiadas</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Institutional Support ── */}
      <div className="support-development-section p-4 my-4 bg-primary/5 rounded-xl mx-4 border border-primary/10">
        <p className="text-sm italic text-outline mb-3">
          "Cada prato que chega à mesa de uma criança é uma vitória contra a invisibilidade da fome." — Mealfy Team
        </p>
        <div className="dev-support-card">
           <h4 className="font-bold text-primary mb-1">Apoie a plataforma</h4>
           <p className="text-xs text-outline mb-3">
             Ao apoiar a Mealfy, você ajuda a manter a tecnologia ativa e conectar mais crianças e famílias à alimentação.
           </p>
           
           <div className="sponsor-logos flex items-center justify-center gap-4 py-3 mb-3 border-t border-b border-primary/10 bg-white/40">
             <div className="sponsor-logo text-xs font-black tracking-widest text-primary/60 italic">OWL FORTEC</div>
             <div className="sponsor-logo text-xs font-serif font-black tracking-wider text-secondary/80 italic">TAYLOR</div>
           </div>

           <Button variant="outline" size="small" fullWidth onClick={() => setIsSupportOpen(true)}>
             Apoiar Tecnologia
           </Button>
        </div>
      </div>
      
      <div className="bottom-spacing"></div>

      {/* ── Platform Support BottomSheet (Free numeric amount) ── */}
      <BottomSheet isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} title="Apoiar Tecnologia">
        <p className="text-sm text-outline mb-4">Seu apoio voluntário ajuda a pagar os servidores e expandir o combate à fome para mais cidades brasileiras.</p>
        
        <div className="form-group mb-6">
          <label className="form-label">Valor do Apoio (R$)</label>
          <input 
            type="number" 
            className="form-input" 
            placeholder="Ex: R$ 50"
            value={supportAmountText}
            onChange={(e) => setSupportAmountText(e.target.value)}
            min="1"
          />
        </div>

        <Button 
          variant="primary" 
          fullWidth 
          size="large"
          disabled={!supportAmountText || isSupporting}
          loading={isSupporting}
          onClick={simulatePlatformSupport}
        >
          {isSupporting ? 'Processando...' : 'Confirmar Apoio à Plataforma'}
        </Button>
      </BottomSheet>

      {/* ── Custom Share Modal ── */}
      <BottomSheet isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Compartilhar Mealfy">
        <p className="text-sm text-outline mb-6">Espalhe essa causa e ajude a engajar mais pessoas na luta contra a fome infantil.</p>
        
        <div className="flex flex-col gap-3">
          <button 
            className="flex items-center gap-3 p-4 bg-surface rounded-md border border-outline/10 text-left hover:bg-surface-highest transition-all"
            onClick={() => { showToast('Simulando envio pelo WhatsApp...', 'info'); setIsShareModalOpen(false); }}
          >
            <MessageCircle size={20} className="text-success" />
            <span className="font-semibold text-sm">Enviar por WhatsApp</span>
          </button>
          
          <button 
            className="flex items-center gap-3 p-4 bg-surface rounded-md border border-outline/10 text-left hover:bg-surface-highest transition-all"
            onClick={() => { showToast('Simulando abertura do Instagram Stories...', 'info'); setIsShareModalOpen(false); }}
          >
            <AtSign size={20} className="text-secondary" />
            <span className="font-semibold text-sm">Compartilhar no Instagram Stories</span>
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
            <span className="font-semibold text-sm">Copiar Link do Aplicativo</span>
          </button>
        </div>
      </BottomSheet>

      {/* ── Wikipedia-style public profile modal ── */}
      {selectedDonorProfile && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4 blur-bg">
          <div className="bg-white max-w-sm w-full p-6 border border-outline/10 rounded-xl relative flex flex-col items-center">
            <button 
              className="absolute top-4 right-4 text-outline hover:text-primary"
              onClick={() => setSelectedDonorProfile(null)}
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            {/* Wikipedia-style Profile Header */}
            <div className="w-20 h-20 bg-primary/10 text-primary font-black text-2xl flex items-center justify-center rounded-xl mb-4 border border-primary/20">
              {selectedDonorProfile.avatar}
            </div>

            <h3 className="font-bold text-xl text-primary mb-1">{selectedDonorProfile.name}</h3>
            
            {selectedDonorProfile.instagram && (
              <a 
                href={`https://instagram.com/${selectedDonorProfile.instagram.replace('@', '')}`}
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-secondary font-semibold flex items-center gap-1 mb-4 hover:underline"
              >
                <AtSign size={14} /> {selectedDonorProfile.instagram}
              </a>
            )}

            <div className="w-full border-t border-outline/10 my-3"></div>

            <div className="w-full flex justify-around py-3 bg-surface rounded-md border border-outline/5 mb-4">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-outline block">Total Contribuído</span>
                <span className="font-extrabold text-primary">R$ {selectedDonorProfile.totalDonated}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-outline block">Status de Apoio</span>
                <span className="font-extrabold text-success">Ativo</span>
              </div>
            </div>

            {/* QR Code and sharing */}
            <div className="flex flex-col items-center p-4 bg-surface rounded-md border border-dashed border-outline/20 mb-4 w-full">
              <QrCode size={110} className="text-primary mb-2" />
              <span className="text-[10px] text-outline">Escanear perfil para apoiar a rede</span>
            </div>

            <Button 
              variant="outline" 
              fullWidth 
              size="small" 
              onClick={() => {
                navigator.clipboard.writeText(`https://mealfy.com/user/${selectedDonorProfile.id}`);
                showToast('Link do perfil copiado!', 'success');
              }}
            >
              Compartilhar Perfil
            </Button>
          </div>
        </div>
      )}

      {/* Region selector */}
      <ImpactRegionSelector 
        isOpen={isRegionSelectorOpen} 
        onClose={() => setIsRegionSelectorOpen(false)} 
      />
    </div>
  );
};

export default Home;
