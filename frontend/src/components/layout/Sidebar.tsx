'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
}

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

const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Overview', icon: <DashboardIcon /> },
    { href: '/dashboard/workflows', label: 'Workflows', icon: <WorkflowsIcon />, badge: 'New' },
    { href: '/dashboard/settings', label: 'Instances', icon: <InstancesIcon /> },
    { href: '/dashboard/api-keys', label: 'API Keys', icon: <KeysIcon /> },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isHovered, setIsHovered] = useState(false);

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
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
            className="w-72 min-h-screen flex flex-col relative"
            style={{
                background: 'linear-gradient(180deg, rgba(13, 13, 18, 0.98) 0%, rgba(10, 10, 15, 0.99) 100%)',
                borderRight: '1px solid rgba(87, 217, 87, 0.08)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Ambient glow effect */}
            <div
                className="absolute top-0 left-0 w-full h-40 pointer-events-none transition-opacity duration-500"
                style={{
                    background: 'radial-gradient(ellipse at top left, rgba(87, 217, 87, 0.06) 0%, transparent 70%)',
                    opacity: isHovered ? 1 : 0.5,
                }}
            />

            {/* Logo Section */}
            <div className="relative px-6 py-6 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3 group">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)',
                            boxShadow: '0 4px 20px rgba(87, 217, 87, 0.3)',
                        }}
                    >
                        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-xl font-bold text-white">Ment</span>
                        <span
                            className="text-xl font-bold ml-1"
                            style={{ color: '#57D957' }}
                        >
                            MCP
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">
                <div className="mb-3 px-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/30">
                        Menu
                    </span>
                </div>
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                                        ? 'text-white'
                                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                                    }`}
                            >
                                {/* Active indicator */}
                                {active && (
                                    <>
                                        <div
                                            className="absolute inset-0 rounded-xl"
                                            style={{
                                                background: 'linear-gradient(90deg, rgba(87, 217, 87, 0.12) 0%, transparent 100%)',
                                            }}
                                        />
                                        <div
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                                            style={{
                                                background: 'linear-gradient(180deg, #57D957 0%, #3CB83C 100%)',
                                                boxShadow: '0 0 12px rgba(87, 217, 87, 0.5)',
                                            }}
                                        />
                                    </>
                                )}

                                <span className={`relative transition-colors ${active ? 'text-[#57D957]' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="relative font-medium">{item.label}</span>

                                {item.badge && (
                                    <span
                                        className="relative ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(87, 217, 87, 0.2) 0%, rgba(60, 184, 60, 0.2) 100%)',
                                            color: '#57D957',
                                        }}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Stats Mini */}
                <div className="mt-8 mx-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-white/40">API Usage</span>
                        <span className="text-xs font-semibold text-[#57D957]">12%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                                width: '12%',
                                background: 'linear-gradient(90deg, #57D957 0%, #3CB83C 100%)',
                                boxShadow: '0 0 10px rgba(87, 217, 87, 0.5)',
                            }}
                        />
                    </div>
                </div>
            </nav>

            {/* User Section */}
            <div className="relative px-4 py-4 border-t border-white/5">
                <div
                    className="p-3 rounded-xl transition-all duration-200 hover:bg-white/5 cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                            style={{
                                background: 'linear-gradient(135deg, #57D957 0%, #3CB83C 100%)',
                                color: '#0A0A0F',
                            }}
                        >
                            {getInitials()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-white/40 truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <LogoutIcon />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
