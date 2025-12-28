'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Loader2, CheckCircle2, AlertCircle, Wrench, Sparkles,
    ExternalLink, Copy, Check, Search, FileText, Zap, ArrowRight,
    Code2, RefreshCw, Brain
} from 'lucide-react';
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

const researchStepsDefault = [
    { id: 1, label: 'قراءة إعدادات الـ Node', icon: FileText, status: 'pending' },
    { id: 2, label: 'تحديد الخدمة/المنصة', icon: Search, status: 'pending' },
    { id: 3, label: 'البحث في الوثائق الرسمية', icon: Brain, status: 'pending' },
    { id: 4, label: 'توليد الإصلاح', icon: Code2, status: 'pending' },
];

export default function AIRepairModal({ mode, node, credentialId, workflowId, onClose, onApplied }: AIRepairModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [repairSuggestion, setRepairSuggestion] = useState<RepairSuggestion | null>(null);
    const [improveSuggestion, setImproveSuggestion] = useState<ImproveSuggestion | null>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [applied, setApplied] = useState(false);
    const [researchSteps, setResearchSteps] = useState(researchStepsDefault);
    const [currentStep, setCurrentStep] = useState(0);

    const simulateResearchProgress = () => {
        const steps = [...researchStepsDefault];
        let step = 0;

        const interval = setInterval(() => {
            if (step < steps.length) {
                steps[step].status = 'active';
                setResearchSteps([...steps]);
                setCurrentStep(step + 1);

                if (step > 0) {
                    steps[step - 1].status = 'done';
                    setResearchSteps([...steps]);
                }
                step++;
            } else {
                clearInterval(interval);
            }
        }, 2000);

        return interval;
    };

    const analyze = async () => {
        setIsLoading(true);
        setError('');
        setResearchSteps(researchStepsDefault.map(s => ({ ...s, status: 'pending' })));

        const progressInterval = simulateResearchProgress();

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
                    setResearchSteps(prev => prev.map(s => ({ ...s, status: 'done' })));
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
                    setResearchSteps(prev => prev.map(s => ({ ...s, status: 'done' })));
                } else if (res.error) {
                    setError(res.error.message);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to analyze node');
        }

        clearInterval(progressInterval);
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

    const getConfidenceStyles = (confidence: string) => {
        switch (confidence) {
            case 'high': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' };
            case 'medium': return { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' };
            case 'low': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
            default: return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(12px)' }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="w-full max-w-3xl rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
                    style={{
                        background: 'linear-gradient(165deg, rgba(30, 27, 75, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        boxShadow: '0 0 80px rgba(139, 92, 246, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Header with gradient */}
                    <div
                        className="px-8 py-6 relative overflow-hidden"
                        style={{
                            background: mode === 'repair'
                                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)'
                        }}
                    >
                        {/* Animated background orbs */}
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-30"
                            style={{ background: mode === 'repair' ? '#ef4444' : '#8b5cf6' }} />
                        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-[60px] opacity-20"
                            style={{ background: '#3b82f6' }} />

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                    style={{
                                        background: mode === 'repair'
                                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
                                            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
                                        border: `1px solid ${mode === 'repair' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`
                                    }}
                                    animate={{ rotate: isLoading ? 360 : 0 }}
                                    transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
                                >
                                    {mode === 'repair' ? (
                                        <Wrench className="w-7 h-7 text-red-400" />
                                    ) : (
                                        <Sparkles className="w-7 h-7 text-purple-400" />
                                    )}
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {mode === 'repair' ? 'إصلاح ذكي بالـ AI' : 'تحسين ذكي بالـ AI'}
                                    </h3>
                                    <p className="text-sm text-white/50 font-mono">{node.nodeName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-xl transition-all hover:bg-white/5 hover:scale-105"
                            >
                                <X className="w-5 h-5 text-white/40" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                        {/* Error Display */}
                        {mode === 'repair' && node.error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-5 rounded-2xl"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">رسالة الخطأ</p>
                                </div>
                                <p className="text-sm text-red-300 font-mono">{node.error}</p>
                            </motion.div>
                        )}

                        {/* Research Steps - Shows during loading or after completion */}
                        {(isLoading || repairSuggestion || improveSuggestion) && (
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                    <Brain className="w-4 h-4" />
                                    خطوات البحث الذكي
                                </p>
                                <div className="grid grid-cols-4 gap-3">
                                    {researchSteps.map((step, idx) => {
                                        const Icon = step.icon;
                                        const isActive = step.status === 'active';
                                        const isDone = step.status === 'done';

                                        return (
                                            <motion.div
                                                key={step.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-4 rounded-xl text-center relative overflow-hidden"
                                                style={{
                                                    background: isDone
                                                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
                                                        : isActive
                                                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)'
                                                            : 'rgba(255, 255, 255, 0.02)',
                                                    border: `1px solid ${isDone ? 'rgba(34, 197, 94, 0.3)' : isActive ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`
                                                }}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-purple-500/10"
                                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    />
                                                )}
                                                <div className="relative">
                                                    {isDone ? (
                                                        <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                                                    ) : isActive ? (
                                                        <Loader2 className="w-6 h-6 text-purple-400 mx-auto mb-2 animate-spin" />
                                                    ) : (
                                                        <Icon className="w-6 h-6 text-white/20 mx-auto mb-2" />
                                                    )}
                                                    <p className={`text-[10px] leading-tight ${isDone ? 'text-green-400' : isActive ? 'text-purple-400' : 'text-white/30'}`}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Initial State - Start Analysis */}
                        {!isLoading && !repairSuggestion && !improveSuggestion && !error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <motion.div
                                    className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                                        border: '1px solid rgba(139, 92, 246, 0.2)'
                                    }}
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Brain className="w-12 h-12 text-purple-400" />
                                </motion.div>
                                <p className="text-white/60 mb-8 max-w-md mx-auto">
                                    {mode === 'repair'
                                        ? 'سيقوم الـ AI بتحليل الخطأ والبحث في وثائق الـ API الرسمية لاقتراح إصلاح دقيق.'
                                        : 'سيقوم الـ AI بتحليل هذا الـ Node واقتراح تحسينات للأداء والأمان.'}
                                </p>
                                <motion.button
                                    onClick={analyze}
                                    className="px-8 py-4 rounded-2xl font-semibold text-white transition-all text-lg"
                                    style={{
                                        background: mode === 'repair'
                                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                            : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                        boxShadow: mode === 'repair'
                                            ? '0 8px 32px rgba(239, 68, 68, 0.35)'
                                            : '0 8px 32px rgba(139, 92, 246, 0.35)'
                                    }}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {mode === 'repair' ? '🔧 بدء التحليل والإصلاح' : '✨ بدء التحليل والتحسين'}
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Error State */}
                        {error && !isLoading && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10"
                            >
                                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    <AlertCircle className="w-10 h-10 text-red-400" />
                                </div>
                                <p className="text-red-400 mb-6">{error}</p>
                                <button
                                    onClick={analyze}
                                    className="px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2 mx-auto transition-all hover:bg-white/10"
                                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    إعادة المحاولة
                                </button>
                            </motion.div>
                        )}

                        {/* Repair Suggestion */}
                        {repairSuggestion && !isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-5"
                            >
                                {applied ? (
                                    <motion.div
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        className="text-center py-12"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', damping: 10 }}
                                        >
                                            <CheckCircle2 className="w-24 h-24 text-green-400 mx-auto mb-6" />
                                        </motion.div>
                                        <h4 className="text-2xl font-bold text-white mb-3">تم تطبيق الإصلاح! ✨</h4>
                                        <p className="text-white/60">تم تحديث الـ Node. أعد تشغيل الـ Workflow للاختبار.</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Summary Card */}
                                        <div
                                            className="p-6 rounded-2xl"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                                                border: '1px solid rgba(34, 197, 94, 0.2)'
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-5 h-5 text-green-400" />
                                                    <h4 className="font-bold text-green-400">ملخص الإصلاح</h4>
                                                </div>
                                                {repairSuggestion.confidence && (
                                                    <span
                                                        className="text-xs px-3 py-1.5 rounded-full font-medium"
                                                        style={getConfidenceStyles(repairSuggestion.confidence)}
                                                    >
                                                        ثقة: {repairSuggestion.confidence === 'high' ? 'عالية' : repairSuggestion.confidence === 'medium' ? 'متوسطة' : 'منخفضة'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-white/90 text-lg">{repairSuggestion.summary}</p>
                                            {(repairSuggestion as any).service && (
                                                <p className="text-sm text-white/50 mt-2 flex items-center gap-2">
                                                    <ExternalLink className="w-4 h-4" />
                                                    الخدمة: <span className="text-purple-400 font-mono">{(repairSuggestion as any).service}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Explanation */}
                                        <div className="p-5 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                                            <h4 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                التفسير
                                            </h4>
                                            <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{repairSuggestion.explanation}</p>
                                        </div>

                                        {/* Suggested Parameters */}
                                        {repairSuggestion.suggestedFix.parameters && (
                                            <div className="p-5 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                                                        <Code2 className="w-4 h-4" />
                                                        الإعدادات المقترحة
                                                    </h4>
                                                    <button
                                                        onClick={() => copyToClipboard(JSON.stringify(repairSuggestion.suggestedFix.parameters, null, 2))}
                                                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/40 hover:text-white/60 transition-colors"
                                                        style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                                                    >
                                                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                        {copied ? 'تم النسخ!' : 'نسخ'}
                                                    </button>
                                                </div>
                                                <pre
                                                    className="p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-56 scrollbar-thin"
                                                    style={{ background: 'rgba(0, 0, 0, 0.3)', color: '#86efac' }}
                                                >
                                                    {JSON.stringify(repairSuggestion.suggestedFix.parameters, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* Improve Suggestion */}
                        {improveSuggestion && !isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-5"
                            >
                                <div
                                    className="p-6 rounded-2xl"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                        border: '1px solid rgba(139, 92, 246, 0.2)'
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                        <h4 className="font-bold text-purple-400">ملخص التحسينات</h4>
                                    </div>
                                    <p className="text-white/90 text-lg">{improveSuggestion.summary}</p>
                                </div>

                                {improveSuggestion.improvements.map((imp, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-5 rounded-xl"
                                        style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                                    >
                                        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                            <ArrowRight className="w-4 h-4 text-purple-400" />
                                            {imp.title}
                                        </h4>
                                        <p className="text-sm text-white/60 mb-3">{imp.description}</p>
                                        {imp.implementation && (
                                            <pre className="p-3 rounded-lg text-xs font-mono text-blue-300" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                                                {imp.implementation}
                                            </pre>
                                        )}
                                    </motion.div>
                                ))}

                                {improveSuggestion.performance && (
                                    <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(34, 197, 94, 0.08)' }}>
                                        <Zap className="w-5 h-5 text-green-400 mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-semibold text-green-400 mb-1">⚡ الأداء</h4>
                                            <p className="text-sm text-white/60">{improveSuggestion.performance}</p>
                                        </div>
                                    </div>
                                )}

                                {improveSuggestion.security && (
                                    <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
                                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-semibold text-red-400 mb-1">🔒 الأمان</h4>
                                            <p className="text-sm text-white/60">{improveSuggestion.security}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Footer - Apply Button */}
                    {repairSuggestion && !applied && repairSuggestion.suggestedFix.parameters && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-8 py-6 border-t border-white/[0.06]"
                            style={{ background: 'rgba(0, 0, 0, 0.2)' }}
                        >
                            <div className="flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-2xl font-medium text-white/60 transition-all hover:bg-white/5"
                                    style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                                >
                                    إلغاء
                                </button>
                                <motion.button
                                    onClick={handleApplyFix}
                                    disabled={isApplying}
                                    className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-3 disabled:opacity-50"
                                    style={{
                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                        boxShadow: '0 8px 32px rgba(34, 197, 94, 0.35)'
                                    }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isApplying ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            جاري التطبيق...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5" />
                                            تطبيق الإصلاح على n8n
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
