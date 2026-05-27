import { rolesRepository } from './roles.repository.js';

const DEFAULT_ROLES = [
  { roleName: 'admin', roleLevel: 4 },
  { roleName: 'user', roleLevel: 2 },
  { roleName: 'client', roleLevel: 0 },
];

const seed = async () => {
  console.log('Seeding roles...');

  for (const role of DEFAULT_ROLES) {
    const existing = await rolesRepository.findByNameActive(role.roleName);

    if (existing) {
      console.log(`SKIP ${role.roleName} already exists`);
      continue;
    }

    await rolesRepository.create(role);
    console.log(`OK ${role.roleName} level ${role.roleLevel}`);
  }

  console.log('Done.');
};

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
  });
