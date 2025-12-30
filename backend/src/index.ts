import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

// Import routes
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { n8nRoutes } from './routes/n8n.routes.js';
import { mcpRoutes } from './routes/mcp.routes.js';
import { aiRoutes } from './routes/ai.routes.js';
import { httpBuilderRoutes } from './routes/http-builder.routes.js';

async function bootstrap() {
    const app = Fastify({
        logger: {
            level: env.NODE_ENV === 'development' ? 'info' : 'warn',
        },
    });

    // ============================================
    // PLUGINS
    // ============================================

    // Security headers
    await app.register(helmet);

    // CORS
    await app.register(cors, {
        origin: env.CORS_ORIGIN,
        credentials: true,
    });

    // JWT
    await app.register(jwt, {
        secret: env.JWT_SECRET,
        sign: {
            expiresIn: env.JWT_EXPIRES_IN,
        },
    });

    // Rate limiting
    await app.register(rateLimit, {
        max: env.RATE_LIMIT_MAX,
        timeWindow: env.RATE_LIMIT_WINDOW_MS,
        keyGenerator: (request) => {
            // Use user ID if authenticated, otherwise IP
            const user = request.user as { id: string } | undefined;
            return user?.id || request.ip;
        },
    });

    // ============================================
    // ROUTES
    // ============================================

    // Health check
    app.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // API routes
    await app.register(authRoutes, { prefix: '/v1/auth' });
    await app.register(userRoutes, { prefix: '/v1/users' });
    await app.register(n8nRoutes, { prefix: '/v1/n8n' });
    await app.register(mcpRoutes, { prefix: '/v1/mcp' });
    await app.register(aiRoutes, { prefix: '/v1/ai' });
    await app.register(httpBuilderRoutes, { prefix: '/v1/http-builder' });


    // ============================================
    // ERROR HANDLING
    // ============================================

    app.setErrorHandler((error, _request, reply) => {
        app.log.error(error);

        const err = error as { validation?: unknown; code?: string; statusCode?: number; message?: string };

        // Validation errors
        if (err.validation) {
            return reply.status(400).send({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid request data',
                    details: err.validation,
                },
            });
        }

        // JWT errors
        if (err.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
            return reply.status(401).send({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Missing authorization header',
                },
            });
        }

        // Default error
        return reply.status(err.statusCode || 500).send({
            error: {
                code: 'INTERNAL_ERROR',
                message: env.NODE_ENV === 'development' ? err.message : 'Internal server error',
            },
        });
    });

    // ============================================
    // STARTUP
    // ============================================

    try {
        // Database connection check
        await prisma.$connect();
        app.log.info('✅ Database connected');

        await app.listen({ port: env.PORT, host: env.HOST });
        app.log.info(`🚀 Server running at http://${env.HOST}:${env.PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }

    // Graceful shutdown
    const shutdown = async () => {
        app.log.info('Shutting down...');
        await prisma.$disconnect();
        await app.close();
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

bootstrap();
