import axios from 'axios';

/**
 * HTTP Node Builder Agent
 * 
 * A specialized AI agent for building and repairing n8n HTTP Request nodes.
 * Uses Perplexity's sonar-reasoning-pro for deep documentation research.
 * 
 * Workflow:
 * 1. UNDERSTAND - Parse user request or error
 * 2. IDENTIFY - Determine the target API service
 * 3. RESEARCH - Search official documentation
 * 4. GENERATE - Create n8n-compatible node configuration
 */

// ============================================
// TYPES
// ============================================

export interface HttpNodeConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    queryParameters?: Record<string, string>;
    body?: unknown;
    authentication?: {
        type: 'none' | 'bearer' | 'apiKey' | 'basicAuth';
        value?: string;
        headerName?: string;
    };
}

export interface NodeAnalysis {
    nodeName: string;
    nodeType: string;
    isHttpRequest: boolean;
    status: 'success' | 'error' | 'pending';
    errorMessage?: string;
    inputData?: unknown;
    outputData?: unknown;
    suggestedFix?: BuildResult;
}

export interface BuildResult {
    success: boolean;
    service: string;
    summary: string;
    explanation: string;
    nodeConfig: HttpNodeConfig;
    curlCommand: string;
    documentationUrl?: string;
    researchSteps: string[];
    confidence: 'high' | 'medium' | 'low';
}

export interface WorkflowAnalysis {
    workflowId: string;
    workflowName: string;
    totalNodes: number;
    httpNodes: NodeAnalysis[];
    errorNodes: NodeAnalysis[];
    successRate: number;
}

// ============================================
// HTTP NODE BUILDER AGENT
// ============================================

export class HttpNodeBuilderAgent {
    private perplexityApiKey: string;

    constructor(perplexityApiKey: string) {
        this.perplexityApiKey = perplexityApiKey;
    }

    // ============================================
    // MAIN CAPABILITIES
    // ============================================

    /**
     * BUILD: Create a new HTTP node from a description
     * 
     * Example: "Create a Stripe API call to list all customers"
     */
    async buildHttpNode(description: string): Promise<BuildResult> {
        console.log(`[HTTP Agent] Building new node from description: "${description}"`);

        // Step 1: Understand what the user wants
        const intent = await this.parseUserIntent(description);
        console.log(`[HTTP Agent] Identified intent:`, intent);

        // Step 2: Research the API documentation
        const research = await this.researchApiDocumentation(
            intent.service,
            intent.endpoint,
            intent.action
        );
        console.log(`[HTTP Agent] Research complete for ${intent.service}`);

        // Step 3: Generate the node configuration
        const config = await this.generateNodeConfig(intent, research);
        console.log(`[HTTP Agent] Generated config with confidence: ${config.confidence}`);

        return config;
    }

    /**
     * FIX: Repair a broken HTTP node based on error message
     */
    async fixHttpNode(
        node: { name: string; type: string; parameters?: Record<string, unknown> },
        errorMessage: string,
        inputData?: unknown
    ): Promise<BuildResult> {
        console.log(`[HTTP Agent] Fixing node "${node.name}" with error: ${errorMessage}`);

        // Extract current configuration
        const currentConfig = this.extractNodeConfig(node);

        // Identify the service from URL
        const service = await this.identifyService(currentConfig.url || '');
        console.log(`[HTTP Agent] Identified service: ${service.name}`);

        // Research the correct configuration
        const research = await this.researchForFix(
            service.name,
            currentConfig,
            errorMessage,
            inputData
        );

        // Generate the fix
        const fix = await this.generateFix(service.name, currentConfig, research, errorMessage);

        return fix;
    }

    /**
     * ANALYZE: Analyze a workflow and identify HTTP nodes with issues
     */
    async analyzeWorkflow(
        workflow: { id: string; name: string; nodes?: any[] },
        executionData?: { resultData?: { runData?: Record<string, any[]> } }
    ): Promise<WorkflowAnalysis> {
        const nodes = workflow.nodes || [];
        const runData = executionData?.resultData?.runData || {};

        const httpNodes: NodeAnalysis[] = [];
        const errorNodes: NodeAnalysis[] = [];

        for (const node of nodes) {
            const isHttpRequest = node.type === 'n8n-nodes-base.httpRequest';
            const nodeRunData = runData[node.name];

            let status: 'success' | 'error' | 'pending' = 'pending';
            let errorMessage: string | undefined;
            let inputData: unknown;
            let outputData: unknown;

            if (nodeRunData && nodeRunData.length > 0) {
                const lastRun = nodeRunData[nodeRunData.length - 1];

                if (lastRun.error) {
                    status = 'error';
                    errorMessage = lastRun.error.message || JSON.stringify(lastRun.error);
                } else {
                    status = 'success';
                }

                inputData = lastRun.inputData;
                outputData = lastRun.data?.main?.[0] || lastRun.data;
            }

            const analysis: NodeAnalysis = {
                nodeName: node.name,
                nodeType: node.type,
                isHttpRequest,
                status,
                errorMessage,
                inputData,
                outputData
            };

            if (isHttpRequest) {
                httpNodes.push(analysis);
            }

            if (status === 'error') {
                errorNodes.push(analysis);
            }
        }

        const successCount = httpNodes.filter(n => n.status === 'success').length;
        const successRate = httpNodes.length > 0 ? (successCount / httpNodes.length) * 100 : 100;

        return {
            workflowId: workflow.id,
            workflowName: workflow.name,
            totalNodes: nodes.length,
            httpNodes,
            errorNodes,
            successRate
        };
    }

    // ============================================
    // INTERNAL METHODS
    // ============================================

    /**
     * Parse user intent from natural language description
     */
    private async parseUserIntent(description: string): Promise<{
        service: string;
        endpoint: string;
        action: string;
        details: string;
    }> {
        const prompt = `
أنت محلل طلبات API. حلل الطلب التالي واستخرج المعلومات:

الطلب: "${description}"

أجب بـ JSON فقط (بدون markdown):
{
    "service": "اسم الخدمة (مثل Stripe, Notion, OpenAI)",
    "endpoint": "الـ endpoint المطلوب (مثل /customers, /pages)",
    "action": "الإجراء المطلوب (مثل list, create, update, delete)",
    "details": "أي تفاصيل إضافية"
}
        `;

        const response = await this.queryPerplexity(prompt, true);

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.error('[HTTP Agent] Failed to parse intent:', e);
        }

        // Fallback: extract service name from description
        return {
            service: 'Unknown API',
            endpoint: '/api',
            action: 'request',
            details: description
        };
    }

    /**
     * Identify service from URL
     */
    private async identifyService(url: string): Promise<{ name: string; domain: string }> {
        if (!url) {
            return { name: 'Unknown', domain: '' };
        }

        let domain = '';
        try {
            const urlObj = new URL(url);
            domain = urlObj.hostname;
        } catch {
            domain = url;
        }

        // Known services mapping
        const knownServices: Record<string, string> = {
            'api.openai.com': 'OpenAI API',
            'api.anthropic.com': 'Anthropic API',
            'api.stripe.com': 'Stripe API',
            'api.notion.com': 'Notion API',
            'api.github.com': 'GitHub API',
            'api.telegram.org': 'Telegram Bot API',
            'discord.com': 'Discord API',
            'api.slack.com': 'Slack API',
            'api.airtable.com': 'Airtable API',
            'sheets.googleapis.com': 'Google Sheets API',
            'api.twitter.com': 'Twitter/X API',
            'graph.facebook.com': 'Facebook Graph API',
            'latenode.com': 'LateNode API',
        };

        for (const [pattern, name] of Object.entries(knownServices)) {
            if (domain.includes(pattern)) {
                return { name, domain };
            }
        }

        // Ask Perplexity for unknown domains
        const identification = await this.queryPerplexity(
            `ما هي خدمة API لـ "${domain}"؟ أجب باسم الخدمة فقط.`,
            true
        );

        return {
            name: identification.trim() || domain,
            domain
        };
    }

    /**
     * Research API documentation for building a new node
     */
    private async researchApiDocumentation(
        service: string,
        endpoint: string,
        action: string
    ): Promise<string> {
        const query = `
ابحث في الوثائق الرسمية لـ ${service} عن:

Endpoint: ${endpoint}
Action: ${action}

أريد المعلومات التالية بالتفصيل:
1. رابط الـ endpoint الكامل
2. HTTP Method المطلوب
3. Headers المطلوبة (خاصة Authorization و Content-Type)
4. شكل الـ Body المطلوب (إذا كان POST/PUT)
5. مثال cURL كامل يعمل
6. رابط الوثائق الرسمية

ركز على الوثائق الرسمية فقط، ليس مصادر خارجية.
        `;

        return await this.queryPerplexity(query, false);
    }

    /**
     * Research for fixing an existing broken node
     */
    private async researchForFix(
        serviceName: string,
        currentConfig: HttpNodeConfig,
        errorMessage: string,
        inputData?: unknown
    ): Promise<string> {
        const query = `
أصلح هذا التكامل مع ${serviceName}:

**التكوين الحالي:**
URL: ${currentConfig.url}
Method: ${currentConfig.method}
Headers: ${JSON.stringify(currentConfig.headers)}
Body: ${JSON.stringify(currentConfig.body)}

**رسالة الخطأ:**
${errorMessage}

${inputData ? `**البيانات المرسلة:**\n${JSON.stringify(inputData, null, 2)}` : ''}

ابحث في وثائق ${serviceName} الرسمية وأعطني:
1. ما الخطأ في التكوين الحالي
2. التكوين الصحيح (URL, Headers, Body)
3. مثال cURL يعمل
        `;

        return await this.queryPerplexity(query, false);
    }

    /**
     * Generate node configuration from research
     */
    private async generateNodeConfig(
        intent: { service: string; endpoint: string; action: string; details: string },
        research: string
    ): Promise<BuildResult> {
        const prompt = `
بناءً على البحث التالي:

${research}

---

أنشئ تكوين n8n HTTP Request Node لـ: ${intent.service} - ${intent.action}

أجب بـ JSON فقط (بدون markdown):
{
    "success": true,
    "service": "${intent.service}",
    "summary": "وصف قصير للـ node",
    "explanation": "شرح مفصل لكيفية عمل الـ node",
    "nodeConfig": {
        "url": "الـ URL الكامل",
        "method": "GET/POST/PUT/DELETE",
        "headers": {
            "Authorization": "Bearer YOUR_API_KEY",
            "Content-Type": "application/json"
        },
        "body": {}
    },
    "curlCommand": "مثال cURL كامل",
    "documentationUrl": "رابط الوثائق",
    "researchSteps": ["خطوة 1", "خطوة 2"],
    "confidence": "high"
}
        `;

        const response = await this.queryPerplexity(prompt, true);

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.error('[HTTP Agent] Failed to parse config:', e);
        }

        return {
            success: false,
            service: intent.service,
            summary: 'Failed to generate configuration',
            explanation: response,
            nodeConfig: {
                url: '',
                method: 'GET'
            },
            curlCommand: '',
            researchSteps: ['Research completed but parsing failed'],
            confidence: 'low'
        };
    }

    /**
     * Generate fix for broken node
     */
    private async generateFix(
        serviceName: string,
        currentConfig: HttpNodeConfig,
        research: string,
        errorMessage: string
    ): Promise<BuildResult> {
        const prompt = `
بناءً على البحث:
${research}

---

أصلح تكوين n8n HTTP Request Node هذا:
URL: ${currentConfig.url}
Method: ${currentConfig.method}
Error: ${errorMessage}

أجب بـ JSON فقط:
{
    "success": true,
    "service": "${serviceName}",
    "summary": "ملخص الإصلاح",
    "explanation": "ما كان الخطأ وكيف تم إصلاحه",
    "nodeConfig": {
        "url": "URL الصحيح",
        "method": "GET/POST/PUT/DELETE",
        "headers": { "كل الـ headers المطلوبة" },
        "body": {}
    },
    "curlCommand": "cURL يعمل",
    "researchSteps": ["تحديد الخدمة", "البحث في الوثائق", "توليد الإصلاح"],
    "confidence": "high"
}
        `;

        const response = await this.queryPerplexity(prompt, true);

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                return {
                    ...result,
                    service: serviceName,
                    researchSteps: [
                        `تحديد الخدمة: ${serviceName}`,
                        `تحليل الخطأ: ${errorMessage}`,
                        'البحث في الوثائق الرسمية',
                        'توليد التكوين الصحيح'
                    ]
                };
            }
        } catch (e) {
            console.error('[HTTP Agent] Failed to parse fix:', e);
        }

        return {
            success: false,
            service: serviceName,
            summary: `Fix attempt for ${serviceName}`,
            explanation: research,
            nodeConfig: currentConfig,
            curlCommand: '',
            researchSteps: ['Research completed but fix generation failed'],
            confidence: 'low'
        };
    }

    /**
     * Extract node configuration from n8n node object
     */
    private extractNodeConfig(node: { parameters?: Record<string, unknown> }): HttpNodeConfig {
        const params = node.parameters || {};

        return {
            url: (params.url as string) || '',
            method: (params.method as HttpNodeConfig['method']) || 'GET',
            headers: (params.headers as Record<string, string>) || {},
            queryParameters: (params.queryParameters as Record<string, string>) || {},
            body: params.body || params.bodyParameters || params.jsonBody,
            authentication: {
                type: (params.authentication as HttpNodeConfig['authentication'])?.type || 'none'
            }
        };
    }

    /**
     * Query Perplexity API
     */
    private async queryPerplexity(query: string, preferSpeed: boolean = false): Promise<string> {
        const systemMessage = `أنت خبير متخصص في APIs و n8n workflows.

مهمتك:
1. البحث في الوثائق الرسمية للـ APIs
2. توليد تكوينات n8n HTTP Request صحيحة
3. تقديم أمثلة cURL تعمل

قواعد:
- ابحث فقط في الوثائق الرسمية
- لا تقترح بدائل - أصلح ما هو موجود
- عند الرد بـ JSON، قدم JSON صالح فقط بدون markdown`;

        try {
            const response = await axios.post(
                'https://api.perplexity.ai/chat/completions',
                {
                    model: 'sonar-reasoning-pro',
                    messages: [
                        { role: 'system', content: systemMessage },
                        { role: 'user', content: query }
                    ],
                    max_tokens: preferSpeed ? 2000 : 8000,
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
            console.error('[HTTP Agent] Perplexity error:', error.response?.data || error.message);
            throw new Error(`Perplexity API error: ${error.response?.data?.error?.message || error.message}`);
        }
    }
}

export default HttpNodeBuilderAgent;

