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

const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

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
                                <span className="text-3xl">🔌</span>
                                n8n Instances
                            </h1>
                            <p className="text-white/40 text-sm mt-1">Connect and manage your n8n servers</p>
                        </div>
                        {!isAddingNew && (
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                                style={{ background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)', color: '#0A0A0F' }}
                            >
                                <PlusIcon />
                                Add Instance
                            </button>
                        )}
                    </div>
                </header>

                <div className="px-8 py-6">
                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <span className="text-xl">⚠️</span>
                            <span className="text-red-400">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(87, 217, 87, 0.1)', border: '1px solid rgba(87, 217, 87, 0.2)' }}>
                            <span className="text-xl">✅</span>
                            <span style={{ color: '#57D957' }}>{success}</span>
                        </div>
                    )}

                    {/* Add New Form */}
                    {isAddingNew && (
                        <div className="mb-6 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.8) 0%, rgba(15, 15, 22, 0.9) 100%)', border: '1px solid rgba(87, 217, 87, 0.2)' }}>
                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <span>➕</span> Add New n8n Instance
                            </h3>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">Instance Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="My n8n Cloud"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#57D957]/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">n8n URL <span className="text-red-400">*</span></label>
                                    <input
                                        type="url"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        placeholder="https://your-n8n-instance.com"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#57D957]/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">API Key <span className="text-red-400">*</span></label>
                                    <input
                                        type="password"
                                        value={newApiKey}
                                        onChange={(e) => setNewApiKey(e.target.value)}
                                        placeholder="n8n_api_..."
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#57D957]/50 transition-colors"
                                    />
                                    <p className="mt-2 text-xs text-white/30">Get your API key from n8n Settings → API</p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)', color: '#0A0A0F' }}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Instance'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingNew(false)}
                                        className="px-6 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Instances List */}
                    <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.8) 0%, rgba(15, 15, 22, 0.9) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {credentials.length > 0 ? (
                            <div className="space-y-3">
                                {credentials.map((cred) => (
                                    <div key={cred.id} className="p-4 rounded-xl flex items-center justify-between transition-all duration-200 hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                                                <span className="text-2xl">⚡</span>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">{cred.name}</h3>
                                                <p className="text-sm text-white/30">{cred.instanceUrl}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    background: cred.status === 'verified' ? 'rgba(87, 217, 87, 0.15)' : cred.status === 'failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                    color: cred.status === 'verified' ? '#57D957' : cred.status === 'failed' ? '#EF4444' : '#F59E0B',
                                                }}
                                            >
                                                {cred.status}
                                            </span>
                                            <button
                                                onClick={() => handleVerify(cred.id)}
                                                disabled={verifyingId === cred.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                                                style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}
                                            >
                                                <CheckIcon />
                                                {verifyingId === cred.id ? 'Verifying...' : 'Verify'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cred.id)}
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
                            !isAddingNew && (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🔌</div>
                                    <h3 className="text-lg font-medium text-white mb-2">No instances connected</h3>
                                    <p className="text-white/40 text-sm mb-6">Connect your first n8n instance to get started</p>
                                    <button
                                        onClick={() => setIsAddingNew(true)}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                                        style={{ background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)', color: '#0A0A0F' }}
                                    >
                                        <PlusIcon />
                                        Connect n8n Instance
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
