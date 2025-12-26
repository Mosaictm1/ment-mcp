import '@fastify/jwt';

// Extend FastifyRequest to include user from JWT
declare module '@fastify/jwt' {
    interface FastifyJWT {
        user: {
            id: string;
            email: string;
            tier: 'free' | 'supporter' | 'enterprise';
        };
    }
}

// ============================================
// AUTH TYPES
// ============================================

export interface JWTPayload {
    id: string;
    email: string;
    tier: 'free' | 'supporter' | 'enterprise';
}

// ============================================
// REQUEST BODY TYPES
// ============================================

export interface SignupBody {
    email: string;
    password: string;
    name?: string;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface CreateApiKeyBody {
    name: string;
}

export interface AddN8nCredentialBody {
    name?: string;
    instanceUrl: string;
    apiKey: string;
}

export interface CreateWorkflowBody {
    name: string;
    description?: string;
    workflow: Record<string, unknown>;
    credentialId: string;
    activate?: boolean;
}

export interface UpdateWorkflowBody {
    diff: Array<{
        op: 'add' | 'remove' | 'replace';
        path: string;
        value?: unknown;
    }>;
}

// ============================================
// MCP TYPES
// ============================================

export interface MCPToolCallBody {
    tool: string;
    params: Record<string, unknown>;
    credentialId?: string; // Which n8n instance to use
}

export type MCPToolName =
    | 'get_node_info'
    | 'search_nodes'
    | 'validate_workflow'
    | 'create_workflow'
    | 'update_workflow'
    | 'get_workflows'
    | 'get_workflow'
    | 'delete_workflow'
    | 'get_workflow_executions'
    | 'execute_workflow';

// ============================================
// RESPONSE TYPES
// ============================================

export interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// ============================================
// N8N API TYPES
// ============================================

export interface N8nWorkflow {
    id: string;
    name: string;
    active: boolean;
    nodes: N8nNode[];
    connections: Record<string, unknown>;
    settings?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface N8nNode {
    id: string;
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
    parameters: Record<string, unknown>;
}

export interface N8nExecution {
    id: string;
    finished: boolean;
    mode: string;
    startedAt: string;
    stoppedAt?: string;
    workflowId: string;
    status: 'success' | 'error' | 'running';
    data?: Record<string, unknown>;
}

// ============================================
// QUOTA TYPES
// ============================================

export interface QuotaInfo {
    plan: 'free' | 'supporter' | 'enterprise';
    apiCalls: {
        used: number;
        limit: number;
        resetAt: string;
    };
}

export const PLAN_LIMITS = {
    free: 100,
    supporter: 999999,
    enterprise: 999999,
} as const;
