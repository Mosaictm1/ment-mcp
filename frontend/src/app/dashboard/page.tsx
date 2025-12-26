'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { getQuota, getN8nCredentials, getApiKeys, getWorkflows } from '@/lib/api';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
    const [credentials, setCredentials] = useState<Array<{ id: string; name: string; status: string; instanceUrl: string }>>([]);
    const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; keyPrefix: string }>>([]);
    const [workflowCount, setWorkflowCount] = useState<number>(0);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            getQuota().then((res) => {
                if (res.data) setQuota(res.data.apiCalls);
            });
            getN8nCredentials().then((res) => {
                if (res.data) {
                    setCredentials(res.data.credentials);
                    // Get workflows count from first verified credential
                    const verified = res.data.credentials.find(c => c.status === 'verified');
                    if (verified) {
                        getWorkflows(verified.id).then((wfRes) => {
                            if (wfRes.data?.data) {
                                setWorkflowCount(wfRes.data.data.length);
                            }
                        });
                    }
                }
            });
            getApiKeys().then((res) => {
                if (res.data) setApiKeys(res.data.apiKeys);
            });
        }
    }, [isAuthenticated]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-dark)' }}>
                <div className="flex items-center gap-3 text-[var(--text-muted)]">
                    <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xl">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const usagePercent = quota ? Math.min((quota.used / quota.limit) * 100, 100) : 0;

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-dark)' }}>
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl">
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
                        </h1>
                        <p className="text-[var(--text-muted)]">Here&apos;s an overview of your MCP usage</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Usage Card */}
                        <div className="card p-6 hover:border-[var(--primary)]/30 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[var(--text-dim)] text-sm font-medium uppercase tracking-wider">API Calls Today</h2>
                                <span className="text-2xl">📈</span>
                            </div>
                            {quota ? (
                                <>
                                    <div className="text-3xl font-bold text-white mb-1">
                                        {quota.used.toLocaleString()}
                                    </div>
                                    <p className="text-[var(--text-dim)] text-sm mb-3">of {quota.limit.toLocaleString()} limit</p>
                                    <div className="w-full bg-[var(--bg-card-hover)] rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-[var(--primary)]'
                                                }`}
                                            style={{ width: `${usagePercent}%` }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="text-[var(--text-dim)] animate-pulse">Loading...</div>
                            )}
                        </div>

                        {/* Plan Card */}
                        <div className="card p-6 hover:border-[var(--primary)]/30 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[var(--text-dim)] text-sm font-medium uppercase tracking-wider">Current Plan</h2>
                                <span className="text-2xl">⭐</span>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1 capitalize">
                                {user?.subscriptionTier || 'Free'}
                            </div>
                            <p className="text-[var(--text-dim)] text-sm mb-3">
                                {user?.subscriptionTier === 'free' ? '100 calls/day' : 'Unlimited calls'}
                            </p>
                            {user?.subscriptionTier === 'free' && (
                                <button className="w-full py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-[var(--bg-dark)] text-sm rounded-xl font-medium transition-all duration-200">
                                    Upgrade to Supporter
                                </button>
                            )}
                        </div>

                        {/* Workflows Card */}
                        <div className="card p-6 hover:border-[var(--primary)]/30 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[var(--text-dim)] text-sm font-medium uppercase tracking-wider">Workflows</h2>
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">
                                {workflowCount}
                            </div>
                            <p className="text-[var(--text-dim)] text-sm mb-3">in your n8n</p>
                            <Link
                                href="/dashboard/workflows"
                                className="text-[var(--primary)] hover:text-[var(--primary-light)] text-sm font-medium transition-colors"
                            >
                                View workflows →
                            </Link>
                        </div>

                        {/* Instances Card */}
                        <div className="card p-6 hover:border-[var(--primary)]/30 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[var(--text-dim)] text-sm font-medium uppercase tracking-wider">n8n Instances</h2>
                                <span className="text-2xl">🔌</span>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">
                                {credentials.length}
                            </div>
                            <p className="text-[var(--text-dim)] text-sm mb-3">connected</p>
                            <Link
                                href="/dashboard/settings"
                                className="text-[var(--primary)] hover:text-[var(--primary-light)] text-sm font-medium transition-colors"
                            >
                                Manage instances →
                            </Link>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Connected Instances */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">n8n Instances</h2>
                                <Link
                                    href="/dashboard/settings"
                                    className="text-[var(--primary)] hover:text-[var(--primary-light)] text-sm font-medium transition-colors"
                                >
                                    Manage →
                                </Link>
                            </div>
                            {credentials.length > 0 ? (
                                <div className="space-y-3">
                                    {credentials.map((cred) => (
                                        <div key={cred.id} className="p-4 bg-[var(--bg-dark)] rounded-xl flex items-center justify-between border border-[var(--border-dark)]">
                                            <div>
                                                <h3 className="text-white font-medium">{cred.name}</h3>
                                                <p className="text-[var(--text-dim)] text-sm truncate max-w-[200px]">{cred.instanceUrl}</p>
                                            </div>
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
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-[var(--text-muted)] mb-4">Connect your first n8n instance</p>
                                    <Link
                                        href="/dashboard/settings"
                                        className="inline-block px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-[var(--bg-dark)] rounded-xl font-medium transition-all duration-200"
                                    >
                                        + Add Instance
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* API Keys */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">API Keys</h2>
                                <Link
                                    href="/dashboard/api-keys"
                                    className="text-[var(--primary)] hover:text-[var(--primary-light)] text-sm font-medium transition-colors"
                                >
                                    Manage →
                                </Link>
                            </div>
                            {apiKeys.length > 0 ? (
                                <div className="space-y-3">
                                    {apiKeys.slice(0, 3).map((key) => (
                                        <div key={key.id} className="p-4 bg-[var(--bg-dark)] rounded-xl flex items-center justify-between border border-[var(--border-dark)]">
                                            <div>
                                                <h3 className="text-white font-medium">{key.name}</h3>
                                                <code className="text-[var(--text-dim)] text-sm">{key.keyPrefix}...</code>
                                            </div>
                                            <span className="px-3 py-1 bg-[var(--primary)]/20 text-[var(--primary)] rounded-full text-xs font-semibold">
                                                Active
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-[var(--text-muted)] mb-4">Create an API key to use MCP tools</p>
                                    <Link
                                        href="/dashboard/api-keys"
                                        className="inline-block px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-[var(--bg-dark)] rounded-xl font-medium transition-all duration-200"
                                    >
                                        + Create API Key
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
