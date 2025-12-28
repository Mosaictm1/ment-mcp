import { PrismaClient } from '@prisma/client';

// Supabase Session mode has limited connections, so we limit Prisma's pool
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Create Prisma client with connection pooling limits for Supabase
function createPrismaClient() {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
            db: {
                // Add connection limit params to the DATABASE_URL for Supabase
                url: process.env.DATABASE_URL?.includes('?')
                    ? `${process.env.DATABASE_URL}&connection_limit=5&pool_timeout=10`
                    : `${process.env.DATABASE_URL}?connection_limit=5&pool_timeout=10`,
            },
        },
    });
}

// Use global singleton to prevent multiple clients in development AND production
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Always use singleton in all environments to prevent connection exhaustion
globalForPrisma.prisma = prisma;

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
