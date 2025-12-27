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

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Overview', icon: <DashboardIcon /> },
    { href: '/dashboard/workflows', label: 'Workflows', icon: <WorkflowsIcon /> },
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
            className="w-64 min-h-screen flex flex-col sticky top-0"
            style={{
                background: 'linear-gradient(180deg, #0d0d14 0%, #0a0a0f 100%)',
                borderRight: '1px solid rgba(255, 255, 255, 0.03)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Logo */}
            <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.03)' }}>
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        }}
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-lg font-semibold text-white">
                        Ment<span style={{ color: '#22c55e' }}>MCP</span>
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${active
                                        ? 'text-white'
                                        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                                    }`}
                            >
                                {active && (
                                    <div
                                        className="absolute inset-0 rounded-lg"
                                        style={{
                                            background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.08) 0%, transparent 100%)',
                                        }}
                                    />
                                )}
                                {active && (
                                    <div
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r"
                                        style={{
                                            background: '#22c55e',
                                            boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)',
                                        }}
                                    />
                                )}
                                <span className={`relative ${active ? 'text-[#22c55e]' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="relative text-sm font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* User */}
            <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.03)' }}>
                <div className="flex items-center gap-3 px-3 py-2">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            color: '#0a0a0f',
                        }}
                    >
                        {getInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-white/30 truncate">
                            {user?.email}
                        </p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
                >
                    <LogoutIcon />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
