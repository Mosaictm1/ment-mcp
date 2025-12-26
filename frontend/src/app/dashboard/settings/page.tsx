'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import {
    getN8nCredentials,
    addN8nCredential,
    deleteN8nCredential,
    verifyN8nCredential,
} from '@/lib/api';

interface Credential {
    id: string;
    name: string;
    instanceUrl: string;
    status: 'pending' | 'verified' | 'failed';
    createdAt: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const { isLoading, isAuthenticated } = useAuth();
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newApiKey, setNewApiKey] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    const loadCredentials = async () => {
        const res = await getN8nCredentials();
        if (res.data) {
            setCredentials(res.data.credentials);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadCredentials();
        }
    }, [isAuthenticated]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSaving(true);

        const result = await addN8nCredential(newUrl, newApiKey, newName || undefined);

        if (result.error) {
            setError(result.error.message);
        } else {
            setSuccess('n8n instance added successfully!');
            setNewName('');
            setNewUrl('');
            setNewApiKey('');
            setIsAddingNew(false);
            loadCredentials();
        }

        setIsSaving(false);
    };

    const handleVerify = async (id: string) => {
        setVerifyingId(id);
        const result = await verifyN8nCredential(id);
        if (result.data) {
            setSuccess(`Verification ${result.data.verified ? 'successful' : 'failed'}`);
            loadCredentials();
        }
        setVerifyingId(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this n8n instance?')) return;

        const result = await deleteN8nCredential(id);
        if (result.data?.success) {
            setSuccess('n8n instance deleted');
            loadCredentials();
        }
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
                            <span className="text-4xl">🔌</span>
                            n8n Instances
                        </h1>
                        <p className="text-[var(--text-muted)]">Connect and manage your n8n instances</p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3 animate-fade-in">
                            <span className="text-xl">⚠️</span>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl text-[var(--primary)] flex items-center gap-3 animate-fade-in">
                            <span className="text-xl">✅</span>
                            {success}
                        </div>
                    )}

                    {/* n8n Instances Card */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Your Instances</h2>
                            {!isAddingNew && (
                                <button
                                    onClick={() => setIsAddingNew(true)}
                                    className="px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-[var(--bg-dark)] rounded-xl font-medium transition-all duration-200"
                                >
                                    + Add Instance
                                </button>
                            )}
                        </div>

                        {/* Add New Form */}
                        {isAddingNew && (
                            <form onSubmit={handleAdd} className="mb-6 p-6 bg-[var(--bg-dark)] rounded-xl border border-[var(--border-dark)]">
                                <h3 className="text-lg font-medium text-white mb-4">Add New n8n Instance</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                            Instance Name (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="My n8n Cloud"
                                            className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-dark)] rounded-xl text-white placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                            n8n URL <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={newUrl}
                                            onChange={(e) => setNewUrl(e.target.value)}
                                            placeholder="https://your-n8n-instance.com"
                                            required
                                            className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-dark)] rounded-xl text-white placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                            API Key <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={newApiKey}
                                            onChange={(e) => setNewApiKey(e.target.value)}
                                            placeholder="n8n_api_..."
                                            required
                                            className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-dark)] rounded-xl text-white placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                        />
                                        <p className="mt-2 text-xs text-[var(--text-dim)]">
                                            Get your API key from n8n Settings → API
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-[var(--bg-dark)] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-[var(--bg-dark)] border-t-transparent rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Instance'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingNew(false)}
                                        className="px-6 py-2.5 bg-[var(--bg-card-hover)] hover:bg-[var(--border-light)] text-[var(--text-light)] rounded-xl font-medium transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Instances List */}
                        {credentials.length > 0 ? (
                            <div className="space-y-3">
                                {credentials.map((cred) => (
                                    <div
                                        key={cred.id}
                                        className="p-4 bg-[var(--bg-dark)] rounded-xl border border-[var(--border-dark)] flex items-center justify-between hover:border-[var(--border-light)] transition-all duration-200"
                                    >
                                        <div>
                                            <h3 className="font-medium text-white">{cred.name}</h3>
                                            <p className="text-sm text-[var(--text-dim)]">{cred.instanceUrl}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${cred.status === 'verified'
                                                        ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                                                        : cred.status === 'failed'
                                                            ? 'bg-red-500/20 text-red-400'
                                                            : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}
                                            >
                                                {cred.status}
                                            </span>
                                            <button
                                                onClick={() => handleVerify(cred.id)}
                                                disabled={verifyingId === cred.id}
                                                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all duration-200 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {verifyingId === cred.id ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                                        Verifying
                                                    </>
                                                ) : (
                                                    'Verify'
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cred.id)}
                                                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-200 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !isAddingNew && (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🔌</div>
                                    <p className="text-[var(--text-muted)] mb-6">No n8n instances connected yet</p>
                                    <button
                                        onClick={() => setIsAddingNew(true)}
                                        className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-[var(--bg-dark)] rounded-xl font-medium transition-all duration-200"
                                    >
                                        Connect Your First n8n Instance
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
