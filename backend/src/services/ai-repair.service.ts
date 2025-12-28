import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';

interface NodeData {
    name: string;
    type: string;
    parameters?: Record<string, unknown>;
}

interface RepairSuggestion {
    summary: string;
    explanation: string;
    suggestedFix: {
        parameters?: Record<string, unknown>;
        code?: string;
    };
    documentation?: string;
    confidence: 'high' | 'medium' | 'low';
}

interface ImproveSuggestion {
    summary: string;
    improvements: Array<{
        title: string;
        description: string;
        implementation?: string;
    }>;
    performance?: string;
    security?: string;
}

/**
 * AI Repair Service
 * Uses Perplexity for HTTP Request documentation research
 * Uses Anthropic for general node analysis and repair suggestions
 */
export class AIRepairService {
    private perplexityApiKey: string;
    private anthropicApiKey: string;
    private anthropic: Anthropic;

    constructor(perplexityApiKey: string, anthropicApiKey: string) {
        this.perplexityApiKey = perplexityApiKey;
        this.anthropicApiKey = anthropicApiKey;
        this.anthropic = new Anthropic({ apiKey: anthropicApiKey });
    }

    /**
     * Repair a node with an error
     * For HTTP Request nodes, uses Perplexity to research the API
     */
    async repairNode(node: NodeData, error: string, inputData?: unknown): Promise<RepairSuggestion> {
        const isHttpRequest = node.type.toLowerCase().includes('httprequest');

        if (isHttpRequest) {
            return this.repairHttpRequestNode(node, error, inputData);
        }

        return this.repairGenericNode(node, error, inputData);
    }

    /**
     * Repair HTTP Request node using Perplexity Deep Research
     */
    private async repairHttpRequestNode(node: NodeData, error: string, inputData?: unknown): Promise<RepairSuggestion> {
        const params = node.parameters as Record<string, any> || {};
        const url = params.url || '';
        const method = params.method || 'GET';

        // Extract API domain for documentation search
        let domain = '';
        try {
            const urlObj = new URL(url);
            domain = urlObj.hostname;
        } catch {
            domain = url;
        }

        // Use Perplexity to research the API
        const perplexityResponse = await this.queryPerplexity(`
            I'm getting this error when calling the ${domain} API:
            
            Error: ${error}
            
            URL: ${url}
            Method: ${method}
            ${params.headers ? `Headers: ${JSON.stringify(params.headers)}` : ''}
            ${params.body ? `Body: ${JSON.stringify(params.body)}` : ''}
            
            Please search the official documentation for ${domain} and tell me:
            1. What is the correct API endpoint format?
            2. What authentication is required?
            3. What are the required headers?
            4. What is the correct request body format?
            5. Common error codes and their solutions
            
            Focus on the official API documentation.
        `);

        // Use Anthropic to generate the fix
        const fixResponse = await this.anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{
                role: 'user',
                content: `You are an n8n workflow expert. Based on this API documentation research and error message, suggest a fix.

Node Type: ${node.type}
Node Name: ${node.name}
Current Parameters: ${JSON.stringify(params, null, 2)}
Error: ${error}

API Documentation Research:
${perplexityResponse}

Respond with a JSON object containing:
{
    "summary": "One-line summary of the fix",
    "explanation": "Detailed explanation of what was wrong and how to fix it",
    "suggestedFix": {
        "parameters": { /* The corrected n8n node parameters */ }
    },
    "confidence": "high" | "medium" | "low"
}

Only respond with valid JSON.`
            }]
        });

        const textContent = fixResponse.content.find(c => c.type === 'text');
        if (!textContent || textContent.type !== 'text') {
            throw new Error('No text response from AI');
        }

        try {
            const suggestion = JSON.parse(textContent.text);
            suggestion.documentation = perplexityResponse;
            return suggestion;
        } catch {
            return {
                summary: 'Could not generate automatic fix',
                explanation: perplexityResponse,
                suggestedFix: {},
                confidence: 'low'
            };
        }
    }

    /**
     * Repair generic (non-HTTP) node
     */
    private async repairGenericNode(node: NodeData, error: string, inputData?: unknown): Promise<RepairSuggestion> {
        const response = await this.anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{
                role: 'user',
                content: `You are an n8n workflow expert. Analyze this node error and suggest a fix.

Node Type: ${node.type}
Node Name: ${node.name}
Parameters: ${JSON.stringify(node.parameters, null, 2)}
Error: ${error}
${inputData ? `Input Data: ${JSON.stringify(inputData, null, 2)}` : ''}

Respond with a JSON object containing:
{
    "summary": "One-line summary of the fix",
    "explanation": "Detailed explanation of what was wrong and how to fix it",
    "suggestedFix": {
        "parameters": { /* The corrected n8n node parameters */ }
    },
    "confidence": "high" | "medium" | "low"
}

Only respond with valid JSON.`
            }]
        });

        const textContent = response.content.find(c => c.type === 'text');
        if (!textContent || textContent.type !== 'text') {
            throw new Error('No text response from AI');
        }

        try {
            return JSON.parse(textContent.text);
        } catch {
            return {
                summary: 'Could not parse AI response',
                explanation: textContent.text,
                suggestedFix: {},
                confidence: 'low'
            };
        }
    }

    /**
     * Suggest improvements for a node
     */
    async improveNode(node: NodeData, inputData?: unknown, outputData?: unknown): Promise<ImproveSuggestion> {
        const response = await this.anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{
                role: 'user',
                content: `You are an n8n workflow optimization expert. Analyze this node and suggest improvements.

Node Type: ${node.type}
Node Name: ${node.name}
Parameters: ${JSON.stringify(node.parameters, null, 2)}
${inputData ? `Input Data Sample: ${JSON.stringify(inputData, null, 2)}` : ''}
${outputData ? `Output Data Sample: ${JSON.stringify(outputData, null, 2)}` : ''}

Respond with a JSON object containing:
{
    "summary": "One-line summary of improvements",
    "improvements": [
        {
            "title": "Improvement title",
            "description": "What to improve and why",
            "implementation": "How to implement it in n8n"
        }
    ],
    "performance": "Performance optimization tips if any",
    "security": "Security recommendations if any"
}

Only respond with valid JSON.`
            }]
        });

        const textContent = response.content.find(c => c.type === 'text');
        if (!textContent || textContent.type !== 'text') {
            throw new Error('No text response from AI');
        }

        try {
            return JSON.parse(textContent.text);
        } catch {
            return {
                summary: 'Could not parse AI response',
                improvements: [{ title: 'Analysis', description: textContent.text }]
            };
        }
    }

    /**
     * Query Perplexity API for deep research
     */
    private async queryPerplexity(query: string): Promise<string> {
        try {
            const response = await axios.post(
                'https://api.perplexity.ai/chat/completions',
                {
                    model: 'sonar-pro',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an API documentation researcher. Search for official API documentation and provide accurate, detailed information about API endpoints, authentication, and usage.'
                        },
                        {
                            role: 'user',
                            content: query
                        }
                    ],
                    max_tokens: 3000,
                    temperature: 0.1,
                    search_recency_filter: 'month'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.perplexityApiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0]?.message?.content || 'No response from Perplexity';
        } catch (error: any) {
            console.error('Perplexity API error:', error.response?.data || error.message);
            return `Failed to query Perplexity: ${error.message}`;
        }
    }
}

export default AIRepairService;
