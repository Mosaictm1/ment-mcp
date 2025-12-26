'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { getN8nCredentials, getWorkflows, executeWorkflow, getExecutions, Workflow, Execution } from '@/lib/api';

interface Credential {
    id: string;
    name: string;
    status: string;
}

const PlayIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const RefreshIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

export default function WorkflowsPage() {
    const router = useRouter();
    const { isLoading, isAuthenticated } = useAuth();
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [selectedCredId, setSelectedCredId] = useState<string>('');
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [executions, setExecutions] = useState<Record<string, Execution[]>>({});
    const [loadingWorkflows, setLoadingWorkflows] = useState(false);
    const [runningWorkflowId, setRunningWorkflowId] = useState<string | null>(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            getN8nCredentials().then((res) => {
                if (res.data) {
                    const verified = res.data.credentials.filter(c => c.status === 'verified');
                    setCredentials(verified);
                    if (verified.length > 0 && !selectedCredId) {
                        setSelectedCredId(verified[0].id);
                    }
                }
            });
        }
    }, [isAuthenticated, selectedCredId]);

    useEffect(() => {
        if (selectedCredId) {
            loadWorkflows();
        }
    }, [selectedCredId]);

    const loadWorkflows = async () => {
        if (!selectedCredId) return;
        setLoadingWorkflows(true);
        setError('');

        const res = await getWorkflows(selectedCredId);
        if (res.data?.data) {
            setWorkflows(res.data.data);
            res.data.data.forEach(wf => {
                getExecutions(wf.id, 3, selectedCredId).then((execRes) => {
                    if (execRes.data?.data) {
                        setExecutions(prev => ({ ...prev, [wf.id]: execRes.data!.data }));
                    }
                });
            });
        } else if (res.error) {
            setError(res.error.message);
        }
        setLoadingWorkflows(false);
    };

    const handleRun = async (workflowId: string) => {
        setRunningWorkflowId(workflowId);
        setSuccess('');
        setError('');

        const res = await executeWorkflow(workflowId, {}, selectedCredId);
        if (res.data) {
            setSuccess(`Workflow executed successfully! Execution ID: ${res.data.executionId || 'N/A'}`);
            setTimeout(() => loadWorkflows(), 2000);
        } else if (res.error) {
            setError(res.error.message);
        }
        setRunningWorkflowId(null);
    };

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
                <div className="w-12 h-12 rounded-xl animate-pulse" style={{ background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: '#0A0A0F' }}>
            <Sidebar />

            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="sticky top-0 z-10 px-8 py-6 backdrop-blur-xl" style={{ background: 'rgba(10, 10, 15, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="text-3xl">⚡</span>
                                Workflows
                            </h1>
                            <p className="text-white/40 text-sm mt-1">View and manage your n8n workflows</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {credentials.length > 0 && (
                                <select
                                    value={selectedCredId}
                                    onChange={(e) => setSelectedCredId(e.target.value)}
                                    className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#57D957]/50"
                                >
                                    {credentials.map(cred => (
                                        <option key={cred.id} value={cred.id} className="bg-[#0A0A0F]">
                                            {cred.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <button
                                onClick={loadWorkflows}
                                disabled={loadingWorkflows}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
                            >
                                <RefreshIcon />
                                Refresh
                            </button>
                        </div>
                    </div>
                </header>

                <div className="px-8 py-6">
                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <span className="text-xl">⚠️</span>
                            <span className="text-red-400">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(87, 217, 87, 0.1)', border: '1px solid rgba(87, 217, 87, 0.2)' }}>
                            <span className="text-xl">✅</span>
                            <span style={{ color: '#57D957' }}>{success}</span>
                        </div>
                    )}

                    {/* No Credentials */}
                    {credentials.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🔌</div>
                            <h3 className="text-lg font-medium text-white mb-2">No n8n instances connected</h3>
                            <p className="text-white/40 text-sm mb-6">Connect a verified n8n instance first</p>
                            <a
                                href="/dashboard/settings"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                                style={{ background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)', color: '#0A0A0F' }}
                            >
                                Connect n8n
                            </a>
                        </div>
                    )}

                    {/* Loading */}
                    {loadingWorkflows && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                            ))}
                        </div>
                    )}

                    {/* Workflows Grid */}
                    {!loadingWorkflows && credentials.length > 0 && (
                        <>
                            {workflows.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {workflows.map((wf) => (
                                        <div
                                            key={wf.id}
                                            className="group p-5 rounded-2xl transition-all duration-300 hover:translate-y-[-2px]"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.8) 0%, rgba(15, 15, 22, 0.9) 100%)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                            }}
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                        style={{ background: wf.active ? 'rgba(87, 217, 87, 0.15)' : 'rgba(255,255,255,0.05)' }}
                                                    >
                                                        <span className="text-lg">⚡</span>
                                                    </div>
                                                    <div>
                                                        <span
                                                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                                                            style={{
                                                                background: wf.active ? 'rgba(87, 217, 87, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                                color: wf.active ? '#57D957' : '#EF4444',
                                                            }}
                                                        >
                                                            {wf.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRun(wf.id)}
                                                    disabled={runningWorkflowId === wf.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 opacity-0 group-hover:opacity-100"
                                                    style={{ background: 'rgba(87, 217, 87, 0.15)', color: '#57D957' }}
                                                >
                                                    <PlayIcon />
                                                    {runningWorkflowId === wf.id ? 'Running...' : 'Run'}
                                                </button>
                                            </div>

                                            {/* Name */}
                                            <h3 className="font-semibold text-white mb-2 truncate">{wf.name}</h3>

                                            {/* Meta */}
                                            <p className="text-xs text-white/30 mb-4">
                                                {wf.nodes?.length || 0} nodes {wf.updatedAt && `· Updated ${new Date(wf.updatedAt).toLocaleDateString()}`}
                                            </p>

                                            {/* Recent Executions */}
                                            {executions[wf.id] && executions[wf.id].length > 0 && (
                                                <div className="border-t border-white/5 pt-3">
                                                    <p className="text-xs text-white/40 mb-2">Recent Executions</p>
                                                    <div className="flex gap-1.5">
                                                        {executions[wf.id].slice(0, 5).map((exec, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-3 h-3 rounded-full"
                                                                title={`${exec.status}${exec.startedAt ? ` - ${new Date(exec.startedAt).toLocaleString()}` : ''}`}
                                                                style={{
                                                                    background: exec.status === 'success' ? '#57D957' : exec.status === 'error' ? '#EF4444' : '#F59E0B',
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">📦</div>
                                    <h3 className="text-lg font-medium text-white mb-2">No workflows found</h3>
                                    <p className="text-white/40 text-sm">Create workflows in your n8n instance</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
