import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Apple } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { AuthError } from '../backend/services/authProvider';
import GovBrMockModal, { type GovBrMockData } from '../components/ui/GovBrMockModal';
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
      case 'network_error':       return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
      default:                    return 'Não foi possível entrar agora. Tente novamente.';
    }
  }
  return 'Não foi possível entrar agora. Tente novamente.';
}

// ─── Contas de teste (só renderizadas em DEV) ──────────────────────────────
const DEV_ACCOUNTS = [
  { label: 'Apoiador',     email: 'doador@mealfy.com'       },
  { label: 'Entidade',     email: 'entidade@mealfy.com'     },
  { label: 'Beneficiário', email: 'beneficiario@mealfy.com' },
  { label: 'Admin',        email: 'admin@mealfy.com'        },
];
const DEV_PASSWORD = '123456';

// ──────────────────────────────────────────────────────────────────────────────

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, user } = useAppContext();
  const { showToast } = useToast();

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

  // ─── Meta mock login ──────────────────────────────────────────────────────
  const [isMetaLoading, setIsMetaLoading] = useState(false);

  // ─── Apple mock login ──────────────────────────────────────────────────────
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  // ─── Gov.br mock login/verificação ────────────────────────────────────────
  const [isGovLoading, setIsGovLoading]   = useState(false);
  const [showGovModal, setShowGovModal]   = useState(false);
  const mockGovData: GovBrMockData = {
    name: 'Maria da Silva Santos',
    birthDate: '14/03/1990',
    cpf: '123.***.***-09',
  };

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

  // ─── Meta (mock, visual apenas — sem chamada real) ───────────────────────
  // TODO(social-login): trocar o mock por authService.signInWithOAuth('facebook', token)
  // quando o plugin nativo (@capacitor-community/facebook-login) e o FACEBOOK_APP_ID
  // estiverem configurados. O backend (/auth/oauth/facebook) já está pronto.
  const handleMetaClick = async () => {
    if (isMetaLoading) return;
    setIsMetaLoading(true);
    await new Promise<void>((r) => setTimeout(r, 1200));
    setIsMetaLoading(false);
    showToast('Login via Meta realizado com sucesso', 'success');
  };

  // ─── Apple (mock, visual apenas — sem chamada real) ──────────────────────
  // TODO(social-login): trocar o mock por authService.signInWithOAuth('apple', idToken, name)
  // quando o "Sign in with Apple" nativo e o APPLE_CLIENT_ID estiverem configurados.
  // Obrigatório no iOS sempre que Google/Facebook forem oferecidos (App Store 4.8).
  // O backend (/auth/oauth/apple) já está pronto.
  const handleAppleClick = async () => {
    if (isAppleLoading) return;
    setIsAppleLoading(true);
    await new Promise<void>((r) => setTimeout(r, 1200));
    setIsAppleLoading(false);
    showToast('Login via Apple realizado com sucesso', 'success');
  };

  // ─── Gov.br (mock, visual apenas — sem chamada real) ─────────────────────
  const handleGovClick = async () => {
    if (isGovLoading) return;
    setIsGovLoading(true);
    await new Promise<void>((r) => setTimeout(r, 1200));
    setIsGovLoading(false);
    setShowGovModal(true);
  };

  const handleGovConfirm = () => {
    setShowGovModal(false);
    showToast('Identidade verificada via Gov.br', 'success');
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
          src="/images/login-hero.jpg"
          alt=""
          className="auth-hero-image"
          aria-hidden="true"
          onError={(e) => {
            const t = e.currentTarget;
            if (!t.dataset.fallback) {
              t.dataset.fallback = '1';
              t.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            }
          }}
        />
        <div className="auth-hero-content">
          <div className="auth-brand" aria-label="Mealfy">Mealfy</div>
          <h1 className="auth-hero-title">Bem-vindo</h1>
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

        {/* Botão Google — desativado: não há OAuth real no backend ainda, e um
            login mock aqui geraria uma sessão sem token válido para a API. */}
        <button type="button" className="auth-btn-google auth-btn-google--disabled" disabled>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.78h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.74 3-4.3 3-7.3z" fill="#ccc"/>
            <path d="M10 20c2.7 0 4.97-.89 6.63-2.42l-3.23-2.5c-.9.6-2.05.96-3.4.96-2.6 0-4.82-1.76-5.6-4.12H1.07v2.58A10 10 0 0 0 10 20z" fill="#ccc"/>
            <path d="M4.4 11.92A5.99 5.99 0 0 1 4.08 10c0-.67.12-1.32.32-1.92V5.5H1.07A10 10 0 0 0 0 10c0 1.61.38 3.14 1.07 4.5l3.33-2.58z" fill="#ccc"/>
            <path d="M10 3.96c1.47 0 2.79.51 3.83 1.5l2.86-2.86C14.97.9 12.7 0 10 0A10 10 0 0 0 1.07 5.5l3.33 2.58C5.18 5.72 7.4 3.96 10 3.96z" fill="#ccc"/>
          </svg>
          Google — Em breve
        </button>

        {/* Botão Meta (mock visual) */}
        <button
          type="button"
          className="auth-btn-meta"
          onClick={handleMetaClick}
          disabled={isMetaLoading}
          aria-busy={isMetaLoading}
        >
          {isMetaLoading ? (
            <span className="auth-spinner" aria-hidden="true" />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M20 10.06C20 4.74 15.52.5 10 .5S0 4.74 0 10.06c0 4.8 3.66 8.79 8.44 9.44v-6.7H6.13v-2.74h2.31V8.02c0-2.28 1.4-3.54 3.49-3.54.98 0 1.83.07 2.08.1v2.4h-1.42c-1.12 0-1.34.53-1.34 1.3v1.78h2.68l-.35 2.74h-2.33v6.7C16.34 18.85 20 14.86 20 10.06z" fill="#1877F2"/>
                <path d="M13.58 12.8l.35-2.74h-2.68V8.28c0-.77.22-1.3 1.34-1.3h1.42v-2.4c-.25-.03-1.1-.1-2.08-.1-2.09 0-3.49 1.26-3.49 3.54v1.74H6.13v2.74h2.31v6.7c.49.06.99.1 1.5.1.43 0 .85-.03 1.26-.08v-6.72h2.38z" fill="#fff"/>
              </svg>
              Continuar com Meta
            </>
          )}
        </button>

        {/* Botão Apple (mock visual) */}
        <button
          type="button"
          className="auth-btn-apple"
          onClick={handleAppleClick}
          disabled={isAppleLoading}
          aria-busy={isAppleLoading}
        >
          {isAppleLoading ? (
            <span className="auth-spinner" aria-hidden="true" />
          ) : (
            <>
              <Apple size={20} fill="currentColor" aria-hidden="true" />
              Continuar com Apple
            </>
          )}
        </button>

        {/* Botão Gov.br (mock visual) */}
        <button
          type="button"
          className="auth-btn-govbr"
          onClick={handleGovClick}
          disabled={isGovLoading}
          aria-busy={isGovLoading}
        >
          {isGovLoading ? (
            <span className="auth-spinner" aria-hidden="true" />
          ) : (
            <>
              <span className="govbr-icon" aria-hidden="true">
                <ShieldCheck size={18} color="#FFCD07" strokeWidth={2.5} />
              </span>
              Entrar com Gov.br
            </>
          )}
        </button>

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

      {/* ── Gov.br mock modal ── */}
      {showGovModal && (
        <GovBrMockModal
          data={mockGovData}
          onConfirm={handleGovConfirm}
          onClose={() => setShowGovModal(false)}
        />
      )}
    </div>
  );
};

export default Auth;
