import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { generateApiKey, encrypt } from '../lib/crypto.js';
import '../types/index.js'; // Import types for module augmentation

// Auth decorator
async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify();
    } catch {
        return reply.status(401).send({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Invalid or missing authentication',
            },
        });
    }
}

export async function userRoutes(app: FastifyInstance) {
    // Apply auth to all routes in this plugin
    app.addHook('onRequest', authenticate);

    // ============================================
    // GET /users/profile
    // ============================================
    app.get('/profile', async (request, reply) => {
        const user = await prisma.user.findUnique({
            where: { id: request.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                subscriptionTier: true,
                createdAt: true,
            },
        });

        if (!user) {
            return reply.status(404).send({
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                },
            });
        }

        // Get today's API calls count
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const apiCallsToday = await prisma.apiCallLog.count({
            where: {
                userId: request.user.id,
                timestamp: { gte: todayStart },
            },
        });

        const limit = user.subscriptionTier === 'free' ? 100 : 999999;

        return reply.send({
            ...user,
            apiCallsToday,
            apiCallsLimit: limit,
        });
    });

    // ============================================
    // GET /users/api-keys
    // ============================================
    app.get('/api-keys', async (request, reply) => {
        const apiKeys = await prisma.apiKey.findMany({
            where: { userId: request.user.id },
            select: {
                id: true,
                name: true,
                keyPrefix: true,
                createdAt: true,
                lastUsedAt: true,
                isActive: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return reply.send({ apiKeys });
    });

    // ============================================
    // POST /users/api-keys
    // ============================================
    app.post<{ Body: { name: string } }>('/api-keys', async (request, reply) => {
        const { name } = request.body;

        if (!name || name.length < 1) {
            return reply.status(400).send({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Name is required',
                },
            });
        }

        const { key, hash, prefix } = generateApiKey();

        const apiKey = await prisma.apiKey.create({
            data: {
                userId: request.user.id,
                name,
                keyHash: hash,
                keyPrefix: prefix,
            },
            select: {
                id: true,
                name: true,
                keyPrefix: true,
                createdAt: true,
            },
        });

        // Return the full key only once
        return reply.status(201).send({
            ...apiKey,
            key, // This is shown only once!
        });
    });

    // ============================================
    // DELETE /users/api-keys/:id
    // ============================================
    app.delete<{ Params: { id: string } }>('/api-keys/:id', async (request, reply) => {
        const { id } = request.params;

        const apiKey = await prisma.apiKey.findFirst({
            where: { id, userId: request.user.id },
        });

        if (!apiKey) {
            return reply.status(404).send({
                error: {
                    code: 'NOT_FOUND',
                    message: 'API key not found',
                },
            });
        }

        await prisma.apiKey.delete({ where: { id } });

        return reply.send({ success: true });
    });

    // ============================================
    // GET /users/n8n-credentials
    // ============================================
    app.get('/n8n-credentials', async (request, reply) => {
        const credentials = await prisma.n8nCredential.findMany({
            where: { userId: request.user.id },
            select: {
                id: true,
                name: true,
                instanceUrl: true,
                status: true,
                createdAt: true,
                lastVerifiedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return reply.send({ credentials });
    });

    // ============================================
    // POST /users/n8n-credentials
    // ============================================
    app.post<{ Body: { name?: string; instanceUrl: string; apiKey: string } }>('/n8n-credentials', async (request, reply) => {
        const schema = z.object({
            name: z.string().optional().default('My n8n Instance'),
            instanceUrl: z.string().url(),
            apiKey: z.string().min(1),
        });

        const validation = schema.safeParse(request.body);
        if (!validation.success) {
            return reply.status(400).send({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input',
                    details: validation.error.format(),
                },
            });
        }

        const { name, instanceUrl, apiKey } = validation.data;

        // Encrypt the n8n API key
        const apiKeyEncrypted = encrypt(apiKey);

        // Create credential
        const credential = await prisma.n8nCredential.create({
            data: {
                userId: request.user.id,
                name,
                instanceUrl: instanceUrl.replace(/\/$/, ''), // Remove trailing slash
                apiKeyEncrypted,
                status: 'pending',
            },
        });

        // Auto-verify the connection
        let status: 'verified' | 'failed' = 'failed';
        try {
            const n8nUrl = instanceUrl.replace(/\/$/, '');
            const response = await fetch(`${n8nUrl}/api/v1/workflows?limit=1`, {
                headers: {
                    'X-N8N-API-KEY': apiKey,
                },
            });
            status = response.ok ? 'verified' : 'failed';
        } catch {
            status = 'failed';
        }

        // Update status
        const updated = await prisma.n8nCredential.update({
            where: { id: credential.id },
            data: {
                status,
                lastVerifiedAt: new Date(),
            },
            select: {
                id: true,
                name: true,
                instanceUrl: true,
                status: true,
                createdAt: true,
            },
        });

        return reply.status(201).send(updated);
    });

    // ============================================
    // DELETE /users/n8n-credentials/:id
    // ============================================
    app.delete<{ Params: { id: string } }>('/n8n-credentials/:id', async (request, reply) => {
        const { id } = request.params;

        const credential = await prisma.n8nCredential.findFirst({
            where: { id, userId: request.user.id },
        });

        if (!credential) {
            return reply.status(404).send({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Credential not found',
                },
            });
        }

        await prisma.n8nCredential.delete({ where: { id } });

        return reply.send({ success: true });
    });

    // ============================================
    // GET /users/quota
    // ============================================
    app.get('/quota', async (request, reply) => {
        const user = await prisma.user.findUnique({
            where: { id: request.user.id },
            select: { subscriptionTier: true },
        });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const tomorrow = new Date(todayStart);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const apiCallsToday = await prisma.apiCallLog.count({
            where: {
                userId: request.user.id,
                timestamp: { gte: todayStart },
            },
        });

        const limit = user?.subscriptionTier === 'free' ? 100 : 999999;

        return reply.send({
            plan: user?.subscriptionTier || 'free',
            apiCalls: {
                used: apiCallsToday,
                limit,
                resetAt: tomorrow.toISOString(),
            },
        });
    });
}
