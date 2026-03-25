/**
 * seed-admin.js
 * Run once to create the first admin account:
 *   node seed-admin.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Change these before running ────────────────────────────────
const ADMIN_NAME     = 'Acharya Admin';
const ADMIN_EMAIL    = 'admin@acharyaways.com';
const ADMIN_PASSWORD = 'Admin@1234';
// ──────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱  Seeding admin user...');

  // Check if already exists
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL.toLowerCase() },
  });

  if (existing) {
    if (existing.role === 'ADMIN') {
      console.log(`✅  Admin already exists: ${ADMIN_EMAIL}`);
    } else {
      // Upgrade existing user to ADMIN
      await prisma.user.update({
        where: { email: ADMIN_EMAIL.toLowerCase() },
        data: { role: 'ADMIN' },
      });
      console.log(`🔁  Upgraded ${ADMIN_EMAIL} to ADMIN role.`);
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`\n✅  Admin created successfully!`);
  console.log(`   Name  : ${admin.name}`);
  console.log(`   Email : ${admin.email}`);
  console.log(`   Role  : ${admin.role}`);
  console.log(`\n🔐  Login at: http://localhost:3000/login`);
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Password : ${ADMIN_PASSWORD}\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
