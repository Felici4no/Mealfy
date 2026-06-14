import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import { ShieldAlert, ExternalLink, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleExternalRedirect = () => {
    showToast('Redirecionando para o Mealfy Control Center (Portal Web)...', 'info');
  };

  return (
    <div className="admin-dashboard-page">
      <AppHeader title="Controle Administrativo" />
      
      <main className="content p-4 flex flex-col items-center justify-center min-h-[75vh]">
        <div className="text-center max-w-sm w-full bg-white p-6 rounded-lg border border-outline/10 shadow-sm flex flex-col items-center">
          <div className="bg-primary/10 p-4 rounded-md text-primary mb-4">
            <ShieldAlert size={40} />
          </div>
          
          <h2 className="text-xl font-bold text-primary mb-2">Restrito a Administradores</h2>
          <p className="text-xs text-outline leading-relaxed mb-6">
            O painel de moderação de entidades, auditoria de apoios e controle interno foi descontinuado no aplicativo móvel. 
            Toda a gestão é feita de forma centralizada pelo **Mealfy Control Center** (Portal Web).
          </p>

          <div className="flex flex-col gap-2 w-full">
            <Button 
              variant="primary" 
              fullWidth 
              size="large"
              icon={<ExternalLink size={16} />}
              onClick={handleExternalRedirect}
            >
              Acessar Portal Web Externo
            </Button>
            
            <Button 
              variant="outline" 
              fullWidth 
              size="large"
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate('/')}
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
