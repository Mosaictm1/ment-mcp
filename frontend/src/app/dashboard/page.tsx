'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { getQuota, getN8nCredentials, getApiKeys, getWorkflows } from '@/lib/api';
import {
    BarChart3,
    Zap,
    Server,
    Key,
    TrendingUp,
    ServerOff,
    KeyRound,
    BookOpen,
    ServerCog,
    Plus,
    ArrowRight,
    Database,
    Shield,
    Sparkles,
    Unplug
} from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
    const [credentials, setCredentials] = useState<Array<{ id: string; name: string; status: string; instanceUrl: string; createdAt?: string }>>([]);
    const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; keyPrefix: string; createdAt: string; lastUsedAt?: string | null }>>([]);
    const [workflowCount, setWorkflowCount] = useState<number>(0);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting('Good morning');
        } else if (hour < 18) {
            setGreeting('Good afternoon');
        } else {
            setGreeting('Good evening');
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
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-purple-500" />
                    </div>
                    <span className="text-white/40 text-sm">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const usagePercent = quota ? Math.min((quota.used / quota.limit) * 100, 100) : 0;

    const statCards = [
        {
            label: 'API Calls Today',
            value: quota?.used?.toLocaleString() || '0',
            limit: quota?.limit?.toLocaleString() || '999,999',
            percent: `${(usagePercent).toFixed(1)}%`,
            icon: BarChart3,
            gradient: 'from-purple-500 to-pink-500',
            iconBg: 'rgba(139, 92, 246, 0.15)',
            iconColor: '#8b5cf6',
            progress: usagePercent,
            trend: '+12%'
        },
        {
            label: 'Workflows',
            value: workflowCount.toString(),
            subtext: 'in your n8n',
            icon: Zap,
            gradient: 'from-blue-500 to-cyan-500',
            iconBg: 'rgba(59, 130, 246, 0.15)',
            iconColor: '#3b82f6',
            badge: workflowCount > 0 ? 'Active' : null
        },
        {
            label: 'Connected Instances',
            value: credentials.filter(c => c.status === 'verified').length.toString(),
            subtext: 'n8n servers',
            icon: Server,
            gradient: 'from-pink-500 to-orange-500',
            iconBg: 'rgba(236, 72, 153, 0.15)',
            iconColor: '#ec4899'
        },
        {
            label: 'API Keys',
            value: apiKeys.length.toString(),
            subtext: 'active keys',
            icon: Key,
            gradient: 'from-yellow-500 to-orange-500',
            iconBg: 'rgba(245, 158, 11, 0.15)',
            iconColor: '#f59e0b'
        }
    ];

    const quickActions = [
        {
            label: 'View Workflows',
            icon: Zap,
            gradient: 'from-purple-500 to-purple-600',
            href: '/dashboard/workflows'
        },
        {
            label: 'Add n8n Instance',
            icon: ServerCog,
            gradient: 'from-blue-500 to-blue-600',
            href: '/dashboard/settings'
        },
        {
            label: 'Generate API Key',
            icon: KeyRound,
            gradient: 'from-pink-500 to-pink-600',
            href: '/dashboard/api-keys'
        },
        {
            label: 'Documentation',
            icon: BookOpen,
            gradient: 'from-green-500 to-green-600',
            href: 'https://github.com/Mosaictm1/ment-mcp',
            external: true
        }
    ];

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]" />

            {/* Animated Blur Circles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-float"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                        top: '10%',
                        left: '10%',
                        animation: 'float 20s ease-in-out infinite'
                    }}
                />
                <div
                    className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                        bottom: '10%',
                        right: '10%',
                        animation: 'float 25s ease-in-out infinite reverse'
                    }}
                />
                <div
                    className="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
                        top: '50%',
                        right: '20%',
                        animation: 'float 15s ease-in-out infinite'
                    }}
                />
            </div>

            <Sidebar />

            <main className="flex-1 relative z-10 overflow-auto">
                {/* Header Section */}
                <header className="px-8 pt-12 pb-8">
                    <div className="mb-2">
                        <p className="text-sm text-white/40">{greeting}</p>
                    </div>
                    <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-fade-in-up">
                        Welcome 👋
                    </h1>

                    {/* Stats Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((card, index) => {
                            const IconComponent = card.icon;
                            return (
                                <div
                                    key={card.label}
                                    className="group relative p-6 rounded-3xl backdrop-blur-xl border border-white/10 transition-all duration-500 hover:scale-105 hover:border-white/20 cursor-pointer animate-fade-in-up"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                        animationDelay: `${index * 100}ms`
                                    }}
                                >
                                    {/* Glow effect on hover */}
                                    <div
                                        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                                        style={{ background: `linear-gradient(135deg, ${card.iconColor}40 0%, transparent 70%)` }}
                                    />

                                    <div className="relative z-10">
                                        {/* Icon and Badge */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                                                style={{
                                                    background: card.iconBg,
                                                    boxShadow: `0 0 20px ${card.iconColor}30`
                                                }}
                                            >
                                                <IconComponent className="w-7 h-7" style={{ color: card.iconColor }} />
                                            </div>
                                            {card.trend && (
                                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium">
                                                    <TrendingUp className="w-3 h-3" />
                                                    {card.trend}
                                                </div>
                                            )}
                                            {card.badge && (
                                                <div className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium">
                                                    {card.badge}
                                                </div>
                                            )}
                                        </div>

                                        {/* Value */}
                                        <div className="text-4xl font-bold text-white mb-2">{card.value}</div>

                                        {/* Label */}
                                        <div className="text-sm text-white/60 mb-1">{card.label}</div>

                                        {/* Subtext */}
                                        {card.subtext && (
                                            <div className="text-xs text-white/40">{card.subtext}</div>
                                        )}
                                        {card.limit && (
                                            <div className="text-xs text-white/40">{card.percent} of {card.limit} limit</div>
                                        )}

                                        {/* Progress Bar */}
                                        {card.progress !== undefined && (
                                            <div className="mt-4">
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${card.gradient}`}
                                                        style={{
                                                            width: `${card.progress}%`,
                                                            boxShadow: `0 0 12px ${card.iconColor}60`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </header>

                <div className="px-8 pb-8">
                    {/* Connected Instances & API Keys Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Connected Instances */}
                        <div
                            className="p-8 rounded-3xl backdrop-blur-xl border border-white/10 animate-fade-in-up"
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                animationDelay: '400ms'
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <Server className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Connected Instances</h2>
                                </div>
                                <Link
                                    href="/dashboard/settings"
                                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 group"
                                >
                                    Manage
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {/* Content */}
                            {credentials.length > 0 ? (
                                <div className="space-y-3">
                                    {credentials.slice(0, 3).map((cred) => (
                                        <div
                                            key={cred.id}
                                            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                                        <Database className="w-5 h-5 text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-white">{cred.name}</h3>
                                                        <p className="text-xs text-white/40 truncate max-w-[200px]">{cred.instanceUrl}</p>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-xs font-medium ${cred.status === 'verified'
                                                            ? 'bg-green-500/10 text-green-400'
                                                            : 'bg-yellow-500/10 text-yellow-400'
                                                        }`}
                                                >
                                                    {cred.status === 'verified' ? '● Connected' : '○ Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-purple-500/10 flex items-center justify-center backdrop-blur-sm border border-purple-500/20">
                                        <ServerOff className="w-12 h-12 text-purple-400/40" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">No instances connected yet</h3>
                                    <p className="text-sm text-white/40 mb-6 max-w-xs mx-auto">
                                        Connect your n8n server to start managing workflows
                                    </p>
                                    <Link
                                        href="/dashboard/settings"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-purple-500/50"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Connect n8n
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* API Keys */}
                        <div
                            className="p-8 rounded-3xl backdrop-blur-xl border border-white/10 animate-fade-in-up"
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                animationDelay: '500ms'
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                        <Key className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">API Keys</h2>
                                </div>
                                <Link
                                    href="/dashboard/api-keys"
                                    className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1 group"
                                >
                                    Manage
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {/* Content */}
                            {apiKeys.length > 0 ? (
                                <div className="space-y-3">
                                    {apiKeys.slice(0, 3).map((key) => (
                                        <div
                                            key={key.id}
                                            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                                        <Shield className="w-5 h-5 text-yellow-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-white">{key.name}</h3>
                                                        <p className="text-xs text-white/40 font-mono">{key.keyPrefix}•••••••</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-400">
                                                        ● Active
                                                    </span>
                                                    <p className="text-xs text-white/30 mt-1">
                                                        {key.lastUsedAt ? `Used ${new Date(key.lastUsedAt).toLocaleDateString()}` : 'Never used'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-yellow-500/10 flex items-center justify-center backdrop-blur-sm border border-yellow-500/20">
                                        <Key className="w-12 h-12 text-yellow-400/40" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">No API keys yet</h3>
                                    <p className="text-sm text-white/40 mb-6 max-w-xs mx-auto">
                                        Create your first API key to authenticate your apps
                                    </p>
                                    <Link
                                        href="/dashboard/api-keys"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-yellow-500/50"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Key
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div
                        className="p-8 rounded-3xl backdrop-blur-xl border border-white/10 animate-fade-in-up"
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                            animationDelay: '600ms'
                        }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => {
                                const IconComponent = action.icon;
                                const content = (
                                    <div
                                        className="group relative p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                                        }}
                                    >
                                        {/* Hover glow */}
                                        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${action.gradient} blur-xl`} />

                                        <div className="relative z-10 flex flex-col items-center gap-3">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg`}>
                                                <IconComponent className="w-8 h-8 text-white" />
                                            </div>
                                            <span className="text-sm font-medium text-white text-center">{action.label}</span>
                                        </div>
                                    </div>
                                );

                                return action.external ? (
                                    <a key={action.label} href={action.href} target="_blank" rel="noopener noreferrer">
                                        {content}
                                    </a>
                                ) : (
                                    <Link key={action.label} href={action.href}>
                                        {content}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                    }
                    25% {
                        transform: translateY(-20px) translateX(20px);
                    }
                    50% {
                        transform: translateY(-10px) translateX(-10px);
                    }
                    75% {
                        transform: translateY(-30px) translateX(10px);
                    }
                }
            `}</style>
        </div>
    );
}
