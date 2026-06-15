import React, { useState, useEffect } from 'react';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { familyService } from '../backend/services/familyService';
import { donationService } from '../backend/services/donationService';
import { Gift, Calendar, Heart, Clock, AlertTriangle, QrCode, Copy, Phone, ShieldCheck, ShieldAlert, ChevronRight } from 'lucide-react';
import type { Family, GiftCard, Donation } from '../backend/types';
import GiftCardSelectorModal, { GIFT_CARD_PARTNERS } from '../components/ui/GiftCardSelectorModal';
import './BeneficiaryDashboard.css';

const GIFT_CARD_CODE_PREFIX: Record<string, string> = {
  ifood: 'IFOD',
  carrefour: 'CRFU',
  '99': '99FD',
};

const BeneficiaryDashboard: React.FC = () => {
  const { user } = useAppContext();
  const { showToast } = useToast();
  
  const [family, setFamily] = useState<Family | null>(null);
  const [history, setHistory] = useState<{donation: Donation, giftCard: GiftCard}[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulated status switcher for testing in DEV mode
  const [simulatedStatus, setSimulatedStatus] = useState<'approved' | 'pending' | 'rejected'>('approved');

  // ── Gift card partner selection (mock, persisted locally) ──────────────────
  const giftCardStorageKey = `mealfy_giftcard_${user?.id || 'guest'}`;
  const [giftCardProvider, setGiftCardProvider] = useState<string>(
    () => localStorage.getItem(giftCardStorageKey) || 'ifood'
  );
  const [showGiftCardSelector, setShowGiftCardSelector] = useState(false);
  const selectedPartner = GIFT_CARD_PARTNERS.find((p) => p.id === giftCardProvider) || GIFT_CARD_PARTNERS[0];

  // ── Status de verificação Gov.br (mock visual) ──────────────────────────────
  const isGovVerified = false;

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.beneficiaryId) {
         setLoading(false);
         return;
      }
      
      const [fam, hist] = await Promise.all([
         familyService.getFamilyById(user.beneficiaryId),
         donationService.getDonationHistoryByUser(user.id)
      ]);

      if (fam) {
        setFamily(fam);
        // Default simulatedStatus to family actual status
        setSimulatedStatus((fam.status as any) || 'approved');
      }
      setHistory(hist || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Código do vale-refeição copiado!', 'success');
  };

  const handleRequestReview = () => {
    showToast('Pedido de re-análise enviado à entidade Heliópolis Solidária!', 'success');
  };

  const handleGiftCardConfirm = (providerId: string) => {
    setGiftCardProvider(providerId);
    localStorage.setItem(giftCardStorageKey, providerId);
    setShowGiftCardSelector(false);
    const partner = GIFT_CARD_PARTNERS.find((p) => p.id === providerId);
    showToast(`Vale-alimentação atualizado para ${partner?.name}!`, 'success');
  };

  if (loading) {
    return (
      <div className="beneficiary-dashboard-page p-6 flex items-center justify-center" style={{ height: '80vh' }}>
         <Clock className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="beneficiary-dashboard-page">
      <AppHeader title="Meu Painel" />

      {/* ── DEV Mode State Switcher ── */}
      {import.meta.env.DEV && (
        <div className="dev-state-switcher p-3 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-primary flex items-center gap-1">
            <Clock size={12} /> Testar Estados (Apenas DEV)
          </span>
          <div className="flex gap-1">
            <button 
              className={`dev-btn text-[10px] px-2 py-1 ${simulatedStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setSimulatedStatus('pending')}
            >
              Análise
            </button>
            <button 
              className={`dev-btn text-[10px] px-2 py-1 ${simulatedStatus === 'approved' ? 'active' : ''}`}
              onClick={() => setSimulatedStatus('approved')}
            >
              Aprovado
            </button>
            <button 
              className={`dev-btn text-[10px] px-2 py-1 ${simulatedStatus === 'rejected' ? 'active' : ''}`}
              onClick={() => setSimulatedStatus('rejected')}
            >
              Recusado
            </button>
          </div>
        </div>
      )}
      
      <main className="content p-4">
        {/* ── Welcome Row ── */}
        <section className="welcome-header mb-5">
           <h2 className="text-xl font-bold text-primary mb-1">Olá, {family?.representativeName || user?.name}</h2>
           <p className="text-sm text-outline mb-2">Acompanhe seus vales e a situação do seu cadastro.</p>
           {isGovVerified ? (
             <span className="badge-verification badge-verification--ok">
               <ShieldCheck size={12} className="mr-1" /> Verificado via Gov.br
             </span>
           ) : (
             <span className="badge-verification badge-verification--pending">
               <ShieldAlert size={12} className="mr-1" /> Identidade pendente
             </span>
           )}
        </section>

        {/* ── RENDER STATE: PENDING (Em análise) ── */}
        {simulatedStatus === 'pending' && (
          <div className="flex flex-col gap-4">
            <section className="status-banner bg-warning/10 border border-warning/30 p-6 rounded-lg text-center flex flex-col items-center">
              <Clock size={56} className="text-secondary mb-4 animate-pulse" />
              <h3 className="font-bold text-lg text-primary mb-2">Cadastro em Análise Física</h3>
              <p className="text-sm text-outline leading-relaxed">
                As informações fornecidas estão sob verificação da entidade parceira <strong>Heliópolis Solidária</strong>. 
                Uma visita domiciliar de rotina pode ser realizada para validação.
              </p>
              
              <div className="w-full border-t border-outline/10 my-4"></div>
              
              <div className="flex justify-between w-full text-xs text-outline">
                <span>Tempo de espera estimado:</span>
                <span className="font-bold text-primary">até 48 horas úteis</span>
              </div>
            </section>
            
            <section className="bg-white p-4 rounded-lg border border-outline/10">
              <h4 className="font-bold text-sm text-primary mb-2">O que acontece agora?</h4>
              <ul className="text-xs text-outline flex flex-col gap-2 list-disc pl-4">
                <li>Sua ficha será avaliada pela assistente social da comunidade.</li>
                <li>Havendo aprovação, você receberá um alerta automático pelo WhatsApp cadastrado.</li>
                <li>O vale-refeição iFood Alimentação será liberado neste aplicativo imediatamente.</li>
              </ul>
            </section>
          </div>
        )}

        {/* ── RENDER STATE: REJECTED (Recusado) ── */}
        {simulatedStatus === 'rejected' && (
          <div className="flex flex-col gap-4">
            <section className="status-banner bg-error/10 border border-error/30 p-6 rounded-lg text-center flex flex-col items-center">
              <AlertTriangle size={56} className="text-error mb-4" />
              <h3 className="font-bold text-lg text-error mb-2">Cadastro não Aprovado</h3>
              <p className="text-sm text-outline leading-relaxed mb-4">
                Não foi possível validar as informações informadas ou confirmar a elegibilidade na região indicada.
              </p>
              
              <div className="w-full bg-white p-3 rounded border border-outline/10 text-left mb-4">
                <span className="text-[10px] uppercase font-bold text-outline block">Motivo do Indeferimento</span>
                <span className="text-xs font-semibold text-text-main">
                  Divergência nos dados de residência comprovados ou cadastro fora do perímetro de Heliópolis.
                </span>
              </div>

              <Button 
                variant="primary" 
                fullWidth 
                icon={<Phone size={16} />}
                onClick={handleRequestReview}
              >
                Solicitar Revisão de Cadastro
              </Button>
            </section>

            <div className="bg-white p-4 rounded-lg border border-outline/10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-semibold text-xs text-primary">Dúvidas? Fale com a Entidade</span>
                <span className="text-[10px] text-outline">Heliópolis Solidária (Rua das Flores, 45)</span>
              </div>
              <Button variant="outline" size="small" onClick={() => showToast('Ligando para a entidade...', 'info')}>
                Contato
              </Button>
            </div>
          </div>
        )}

        {/* ── RENDER STATE: APPROVED (Aprovado) ── */}
        {simulatedStatus === 'approved' && (
          <div className="flex flex-col gap-5">
            {/* Current Benefit status */}
            <section className="status-card p-6 bg-primary text-inverted rounded-lg shadow-glow-soft">
               <div className="flex items-center gap-4 mb-4">
                  <div className="status-icon bg-white/20 p-3 rounded-md">
                     <Heart size={24} className="text-inverted" fill="white" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] opacity-80 uppercase font-black tracking-wider">Cadastro Ativo</span>
                     <span className="text-lg font-extrabold">Alimentado Hoje</span>
                  </div>
               </div>
               <p className="text-xs opacity-90 leading-relaxed">
                 Sua família recebeu o apoio doado pela rede hoje! O código do vale-refeição iFood Alimentação de R$ 40,00 está liberado abaixo.
               </p>
            </section>

            {/* Gift Card Display with QR and copy */}
            <section className="gift-cards-section">
               <div className="flex items-center justify-between mb-3">
                 <h3 className="section-title flex items-center gap-2">
                    <Gift size={18} className="text-secondary" />
                    <span>Vale-Refeição Liberado</span>
                 </h3>
                 <button className="giftcard-change-link" onClick={() => setShowGiftCardSelector(true)}>
                   Alterar vale-alimentação <ChevronRight size={12} />
                 </button>
               </div>

               <div className="gift-card-display p-5 bg-white border-2 border-dashed border-secondary rounded-lg text-center flex flex-col items-center">
                  <div className="giftcard-partner-logo mb-2" style={{ background: selectedPartner.color }} aria-hidden="true">
                    {selectedPartner.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[10px] text-outline block mb-1 uppercase font-bold tracking-wider">Código de Resgate {selectedPartner.name}</span>

                  <div className="flex items-center gap-2 mb-4 bg-background px-4 py-2 rounded border border-outline-variant">
                    <span className="text-xl font-mono font-black text-primary tracking-wider">{GIFT_CARD_CODE_PREFIX[giftCardProvider]}-ALIM-9928-2026</span>
                    <button
                      className="p-1 hover:text-secondary text-primary transition-all"
                      onClick={() => handleCopyCode(`${GIFT_CARD_CODE_PREFIX[giftCardProvider]}-ALIM-9928-2026`)}
                      aria-label="Copiar código"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col items-center p-3 bg-background rounded border border-outline/10 w-full mb-3">
                    <QrCode size={120} className="text-primary mb-2" />
                    <span className="text-[10px] text-outline uppercase font-semibold">Apresente no caixa ou no app</span>
                  </div>

                  <p className="text-[10px] text-outline">
                    Disponibilizado em: {new Date().toLocaleDateString('pt-BR')} • Válido por 30 dias.
                  </p>
               </div>
            </section>

            {/* Receipt History preview */}
            <section className="history-preview">
               <h3 className="section-title mb-3">Recebimentos Anteriores</h3>
               {history.length === 0 ? (
                 <p className="text-xs text-outline text-center py-4 bg-white rounded-lg border border-outline/5 italic">Ainda não há registros de apoios recebidos.</p>
               ) : (
                 <div className="flex flex-col gap-2">
                    {history.map((item, i) => (
                      <div key={i} className="history-item p-3 bg-white rounded-lg border border-outline/10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-outline" />
                            <span className="text-xs font-semibold text-outline">
                              {new Date(item.donation.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                        <span className="text-sm font-extrabold text-success">R$ {item.donation.amount}</span>
                      </div>
                    ))}
                 </div>
               )}
            </section>
          </div>
        )}
      </main>

      {/* ── Gift card selector modal ── */}
      {showGiftCardSelector && (
        <GiftCardSelectorModal
          selected={giftCardProvider}
          onConfirm={handleGiftCardConfirm}
          onClose={() => setShowGiftCardSelector(false)}
        />
      )}
    </div>
  );
};

export default BeneficiaryDashboard;
