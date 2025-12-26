'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { getQuota, getN8nCredentials, getApiKeys, getWorkflows } from '@/lib/api';

// Icons
const ArrowUpIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
    const [credentials, setCredentials] = useState<Array<{ id: string; name: string; status: string; instanceUrl: string }>>([]);
    const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; keyPrefix: string }>>([]);
    const [workflowCount, setWorkflowCount] = useState<number>(0);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

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
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse"
                        style={{ background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)' }}
                    >
                        <svg className="w-6 h-6 text-black animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                    <span className="text-white/50">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const usagePercent = quota ? Math.min((quota.used / quota.limit) * 100, 100) : 0;

    const stats = [
        {
            label: 'API Calls Today',
            value: quota?.used?.toLocaleString() || '0',
            subtext: `of ${quota?.limit?.toLocaleString() || '100'} limit`,
            icon: '📊',
            color: '#57D957',
            progress: usagePercent,
        },
        {
            label: 'Workflows',
            value: workflowCount.toString(),
            subtext: 'in your n8n',
            icon: '⚡',
            color: '#3B82F6',
            href: '/dashboard/workflows',
        },
        {
            label: 'Connected Instances',
            value: credentials.length.toString(),
            subtext: 'n8n servers',
            icon: '🔌',
            color: '#8B5CF6',
            href: '/dashboard/settings',
        },
        {
            label: 'API Keys',
            value: apiKeys.length.toString(),
            subtext: 'active keys',
            icon: '🔑',
            color: '#F59E0B',
            href: '/dashboard/api-keys',
        },
    ];

    return (
        <div className="min-h-screen flex" style={{ background: '#0A0A0F' }}>
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header
                    className="sticky top-0 z-10 px-8 py-6 backdrop-blur-xl"
                    style={{
                        background: 'rgba(10, 10, 15, 0.8)',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/40 text-sm mb-1">{greeting}</p>
                            <h1 className="text-2xl font-bold text-white">
                                {user?.name || 'Welcome'} 👋
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard/settings"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5"
                                style={{ color: '#57D957' }}
                            >
                                <PlusIcon />
                                Add Instance
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="px-8 py-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat, index) => (
                            <div
                                key={stat.label}
                                className="group relative p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-2px]"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.8) 0%, rgba(15, 15, 22, 0.9) 100%)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                                    animationDelay: `${index * 0.1}s`,
                                }}
                            >
                                {/* Hover glow */}
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        background: `radial-gradient(circle at top right, ${stat.color}10 0%, transparent 70%)`,
                                    }}
                                />

                                <div className="relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <span className="text-3xl">{stat.icon}</span>
                                        {stat.href && (
                                            <Link href={stat.href} className="text-white/30 hover:text-white/60 transition-colors">
                                                <ArrowUpIcon />
                                            </Link>
                                        )}
                                    </div>

                                    <div
                                        className="text-4xl font-bold mb-1 transition-all duration-300"
                                        style={{ color: stat.color }}
                                    >
                                        {stat.value}
                                    </div>

                                    <div className="text-sm text-white/40 mb-1">{stat.label}</div>
                                    <div className="text-xs text-white/25">{stat.subtext}</div>

                                    {stat.progress !== undefined && (
                                        <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${stat.progress}%`,
                                                    background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}80 100%)`,
                                                    boxShadow: `0 0 10px ${stat.color}50`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* n8n Instances */}
                        <div
                            className="p-6 rounded-2xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.8) 0%, rgba(15, 15, 22, 0.9) 100%)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span className="text-xl">🔌</span>
                                    Connected Instances
                                </h2>
                                <Link
                                    href="/dashboard/settings"
                                    className="text-sm text-white/40 hover:text-[#57D957] transition-colors flex items-center gap-1"
                                >
                                    Manage <ArrowRightIcon />
                                </Link>
                            </div>

                            {credentials.length > 0 ? (
                                <div className="space-y-3">
                                    {credentials.slice(0, 3).map((cred) => (
                                        <div
                                            key={cred.id}
                                            className="p-4 rounded-xl flex items-center justify-between transition-all duration-200 hover:bg-white/5"
                                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                    style={{ background: 'rgba(139, 92, 246, 0.15)' }}
                                                >
                                                    <span className="text-lg">⚡</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-white">{cred.name}</h3>
                                                    <p className="text-xs text-white/30 truncate max-w-[180px]">{cred.instanceUrl}</p>
                                                </div>
                                            </div>
                                            <span
                                                className="px-2.5 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    background: cred.status === 'verified' ? 'rgba(87, 217, 87, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                    color: cred.status === 'verified' ? '#57D957' : '#EF4444',
                                                }}
                                            >
                                                {cred.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-3">🔌</div>
                                    <p className="text-white/40 text-sm mb-4">No instances connected yet</p>
                                    <Link
                                        href="/dashboard/settings"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                                        style={{
                                            background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)',
                                            color: '#0A0A0F',
                                        }}
                                    >
                                        <PlusIcon />
                                        Connect n8n
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* API Keys */}
                        <div
                            className="p-6 rounded-2xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.8) 0%, rgba(15, 15, 22, 0.9) 100%)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span className="text-xl">🔑</span>
                                    API Keys
                                </h2>
                                <Link
                                    href="/dashboard/api-keys"
                                    className="text-sm text-white/40 hover:text-[#57D957] transition-colors flex items-center gap-1"
                                >
                                    Manage <ArrowRightIcon />
                                </Link>
                            </div>

                            {apiKeys.length > 0 ? (
                                <div className="space-y-3">
                                    {apiKeys.slice(0, 3).map((key) => (
                                        <div
                                            key={key.id}
                                            className="p-4 rounded-xl flex items-center justify-between transition-all duration-200 hover:bg-white/5"
                                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                    style={{ background: 'rgba(245, 158, 11, 0.15)' }}
                                                >
                                                    <span className="text-lg">🔐</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-white">{key.name}</h3>
                                                    <code className="text-xs text-white/30 font-mono">{key.keyPrefix}•••</code>
                                                </div>
                                            </div>
                                            <span
                                                className="px-2.5 py-1 rounded-full text-xs font-medium"
                                                style={{ background: 'rgba(87, 217, 87, 0.15)', color: '#57D957' }}
                                            >
                                                Active
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-3">🔑</div>
                                    <p className="text-white/40 text-sm mb-4">No API keys yet</p>
                                    <Link
                                        href="/dashboard/api-keys"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                                        style={{
                                            background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)',
                                            color: '#0A0A0F',
                                        }}
                                    >
                                        <PlusIcon />
                                        Create Key
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 p-6 rounded-2xl" style={{ background: 'rgba(87, 217, 87, 0.03)', border: '1px solid rgba(87, 217, 87, 0.1)' }}>
                        <h3 className="text-sm font-medium text-white/50 mb-4">Quick Actions</h3>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/dashboard/workflows"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
                            >
                                <span>⚡</span> View Workflows
                            </Link>
                            <Link
                                href="/dashboard/settings"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
                            >
                                <span>🔌</span> Add n8n Instance
                            </Link>
                            <Link
                                href="/dashboard/api-keys"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
                            >
                                <span>🔑</span> Generate API Key
                            </Link>
                            <a
                                href="https://github.com/Mosaictm1/ment-mcp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
                            >
                                <span>📖</span> Documentation
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
