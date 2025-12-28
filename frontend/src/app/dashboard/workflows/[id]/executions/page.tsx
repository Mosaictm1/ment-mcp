'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import AIRepairModal from '@/components/workflows/AIRepairModal';
import { getWorkflow, getExecutions, getExecution, getN8nCredentials } from '@/lib/api';
import {
    ArrowLeft, Clock, CheckCircle2, XCircle, Loader2, AlertCircle,
    ChevronDown, ChevronRight, Play, RefreshCw, Calendar, Code2,
    ArrowRight, Database, Zap, Wrench, Sparkles
} from 'lucide-react';

interface NodeRun {
    nodeName: string;
    nodeType: string;
    executionTime: number;
    inputData?: unknown;
    outputData?: unknown;
    error?: string;
}

interface ExecutionDetail {
    id: string;
    status: 'success' | 'error' | 'running' | 'waiting';
    startedAt: string;
    stoppedAt?: string;
    mode: string;
    nodeRuns: NodeRun[];
    error?: string;
}

interface Workflow {
    id: string;
    name: string;
    active: boolean;
    nodes?: Array<{ id: string; name: string; type: string }>;
}

export default function ExecutionsPage() {
    const params = useParams();
    const router = useRouter();
    const { isLoading: authLoading, isAuthenticated } = useAuth();
    const workflowId = params?.id as string;

    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [executions, setExecutions] = useState<ExecutionDetail[]>([]);
    const [credentialId, setCredentialId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [expandedExecutions, setExpandedExecutions] = useState<Set<string>>(new Set());
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [error, setError] = useState('');
    const [aiModalNode, setAiModalNode] = useState<NodeRun | null>(null);
    const [aiModalMode, setAiModalMode] = useState<'repair' | 'improve'>('repair');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/login');
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated && workflowId) {
            loadCredentialAndData();
        }
    }, [isAuthenticated, workflowId]);

    const loadCredentialAndData = async () => {
        const credRes = await getN8nCredentials();
        if (credRes.data?.credentials) {
            const verified = credRes.data.credentials.filter((c: any) => c.status === 'verified');
            if (verified.length > 0) {
                setCredentialId(verified[0].id);
                await loadData(verified[0].id);
            }
        }
    };

    const loadData = async (credId: string) => {
        setIsLoading(true);
        setError('');

        try {
            // Load workflow
            const wfRes = await getWorkflow(workflowId, credId);
            if (wfRes.data) {
                setWorkflow({
                    id: wfRes.data.id,
                    name: wfRes.data.name,
                    active: wfRes.data.active,
                    nodes: wfRes.data.nodes
                });
            }

            // Load executions
            const execRes = await getExecutions(workflowId, 20, credId);
            if (execRes.data?.data) {
                const detailedExecutions: ExecutionDetail[] = [];

                for (const exec of execRes.data.data.slice(0, 15)) {
                    try {
                        const detailRes = await getExecution(exec.id, credId);
                        if (detailRes.data) {
                            const nodeRuns: NodeRun[] = [];
                            const runData = detailRes.data.data?.resultData?.runData;

                            if (runData) {
                                Object.entries(runData).forEach(([nodeName, runs]: [string, any]) => {
                                    if (runs && runs.length > 0) {
                                        const run = runs[runs.length - 1];
                                        const inputItems = run.inputData?.main?.[0] || [];
                                        const outputItems = run.data?.main?.[0] || [];

                                        nodeRuns.push({
                                            nodeName,
                                            nodeType: wfRes.data?.nodes?.find((n: any) => n.name === nodeName)?.type || 'unknown',
                                            executionTime: run.executionTime || 0,
                                            inputData: inputItems.length > 0 ? inputItems.map((i: any) => i.json) : undefined,
                                            outputData: outputItems.length > 0 ? outputItems.map((i: any) => i.json) : undefined,
                                            error: run.error?.message
                                        });
                                    }
                                });
                            }

                            detailedExecutions.push({
                                id: exec.id,
                                status: exec.status,
                                startedAt: exec.startedAt,
                                stoppedAt: exec.stoppedAt,
                                mode: exec.mode,
                                nodeRuns,
                                error: detailRes.data.data?.resultData?.error?.message
                            });
                        }
                    } catch (e) {
                        detailedExecutions.push({
                            id: exec.id,
                            status: exec.status,
                            startedAt: exec.startedAt,
                            stoppedAt: exec.stoppedAt,
                            mode: exec.mode,
                            nodeRuns: []
                        });
                    }
                }

                setExecutions(detailedExecutions);
            }
        } catch (e) {
            setError('Failed to load data');
        }

        setIsLoading(false);
    };

    const toggleExecution = (id: string) => {
        setExpandedExecutions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const toggleNode = (key: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) newSet.delete(key);
            else newSet.add(key);
            return newSet;
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
            case 'running': return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
            default: return <Clock className="w-5 h-5 text-yellow-400" />;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'success': return 'rgba(34, 197, 94, 0.1)';
            case 'error': return 'rgba(239, 68, 68, 0.1)';
            case 'running': return 'rgba(59, 130, 246, 0.1)';
            default: return 'rgba(234, 179, 8, 0.1)';
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatDuration = (start: string, end?: string) => {
        if (!end) return 'Running...';
        const duration = new Date(end).getTime() - new Date(start).getTime();
        if (duration < 1000) return `${duration}ms`;
        return `${(duration / 1000).toFixed(1)}s`;
    };

    const renderNodeRun = (node: NodeRun, execId: string) => {
        const nodeKey = `${execId}-${node.nodeName}`;
        const isExpanded = expandedNodes.has(nodeKey);
        const nodeTypeShort = node.nodeType.split('.').pop() || node.nodeType;
        const isHttpRequest = node.nodeType.includes('httpRequest');

        return (
            <div key={nodeKey} className="border-l-2 pl-4 ml-3" style={{ borderColor: node.error ? '#ef4444' : '#22c55e' }}>
                <div className="flex items-center justify-between py-2">
                    <button
                        onClick={() => toggleNode(nodeKey)}
                        className="flex items-center gap-3 hover:bg-white/[0.02] rounded-lg px-2 py-1 -ml-2 transition-colors flex-1"
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: node.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)' }}>
                            {node.error ? <AlertCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-green-400" />}
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-sm font-medium text-white">{node.nodeName}</p>
                            <div className="flex items-center gap-2 text-xs text-white/40">
                                <span>{nodeTypeShort}</span>
                                <span>•</span>
                                <span>{node.executionTime}ms</span>
                            </div>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
                    </button>

                    {/* AI Action Buttons */}
                    <div className="flex items-center gap-2 ml-2">
                        {node.error && (
                            <button
                                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105"
                                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
                                onClick={(e) => { e.stopPropagation(); setAiModalNode(node); setAiModalMode('repair'); }}
                            >
                                <Wrench className="w-3.5 h-3.5" />
                                Fix
                            </button>
                        )}
                        <button
                            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105"
                            style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}
                            onClick={(e) => { e.stopPropagation(); setAiModalNode(node); setAiModalMode('improve'); }}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Improve
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="py-3 space-y-3">
                                {node.error ? (
                                    <div>
                                        <label className="text-xs font-medium text-red-400 flex items-center gap-1.5 mb-1.5">
                                            <AlertCircle className="w-3 h-3" /> Error
                                        </label>
                                        <div className="p-3 rounded-lg text-xs text-red-300" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                            {String(node.error)}
                                        </div>
                                    </div>
                                ) : null}

                                {node.inputData ? (
                                    <div>
                                        <label className="text-xs font-medium text-blue-400 flex items-center gap-1.5 mb-1.5">
                                            <ArrowRight className="w-3 h-3" /> Input
                                        </label>
                                        <pre className="p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-40"
                                            style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#93c5fd' }}>
                                            {JSON.stringify(node.inputData, null, 2)}
                                        </pre>
                                    </div>
                                ) : null}

                                {node.outputData ? (
                                    <div>
                                        <label className="text-xs font-medium text-green-400 flex items-center gap-1.5 mb-1.5">
                                            <Database className="w-3 h-3" /> Output
                                        </label>
                                        <pre className="p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-40"
                                            style={{ background: 'rgba(34, 197, 94, 0.08)', color: '#86efac' }}>
                                            {JSON.stringify(node.outputData, null, 2)}
                                        </pre>
                                    </div>
                                ) : null}

                                {!node.inputData && !node.outputData && !node.error ? (
                                    <p className="text-xs text-white/30 italic">No data available</p>
                                ) : null}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)' }}>
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard/workflows"
                        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Workflows
                    </Link>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{ background: workflow?.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}>
                                <Zap className="w-7 h-7" style={{ color: workflow?.active ? '#22c55e' : '#666' }} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{workflow?.name || 'Loading...'}</h1>
                                <p className="text-sm text-white/40">Execution History</p>
                            </div>
                        </div>

                        <button
                            onClick={() => credentialId && loadData(credentialId)}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                            style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="text-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-purple-400 mx-auto mb-4" />
                        <p className="text-white/40">Loading executions...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : executions.length === 0 ? (
                    <div className="text-center py-20 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                            <Clock className="w-10 h-10 text-white/20" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No executions yet</h3>
                        <p className="text-sm text-white/40">Run this workflow to see execution history</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {executions.map((exec, index) => {
                            const isExpanded = expandedExecutions.has(exec.id);

                            return (
                                <motion.div
                                    key={exec.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="rounded-2xl overflow-hidden"
                                    style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)' }}
                                >
                                    <button
                                        onClick={() => toggleExecution(exec.id)}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: getStatusBg(exec.status) }}>
                                                {getStatusIcon(exec.status)}
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-base font-medium text-white">
                                                        {exec.status.charAt(0).toUpperCase() + exec.status.slice(1)}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/40">
                                                        {exec.mode}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(exec.startedAt)}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{formatDuration(exec.startedAt, exec.stoppedAt)}</span>
                                                    <span>•</span>
                                                    <span>{exec.nodeRuns.length} nodes</span>
                                                </div>
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronDown className="w-5 h-5 text-white/30" /> : <ChevronRight className="w-5 h-5 text-white/30" />}
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-6 pt-2 border-t border-white/[0.04]">
                                                    {exec.error && (
                                                        <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                                            <p className="text-xs font-medium text-red-400 mb-1">Execution Error</p>
                                                            <p className="text-sm text-red-300">{exec.error}</p>
                                                        </div>
                                                    )}

                                                    {exec.nodeRuns.length > 0 ? (
                                                        <div className="space-y-2">
                                                            <p className="text-xs font-medium text-white/50 mb-4 flex items-center gap-2">
                                                                <Code2 className="w-4 h-4" />
                                                                Node Details
                                                            </p>
                                                            {exec.nodeRuns.map((node) => renderNodeRun(node, exec.id))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-white/30 italic py-4">No detailed node data available</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* AI Repair/Improve Modal */}
                {aiModalNode && workflow && (
                    <AIRepairModal
                        mode={aiModalMode}
                        node={{
                            nodeName: aiModalNode.nodeName,
                            nodeType: aiModalNode.nodeType,
                            inputData: aiModalNode.inputData,
                            outputData: aiModalNode.outputData,
                            error: aiModalNode.error
                        }}
                        credentialId={credentialId}
                        workflowId={workflow.id}
                        onClose={() => setAiModalNode(null)}
                        onApplied={() => {
                            setAiModalNode(null);
                            credentialId && loadData(credentialId);
                        }}
                    />
                )}
            </main>
        </div>
    );
}
