import { decrypt } from '../lib/crypto.js';
import type { N8nWorkflow, N8nExecution } from '../types/index.js';

interface N8nApiOptions {
    instanceUrl: string;
    apiKey: string;
}

/**
 * N8n API Client Service
 * Handles all interactions with customer's n8n instance
 */
export class N8nService {
    private instanceUrl: string;
    private apiKey: string;

    constructor(options: N8nApiOptions) {
        this.instanceUrl = options.instanceUrl.replace(/\/$/, '');
        this.apiKey = options.apiKey;
    }

    /**
     * Create from encrypted credentials
     */
    static fromEncrypted(instanceUrl: string, encryptedApiKey: string): N8nService {
        return new N8nService({
            instanceUrl,
            apiKey: decrypt(encryptedApiKey),
        });
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.instanceUrl}/api/v1${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': this.apiKey,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`n8n API error: ${response.status} - ${error}`);
        }

        return response.json() as Promise<T>;
    }

    // ============================================
    // WORKFLOWS
    // ============================================

    async getWorkflows(): Promise<{ data: N8nWorkflow[] }> {
        return this.request('/workflows');
    }

    async getWorkflow(id: string): Promise<N8nWorkflow> {
        return this.request(`/workflows/${id}`);
    }

    async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
        return this.request('/workflows', {
            method: 'POST',
            body: JSON.stringify(workflow),
        });
    }

    async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
        return this.request(`/workflows/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(workflow),
        });
    }

    async deleteWorkflow(id: string): Promise<void> {
        await this.request(`/workflows/${id}`, { method: 'DELETE' });
    }

    async activateWorkflow(id: string): Promise<N8nWorkflow> {
        return this.request(`/workflows/${id}/activate`, { method: 'POST' });
    }

    async deactivateWorkflow(id: string): Promise<N8nWorkflow> {
        return this.request(`/workflows/${id}/deactivate`, { method: 'POST' });
    }

    // ============================================
    // EXECUTIONS
    // ============================================

    async getExecutions(workflowId?: string, limit = 20): Promise<{ data: N8nExecution[] }> {
        const params = new URLSearchParams();
        if (workflowId) params.set('workflowId', workflowId);
        params.set('limit', limit.toString());

        return this.request(`/executions?${params}`);
    }

    async getExecution(id: string): Promise<N8nExecution> {
        return this.request(`/executions/${id}`);
    }

    async executeWorkflow(id: string, data?: Record<string, unknown>): Promise<N8nExecution> {
        return this.request(`/workflows/${id}/run`, {
            method: 'POST',
            body: JSON.stringify(data || {}),
        });
    }

    // ============================================
    // HEALTH CHECK
    // ============================================

    async healthCheck(): Promise<boolean> {
        try {
            await this.request('/workflows?limit=1');
            return true;
        } catch {
            return false;
        }
    }
}
