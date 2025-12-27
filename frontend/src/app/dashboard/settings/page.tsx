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
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const ServerIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
        if (!isLoading && !isAuthenticated) router.push('/login');
    }, [isLoading, isAuthenticated, router]);

    const loadCredentials = async () => {
        const res = await getN8nCredentials();
        if (res.data) setCredentials(res.data.credentials);
    };

    useEffect(() => {
        if (isAuthenticated) loadCredentials();
    }, [isAuthenticated]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess(''); setIsSaving(true);
        const result = await addN8nCredential(newUrl, newApiKey, newName || undefined);
        if (result.error) {
            setError(result.error.message);
        } else {
            setSuccess('Instance added successfully!');
            setNewName(''); setNewUrl(''); setNewApiKey('');
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
        if (!confirm('Delete this instance?')) return;
        const result = await deleteN8nCredential(id);
        if (result.data?.success) {
            setSuccess('Instance deleted');
            loadCredentials();
        }
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
                            <h1 className="text-2xl font-semibold text-white">n8n Instances</h1>
                            <p className="text-sm text-white/40 mt-1">Connect and manage your automation servers</p>
                        </div>
                        {!isAddingNew && (
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)' }}
                            >
                                <PlusIcon />
                                Add Instance
                            </button>
                        )}
                    </div>
                </header>

                <div className="px-8 pb-8">
                    {error && (
                        <div className="mb-4 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                            <span className="text-red-400">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                            <span style={{ color: '#22c55e' }}>{success}</span>
                        </div>
                    )}

                    {isAddingNew && (
                        <div className="mb-6 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                            <h3 className="text-lg font-semibold text-white mb-6">Add New Instance</h3>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/50 mb-2">Instance Name</label>
                                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="My n8n Cloud"
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/25 focus:outline-none focus:border-[#22c55e]/40 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/50 mb-2">n8n URL <span className="text-red-400">*</span></label>
                                    <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://your-n8n.com" required
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/25 focus:outline-none focus:border-[#22c55e]/40 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/50 mb-2">API Key <span className="text-red-400">*</span></label>
                                    <input type="password" value={newApiKey} onChange={(e) => setNewApiKey(e.target.value)} placeholder="n8n_api_..." required
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/25 focus:outline-none focus:border-[#22c55e]/40 transition-colors" />
                                    <p className="mt-2 text-xs text-white/25">Get from n8n Settings → API</p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="submit" disabled={isSaving}
                                        className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff' }}>
                                        {isSaving ? 'Saving...' : 'Save Instance'}
                                    </button>
                                    <button type="button" onClick={() => setIsAddingNew(false)}
                                        className="px-6 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        {credentials.length > 0 ? (
                            <div className="divide-y divide-white/[0.03]">
                                {credentials.map((cred) => (
                                    <div key={cred.id} className="p-5 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                                                <ServerIcon />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">{cred.name}</h3>
                                                <p className="text-sm text-white/30">{cred.instanceUrl}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-medium"
                                                style={{
                                                    background: cred.status === 'verified' ? 'rgba(34, 197, 94, 0.1)' : cred.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                                    color: cred.status === 'verified' ? '#22c55e' : cred.status === 'failed' ? '#ef4444' : '#eab308',
                                                }}>
                                                {cred.status === 'verified' ? '● Connected' : cred.status === 'failed' ? '● Failed' : '○ Pending'}
                                            </span>
                                            <button onClick={() => handleVerify(cred.id)} disabled={verifyingId === cred.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                                                style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                                <CheckIcon />
                                                {verifyingId === cred.id ? '...' : 'Verify'}
                                            </button>
                                            <button onClick={() => handleDelete(cred.id)}
                                                className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                                                style={{ color: '#ef4444' }}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !isAddingNew && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6' }}>
                                    <ServerIcon />
                                </div>
                                <h3 className="text-base font-medium text-white mb-2">No instances connected</h3>
                                <p className="text-sm text-white/40 mb-6 max-w-xs mx-auto">Connect your n8n server to start building automations</p>
                                <button onClick={() => setIsAddingNew(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                                    style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)' }}>
                                    <PlusIcon />
                                    Connect Instance
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
