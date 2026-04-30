import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import { useAppContext } from '../context/AppContext';
import { familyService } from '../backend/services/familyService';
import { donationService } from '../backend/services/donationService';
import { Gift, Calendar, MessageSquare, Heart } from 'lucide-react';
import type { Family, GiftCard } from '../backend/types';
import './BeneficiaryDashboard.css';

const BeneficiaryDashboard: React.FC = () => {
  const { user } = useAppContext();
  const [family, setFamily] = useState<Family | null>(null);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.beneficiaryId) return;
      const fam = await familyService.getFamilyById(user.beneficiaryId);
      setFamily(fam || null);
      
      // Mock fetching gift cards for this family
      const allHistory = await donationService.getDonationHistoryByUser('any'); // Not ideal service method, but for mock:
      setGiftCards([]); // Empty for now or mock data
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <div className="beneficiary-dashboard-page">
      <AppHeader title="Meu Benefício" />
      
      <main className="content p-4">
        <section className="welcome-header mb-6">
           <h2 className="text-2xl font-bold text-primary mb-1">Olá, {family?.representativeName || user?.name}</h2>
           <p className="text-sm text-outline">Acompanhe seu status e benefícios disponíveis.</p>
        </section>

        <section className="status-card mb-6 p-6 bg-primary text-inverted rounded-2xl shadow-glow-soft">
           <div className="flex items-center gap-4 mb-4">
              <div className="status-icon bg-white/20 p-3 rounded-full">
                 <Heart size={24} fill={family?.supportStatus === 'fed' ? 'white' : 'transparent'} />
              </div>
              <div className="flex flex-col">
                 <span className="text-xs opacity-80 uppercase font-bold tracking-wider">Status Atual</span>
                 <span className="text-xl font-bold">
                    {family?.supportStatus === 'fed' ? 'Alimentado hoje' : 'Aguardando apoio'}
                 </span>
              </div>
           </div>
           <p className="text-xs opacity-90 leading-relaxed">
             {family?.supportStatus === 'fed' 
               ? 'Sua família foi contemplada com uma doação hoje. O gift card já está disponível abaixo.' 
               : 'Estamos conectando doadores à sua família. Assim que houver uma doação, você será notificado.'}
           </p>
        </section>

        <section className="gift-cards-section mb-6">
           <h3 className="section-title mb-4 flex items-center gap-2">
              <Gift size={18} className="text-secondary" />
              <span>Gift Cards Disponíveis</span>
           </h3>
           
           {family?.supportStatus === 'fed' ? (
             <div className="gift-card-display p-4 bg-surface-highest border-2 border-dashed border-secondary rounded-xl text-center">
                <span className="text-xs text-outline block mb-1">CÓDIGO DE RESGATE</span>
                <span className="text-2xl font-mono font-black text-secondary tracking-widest">GC-ALIM-2026</span>
                <p className="text-[10px] text-outline mt-2">Válido em qualquer mercado parceiro ou iFood.</p>
             </div>
           ) : (
             <div className="empty-state p-8 text-center bg-surface-highest rounded-xl">
                <p className="text-sm text-outline italic">Nenhum gift card ativo no momento.</p>
             </div>
           )}
        </section>

        <section className="history-preview">
           <h3 className="section-title mb-4">Últimos Recebimentos</h3>
           <div className="flex-col gap-3">
              <div className="history-item p-3 bg-surface rounded-lg border border-outline/5 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-outline" />
                    <span className="text-sm">28/04/2026</span>
                 </div>
                 <span className="text-sm font-bold text-success">R$ 30,00</span>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
};

export default BeneficiaryDashboard;
