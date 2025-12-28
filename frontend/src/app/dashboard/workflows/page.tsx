'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import WorkflowCard from '@/components/workflows/WorkflowCard';
import ExecuteWorkflowModal from '@/components/workflows/ExecuteWorkflowModal';
import { getN8nCredentials, getWorkflows, executeWorkflow, getExecutions, Workflow, Execution } from '@/lib/api';
import { RefreshCw, Server, Zap, Search, Filter, Plus } from 'lucide-react';

interface Credential {
    id: string;
    name: string;
    status: string;
}

export default function WorkflowsPage() {
    const router = useRouter();
    const { isLoading, isAuthenticated } = useAuth();
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [selectedCredId, setSelectedCredId] = useState<string>('');
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [executions, setExecutions] = useState<Record<string, Execution[]>>({});
    const [loadingWorkflows, setLoadingWorkflows] = useState(false);
    const [runningWorkflowId, setRunningWorkflowId] = useState<string | null>(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push('/login');
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            getN8nCredentials().then((res) => {
                if (res.data) {
                    const verified = res.data.credentials.filter(c => c.status === 'verified');
                    setCredentials(verified);
                    if (verified.length > 0 && !selectedCredId) {
                        setSelectedCredId(verified[0].id);
                    } else if (verified.length === 0) {
                        // No credentials, redirect to onboarding
                        router.push('/onboarding');
                    }
                }
            });
        }
    }, [isAuthenticated, selectedCredId, router]);

    useEffect(() => {
        if (selectedCredId) loadWorkflows();
    }, [selectedCredId]);

    const loadWorkflows = async () => {
        if (!selectedCredId) return;
        setLoadingWorkflows(true);
        setError('');

        const res = await getWorkflows(selectedCredId);
        if (res.data?.data) {
            setWorkflows(res.data.data);
            // Load executions for first 10 workflows
            const workflowsToLoad = res.data.data.slice(0, 10);
            for (const wf of workflowsToLoad) {
                try {
                    const execRes = await getExecutions(wf.id, 6, selectedCredId);
                    if (execRes.data?.data) {
                        setExecutions(prev => ({ ...prev, [wf.id]: execRes.data!.data }));
                    }
                } catch (e) {
                    console.log('Failed to load executions for', wf.id);
                }
            }
        } else if (res.error) {
            setError(res.error.message);
        }
        setLoadingWorkflows(false);
    };

    const handleExecuteWorkflow = async (workflowId: string, data?: Record<string, unknown>) => {
        setRunningWorkflowId(workflowId);
        const res = await executeWorkflow(workflowId, data || {}, selectedCredId);
        setRunningWorkflowId(null);

        if (res.data) {
            // Refresh executions after a delay
            setTimeout(() => loadWorkflows(), 2000);
            return { success: true, executionId: res.data.executionId };
        } else if (res.error) {
            return { success: false, error: res.error.message };
        }
        return { success: false, error: 'Unknown error' };
    };

    // Filter workflows based on search and active filter
    const filteredWorkflows = workflows.filter(wf => {
        const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterActive === 'all' ||
            (filterActive === 'active' && wf.active) ||
            (filterActive === 'inactive' && !wf.active);
        return matchesSearch && matchesFilter;
    });

    const activeCount = workflows.filter(wf => wf.active).length;
    const inactiveCount = workflows.filter(wf => !wf.active).length;

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 100%)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }} />
                    <span className="text-white/40 text-sm">Loading workflows...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)' }}>
            <Sidebar />
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="px-8 pt-8 pb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Workflows</h1>
                            <p className="text-sm text-white/40">Manage and run your n8n automations</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {credentials.length > 1 && (
                                <select
                                    value={selectedCredId}
                                    onChange={(e) => setSelectedCredId(e.target.value)}
                                    className="px-4 py-2.5 rounded-xl text-sm bg-white/[0.03] border border-white/[0.06] text-white focus:outline-none focus:border-green-500/50"
                                >
                                    {credentials.map(cred => (
                                        <option key={cred.id} value={cred.id} className="bg-[#0a0a0f]">{cred.name}</option>
                                    ))}
                                </select>
                            )}
                            <button
                                onClick={loadWorkflows}
                                disabled={loadingWorkflows}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loadingWorkflows ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                            <Zap className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-white/60">{workflows.length} Total</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.08)' }}>
                            <span className="w-2 h-2 rounded-full bg-green-400" />
                            <span className="text-sm text-green-400">{activeCount} Active</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
                            <span className="w-2 h-2 rounded-full bg-red-400" />
                            <span className="text-sm text-red-400">{inactiveCount} Inactive</span>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search workflows..."
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors"
                            />
                        </div>
                        <div className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                            {(['all', 'active', 'inactive'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setFilterActive(filter)}
                                    className={`px-4 py-3 text-sm font-medium transition-colors ${filterActive === filter
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'text-white/40 hover:text-white/60'
                                        }`}
                                >
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="px-8 pb-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                            <span className="text-red-400">{error}</span>
                        </div>
                    )}

                    {/* No Credentials */}
                    {credentials.length === 0 && (
                        <div className="text-center py-20 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.08)' }}>
                                <Server className="w-12 h-12 text-purple-400/40" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No n8n instance connected</h3>
                            <p className="text-sm text-white/40 mb-6 max-w-md mx-auto">
                                Connect your n8n server to start viewing and running your workflows
                            </p>
                            <Link href="/onboarding"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)' }}>
                                <Plus className="w-4 h-4" />
                                Connect n8n
                            </Link>
                        </div>
                    )}

                    {/* Loading State */}
                    {loadingWorkflows && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }} />
                            ))}
                        </div>
                    )}

                    {/* Workflows Grid */}
                    {!loadingWorkflows && credentials.length > 0 && (
                        <>
                            {filteredWorkflows.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {filteredWorkflows.map((wf, index) => (
                                        <div key={wf.id} onClick={() => setSelectedWorkflow(wf)}>
                                            <WorkflowCard
                                                workflow={wf}
                                                executions={executions[wf.id]}
                                                isRunning={runningWorkflowId === wf.id}
                                                onRun={() => setSelectedWorkflow(wf)}
                                                index={index}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : workflows.length > 0 ? (
                                <div className="text-center py-16 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(234, 179, 8, 0.08)' }}>
                                        <Search className="w-10 h-10 text-yellow-500/40" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">No matching workflows</h3>
                                    <p className="text-sm text-white/40">Try adjusting your search or filter</p>
                                </div>
                            ) : (
                                <div className="text-center py-20 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.08)' }}>
                                        <Zap className="w-12 h-12 text-blue-400/40" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No workflows found</h3>
                                    <p className="text-sm text-white/40 max-w-md mx-auto">
                                        Create workflows in your n8n instance to see them here
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Execute Workflow Modal */}
            {selectedWorkflow && (
                <ExecuteWorkflowModal
                    workflow={selectedWorkflow}
                    onClose={() => setSelectedWorkflow(null)}
                    onExecute={handleExecuteWorkflow}
                />
            )}
        </div>
    );
}
