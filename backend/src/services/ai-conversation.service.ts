import { prisma } from '../lib/prisma.js';
import { AnthropicService, AnthropicMessage } from './anthropic.service.js';
import { N8nService } from './n8n.service.js';
import { ConversationStatus, MessageRole, WorkflowPlanStatus } from '@prisma/client';
import { env } from '../config/env.js';

export interface ConversationContext {
    conversationId: string;
    workflowId?: string;
    instanceId: string;
    userId: string;
}

export interface SendMessageResponse {
    messageId: string;
    content: string;
    plan?: any;
    toolCalls?: any[];
}

/**
 * AI Conversation Service
 * Manages conversations between users and Claude for workflow building
 */
export class AIConversationService {
    /**
     * Create a new conversation
     */
    static async createConversation(
        userId: string,
        instanceId: string,
        workflowId?: string,
        title: string = 'New Workflow Assistant Chat'
    ) {
        return prisma.conversation.create({
            data: {
                userId,
                instanceId,
                workflowId,
                title,
                status: ConversationStatus.active,
            },
        });
    }

    /**
     * Get conversation with message history
     */
    static async getConversation(conversationId: string) {
        return prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
                plans: {
                    orderBy: { createdAt: 'desc' },
                },
                instance: true,
            },
        });
    }

    /**
     * Send a message in the conversation
     */
    static async sendMessage(
        context: ConversationContext,
        userMessage: string
    ): Promise<SendMessageResponse> {
        // Save user message
        await prisma.message.create({
            data: {
                conversationId: context.conversationId,
                role: MessageRole.user,
                content: userMessage,
            },
        });

        // Get conversation history
        const conversation = await this.getConversation(context.conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        // Get workflow context if available
        let workflowContext;
        if (context.workflowId) {
            const credential = await prisma.n8nCredential.findUnique({
                where: { id: context.instanceId },
            });

            if (credential) {
                const n8n = N8nService.fromEncrypted(
                    credential.instanceUrl,
                    credential.apiKeyEncrypted
                );
                workflowContext = await n8n.getWorkflow(context.workflowId);
            }
        }

        // Build message history for Claude
        const messages: AnthropicMessage[] = conversation.messages.map((msg) => ({
            role: msg.role === MessageRole.user ? 'user' : 'assistant',
            content: msg.content,
        }));

        // Check if AI features are enabled
        if (!env.ANTHROPIC_API_KEY) {
            throw new Error('AI features are not configured. Please contact support.');
        }

        // Initialize Anthropic service with server-side API key
        const anthropic = new AnthropicService({
            apiKey: env.ANTHROPIC_API_KEY,
        });

        // Get system prompt
        const systemPrompt = AnthropicService.getWorkflowExpertPrompt(workflowContext);

        // Get tools
        const tools = AnthropicService.getN8nTools();

        // Send to Claude
        const response = await anthropic.sendMessage(messages, systemPrompt, tools);

        // Handle tool calls if any
        let plan;
        if (response.toolCalls) {
            for (const toolCall of response.toolCalls) {
                if (toolCall.name === 'generate_workflow_plan') {
                    // Create workflow plan
                    plan = await prisma.workflowPlan.create({
                        data: {
                            conversationId: context.conversationId,
                            status: WorkflowPlanStatus.pending,
                            planData: toolCall.input,
                            originalWorkflow: workflowContext ? (workflowContext as any) : null,
                            modifiedWorkflow: {
                                ...workflowContext,
                                nodes: toolCall.input.nodes,
                                connections: toolCall.input.connections || workflowContext?.connections,
                            } as any,
                        },
                    });

                    // Add info to response
                    response.content += `\n\n✨ **Plan Generated** ✨\n\n${toolCall.input.description}\n\nPlease review the plan and approve or reject it.`;
                }
            }
        }

        // Save assistant message
        const assistantMessage = await prisma.message.create({
            data: {
                conversationId: context.conversationId,
                role: MessageRole.assistant,
                content: response.content,
                metadata: {
                    toolCalls: response.toolCalls,
                    stopReason: response.stopReason,
                },
            },
        });

        return {
            messageId: assistantMessage.id,
            content: response.content,
            plan: plan || undefined,
            toolCalls: response.toolCalls,
        };
    }

    /**
     * Approve a workflow plan
     */
    static async approvePlan(planId: string, userId: string) {
        const plan = await prisma.workflowPlan.findUnique({
            where: { id: planId },
            include: {
                conversation: {
                    include: {
                        instance: true,
                    },
                },
            },
        });

        if (!plan) {
            throw new Error('Plan not found');
        }

        if (plan.conversation.userId !== userId) {
            throw new Error('Unauthorized');
        }

        // Update plan status
        await prisma.workflowPlan.update({
            where: { id: planId },
            data: { status: WorkflowPlanStatus.approved },
        });

        // Apply changes to n8n
        const n8n = N8nService.fromEncrypted(
            plan.conversation.instance.instanceUrl,
            plan.conversation.instance.apiKeyEncrypted
        );

        try {
            // Get workflow ID from conversation or plan
            const workflowId = plan.conversation.workflowId;
            if (!workflowId) {
                throw new Error('No workflow ID in conversation');
            }

            // Apply changes
            const result = await n8n.applyWorkflowChanges(workflowId, plan.modifiedWorkflow as any);

            if (!result.success) {
                throw new Error(result.error || 'Failed to apply changes');
            }

            // Create version history
            const latestVersion = await prisma.workflowVersion.findFirst({
                where: {
                    workflowId,
                    instanceId: plan.conversation.instanceId,
                },
                orderBy: { versionNumber: 'desc' },
            });

            await prisma.workflowVersion.create({
                data: {
                    workflowId,
                    instanceId: plan.conversation.instanceId,
                    userId: plan.conversation.userId,
                    versionNumber: (latestVersion?.versionNumber || 0) + 1,
                    workflowData: result.workflow as any,
                    changeDescription: (plan.planData as any).description || 'AI-generated changes',
                    createdByAi: true,
                    planId,
                },
            });

            // Mark plan as applied
            await prisma.workflowPlan.update({
                where: { id: planId },
                data: {
                    status: WorkflowPlanStatus.applied,
                    appliedAt: new Date(),
                },
            });

            return {
                success: true,
                workflow: result.workflow,
            };
        } catch (error: any) {
            // Mark plan as failed
            await prisma.workflowPlan.update({
                where: { id: planId },
                data: {
                    status: WorkflowPlanStatus.failed,
                    errorMessage: error.message,
                },
            });

            throw error;
        }
    }

    /**
     * Reject a workflow plan
     */
    static async rejectPlan(planId: string, userId: string, reason?: string) {
        const plan = await prisma.workflowPlan.findUnique({
            where: { id: planId },
            include: { conversation: true },
        });

        if (!plan) {
            throw new Error('Plan not found');
        }

        if (plan.conversation.userId !== userId) {
            throw new Error('Unauthorized');
        }

        await prisma.workflowPlan.update({
            where: { id: planId },
            data: {
                status: WorkflowPlanStatus.rejected,
                errorMessage: reason,
            },
        });

        // Add system message explaining rejection
        await prisma.message.create({
            data: {
                conversationId: plan.conversationId,
                role: MessageRole.system,
                content: `Plan rejected${reason ? `: ${reason}` : ''}`,
            },
        });

        return { success: true };
    }

    /**
     * Test/execute a workflow plan
     */
    static async testPlan(planId: string, userId: string, testData?: any) {
        const plan = await prisma.workflowPlan.findUnique({
            where: { id: planId },
            include: {
                conversation: {
                    include: { instance: true },
                },
            },
        });

        if (!plan) {
            throw new Error('Plan not found');
        }

        if (plan.conversation.userId !== userId) {
            throw new Error('Unauthorized');
        }

        const n8n = N8nService.fromEncrypted(
            plan.conversation.instance.instanceUrl,
            plan.conversation.instance.apiKeyEncrypted
        );

        const workflowId = plan.conversation.workflowId;
        if (!workflowId) {
            throw new Error('No workflow ID');
        }

        const testResults = await n8n.testWorkflow(workflowId, testData);

        // Save test results
        await prisma.workflowPlan.update({
            where: { id: planId },
            data: { testResults },
        });

        return testResults;
    }

    /**
     * Get workflow version history
     */
    static async getWorkflowHistory(workflowId: string, instanceId: string) {
        return prisma.workflowVersion.findMany({
            where: {
                workflowId,
                instanceId,
            },
            orderBy: { versionNumber: 'desc' },
        });
    }
}
