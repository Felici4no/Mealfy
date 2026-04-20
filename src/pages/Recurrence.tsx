import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import CommunitySelectorModal from '../components/modals/CommunitySelectorModal';
import { recurrenceService } from '../backend/services/recurrenceService';
import { useAppContext } from '../context/AppContext';
import { MapPin, Calendar, CheckCircle2, PauseCircle, Loader2 } from 'lucide-react';
import type { Recurrence } from '../backend/types';
import './DonationChoice.css';

const RecurrenceManager: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectedCommunity } = useAppContext();

  const [recurrence, setRecurrence] = useState<Recurrence | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [editMode, setEditMode] = useState(false);
  const [targetAmount, setTargetAmount] = useState<number>(40);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      recurrenceService.getUserRecurrence(user.id).then(res => {
        if (res) {
          setRecurrence(res);
          setTargetAmount(res.amount);
          setPeriod(res.periodicity as 'weekly'|'monthly');
        } else {
          setEditMode(true); // Se não assina, entra automaticamente no modo curador
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !targetAmount) return;
    setIsProcessing(true);
    try {
      const saved = await recurrenceService.createOrUpdateRecurrence({
        userId: user.id,
        communityId: selectedCommunity?.id || 'all',
        amount: targetAmount,
        periodicity: period,
        status: 'active'
      });
      setRecurrence(saved);
      setEditMode(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePause = async () => {
    if (!recurrence) return;
    setIsProcessing(true);
    await recurrenceService.pauseRecurrence(recurrence.id);
    setRecurrence({ ...recurrence, status: 'paused' });
    setIsProcessing(false);
  };

  if (loading) return <div className="p-4 mt-8 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="donation-choice-page">
      <AppHeader title="Gerenciar Assinatura" showBack onBack={() => navigate(-1)} />
      
      <main className="content p-4">
        <h1 className="page-title text-primary mb-2">O Poder da Recorrência</h1>
        <p className="page-subtitle mb-6">Mantenha a roda solidária girando. Agende distribuições garantidas e mude vidas sem sair do sofá.</p>

        {(!editMode && recurrence) && (
          <div className="bg-surface-highest p-4 rounded-md mb-6 border border-primary">
            <div className="flex justify-between items-center mb-4">
              <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${recurrence.status === 'active' ? 'bg-[#e8f5e9] text-success' : 'bg-[#fff3e0] text-warning'}`}>
                {recurrence.status === 'active' ? 'Ativa' : 'Pausada'}
              </span>
              <span className="text-secondary font-bold" style={{ fontSize: '1.25rem' }}>R$ {recurrence.amount} {recurrence.periodicity === 'monthly' ? '/mês' : '/sem'}</span>
            </div>
            
            <div className="flex-col gap-2 text-sm">
               <div className="flex justify-between"><span className="text-outline">Próxima Fatura:</span> <strong>{new Date(recurrence.nextBillingDate).toLocaleDateString('pt-BR')}</strong></div>
               <div className="flex justify-between"><span className="text-outline">Região Foco:</span> <strong>{selectedCommunity?.name || 'Todas'}</strong></div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button fullWidth size="small" variant="outline" onClick={() => setEditMode(true)}>Alterar</Button>
              {recurrence.status === 'active' ? (
                <Button fullWidth size="small" variant="outline" onClick={handlePause} icon={<PauseCircle size={16}/>}>Pausar</Button>
              ) : (
                <Button fullWidth size="small" className="bg-success border-success" onClick={() => setEditMode(true)} icon={<CheckCircle2 size={16}/>}>Reativar</Button>
              )}
            </div>
          </div>
        )}

        {(editMode) && (
          <div className="settings-builder">
            <section className="region-selector mb-6">
              <div className="region-card">
                <div className="region-icon"><MapPin size={20} className="text-secondary" /></div>
                <div className="region-info">
                  <span className="region-label">Comunidade Padrão</span>
                  <span className="region-value">{selectedCommunity?.name}</span>
                </div>
                <button className="change-region-btn text-primary" onClick={() => setIsCommunityModalOpen(true)}>Alterar</button>
              </div>
            </section>

            <section className="amounts-section mb-6">
              <h3 className="section-subtitle mb-2 flex items-center gap-2"><Calendar size={18} /> Ciclo de Doação</h3>
              <div className="recurrence-toggle mb-4">
                <button className={`toggle-btn ${period === 'weekly' ? 'active' : ''}`} onClick={() => setPeriod('weekly')}>Semanal</button>
                <button className={`toggle-btn ${period === 'monthly' ? 'active' : ''}`} onClick={() => setPeriod('monthly')}>Mensal</button>
              </div>
            </section>
            
            <section className="amounts-section mb-6">
              <h3 className="section-subtitle mb-2">Valor Base</h3>
              <div className="amount-cards-grid">
                {[40, 80, 150].map((val) => (
                  <div key={val} className={`amount-card ${targetAmount === val ? 'selected' : ''}`} onClick={() => setTargetAmount(val)}>
                    <div className="amount-value">R$ {val}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {editMode && (
        <div className="fixed-bottom-action">
          <Button size="large" fullWidth onClick={handleSave} disabled={isProcessing} className="shadow-glow" icon={isProcessing?<Loader2 className="animate-spin" />:undefined}>
            Salvar Preferências
          </Button>
        </div>
      )}

      <CommunitySelectorModal isOpen={isCommunityModalOpen} onClose={() => setIsCommunityModalOpen(false)} />
    </div>
  );
};

export default RecurrenceManager;
