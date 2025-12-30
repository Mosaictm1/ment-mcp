'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { getN8nCredentials } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const { login: authLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.error) {
            setError(result.error.message);
            setIsLoading(false);
            return;
        }

        if (result.data) {
            await authLogin(result.data.tokens.accessToken, result.data.tokens.refreshToken);

            // Check if user has n8n credentials
            const credResult = await getN8nCredentials();
            if (credResult.data && credResult.data.credentials.length > 0) {
                router.push('/dashboard/workflows');
            } else {
                router.push('/onboarding');
            }
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--bg-deep)]">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-4000"></div>

            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>

            <div className="w-full max-w-md p-1 relative z-10 animate-fade-in-up">
                {/* Glass Card */}
                <div className="glass-card rounded-2xl p-8 md:p-10 relative overflow-hidden">
                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 mb-4 border border-white/5 shadow-inner">
                            <span className="text-3xl">🚀</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
                        <p className="text-[var(--text-secondary)]">Sign in to your Ment account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm flex items-center gap-2">
                                <span className="text-lg">⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] ml-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 input-glass rounded-xl placeholder-gray-500 focus:text-white transition-all"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] ml-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 input-glass rounded-xl placeholder-gray-500 focus:text-white transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-4 btn-primary rounded-xl font-semibold shadow-lg shadow-purple-500/25 mt-2 group"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    accessing...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Sign In
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4 text-center">
                        <p className="text-[var(--text-secondary)] text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-[var(--secondary)] hover:text-[var(--secondary-glow)] font-medium transition-colors">
                                Create an account
                            </Link>
                        </p>

                        <Link href="/" className="text-[var(--text-muted)] hover:text-white text-sm transition-colors flex items-center justify-center gap-1">
                            ← Back to home
                        </Link>
                    </div>
                </div>

                {/* Bottom Text */}
                <p className="text-center text-[var(--text-muted)] text-xs mt-8 opacity-50">
                    &copy; 2025 Ment MCP. Secure Application.
                </p>
            </div>
        </div>
    );
}
