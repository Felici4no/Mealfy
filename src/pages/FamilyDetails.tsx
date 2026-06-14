import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import type { Family } from '../backend/types';
import { Heart, MapPin, AlertCircle, Building2 } from 'lucide-react';
import './FamilyDetails.css';

// Consistent families mock dataset
const MOCK_FAMILIES_LIST: Family[] = [
  {
    id: 'f1',
    communityId: 'c1',
    representativeName: 'Maria Silva',
    neighborhood: 'Heliópolis',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Viela 3, Setor B',
    description: 'Mãe solo, desempregada temporariamente com 2 filhos em idade de creche.',
    childrenCount: 2,
    children: [
      { id: 'ch1', name: 'Lucas', age: 7, school: 'EMEF Campos' },
      { id: 'ch2', name: 'Ana', age: 4, school: 'Creche Local' }
    ],
    mainNeed: 'Alimentação infantil e fraldas',
    supportStatus: 'needs_help',
    distanceToUser: '1.2 km',
    priorityLevel: 5,
    latitude: -23.6151,
    longitude: -46.5912,
    sourceEntityName: 'Coletivo Heliópolis Solidário'
  },
  {
    id: 'f2',
    communityId: 'c1',
    representativeName: 'Dona Cida',
    neighborhood: 'Heliópolis',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Rua do Sol, 45',
    description: 'Aposentada que cuida sozinha de 3 netos após o falecimento da filha.',
    childrenCount: 3,
    children: [
      { id: 'ch3', name: 'Pedro', age: 10, school: 'EMEF Campos' },
      { id: 'ch4', name: 'Carla', age: 8, school: 'EMEF Campos' },
      { id: 'ch5', name: 'Júlia', age: 5, school: 'Creche Local' }
    ],
    mainNeed: 'Cesta de alimentos frescos',
    supportStatus: 'needs_help',
    distanceToUser: '1.4 km',
    priorityLevel: 4,
    latitude: -23.6180,
    longitude: -46.5940,
    sourceEntityName: 'Coletivo Heliópolis Solidário'
  },
  {
    id: 'f3',
    communityId: 'c3',
    representativeName: 'Roberto e Sônia',
    neighborhood: 'Cidade Tiradentes',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Setor G, Prédio 3',
    description: 'Casal com 3 filhos. Ambos faziam bicos mas perderam renda nas últimas semanas.',
    childrenCount: 3,
    children: [
      { id: 'ch6', name: 'Tiago', age: 12, school: 'EE Tiradentes' },
      { id: 'ch7', name: 'Mateus', age: 9, school: 'EE Tiradentes' },
      { id: 'ch8', name: 'Lia', age: 6, school: 'EMEF Local' }
    ],
    mainNeed: 'Suplementação alimentar para crianças',
    supportStatus: 'needs_help',
    distanceToUser: '8.1 km',
    priorityLevel: 4,
    latitude: -23.5855,
    longitude: -46.4011,
    sourceEntityName: 'Associação Tiradentes Viva'
  },
  {
    id: 'f4',
    communityId: 'c2',
    representativeName: 'Joana Prado',
    neighborhood: 'Paraisópolis',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Beco da Esperança, 12',
    description: 'Atualmente trabalha em faxinas mas o salário não cobre alimentação e aluguel.',
    childrenCount: 1,
    children: [
      { id: 'ch9', name: 'Miguel', age: 2, school: 'Creche Municipal' }
    ],
    mainNeed: 'Leite especial e papinhas',
    supportStatus: 'fed',
    distanceToUser: '3.6 km',
    priorityLevel: 2,
    latitude: -23.6145,
    longitude: -46.7289,
    sourceEntityName: 'União Paraisópolis'
  },
  {
    id: 'f5',
    communityId: 'c2',
    representativeName: 'Alice Rocha',
    neighborhood: 'Paraisópolis',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Rua Central, 88',
    description: 'Família em extrema vulnerabilidade com 4 filhos pequenos.',
    childrenCount: 4,
    children: [
      { id: 'ch10', name: 'Guilherme', age: 9, school: 'EMEF Paraisópolis' },
      { id: 'ch11', name: 'Bruno', age: 7, school: 'EMEF Paraisópolis' },
      { id: 'ch12', name: 'Yasmin', age: 5, school: 'Creche' },
      { id: 'ch13', name: 'Alice', age: 3, school: 'Creche' }
    ],
    mainNeed: 'Alimentação infantil diária',
    supportStatus: 'needs_help',
    distanceToUser: '3.3 km',
    priorityLevel: 5,
    latitude: -23.6110,
    longitude: -46.7260,
    sourceEntityName: 'União Paraisópolis'
  },
  {
    id: 'f6',
    communityId: 'c4',
    representativeName: 'Regina Santos',
    neighborhood: 'Brasilândia',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Rua do Morro, 102',
    description: 'Mãe solo, diarista desempregada cuidando de 3 crianças.',
    childrenCount: 3,
    children: [
      { id: 'ch14', name: 'Enzo', age: 8, school: 'EMEF Brasilândia' },
      { id: 'ch15', name: 'Valentina', age: 6, school: 'Creche' },
      { id: 'ch16', name: 'Gabriel', age: 2, school: 'Creche' }
    ],
    mainNeed: 'Alimento básico e leite',
    supportStatus: 'needs_help',
    distanceToUser: '12.4 km',
    priorityLevel: 5,
    latitude: -23.4688,
    longitude: -46.6997,
    sourceEntityName: 'Brasilândia Unida'
  },
  {
    id: 'f7',
    communityId: 'c4',
    representativeName: 'Francisca Lima',
    neighborhood: 'Brasilândia',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Viela da Paz, 9',
    description: 'Família numerosa, apoiada ativamente pela cozinha comunitária local.',
    childrenCount: 5,
    children: [
      { id: 'ch17', name: 'Mariana', age: 14, school: 'EE Brasilândia' },
      { id: 'ch18', name: 'Samuel', age: 12, school: 'EE Brasilândia' },
      { id: 'ch19', name: 'Ester', age: 9, school: 'EMEF Brasilândia' },
      { id: 'ch20', name: 'Rafaela', age: 7, school: 'EMEF Brasilândia' },
      { id: 'ch21', name: 'Daví', age: 4, school: 'Creche' }
    ],
    mainNeed: 'Cesta básica completa',
    supportStatus: 'fed',
    distanceToUser: '12.8 km',
    priorityLevel: 1,
    latitude: -23.4710,
    longitude: -46.7020,
    sourceEntityName: 'Brasilândia Unida'
  }
];

const FamilyDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = MOCK_FAMILIES_LIST.find(f => f.id === id);
      setFamily(found || null);
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div className="p-4 text-center mt-10">Carregando família...</div>;
  if (!family) return <div className="p-4 text-center mt-10 text-error">Família não encontrada.</div>;

  const isUrgent = family.priorityLevel >= 4 && family.supportStatus === 'needs_help';

  const handleDonateToFamily = () => {
    // Navigate to DonationChoice but carry exact family
    navigate('/donate', { state: { targetFamily: family } });
  };

  return (
    <div className="family-details-page">
      <AppHeader title="Ficha de Apoio" showBack onBack={() => navigate(-1)} />
      
      <main className="content p-4">
        {/* ── Family Card with optional Urgency Glow ── */}
        <div className={`family-header-card mb-4 ${isUrgent ? 'urgent-header-glow' : ''}`}>
          <div className="fh-avatar">{family.representativeName.charAt(0)}</div>
          <h2 className="fh-title text-primary">{family.representativeName}</h2>
          <div className="fh-location flex items-center justify-center gap-1 text-sm text-outline mt-1">
            <MapPin size={14} /> {family.shortAddress}, {family.neighborhood}
          </div>
        </div>

        {/* ── Information Source ── */}
        <div className="bg-surface-highest p-4 rounded-md border border-outline/10 mb-6 flex flex-col gap-2">
           <h3 className="text-[10px] font-bold text-outline uppercase tracking-wider">Entidade Validadora</h3>
           
           <p className="text-sm font-semibold text-text-main flex items-center gap-2">
             <Building2 size={16} className="text-secondary" />
             {family.sourceEntityName || 'Parceiro Oficial Credenciado'}
           </p>
           <div className="text-xs text-outline flex flex-col gap-1 mt-1">
             <p>Status da entidade: <strong>Auditada e Aprovada</strong></p>
             <p>Data de Validação: Recente</p>
           </div>
        </div>

        {/* ── Context ── */}
        <section className="family-description mb-6">
          <h3 className="text-[10px] font-bold mb-2 text-outline uppercase tracking-wider">Contexto</h3>
          <p className="text-sm leading-relaxed text-text-main">"{family.description}"</p>
        </section>

        {/* ── Children List ── */}
        <section className="family-children mb-6">
          <h3 className="text-[10px] font-bold mb-2 text-outline uppercase tracking-wider flex justify-between">
            <span>Crianças ({family.childrenCount})</span>
            <span className={isUrgent ? 'text-error font-extrabold' : 'text-primary'}>
              Prioridade Nível {family.priorityLevel}/5
            </span>
          </h3>
          <div className="children-list flex flex-col gap-2">
            {family.children.length === 0 ? (
              <div className="text-xs text-outline italic p-2 bg-surface rounded-sm border border-outline/5">
                Não há detalhes individuais das crianças cadastrados.
              </div>
            ) : (
              family.children.map(child => (
                <div key={child.id} className="child-card flex justify-between items-center p-3 bg-surface rounded-sm border border-outline/5">
                  <div>
                    <span className="font-semibold text-sm">{child.name}</span>
                    <span className="text-xs text-outline ml-2">{child.age} anos</span>
                  </div>
                  <span className="text-xs text-outline tag-school bg-surface-highest px-2 py-0.5 rounded-sm">{child.school}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── Urgency Box ── */}
        <section className="family-urgency mb-8">
          <div className={`urgency-box flex items-start gap-3 p-4 rounded-md border ${
            isUrgent ? 'border-error/20 bg-error/5' : 'border-outline/10 bg-surface'
          }`}>
            <AlertCircle size={20} className={isUrgent ? 'text-error mt-0.5' : 'text-secondary mt-0.5'} />
            <div>
              <h4 className="font-semibold mb-1 text-sm text-primary">Necessidade Principal</h4>
              <p className="text-sm text-text-main">{family.mainNeed}</p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Bottom floating action button ── */}
      {family.supportStatus === 'needs_help' && (
        <div className="fixed-bottom-action blur-bg">
          <Button 
            size="large" 
            fullWidth 
            className="shadow-glow"
            onClick={handleDonateToFamily}
            icon={<Heart size={20} />}
          >
            Alimentar essa família
          </Button>
        </div>
      )}
    </div>
  );
};

export default FamilyDetails;
