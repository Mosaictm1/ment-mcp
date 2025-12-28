import axios from 'axios';

interface NodeData {
    name: string;
    type: string;
    parameters?: Record<string, unknown>;
}

interface WorkflowContext {
    workflowName?: string;
    previousNodes?: Array<{ name: string; type: string }>;
    expectedOutput?: string;
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
    service?: string;
    researchSteps?: string[];
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
 * AI Repair Service - Deep Research Mode
 * Uses Perplexity with multi-step research:
 * 1. Read full node JSON
 * 2. Identify the service/platform
 * 3. Deep research in service docs
 * 4. Generate and apply fix
 */
export class AIRepairService {
    private perplexityApiKey: string;

    constructor(perplexityApiKey: string, _anthropicApiKey?: string) {
        this.perplexityApiKey = perplexityApiKey;
    }

    /**
     * Step 1: Extract full node context
     */
    private extractNodeContext(node: NodeData): {
        fullJson: string;
        url?: string;
        method?: string;
        headers?: Record<string, string>;
        body?: unknown;
        authType?: string;
    } {
        const params = node.parameters as Record<string, any> || {};

        return {
            fullJson: JSON.stringify(node, null, 2),
            url: params.url || params.requestUrl || '',
            method: params.method || params.requestMethod || 'GET',
            headers: params.headers || params.headerParameters || {},
            body: params.body || params.bodyParameters || params.jsonBody,
            authType: params.authentication || params.authenticationMethod
        };
    }

    /**
     * Step 2: Identify the service/platform from URL
     */
    private async identifyService(url: string): Promise<{
        serviceName: string;
        domain: string;
        apiType: string;
    }> {
        if (!url) {
            return { serviceName: 'Unknown', domain: '', apiType: 'REST' };
        }

        let domain = '';
        try {
            const urlObj = new URL(url);
            domain = urlObj.hostname;
        } catch {
            domain = url;
        }

        // Common API patterns
        const knownServices: Record<string, string> = {
            'api.openai.com': 'OpenAI',
            'api.anthropic.com': 'Anthropic',
            'graph.facebook.com': 'Facebook Graph API',
            'latenode.com': 'LateNode',
            'api.twitter.com': 'Twitter API',
            'api.github.com': 'GitHub API',
            'api.stripe.com': 'Stripe',
            'api.telegram.org': 'Telegram Bot API',
            'discord.com': 'Discord API',
            'api.slack.com': 'Slack API',
            'api.notion.com': 'Notion API',
            'api.airtable.com': 'Airtable',
            'sheets.googleapis.com': 'Google Sheets API',
            'www.googleapis.com': 'Google APIs',
        };

        // Check known services
        for (const [pattern, name] of Object.entries(knownServices)) {
            if (domain.includes(pattern) || domain === pattern) {
                return { serviceName: name, domain, apiType: 'REST' };
            }
        }

        // For unknown services, ask Perplexity to identify
        const identification = await this.queryPerplexity(`
What API service is "${domain}"? Just respond with the service name and nothing else.
If you don't know, respond with the domain cleaned up as a readable name.
        `, true);

        return {
            serviceName: identification.trim() || domain,
            domain,
            apiType: 'REST'
        };
    }

    /**
     * Step 3: Deep research in service documentation
     */
    private async researchServiceDocs(
        serviceName: string,
        nodeContext: ReturnType<typeof this.extractNodeContext>,
        error: string,
        inputData?: unknown
    ): Promise<{
        documentation: string;
        correctEndpoint: string;
        correctAuth: string;
        correctExample: string;
    }> {
        const researchQuery = `
I need to fix an API integration with ${serviceName}.

**Current Node Configuration:**
${nodeContext.fullJson}

**Error Message:**
${error}

${inputData ? `**Input Data being sent:**\n${JSON.stringify(inputData, null, 2)}` : ''}

Please search the official ${serviceName} API documentation and find:

1. **Official Documentation URL** - Link to the exact endpoint documentation
2. **Correct Endpoint Format** - The exact URL pattern required
3. **Required Authentication** - Exact headers/tokens needed (e.g., "Authorization: Bearer TOKEN" or "X-API-Key: KEY")
4. **Required Headers** - All mandatory headers (Content-Type, Accept, etc.)
5. **Request Body Format** - Exact JSON structure required for this endpoint
6. **Working cURL Example** - A complete working example

Focus on finding the EXACT official documentation for ${serviceName}, not general advice.
        `;

        const research = await this.queryPerplexity(researchQuery, false);

        return {
            documentation: research,
            correctEndpoint: this.extractPattern(research, 'endpoint'),
            correctAuth: this.extractPattern(research, 'auth'),
            correctExample: this.extractPattern(research, 'curl')
        };
    }

    /**
     * Helper to extract patterns from research
     */
    private extractPattern(text: string, type: string): string {
        // Simple extraction - the full context is in documentation
        return text;
    }

    /**
     * Step 4: Generate the fix based on research
     */
    private async generateFix(
        serviceName: string,
        nodeContext: ReturnType<typeof this.extractNodeContext>,
        research: Awaited<ReturnType<typeof this.researchServiceDocs>>,
        error: string
    ): Promise<RepairSuggestion> {
        const fixQuery = `
Based on my research of ${serviceName} API documentation:

${research.documentation}

---

**Current broken n8n HTTP Request node:**
${nodeContext.fullJson}

**Error:** ${error}

---

Generate a complete fix. Respond with ONLY valid JSON (no markdown, no explanation before/after):

{
    "summary": "One-line description of the fix",
    "explanation": "Detailed explanation of what was wrong and what you changed",
    "suggestedFix": {
        "parameters": {
            "url": "The corrected full URL",
            "method": "GET/POST/PUT/DELETE",
            "headers": {
                "Authorization": "Bearer YOUR_TOKEN or correct auth format",
                "Content-Type": "application/json or correct content type",
                "ADD_ANY_OTHER_REQUIRED_HEADERS": "value"
            },
            "bodyParameters": "Correct body if needed (as object or string)"
        }
    },
    "confidence": "high"
}

IMPORTANT: 
- Include ALL required headers from the documentation
- Use the EXACT URL format from the docs
- Include proper authentication format
        `;

        const fixResponse = await this.queryPerplexity(fixQuery, true);

        try {
            // Extract JSON from response
            const jsonMatch = fixResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    ...parsed,
                    service: serviceName,
                    documentation: research.documentation,
                    researchSteps: [
                        `Identified service: ${serviceName}`,
                        `Searched official ${serviceName} documentation`,
                        `Found endpoint specification and auth requirements`,
                        `Generated corrected node parameters`
                    ]
                };
            }
        } catch (e) {
            console.error('Failed to parse fix JSON:', e);
        }

        // Fallback if JSON parsing fails
        return {
            summary: `Fix for ${serviceName} API integration`,
            explanation: fixResponse,
            suggestedFix: {},
            confidence: 'medium',
            service: serviceName,
            documentation: research.documentation,
            researchSteps: [
                `Identified service: ${serviceName}`,
                `Researched ${serviceName} documentation`,
                `Generated fix suggestions (manual review recommended)`
            ]
        };
    }

    /**
     * Main repair function - orchestrates the 4-step process
     */
    async repairNode(node: NodeData, error: string, inputData?: unknown): Promise<RepairSuggestion> {
        console.log(`[AI Repair] Starting repair for node: ${node.name}`);

        // Step 1: Extract full node context
        console.log('[AI Repair] Step 1: Extracting node context...');
        const nodeContext = this.extractNodeContext(node);

        // Step 2: Identify the service
        console.log('[AI Repair] Step 2: Identifying service...');
        const service = await this.identifyService(nodeContext.url || '');
        console.log(`[AI Repair] Identified service: ${service.serviceName}`);

        // Step 3: Deep research in docs
        console.log(`[AI Repair] Step 3: Researching ${service.serviceName} documentation...`);
        const research = await this.researchServiceDocs(
            service.serviceName,
            nodeContext,
            error,
            inputData
        );

        // Step 4: Generate the fix
        console.log('[AI Repair] Step 4: Generating fix...');
        const fix = await this.generateFix(
            service.serviceName,
            nodeContext,
            research,
            error
        );

        console.log('[AI Repair] Fix generated successfully');
        return fix;
    }

    /**
     * Improve node - similar multi-step approach
     */
    async improveNode(node: NodeData, inputData?: unknown, outputData?: unknown): Promise<ImproveSuggestion> {
        const nodeContext = this.extractNodeContext(node);
        const service = await this.identifyService(nodeContext.url || '');

        const improveQuery = `
Analyze this n8n ${service.serviceName} HTTP Request node and suggest improvements:

**Full Node Configuration:**
${nodeContext.fullJson}

${inputData ? `**Sample Input:**\n${JSON.stringify(inputData, null, 2)}` : ''}
${outputData ? `**Sample Output:**\n${JSON.stringify(outputData, null, 2)}` : ''}

Search the ${service.serviceName} API documentation and suggest:
1. Better endpoint alternatives (if any)
2. Optimization opportunities
3. Error handling improvements
4. Rate limiting best practices
5. Security improvements

Respond with ONLY valid JSON:
{
    "summary": "One-line summary",
    "improvements": [
        {
            "title": "Improvement title",
            "description": "What to improve",
            "implementation": "How to implement in n8n"
        }
    ],
    "performance": "Performance tips",
    "security": "Security recommendations"
}
        `;

        const response = await this.queryPerplexity(improveQuery, false);

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch {
            // Fallback
        }

        return {
            summary: `Improvements for ${service.serviceName} integration`,
            improvements: [{ title: 'Analysis', description: response }]
        };
    }

    /**
     * Query Perplexity API with sonar-reasoning-pro
     */
    private async queryPerplexity(query: string, preferSpeed: boolean = false): Promise<string> {
        try {
            const systemMessage = `أنت خبير متخصص في إصلاح تكاملات API داخل n8n workflows.

مهمتك:
1. **تحديد الخدمة المستضافة**: استخرج اسم الخدمة من URL الموجود في نود HTTP Request
2. **البحث في أحدث إصدار**: ابحث في الوثائق الرسمية عن أحدث إصدار من API لهذه الخدمة
3. **عدم اقتراح بدائل**: لا تقترح أبداً خدمات أو أدوات بديلة - ركز فقط على إصلاح الخدمة الحالية
4. **إصلاح جاهز للتطبيق**: قدم إصلاحاً يمكن تطبيقه مباشرة على n8n بضغطة زر واحدة

قواعد صارمة:
- إذا كان URL يشير إلى خدمة معينة (مثل LateNode, Facebook API, etc.)، ابحث فقط في وثائق تلك الخدمة
- قدم الـ headers والـ authentication بالضبط كما هو مطلوب في الوثائق الرسمية
- لا تقترح الانتقال لخدمة أخرى أو استخدام طريقة مختلفة
- الإصلاح يجب أن يكون JSON صالح يمكن تطبيقه مباشرة على n8n node

عند الرد بـ JSON، قدم JSON فقط بدون markdown code blocks.`;

            const response = await axios.post(
                'https://api.perplexity.ai/chat/completions',
                {
                    model: 'sonar-reasoning-pro',
                    messages: [
                        {
                            role: 'system',
                            content: systemMessage
                        },
                        {
                            role: 'user',
                            content: query
                        }
                    ],
                    max_tokens: 8000,
                    temperature: 0.1,
                    search_recency_filter: 'week'
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
