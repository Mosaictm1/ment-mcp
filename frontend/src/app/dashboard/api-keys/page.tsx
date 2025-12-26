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
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-dark)' }}>
                <div className="flex items-center gap-3 text-[var(--text-muted)]">
                    <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xl">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-dark)' }}>
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-4xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <span className="text-4xl">🔑</span>
                            API Keys
                        </h1>
                        <p className="text-[var(--text-muted)]">
                            Use API keys to authenticate MCP tools from AI assistants
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3 animate-fade-in">
                            <span className="text-xl">⚠️</span>
                            {error}
                        </div>
                    )}

                    {/* New Key Display */}
                    {newKey && (
                        <div className="mb-6 p-6 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl animate-fade-in">
                            <h3 className="text-[var(--primary)] font-semibold mb-2 flex items-center gap-2">
                                <span className="text-xl">🎉</span>
                                API Key Created!
                            </h3>
                            <p className="text-[var(--primary-light)] text-sm mb-4">
                                Copy this key now - you won&apos;t be able to see it again!
                            </p>
                            <div className="flex items-center gap-3">
                                <code className="flex-1 p-4 bg-[var(--bg-dark)] rounded-xl text-[var(--primary)] text-sm break-all font-mono border border-[var(--border-dark)]">
                                    {newKey}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(newKey)}
                                    className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${copiedKey
                                            ? 'bg-[var(--primary)] text-[var(--bg-dark)]'
                                            : 'bg-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)]/30'
                                        }`}
                                >
                                    {copiedKey ? (
                                        <>
                                            <span>✓</span>
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <span>📋</span>
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    setNewKey(null);
                                    setIsCreating(false);
                                }}
                                className="mt-4 text-[var(--primary)] hover:text-[var(--primary-light)] text-sm font-medium transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {/* API Keys Card */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Your API Keys</h2>
                            {!isCreating && !newKey && (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-[var(--bg-dark)] rounded-xl font-medium transition-all duration-200"
                                >
                                    + Create New Key
                                </button>
                            )}
                        </div>

                        {/* Create Form */}
                        {isCreating && !newKey && (
                            <form onSubmit={handleCreate} className="mb-6 p-6 bg-[var(--bg-dark)] rounded-xl border border-[var(--border-dark)]">
                                <h3 className="text-lg font-medium text-white mb-4">Create New API Key</h3>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                        Key Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="e.g., Claude Desktop, Cursor IDE"
                                        required
                                        className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-dark)] rounded-xl text-white placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-[var(--bg-dark)] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-[var(--bg-dark)] border-t-transparent rounded-full animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Key'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-6 py-2.5 bg-[var(--bg-card-hover)] hover:bg-[var(--border-light)] text-[var(--text-light)] rounded-xl font-medium transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Keys List */}
                        {apiKeys.length > 0 ? (
                            <div className="space-y-3">
                                {apiKeys.map((key) => (
                                    <div
                                        key={key.id}
                                        className="p-4 bg-[var(--bg-dark)] rounded-xl border border-[var(--border-dark)] flex items-center justify-between hover:border-[var(--border-light)] transition-all duration-200"
                                    >
                                        <div>
                                            <h3 className="font-medium text-white">{key.name}</h3>
                                            <p className="text-sm text-[var(--text-dim)]">
                                                <code className="font-mono">{key.keyPrefix}...</code> • Created{' '}
                                                {new Date(key.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${key.isActive
                                                        ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                                                        : 'bg-red-500/20 text-red-400'
                                                    }`}
                                            >
                                                {key.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(key.id)}
                                                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-200 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !isCreating && (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🔑</div>
                                    <p className="text-[var(--text-muted)] mb-6">No API keys yet</p>
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-[var(--bg-dark)] rounded-xl font-medium transition-all duration-200"
                                    >
                                        Create Your First API Key
                                    </button>
                                </div>
                            )
                        )}
                    </div>

                    {/* Usage Instructions */}
                    <div className="mt-6 card p-6 border-[var(--border-dark)]">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span>📚</span>
                            How to Use
                        </h3>
                        <p className="text-[var(--text-muted)] text-sm mb-4">
                            Add your API key to your AI assistant&apos;s MCP configuration:
                        </p>
                        <pre className="p-4 bg-[var(--bg-dark)] rounded-xl text-sm text-[var(--text-light)] overflow-x-auto border border-[var(--border-dark)] font-mono">
                            {`// Example: Using API key with requests
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
