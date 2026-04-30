import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { familyService } from '../backend/services/familyService';
import type { Family } from '../backend/types';
import './RegisterFamily.css';

const RegisterFamily: React.FC = () => {
  const navigate = useNavigate();
  const { communities, user } = useAppContext();

  const [isEntityMode, setIsEntityMode] = useState(user?.role === 'entity');
  const [formData, setFormData] = useState({
    representativeName: '',
    communityId: communities.length > 0 ? communities[0].id : '',
    neighborhood: '',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: '',
    description: '',
    childrenCount: 0,
    mainNeed: 'Alimentação Básica',
    cnpj: '',
    entityType: 'ONG' as any,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'childrenCount' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.representativeName || !formData.communityId || !formData.shortAddress) {
        throw new Error('Por favor, preencha os campos obrigatórios.');
      }

      if (formData.childrenCount === 0) {
        throw new Error('A família deve ter pelo menos uma criança para ser elegível.');
      }

      const newFamilyData: Omit<Family, 'id'> = {
        ...formData,
        children: Array.from({ length: formData.childrenCount }).map((_, i) => ({
          id: `c-${i}`,
          name: `Criança ${i+1}`,
          age: 5,
          school: 'Escola Local'
        })),
        authorizingEntityId: user?.role === 'entity' ? user.entityId || 'mock-entity-id' : undefined,
        supportStatus: 'pending',
        status: 'pending',
        distanceToUser: '2.5 km',
        priorityLevel: 3,
        latitude: -23.612 + (Math.random() * 0.05),
        longitude: -46.593 + (Math.random() * 0.05)
      };

      await familyService.addFamily(newFamilyData);
      alert("Cadastro enviado para análise. Obrigado por ajudar!");
      
      if (user?.role === 'entity') {
        navigate('/entity/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar família.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-family-page">
      <AppHeader title="Cadastrar Família" showBack />

      <main className="content p-4">
        <div className="mb-6">
          {user?.role !== 'entity' && (
            <div className="flex gap-2 mb-4">
               <button 
                 className={`px-4 py-2 rounded-full text-xs font-bold ${!isEntityMode ? 'bg-primary text-inverted' : 'bg-outline/10 text-outline'}`}
                 onClick={() => setIsEntityMode(false)}
               >
                 Sou Doador
               </button>
               <button 
                 className={`px-4 py-2 rounded-full text-xs font-bold ${isEntityMode ? 'bg-secondary text-inverted' : 'bg-outline/10 text-outline'}`}
                 onClick={() => setIsEntityMode(true)}
               >
                 Sou Entidade
               </button>
            </div>
          )}

          <h2 className="text-2xl font-bold text-primary mb-2">
            {isEntityMode ? 'Seja uma entidade autorizada no combate à fome infantil.' : 'Conhece alguém precisando de ajuda?'}
          </h2>
          <p className="text-outline text-sm leading-relaxed">
            {isEntityMode 
              ? 'Cadastre famílias da sua comunidade e ajude a transformar doações em alimento.' 
              : 'Cadastre uma família na plataforma e nossa equipe validará o pedido para disponibilizar para doação.'}
          </p>
        </div>

        {error && (
          <div className="bg-error/10 text-error p-3 rounded-lg mb-4 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form-container">
          {isEntityMode && (
            <>
              <div className="form-group">
                <label className="form-label">CNPJ da Entidade *</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de Entidade *</label>
                <select
                  name="entityType"
                  value={formData.entityType}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="ONG">ONG</option>
                  <option value="igreja">Igreja</option>
                  <option value="escola">Escola</option>
                  <option value="instituto">Instituto</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Nome do Representante *</label>
            <input
              type="text"
              name="representativeName"
              value={formData.representativeName}
              onChange={handleChange}
              className="form-input"
              placeholder="Ex: Maria da Silva"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Comunidade *</label>
            <select
              name="communityId"
              value={formData.communityId}
              onChange={handleChange}
              className="form-select"
              required
            >
              {communities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Endereço (Rua e Número) *</label>
            <input
              type="text"
              name="shortAddress"
              value={formData.shortAddress}
              onChange={handleChange}
              className="form-input"
              placeholder="Rua das Acácias, 120"
              required
            />
          </div>

          <div className="flex gap-3">
            <div className="form-group w-1/2">
              <label className="form-label">Bairro</label>
              <input
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                className="form-input"
                placeholder="Ex: Heliópolis"
              />
            </div>
            <div className="flex gap-3 w-1/2">
              <div className="form-group w-2/3">
                <label className="form-label">Cidade</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group w-1/3">
                <label className="form-label">UF</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="form-group w-1/2">
              <label className="form-label">Quantidade de Filhos</label>
              <input
                type="number"
                name="childrenCount"
                value={formData.childrenCount}
                onChange={handleChange}
                className="form-input"
                min="0"
                max="15"
              />
            </div>
            <div className="form-group w-1/2">
              <label className="form-label">Necessidade Principal</label>
              <select
                name="mainNeed"
                value={formData.mainNeed}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Alimentação Básica">Alimentação</option>
                <option value="Higiene Pessoal">Higiene</option>
                <option value="Material Escolar">Material Escolar</option>
                <option value="Medicamentos">Medicamentos</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Breve Descrição da Situação</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Descreva a situação atual da família para que os doadores possam conhecer a história..."
            />
          </div>

          <div className="submit-container mt-4">
            <Button
              type="submit"
              size="large"
              fullWidth
              loading={loading}
              className="shadow-glow"
            >
              Concluir Cadastro
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RegisterFamily;