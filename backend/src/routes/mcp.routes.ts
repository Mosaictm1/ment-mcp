import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { hashApiKey } from '../lib/crypto.js';
import { N8nService } from '../services/n8n.service.js';
import '../types/index.js';

// Authenticate via JWT or API Key
async function authenticateMCP(request: FastifyRequest, reply: FastifyReply) {
    // Check for API Key first
    const apiKey = request.headers['x-api-key'] as string;

    if (apiKey) {
        const keyHash = hashApiKey(apiKey);
        const key = await prisma.apiKey.findFirst({
            where: { keyHash, isActive: true },
            include: { user: true },
        });

        if (!key) {
            return reply.status(401).send({
                error: {
                    code: 'INVALID_API_KEY',
                    message: 'Invalid or inactive API key',
                },
            });
        }

        // Update last used
        await prisma.apiKey.update({
            where: { id: key.id },
            data: { lastUsedAt: new Date() },
        });

        // Attach user to request
        (request as any).user = {
            id: key.user.id,
            email: key.user.email,
            tier: key.user.subscriptionTier,
        };
        return;
    }

    // Fall back to JWT
    try {
        await request.jwtVerify();
    } catch {
        return reply.status(401).send({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Invalid authentication. Provide X-API-Key header or Bearer token.',
            },
        });
    }
}

// Check and log quota
async function checkQuota(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    if (!user) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const apiCallsToday = await prisma.apiCallLog.count({
        where: {
            userId: user.id,
            timestamp: { gte: todayStart },
        },
    });

    const limit = user.tier === 'free' ? 100 : 999999;

    if (apiCallsToday >= limit) {
        return reply.status(402).send({
            error: {
                code: 'QUOTA_EXCEEDED',
                message: `Daily quota exceeded. Used: ${apiCallsToday}/${limit}. Upgrade to Supporter for unlimited access.`,
            },
        });
    }
}

export async function mcpRoutes(app: FastifyInstance) {
    app.addHook('onRequest', authenticateMCP);
    app.addHook('preHandler', checkQuota);

    // ============================================
    // POST /mcp/tool - Main MCP Tool Handler
    // ============================================
    app.post<{ Body: { tool: string; params: Record<string, unknown>; credentialId?: string } }>('/tool', async (request, reply) => {
        const startTime = Date.now();
        const { tool, params, credentialId } = request.body;
        const user = (request as any).user;

        if (!tool) {
            return reply.status(400).send({
                error: {
                    code: 'MISSING_TOOL',
                    message: 'Tool name is required',
                },
            });
        }

        // Get user's n8n credential
        const whereClause = credentialId
            ? { id: credentialId, userId: user.id }
            : { userId: user.id };

        const credential = await prisma.n8nCredential.findFirst({
            where: whereClause,
        });

        if (!credential) {
            return reply.status(400).send({
                error: {
                    code: 'NO_CREDENTIAL',
                    message: 'No n8n credentials found. Please add your n8n instance first.',
                },
            });
        }

        const n8n = N8nService.fromEncrypted(credential.instanceUrl, credential.apiKeyEncrypted);

        let result: unknown;

        try {
            switch (tool) {
                // ============================================
                // WORKFLOW TOOLS
                // ============================================
                case 'get_workflows':
                    result = await n8n.getWorkflows();
                    break;

                case 'get_workflow':
                    if (!params.workflowId) {
                        return reply.status(400).send({
                            error: { code: 'MISSING_PARAM', message: 'workflowId is required' },
                        });
                    }
                    result = await n8n.getWorkflow(params.workflowId as string);
                    break;

                case 'create_workflow':
                    if (!params.name) {
                        return reply.status(400).send({
                            error: { code: 'MISSING_PARAM', message: 'name is required' },
                        });
                    }
                    result = await n8n.createWorkflow({
                        name: params.name as string,
                        nodes: params.nodes as any,
                        connections: params.connections as any,
                    });
                    break;

                case 'update_workflow':
                    if (!params.workflowId) {
                        return reply.status(400).send({
                            error: { code: 'MISSING_PARAM', message: 'workflowId is required' },
                        });
                    }
                    result = await n8n.updateWorkflow(params.workflowId as string, {
                        nodes: params.nodes as any,
                        connections: params.connections as any,
                    });
                    break;

                case 'delete_workflow':
                    if (!params.workflowId) {
                        return reply.status(400).send({
                            error: { code: 'MISSING_PARAM', message: 'workflowId is required' },
                        });
                    }
                    await n8n.deleteWorkflow(params.workflowId as string);
                    result = { success: true };
                    break;

                case 'activate_workflow':
                    if (!params.workflowId) {
                        return reply.status(400).send({
                            error: { code: 'MISSING_PARAM', message: 'workflowId is required' },
                        });
                    }
                    result = await n8n.activateWorkflow(params.workflowId as string);
                    break;

                case 'deactivate_workflow':
                    if (!params.workflowId) {
                        return reply.status(400).send({
                            error: { code: 'MISSING_PARAM', message: 'workflowId is required' },
                        });
                    }
                    result = await n8n.deactivateWorkflow(params.workflowId as string);
                    break;

                // ============================================
                // EXECUTION TOOLS
                // ============================================
                case 'get_workflow_executions':
                    result = await n8n.getExecutions(
                        params.workflowId as string | undefined,
                        (params.limit as number) || 20
                    );
                    break;

                case 'execute_workflow':
                    if (!params.workflowId) {
                        return reply.status(400).send({
                            error: { code: 'MISSING_PARAM', message: 'workflowId is required' },
                        });
                    }
                    result = await n8n.executeWorkflow(
                        params.workflowId as string,
                        params.data as Record<string, unknown>
                    );
                    break;

                // ============================================
                // INFO TOOLS (will be enhanced later with nodes database)
                // ============================================
                case 'get_node_info':
                    result = {
                        message: 'Node info feature coming soon',
                        nodeName: params.nodeName,
                    };
                    break;

                case 'search_nodes':
                    result = {
                        message: 'Node search feature coming soon',
                        query: params.query,
                    };
                    break;

                case 'validate_workflow': {
                    const workflow = params.workflow as Record<string, unknown> | undefined;
                    const errors: string[] = [];

                    if (!workflow) {
                        errors.push('Workflow object is required');
                    } else {
                        if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
                            errors.push('Workflow must have nodes array');
                        }
                        if ((workflow.nodes as unknown[])?.length === 0) {
                            errors.push('Workflow must have at least one node');
                        }
                    }

                    result = {
                        valid: errors.length === 0,
                        errors,
                    };
                    break;
                }

                default:
                    return reply.status(400).send({
                        error: {
                            code: 'UNKNOWN_TOOL',
                            message: `Unknown tool: ${tool}. Available tools: get_workflows, get_workflow, create_workflow, update_workflow, delete_workflow, activate_workflow, deactivate_workflow, get_workflow_executions, execute_workflow, validate_workflow`,
                        },
                    });
            }

            // Log API call
            const responseTime = Date.now() - startTime;
            await prisma.apiCallLog.create({
                data: {
                    userId: user.id,
                    endpoint: `/mcp/tool/${tool}`,
                    method: 'POST',
                    responseTimeMs: responseTime,
                    statusCode: 200,
                    quotaUsed: 1,
                },
            });

            return reply.send({
                tool,
                result,
                meta: {
                    responseTimeMs: Date.now() - startTime,
                },
            });
        } catch (error) {
            // Log failed call
            await prisma.apiCallLog.create({
                data: {
                    userId: user.id,
                    endpoint: `/mcp/tool/${tool}`,
                    method: 'POST',
                    responseTimeMs: Date.now() - startTime,
                    statusCode: 502,
                    quotaUsed: 1,
                },
            });

            return reply.status(502).send({
                error: {
                    code: 'N8N_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to execute MCP tool',
                },
            });
        }
    });

    // ============================================
    // GET /mcp/tools - List available tools
    // ============================================
    app.get('/tools', async (_request, reply) => {
        return reply.send({
            tools: [
                {
                    name: 'get_workflows',
                    description: 'Get all workflows from n8n',
                    params: [],
                },
                {
                    name: 'get_workflow',
                    description: 'Get a specific workflow by ID',
                    params: [{ name: 'workflowId', type: 'string', required: true }],
                },
                {
                    name: 'create_workflow',
                    description: 'Create a new workflow in n8n',
                    params: [
                        { name: 'name', type: 'string', required: true },
                        { name: 'nodes', type: 'array', required: false },
                        { name: 'connections', type: 'object', required: false },
                    ],
                },
                {
                    name: 'update_workflow',
                    description: 'Update an existing workflow',
                    params: [
                        { name: 'workflowId', type: 'string', required: true },
                        { name: 'nodes', type: 'array', required: false },
                        { name: 'connections', type: 'object', required: false },
                    ],
                },
                {
                    name: 'delete_workflow',
                    description: 'Delete a workflow',
                    params: [{ name: 'workflowId', type: 'string', required: true }],
                },
                {
                    name: 'activate_workflow',
                    description: 'Activate a workflow',
                    params: [{ name: 'workflowId', type: 'string', required: true }],
                },
                {
                    name: 'deactivate_workflow',
                    description: 'Deactivate a workflow',
                    params: [{ name: 'workflowId', type: 'string', required: true }],
                },
                {
                    name: 'get_workflow_executions',
                    description: 'Get execution history',
                    params: [
                        { name: 'workflowId', type: 'string', required: false },
                        { name: 'limit', type: 'number', required: false },
                    ],
                },
                {
                    name: 'execute_workflow',
                    description: 'Execute a workflow',
                    params: [
                        { name: 'workflowId', type: 'string', required: true },
                        { name: 'data', type: 'object', required: false },
                    ],
                },
                {
                    name: 'validate_workflow',
                    description: 'Validate workflow JSON',
                    params: [{ name: 'workflow', type: 'object', required: true }],
                },
            ],
        });
    });
}
