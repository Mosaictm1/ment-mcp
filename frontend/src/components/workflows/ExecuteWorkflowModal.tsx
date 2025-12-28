'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface Workflow {
    id: string;
    name: string;
    active: boolean;
    nodes?: unknown[];
}

interface ExecuteWorkflowModalProps {
    workflow: Workflow;
    onClose: () => void;
    onExecute: (workflowId: string, data?: Record<string, unknown>) => Promise<{ success: boolean; executionId?: string; error?: string }>;
}

export default function ExecuteWorkflowModal({ workflow, onClose, onExecute }: ExecuteWorkflowModalProps) {
    const [inputData, setInputData] = useState('{}');
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; executionId?: string; error?: string } | null>(null);
    const [parseError, setParseError] = useState('');

    const handleExecute = async () => {
        setParseError('');
        setResult(null);

        // Validate JSON
        let data: Record<string, unknown> = {};
        try {
            if (inputData.trim() !== '' && inputData.trim() !== '{}') {
                data = JSON.parse(inputData);
            }
        } catch (e) {
            setParseError('Invalid JSON format. Please check your input.');
            return;
        }

        setIsExecuting(true);
        const execResult = await onExecute(workflow.id, data);
        setResult(execResult);
        setIsExecuting(false);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-lg rounded-2xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.98) 0%, rgba(13, 13, 18, 0.98) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: workflow.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}>
                                <Play className="w-5 h-5" style={{ color: workflow.active ? '#22c55e' : '#666' }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{workflow.name}</h3>
                                <p className="text-xs text-white/40">{workflow.nodes?.length || 0} nodes · {workflow.active ? 'Active' : 'Inactive'}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5 text-white/40" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5">
                        {result ? (
                            <div className="text-center py-8">
                                {result.success ? (
                                    <>
                                        <motion.div
                                            initial={{ scale: 0.5 }}
                                            animate={{ scale: 1 }}
                                            className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                            style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                                        >
                                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                                        </motion.div>
                                        <h4 className="text-lg font-semibold text-white mb-2">Workflow Executed!</h4>
                                        <p className="text-sm text-white/50 mb-4">
                                            Execution ID: <code className="px-2 py-1 bg-white/5 rounded text-green-400">{result.executionId || 'N/A'}</code>
                                        </p>
                                        <button
                                            onClick={onClose}
                                            className="px-6 py-2.5 rounded-xl font-medium transition-all"
                                            style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.7)' }}
                                        >
                                            Close
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <motion.div
                                            initial={{ scale: 0.5 }}
                                            animate={{ scale: 1 }}
                                            className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                                        >
                                            <AlertCircle className="w-10 h-10 text-red-400" />
                                        </motion.div>
                                        <h4 className="text-lg font-semibold text-white mb-2">Execution Failed</h4>
                                        <p className="text-sm text-red-400 mb-4">{result.error || 'Unknown error occurred'}</p>
                                        <div className="flex gap-3 justify-center">
                                            <button
                                                onClick={() => setResult(null)}
                                                className="px-6 py-2.5 rounded-xl font-medium transition-all"
                                                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff' }}
                                            >
                                                Try Again
                                            </button>
                                            <button
                                                onClick={onClose}
                                                className="px-6 py-2.5 rounded-xl font-medium transition-all"
                                                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.7)' }}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Input Data <span className="text-white/30">(optional JSON)</span>
                                    </label>
                                    <textarea
                                        value={inputData}
                                        onChange={(e) => setInputData(e.target.value)}
                                        placeholder='{"key": "value"}'
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors font-mono text-sm resize-none"
                                    />
                                    {parseError && (
                                        <p className="mt-2 text-sm text-red-400">{parseError}</p>
                                    )}
                                    <p className="mt-2 text-xs text-white/30">
                                        Provide JSON data to pass to the workflow. Leave empty or use {"{ }"} for no input.
                                    </p>
                                </div>

                                {!workflow.active && (
                                    <div className="mb-4 p-4 rounded-xl flex items-start gap-3"
                                        style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.15)' }}>
                                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-yellow-400">This workflow is inactive</p>
                                            <p className="text-xs text-yellow-400/60 mt-1">Inactive workflows may not have triggers enabled. Manual execution should still work.</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {!result && (
                        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-6 rounded-xl font-medium transition-colors"
                                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.6)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExecute}
                                disabled={isExecuting}
                                className="flex-1 py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)'
                                }}
                            >
                                {isExecuting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Executing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5" />
                                        Run Workflow
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
