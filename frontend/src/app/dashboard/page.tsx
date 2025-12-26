'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getQuota, getN8nCredentials, getApiKeys } from '@/lib/api';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
    const [credentials, setCredentials] = useState<Array<{ id: string; name: string; status: string }>>([]);
    const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; keyPrefix: string }>>([]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            // Load dashboard data
            getQuota().then((res) => {
                if (res.data) setQuota(res.data.apiCalls);
            });
            getN8nCredentials().then((res) => {
                if (res.data) setCredentials(res.data.credentials);
            });
            getApiKeys().then((res) => {
                if (res.data) setApiKeys(res.data.apiKeys);
            });
        }
    }, [isAuthenticated]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-white">
                        Ment <span className="text-purple-400">MCP</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-300">{user?.email}</span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Usage Card */}
                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <h2 className="text-lg font-semibold text-white mb-4">API Usage Today</h2>
                        {quota ? (
                            <>
                                <div className="text-4xl font-bold text-purple-400 mb-2">
                                    {quota.used} / {quota.limit}
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-400">Loading...</div>
                        )}
                    </div>

                    {/* Plan Card */}
                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <h2 className="text-lg font-semibold text-white mb-4">Current Plan</h2>
                        <div className="text-4xl font-bold text-green-400 mb-2 capitalize">
                            {user?.subscriptionTier || 'Free'}
                        </div>
                        {user?.subscriptionTier === 'free' && (
                            <button className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 transition">
                                Upgrade to Supporter
                            </button>
                        )}
                    </div>

                    {/* n8n Instances Card */}
                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <h2 className="text-lg font-semibold text-white mb-4">n8n Instances</h2>
                        <div className="text-4xl font-bold text-blue-400 mb-2">
                            {credentials.length}
                        </div>
                        <Link
                            href="/dashboard/settings"
                            className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                            Manage instances →
                        </Link>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* API Keys */}
                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">API Keys</h2>
                            <Link
                                href="/dashboard/api-keys"
                                className="text-purple-400 hover:text-purple-300 text-sm"
                            >
                                Manage →
                            </Link>
                        </div>
                        {apiKeys.length > 0 ? (
                            <ul className="space-y-2">
                                {apiKeys.slice(0, 3).map((key) => (
                                    <li key={key.id} className="flex items-center justify-between text-gray-300">
                                        <span>{key.name}</span>
                                        <code className="text-sm text-gray-500">{key.keyPrefix}...</code>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400">No API keys yet</p>
                        )}
                    </div>

                    {/* n8n Credentials */}
                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">n8n Instances</h2>
                            <Link
                                href="/dashboard/settings"
                                className="text-purple-400 hover:text-purple-300 text-sm"
                            >
                                Manage →
                            </Link>
                        </div>
                        {credentials.length > 0 ? (
                            <ul className="space-y-2">
                                {credentials.map((cred) => (
                                    <li key={cred.id} className="flex items-center justify-between text-gray-300">
                                        <span>{cred.name}</span>
                                        <span className={`text-sm ${cred.status === 'verified' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {cred.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div>
                                <p className="text-gray-400 mb-3">Connect your n8n instance to get started</p>
                                <Link
                                    href="/dashboard/settings"
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition inline-block"
                                >
                                    Add n8n Instance
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
