import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { authService } from '../backend/services/authService';
import { AuthError } from '../backend/services/authProvider';
import type { User } from '../backend/types';
import GoogleMockModal from '../components/ui/GoogleMockModal';
import './Auth.css';

// ─── Helpers de validação ──────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// ─── Tradução de códigos de erro para português ────────────────────────────
function mapAuthError(err: unknown): string {
  if (err instanceof AuthError) {
    switch (err.code) {
      case 'invalid_credentials': return 'E-mail ou senha incorretos.';
      case 'admin_blocked':       return 'Esta conta não possui acesso ao aplicativo Mealfy.';
      case 'account_pending':     return 'Sua conta ainda está em análise.';
      case 'account_suspended':   return 'Sua conta foi suspensa. Contate o suporte.';
      default:                    return 'Não foi possível entrar agora. Tente novamente.';
    }
  }
  return 'Não foi possível entrar agora. Tente novamente.';
}

// ─── Contas de teste (só renderizadas em DEV) ──────────────────────────────
const DEV_ACCOUNTS = [
  { label: 'Doador',       email: 'doador@mealfy.com'       },
  { label: 'Entidade',     email: 'entidade@mealfy.com'     },
  { label: 'Beneficiário', email: 'beneficiario@mealfy.com' },
];
const DEV_PASSWORD = '123456';

// ──────────────────────────────────────────────────────────────────────────────

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, isAuthenticated, user } = useAppContext();

  // ─── Form state ─────────────────────────────────────────────────────────
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Field-level errors (shown only after first submission attempt)
  const [touched, setTouched]     = useState({ email: false, password: false });
  const emailError   = touched.email   && !isValidEmail(email)   ? 'Informe um e-mail válido.'              : '';
  const passwordError= touched.password&& password.length < 6    ? 'A senha deve ter pelo menos 6 caracteres.' : '';

  // ─── Google mock modal ───────────────────────────────────────────────────
  const [showGoogleModal, setShowGoogleModal]   = useState(false);
  const [isGoogleLoading, setIsGoogleLoading]   = useState(false);
  const mockGoogleUsers: User[] = authService.getActiveMockUsers();

  const passwordRef = useRef<HTMLInputElement>(null);

  // ─── Redirect if already authenticated ──────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard-redirect';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setFormError('');

    if (!isValidEmail(email) || password.length < 6) return;
    if (isLoading) return;

    setIsLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      const from = (location.state as any)?.from?.pathname || '/dashboard-redirect';
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Google (mock em DEV, desabilitado em produção) ──────────────────────
  const handleGoogleClick = async () => {
    if (import.meta.env.DEV) {
      setIsGoogleLoading(true);
      // Pequeno delay antes de abrir o modal
      await new Promise<void>((r) => setTimeout(r, 700));
      setIsGoogleLoading(false);
      setShowGoogleModal(true);
    }
    // Em produção: botão desabilitado — não faz nada
  };

  const handleGoogleSelect = async (selectedUser: User) => {
    setShowGoogleModal(false);
    setIsLoading(true);
    setFormError('');
    try {
      await signInWithGoogle(selectedUser);
      navigate('/dashboard-redirect', { replace: true });
    } catch (err) {
      setFormError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── DEV: preenchimento rápido ────────────────────────────────────────────
  const fillDevAccount = (acc: typeof DEV_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(DEV_PASSWORD);
    setTouched({ email: false, password: false });
    setFormError('');
  };

  const isSubmitDisabled = isLoading || (touched.email && !!emailError) || (touched.password && !!passwordError);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="auth-page auth-login-page">
      {/* ── Hero ── */}
      <div className="auth-hero">
        <div className="auth-hero-overlay" />
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          alt=""
          className="auth-hero-image"
          aria-hidden="true"
        />
        <div className="auth-hero-content">
          <div className="auth-brand" aria-label="Mealfy">Mealfy</div>
          <h1 className="auth-hero-title">Bem-vindo de volta</h1>
          <p className="auth-hero-subtitle">
            Entre para continuar transformando conexões em impacto.
          </p>
        </div>
      </div>

      {/* ── Form panel ── */}
      <main className="auth-form-panel" id="main-content">
        <form onSubmit={handleSubmit} noValidate aria-label="Formulário de login">

          {/* E-mail */}
          <div className="auth-input-group">
            <label className="auth-input-label" htmlFor="auth-email">E-mail</label>
            <div className={`auth-input-wrapper ${emailError ? 'auth-input-wrapper--error' : ''}`}>
              <Mail size={18} className="auth-input-icon" aria-hidden="true" />
              <input
                id="auth-email"
                type="email"
                className="auth-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFormError(''); }}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
                aria-describedby={emailError ? 'email-error' : undefined}
                aria-invalid={!!emailError}
                onKeyDown={(e) => e.key === 'Enter' && passwordRef.current?.focus()}
              />
            </div>
            {emailError && (
              <p id="email-error" className="auth-field-error" role="alert">{emailError}</p>
            )}
          </div>

          {/* Senha */}
          <div className="auth-input-group">
            <div className="auth-label-row">
              <label className="auth-input-label" htmlFor="auth-password">Senha</label>
              <button
                type="button"
                className="auth-forgot-link"
                onClick={() => navigate('/forgot-password')}
                tabIndex={0}
              >
                Esqueci minha senha
              </button>
            </div>
            <div className={`auth-input-wrapper ${passwordError ? 'auth-input-wrapper--error' : ''}`}>
              <Lock size={18} className="auth-input-icon" aria-hidden="true" />
              <input
                id="auth-password"
                ref={passwordRef}
                type={showPwd ? 'text' : 'password'}
                className="auth-input auth-input--password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFormError(''); }}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                autoComplete="current-password"
                aria-describedby={passwordError ? 'password-error' : undefined}
                aria-invalid={!!passwordError}
              />
              <button
                type="button"
                className="auth-pwd-toggle"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && (
              <p id="password-error" className="auth-field-error" role="alert">{passwordError}</p>
            )}
          </div>

          {/* Erro global */}
          {formError && (
            <div className="auth-form-error" role="alert" aria-live="assertive">
              {formError}
            </div>
          )}

          {/* Botão entrar */}
          <button
            type="submit"
            className="auth-btn-primary"
            disabled={isSubmitDisabled}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="auth-spinner" aria-hidden="true" />
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Separador */}
        <div className="auth-separator" aria-hidden="true">
          <div className="auth-separator-line" />
          <span className="auth-separator-text">ou continue com</span>
          <div className="auth-separator-line" />
        </div>

        {/* Botão Google */}
        {import.meta.env.DEV ? (
          <button
            type="button"
            className="auth-btn-google"
            onClick={handleGoogleClick}
            disabled={isGoogleLoading}
            aria-busy={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <span className="auth-spinner auth-spinner--dark" aria-hidden="true" />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.78h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.74 3-4.3 3-7.3z" fill="#4285F4"/>
                  <path d="M10 20c2.7 0 4.97-.89 6.63-2.42l-3.23-2.5c-.9.6-2.05.96-3.4.96-2.6 0-4.82-1.76-5.6-4.12H1.07v2.58A10 10 0 0 0 10 20z" fill="#34A853"/>
                  <path d="M4.4 11.92A5.99 5.99 0 0 1 4.08 10c0-.67.12-1.32.32-1.92V5.5H1.07A10 10 0 0 0 0 10c0 1.61.38 3.14 1.07 4.5l3.33-2.58z" fill="#FBBC04"/>
                  <path d="M10 3.96c1.47 0 2.79.51 3.83 1.5l2.86-2.86C14.97.9 12.7 0 10 0A10 10 0 0 0 1.07 5.5l3.33 2.58C5.18 5.72 7.4 3.96 10 3.96z" fill="#EA4335"/>
                </svg>
                Continuar com Google
              </>
            )}
          </button>
        ) : (
          <button type="button" className="auth-btn-google auth-btn-google--disabled" disabled>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.78h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.74 3-4.3 3-7.3z" fill="#ccc"/>
              <path d="M10 20c2.7 0 4.97-.89 6.63-2.42l-3.23-2.5c-.9.6-2.05.96-3.4.96-2.6 0-4.82-1.76-5.6-4.12H1.07v2.58A10 10 0 0 0 10 20z" fill="#ccc"/>
              <path d="M4.4 11.92A5.99 5.99 0 0 1 4.08 10c0-.67.12-1.32.32-1.92V5.5H1.07A10 10 0 0 0 0 10c0 1.61.38 3.14 1.07 4.5l3.33-2.58z" fill="#ccc"/>
              <path d="M10 3.96c1.47 0 2.79.51 3.83 1.5l2.86-2.86C14.97.9 12.7 0 10 0A10 10 0 0 0 1.07 5.5l3.33 2.58C5.18 5.72 7.4 3.96 10 3.96z" fill="#ccc"/>
            </svg>
            Google — Em breve
          </button>
        )}

        {/* Link criar conta */}
        <p className="auth-register-prompt">
          Ainda não tem uma conta?{' '}
          <button
            type="button"
            className="auth-register-link"
            onClick={() => navigate('/register')}
          >
            Criar conta
          </button>
        </p>

        {/* ── Painel DEV (nunca aparece em produção) ── */}
        {import.meta.env.DEV && (
          <div className="auth-dev-panel" aria-label="Contas de teste (ambiente de desenvolvimento)">
            <p className="auth-dev-title">Contas para teste</p>
            <div className="auth-dev-chips">
              {DEV_ACCOUNTS.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  className="auth-dev-chip"
                  onClick={() => fillDevAccount(acc)}
                  title={`Preencher com ${acc.email} / ${DEV_PASSWORD}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
            <p className="auth-dev-hint">Clique para preencher. Senha: <code>{DEV_PASSWORD}</code></p>
          </div>
        )}
      </main>

      {/* ── Google mock modal (DEV only) ── */}
      {showGoogleModal && (
        <GoogleMockModal
          users={mockGoogleUsers}
          onSelect={handleGoogleSelect}
          onClose={() => setShowGoogleModal(false)}
        />
      )}
    </div>
  );
};

export default Auth;
