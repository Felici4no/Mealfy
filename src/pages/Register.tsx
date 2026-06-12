import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import { authService } from '../backend/services/authService';
import { useToast } from '../context/ToastContext';
import { useAppContext } from '../context/AppContext';
import { Heart, Building2, ArrowRight, CircleUser as UserCircle, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

type Step = 'picker' | 'donor' | 'entity' | 'beneficiary';

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { fetchSession, signIn } = useAppContext();

  const [step, setStep] = useState<Step>('picker');
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // ── Donor form ───────────────────────────────────────────────────────────
  const [donorData, setDonorData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    documentType: 'cpf' as 'cpf' | 'cnpj',
    documentNumber: '',
    phone: '',
    instagram: '',
    showInstagram: true,
    showOnRanking: true,
    anonymousMode: false,
  });

  // ── Entity form ──────────────────────────────────────────────────────────
  const [entityData, setEntityData] = useState({
    name: '',
    cnpj: '',
    type: 'ONG' as any,
    responsibleName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    region: '',
  });

  // ── Beneficiary form ─────────────────────────────────────────────────────
  const [beneficiaryData, setBeneficiaryData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // ── Shared validation ────────────────────────────────────────────────────
  const validatePasswords = (pwd: string, confirm: string): string | null => {
    if (pwd.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    if (pwd !== confirm) return 'As senhas não coincidem.';
    return null;
  };

  // ── Donor submit ─────────────────────────────────────────────────────────
  const handleRegisterDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(donorData.email)) { showToast('Informe um e-mail válido.', 'error'); return; }
    const pwdError = validatePasswords(donorData.password, donorData.confirmPassword);
    if (pwdError) { showToast(pwdError, 'error'); return; }

    setIsLoading(true);
    try {
      await authService.registerUser({
        name: donorData.name,
        email: donorData.email,
        password: donorData.password,
        role: 'donor',
        phone: donorData.phone,
      });
      // Auto-login após cadastro de doador (status active)
      await signIn(donorData.email, donorData.password);
      showToast('Conta criada com sucesso!', 'success');
      navigate('/dashboard-redirect', { replace: true });
    } catch (err: any) {
      showToast(err?.message || 'Erro ao criar conta.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Entity submit ────────────────────────────────────────────────────────
  const handleRegisterEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(entityData.email)) { showToast('Informe um e-mail válido.', 'error'); return; }
    const pwdError = validatePasswords(entityData.password, entityData.confirmPassword);
    if (pwdError) { showToast(pwdError, 'error'); return; }

    setIsLoading(true);
    try {
      await authService.registerEntity({
        name: entityData.name,
        cnpj: entityData.cnpj,
        type: entityData.type,
        responsibleName: entityData.responsibleName,
        email: entityData.email,
        phone: entityData.phone,
        region: entityData.region,
      });
      await fetchSession();
      showToast('Cadastro enviado para análise. Você pode entrar quando aprovado.', 'success');
      navigate('/auth', { replace: true });
    } catch (err: any) {
      showToast(err?.message || 'Erro ao cadastrar entidade.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Beneficiary submit ───────────────────────────────────────────────────
  const handleRegisterBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(beneficiaryData.email)) { showToast('Informe um e-mail válido.', 'error'); return; }
    const pwdError = validatePasswords(beneficiaryData.password, beneficiaryData.confirmPassword);
    if (pwdError) { showToast(pwdError, 'error'); return; }

    setIsLoading(true);
    try {
      await authService.registerUser({
        name: beneficiaryData.name,
        email: beneficiaryData.email,
        password: beneficiaryData.password,
        role: 'beneficiary',
        phone: beneficiaryData.phone,
      });
      showToast('Conta criada! Aguarde vinculação com uma entidade para ter acesso completo.', 'success');
      navigate('/auth', { replace: true });
    } catch (err: any) {
      showToast(err?.message || 'Erro ao criar conta.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Password field helper ────────────────────────────────────────────────
  const PwdToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button type="button" className="auth-pwd-toggle" onClick={onToggle} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  // ── Donor form view ──────────────────────────────────────────────────────
  if (step === 'donor') {
    return (
      <div className="auth-page login-view">
        <div className="login-hero">
          <button className="back-btn" onClick={() => setStep('picker')} aria-label="Voltar">
            <ArrowRight size={24} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h1 className="login-hero-title">Criar conta como Doador</h1>
          <p className="login-hero-subtitle">Doe em poucos segundos e acompanhe seu impacto.</p>
        </div>
        <main className="login-content p-6 flex-col">
          <form onSubmit={handleRegisterDonor} className="flex-col gap-4 mt-2">
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input type="text" className="form-input" required value={donorData.name} onChange={e => setDonorData({...donorData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input type="email" className="form-input" required value={donorData.email} onChange={e => setDonorData({...donorData, email: e.target.value})} autoComplete="email" />
            </div>

            <div className="flex gap-3">
              <div className="form-group w-1/3">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={donorData.documentType} onChange={e => setDonorData({...donorData, documentType: e.target.value as any})}>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                </select>
              </div>
              <div className="form-group flex-1">
                <label className="form-label">{donorData.documentType.toUpperCase()}</label>
                <input type="text" className="form-input" required value={donorData.documentNumber} onChange={e => setDonorData({...donorData, documentNumber: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <div className="auth-input-wrapper" style={{border:'1.5px solid #e4beb9', borderRadius:14}}>
                <input type={showPwd ? 'text' : 'password'} className="form-input" style={{border:'none',outline:'none',flex:1,paddingRight:44}} required minLength={6} value={donorData.password} onChange={e => setDonorData({...donorData, password: e.target.value})} autoComplete="new-password" />
                <PwdToggle show={showPwd} onToggle={() => setShowPwd(v => !v)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Senha</label>
              <div className="auth-input-wrapper" style={{border:'1.5px solid #e4beb9', borderRadius:14}}>
                <input type={showConfirmPwd ? 'text' : 'password'} className="form-input" style={{border:'none',outline:'none',flex:1,paddingRight:44}} required minLength={6} value={donorData.confirmPassword} onChange={e => setDonorData({...donorData, confirmPassword: e.target.value})} autoComplete="new-password" />
                <PwdToggle show={showConfirmPwd} onToggle={() => setShowConfirmPwd(v => !v)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Telefone (opcional)</label>
              <input type="text" className="form-input" value={donorData.phone} onChange={e => setDonorData({...donorData, phone: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Instagram (opcional)</label>
              <input type="text" className="form-input" placeholder="@seu_usuario" value={donorData.instagram} onChange={e => setDonorData({...donorData, instagram: e.target.value})} />
            </div>

            <div className="bg-surface-highest p-4 rounded-xl flex-col gap-3 my-2">
              <label className="flex items-center gap-2 text-sm text-text-main">
                <input type="checkbox" checked={donorData.showInstagram} onChange={e => setDonorData({...donorData, showInstagram: e.target.checked})} />
                Exibir Instagram no perfil
              </label>
              <label className="flex items-center gap-2 text-sm text-text-main">
                <input type="checkbox" checked={donorData.showOnRanking} onChange={e => setDonorData({...donorData, showOnRanking: e.target.checked})} />
                Aparecer no Ranking
              </label>
              <label className="flex items-center gap-2 text-sm text-text-main">
                <input type="checkbox" checked={donorData.anonymousMode} onChange={e => setDonorData({...donorData, anonymousMode: e.target.checked})} />
                Doar anonimamente
              </label>
            </div>

            <Button type="submit" size="large" fullWidth loading={isLoading} className="mt-2">Criar Conta</Button>
          </form>
        </main>
      </div>
    );
  }

  // ── Entity form view ─────────────────────────────────────────────────────
  if (step === 'entity') {
    return (
      <div className="auth-page login-view">
        <div className="login-hero">
          <button className="back-btn" onClick={() => setStep('picker')} aria-label="Voltar">
            <ArrowRight size={24} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h1 className="login-hero-title" style={{fontSize: '1.75rem'}}>Seja uma entidade autorizada</h1>
          <p className="login-hero-subtitle">Após aprovação, sua organização poderá cadastrar famílias assistidas.</p>
        </div>
        <main className="login-content p-6 flex-col">
          <form onSubmit={handleRegisterEntity} className="flex-col gap-4 mt-2">
            <div className="form-group">
              <label className="form-label">Nome da Entidade</label>
              <input type="text" className="form-input" required value={entityData.name} onChange={e => setEntityData({...entityData, name: e.target.value})} />
            </div>

            <div className="flex gap-3">
              <div className="form-group w-1/2">
                <label className="form-label">CNPJ</label>
                <input type="text" className="form-input" required placeholder="00.000.000/0001-00" value={entityData.cnpj} onChange={e => setEntityData({...entityData, cnpj: e.target.value})} />
              </div>
              <div className="form-group w-1/2">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={entityData.type} onChange={e => setEntityData({...entityData, type: e.target.value as any})}>
                  <option value="ONG">ONG</option>
                  <option value="igreja">Igreja</option>
                  <option value="escola">Escola</option>
                  <option value="instituto">Instituto</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nome do Responsável</label>
              <input type="text" className="form-input" required value={entityData.responsibleName} onChange={e => setEntityData({...entityData, responsibleName: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">E-mail Comercial</label>
              <input type="email" className="form-input" required value={entityData.email} onChange={e => setEntityData({...entityData, email: e.target.value})} autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="form-label">Senha de acesso</label>
              <div className="auth-input-wrapper" style={{border:'1.5px solid #e4beb9', borderRadius:14}}>
                <input type={showPwd ? 'text' : 'password'} className="form-input" style={{border:'none',outline:'none',flex:1,paddingRight:44}} required minLength={6} value={entityData.password} onChange={e => setEntityData({...entityData, password: e.target.value})} autoComplete="new-password" />
                <PwdToggle show={showPwd} onToggle={() => setShowPwd(v => !v)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Senha</label>
              <div className="auth-input-wrapper" style={{border:'1.5px solid #e4beb9', borderRadius:14}}>
                <input type={showConfirmPwd ? 'text' : 'password'} className="form-input" style={{border:'none',outline:'none',flex:1,paddingRight:44}} required minLength={6} value={entityData.confirmPassword} onChange={e => setEntityData({...entityData, confirmPassword: e.target.value})} autoComplete="new-password" />
                <PwdToggle show={showConfirmPwd} onToggle={() => setShowConfirmPwd(v => !v)} />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="form-group w-1/2">
                <label className="form-label">Telefone</label>
                <input type="text" className="form-input" required value={entityData.phone} onChange={e => setEntityData({...entityData, phone: e.target.value})} />
              </div>
              <div className="form-group w-1/2">
                <label className="form-label">Região</label>
                <input type="text" className="form-input" required value={entityData.region} onChange={e => setEntityData({...entityData, region: e.target.value})} />
              </div>
            </div>

            <Button type="submit" size="large" fullWidth loading={isLoading} className="mt-4">Cadastrar Organização</Button>
            <p className="text-xs text-center text-outline mt-2">Sua solicitação entrará em análise pela nossa equipe.</p>
          </form>
        </main>
      </div>
    );
  }

  // ── Beneficiary form view ────────────────────────────────────────────────
  if (step === 'beneficiary') {
    return (
      <div className="auth-page login-view">
        <div className="login-hero">
          <button className="back-btn" onClick={() => setStep('picker')} aria-label="Voltar">
            <ArrowRight size={24} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h1 className="login-hero-title">Criar conta como Beneficiário</h1>
          <p className="login-hero-subtitle">Crie sua conta e aguarde o vínculo com uma entidade autorizada.</p>
        </div>
        <main className="login-content p-6 flex-col">
          <form onSubmit={handleRegisterBeneficiary} className="flex-col gap-4 mt-2">
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input type="text" className="form-input" required value={beneficiaryData.name} onChange={e => setBeneficiaryData({...beneficiaryData, name: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input type="email" className="form-input" required value={beneficiaryData.email} onChange={e => setBeneficiaryData({...beneficiaryData, email: e.target.value})} autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <div className="auth-input-wrapper" style={{border:'1.5px solid #e4beb9', borderRadius:14}}>
                <input type={showPwd ? 'text' : 'password'} className="form-input" style={{border:'none',outline:'none',flex:1,paddingRight:44}} required minLength={6} value={beneficiaryData.password} onChange={e => setBeneficiaryData({...beneficiaryData, password: e.target.value})} autoComplete="new-password" />
                <PwdToggle show={showPwd} onToggle={() => setShowPwd(v => !v)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Senha</label>
              <div className="auth-input-wrapper" style={{border:'1.5px solid #e4beb9', borderRadius:14}}>
                <input type={showConfirmPwd ? 'text' : 'password'} className="form-input" style={{border:'none',outline:'none',flex:1,paddingRight:44}} required minLength={6} value={beneficiaryData.confirmPassword} onChange={e => setBeneficiaryData({...beneficiaryData, confirmPassword: e.target.value})} autoComplete="new-password" />
                <PwdToggle show={showConfirmPwd} onToggle={() => setShowConfirmPwd(v => !v)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Telefone (opcional)</label>
              <input type="text" className="form-input" value={beneficiaryData.phone} onChange={e => setBeneficiaryData({...beneficiaryData, phone: e.target.value})} />
            </div>

            <div className="bg-surface-highest p-4 rounded-xl">
              <p className="text-xs text-outline leading-relaxed">
                Após criar sua conta, você precisará ser vinculado a uma entidade autorizada pela equipe Mealfy para acessar os benefícios.
              </p>
            </div>

            <Button type="submit" size="large" fullWidth loading={isLoading} className="mt-2">Criar Conta</Button>
          </form>
        </main>
      </div>
    );
  }

  // ── Picker (default) ─────────────────────────────────────────────────────
  return (
    <div className="auth-page role-picker-view">
      <AppHeader transparent showBack onBack={() => navigate('/auth')} />
      <div className="auth-hero pt-16">
        <div className="auth-hero-overlay" />
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          alt="Criança sorrindo"
          className="auth-hero-image"
        />
        <div className="auth-hero-content">
          <div className="auth-brand">Mealfy</div>
          <h1 className="auth-hero-title">Como você quer participar?</h1>
        </div>
      </div>

      <main className="auth-content p-6 flex-col">
        <div className="roles-list flex-col gap-4 mb-6 mt-4">
          <button className="role-card-btn" onClick={() => setStep('donor')}>
            <div className="role-icon-wrapper bg-primary/10 text-primary">
              <Heart size={24} />
            </div>
            <div className="role-card-text">
              <h3>Quero doar</h3>
              <p>Doe em poucos segundos e acompanhe seu impacto.</p>
            </div>
            <ArrowRight size={20} className="text-outline/40" />
          </button>

          <button className="role-card-btn" onClick={() => setStep('entity')}>
            <div className="role-icon-wrapper bg-secondary/10 text-secondary">
              <Building2 size={24} />
            </div>
            <div className="role-card-text">
              <h3>Sou uma entidade</h3>
              <p>Cadastre famílias e conecte doações à sua comunidade.</p>
            </div>
            <ArrowRight size={20} className="text-outline/40" />
          </button>

          <button className="role-card-btn" onClick={() => setStep('beneficiary')}>
            <div className="role-icon-wrapper bg-success/10 text-success">
              <UserCircle size={24} />
            </div>
            <div className="role-card-text">
              <h3>Sou Beneficiário</h3>
              <p>Crie sua conta para acessar seu painel de recebimentos.</p>
            </div>
            <ArrowRight size={20} className="text-outline/40" />
          </button>
        </div>

        <div className="auth-footer mt-auto text-center flex-col gap-6">
          <button
            className="text-primary font-bold flex items-center justify-center gap-2 mx-auto text-sm"
            onClick={() => navigate('/auth')}
          >
            Já tenho uma conta
          </button>
        </div>
      </main>
    </div>
  );
};

export default Register;
