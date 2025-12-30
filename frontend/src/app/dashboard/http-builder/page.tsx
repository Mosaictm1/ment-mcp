'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { getN8nCredentials, getWorkflows, Workflow } from '@/lib/api';
import {
    Zap,
    Play,
    Wrench,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    Sparkles,
    ArrowRight,
    RefreshCw,
    Code,
    ExternalLink
} from 'lucide-react';

interface Credential {
    id: string;
    name: string;
    status: string;
    instanceUrl: string;
}

interface NodeAnalysis {
    nodeName: string;
    nodeType: string;
    isHttpRequest: boolean;
    status: 'success' | 'error' | 'pending';
    errorMessage?: string;
    inputData?: unknown;
    outputData?: unknown;
}

interface WorkflowAnalysis {
    workflowId: string;
    workflowName: string;
    totalNodes: number;
    httpNodes: NodeAnalysis[];
    errorNodes: NodeAnalysis[];
    successRate: number;
}

interface BuildResult {
    success: boolean;
    service: string;
    summary: string;
    explanation: string;
    nodeConfig: {
        url: string;
        method: string;
        headers?: Record<string, string>;
        body?: unknown;
    };
    curlCommand: string;
    documentationUrl?: string;
    researchSteps: string[];
    confidence: 'high' | 'medium' | 'low';
}

export default function HttpBuilderPage() {
    const router = useRouter();
    const { isLoading, isAuthenticated } = useAuth();

    // State
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [selectedCredId, setSelectedCredId] = useState<string>('');
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [analysis, setAnalysis] = useState<WorkflowAnalysis | null>(null);
    const [buildResult, setBuildResult] = useState<BuildResult | null>(null);

    // UI State
    const [loadingWorkflows, setLoadingWorkflows] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [building, setBuilding] = useState(false);
    const [fixing, setFixing] = useState<string | null>(null);
    const [buildDescription, setBuildDescription] = useState('');
    const [activeTab, setActiveTab] = useState<'analyze' | 'build'>('analyze');
    const [error, setError] = useState('');

    // Auth check
    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push('/login');
    }, [isLoading, isAuthenticated, router]);

    // Load credentials
    useEffect(() => {
        if (isAuthenticated) {
            loadCredentials();
        }
    }, [isAuthenticated]);

    // Load workflows when credential changes
    useEffect(() => {
        if (selectedCredId) {
            loadWorkflows();
        }
    }, [selectedCredId]);

    const loadCredentials = async () => {
        const res = await getN8nCredentials();
        if (res.data) {
            const verified = res.data.credentials.filter((c: Credential) => c.status === 'verified');
            setCredentials(verified);
            if (verified.length > 0 && !selectedCredId) {
                setSelectedCredId(verified[0].id);
            } else if (verified.length === 0) {
                router.push('/onboarding');
            }
        }
    };

    const loadWorkflows = async () => {
        if (!selectedCredId) return;
        setLoadingWorkflows(true);
        setError('');

        try {
            const res = await getWorkflows(selectedCredId);
            if (res.data?.data) {
                setWorkflows(res.data.data);
            } else if (res.error) {
                setError(res.error.message);
            }
        } catch (e: any) {
            setError(e.message);
        }
        setLoadingWorkflows(false);
    };

    const analyzeWorkflow = async (workflow: Workflow) => {
        setSelectedWorkflow(workflow);
        setAnalyzing(true);
        setAnalysis(null);
        setError('');

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/http-builder/execute-and-analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    workflowId: workflow.id,
                    credentialId: selectedCredId
                })
            });

            const data = await res.json();
            if (data.success && data.data.analysis) {
                setAnalysis(data.data.analysis);
            } else {
                setError(data.error || 'Analysis failed');
            }
        } catch (e: any) {
            setError(e.message);
        }
        setAnalyzing(false);
    };

    const fixNode = async (node: NodeAnalysis) => {
        if (!node.errorMessage || !selectedWorkflow) return;

        setFixing(node.nodeName);
        setBuildResult(null);

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/http-builder/fix`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    node: {
                        name: node.nodeName,
                        type: node.nodeType,
                        parameters: {}
                    },
                    errorMessage: node.errorMessage,
                    inputData: node.inputData
                })
            });

            const data = await res.json();
            if (data.success) {
                setBuildResult(data.data);
            } else {
                setError(data.error || 'Fix failed');
            }
        } catch (e: any) {
            setError(e.message);
        }
        setFixing(null);
    };

    const buildNode = async () => {
        if (!buildDescription.trim()) return;

        setBuilding(true);
        setBuildResult(null);
        setError('');

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/http-builder/build`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    description: buildDescription
                })
            });

            const data = await res.json();
            if (data.success) {
                setBuildResult(data.data);
            } else {
                setError(data.error || 'Build failed');
            }
        } catch (e: any) {
            setError(e.message);
        }
        setBuilding(false);
    };

    const applyFix = async () => {
        if (!buildResult || !selectedWorkflow || !analysis) return;

        const errorNode = analysis.errorNodes[0];
        if (!errorNode) return;

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/http-builder/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    workflowId: selectedWorkflow.id,
                    nodeName: errorNode.nodeName,
                    nodeConfig: buildResult.nodeConfig,
                    credentialId: selectedCredId
                })
            });

            const data = await res.json();
            if (data.success) {
                // Re-analyze to see results
                analyzeWorkflow(selectedWorkflow);
                setBuildResult(null);
            } else {
                setError(data.error || 'Apply failed');
            }
        } catch (e: any) {
            setError(e.message);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
            default: return <Clock className="w-5 h-5 text-yellow-400" />;
        }
    };

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high': return 'text-green-400 bg-green-400/10';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10';
            default: return 'text-red-400 bg-red-400/10';
        }
    };

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl animate-pulse bg-gradient-to-br from-purple-500 to-cyan-500" />
                    <span className="text-white/40 text-sm">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[var(--bg-deep)]">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="px-8 pt-8 pb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                                <Wrench className="w-8 h-8 text-purple-400" />
                                HTTP Node Builder
                            </h1>
                            <p className="text-sm text-[var(--text-secondary)]">
                                Build and repair HTTP Request nodes with AI assistance
                            </p>
                        </div>
                        {credentials.length > 1 && (
                            <select
                                value={selectedCredId}
                                onChange={(e) => setSelectedCredId(e.target.value)}
                                className="px-4 py-2.5 rounded-xl text-sm bg-white/[0.03] border border-[var(--border-glass)] text-white focus:outline-none focus:border-purple-500/50"
                            >
                                {credentials.map(cred => (
                                    <option key={cred.id} value={cred.id} className="bg-[#0a0a0f]">{cred.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('analyze')}
                            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'analyze'
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Analyze & Fix
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('build')}
                            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'build'
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Build New Node
                            </span>
                        </button>
                    </div>
                </header>

                <div className="px-8 pb-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <span className="text-red-400">{error}</span>
                        </div>
                    )}

                    {activeTab === 'analyze' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Workflow List */}
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-purple-400" />
                                    Select Workflow to Analyze
                                </h3>

                                {loadingWorkflows ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-16 rounded-xl animate-pulse bg-white/5" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                        {workflows.map(wf => (
                                            <button
                                                key={wf.id}
                                                onClick={() => analyzeWorkflow(wf)}
                                                disabled={analyzing}
                                                className={`w-full p-4 rounded-xl text-left transition-all ${selectedWorkflow?.id === wf.id
                                                        ? 'bg-purple-500/20 border border-purple-500/30'
                                                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-white">{wf.name}</p>
                                                        <p className="text-xs text-white/40">{wf.nodes?.length || 0} nodes</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${wf.active ? 'bg-green-400' : 'bg-white/20'}`} />
                                                        {analyzing && selectedWorkflow?.id === wf.id ? (
                                                            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                                                        ) : (
                                                            <Play className="w-4 h-4 text-white/40" />
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Analysis Results */}
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Search className="w-5 h-5 text-cyan-400" />
                                    Analysis Results
                                </h3>

                                {analyzing ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mb-4" />
                                        <p className="text-white/60">Executing and analyzing workflow...</p>
                                        <p className="text-xs text-white/40 mt-2">This may take a moment</p>
                                    </div>
                                ) : analysis ? (
                                    <div className="space-y-4">
                                        {/* Summary */}
                                        <div className="p-4 rounded-xl bg-white/5">
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <p className="text-2xl font-bold text-white">{analysis.totalNodes}</p>
                                                    <p className="text-xs text-white/40">Total Nodes</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-cyan-400">{analysis.httpNodes.length}</p>
                                                    <p className="text-xs text-white/40">HTTP Nodes</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-red-400">{analysis.errorNodes.length}</p>
                                                    <p className="text-xs text-white/40">Errors</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* HTTP Nodes */}
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-white/60">HTTP Request Nodes</p>
                                            {analysis.httpNodes.length > 0 ? (
                                                analysis.httpNodes.map((node, i) => (
                                                    <div key={i} className={`p-4 rounded-xl border ${node.status === 'error'
                                                            ? 'bg-red-500/10 border-red-500/30'
                                                            : 'bg-white/5 border-transparent'
                                                        }`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                {getStatusIcon(node.status)}
                                                                <div>
                                                                    <p className="font-medium text-white">{node.nodeName}</p>
                                                                    {node.errorMessage && (
                                                                        <p className="text-xs text-red-400 mt-1 max-w-md truncate">
                                                                            {node.errorMessage}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {node.status === 'error' && (
                                                                <button
                                                                    onClick={() => fixNode(node)}
                                                                    disabled={fixing === node.nodeName}
                                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                                                                >
                                                                    {fixing === node.nodeName ? (
                                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <Sparkles className="w-4 h-4" />
                                                                    )}
                                                                    AI Fix
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-white/40 py-4">No HTTP Request nodes found</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Search className="w-12 h-12 text-white/20 mb-4" />
                                        <p className="text-white/60">Select a workflow to analyze</p>
                                        <p className="text-xs text-white/40 mt-2">
                                            We'll execute it and identify any HTTP node issues
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Build Tab */
                        <div className="max-w-4xl mx-auto">
                            <div className="glass-card p-8 rounded-2xl">
                                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-cyan-400" />
                                    Build HTTP Node from Description
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-2">
                                            Describe the API call you need
                                        </label>
                                        <textarea
                                            value={buildDescription}
                                            onChange={(e) => setBuildDescription(e.target.value)}
                                            placeholder="e.g., Create a Stripe API call to list all customers with a limit of 10"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[var(--border-glass)] text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none h-32"
                                        />
                                    </div>

                                    <button
                                        onClick={buildNode}
                                        disabled={building || !buildDescription.trim()}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {building ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                Researching & Building...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Build Node with AI
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Build Result */}
                    {buildResult && (
                        <div className="mt-6 glass-card p-6 rounded-2xl max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Code className="w-5 h-5 text-green-400" />
                                    Generated Configuration
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(buildResult.confidence)}`}>
                                    {buildResult.confidence} confidence
                                </span>
                            </div>

                            <div className="space-y-4">
                                {/* Service & Summary */}
                                <div className="p-4 rounded-xl bg-white/5">
                                    <p className="text-sm text-white/60 mb-1">Service</p>
                                    <p className="font-medium text-white">{buildResult.service}</p>
                                    <p className="text-sm text-white/60 mt-3 mb-1">Summary</p>
                                    <p className="text-white">{buildResult.summary}</p>
                                </div>

                                {/* Node Config */}
                                <div className="p-4 rounded-xl bg-black/30 font-mono text-sm overflow-x-auto">
                                    <pre className="text-green-400">
                                        {JSON.stringify(buildResult.nodeConfig, null, 2)}
                                    </pre>
                                </div>

                                {/* cURL Command */}
                                {buildResult.curlCommand && (
                                    <div className="p-4 rounded-xl bg-black/30 font-mono text-sm overflow-x-auto">
                                        <p className="text-white/40 mb-2"># cURL Command</p>
                                        <pre className="text-cyan-400 whitespace-pre-wrap">{buildResult.curlCommand}</pre>
                                    </div>
                                )}

                                {/* Research Steps */}
                                <div className="p-4 rounded-xl bg-white/5">
                                    <p className="text-sm text-white/60 mb-2">Research Steps</p>
                                    <ul className="space-y-1">
                                        {buildResult.researchSteps.map((step, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                                                <ArrowRight className="w-3 h-3 text-purple-400" />
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {selectedWorkflow && analysis?.errorNodes?.[0] && (
                                        <button
                                            onClick={applyFix}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Apply to Workflow
                                        </button>
                                    )}
                                    {buildResult.documentationUrl && (
                                        <a
                                            href={buildResult.documentationUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                            View Docs
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
