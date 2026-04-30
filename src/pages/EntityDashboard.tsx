import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { familyService } from '../backend/services/familyService';
import { Users, PlusCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Family } from '../backend/types';
import './EntityDashboard.css';

const EntityDashboard: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamilies = async () => {
      const all = await familyService.getFamilies();
      // Filter families by entityId (mocking entity relationship)
      setFamilies(all.filter(f => f.authorizingEntityId === user?.entityId || !f.authorizingEntityId));
      setLoading(false);
    };
    fetchFamilies();
  }, [user]);

  if (user?.status === 'pending') {
    return (
      <div className="entity-dashboard pending-status p-6 flex-col items-center justify-center text-center" style={{ height: '80vh' }}>
        <Clock size={80} className="text-secondary mb-6" />
        <h1 className="text-2xl font-bold mb-2">Cadastro em análise</h1>
        <p className="text-outline">
          Sua entidade está sendo validada por nossa equipe. Em breve você terá acesso ao painel completo.
        </p>
      </div>
    );
  }

  return (
    <div className="entity-dashboard-page">
      <AppHeader title="Painel da Entidade" />
      
      <main className="content p-4">
        <section className="entity-summary mb-6">
           <h2 className="text-xl font-bold text-primary mb-1">Olá, {user?.name}</h2>
           <p className="text-sm text-outline">Gerencie as famílias assistidas pela sua instituição.</p>
        </section>

        <section className="stats-grid grid grid-cols-2 gap-4 mb-6">
           <div className="stat-card p-4 bg-surface-highest rounded-xl border border-outline/10">
              <Users size={20} className="text-primary mb-2" />
              <span className="text-2xl font-bold">{families.length}</span>
              <span className="text-xs text-outline block">Famílias</span>
           </div>
           <div className="stat-card p-4 bg-surface-highest rounded-xl border border-outline/10">
              <CheckCircle size={20} className="text-success mb-2" />
              <span className="text-2xl font-bold">{families.filter(f => f.supportStatus === 'fed').length}</span>
              <span className="text-xs text-outline block">Alimentadas</span>
           </div>
        </section>

        <section className="actions-section mb-8">
           <Button 
             variant="primary" 
             fullWidth 
             icon={<PlusCircle size={20} />}
             onClick={() => navigate('/register-family')}
             className="shadow-glow"
           >
             Cadastrar Nova Família
           </Button>
        </section>

        <section className="families-list-section">
           <h3 className="section-title mb-4">Minhas Famílias</h3>
           {loading ? (
             <p>Carregando...</p>
           ) : families.length === 0 ? (
             <p className="text-outline text-center py-8">Nenhuma família cadastrada.</p>
           ) : (
             <div className="flex-col gap-3">
                {families.map(fam => (
                  <div key={fam.id} className="family-list-item p-4 bg-surface rounded-xl border border-outline/10 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="font-bold text-sm">{fam.representativeName}</span>
                        <span className="text-xs text-outline">{fam.neighborhood}</span>
                     </div>
                     <div className={`status-pill text-[10px] px-2 py-1 rounded-full font-bold uppercase ${fam.supportStatus === 'fed' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                        {fam.supportStatus === 'fed' ? 'Alimentada' : 'Pendente'}
                     </div>
                  </div>
                ))}
             </div>
           )}
        </section>
      </main>
    </div>
  );
};

export default EntityDashboard;
