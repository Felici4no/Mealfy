import React from 'react';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import { ShieldCheck, UserCheck, Building2, FileText, RefreshCw } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
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
              <span className="bg-error text-inverted text-[10px] px-2 py-0.5 rounded-full">3</span>
           </div>
           
           <div className="admin-menu-item p-4 bg-surface-highest rounded-xl border border-outline/10 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                 <FileText size={20} className="text-primary" />
                 <span className="font-bold text-sm">Indicações de Famílias</span>
              </div>
              <span className="bg-error text-inverted text-[10px] px-2 py-0.5 rounded-full">12</span>
           </div>

           <div className="admin-menu-item p-4 bg-surface-highest rounded-xl border border-outline/10 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                 <UserCheck size={20} className="text-success" />
                 <span className="font-bold text-sm">Validar Beneficiários</span>
              </div>
           </div>
        </section>

        <section className="system-tools">
           <h3 className="section-title mb-4">Ferramentas de Teste</h3>
           <Button 
             variant="outline" 
             fullWidth 
             icon={<RefreshCw size={18} />}
             onClick={() => alert("Elegibilidade de todas as famílias resetada para 08:00 AM (Mock)")}
           >
             Simular Reset Diário (08:00 AM)
           </Button>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
