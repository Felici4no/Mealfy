import type { Family } from '../types';

export const mockFamilies: Family[] = [
  {
    id: 'f1',
    communityId: 'c1',
    representativeName: 'Maria Silva',
    neighborhood: 'Heliópolis',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Viela 3, Setor B',
    description: 'Mãe solo, perdeu a principal fonte de renda recentemente e precisa de apoio.',
    childrenCount: 2,
    children: [
      { id: 'ch1', name: 'Lucas', age: 7, school: 'EMEF Campos' },
      { id: 'ch2', name: 'Ana', age: 4, school: 'Creche Local' }
    ],
    mainNeed: 'Alimentação básica para crianças',
    supportStatus: 'needs_help',
    distanceToUser: '1.2 km',
    priorityLevel: 5
  },
  {
    id: 'f2',
    communityId: 'c1',
    representativeName: 'Dona Cida',
    neighborhood: 'Heliópolis',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Rua do Sol',
    description: 'Cuida dos 3 netos após o falecimento da filha. Aposentadoria não cobre a cesta básica mensal.',
    childrenCount: 3,
    children: [
      { id: 'ch3', name: 'Pedro', age: 10, school: 'EMEF Campos' },
      { id: 'ch4', name: 'Carla', age: 8, school: 'EMEF Campos' },
      { id: 'ch5', name: 'Júlia', age: 5, school: 'Creche Local' }
    ],
    mainNeed: 'Reforço alimentar nutricional',
    supportStatus: 'needs_help',
    distanceToUser: '1.4 km',
    priorityLevel: 4
  },
  {
    id: 'f3',
    communityId: 'c3',
    representativeName: 'Roberto e Sônia',
    neighborhood: 'Cidade Tiradentes',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Condomínio A',
    description: 'Família residente em Cidade Tiradentes, com 3 filhos em idade escolar, em situação de vulnerabilidade alimentar sazonal.',
    childrenCount: 3,
    children: [
      { id: 'ch6', name: 'Tiago', age: 12, school: 'EE Tiradentes' },
      { id: 'ch7', name: 'Mateus', age: 9, school: 'EE Tiradentes' },
      { id: 'ch8', name: 'Lia', age: 6, school: 'EMEF Local' }
    ],
    mainNeed: 'Alimentação completa',
    supportStatus: 'needs_help',
    distanceToUser: '8.1 km',
    priorityLevel: 4
  },
  {
    id: 'f4',
    communityId: 'c2',
    representativeName: 'Joana Prado',
    neighborhood: 'Paraisópolis',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Beco Principal',
    description: 'Atualmente empregada, mas salário não acompanha inflação alimentar.',
    childrenCount: 1,
    children: [
      { id: 'ch9', name: 'Miguel', age: 2, school: 'Creche' }
    ],
    mainNeed: 'Leite e suplementos',
    supportStatus: 'supported',
    distanceToUser: '3.6 km',
    priorityLevel: 2
  }
];
