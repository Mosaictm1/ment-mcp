import Anthropic from '@anthropic-ai/sdk';

export interface AnthropicConfig {
    apiKey: string;
}

export interface AnthropicMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface AnthropicToolDefinition {
    name: string;
    description: string;
    input_schema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}

export interface AnthropicResponse {
    content: string;
    toolCalls?: Array<{
        id: string;
        name: string;
        input: Record<string, any>;
    }>;
    stopReason: string;
}

/**
 * Anthropic Claude API Service
 * Handles AI conversation and tool use for workflow assistant
 */
export class AnthropicService {
    private client: Anthropic;
    private model: string = 'claude-3-5-sonnet-20241022';

    constructor(config: AnthropicConfig) {
        this.client = new Anthropic({
            apiKey: config.apiKey,
        });
    }

    /**
     * Send message to Claude with conversation history
     */
    async sendMessage(
        messages: AnthropicMessage[],
        systemPrompt: string,
        tools?: AnthropicToolDefinition[],
        maxTokens: number = 4096
    ): Promise<AnthropicResponse> {
        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: messages as any,
            tools: tools as any,
        });

        // Extract content
        let content = '';
        const toolCalls: any[] = [];

        for (const block of response.content) {
            if (block.type === 'text') {
                content += block.text;
            } else if (block.type === 'tool_use') {
                toolCalls.push({
                    id: block.id,
                    name: block.name,
                    input: block.input,
                });
            }
        }

        return {
            content,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            stopReason: response.stop_reason || 'end_turn',
        };
    }

    /**
     * Stream message response
     */
    async *streamMessage(
        messages: AnthropicMessage[],
        systemPrompt: string,
        tools?: AnthropicToolDefinition[],
        maxTokens: number = 4096
    ): AsyncGenerator<string, void, unknown> {
        const stream = await this.client.messages.create({
            model: this.model,
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: messages as any,
            tools: tools as any,
            stream: true,
        });

        for await (const event of stream) {
            if (
                event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta'
            ) {
                yield event.delta.text;
            }
        }
    }

    /**
     * Get n8n workflow expert system prompt
     */
    static getWorkflowExpertPrompt(workflowContext?: any): string {
        return `You are an expert n8n workflow automation assistant. Your role is to help users build, fix, and optimize their n8n workflows through natural conversation.

## Your Capabilities:
1. **Understand User Intent**: Listen to the user's goals and translate them into workflow automation plans
2. **Search Documentation**: Find API documentation for services the user wants to integrate
3. **Generate Plans**: Create detailed, step-by-step plans for workflow modifications
4. **Validate Changes**: Ensure workflow changes are valid and won't break existing functionality
5. **Test Workflows**: Execute test runs to verify changes work correctly

## Current Context:
${workflowContext ? `**Workflow**: ${workflowContext.name || 'Untitled'}
**Workflow ID**: ${workflowContext.id || 'New workflow'}
**Nodes**: ${workflowContext.nodes?.length || 0} nodes
**Active**: ${workflowContext.active ? 'Yes' : 'No'}` : 'No workflow selected yet'}

## Your Process:
1. **Listen**: Understand what the user wants to achieve
2. **Research**: Search for API docs if needed using the search_api_docs tool
3. **Plan**: Generate a detailed plan with specific node configurations
4. **Present**: Show the plan to the user for approval
5. **Execute**: Apply changes only after user approval
6. **Verify**: Test the workflow and report results

## Guidelines:
- Always explain your reasoning
- Ask clarifying questions when needed
- Generate detailed plans before making changes
- Use HTTP Request nodes for external APIs
- Follow n8n best practices
- Validate all changes before applying
- Never modify workflows without user approval

## Available Tools:
- get_workflow: Read current workflow structure
- update_workflow: Modify workflow (only after approval!)
- execute_workflow: Test workflow execution
- search_api_docs: Find API documentation
- validate_workflow: Check workflow integrity

Ready to help! What would you like to build today?`;
    }

    /**
     * Build tool definitions for Claude
     */
    static getN8nTools(): AnthropicToolDefinition[] {
        return [
            {
                name: 'get_workflow',
                description: 'Get the full details of the current workflow including all nodes and connections',
                input_schema: {
                    type: 'object',
                    properties: {
                        workflowId: {
                            type: 'string',
                            description: 'The ID of the workflow to retrieve',
                        },
                    },
                    required: ['workflowId'],
                },
            },
            {
                name: 'search_api_docs',
                description: 'Search the web for API documentation for a specific service or API',
                input_schema: {
                    type: 'object',
                    properties: {
                        serviceName: {
                            type: 'string',
                            description: 'Name of the service/API to search for (e.g., "Twitter API", "OpenAI API")',
                        },
                        query: {
                            type: 'string',
                            description: 'Specific query about the API (e.g., "how to create a tweet", "authentication")',
                        },
                    },
                    required: ['serviceName'],
                },
            },
            {
                name: 'generate_workflow_plan',
                description: 'Generate a detailed plan for modifying the workflow. This plan will be shown to the user for approval.',
                input_schema: {
                    type: 'object',
                    properties: {
                        description: {
                            type: 'string',
                            description: 'Human-readable description of what changes will be made',
                        },
                        nodes: {
                            type: 'array',
                            description: 'Array of nodes to add/modify in the workflow',
                            items: {
                                type: 'object',
                            },
                        },
                        connections: {
                            type: 'object',
                            description: 'Workflow connections object',
                        },
                    },
                    required: ['description', 'nodes'],
                },
            },
            {
                name: 'validate_workflow',
                description: 'Validate a workflow structure before applying changes',
                input_schema: {
                    type: 'object',
                    properties: {
                        workflow: {
                            type: 'object',
                            description: 'Workflow object to validate',
                        },
                    },
                    required: ['workflow'],
                },
            },
        ];
    }
}
