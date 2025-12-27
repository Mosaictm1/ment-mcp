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
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const KeyIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
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
        if (!isLoading && !isAuthenticated) router.push('/login');
    }, [isLoading, isAuthenticated, router]);

    const loadApiKeys = async () => {
        const res = await getApiKeys();
        if (res.data) setApiKeys(res.data.apiKeys);
    };

    useEffect(() => {
        if (isAuthenticated) loadApiKeys();
    }, [isAuthenticated]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setIsSaving(true);
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
        if (!confirm('Delete this API key?')) return;
        const result = await deleteApiKey(id);
        if (result.data?.success) loadApiKeys();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    };

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 100%)' }}>
                <div className="w-12 h-12 rounded-xl animate-pulse" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)' }}>
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <header className="px-8 pt-8 pb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">API Keys</h1>
                            <p className="text-sm text-white/40 mt-1">Authenticate your AI assistants</p>
                        </div>
                        {!isCreating && !newKey && (
                            <button onClick={() => setIsCreating(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
                                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)' }}>
                                <PlusIcon />
                                Create Key
                            </button>
                        )}
                    </div>
                </header>

                <div className="px-8 pb-8 max-w-4xl">
                    {error && (
                        <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                            <span className="text-red-400">{error}</span>
                        </div>
                    )}

                    {newKey && (
                        <div className="mb-6 p-6 rounded-2xl" style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                            <h3 className="text-lg font-semibold mb-2" style={{ color: '#22c55e' }}>🎉 API Key Created!</h3>
                            <p className="text-sm text-white/50 mb-4">Copy now — you won&apos;t see it again</p>
                            <div className="flex items-center gap-3">
                                <code className="flex-1 p-4 rounded-xl text-sm font-mono break-all" style={{ background: 'rgba(0,0,0,0.2)', color: '#22c55e' }}>{newKey}</code>
                                <button onClick={() => copyToClipboard(newKey)}
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all"
                                    style={{ background: copiedKey ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'rgba(34, 197, 94, 0.1)', color: copiedKey ? '#fff' : '#22c55e' }}>
                                    <CopyIcon />{copiedKey ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <button onClick={() => { setNewKey(null); setIsCreating(false); }} className="mt-4 text-sm font-medium" style={{ color: '#22c55e' }}>Done</button>
                        </div>
                    )}

                    {isCreating && !newKey && (
                        <div className="mb-6 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                            <h3 className="text-lg font-semibold text-white mb-6">Create New API Key</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/50 mb-2">Key Name <span className="text-red-400">*</span></label>
                                    <input type="text" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g., Claude Desktop" required
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/25 focus:outline-none focus:border-[#22c55e]/40 transition-colors" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="submit" disabled={isSaving}
                                        className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff' }}>
                                        {isSaving ? 'Creating...' : 'Create Key'}
                                    </button>
                                    <button type="button" onClick={() => setIsCreating(false)}
                                        className="px-6 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-white/60 hover:bg-white/10 transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        {apiKeys.length > 0 ? (
                            <div className="divide-y divide-white/[0.03]">
                                {apiKeys.map((key) => (
                                    <div key={key.id} className="p-5 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                                <KeyIcon />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">{key.name}</h3>
                                                <p className="text-sm text-white/30 font-mono">{key.keyPrefix}•••••••</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className="px-2.5 py-1 rounded-md text-xs font-medium"
                                                    style={{ background: key.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: key.isActive ? '#22c55e' : '#ef4444' }}>
                                                    {key.isActive ? '● Active' : '○ Inactive'}
                                                </span>
                                                <p className="text-xs text-white/25 mt-1">
                                                    {key.lastUsedAt ? `Used ${new Date(key.lastUsedAt).toLocaleDateString()}` : 'Never used'}
                                                </p>
                                            </div>
                                            <button onClick={() => handleDelete(key.id)}
                                                className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                                                style={{ color: '#ef4444' }}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !isCreating && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
                                    <KeyIcon />
                                </div>
                                <h3 className="text-base font-medium text-white mb-2">No API keys yet</h3>
                                <p className="text-sm text-white/40 mb-6 max-w-xs mx-auto">Create keys to let AI assistants use MCP tools</p>
                                <button onClick={() => setIsCreating(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                                    style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)' }}>
                                    <PlusIcon />
                                    Create API Key
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 p-5 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <h3 className="text-sm font-medium text-white/50 mb-3">📖 How to Use</h3>
                        <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ background: 'rgba(0,0,0,0.2)', color: '#22c55e' }}>
                            {`headers: {
  "X-API-Key": "your-api-key-here"
}`}
                        </pre>
                    </div>
                </div>
            </main>
        </div>
    );
}
