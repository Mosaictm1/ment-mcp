import axios from 'axios';

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
 * Uses Perplexity for HTTP Request documentation research AND fix generation
 */
export class AIRepairService {
    private perplexityApiKey: string;

    constructor(perplexityApiKey: string, _anthropicApiKey?: string) {
        this.perplexityApiKey = perplexityApiKey;
    }

    /**
     * Repair a node with an error
     */
    async repairNode(node: NodeData, error: string, inputData?: unknown): Promise<RepairSuggestion> {
        const isHttpRequest = node.type.toLowerCase().includes('httprequest');

        if (isHttpRequest) {
            return this.repairHttpRequestNode(node, error, inputData);
        }

        return this.repairGenericNode(node, error, inputData);
    }

    /**
     * Repair HTTP Request node using Perplexity
     */
    private async repairHttpRequestNode(node: NodeData, error: string, inputData?: unknown): Promise<RepairSuggestion> {
        const params = node.parameters as Record<string, any> || {};
        const url = params.url || '';
        const method = params.method || 'GET';

        let domain = '';
        try {
            const urlObj = new URL(url);
            domain = urlObj.hostname;
        } catch {
            domain = url;
        }

        const response = await this.queryPerplexity(`
You are an n8n workflow expert and API troubleshooter.

I'm getting this error when calling the ${domain} API in an n8n HTTP Request node:

**Error:** ${error}

**Current Configuration:**
- URL: ${url}
- Method: ${method}
${params.headers ? `- Headers: ${JSON.stringify(params.headers)}` : ''}
${params.body ? `- Body: ${JSON.stringify(params.body)}` : ''}

Please:
1. Search the official ${domain} API documentation
2. Identify what's wrong with my request
3. Provide the correct parameters to fix this

Respond with a JSON object (and ONLY the JSON, no markdown):
{
    "summary": "One-line fix summary",
    "explanation": "What was wrong and how to fix it",
    "suggestedFix": {
        "parameters": {
            "url": "corrected URL if needed",
            "method": "corrected method if needed",
            "headers": { "corrected": "headers" },
            "body": "corrected body if needed"
        }
    },
    "confidence": "high" | "medium" | "low"
}
        `);

        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const suggestion = JSON.parse(jsonMatch[0]);
                suggestion.documentation = response;
                return suggestion;
            }
        } catch {
            // If parsing fails, return the response as explanation
        }

        return {
            summary: 'Analysis complete - review suggestions below',
            explanation: response,
            suggestedFix: {},
            confidence: 'medium',
            documentation: response
        };
    }

    /**
     * Repair generic node using Perplexity
     */
    private async repairGenericNode(node: NodeData, error: string, inputData?: unknown): Promise<RepairSuggestion> {
        const response = await this.queryPerplexity(`
You are an n8n workflow expert.

I have an n8n node with an error:

**Node Type:** ${node.type}
**Node Name:** ${node.name}
**Parameters:** ${JSON.stringify(node.parameters, null, 2)}
**Error:** ${error}
${inputData ? `**Input Data:** ${JSON.stringify(inputData, null, 2)}` : ''}

Please analyze this error and suggest a fix.

Respond with a JSON object (and ONLY the JSON, no markdown):
{
    "summary": "One-line fix summary",
    "explanation": "What was wrong and how to fix it",
    "suggestedFix": {
        "parameters": { "corrected": "parameters" }
    },
    "confidence": "high" | "medium" | "low"
}
        `);

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch {
            // If parsing fails, return the response as explanation
        }

        return {
            summary: 'Analysis complete',
            explanation: response,
            suggestedFix: {},
            confidence: 'low'
        };
    }

    /**
     * Suggest improvements for a node
     */
    async improveNode(node: NodeData, inputData?: unknown, outputData?: unknown): Promise<ImproveSuggestion> {
        const response = await this.queryPerplexity(`
You are an n8n workflow optimization expert.

Analyze this n8n node and suggest improvements:

**Node Type:** ${node.type}
**Node Name:** ${node.name}
**Parameters:** ${JSON.stringify(node.parameters, null, 2)}
${inputData ? `**Sample Input:** ${JSON.stringify(inputData, null, 2)}` : ''}
${outputData ? `**Sample Output:** ${JSON.stringify(outputData, null, 2)}` : ''}

Respond with a JSON object (and ONLY the JSON, no markdown):
{
    "summary": "One-line summary of improvements",
    "improvements": [
        {
            "title": "Improvement title",
            "description": "What to improve and why",
            "implementation": "How to implement it"
        }
    ],
    "performance": "Performance tips if any",
    "security": "Security recommendations if any"
}
        `);

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch {
            // If parsing fails, return the response as improvements
        }

        return {
            summary: 'Analysis complete',
            improvements: [{ title: 'AI Analysis', description: response }]
        };
    }

    /**
     * Query Perplexity API
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
                            content: 'You are an API documentation researcher and n8n workflow expert. Search for official documentation and provide accurate, detailed fixes. Always try to respond with valid JSON when asked.'
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
            throw new Error(`Perplexity API error: ${error.response?.data?.error?.message || error.message}`);
        }
    }
}

export default AIRepairService;
