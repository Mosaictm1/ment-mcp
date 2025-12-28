import axios, { AxiosInstance } from 'axios';
import { decryptApiKey } from '../lib/crypto.js';

export interface N8nWorkflow {
    id: string;
    name: string;
    active: boolean;
    nodes?: any[];
    connections?: any;
    settings?: any;
    createdAt?: string;
    updatedAt?: string;
}

export interface N8nExecution {
    id: string;
    workflowId?: string;
    mode: string;
    finished: boolean;
    retryOf?: string;
    retrySuccessId?: string;
    startedAt: string;
    stoppedAt?: string;
    status?: string;
    data?: any;
}

export interface WorkflowExecutionResult {
    executionId: string;
    status: 'success' | 'error' | 'running';
    data?: any;
    error?: string;
}

export interface WorkflowDiff {
    added: any[];
    modified: any[];
    removed: any[];
}

/**
 * N8n API Service - Enhanced for AI Workflow Assistant
 * Supports full CRUD + execution + diffing + versioning
 */
export class N8nService {
    private client: AxiosInstance;
    private baseUrl: string;
    public instanceUrl: string; // Expose for versioning

    constructor(instanceUrl: string, apiKey: string) {
        this.instanceUrl = instanceUrl;
        this.baseUrl = `${instanceUrl}/api/v1`;
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Create from encrypted credentials
     */
    static fromEncrypted(instanceUrl: string, encryptedApiKey: string): N8nService {
        const apiKey = decryptApiKey(encryptedApiKey);
        return new N8nService(instanceUrl, apiKey);
    }

    // ============================================
    // WORKFLOW CRUD OPERATIONS
    // ============================================

    /**
     * Get all workflows with optional filtering
     */
    async getWorkflows(active?: boolean): Promise<N8nWorkflow[]> {
        const params: any = {};
        if (active !== undefined) {
            params.active = active;
        }
        const response = await this.client.get('/workflows', { params });
        return response.data.data || response.data;
    }

    /**
     * Get single workflow by ID with full details
     */
    async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
        const response = await this.client.get(`/workflows/${workflowId}`);
        return response.data;
    }

    /**
     * Create new workflow
     */
    async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
        const response = await this.client.post('/workflows', workflow);
        return response.data;
    }

    /**
     * Update existing workflow
     */
    async updateWorkflow(workflowId: string, updates: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
        const response = await this.client.patch(`/workflows/${workflowId}`, updates);
        return response.data;
    }

    /**
     * Delete workflow
     */
    async deleteWorkflow(workflowId: string): Promise<void> {
        await this.client.delete(`/workflows/${workflowId}`);
    }

    /**
     * Activate workflow
     */
    async activateWorkflow(workflowId: string): Promise<N8nWorkflow> {
        return this.updateWorkflow(workflowId, { active: true });
    }

    /**
     * Deactivate workflow
     */
    async deactivateWorkflow(workflowId: string): Promise<N8nWorkflow> {
        return this.updateWorkflow(workflowId, { active: false });
    }

    // ============================================
    // EXECUTION OPERATIONS
    // ============================================

    /**
     * Get workflow executions
     */
    async getExecutions(workflowId?: string, limit: number = 20): Promise<N8nExecution[]> {
        const params: any = { limit };
        if (workflowId) {
            params.workflowId = workflowId;
        }
        const response = await this.client.get('/executions', { params });
        return response.data.data || response.data;
    }

    /**
     * Get single execution by ID
     */
    async getExecution(executionId: string): Promise<N8nExecution> {
        const response = await this.client.get(`/executions/${executionId}`);
        return response.data;
    }

    /**
     * Execute workflow manually
     * Uses POST /executions to run a workflow by ID
     */
    async executeWorkflow(
        workflowId: string,
        data?: Record<string, unknown>
    ): Promise<WorkflowExecutionResult> {
        try {
            // n8n API: POST /executions with workflowId in body
            const response = await this.client.post('/executions', {
                workflowId,
                data: data || {},
            });

            // n8n response can vary - handle multiple possible formats
            const execData = response.data?.data || response.data;
            const executionId = execData?.id || execData?.executionId || response.data?.id || 'unknown';
            const finished = execData?.finished ?? response.data?.finished ?? false;
            const status = finished ? 'success' : 'running';

            return {
                executionId: String(executionId),
                status,
                data: execData?.resultData || execData?.data || execData,
            };
        } catch (error: any) {
            // Check if it's a 404 - endpoint might not exist, try alternative
            if (error.response?.status === 404) {
                return this.executeWorkflowLegacy(workflowId, data);
            }
            return {
                executionId: '',
                status: 'error',
                error: error.response?.data?.message || error.message,
            };
        }
    }

    /**
     * Legacy workflow execution using /workflows/{id}/execute
     * Fallback for older n8n versions
     */
    private async executeWorkflowLegacy(
        workflowId: string,
        data?: Record<string, unknown>
    ): Promise<WorkflowExecutionResult> {
        try {
            const response = await this.client.post(`/workflows/${workflowId}/execute`, {
                data: data || {},
            });

            const execData = response.data?.data || response.data;
            const executionId = execData?.id || execData?.executionId || response.data?.id || 'unknown';

            return {
                executionId: String(executionId),
                status: execData?.finished ? 'success' : 'running',
                data: execData?.resultData || execData?.data || execData,
            };
        } catch (error: any) {
            return {
                executionId: '',
                status: 'error',
                error: error.response?.data?.message || error.message,
            };
        }
    }

    /**
     * Test workflow execution (dry run)
     * Executes workflow and returns detailed results
     */
    async testWorkflow(workflowId: string, testData?: Record<string, unknown>): Promise<any> {
        const result = await this.executeWorkflow(workflowId, testData);

        if (result.status === 'error') {
            return {
                success: false,
                error: result.error,
            };
        }

        // Get execution details
        if (result.executionId) {
            const execution = await this.getExecution(result.executionId);
            return {
                success: execution.finished && !execution.data?.resultData?.error,
                executionId: execution.id,
                data: execution.data,
                startedAt: execution.startedAt,
                stoppedAt: execution.stoppedAt,
            };
        }

        return {
            success: true,
            data: result.data,
        };
    }

    // ============================================
    // AI ASSISTANT HELPERS
    // ============================================

    /**
     * Generate diff between two workflows
     */
    generateWorkflowDiff(original: N8nWorkflow, modified: N8nWorkflow): WorkflowDiff {
        const diff: WorkflowDiff = {
            added: [],
            modified: [],
            removed: [],
        };

        const originalNodes = original.nodes || [];
        const modifiedNodes = modified.nodes || [];

        const originalNodeIds = new Set(originalNodes.map((n: any) => n.id));
        const modifiedNodeIds = new Set(modifiedNodes.map((n: any) => n.id));

        // Find added nodes
        modifiedNodes.forEach((node: any) => {
            if (!originalNodeIds.has(node.id)) {
                diff.added.push(node);
            }
        });

        // Find removed nodes
        originalNodes.forEach((node: any) => {
            if (!modifiedNodeIds.has(node.id)) {
                diff.removed.push(node);
            }
        });

        // Find modified nodes
        modifiedNodes.forEach((modifiedNode: any) => {
            const originalNode = originalNodes.find((n: any) => n.id === modifiedNode.id);
            if (originalNode && JSON.stringify(originalNode) !== JSON.stringify(modifiedNode)) {
                diff.modified.push({
                    id: modifiedNode.id,
                    original: originalNode,
                    modified: modifiedNode,
                });
            }
        });

        return diff;
    }

    /**
     * Validate workflow structure
     */
    validateWorkflow(workflow: Partial<N8nWorkflow>): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!workflow.name) {
            errors.push('Workflow name is required');
        }

        if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
            errors.push('Workflow must have nodes array');
        } else if (workflow.nodes.length === 0) {
            errors.push('Workflow must have at least one node');
        }

        // Check for duplicate node IDs
        if (workflow.nodes) {
            const nodeIds = workflow.nodes.map((n: any) => n.id);
            const duplicates = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
            if (duplicates.length > 0) {
                errors.push(`Duplicate node IDs found: ${duplicates.join(', ')}`);
            }
        }

        // Validate connections reference existing nodes
        if (workflow.connections && workflow.nodes) {
            const nodeIds = new Set(workflow.nodes.map((n: any) => n.name));
            // n8n connections use node names as keys
            const connectionNodeNames = Object.keys(workflow.connections);
            connectionNodeNames.forEach((nodeName) => {
                if (!nodeIds.has(nodeName)) {
                    errors.push(`Connection references non-existent node: ${nodeName}`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Apply workflow changes from AI plan
     */
    async applyWorkflowChanges(
        workflowId: string,
        changes: Partial<N8nWorkflow>
    ): Promise<{ success: boolean; workflow?: N8nWorkflow; error?: string }> {
        try {
            // Validate changes
            const validation = this.validateWorkflow(changes);
            if (!validation.valid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`,
                };
            }

            // Apply changes
            const updatedWorkflow = await this.updateWorkflow(workflowId, changes);
            return {
                success: true,
                workflow: updatedWorkflow,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message,
            };
        }
    }

    /**
     * Search for nodes by type or name
     */
    async searchNodes(query: string): Promise<any[]> {
        // This would ideally query the n8n nodes cache
        // For now, return empty array - will be enhanced later
        return [];
    }
}
