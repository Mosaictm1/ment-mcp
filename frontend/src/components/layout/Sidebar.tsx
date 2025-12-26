'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface NavItem {
    href: string;
    label: string;
    icon: string;
}

const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/workflows', label: 'Workflows', icon: '⚡' },
    { href: '/dashboard/settings', label: 'n8n Instances', icon: '🔌' },
    { href: '/dashboard/api-keys', label: 'API Keys', icon: '🔑' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-64 border-r border-[var(--border-dark)] bg-[var(--bg-card)] backdrop-blur-xl flex flex-col min-h-screen">
            {/* Logo */}
            <div className="p-6 border-b border-[var(--border-dark)]">
                <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-3xl">⚡</span>
                    <span>Ment <span className="gradient-text">MCP</span></span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.href)
                                ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30 shadow-lg shadow-[var(--primary)]/10'
                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-light)]'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-[var(--border-dark)]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-[var(--bg-dark)] font-bold shadow-lg shadow-[var(--primary)]/20">
                        {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{user?.name || 'User'}</p>
                        <p className="text-[var(--text-dim)] text-xs truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full px-4 py-2.5 bg-[var(--bg-card-hover)] hover:bg-red-500/20 hover:text-red-400 rounded-xl text-[var(--text-muted)] transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
