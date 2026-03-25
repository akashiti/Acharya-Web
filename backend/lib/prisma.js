const { PrismaClient } = require('@prisma/client');

// Prevent multiple Prisma Client instances in development (hot-reload)
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
