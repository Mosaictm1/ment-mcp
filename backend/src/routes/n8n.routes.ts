import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { N8nService } from '../services/n8n.service.js';
import '../types/index.js';

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

// Helper to get user's n8n service
async function getN8nService(userId: string, credentialId?: string): Promise<N8nService | null> {
    const whereClause = credentialId
        ? { id: credentialId, userId }
        : { userId };

    const credential = await prisma.n8nCredential.findFirst({
        where: whereClause,
    });

    if (!credential) return null;

    return N8nService.fromEncrypted(credential.instanceUrl, credential.apiKeyEncrypted);
}

export async function n8nRoutes(app: FastifyInstance) {
    app.addHook('onRequest', authenticate);

    // ============================================
    // GET /n8n/workflows
    // ============================================
    app.get<{ Querystring: { credentialId?: string } }>('/workflows', async (request, reply) => {
        const n8n = await getN8nService(request.user.id, request.query.credentialId);

        if (!n8n) {
            return reply.status(400).send({
                error: {
                    code: 'NO_CREDENTIAL',
                    message: 'No n8n credentials configured. Please add your n8n instance first.',
                },
            });
        }

        try {
            const workflows = await n8n.getWorkflows();
            return reply.send(workflows);
        } catch (error) {
            return reply.status(502).send({
                error: {
                    code: 'N8N_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to fetch workflows from n8n',
                },
            });
        }
    });

    // ============================================
    // GET /n8n/workflows/:id
    // ============================================
    app.get<{ Params: { id: string }; Querystring: { credentialId?: string } }>('/workflows/:id', async (request, reply) => {
        const n8n = await getN8nService(request.user.id, request.query.credentialId);

        if (!n8n) {
            return reply.status(400).send({
                error: {
                    code: 'NO_CREDENTIAL',
                    message: 'No n8n credentials configured',
                },
            });
        }

        try {
            const workflow = await n8n.getWorkflow(request.params.id);
            return reply.send(workflow);
        } catch (error) {
            return reply.status(502).send({
                error: {
                    code: 'N8N_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to fetch workflow',
                },
            });
        }
    });

    // ============================================
    // POST /n8n/workflows
    // ============================================
    app.post<{ Body: { name: string; nodes?: unknown[]; connections?: unknown; credentialId?: string } }>('/workflows', async (request, reply) => {
        const { name, nodes, connections, credentialId } = request.body;
        const n8n = await getN8nService(request.user.id, credentialId);

        if (!n8n) {
            return reply.status(400).send({
                error: {
                    code: 'NO_CREDENTIAL',
                    message: 'No n8n credentials configured',
                },
            });
        }

        try {
            const workflow = await n8n.createWorkflow({
                name,
                nodes: nodes as any,
                connections: connections as any,
            });
            return reply.status(201).send(workflow);
        } catch (error) {
            return reply.status(502).send({
                error: {
                    code: 'N8N_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to create workflow',
                },
            });
        }
    });

    // ============================================
    // PATCH /n8n/workflows/:id
    // ============================================
    app.patch<{ Params: { id: string }; Body: { nodes?: unknown[]; connections?: unknown; credentialId?: string } }>('/workflows/:id', async (request, reply) => {
        const { id } = request.params;
        const { nodes, connections, credentialId } = request.body;
        const n8n = await getN8nService(request.user.id, credentialId);

        if (!n8n) {
            return reply.status(400).send({
                error: {
                    code: 'NO_CREDENTIAL',
                    message: 'No n8n credentials configured',
                },
            });
        }

        try {
            const workflow = await n8n.updateWorkflow(id, {
                nodes: nodes as any,
                connections: connections as any,
            });
            return reply.send(workflow);
        } catch (error) {
            return reply.status(502).send({
                error: {
                    code: 'N8N_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to update workflow',
                },
            });
        }
    });

    // ============================================
    // DELETE /n8n/workflows/:id
    // ============================================
    app.delete<{ Params: { id: string }; Querystring: { credentialId?: string } }>('/workflows/:id', async (request, reply) => {
        const n8n = await getN8nService(request.user.id, request.query.credentialId);

        if (!n8n) {
            return reply.status(400).send({
                error: {
                    code: 'NO_CREDENTIAL',
                    message: 'No n8n credentials configured',
                },
            });
        }

        try {
            await n8n.deleteWorkflow(request.params.id);
            return reply.send({ success: true });
        } catch (error) {
            return reply.status(502).send({
                error: {
                    code: 'N8N_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to delete workflow',
                },
            });
        }
    });

    // ============================================
    // GET /n8n/executions
    // ============================================
    app.get<{ Querystring: { workflowId?: string; limit?: string; credentialId?: string } }>('/executions', async (request, reply) => {
        const { workflowId, limit, credentialId } = request.query;
        const n8n = await getN8nService(request.user.id, credentialId);

        if (!n8n) {
            return reply.status(400).send({
                error: {
                    code: 'NO_CREDENTIAL',
                    message: 'No n8n credentials configured',
                },
            });
        }

        try {
            const executions = await n8n.getExecutions(workflowId, limit ? parseInt(limit) : 20);
            return reply.send(executions);
        } catch (error) {
            return reply.status(502).send({
                error: {
                    code: 'N8N_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to fetch executions',
                },
            });
        }
    });

    // ============================================
    // POST /n8n/workflows/:id/execute
    // ============================================
    app.post<{ Params: { id: string }; Body: { data?: Record<string, unknown>; credentialId?: string } }>('/workflows/:id/execute', async (request, reply) => {
        const { id } = request.params;
        const { data, credentialId } = request.body;
        const n8n = await getN8nService(request.user.id, credentialId);

        if (!n8n) {
            return reply.status(400).send({
                error: {
                    code: 'NO_CREDENTIAL',
                    message: 'No n8n credentials configured',
                },
            });
        }

        try {
            const execution = await n8n.executeWorkflow(id, data);
            return reply.status(201).send(execution);
        } catch (error) {
            return reply.status(502).send({
                error: {
                    code: 'N8N_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to execute workflow',
                },
            });
        }
    });

    // ============================================
    // POST /n8n/verify
    // ============================================
    app.post<{ Body: { credentialId: string } }>('/verify', async (request, reply) => {
        const { credentialId } = request.body;

        const credential = await prisma.n8nCredential.findFirst({
            where: { id: credentialId, userId: request.user.id },
        });

        if (!credential) {
            return reply.status(404).send({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Credential not found',
                },
            });
        }

        const n8n = N8nService.fromEncrypted(credential.instanceUrl, credential.apiKeyEncrypted);
        const isHealthy = await n8n.healthCheck();

        // Update credential status
        await prisma.n8nCredential.update({
            where: { id: credentialId },
            data: {
                status: isHealthy ? 'verified' : 'failed',
                lastVerifiedAt: new Date(),
            },
        });

        return reply.send({
            verified: isHealthy,
            status: isHealthy ? 'verified' : 'failed',
        });
    });
}
