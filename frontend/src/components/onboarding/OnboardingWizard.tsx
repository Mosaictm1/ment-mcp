'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, Loader2, ExternalLink, HelpCircle, Server, Key, Play } from 'lucide-react';

interface OnboardingWizardProps {
    onComplete: () => void;
    onAddInstance: (instanceUrl: string, apiKey: string, name?: string) => Promise<{ success: boolean; error?: string }>;
    onVerify: (credentialId: string) => Promise<{ verified: boolean }>;
}

type Step = 'welcome' | 'connect' | 'verifying' | 'success';

export default function OnboardingWizard({ onComplete, onAddInstance, onVerify }: OnboardingWizardProps) {
    const [step, setStep] = useState<Step>('welcome');
    const [instanceUrl, setInstanceUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [instanceName, setInstanceName] = useState('');
    const [error, setError] = useState('');
    const [credentialId, setCredentialId] = useState<string | null>(null);

    const handleConnect = async () => {
        setError('');

        if (!instanceUrl.startsWith('https://')) {
            setError('Instance URL must use HTTPS');
            return;
        }

        if (!apiKey.trim()) {
            setError('API Key is required');
            return;
        }

        setStep('verifying');

        try {
            const result = await onAddInstance(instanceUrl, apiKey, instanceName || undefined);
            if (!result.success) {
                setError(result.error || 'Failed to add instance');
                setStep('connect');
                return;
            }

            // Simulate a brief delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1500));
            setStep('success');
        } catch (err) {
            setError('Failed to connect to n8n instance');
            setStep('connect');
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const handleFinish = () => {
        onComplete();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)' }}>
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                        top: '10%', left: '10%',
                        animation: 'float 20s ease-in-out infinite'
                    }} />
                <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%)',
                        bottom: '10%', right: '10%',
                        animation: 'float 25s ease-in-out infinite reverse'
                    }} />
            </div>

            <AnimatePresence mode="wait">
                {step === 'welcome' && (
                    <motion.div
                        key="welcome"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10 text-center max-w-lg"
                    >
                        {/* Logo/Icon */}
                        <motion.div
                            className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        >
                            <Sparkles className="w-12 h-12 text-purple-400" />
                        </motion.div>

                        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 bg-clip-text text-transparent">
                            Welcome to Ment! 🎉
                        </h1>

                        <p className="text-lg text-white/60 mb-8">
                            Let&apos;s connect your n8n instance to unlock powerful workflow automation. This will only take a minute.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setStep('connect')}
                                className="w-full py-4 px-6 rounded-xl font-medium text-white transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)'
                                }}
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <button
                                onClick={handleSkip}
                                className="py-3 px-6 rounded-xl font-medium text-white/40 hover:text-white/60 transition-colors"
                            >
                                Skip for now
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'connect' && (
                    <motion.div
                        key="connect"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10 w-full max-w-lg"
                    >
                        <div className="p-8 rounded-2xl backdrop-blur-xl"
                            style={{
                                background: 'rgba(17, 17, 24, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}>

                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-1">Add n8n Instance</h2>
                                    <p className="text-sm text-white/50">
                                        Connect your n8n instance by providing the URL and API key. The connection will be validated before saving.
                                    </p>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="mb-6 p-4 rounded-xl flex items-center gap-3"
                                style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                                    <Play className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-white/70">First time connecting? Watch our quick setup guide</p>
                                </div>
                                <a href="https://docs.n8n.io/api/" target="_blank" rel="noopener noreferrer"
                                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 flex-shrink-0">
                                    Watch Video <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-4 rounded-xl"
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Form */}
                            <div className="space-y-5">
                                {/* Instance Name (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Instance Name <span className="text-white/30">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={instanceName}
                                        onChange={(e) => setInstanceName(e.target.value)}
                                        placeholder="My n8n Cloud"
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors"
                                    />
                                </div>

                                {/* Instance URL */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Instance URL
                                    </label>
                                    <input
                                        type="url"
                                        value={instanceUrl}
                                        onChange={(e) => setInstanceUrl(e.target.value)}
                                        placeholder="https://n8n.example.com"
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors"
                                    />
                                    <p className="mt-2 text-xs text-white/40">
                                        The public URL where your n8n instance is running (must use HTTPS).
                                        <br />
                                        Need n8n? <a href="https://n8n.io/cloud" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">Get n8n Cloud</a> (Starter+ required) or <a href="https://docs.n8n.io/hosting/" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">self-host</a> (free).
                                    </p>
                                </div>

                                {/* API Key */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        n8n API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="Enter your n8n API key"
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors"
                                    />
                                    <p className="mt-2 text-xs text-white/40">
                                        Find this in your n8n instance: <span className="text-white/60">Settings → API → Create new API key</span>.
                                        <br />
                                        Need help? <a href="https://docs.n8n.io/api/authentication/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1">Watch video <ExternalLink className="w-3 h-3" /></a>
                                    </p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setStep('welcome')}
                                    className="flex-1 py-3 px-6 rounded-xl font-medium transition-colors"
                                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.6)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConnect}
                                    disabled={!instanceUrl || !apiKey}
                                    className="flex-1 py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                                    style={{
                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                        boxShadow: instanceUrl && apiKey ? '0 4px 20px rgba(34, 197, 94, 0.3)' : 'none'
                                    }}
                                >
                                    Add Instance
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'verifying' && (
                    <motion.div
                        key="verifying"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10 text-center"
                    >
                        <div className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%)',
                                border: '1px solid rgba(34, 197, 94, 0.3)'
                            }}>
                            <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
                        </div>

                        <h2 className="text-2xl font-semibold text-white mb-3">Connecting to n8n...</h2>
                        <p className="text-white/50">Verifying your credentials and testing the connection</p>
                    </motion.div>
                )}

                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10 text-center max-w-lg"
                    >
                        <motion.div
                            className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%)',
                                border: '1px solid rgba(34, 197, 94, 0.3)'
                            }}
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                            <CheckCircle2 className="w-12 h-12 text-green-400" />
                        </motion.div>

                        <h2 className="text-3xl font-bold text-white mb-3">You&apos;re all set! 🚀</h2>
                        <p className="text-lg text-white/60 mb-8">
                            Your n8n instance is connected. You can now view and run your workflows directly from Ment.
                        </p>

                        <button
                            onClick={handleFinish}
                            className="py-4 px-8 rounded-xl font-medium text-white transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 mx-auto"
                            style={{
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)'
                            }}
                        >
                            View My Workflows
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    25% { transform: translateY(-20px) translateX(20px); }
                    50% { transform: translateY(-10px) translateX(-10px); }
                    75% { transform: translateY(-30px) translateX(10px); }
                }
            `}</style>
        </div>
    );
}
