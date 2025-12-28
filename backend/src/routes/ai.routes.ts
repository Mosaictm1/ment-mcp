import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { AIConversationService, ConversationContext } from '../services/ai-conversation.service.js';
import { AIRepairService } from '../services/ai-repair.service.js';
import { N8nService } from '../services/n8n.service.js';

interface AuthenticatedRequest {
    user?: {
        id: string;
        email: string;
        tier: string;
    };
}

/**
 * AI Workflow Assistant Routes
 */
export async function aiRoutes(app: FastifyInstance) {
    // Require authentication for all AI routes
    app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch {
            return reply.status(401).send({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
        }
    });

    // ============================================
    // CREATE NEW CONVERSATION
    // ============================================
    app.post<{
        Body: {
            instanceId: string;
            workflowId?: string;
            title?: string;
        };
    }>('/conversations', async (request, reply) => {
        const { instanceId, workflowId, title } = request.body;
        const user = (request as AuthenticatedRequest).user!;

        // Verify instance belongs to user
        const instance = await prisma.n8nCredential.findFirst({
            where: {
                id: instanceId,
                userId: user.id,
            },
        });

        if (!instance) {
            return reply.status(404).send({
                error: {
                    code: 'INSTANCE_NOT_FOUND',
                    message: 'n8n instance not found',
                },
            });
        }

        const conversation = await AIConversationService.createConversation(
            user.id,
            instanceId,
            workflowId,
            title
        );

        return reply.send({ conversation });
    });

    // ============================================
    // GET CONVERSATION HISTORY
    // ============================================
    app.get<{
        Params: { id: string };
    }>('/conversations/:id', async (request, reply) => {
        const { id } = request.params;
        const user = (request as AuthenticatedRequest).user!;

        const conversation = await AIConversationService.getConversation(id);

        if (!conversation) {
            return reply.status(404).send({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Conversation not found',
                },
            });
        }

        if (conversation.userId !== user.id) {
            return reply.status(403).send({
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                },
            });
        }

        return reply.send({ conversation });
    });

    // ============================================
    // GET USER'S CONVERSATIONS
    // ============================================
    app.get('/conversations', async (request, reply) => {
        const user = (request as AuthenticatedRequest).user!;

        const conversations = await prisma.conversation.findMany({
            where: { userId: user.id },
            include: {
                instance: {
                    select: {
                        id: true,
                        name: true,
                        instanceUrl: true,
                    },
                },
                _count: {
                    select: {
                        messages: true,
                        plans: true,
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return reply.send({ conversations });
    });

    // ============================================
    // SEND MESSAGE
    // ============================================
    app.post<{
        Params: { id: string };
        Body: {
            message: string;
        };
    }>('/conversations/:id/messages', async (request, reply) => {
        const { id } = request.params;
        const { message } = request.body;
        const user = (request as AuthenticatedRequest).user!;

        // Get conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id },
        });

        if (!conversation) {
            return reply.status(404).send({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Conversation not found',
                },
            });
        }

        if (conversation.userId !== user.id) {
            return reply.status(403).send({
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                },
            });
        }

        const context: ConversationContext = {
            conversationId: id,
            workflowId: conversation.workflowId || undefined,
            instanceId: conversation.instanceId,
            userId: user.id,
        };

        try {
            const response = await AIConversationService.sendMessage(context, message);
            return reply.send(response);
        } catch (error: any) {
            return reply.status(500).send({
                error: {
                    code: 'AI_ERROR',
                    message: error.message || 'Failed to process message',
                },
            });
        }
    });

    // ============================================
    // APPROVE WORKFLOW PLAN
    // ============================================
    app.post<{
        Params: { id: string };
    }>('/plans/:id/approve', async (request, reply) => {
        const { id } = request.params;
        const user = (request as AuthenticatedRequest).user!;

        try {
            const result = await AIConversationService.approvePlan(id, user.id);
            return reply.send(result);
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    code: 'APPROVAL_FAILED',
                    message: error.message || 'Failed to approve plan',
                },
            });
        }
    });

    // ============================================
    // REJECT WORKFLOW PLAN
    // ============================================
    app.post<{
        Params: { id: string };
        Body: { reason?: string };
    }>('/plans/:id/reject', async (request, reply) => {
        const { id } = request.params;
        const { reason } = request.body;
        const user = (request as AuthenticatedRequest).user!;

        try {
            const result = await AIConversationService.rejectPlan(id, user.id, reason);
            return reply.send(result);
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    code: 'REJECTION_FAILED',
                    message: error.message || 'Failed to reject plan',
                },
            });
        }
    });

    // ============================================
    // TEST WORKFLOW PLAN
    // ============================================
    app.post<{
        Params: { id: string };
        Body: { testData?: any };
    }>('/plans/:id/test', async (request, reply) => {
        const { id } = request.params;
        const { testData } = request.body;
        const user = (request as AuthenticatedRequest).user!;

        try {
            const results = await AIConversationService.testPlan(id, user.id, testData);
            return reply.send(results);
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    code: 'TEST_FAILED',
                    message: error.message || 'Failed to test plan',
                },
            });
        }
    });

    // ============================================
    // GET WORKFLOW VERSION HISTORY
    // ============================================
    app.get<{
        Params: { workflowId: string };
        Querystring: { instanceId: string };
    }>('/workflows/:workflowId/history', async (request, reply) => {
        const { workflowId } = request.params;
        const { instanceId } = request.query;

        if (!instanceId) {
            return reply.status(400).send({
                error: {
                    code: 'MISSING_INSTANCE_ID',
                    message: 'instanceId query parameter is required',
                },
            });
        }

        const versions = await AIConversationService.getWorkflowHistory(workflowId, instanceId);
        return reply.send({ versions });
    });

    // ============================================
    // REPAIR NODE (with Perplexity for HTTP Request)
    // ============================================
    app.post<{
        Body: {
            credentialId: string;
            nodeName: string;
            nodeType: string;
            nodeParameters?: Record<string, unknown>;
            error: string;
            inputData?: unknown;
        };
    }>('/repair', async (request, reply) => {
        const { nodeName, nodeType, nodeParameters, error, inputData } = request.body;

        const perplexityKey = process.env.PERPLEXITY_API_KEY;

        if (!perplexityKey) {
            return reply.status(500).send({
                error: {
                    code: 'CONFIG_ERROR',
                    message: 'AI repair service not configured. Add PERPLEXITY_API_KEY to .env',
                },
            });
        }

        try {
            const aiService = new AIRepairService(perplexityKey);
            const suggestion = await aiService.repairNode(
                { name: nodeName, type: nodeType, parameters: nodeParameters },
                error,
                inputData
            );

            return reply.send({ success: true, suggestion });
        } catch (err: any) {
            return reply.status(500).send({
                error: { code: 'AI_ERROR', message: err.message || 'Failed to analyze node' },
            });
        }
    });

    // ============================================
    // IMPROVE NODE
    // ============================================
    app.post<{
        Body: {
            nodeName: string;
            nodeType: string;
            nodeParameters?: Record<string, unknown>;
            inputData?: unknown;
            outputData?: unknown;
        };
    }>('/improve', async (request, reply) => {
        const { nodeName, nodeType, nodeParameters, inputData, outputData } = request.body;

        const perplexityKey = process.env.PERPLEXITY_API_KEY;

        if (!perplexityKey) {
            return reply.status(500).send({
                error: {
                    code: 'CONFIG_ERROR',
                    message: 'AI improve service not configured. Add PERPLEXITY_API_KEY to .env',
                },
            });
        }

        try {
            const aiService = new AIRepairService(perplexityKey);
            const suggestion = await aiService.improveNode(
                { name: nodeName, type: nodeType, parameters: nodeParameters },
                inputData,
                outputData
            );

            return reply.send({ success: true, suggestion });
        } catch (err: any) {
            return reply.status(500).send({
                error: { code: 'AI_ERROR', message: err.message || 'Failed to analyze node' },
            });
        }
    });

    // ============================================
    // APPLY FIX TO NODE
    // ============================================
    app.post<{
        Body: {
            credentialId: string;
            workflowId: string;
            nodeName: string;
            suggestedParameters: Record<string, unknown>;
        };
    }>('/apply-fix', async (request, reply) => {
        const { credentialId, workflowId, nodeName, suggestedParameters } = request.body;
        const user = (request as AuthenticatedRequest).user!;

        const credential = await prisma.n8nCredential.findFirst({
            where: { id: credentialId, userId: user.id },
        });

        if (!credential) {
            return reply.status(404).send({
                error: { code: 'NOT_FOUND', message: 'Credential not found' },
            });
        }

        try {
            const n8n = N8nService.fromEncrypted(credential.instanceUrl, credential.apiKeyEncrypted);
            const workflow = await n8n.getWorkflow(workflowId);

            const nodes = workflow.nodes || [];
            const nodeIndex = nodes.findIndex((n: any) => n.name === nodeName);

            if (nodeIndex === -1) {
                return reply.status(404).send({
                    error: { code: 'NOT_FOUND', message: 'Node not found in workflow' },
                });
            }

            nodes[nodeIndex].parameters = {
                ...nodes[nodeIndex].parameters,
                ...suggestedParameters,
            };

            const updatedWorkflow = await n8n.updateWorkflow(workflowId, { nodes });

            return reply.send({
                success: true,
                message: `Applied fix to node "${nodeName}"`,
                workflow: updatedWorkflow,
            });
        } catch (err: any) {
            return reply.status(500).send({
                error: { code: 'UPDATE_ERROR', message: err.message || 'Failed to apply fix' },
            });
        }
    });
}
