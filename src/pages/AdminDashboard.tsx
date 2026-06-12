import React from 'react';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import { ShieldCheck, Users, Building2, Heart, UserCheck, FileText, RefreshCw, TrendingUp, MapPin, DollarSign, CircleCheck as CheckCircle, Circle as XCircle, TriangleAlert as AlertTriangle, Loader as Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  useAdminDashboard,
  approveIndication,
  rejectIndication,
  convertIndicationToFamily,
  approveEntity,
  rejectEntity
} from '../hooks/useAdminDashboard';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const {
    stats,
    donorRanking,
    pendingIndications,
    pendingEntities,
    loading,
    error,
    refresh
  } = useAdminDashboard();

  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const handleApproveIndication = async (id: string) => {
    setActionLoading(id);
    try {
      await approveIndication(id);
      showToast('Indicacao aprovada com sucesso', 'success');
      refresh();
    } catch (err) {
      showToast('Erro ao aprovar indicacao', 'error');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectIndication = async (id: string) => {
    setActionLoading(id);
    try {
      await rejectIndication(id);
      showToast('Indicacao rejeitada', 'success');
      refresh();
    } catch (err) {
      showToast('Erro ao rejeitar indicacao', 'error');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConvertIndication = async (id: string) => {
    setActionLoading(id);
    try {
      await convertIndicationToFamily(id);
      showToast('Indicacao convertida em familia com sucesso', 'success');
      refresh();
    } catch (err) {
      showToast('Erro ao converter indicacao', 'error');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveEntity = async (id: string) => {
    setActionLoading(id);
    try {
      await approveEntity(id);
      showToast('Entidade aprovada com sucesso', 'success');
      refresh();
    } catch (err) {
      showToast('Erro ao aprovar entidade', 'error');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEntity = async (id: string) => {
    setActionLoading(id);
    try {
      await rejectEntity(id);
      showToast('Entidade rejeitada', 'success');
      refresh();
    } catch (err) {
      showToast('Erro ao rejeitar entidade', 'error');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <AppHeader title="Painel Administrativo" />
        <main className="content p-4 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm text-outline">Carregando dados...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-page">
        <AppHeader title="Painel Administrativo" />
        <main className="content p-4">
          <div className="bg-error/10 p-4 rounded-xl border border-error/20 text-center">
            <AlertTriangle className="mx-auto text-error mb-2" size={32} />
            <p className="text-error font-medium">Erro ao carregar dados</p>
            <p className="text-sm text-outline mt-1">{error.message}</p>
            <Button variant="outline" onClick={refresh} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <AppHeader title="Painel Administrativo" />

      <main className="content p-4">
        {/* Header Section */}
        <section className="admin-header mb-6 flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <ShieldCheck size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Administracao</h2>
            <p className="text-xs text-outline">Controle e modarecao da plataforma.</p>
          </div>
          <Button
            variant="outline"
            size="small"
            icon={<RefreshCw size={16} />}
            onClick={refresh}
          >
            Atualizar
          </Button>
        </section>

        {/* Stats Overview */}
        {stats && (
          <>
            {/* Users Stats */}
            <section className="mb-6">
              <h3 className="section-title mb-3 flex items-center gap-2">
                <Users size={18} />
                Usuarios por Perfil
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-highest p-4 rounded-xl border border-outline/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart size={16} className="text-primary" />
                    <span className="text-xs text-outline">Doadores</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{stats.usersByRole.donors}</p>
                </div>
                <div className="bg-surface-highest p-4 rounded-xl border border-outline/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={16} className="text-secondary" />
                    <span className="text-xs text-outline">Entidades</span>
                  </div>
                  <p className="text-2xl font-bold text-secondary">{stats.usersByRole.entities}</p>
                </div>
                <div className="bg-surface-highest p-4 rounded-xl border border-outline/10">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck size={16} className="text-success" />
                    <span className="text-xs text-outline">Beneficiarios</span>
                  </div>
                  <p className="text-2xl font-bold text-success">{stats.usersByRole.beneficiaries}</p>
                </div>
                <div className="bg-surface-highest p-4 rounded-xl border border-outline/10">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={16} className="text-warning" />
                    <span className="text-xs text-outline">Admins</span>
                  </div>
                  <p className="text-2xl font-bold text-warning">{stats.usersByRole.admins}</p>
                </div>
              </div>
            </section>

            {/* Families Stats */}
            <section className="mb-6">
              <h3 className="section-title mb-3 flex items-center gap-2">
                <Users size={18} />
                Familias
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-highest p-4 rounded-xl border border-outline/10">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-warning" />
                    <span className="text-[10px] text-outline">Pendentes</span>
                  </div>
                  <p className="text-xl font-bold">{stats.familiesByStatus.pending}</p>
                </div>
                <div className="bg-surface-highest p-4 rounded-xl border border-outline/10">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={14} className="text-success" />
                    <span className="text-[10px] text-outline">Aprovadas</span>
                  </div>
                  <p className="text-xl font-bold">{stats.familiesByStatus.approved}</p>
                </div>
                <div className="bg-surface-highest p-4 rounded-xl border border-outline/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart size={14} className="text-error" />
                    <span className="text-[10px] text-outline">Precisam</span>
                  </div>
                  <p className="text-xl font-bold text-error">{stats.familiesBySupportStatus.needs_help}</p>
                </div>
              </div>
            </section>

            {/* Donations Stats */}
            <section className="mb-6">
              <h3 className="section-title mb-3 flex items-center gap-2">
                <DollarSign size={18} />
                Doacoes
              </h3>
              <div className="bg-surface-highest p-4 rounded-xl border border-outline/10">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-outline">Total de Doacoes</p>
                    <p className="text-2xl font-bold">{stats.donations.total}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-outline">Valor Acumulado</p>
                    <p className="text-2xl font-bold text-success">
                      R$ {stats.donations.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Communities Stats */}
            <section className="mb-6">
              <h3 className="section-title mb-3 flex items-center gap-2">
                <MapPin size={18} />
                Comunidades
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-highest p-4 rounded-xl border border-outline/10">
                  <p className="text-[10px] text-outline mb-1">Total</p>
                  <p className="text-xl font-bold">{stats.communities.total}</p>
                </div>
                <div className="bg-surface-highest p-4 rounded-xl border border-outline/10">
                  <p className="text-[10px] text-outline mb-1">Familias</p>
                  <p className="text-xl font-bold">{stats.communities.totalFamilies}</p>
                </div>
                <div className="bg-surface-highest p-4 rounded-xl border border-outline/10">
                  <p className="text-[10px] text-outline mb-1">Em Necessidade</p>
                  <p className="text-xl font-bold text-error">{stats.communities.totalFamiliesInNeed}</p>
                </div>
              </div>
            </section>

            {/* Donor Ranking */}
            <section className="mb-6">
              <h3 className="section-title mb-3 flex items-center gap-2">
                <TrendingUp size={18} />
                Ranking de Doadores
              </h3>
              {donorRanking.length === 0 ? (
                <div className="bg-surface-highest p-4 rounded-xl border border-outline/10 text-center">
                  <p className="text-sm text-outline">Nenhum doador ainda</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {donorRanking.map((donor, index) => (
                    <div
                      key={donor.id}
                      className="bg-surface-highest p-3 rounded-xl border border-outline/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-warning/20 text-warning' :
                          index === 1 ? 'bg-outline/20 text-outline' :
                          index === 2 ? 'bg-secondary/20 text-secondary' :
                          'bg-surface text-text-main'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm">{donor.name}</span>
                      </div>
                      <span className="font-bold text-success">
                        R$ {donor.total_donated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Pending Entities */}
        {pendingEntities.length > 0 && (
          <section className="mb-6">
            <h3 className="section-title mb-3 flex items-center gap-2">
              <Building2 size={18} />
              Entidades Pendentes ({pendingEntities.length})
            </h3>
            <div className="flex flex-col gap-3">
              {pendingEntities.map(entity => (
                <div
                  key={entity.id}
                  className="bg-surface p-4 rounded-xl border border-outline/10 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-primary">{entity.name}</h4>
                      <p className="text-xs text-outline">{entity.type} - {entity.region}</p>
                      <p className="text-xs text-outline mt-1">CNPJ: {entity.cnpj}</p>
                      <p className="text-xs text-outline">Responsavel: {entity.responsible_name}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-warning/20 text-warning uppercase rounded-full">
                      Pendente
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-outline/10">
                    <Button
                      size="small"
                      variant="primary"
                      onClick={() => handleApproveEntity(entity.id)}
                      loading={actionLoading === entity.id}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="small"
                      variant="outline"
                      className="text-error border-error"
                      onClick={() => handleRejectEntity(entity.id)}
                    >
                      <XCircle size={14} className="mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pending Indications */}
        <section className="mb-8">
          <h3 className="section-title mb-3 flex items-center gap-2">
            <FileText size={18} />
            Indicacoes Pendentes ({pendingIndications.length})
          </h3>
          {pendingIndications.length === 0 ? (
            <div className="bg-surface-highest p-4 rounded-xl border border-outline/10 text-center">
              <p className="text-sm text-outline">Nenhuma indicacao pendente no momento.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {pendingIndications.map(ind => (
                <div
                  key={ind.id}
                  className="bg-surface p-4 rounded-xl border border-outline/10 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-primary">{ind.representative_name}</h4>
                      <p className="text-xs text-outline">{ind.region} - {ind.children_count} criancas</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-warning/20 text-warning uppercase rounded-full">
                      Pendente
                    </span>
                  </div>
                  {ind.observation && (
                    <p className="text-xs text-text-main italic border-l-2 border-outline/20 pl-2 mt-2">
                      "{ind.observation}"
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-outline/10">
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => handleApproveIndication(ind.id)}
                      loading={actionLoading === ind.id}
                    >
                      Aprovar (Lista)
                    </Button>
                    <Button
                      size="small"
                      variant="outline"
                      className="text-error border-error"
                      onClick={() => handleRejectIndication(ind.id)}
                    >
                      Rejeitar
                    </Button>
                    <Button
                      size="small"
                      variant="primary"
                      className="col-span-2 bg-success text-inverted border-success"
                      onClick={() => handleConvertIndication(ind.id)}
                    >
                      Converter em Familia
                    </Button>
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

export default AdminDashboard;
