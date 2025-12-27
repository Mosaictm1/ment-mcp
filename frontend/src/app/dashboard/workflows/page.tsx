'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

const BoltIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const ServerIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
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
        if (!isLoading && !isAuthenticated) router.push('/login');
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            getN8nCredentials().then((res) => {
                if (res.data) {
                    const verified = res.data.credentials.filter(c => c.status === 'verified');
                    setCredentials(verified);
                    if (verified.length > 0 && !selectedCredId) setSelectedCredId(verified[0].id);
                }
            });
        }
    }, [isAuthenticated, selectedCredId]);

    useEffect(() => {
        if (selectedCredId) loadWorkflows();
    }, [selectedCredId]);

    const loadWorkflows = async () => {
        if (!selectedCredId) return;
        setLoadingWorkflows(true); setError('');
        const res = await getWorkflows(selectedCredId);
        if (res.data?.data) {
            setWorkflows(res.data.data);
            res.data.data.forEach(wf => {
                getExecutions(wf.id, 3, selectedCredId).then((execRes) => {
                    if (execRes.data?.data) setExecutions(prev => ({ ...prev, [wf.id]: execRes.data!.data }));
                });
            });
        } else if (res.error) setError(res.error.message);
        setLoadingWorkflows(false);
    };

    const handleRun = async (workflowId: string) => {
        setRunningWorkflowId(workflowId); setSuccess(''); setError('');
        const res = await executeWorkflow(workflowId, {}, selectedCredId);
        if (res.data) {
            setSuccess(`Workflow executed! ID: ${res.data.executionId || 'N/A'}`);
            setTimeout(() => loadWorkflows(), 2000);
        } else if (res.error) setError(res.error.message);
        setRunningWorkflowId(null);
    };

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 100%)' }}>
                <div className="w-12 h-12 rounded-xl animate-pulse" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)' }}>
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <header className="px-8 pt-8 pb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">Workflows</h1>
                            <p className="text-sm text-white/40 mt-1">Manage your n8n automations</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {credentials.length > 0 && (
                                <select value={selectedCredId} onChange={(e) => setSelectedCredId(e.target.value)}
                                    className="px-4 py-2.5 rounded-xl text-sm bg-white/[0.03] border border-white/[0.06] text-white focus:outline-none">
                                    {credentials.map(cred => (<option key={cred.id} value={cred.id} className="bg-[#0a0a0f]">{cred.name}</option>))}
                                </select>
                            )}
                            <button onClick={loadWorkflows} disabled={loadingWorkflows}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                                <RefreshIcon /> Refresh
                            </button>
                        </div>
                    </div>
                </header>

                <div className="px-8 pb-8">
                    {error && (
                        <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                            <span className="text-red-400">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                            <span style={{ color: '#22c55e' }}>{success}</span>
                        </div>
                    )}

                    {credentials.length === 0 && (
                        <div className="text-center py-16 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6' }}>
                                <ServerIcon />
                            </div>
                            <h3 className="text-base font-medium text-white mb-2">No connected instances</h3>
                            <p className="text-sm text-white/40 mb-6 max-w-xs mx-auto">Connect a verified n8n instance to see your workflows</p>
                            <Link href="/dashboard/settings"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)' }}>
                                Connect n8n
                            </Link>
                        </div>
                    )}

                    {loadingWorkflows && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }} />
                            ))}
                        </div>
                    )}

                    {!loadingWorkflows && credentials.length > 0 && (
                        <>
                            {workflows.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {workflows.map((wf) => (
                                        <div key={wf.id}
                                            className="group p-5 rounded-2xl transition-all duration-200 hover:translate-y-[-2px]"
                                            style={{ background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                    style={{ background: wf.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)', color: wf.active ? '#22c55e' : '#666' }}>
                                                    <BoltIcon />
                                                </div>
                                                <button onClick={() => handleRun(wf.id)} disabled={runningWorkflowId === wf.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all opacity-0 group-hover:opacity-100"
                                                    style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                                    <PlayIcon />
                                                    {runningWorkflowId === wf.id ? '...' : 'Run'}
                                                </button>
                                            </div>
                                            <h3 className="font-medium text-white mb-1 truncate">{wf.name}</h3>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-2 py-0.5 rounded-md text-xs font-medium"
                                                    style={{ background: wf.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: wf.active ? '#22c55e' : '#ef4444' }}>
                                                    {wf.active ? '● Active' : '○ Inactive'}
                                                </span>
                                                <span className="text-xs text-white/25">{wf.nodes?.length || 0} nodes</span>
                                            </div>
                                            {executions[wf.id] && executions[wf.id].length > 0 && (
                                                <div className="pt-3 border-t border-white/[0.03]">
                                                    <p className="text-xs text-white/30 mb-2">Recent runs</p>
                                                    <div className="flex gap-1">
                                                        {executions[wf.id].slice(0, 5).map((exec, i) => (
                                                            <div key={i} className="w-2.5 h-2.5 rounded-full"
                                                                title={`${exec.status}${exec.startedAt ? ` - ${new Date(exec.startedAt).toLocaleString()}` : ''}`}
                                                                style={{ background: exec.status === 'success' ? '#22c55e' : exec.status === 'error' ? '#ef4444' : '#f59e0b' }} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
                                        <BoltIcon />
                                    </div>
                                    <h3 className="text-base font-medium text-white mb-2">No workflows found</h3>
                                    <p className="text-sm text-white/40">Create workflows in your n8n instance</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
