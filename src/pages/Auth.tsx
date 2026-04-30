import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Heart, Building2, UserCircle, ShieldCheck, ArrowRight, Loader2, Smartphone } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { UserRole } from '../backend/types';
import './Auth.css';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsRole, isAuthenticated, user } = useAppContext();
  
  const [view, setView] = useState<'picker' | 'login'>('picker');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || '/dashboard-redirect';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const roles = [
    { 
      id: 'donor' as UserRole, 
      title: 'Sou Doador', 
      desc: 'Doe em poucos segundos e ajude quem precisa.', 
      icon: <Heart size={28} />,
      theme: 'primary'
    },
    { 
      id: 'entity' as UserRole, 
      title: 'Sou Entidade', 
      desc: 'ONGs, igrejas e institutos autorizados.', 
      icon: <Building2 size={28} />,
      theme: 'secondary'
    },
    { 
      id: 'beneficiary' as UserRole, 
      title: 'Sou Beneficiário', 
      desc: 'Acesse seu benefício e gift cards.', 
      icon: <UserCircle size={28} />,
      theme: 'success'
    },
    { 
      id: 'admin' as UserRole, 
      title: 'Admin Mock', 
      desc: 'Acesso para moderação e testes.', 
      icon: <ShieldCheck size={28} />,
      theme: 'outline'
    }
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setView('login');
    // Pre-fill for easier testing
    if (role === 'admin') setIdentifier('admin@mealfy.org');
    if (role === 'entity') setIdentifier('ong.esperanca@ong.org');
    if (role === 'beneficiary') setIdentifier('123.456.789-00');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !identifier) return;
    setIsLoading(true);
    try {
      await loginAsRole(selectedRole, identifier);
    } catch (err) {
      alert("Erro ao entrar. Tente novamente.");
      setIsLoading(false);
    }
  };

  if (view === 'login') {
    return (
      <div className="auth-page login-view">
        <main className="content p-6 flex-col justify-center">
          <button className="back-btn mb-8 text-outline flex items-center gap-2" onClick={() => setView('picker')}>
             <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} /> Voltar
          </button>
          
          <div className="login-header mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Entrar como {selectedRole}</h1>
            <p className="text-outline">Insira seu identificador para acessar o painel exclusivo.</p>
          </div>

          <form onSubmit={handleLogin} className="flex-col gap-4">
            <div className="form-group">
              <label className="text-xs font-bold uppercase tracking-wider text-outline mb-2 block">
                {selectedRole === 'beneficiary' ? 'CPF ou Telefone' : 'E-mail ou CNPJ'}
              </label>
              <input 
                type="text" 
                className="w-full p-4 rounded-xl border border-outline/20 bg-surface-highest focus:border-primary outline-none transition-all"
                placeholder={selectedRole === 'beneficiary' ? '000.000.000-00' : 'nome@exemplo.com'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              size="large" 
              fullWidth 
              loading={isLoading}
              className="shadow-glow"
            >
              Entrar Agora
            </Button>
          </form>
          
          <div className="text-center mt-8">
            <p className="text-xs text-outline opacity-60">Acesso simulado para fins de demonstração técnica.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-page role-picker-view">
      <main className="content p-6 flex-col justify-center">
        <div className="auth-header text-center mb-10">
          <div className="logo-text font-serif text-4xl font-black text-primary italic mb-2">Mealfy</div>
          <p className="text-outline">Escolha como deseja acessar a plataforma</p>
        </div>

        <div className="roles-grid flex-col gap-4">
          {roles.map(role => (
            <button 
              key={role.id}
              className={`role-card p-5 rounded-2xl border border-outline/10 bg-surface-highest flex items-center gap-4 transition-all active:scale-95 text-left`}
              onClick={() => handleRoleSelect(role.id)}
            >
              <div className={`role-icon-bg bg-${role.theme}/10 text-${role.theme} p-3 rounded-xl`}>
                {role.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{role.title}</h3>
                <p className="text-xs text-outline leading-tight">{role.desc}</p>
              </div>
              <ArrowRight size={20} className="text-outline/30" />
            </button>
          ))}
        </div>

        <div className="auth-footer mt-12 text-center">
           <button className="text-primary font-bold flex items-center gap-2 mx-auto" onClick={() => navigate('/donate')}>
              Continuar como doador anônimo <ArrowRight size={16} />
           </button>
        </div>
      </main>
    </div>
  );
};

export default Auth;
