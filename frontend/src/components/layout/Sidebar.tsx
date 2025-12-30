'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

// Icons
const DashboardIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
    </svg>
);

const WorkflowsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const InstancesIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
);

const KeysIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
);

const LogoutIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const AIWorkflowsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Overview', icon: <DashboardIcon /> },
    { href: '/dashboard/workflows', label: 'Workflows', icon: <WorkflowsIcon /> },
    { href: '/dashboard/ai-workflows', label: 'AI Workflows', icon: <AIWorkflowsIcon /> },
    { href: '/dashboard/settings', label: 'Instances', icon: <InstancesIcon /> },
    { href: '/dashboard/api-keys', label: 'API Keys', icon: <KeysIcon /> },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isHovered, setIsHovered] = useState(false);

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    const getInitials = () => {
        if (user?.name) {
            return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return user?.email?.[0]?.toUpperCase() || 'U';
    };

    return (
        <aside
            className="w-64 min-h-screen flex flex-col sticky top-0 border-r border-[var(--border-glass)] transition-all duration-300"
            style={{
                background: 'var(--bg-card)',
                backdropFilter: 'blur(20px)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Logo */}
            <div className="px-5 py-6 border-b border-[var(--border-glass)]">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] shadow-lg shadow-purple-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        Ment<span className="text-[var(--secondary)]">MCP</span>
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${active
                                    ? 'text-white bg-white/5 shadow-md shadow-purple-500/5'
                                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {active && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 to-transparent opacity-50" />
                                )}

                                <span className={`relative transition-colors duration-200 ${active ? 'text-[var(--priority)]' : 'group-hover:text-white'}`}>
                                    {item.icon}
                                </span>
                                <span className="relative font-medium text-sm tracking-wide">{item.label}</span>

                                {active && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[var(--secondary)] shadow-[0_0_10px_var(--secondary)] animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* User */}
            <div className="px-4 py-4 border-t border-[var(--border-glass)] bg-[var(--bg-deep)]/50">
                <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] text-white shadow-lg">
                        {getInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                            {user?.email}
                        </p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
                >
                    <LogoutIcon />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
