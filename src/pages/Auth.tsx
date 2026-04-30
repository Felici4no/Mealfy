import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Heart, Building2, UserCircle, ShieldCheck, ArrowRight, Loader2, Facebook } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import type { UserRole } from '../backend/types';
import './Auth.css';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsRole, isAuthenticated, user } = useAppContext();
  const { showToast } = useToast();
  
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
      showToast('Login realizado com sucesso', 'success');
    } catch (err) {
      showToast("Erro ao entrar. Verifique seus dados e tente novamente.", 'error');
      setIsLoading(false);
    }
  };

  if (view === 'login') {
    return (
      <div className="auth-page login-view">
        <main className="content p-6 flex-col justify-center">
          <button className="back-btn mb-8 text-outline flex items-center gap-2 active:scale-95 transition-transform" onClick={() => setView('picker')}>
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
              className="shadow-glow active:scale-95 transition-transform"
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
      <div className="auth-hero">
        <div className="auth-hero-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Criança sorrindo" 
          className="auth-hero-image"
        />
        <div className="auth-hero-content">
          <div className="logo-text font-serif text-4xl font-black text-white italic mb-2 drop-shadow-md">Mealfy</div>
          <h1 className="text-2xl font-bold text-white drop-shadow-md">Como você quer entrar?</h1>
        </div>
      </div>

      <main className="auth-content p-6 flex-col">
        <div className="roles-list flex-col gap-3 mb-6">
          <button 
            className="role-btn primary shadow-glow-soft active:scale-95 transition-transform"
            onClick={() => handleRoleSelect('donor')}
          >
            Sou Doador
          </button>
          
          <button 
            className="role-btn secondary active:scale-95 transition-transform"
            onClick={() => handleRoleSelect('entity')}
          >
            Sou Entidade Autorizada
          </button>

          <button 
            className="role-btn outline active:scale-95 transition-transform"
            onClick={() => handleRoleSelect('beneficiary')}
          >
            Sou Beneficiário
          </button>
          
          <button 
            className="role-btn subtle active:scale-95 transition-transform mt-2"
            onClick={() => handleRoleSelect('admin')}
          >
            <ShieldCheck size={16} /> Acesso Admin (Mock)
          </button>
        </div>

        <div className="separator mb-6 flex items-center justify-center gap-3">
          <div className="h-px bg-outline/20 flex-1"></div>
          <span className="text-xs font-bold text-outline uppercase">ou</span>
          <div className="h-px bg-outline/20 flex-1"></div>
        </div>

        <button 
          className="social-btn facebook active:scale-95 transition-transform"
          onClick={() => showToast('Login com Facebook não configurado no Mock.', 'info')}
        >
          <Facebook size={20} fill="currentColor" />
          Entrar com Facebook
        </button>

        <div className="auth-footer mt-8 text-center">
           <button 
             className="text-primary font-bold flex items-center justify-center gap-2 mx-auto active:scale-95 transition-transform" 
             onClick={() => navigate('/donate')}
           >
              Continuar como doador anônimo <ArrowRight size={16} />
           </button>
        </div>
      </main>
    </div>
  );
};

export default Auth;
