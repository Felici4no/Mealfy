import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Smartphone, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './Auth.css';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAppContext();
  
  const [loadingMethod, setLoadingMethod] = useState<'google'|'apple'|'phone'|'facebook'|null>(null);

  // If already authenticated, go to Home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (method: 'google'|'apple'|'phone'|'facebook') => {
    setLoadingMethod(method);
    try {
      await login(method, method === 'phone' ? '+5511999998888' : undefined);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      if (!isAuthenticated) setLoadingMethod(null);
    }
  };

  const handleAnonymous = () => {
    navigate('/donate');
  };

  return (
    <div className="auth-page">
      <main className="content p-4 flex-col justify-center auth-content">
        <div className="auth-header text-center mb-8">
          <div className="logo-placeholder mb-2">Mealfy</div>
          <h1 className="page-title text-primary mb-2">Entrar para continuar</h1>
          <p className="page-subtitle">Rápido, seguro e sem senhas complicadas para você focar no que importa: ajudar.</p>
        </div>

        <div className="auth-actions flex-col gap-4 mb-8">
          <Button 
            variant="outline" 
            size="large" 
            fullWidth
            onClick={() => handleLogin('apple')}
            disabled={loadingMethod !== null}
            className="auth-btn apple-btn"
            icon={loadingMethod === 'apple' ? <Loader2 size={24} className="animate-spin" /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="none"/><path d="M15.43 13.92c-.02-1.92 1.57-2.85 1.64-2.89-1.28-1.87-3.28-2.12-3.99-2.14-1.69-.17-3.29.98-4.14.98-.87 0-2.16-1.01-3.58-.98-1.84.03-3.53 1.07-4.48 2.72-1.93 3.32-.49 8.24 1.39 10.94.92 1.32 2.01 2.8 3.4 2.76 1.35-.05 1.87-.87 3.52-.87 1.63 0 2.1.87 3.53.84 1.45-.02 2.4-1.33 3.3-2.65 1.03-1.52 1.45-3 1.48-3.08-.03-.02-2.73-1.04-2.75-3.13zM12.91 8.52c.75-.92 1.25-2.2 1.11-3.48-1.08.05-2.42.72-3.2 1.64-.7.81-1.3 2.11-1.14 3.37 1.21.09 2.47-.63 3.23-1.53z"/></svg>}
          >
            {loadingMethod === 'apple' ? 'Autenticando...' : 'Continuar com Apple'}
          </Button>

          <Button 
            variant="outline" 
            size="large" 
            fullWidth
            onClick={() => handleLogin('google')}
            disabled={loadingMethod !== null}
            className="auth-btn google-btn"
            icon={loadingMethod === 'google' ? <Loader2 size={24} className="animate-spin" /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>}
          >
            {loadingMethod === 'google' ? 'Autenticando...' : 'Continuar com Google'}
          </Button>

          <Button 
            variant="outline" 
            size="large" 
            fullWidth
            onClick={() => handleLogin('facebook')}
            disabled={loadingMethod !== null}
            className="auth-btn facebook-btn"
            style={{ borderColor: '#1877F2', color: '#1877F2' }}
            icon={loadingMethod === 'facebook' ? <Loader2 size={24} className="animate-spin" /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>}
          >
            {loadingMethod === 'facebook' ? 'Autenticando...' : 'Continuar com Facebook'}
          </Button>

          <Button 
            variant="outline" 
            size="large" 
            fullWidth
            onClick={() => handleLogin('phone')}
            disabled={loadingMethod !== null}
            className="auth-btn phone-btn"
            icon={loadingMethod === 'phone' ? <Loader2 size={24} className="animate-spin" /> : <Smartphone size={24} color="var(--color-primary)" />}
          >
            {loadingMethod === 'phone' ? 'Enviando SMS...' : 'Continuar com Celular'}
          </Button>
        </div>

        <div className="auth-footer text-center">
          <p className="terms-text mb-4">
            Ao continuar, você concorda com nossos <a href="#">Termos de Uso</a> e <a href="#">Política de Privacidade</a>.
          </p>
          <button 
            className="skip-auth-btn text-primary"
            onClick={handleAnonymous}
            disabled={loadingMethod !== null}
          >
            Pular e doar como anônimo
          </button>
        </div>
      </main>
    </div>
  );
};

export default Auth;
