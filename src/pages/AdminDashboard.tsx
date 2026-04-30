import React from 'react';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import { ShieldCheck, UserCheck, Building2, FileText, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [pendingEntitiesCount, setPendingEntitiesCount] = React.useState(0);
  const [pendingFamiliesCount, setPendingFamiliesCount] = React.useState(0);

  const refreshCounts = () => {
    const users = JSON.parse(localStorage.getItem('users_db') || '[]');
    const families = JSON.parse(localStorage.getItem('families_db') || '[]');
    setPendingEntitiesCount(users.filter((u: any) => u.role === 'entity' && u.status === 'pending').length);
    setPendingFamiliesCount(families.filter((f: any) => f.status === 'pending').length);
  };

  React.useEffect(() => {
    refreshCounts();
  }, []);

  return (
    <div className="admin-dashboard-page">
      <AppHeader title="Painel Admin (Mock)" />
      
      <main className="content p-4">
        <section className="admin-header mb-6 flex items-center gap-3">
           <div className="bg-primary/10 p-3 rounded-full text-primary">
              <ShieldCheck size={32} />
           </div>
           <div>
              <h2 className="text-xl font-bold">Administração</h2>
              <p className="text-xs text-outline">Controle e moderação da plataforma.</p>
           </div>
        </section>

        <section className="admin-menu grid grid-cols-1 gap-3 mb-8">
           <div className="admin-menu-item p-4 bg-surface-highest rounded-xl border border-outline/10 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                 <Building2 size={20} className="text-secondary" />
                 <span className="font-bold text-sm">Entidades Pendentes</span>
              </div>
              {pendingEntitiesCount > 0 ? (
                <span className="bg-error text-inverted text-[10px] px-2 py-0.5 rounded-full">{pendingEntitiesCount}</span>
              ) : (
                <span className="text-[10px] text-outline">Nenhuma</span>
              )}
           </div>
           
           <div className="admin-menu-item p-4 bg-surface-highest rounded-xl border border-outline/10 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                 <FileText size={20} className="text-primary" />
                 <span className="font-bold text-sm">Indicações de Famílias</span>
              </div>
              {pendingFamiliesCount > 0 ? (
                <span className="bg-error text-inverted text-[10px] px-2 py-0.5 rounded-full">{pendingFamiliesCount}</span>
              ) : (
                <span className="text-[10px] text-outline">Nenhuma</span>
              )}
           </div>

           <div className="admin-menu-item p-4 bg-surface-highest rounded-xl border border-outline/10 flex items-center justify-between cursor-pointer opacity-50">
              <div className="flex items-center gap-3">
                 <UserCheck size={20} className="text-success" />
                 <span className="font-bold text-sm">Validar Beneficiários (Em breve)</span>
              </div>
           </div>
        </section>

        <section className="system-tools">
           <h3 className="section-title mb-4">Ferramentas de Teste (Mock)</h3>
           <div className="flex-col gap-3">
             <Button 
               variant="outline" 
               fullWidth 
               icon={<RefreshCw size={18} />}
               onClick={() => {
                 showToast("Elegibilidade de todas as famílias resetada para 08:00 AM (Mock)", "success");
                 refreshCounts();
               }}
             >
               Simular Reset Diário (08:00 AM)
             </Button>
             
             <Button 
               variant="outline" 
               fullWidth 
               className="mt-3 border-secondary text-secondary"
               onClick={() => {
                 const USERS_KEY = 'users_db';
                 const ENTITIES_KEY = 'entities_db';
                 const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
                 const entities = JSON.parse(localStorage.getItem(ENTITIES_KEY) || '[]');
                 
                 const pendingUser = users.find((u: any) => u.role === 'entity' && u.status === 'pending');
                 if (pendingUser) {
                   pendingUser.status = 'approved';
                   localStorage.setItem(USERS_KEY, JSON.stringify(users));
                   
                   if (pendingUser.entityId) {
                     const entityToApprove = entities.find((e: any) => e.id === pendingUser.entityId);
                     if (entityToApprove) {
                       entityToApprove.status = 'approved';
                       localStorage.setItem(ENTITIES_KEY, JSON.stringify(entities));
                     }
                   }

                   showToast(`Entidade ${pendingUser.name} aprovada com sucesso!`, "success");
                   refreshCounts();
                 } else {
                   showToast("Nenhuma entidade pendente encontrada para aprovar.", "info");
                 }
               }}
             >
               Aprovar Próxima Entidade
             </Button>

             <Button 
               variant="outline" 
               fullWidth 
               className="mt-3 border-success text-success"
               onClick={() => {
                 const FAMILIES_KEY = 'families_db';
                 const families = JSON.parse(localStorage.getItem(FAMILIES_KEY) || '[]');
                 const pendingFamilies = families.filter((f: any) => f.status === 'pending');
                 if (pendingFamilies.length > 0) {
                   pendingFamilies.forEach((f: any) => { f.status = 'approved'; f.supportStatus = 'needs_help'; });
                   localStorage.setItem(FAMILIES_KEY, JSON.stringify(families));
                   showToast(`${pendingFamilies.length} famílias aprovadas com sucesso!`, "success");
                   refreshCounts();
                 } else {
                   showToast("Nenhuma família pendente encontrada.", "info");
                 }
               }}
             >
               Aprovar Todas as Famílias Pendentes
             </Button>
           </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
