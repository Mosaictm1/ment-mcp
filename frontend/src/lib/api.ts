const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface User {
    id: string;
    email: string;
    name: string | null;
    subscriptionTier: 'free' | 'supporter' | 'enterprise';
}

// Token storage
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
    if (typeof window !== 'undefined') {
        if (token) {
            localStorage.setItem('accessToken', token);
        } else {
            localStorage.removeItem('accessToken');
        }
    }
}

export function getAccessToken(): string | null {
    if (accessToken) return accessToken;
    if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('accessToken');
    }
    return accessToken;
}

// Base fetch with auth
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getAccessToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || { code: 'UNKNOWN', message: 'Unknown error' } };
        }

        return { data };
    } catch (error) {
        return {
            error: {
                code: 'NETWORK_ERROR',
                message: error instanceof Error ? error.message : 'Network error',
            },
        };
    }
}

// ============================================
// AUTH API
// ============================================

export async function signup(email: string, password: string, name?: string) {
    const result = await apiFetch<{ user: User; tokens: AuthTokens }>('/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });

    if (result.data) {
        setAccessToken(result.data.tokens.accessToken);
        if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
        }
    }

    return result;
}

export async function login(email: string, password: string) {
    const result = await apiFetch<{ user: User; tokens: AuthTokens }>('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (result.data) {
        setAccessToken(result.data.tokens.accessToken);
        if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
        }
    }

    return result;
}

export function logout() {
    setAccessToken(null);
    if (typeof window !== 'undefined') {
        localStorage.removeItem('refreshToken');
    }
}

// ============================================
// USER API
// ============================================

export async function getProfile() {
    return apiFetch<User & { apiCallsToday: number; apiCallsLimit: number }>('/v1/users/profile');
}

export async function getQuota() {
    return apiFetch<{
        plan: string;
        apiCalls: { used: number; limit: number; resetAt: string };
    }>('/v1/users/quota');
}

// ============================================
// API KEYS
// ============================================

export async function getApiKeys() {
    return apiFetch<{
        apiKeys: Array<{
            id: string;
            name: string;
            keyPrefix: string;
            createdAt: string;
            lastUsedAt: string | null;
            isActive: boolean;
        }>;
    }>('/v1/users/api-keys');
}

export async function createApiKey(name: string) {
    return apiFetch<{
        id: string;
        name: string;
        key: string; // Full key, shown only once
        keyPrefix: string;
        createdAt: string;
    }>('/v1/users/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
}

export async function deleteApiKey(id: string) {
    return apiFetch<{ success: boolean }>(`/v1/users/api-keys/${id}`, {
        method: 'DELETE',
    });
}

// ============================================
// N8N CREDENTIALS
// ============================================

export async function getN8nCredentials() {
    return apiFetch<{
        credentials: Array<{
            id: string;
            name: string;
            instanceUrl: string;
            status: 'pending' | 'verified' | 'failed';
            createdAt: string;
            lastVerifiedAt: string | null;
        }>;
    }>('/v1/users/n8n-credentials');
}

export async function addN8nCredential(instanceUrl: string, apiKey: string, name?: string) {
    return apiFetch<{
        id: string;
        name: string;
        instanceUrl: string;
        status: string;
        createdAt: string;
    }>('/v1/users/n8n-credentials', {
        method: 'POST',
        body: JSON.stringify({ instanceUrl, apiKey, name }),
    });
}

export async function deleteN8nCredential(id: string) {
    return apiFetch<{ success: boolean }>(`/v1/users/n8n-credentials/${id}`, {
        method: 'DELETE',
    });
}

export async function verifyN8nCredential(credentialId: string) {
    return apiFetch<{ verified: boolean; status: string }>('/v1/n8n/verify', {
        method: 'POST',
        body: JSON.stringify({ credentialId }),
    });
}

// ============================================
// N8N WORKFLOWS
// ============================================

export async function getWorkflows(credentialId?: string) {
    const params = credentialId ? `?credentialId=${credentialId}` : '';
    return apiFetch<{ data: Array<{ id: string; name: string; active: boolean }> }>(
        `/v1/n8n/workflows${params}`
    );
}

export async function getWorkflow(id: string, credentialId?: string) {
    const params = credentialId ? `?credentialId=${credentialId}` : '';
    return apiFetch<{
        id: string;
        name: string;
        active: boolean;
        nodes: Array<{
            id: string;
            name: string;
            type: string;
            parameters?: Record<string, unknown>;
            webhookId?: string;
        }>;
        connections: unknown;
    }>(
        `/v1/n8n/workflows/${id}${params}`
    );
}

// ============================================
// MCP TOOLS
// ============================================

export async function callMcpTool(tool: string, params: Record<string, unknown>, credentialId?: string) {
    return apiFetch<{ tool: string; result: unknown; meta: { responseTimeMs: number } }>('/v1/mcp/tool', {
        method: 'POST',
        body: JSON.stringify({ tool, params, credentialId }),
    });
}

export async function getMcpTools() {
    return apiFetch<{
        tools: Array<{
            name: string;
            description: string;
            params: Array<{ name: string; type: string; required: boolean }>;
        }>;
    }>('/v1/mcp/tools');
}

// ============================================
// WORKFLOW MANAGEMENT
// ============================================

export interface Workflow {
    id: string;
    name: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
    nodes?: unknown[];
    connections?: unknown;
}

export interface Execution {
    id: string;
    workflowId: string;
    finished: boolean;
    mode: string;
    startedAt: string;
    stoppedAt?: string;
    status: 'success' | 'error' | 'running' | 'waiting';
}

export async function activateWorkflow(id: string, credentialId?: string) {
    const params = credentialId ? `?credentialId=${credentialId}` : '';
    return apiFetch<Workflow>(`/v1/n8n/workflows/${id}/activate${params}`, {
        method: 'POST',
    });
}

export async function deactivateWorkflow(id: string, credentialId?: string) {
    const params = credentialId ? `?credentialId=${credentialId}` : '';
    return apiFetch<Workflow>(`/v1/n8n/workflows/${id}/deactivate${params}`, {
        method: 'POST',
    });
}

export async function executeWorkflow(id: string, data?: Record<string, unknown>, credentialId?: string) {
    return apiFetch<{ executionId: string; status: string; error?: string }>(`/v1/n8n/workflows/${id}/execute`, {
        method: 'POST',
        body: JSON.stringify({ data, credentialId }),
    });
}

export async function getExecutions(workflowId?: string, limit?: number, credentialId?: string) {
    const params = new URLSearchParams();
    if (workflowId) params.append('workflowId', workflowId);
    if (limit) params.append('limit', limit.toString());
    if (credentialId) params.append('credentialId', credentialId);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return apiFetch<{ data: Execution[] }>(`/v1/n8n/executions${queryString}`);
}

export interface ExecutionDetail {
    id: string;
    workflowId: string;
    finished: boolean;
    mode: string;
    startedAt: string;
    stoppedAt?: string;
    status?: string;
    data?: {
        resultData?: {
            runData?: Record<string, Array<{
                startTime: number;
                executionTime: number;
                inputData?: {
                    main?: Array<Array<{ json: unknown }>>;
                };
                data: {
                    main: Array<Array<{ json: unknown }>>;
                };
                error?: { message: string };
            }>>;
            error?: { message: string };
        };
    };
}

export async function getExecution(executionId: string, credentialId?: string) {
    const params = credentialId ? `?credentialId=${credentialId}` : '';
    return apiFetch<ExecutionDetail>(`/v1/n8n/executions/${executionId}${params}`);
}

// ============================================
// AI REPAIR
// ============================================

export interface RepairSuggestion {
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

export interface ImproveSuggestion {
    summary: string;
    improvements: Array<{
        title: string;
        description: string;
        implementation?: string;
    }>;
    performance?: string;
    security?: string;
}

export async function repairNode(
    credentialId: string,
    nodeName: string,
    nodeType: string,
    error: string,
    nodeParameters?: Record<string, unknown>,
    inputData?: unknown
) {
    return apiFetch<{ success: boolean; suggestion: RepairSuggestion }>('/v1/ai/repair', {
        method: 'POST',
        body: JSON.stringify({ credentialId, nodeName, nodeType, nodeParameters, error, inputData }),
    });
}

export async function improveNode(
    nodeName: string,
    nodeType: string,
    nodeParameters?: Record<string, unknown>,
    inputData?: unknown,
    outputData?: unknown
) {
    return apiFetch<{ success: boolean; suggestion: ImproveSuggestion }>('/v1/ai/improve', {
        method: 'POST',
        body: JSON.stringify({ nodeName, nodeType, nodeParameters, inputData, outputData }),
    });
}

export async function applyNodeFix(
    credentialId: string,
    workflowId: string,
    nodeName: string,
    suggestedParameters: Record<string, unknown>
) {
    return apiFetch<{ success: boolean; message: string; workflow: Workflow }>('/v1/ai/apply-fix', {
        method: 'POST',
        body: JSON.stringify({ credentialId, workflowId, nodeName, suggestedParameters }),
    });
}
