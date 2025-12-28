'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, AlertCircle, Wrench, Sparkles, ExternalLink, Copy, Check } from 'lucide-react';
import { repairNode, improveNode, applyNodeFix, RepairSuggestion, ImproveSuggestion } from '@/lib/api';

interface NodeData {
    nodeName: string;
    nodeType: string;
    nodeParameters?: Record<string, unknown>;
    inputData?: unknown;
    outputData?: unknown;
    error?: string;
}

interface AIRepairModalProps {
    mode: 'repair' | 'improve';
    node: NodeData;
    credentialId: string;
    workflowId: string;
    onClose: () => void;
    onApplied?: () => void;
}

export default function AIRepairModal({ mode, node, credentialId, workflowId, onClose, onApplied }: AIRepairModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [repairSuggestion, setRepairSuggestion] = useState<RepairSuggestion | null>(null);
    const [improveSuggestion, setImproveSuggestion] = useState<ImproveSuggestion | null>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [applied, setApplied] = useState(false);

    const analyze = async () => {
        setIsLoading(true);
        setError('');

        try {
            if (mode === 'repair' && node.error) {
                const res = await repairNode(
                    credentialId,
                    node.nodeName,
                    node.nodeType,
                    node.error,
                    node.nodeParameters,
                    node.inputData
                );
                if (res.data?.suggestion) {
                    setRepairSuggestion(res.data.suggestion);
                } else if (res.error) {
                    setError(res.error.message);
                }
            } else {
                const res = await improveNode(
                    node.nodeName,
                    node.nodeType,
                    node.nodeParameters,
                    node.inputData,
                    node.outputData
                );
                if (res.data?.suggestion) {
                    setImproveSuggestion(res.data.suggestion);
                } else if (res.error) {
                    setError(res.error.message);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to analyze node');
        }

        setIsLoading(false);
    };

    const handleApplyFix = async () => {
        if (!repairSuggestion?.suggestedFix.parameters) return;

        setIsApplying(true);
        try {
            const res = await applyNodeFix(
                credentialId,
                workflowId,
                node.nodeName,
                repairSuggestion.suggestedFix.parameters
            );
            if (res.data?.success) {
                setApplied(true);
                onApplied?.();
            } else if (res.error) {
                setError(res.error.message);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to apply fix');
        }
        setIsApplying(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high': return '#22c55e';
            case 'medium': return '#f59e0b';
            case 'low': return '#ef4444';
            default: return '#888';
        }
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
                    className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
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
                                style={{ background: mode === 'repair' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)' }}>
                                {mode === 'repair' ? (
                                    <Wrench className="w-5 h-5 text-red-400" />
                                ) : (
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">
                                    {mode === 'repair' ? 'AI Repair' : 'AI Improve'}
                                </h3>
                                <p className="text-xs text-white/40">{node.nodeName}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <X className="w-5 h-5 text-white/40" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        {/* Error Display */}
                        {mode === 'repair' && node.error && (
                            <div className="mb-5 p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                <p className="text-xs font-medium text-red-400 mb-1">Error Message</p>
                                <p className="text-sm text-red-300">{node.error}</p>
                            </div>
                        )}

                        {/* Initial State - Start Analysis */}
                        {!isLoading && !repairSuggestion && !improveSuggestion && !error && (
                            <div className="text-center py-10">
                                <p className="text-white/60 mb-6">
                                    {mode === 'repair'
                                        ? 'سيقوم الذكاء الاصطناعي بتحليل الخطأ والبحث في وثائق الخدمة المستضافة لاقتراح إصلاح'
                                        : 'سيقوم الذكاء الاصطناعي بتحليل هذه النود واقتراح تحسينات'}
                                </p>
                                <button
                                    onClick={analyze}
                                    className="px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105"
                                    style={{
                                        background: mode === 'repair'
                                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                            : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                        boxShadow: mode === 'repair'
                                            ? '0 4px 20px rgba(239, 68, 68, 0.3)'
                                            : '0 4px 20px rgba(139, 92, 246, 0.3)'
                                    }}
                                >
                                    {mode === 'repair' ? '🔧 تحليل وإصلاح' : '✨ تحليل وتحسين'}
                                </button>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="text-center py-12">
                                <Loader2 className="w-10 h-10 animate-spin text-purple-400 mx-auto mb-4" />
                                <p className="text-white/60">
                                    {mode === 'repair'
                                        ? 'جاري البحث في وثائق الخدمة وتحليل الخطأ...'
                                        : 'جاري تحليل النود للتحسينات...'}
                                </p>
                                <p className="text-xs text-white/30 mt-2">قد يستغرق هذا 15-45 ثانية (sonar-reasoning-pro)</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="text-center py-10">
                                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                                <p className="text-red-400 mb-4">{error}</p>
                                <button
                                    onClick={analyze}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    حاول مرة أخرى
                                </button>
                            </div>
                        )}

                        {/* Repair Suggestion */}
                        {repairSuggestion && (
                            <div className="space-y-4">
                                {applied ? (
                                    <div className="text-center py-8">
                                        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                                        <h4 className="text-xl font-semibold text-white mb-2">تم تطبيق الإصلاح!</h4>
                                        <p className="text-white/60">تم تحديث النود. أعد تشغيل الـ workflow للاختبار.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Service & Research Steps */}
                                        {repairSuggestion.service && (
                                            <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                                                <p className="text-xs text-blue-400">
                                                    🔍 الخدمة المكتشفة: <strong>{repairSuggestion.service}</strong>
                                                </p>
                                                {repairSuggestion.researchSteps && (
                                                    <div className="mt-2 text-xs text-white/40">
                                                        {repairSuggestion.researchSteps.map((step, i) => (
                                                            <p key={i}>✓ {step}</p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Summary */}
                                        <div className="p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.08)' }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-green-400">ملخص الإصلاح</h4>
                                                <span
                                                    className="text-xs px-2 py-1 rounded font-medium"
                                                    style={{
                                                        background: `${getConfidenceColor(repairSuggestion.confidence)}20`,
                                                        color: getConfidenceColor(repairSuggestion.confidence)
                                                    }}
                                                >
                                                    ثقة {repairSuggestion.confidence === 'high' ? 'عالية' : repairSuggestion.confidence === 'medium' ? 'متوسطة' : 'منخفضة'}
                                                </span>
                                            </div>
                                            <p className="text-white/80">{repairSuggestion.summary}</p>
                                        </div>

                                        {/* Explanation */}
                                        <div>
                                            <h4 className="text-sm font-medium text-white/70 mb-2">الشرح</h4>
                                            <p className="text-sm text-white/60 whitespace-pre-wrap">{repairSuggestion.explanation}</p>
                                        </div>

                                        {/* Suggested Parameters */}
                                        {repairSuggestion.suggestedFix.parameters && (
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-medium text-white/70">الإعدادات المقترحة</h4>
                                                    <button
                                                        onClick={() => copyToClipboard(JSON.stringify(repairSuggestion.suggestedFix.parameters, null, 2))}
                                                        className="text-xs flex items-center gap-1 text-white/40 hover:text-white/60"
                                                    >
                                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                        {copied ? 'تم النسخ!' : 'نسخ'}
                                                    </button>
                                                </div>
                                                <pre className="p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-48"
                                                    style={{ background: 'rgba(0, 0, 0, 0.3)', color: '#86efac' }}>
                                                    {JSON.stringify(repairSuggestion.suggestedFix.parameters, null, 2)}
                                                </pre>
                                            </div>
                                        )}

                                        {/* Documentation */}
                                        {repairSuggestion.documentation && (
                                            <details className="group">
                                                <summary className="text-sm font-medium text-white/70 cursor-pointer flex items-center gap-2">
                                                    <ExternalLink className="w-4 h-4" />
                                                    بحث الوثائق
                                                </summary>
                                                <div className="mt-2 p-3 rounded-lg text-xs text-white/50 max-h-48 overflow-y-auto"
                                                    style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                                                    {repairSuggestion.documentation}
                                                </div>
                                            </details>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Improve Suggestion */}
                        {improveSuggestion && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.08)' }}>
                                    <h4 className="font-medium text-purple-400 mb-2">الملخص</h4>
                                    <p className="text-white/80">{improveSuggestion.summary}</p>
                                </div>

                                {improveSuggestion.improvements.map((imp, idx) => (
                                    <div key={idx} className="p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                                        <h4 className="font-medium text-white mb-1">{imp.title}</h4>
                                        <p className="text-sm text-white/60 mb-2">{imp.description}</p>
                                        {imp.implementation && (
                                            <pre className="p-2 rounded-lg text-xs font-mono text-blue-300"
                                                style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                                                {imp.implementation}
                                            </pre>
                                        )}
                                    </div>
                                ))}

                                {improveSuggestion.performance && (
                                    <div className="p-3 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.08)' }}>
                                        <h4 className="text-xs font-medium text-green-400 mb-1">⚡ الأداء</h4>
                                        <p className="text-sm text-white/60">{improveSuggestion.performance}</p>
                                    </div>
                                )}

                                {improveSuggestion.security && (
                                    <div className="p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
                                        <h4 className="text-xs font-medium text-red-400 mb-1">🔒 الأمان</h4>
                                        <p className="text-sm text-white/60">{improveSuggestion.security}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {repairSuggestion && !applied && repairSuggestion.suggestedFix.parameters && (
                        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl font-medium text-white/60 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleApplyFix}
                                disabled={isApplying}
                                className="flex-1 py-3 rounded-xl font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                            >
                                {isApplying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        جاري التطبيق...
                                    </>
                                ) : (
                                    <>
                                        <Wrench className="w-4 h-4" />
                                        تطبيق الإصلاح (MCP)
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
