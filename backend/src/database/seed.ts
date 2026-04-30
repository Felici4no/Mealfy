import { MockDatabase } from './mock-db';

const seed = async () => {
  console.log('🌱 Seeding database...');

  const users = [
    {
      id: 'admin-1',
      name: 'Admin Mealfy',
      email: 'admin@mealfy.com',
      role: 'admin',
      status: 'active',
      totalDonated: 0
    },
    {
      id: 'donor-1',
      name: 'Doador Demo',
      email: 'doador@mealfy.com',
      role: 'donor',
      status: 'active',
      totalDonated: 150,
      privacySettings: {
        showOnRanking: true,
        showInstagram: true,
        anonymousMode: false
      }
    },
    {
      id: 'entity-user-1',
      name: 'Entidade Aprovada',
      email: 'entidade@mealfy.com',
      role: 'entity',
      status: 'approved',
      entityId: 'entity-1'
    },
    {
      id: 'entity-user-pending',
      name: 'Entidade Pendente',
      email: 'entidadependente@mealfy.com',
      role: 'entity',
      status: 'pending',
      entityId: 'entity-pending-1'
    },
    {
      id: 'beneficiary-1',
      name: 'Beneficiário Teste',
      email: 'beneficiario@mealfy.com',
      role: 'beneficiary',
      status: 'active',
      beneficiaryId: 'family-1'
    }
  ];

  const families = [
    {
      id: 'f-1',
      representativeName: 'Família Silva',
      region: 'Heliópolis',
      childrenCount: 2,
      status: 'approved',
      supportStatus: 'needs_help',
      sourceType: 'entity',
      sourceLabel: 'Cadastrado por Admin',
      latitude: -23.612,
      longitude: -46.593
    }
  ];

  await MockDatabase.write('users', users);
  await MockDatabase.write('families', families);
  await MockDatabase.write('indications', []);
  await MockDatabase.write('donations', []);
  await MockDatabase.write('giftcards', []);
  await MockDatabase.write('entities', []);
  await MockDatabase.write('audit-logs', []);

  console.log('✅ Seed completed!');
};

seed();
