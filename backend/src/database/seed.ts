import { MockDatabase } from './mock-db';

const seed = async () => {
  console.log('🌱 Seeding database...');

  const users = [
    {
      id: 'admin-1',
      name: 'Admin Mealfy',
      email: 'admin@mealfy.org',
      role: 'admin',
      status: 'active',
      totalDonated: 0
    },
    {
      id: 'donor-1',
      name: 'João Doador',
      email: 'joao@email.com',
      role: 'donor',
      status: 'active',
      totalDonated: 150,
      privacySettings: {
        showOnRanking: true,
        showInstagram: true,
        anonymousMode: false
      }
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
