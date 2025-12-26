'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import {
    getWorkflows,
    getN8nCredentials,
    executeWorkflow,
    getExecutions,
    Workflow,
    Execution,
} from '@/lib/api';

interface Credential {
    id: string;
    name: string;
    instanceUrl: string;
    status: string;
}

export default function WorkflowsPage() {
    const router = useRouter();
    const { isLoading, isAuthenticated } = useAuth();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [selectedCredential, setSelectedCredential] = useState<string>('');
    const [executions, setExecutions] = useState<Record<string, Execution[]>>({});
    const [loadingWorkflows, setLoadingWorkflows] = useState(false);
    const [executingId, setExecutingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Load credentials
    useEffect(() => {
        if (isAuthenticated) {
            getN8nCredentials().then((res) => {
                if (res.data) {
                    setCredentials(res.data.credentials);
                    // Auto-select first verified credential
                    const verified = res.data.credentials.find(c => c.status === 'verified');
                    if (verified) {
                        setSelectedCredential(verified.id);
                    }
                }
            });
        }
    }, [isAuthenticated]);

    // Load workflows when credential changes
    useEffect(() => {
        if (selectedCredential) {
            loadWorkflows();
        }
    }, [selectedCredential]);

    const loadWorkflows = async () => {
        setLoadingWorkflows(true);
        setError('');

        const res = await getWorkflows(selectedCredential);
        if (res.data) {
            setWorkflows(res.data.data || []);
            // Load executions for each workflow
            const executionsMap: Record<string, Execution[]> = {};
            for (const wf of (res.data.data || []).slice(0, 5)) {
                const execRes = await getExecutions(wf.id, 3, selectedCredential);
                if (execRes.data) {
                    executionsMap[wf.id] = execRes.data.data || [];
                }
            }
            setExecutions(executionsMap);
        } else if (res.error) {
            setError(res.error.message);
        }

        setLoadingWorkflows(false);
    };

    const handleExecute = async (workflowId: string) => {
        setExecutingId(workflowId);
        setError('');
        setSuccess('');

        const res = await executeWorkflow(workflowId, undefined, selectedCredential);
        if (res.data) {
            setSuccess(`Workflow executed successfully! Execution ID: ${res.data.executionId}`);
            // Reload executions
            const execRes = await getExecutions(workflowId, 3, selectedCredential);
            if (execRes.data) {
                setExecutions(prev => ({ ...prev, [workflowId]: execRes.data!.data || [] }));
            }
        } else if (res.error) {
            setError(res.error.message);
        }

        setExecutingId(null);
    };

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-dark)' }}>
                <div className="flex items-center gap-3 text-[var(--text-muted)]">
                    <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xl">Loading...</span>
                </div>
            </div>
        );
    }

    const verifiedCredentials = credentials.filter(c => c.status === 'verified');

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-dark)' }}>
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                <span className="text-4xl">⚡</span>
                                Workflows
                            </h1>
                            <p className="text-[var(--text-muted)]">
                                Manage and run your n8n workflows
                            </p>
                        </div>

                        {/* Instance Selector */}
                        {verifiedCredentials.length > 0 && (
                            <div className="flex items-center gap-3">
                                <label className="text-[var(--text-dim)] text-sm">Instance:</label>
                                <select
                                    value={selectedCredential}
                                    onChange={(e) => setSelectedCredential(e.target.value)}
                                    className="px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-dark)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                >
                                    {verifiedCredentials.map((cred) => (
                                        <option key={cred.id} value={cred.id}>
                                            {cred.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3 animate-fade-in">
                            <span className="text-xl">⚠️</span>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl text-[var(--primary)] flex items-center gap-3 animate-fade-in">
                            <span className="text-xl">✅</span>
                            {success}
                        </div>
                    )}

                    {/* No Credentials Warning */}
                    {verifiedCredentials.length === 0 && (
                        <div className="card p-8 text-center">
                            <div className="text-6xl mb-4">🔌</div>
                            <h2 className="text-xl font-semibold text-white mb-2">
                                No n8n Instance Connected
                            </h2>
                            <p className="text-[var(--text-muted)] mb-6">
                                Connect your n8n instance to view and manage workflows
                            </p>
                            <a
                                href="/dashboard/settings"
                                className="btn btn-primary inline-flex"
                            >
                                + Connect n8n Instance
                            </a>
                        </div>
                    )}

                    {/* Loading State */}
                    {loadingWorkflows && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="card p-6 animate-pulse">
                                    <div className="h-6 bg-[var(--bg-card-hover)] rounded w-3/4 mb-4" />
                                    <div className="h-4 bg-[var(--bg-card-hover)] rounded w-1/2 mb-2" />
                                    <div className="h-4 bg-[var(--bg-card-hover)] rounded w-1/4" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Workflows Grid */}
                    {!loadingWorkflows && workflows.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {workflows.map((workflow, index) => (
                                <div
                                    key={workflow.id}
                                    className="card p-6 hover:border-[var(--primary)]/30 transition-all duration-300"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-white truncate mb-1">
                                                {workflow.name}
                                            </h3>
                                            <p className="text-[var(--text-dim)] text-sm">
                                                ID: {workflow.id}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${workflow.active
                                                    ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                                                    : 'bg-[var(--text-dim)]/20 text-[var(--text-dim)]'
                                                }`}
                                        >
                                            {workflow.active ? '● Active' : '○ Inactive'}
                                        </span>
                                    </div>

                                    {/* Recent Executions */}
                                    {executions[workflow.id] && executions[workflow.id].length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs text-[var(--text-dim)] uppercase tracking-wider mb-2">
                                                Recent Executions
                                            </p>
                                            <div className="flex gap-2">
                                                {executions[workflow.id].map((exec) => (
                                                    <span
                                                        key={exec.id}
                                                        className={`w-3 h-3 rounded-full ${exec.status === 'success'
                                                                ? 'bg-[var(--primary)]'
                                                                : exec.status === 'error'
                                                                    ? 'bg-red-500'
                                                                    : exec.status === 'running'
                                                                        ? 'bg-yellow-500 animate-pulse'
                                                                        : 'bg-[var(--text-dim)]'
                                                            }`}
                                                        title={`${exec.status} - ${new Date(exec.startedAt).toLocaleString()}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleExecute(workflow.id)}
                                            disabled={executingId === workflow.id}
                                            className="flex-1 px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-[var(--bg-dark)] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {executingId === workflow.id ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-[var(--bg-dark)] border-t-transparent rounded-full animate-spin" />
                                                    Running...
                                                </>
                                            ) : (
                                                <>
                                                    <span>▶</span>
                                                    Run
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => window.open(`${credentials.find(c => c.id === selectedCredential)?.instanceUrl}/workflow/${workflow.id}`, '_blank')}
                                            className="px-4 py-2.5 bg-[var(--bg-card-hover)] hover:bg-[var(--border-light)] text-[var(--text-light)] rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                                        >
                                            <span>↗</span>
                                            Open
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loadingWorkflows && workflows.length === 0 && verifiedCredentials.length > 0 && (
                        <div className="card p-8 text-center">
                            <div className="text-6xl mb-4">📭</div>
                            <h2 className="text-xl font-semibold text-white mb-2">
                                No Workflows Found
                            </h2>
                            <p className="text-[var(--text-muted)] mb-6">
                                Create your first workflow in n8n to see it here
                            </p>
                            <button
                                onClick={() => window.open(credentials.find(c => c.id === selectedCredential)?.instanceUrl, '_blank')}
                                className="btn btn-secondary inline-flex"
                            >
                                Open n8n →
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
