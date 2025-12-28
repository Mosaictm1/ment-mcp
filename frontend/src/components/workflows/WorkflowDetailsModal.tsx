'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Loader2, CheckCircle2, AlertCircle, XCircle, ChevronDown, ChevronRight, Clock, Calendar, Code2, ArrowRight, RotateCcw, Zap, Database } from 'lucide-react';
import { getWorkflow, getExecutions, getExecution, Execution } from '@/lib/api';

interface Workflow {
    id: string;
    name: string;
    active: boolean;
    nodes?: unknown[];
}

interface NodeRun {
    nodeName: string;
    nodeType: string;
    executionTime: number;
    startTime: number;
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

interface WorkflowDetailsModalProps {
    workflow: Workflow;
    credentialId: string;
    onClose: () => void;
    onExecute: () => void;
}

export default function WorkflowDetailsModal({ workflow, credentialId, onClose, onExecute }: WorkflowDetailsModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [executions, setExecutions] = useState<ExecutionDetail[]>([]);
    const [expandedExecutions, setExpandedExecutions] = useState<Set<string>>(new Set());
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [workflowNodes, setWorkflowNodes] = useState<Array<{ id: string; name: string; type: string }>>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, [workflow.id, credentialId]);

    const loadData = async () => {
        setIsLoading(true);
        setError('');

        try {
            // Load workflow details
            const wfRes = await getWorkflow(workflow.id, credentialId);
            if (wfRes.data?.nodes) {
                setWorkflowNodes(wfRes.data.nodes.map((n: any) => ({
                    id: n.id,
                    name: n.name,
                    type: n.type
                })));
            }

            // Load executions
            const execRes = await getExecutions(workflow.id, 20, credentialId);
            if (execRes.data?.data) {
                // Load details for each execution
                const detailedExecutions: ExecutionDetail[] = [];

                for (const exec of execRes.data.data.slice(0, 10)) {
                    try {
                        const detailRes = await getExecution(exec.id, credentialId);
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
                                            nodeType: workflowNodes.find(n => n.name === nodeName)?.type || 'unknown',
                                            executionTime: run.executionTime || 0,
                                            startTime: run.startTime || 0,
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
                        // Skip failed execution details
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
            setError('Failed to load execution data');
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
            case 'success': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
            case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'running': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
            default: return <Clock className="w-4 h-4 text-yellow-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'rgba(34, 197, 94, 0.1)';
            case 'error': return 'rgba(239, 68, 68, 0.1)';
            case 'running': return 'rgba(59, 130, 246, 0.1)';
            default: return 'rgba(234, 179, 8, 0.1)';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (start: string, end?: string) => {
        if (!end) return 'Running...';
        const duration = new Date(end).getTime() - new Date(start).getTime();
        if (duration < 1000) return `${duration}ms`;
        return `${(duration / 1000).toFixed(1)}s`;
    };

    const renderNodeRun = (node: NodeRun, execId: string, index: number) => {
        const nodeKey = `${execId}-${node.nodeName}`;
        const isExpanded = expandedNodes.has(nodeKey);
        const nodeTypeShort = node.nodeType.split('.').pop() || node.nodeType;

        return (
            <div key={nodeKey} className="border-l-2 pl-4 ml-2" style={{ borderColor: node.error ? '#ef4444' : '#22c55e' }}>
                <button
                    onClick={() => toggleNode(nodeKey)}
                    className="w-full flex items-center justify-between py-2 hover:bg-white/[0.02] rounded-lg px-2 -ml-2 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: node.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)' }}>
                            {node.error ? (
                                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                            ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-white">{node.nodeName}</p>
                            <div className="flex items-center gap-2 text-xs text-white/40">
                                <span>{nodeTypeShort}</span>
                                <span>•</span>
                                <span>{node.executionTime}ms</span>
                            </div>
                        </div>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="py-3 space-y-3">
                                {/* Error */}
                                {node.error ? (
                                    <div>
                                        <label className="text-xs font-medium text-red-400 flex items-center gap-1.5 mb-1.5">
                                            <AlertCircle className="w-3 h-3" />
                                            Error
                                        </label>
                                        <div className="p-3 rounded-lg text-xs text-red-300" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                            {String(node.error)}
                                        </div>
                                    </div>
                                ) : null}

                                {/* Input Data */}
                                {node.inputData ? (
                                    <div>
                                        <label className="text-xs font-medium text-blue-400 flex items-center gap-1.5 mb-1.5">
                                            <ArrowRight className="w-3 h-3" />
                                            Input
                                        </label>
                                        <pre className="p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-40"
                                            style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#93c5fd' }}>
                                            {JSON.stringify(node.inputData, null, 2)}
                                        </pre>
                                    </div>
                                ) : null}

                                {/* Output Data */}
                                {node.outputData ? (
                                    <div>
                                        <label className="text-xs font-medium text-green-400 flex items-center gap-1.5 mb-1.5">
                                            <Database className="w-3 h-3" />
                                            Output
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

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-3xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    style={{
                        background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.98) 0%, rgba(13, 13, 18, 0.98) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: workflow.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}>
                                <Zap className="w-6 h-6" style={{ color: workflow.active ? '#22c55e' : '#666' }} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                                <div className="flex items-center gap-3 text-xs text-white/40">
                                    <span>{workflowNodes.length} nodes</span>
                                    <span>•</span>
                                    <span className={workflow.active ? 'text-green-400' : 'text-red-400'}>
                                        {workflow.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onExecute}
                                className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff' }}
                            >
                                <Play className="w-4 h-4" />
                                Execute
                            </button>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <X className="w-5 h-5 text-white/40" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-white/70 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Execution History
                            </h4>
                            <button
                                onClick={loadData}
                                disabled={isLoading}
                                className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1.5 transition-colors"
                            >
                                <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-3" />
                                <p className="text-sm text-white/40">Loading executions...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        ) : executions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                                    style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                                    <Clock className="w-8 h-8 text-white/20" />
                                </div>
                                <p className="text-sm text-white/40">No executions yet</p>
                                <p className="text-xs text-white/30 mt-1">Run this workflow to see execution history</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {executions.map((exec, index) => {
                                    const isExpanded = expandedExecutions.has(exec.id);

                                    return (
                                        <motion.div
                                            key={exec.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="rounded-xl overflow-hidden"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.02)',
                                                border: '1px solid rgba(255, 255, 255, 0.04)'
                                            }}
                                        >
                                            {/* Execution Header */}
                                            <button
                                                onClick={() => toggleExecution(exec.id)}
                                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                                                        style={{ background: getStatusColor(exec.status) }}>
                                                        {getStatusIcon(exec.status)}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-white">
                                                                {exec.status.charAt(0).toUpperCase() + exec.status.slice(1)}
                                                            </span>
                                                            <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/40">
                                                                {exec.mode}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-white/40">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{formatDate(exec.startedAt)}</span>
                                                            <span>•</span>
                                                            <span>{formatDuration(exec.startedAt, exec.stoppedAt)}</span>
                                                            <span>•</span>
                                                            <span>{exec.nodeRuns.length} nodes</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronDown className="w-5 h-5 text-white/30" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-white/30" />
                                                )}
                                            </button>

                                            {/* Execution Details */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-4 pb-4 pt-2 border-t border-white/[0.04]">
                                                            {exec.error && (
                                                                <div className="mb-4 p-3 rounded-lg"
                                                                    style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                                                    <p className="text-xs font-medium text-red-400 mb-1">Execution Error</p>
                                                                    <p className="text-xs text-red-300">{exec.error}</p>
                                                                </div>
                                                            )}

                                                            {exec.nodeRuns.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-medium text-white/50 mb-3 flex items-center gap-1.5">
                                                                        <Code2 className="w-3.5 h-3.5" />
                                                                        Node Details
                                                                    </p>
                                                                    {exec.nodeRuns.map((node, idx) => renderNodeRun(node, exec.id, idx))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-white/30 italic py-2">
                                                                    No detailed node data available
                                                                </p>
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
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
