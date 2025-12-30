import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { HttpNodeBuilderAgent, BuildResult, WorkflowAnalysis } from '../services/ai-repair.service.js';
import { N8nService } from '../services/n8n.service.js';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

interface BuildRequest {
    description: string;
}

interface FixRequest {
    node: { name: string; type: string; parameters?: Record<string, unknown> };
    errorMessage: string;
    inputData?: unknown;
}

interface AnalyzeRequest {
    workflowId: string;
    credentialId: string;
}

interface ApplyRequest {
    workflowId: string;
    nodeName: string;
    nodeConfig: {
        url: string;
        method: string;
        headers?: Record<string, string>;
        body?: unknown;
    };
    credentialId: string;
}

interface ExecuteAndAnalyzeRequest {
    workflowId: string;
    credentialId: string;
    inputData?: Record<string, unknown>;
}

/**
 * HTTP Node Builder Routes
 * 
 * Endpoints for building and repairing HTTP Request nodes using AI
 */
export async function httpBuilderRoutes(app: FastifyInstance) {
    // All routes require authentication
    app.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
        }
    });

    /**
     * POST /v1/http-builder/build
     * Build a new HTTP node from a natural language description
     */
    app.post<{ Body: BuildRequest }>('/build', async (request, reply) => {
        try {
            const { description } = request.body;

            if (!description) {
                return reply.status(400).send({
                    success: false,
                    error: 'Description is required'
                });
            }

            const perplexityApiKey = env.PERPLEXITY_API_KEY;
            if (!perplexityApiKey) {
                return reply.status(500).send({
                    success: false,
                    error: 'Perplexity API key not configured'
                });
            }

            const agent = new HttpNodeBuilderAgent(perplexityApiKey);
            const result = await agent.buildHttpNode(description);

            return reply.send({
                success: true,
                data: result
            });
        } catch (error: any) {
            request.log.error(error, '[HTTP Builder] Build error');
            return reply.status(500).send({
                success: false,
                error: error.message
            });
        }
    });

    /**
     * POST /v1/http-builder/fix
     * Fix a broken HTTP node based on error message
     */
    app.post<{ Body: FixRequest }>('/fix', async (request, reply) => {
        try {
            const { node, errorMessage, inputData } = request.body;

            if (!node || !errorMessage) {
                return reply.status(400).send({
                    success: false,
                    error: 'Node and errorMessage are required'
                });
            }

            const perplexityApiKey = env.PERPLEXITY_API_KEY;
            if (!perplexityApiKey) {
                return reply.status(500).send({
                    success: false,
                    error: 'Perplexity API key not configured'
                });
            }

            const agent = new HttpNodeBuilderAgent(perplexityApiKey);
            const result = await agent.fixHttpNode(node, errorMessage, inputData);

            return reply.send({
                success: true,
                data: result
            });
        } catch (error: any) {
            request.log.error(error, '[HTTP Builder] Fix error');
            return reply.status(500).send({
                success: false,
                error: error.message
            });
        }
    });

    /**
     * POST /v1/http-builder/analyze
     * Analyze a workflow and identify HTTP nodes with issues
     */
    app.post<{ Body: AnalyzeRequest }>('/analyze', async (request, reply) => {
        try {
            const user = request.user as { id: string };
            const { workflowId, credentialId } = request.body;

            if (!workflowId || !credentialId) {
                return reply.status(400).send({
                    success: false,
                    error: 'workflowId and credentialId are required'
                });
            }

            // Get n8n credentials
            const credential = await prisma.n8nCredential.findFirst({
                where: { id: credentialId, userId: user.id }
            });

            if (!credential) {
                return reply.status(404).send({
                    success: false,
                    error: 'Credential not found'
                });
            }

            // Create n8n service
            const n8nService = N8nService.fromEncrypted(
                credential.instanceUrl,
                credential.apiKeyEncrypted
            );

            // Get workflow details
            const workflow = await n8nService.getWorkflow(workflowId);

            // Get latest execution for analysis
            const executions = await n8nService.getExecutions(workflowId, 1);
            let executionData = null;

            if (executions.length > 0) {
                executionData = await n8nService.getExecution(executions[0].id);
            }

            // Analyze with AI agent
            const perplexityApiKey = env.PERPLEXITY_API_KEY;
            if (!perplexityApiKey) {
                return reply.status(500).send({
                    success: false,
                    error: 'Perplexity API key not configured'
                });
            }

            const agent = new HttpNodeBuilderAgent(perplexityApiKey);
            const analysis = await agent.analyzeWorkflow(workflow, executionData?.data);

            return reply.send({
                success: true,
                data: analysis
            });
        } catch (error: any) {
            request.log.error(error, '[HTTP Builder] Analyze error');
            return reply.status(500).send({
                success: false,
                error: error.message
            });
        }
    });

    /**
     * POST /v1/http-builder/apply
     * Apply a generated node configuration to a workflow
     */
    app.post<{ Body: ApplyRequest }>('/apply', async (request, reply) => {
        try {
            const user = request.user as { id: string };
            const { workflowId, nodeName, nodeConfig, credentialId } = request.body;

            if (!workflowId || !nodeName || !nodeConfig || !credentialId) {
                return reply.status(400).send({
                    success: false,
                    error: 'workflowId, nodeName, nodeConfig, and credentialId are required'
                });
            }

            // Get n8n credentials
            const credential = await prisma.n8nCredential.findFirst({
                where: { id: credentialId, userId: user.id }
            });

            if (!credential) {
                return reply.status(404).send({
                    success: false,
                    error: 'Credential not found'
                });
            }

            // Create n8n service
            const n8nService = N8nService.fromEncrypted(
                credential.instanceUrl,
                credential.apiKeyEncrypted
            );

            // Get current workflow
            const workflow = await n8nService.getWorkflow(workflowId);

            if (!workflow.nodes) {
                return reply.status(400).send({
                    success: false,
                    error: 'Workflow has no nodes'
                });
            }

            // Find and update the target node
            const nodeIndex = workflow.nodes.findIndex((n: any) => n.name === nodeName);

            if (nodeIndex === -1) {
                return reply.status(404).send({
                    success: false,
                    error: `Node "${nodeName}" not found in workflow`
                });
            }

            // Update node parameters
            const updatedNode = {
                ...workflow.nodes[nodeIndex],
                parameters: {
                    ...workflow.nodes[nodeIndex].parameters,
                    url: nodeConfig.url,
                    method: nodeConfig.method,
                    ...(nodeConfig.headers && {
                        sendHeaders: true,
                        headerParameters: {
                            parameters: Object.entries(nodeConfig.headers).map(([name, value]) => ({
                                name,
                                value
                            }))
                        }
                    }),
                    ...(nodeConfig.body ? {
                        sendBody: true,
                        bodyParameters: {
                            parameters: typeof nodeConfig.body === 'object' && nodeConfig.body !== null
                                ? Object.entries(nodeConfig.body as Record<string, unknown>).map(([name, value]) => ({
                                    name,
                                    value: JSON.stringify(value)
                                }))
                                : [{ name: 'body', value: String(nodeConfig.body) }]
                        }
                    } : {})
                }
            };

            workflow.nodes[nodeIndex] = updatedNode;

            // Update the workflow
            const updatedWorkflow = await n8nService.updateWorkflow(workflowId, {
                nodes: workflow.nodes
            });

            return reply.send({
                success: true,
                data: {
                    message: `Node "${nodeName}" updated successfully`,
                    workflow: updatedWorkflow
                }
            });
        } catch (error: any) {
            request.log.error(error, '[HTTP Builder] Apply error');
            return reply.status(500).send({
                success: false,
                error: error.message
            });
        }
    });

    /**
     * POST /v1/http-builder/execute-and-analyze
     * Execute a workflow and analyze the results
     */
    app.post<{ Body: ExecuteAndAnalyzeRequest }>('/execute-and-analyze', async (request, reply) => {
        try {
            const user = request.user as { id: string };
            const { workflowId, credentialId, inputData } = request.body;

            if (!workflowId || !credentialId) {
                return reply.status(400).send({
                    success: false,
                    error: 'workflowId and credentialId are required'
                });
            }

            // Get n8n credentials
            const credential = await prisma.n8nCredential.findFirst({
                where: { id: credentialId, userId: user.id }
            });

            if (!credential) {
                return reply.status(404).send({
                    success: false,
                    error: 'Credential not found'
                });
            }

            // Create n8n service
            const n8nService = N8nService.fromEncrypted(
                credential.instanceUrl,
                credential.apiKeyEncrypted
            );

            // Execute the workflow
            const executionResult = await n8nService.executeWorkflow(workflowId, inputData);

            // Get workflow details
            const workflow = await n8nService.getWorkflow(workflowId);

            // Get execution details if available
            let executionData = null;
            if (executionResult.executionId && executionResult.executionId !== 'unknown') {
                // Wait a moment for execution to complete
                await new Promise(resolve => setTimeout(resolve, 2000));

                try {
                    executionData = await n8nService.getExecution(executionResult.executionId);
                } catch (e) {
                    request.log.info('[HTTP Builder] Could not fetch execution details');
                }
            }

            // Analyze with AI agent
            const perplexityApiKey = env.PERPLEXITY_API_KEY;
            let analysis: WorkflowAnalysis | null = null;

            if (perplexityApiKey) {
                const agent = new HttpNodeBuilderAgent(perplexityApiKey);
                analysis = await agent.analyzeWorkflow(workflow, executionData?.data);
            }

            return reply.send({
                success: true,
                data: {
                    execution: executionResult,
                    executionDetails: executionData,
                    analysis
                }
            });
        } catch (error: any) {
            request.log.error(error, '[HTTP Builder] Execute and analyze error');
            return reply.status(500).send({
                success: false,
                error: error.message
            });
        }
    });
}
