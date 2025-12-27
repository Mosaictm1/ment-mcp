'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { getQuota, getN8nCredentials, getApiKeys, getWorkflows } from '@/lib/api';

// Professional Icons
const TrendUpIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const ServerIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
);

const KeyIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
);

const BoltIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const ChartIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const InfoIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
    const [credentials, setCredentials] = useState<Array<{ id: string; name: string; status: string; instanceUrl: string; createdAt?: string }>>([]);
    const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; keyPrefix: string; createdAt: string; lastUsedAt?: string | null }>>([]);
    const [workflowCount, setWorkflowCount] = useState<number>(0);
    const [greeting, setGreeting] = useState('');
    const [timeOfDay, setTimeOfDay] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting('Good morning');
            setTimeOfDay('morning');
        } else if (hour < 18) {
            setGreeting('Good afternoon');
            setTimeOfDay('afternoon');
        } else {
            setGreeting('Good evening');
            setTimeOfDay('evening');
        }
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
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 100%)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                            <BoltIcon />
                        </div>
                        <div className="absolute inset-0 rounded-2xl animate-ping opacity-20" style={{ background: '#22c55e' }} />
                    </div>
                    <span className="text-white/40 text-sm">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const usagePercent = quota ? Math.min((quota.used / quota.limit) * 100, 100) : 0;
    const firstName = user?.name?.split(' ')[0] || 'there';

    const kpiCards = [
        {
            label: 'API Calls Today',
            value: quota?.used?.toLocaleString() || '0',
            subtext: `of ${quota?.limit?.toLocaleString() || '100'} daily limit`,
            icon: <ChartIcon />,
            color: '#22c55e',
            trend: '+12%',
            trendUp: true,
            progress: usagePercent,
        },
        {
            label: 'Active Workflows',
            value: workflowCount.toString(),
            subtext: 'Running automations',
            icon: <BoltIcon />,
            color: '#3b82f6',
            trend: workflowCount > 0 ? 'Active' : 'None',
            trendUp: workflowCount > 0,
            href: '/dashboard/workflows',
        },
        {
            label: 'Connected Instances',
            value: credentials.filter(c => c.status === 'verified').length.toString(),
            subtext: `${credentials.length} total configured`,
            icon: <ServerIcon />,
            color: '#8b5cf6',
            trend: credentials.some(c => c.status === 'verified') ? 'Connected' : 'Pending',
            trendUp: credentials.some(c => c.status === 'verified'),
            href: '/dashboard/settings',
        },
        {
            label: 'API Keys',
            value: apiKeys.length.toString(),
            subtext: 'Authentication tokens',
            icon: <KeyIcon />,
            color: '#f59e0b',
            trend: apiKeys.length > 0 ? 'Active' : 'Create one',
            trendUp: apiKeys.length > 0,
            href: '/dashboard/api-keys',
        },
    ];

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)' }}>
            <Sidebar />

            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="px-8 pt-8 pb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-white/40 mb-1">
                                {greeting}, <span className="text-white/60">{firstName}</span>
                            </p>
                            <h1 className="text-2xl font-semibold text-white">
                                Your Dashboard
                            </h1>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                            <Link
                                href="/dashboard/settings"
                                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)',
                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                    color: '#22c55e',
                                }}
                            >
                                <PlusIcon />
                                <span>Add Instance</span>
                            </Link>
                            <Link
                                href="/dashboard/api-keys"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
                            >
                                <KeyIcon />
                                <span>New API Key</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="px-8 pb-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {kpiCards.map((card, index) => (
                            <div
                                key={card.label}
                                className="group relative p-5 rounded-2xl transition-all duration-300 hover:translate-y-[-2px] cursor-pointer"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)',
                                    border: '1px solid rgba(255, 255, 255, 0.04)',
                                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
                                }}
                                onClick={() => card.href && router.push(card.href)}
                            >
                                {/* Gradient overlay on hover */}
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ background: `linear-gradient(135deg, ${card.color}08 0%, transparent 70%)` }}
                                />

                                <div className="relative">
                                    {/* Header: Icon + Trend */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                            style={{
                                                background: `linear-gradient(135deg, ${card.color}20 0%, ${card.color}10 100%)`,
                                                color: card.color,
                                            }}
                                        >
                                            {card.icon}
                                        </div>
                                        <div
                                            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                                            style={{
                                                background: card.trendUp ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                                                color: card.trendUp ? '#22c55e' : '#9ca3af',
                                            }}
                                        >
                                            {card.trendUp && <TrendUpIcon />}
                                            {card.trend}
                                        </div>
                                    </div>

                                    {/* Value */}
                                    <div className="text-3xl font-bold text-white mb-1 tracking-tight">
                                        {card.value}
                                    </div>

                                    {/* Label */}
                                    <div className="text-sm text-white/50 mb-1">{card.label}</div>
                                    <div className="text-xs text-white/30">{card.subtext}</div>

                                    {/* Progress Bar (for API calls) */}
                                    {card.progress !== undefined && (
                                        <div className="mt-4">
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                                    style={{
                                                        width: `${card.progress}%`,
                                                        background: `linear-gradient(90deg, ${card.color} 0%, ${card.color}80 100%)`,
                                                        boxShadow: `0 0 12px ${card.color}40`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Connected Instances */}
                        <div
                            className="p-6 rounded-2xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.04)',
                            }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-semibold text-white">Connected Instances</h2>
                                    <button className="text-white/30 hover:text-white/50 transition-colors" title="n8n instances are your automation servers">
                                        <InfoIcon />
                                    </button>
                                </div>
                                <Link
                                    href="/dashboard/settings"
                                    className="text-sm text-white/40 hover:text-[#22c55e] transition-colors flex items-center gap-1"
                                >
                                    Manage <ChevronRightIcon />
                                </Link>
                            </div>

                            {credentials.length > 0 ? (
                                <div className="space-y-3">
                                    {credentials.slice(0, 3).map((cred) => (
                                        <div
                                            key={cred.id}
                                            className="group p-4 rounded-xl flex items-center justify-between transition-all duration-200 hover:bg-white/[0.02]"
                                            style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.03)' }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                                                    <ServerIcon />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-white">{cred.name}</h3>
                                                    <p className="text-xs text-white/30 truncate max-w-[200px]">{cred.instanceUrl}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="px-2.5 py-1 rounded-md text-xs font-medium"
                                                    style={{
                                                        background: cred.status === 'verified' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                                        color: cred.status === 'verified' ? '#22c55e' : '#eab308',
                                                    }}
                                                >
                                                    {cred.status === 'verified' ? '● Connected' : '○ Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Smart Empty State */
                                <div className="text-center py-12">
                                    <div
                                        className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                        style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.1)' }}
                                    >
                                        <ServerIcon />
                                    </div>
                                    <h3 className="text-base font-medium text-white mb-2">Connect your first n8n instance</h3>
                                    <p className="text-sm text-white/40 mb-6 max-w-xs mx-auto">
                                        Link your n8n server to start managing workflows and building automations with AI.
                                    </p>
                                    <Link
                                        href="/dashboard/settings"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                                        style={{
                                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                            color: '#fff',
                                            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)',
                                        }}
                                    >
                                        <PlusIcon />
                                        Connect n8n Instance
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* API Keys */}
                        <div
                            className="p-6 rounded-2xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.04)',
                            }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-semibold text-white">API Keys</h2>
                                    <button className="text-white/30 hover:text-white/50 transition-colors" title="API keys authenticate your AI assistants to use MCP tools">
                                        <InfoIcon />
                                    </button>
                                </div>
                                <Link
                                    href="/dashboard/api-keys"
                                    className="text-sm text-white/40 hover:text-[#22c55e] transition-colors flex items-center gap-1"
                                >
                                    Manage <ChevronRightIcon />
                                </Link>
                            </div>

                            {apiKeys.length > 0 ? (
                                <div className="space-y-3">
                                    {apiKeys.slice(0, 3).map((key) => (
                                        <div
                                            key={key.id}
                                            className="group p-4 rounded-xl flex items-center justify-between transition-all duration-200 hover:bg-white/[0.02]"
                                            style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.03)' }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                                                    <KeyIcon />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-white">{key.name}</h3>
                                                    <p className="text-xs text-white/30 font-mono">{key.keyPrefix}•••••••</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="px-2.5 py-1 rounded-md text-xs font-medium" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                                    ● Active
                                                </span>
                                                <p className="text-xs text-white/25 mt-1">
                                                    {key.lastUsedAt ? `Used ${new Date(key.lastUsedAt).toLocaleDateString()}` : 'Never used'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Smart Empty State */
                                <div className="text-center py-12">
                                    <div
                                        className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                        style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.1)' }}
                                    >
                                        <KeyIcon />
                                    </div>
                                    <h3 className="text-base font-medium text-white mb-2">Create your first API key</h3>
                                    <p className="text-sm text-white/40 mb-6 max-w-xs mx-auto">
                                        API keys let your AI assistants authenticate and use MCP tools securely.
                                    </p>
                                    <Link
                                        href="/dashboard/api-keys"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                                        style={{
                                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                            color: '#fff',
                                            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)',
                                        }}
                                    >
                                        <PlusIcon />
                                        Generate API Key
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions Bar */}
                    <div
                        className="mt-6 p-4 rounded-2xl flex items-center justify-between"
                        style={{
                            background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.03) 0%, rgba(59, 130, 246, 0.03) 50%, rgba(139, 92, 246, 0.03) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.03)',
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-white/40">Quick Actions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/dashboard/workflows"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
                            >
                                <BoltIcon />
                                View Workflows
                            </Link>
                            <Link
                                href="/dashboard/settings"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
                            >
                                <ServerIcon />
                                Add Instance
                            </Link>
                            <a
                                href="https://github.com/Mosaictm1/ment-mcp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
                            >
                                📖 Docs
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
