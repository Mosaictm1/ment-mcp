import { FastifyInstance } from 'fastify';
import { AIRepairService } from '../services/ai-repair.service.js';
import { N8nService } from '../services/n8n.service.js';
import { prisma } from '../lib/prisma.js';

interface RepairBody {
    credentialId: string;
    workflowId: string;
    nodeName: string;
    nodeType: string;
    nodeParameters?: Record<string, unknown>;
    error: string;
    inputData?: unknown;
}

interface ImproveBody {
    credentialId: string;
    workflowId: string;
    nodeName: string;
    nodeType: string;
    nodeParameters?: Record<string, unknown>;
    inputData?: unknown;
    outputData?: unknown;
}

interface ApplyFixBody {
    credentialId: string;
    workflowId: string;
    nodeName: string;
    suggestedParameters: Record<string, unknown>;
}

export default async function aiRepairRoutes(app: FastifyInstance) {
    // All routes require authentication
    app.addHook('onRequest', async (request, reply) => {
        if (!request.user?.id) {
            return reply.status(401).send({
                error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
            });
        }
    });

    /**
     * POST /v1/ai/repair
     * Analyze a node error and suggest a fix
     */
    app.post<{ Body: RepairBody }>('/repair', async (request, reply) => {
        const { credentialId, workflowId, nodeName, nodeType, nodeParameters, error, inputData } = request.body;

        // Get API keys from environment
        const perplexityKey = process.env.PERPLEXITY_API_KEY;
        const anthropicKey = process.env.ANTHROPIC_API_KEY;

        if (!perplexityKey || !anthropicKey) {
            return reply.status(500).send({
                error: {
                    code: 'CONFIG_ERROR',
                    message: 'AI repair service not configured. Missing API keys.'
                }
            });
        }

        try {
            const aiService = new AIRepairService(perplexityKey, anthropicKey);

            const suggestion = await aiService.repairNode(
                { name: nodeName, type: nodeType, parameters: nodeParameters },
                error,
                inputData
            );

            return reply.send({
                success: true,
                suggestion
            });
        } catch (err: any) {
            console.error('AI Repair error:', err);
            return reply.status(500).send({
                error: {
                    code: 'AI_ERROR',
                    message: err.message || 'Failed to analyze node'
                }
            });
        }
    });

    /**
     * POST /v1/ai/improve
     * Suggest improvements for a node
     */
    app.post<{ Body: ImproveBody }>('/improve', async (request, reply) => {
        const { nodeName, nodeType, nodeParameters, inputData, outputData } = request.body;

        const perplexityKey = process.env.PERPLEXITY_API_KEY;
        const anthropicKey = process.env.ANTHROPIC_API_KEY;

        if (!perplexityKey || !anthropicKey) {
            return reply.status(500).send({
                error: {
                    code: 'CONFIG_ERROR',
                    message: 'AI improve service not configured. Missing API keys.'
                }
            });
        }

        try {
            const aiService = new AIRepairService(perplexityKey, anthropicKey);

            const suggestion = await aiService.improveNode(
                { name: nodeName, type: nodeType, parameters: nodeParameters },
                inputData,
                outputData
            );

            return reply.send({
                success: true,
                suggestion
            });
        } catch (err: any) {
            console.error('AI Improve error:', err);
            return reply.status(500).send({
                error: {
                    code: 'AI_ERROR',
                    message: err.message || 'Failed to analyze node'
                }
            });
        }
    });

    /**
     * POST /v1/ai/apply-fix
     * Apply a suggested fix to a workflow node
     */
    app.post<{ Body: ApplyFixBody }>('/apply-fix', async (request, reply) => {
        const { credentialId, workflowId, nodeName, suggestedParameters } = request.body;

        // Get n8n credentials
        const credential = await prisma.n8nCredential.findFirst({
            where: { id: credentialId, userId: request.user.id }
        });

        if (!credential) {
            return reply.status(404).send({
                error: { code: 'NOT_FOUND', message: 'Credential not found' }
            });
        }

        try {
            const n8n = N8nService.fromEncrypted(credential.instanceUrl, credential.apiKeyEncrypted);

            // Get current workflow
            const workflow = await n8n.getWorkflow(workflowId);

            // Find and update the node
            const nodes = workflow.nodes || [];
            const nodeIndex = nodes.findIndex((n: any) => n.name === nodeName);

            if (nodeIndex === -1) {
                return reply.status(404).send({
                    error: { code: 'NOT_FOUND', message: 'Node not found in workflow' }
                });
            }

            // Merge suggested parameters with existing ones
            nodes[nodeIndex].parameters = {
                ...nodes[nodeIndex].parameters,
                ...suggestedParameters
            };

            // Update workflow
            const updatedWorkflow = await n8n.updateWorkflow(workflowId, { nodes });

            return reply.send({
                success: true,
                message: `Applied fix to node "${nodeName}"`,
                workflow: updatedWorkflow
            });
        } catch (err: any) {
            console.error('Apply fix error:', err);
            return reply.status(500).send({
                error: {
                    code: 'UPDATE_ERROR',
                    message: err.message || 'Failed to apply fix'
                }
            });
        }
    });
}
