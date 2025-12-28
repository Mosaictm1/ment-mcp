'use client';

import { motion } from 'framer-motion';
import { Zap, Play, ToggleLeft, ToggleRight, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Execution {
    id: string;
    status: 'success' | 'error' | 'running' | 'waiting';
    startedAt?: string;
}

interface WorkflowCardProps {
    workflow: {
        id: string;
        name: string;
        active: boolean;
        nodes?: unknown[];
        createdAt?: string;
        updatedAt?: string;
    };
    executions?: Execution[];
    isRunning?: boolean;
    onRun: () => void;
    onToggle?: () => void;
    index?: number;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'success': return '#22c55e';
        case 'error': return '#ef4444';
        case 'running': return '#3b82f6';
        case 'waiting': return '#f59e0b';
        default: return '#666';
    }
};

export default function WorkflowCard({ workflow, executions = [], isRunning, onRun, onToggle, index = 0 }: WorkflowCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative p-5 rounded-2xl transition-all duration-300 hover:translate-y-[-4px] cursor-pointer"
            style={{
                background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.95) 0%, rgba(13, 13, 18, 0.98) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
        >
            {/* Hover glow effect */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                style={{ background: workflow.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(139, 92, 246, 0.1)' }}
            />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{
                            background: workflow.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                            boxShadow: workflow.active ? '0 0 20px rgba(34, 197, 94, 0.2)' : 'none'
                        }}
                    >
                        <Zap className="w-6 h-6" style={{ color: workflow.active ? '#22c55e' : '#666' }} />
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); onRun(); }}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all opacity-0 group-hover:opacity-100 hover:scale-105 disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            color: '#fff',
                            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)'
                        }}
                    >
                        <Play className="w-4 h-4" />
                        {isRunning ? 'Running...' : 'Run'}
                    </button>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-white mb-2 truncate text-lg">{workflow.name}</h3>

                {/* Status & Meta */}
                <div className="flex items-center gap-3 mb-4">
                    <span
                        className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5"
                        style={{
                            background: workflow.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: workflow.active ? '#22c55e' : '#ef4444'
                        }}
                    >
                        {workflow.active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {workflow.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-white/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        {workflow.nodes?.length || 0} nodes
                    </span>
                </div>

                {/* Recent Executions */}
                {executions.length > 0 && (
                    <div className="pt-4 border-t border-white/[0.04]">
                        <p className="text-xs text-white/40 mb-3 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Recent executions
                        </p>
                        <div className="flex gap-2">
                            {executions.slice(0, 6).map((exec, i) => (
                                <div
                                    key={exec.id || i}
                                    className="relative group/exec"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full transition-transform duration-200 group-hover/exec:scale-125"
                                        style={{ background: getStatusColor(exec.status) }}
                                    />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/90 text-[10px] text-white whitespace-nowrap opacity-0 group-hover/exec:opacity-100 transition-opacity pointer-events-none">
                                        {exec.status}
                                        {exec.startedAt && (
                                            <span className="text-white/50"> · {new Date(exec.startedAt).toLocaleTimeString()}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Updated time */}
                {workflow.updatedAt && (
                    <p className="text-[10px] text-white/20 mt-3">
                        Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
