'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { getApiKeys, createApiKey, deleteApiKey } from '@/lib/api';

interface ApiKey {
    id: string;
    name: string;
    keyPrefix: string;
    createdAt: string;
    lastUsedAt: string | null;
    isActive: boolean;
}

const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const CopyIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export default function ApiKeysPage() {
    const router = useRouter();
    const { isLoading, isAuthenticated } = useAuth();
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKey, setNewKey] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    const loadApiKeys = async () => {
        const res = await getApiKeys();
        if (res.data) {
            setApiKeys(res.data.apiKeys);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadApiKeys();
        }
    }, [isAuthenticated]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);

        const result = await createApiKey(newKeyName);

        if (result.error) {
            setError(result.error.message);
        } else if (result.data) {
            setNewKey(result.data.key);
            setNewKeyName('');
            loadApiKeys();
        }

        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this API key?')) return;

        const result = await deleteApiKey(id);
        if (result.data?.success) {
            loadApiKeys();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    };

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
                <div className="w-12 h-12 rounded-xl animate-pulse" style={{ background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: '#0A0A0F' }}>
            <Sidebar />

            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="sticky top-0 z-10 px-8 py-6 backdrop-blur-xl" style={{ background: 'rgba(10, 10, 15, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="text-3xl">🔑</span>
                                API Keys
                            </h1>
                            <p className="text-white/40 text-sm mt-1">Authenticate MCP tools from AI assistants</p>
                        </div>
                        {!isCreating && !newKey && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                                style={{ background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)', color: '#0A0A0F' }}
                            >
                                <PlusIcon />
                                Create Key
                            </button>
                        )}
                    </div>
                </header>

                <div className="px-8 py-6 max-w-4xl">
                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <span className="text-xl">⚠️</span>
                            <span className="text-red-400">{error}</span>
                        </div>
                    )}

                    {/* New Key Created */}
                    {newKey && (
                        <div className="mb-6 p-6 rounded-2xl" style={{ background: 'rgba(87, 217, 87, 0.08)', border: '1px solid rgba(87, 217, 87, 0.2)' }}>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: '#57D957' }}>
                                <span>🎉</span> API Key Created!
                            </h3>
                            <p className="text-white/50 text-sm mb-4">Copy this key now — you won&apos;t be able to see it again!</p>
                            <div className="flex items-center gap-3">
                                <code className="flex-1 p-4 rounded-xl text-sm font-mono break-all" style={{ background: 'rgba(0,0,0,0.3)', color: '#57D957' }}>
                                    {newKey}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(newKey)}
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200"
                                    style={{
                                        background: copiedKey ? 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)' : 'rgba(87, 217, 87, 0.15)',
                                        color: copiedKey ? '#0A0A0F' : '#57D957',
                                    }}
                                >
                                    <CopyIcon />
                                    {copiedKey ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <button
                                onClick={() => { setNewKey(null); setIsCreating(false); }}
                                className="mt-4 text-sm font-medium hover:underline"
                                style={{ color: '#57D957' }}
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {/* Create Form */}
                    {isCreating && !newKey && (
                        <div className="mb-6 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.8) 0%, rgba(15, 15, 22, 0.9) 100%)', border: '1px solid rgba(87, 217, 87, 0.2)' }}>
                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <span>🔑</span> Create New API Key
                            </h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">Key Name <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="e.g., Claude Desktop, Cursor IDE"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#57D957]/50 transition-colors"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)', color: '#0A0A0F' }}
                                    >
                                        {isSaving ? 'Creating...' : 'Create Key'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-6 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Keys List */}
                    <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.8) 0%, rgba(15, 15, 22, 0.9) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h2 className="text-lg font-semibold text-white mb-6">Your API Keys</h2>

                        {apiKeys.length > 0 ? (
                            <div className="space-y-3">
                                {apiKeys.map((key) => (
                                    <div key={key.id} className="p-4 rounded-xl flex items-center justify-between transition-all duration-200 hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                                                <span className="text-2xl">🔐</span>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">{key.name}</h3>
                                                <p className="text-sm text-white/30 font-mono">{key.keyPrefix}••• · Created {new Date(key.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    background: key.isActive ? 'rgba(87, 217, 87, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                    color: key.isActive ? '#57D957' : '#EF4444',
                                                }}
                                            >
                                                {key.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(key.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-500/20"
                                                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !isCreating && (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🔑</div>
                                    <h3 className="text-lg font-medium text-white mb-2">No API keys yet</h3>
                                    <p className="text-white/40 text-sm mb-6">Create your first API key to use MCP tools</p>
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                                        style={{ background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)', color: '#0A0A0F' }}
                                    >
                                        <PlusIcon />
                                        Create API Key
                                    </button>
                                </div>
                            )
                        )}
                    </div>

                    {/* Usage Guide */}
                    <div className="mt-6 p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
                            <span>📖</span> How to Use
                        </h3>
                        <pre className="p-4 rounded-xl text-sm overflow-x-auto font-mono" style={{ background: 'rgba(0,0,0,0.3)', color: '#57D957' }}>
                            {`// Add to your AI assistant's MCP config
headers: {
  "X-API-Key": "your-api-key-here"
}`}
                        </pre>
                    </div>
                </div>
            </main>
        </div>
    );
}
