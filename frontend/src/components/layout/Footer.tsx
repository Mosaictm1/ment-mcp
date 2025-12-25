import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[var(--bg-darker)] border-t border-white/10 py-16 relative overflow-hidden">
            {/* Background decoration */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none opacity-10"
                style={{
                    background: 'radial-gradient(circle, rgba(87, 217, 87, 0.1) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />

            <div className="container relative z-10">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-4 group w-fit">
                            <div
                                className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center transition-transform group-hover:scale-110"
                                style={{
                                    boxShadow: '0 4px 12px rgba(87, 217, 87, 0.3)',
                                }}
                            >
                                <span className="text-black font-bold text-base">M</span>
                            </div>
                            <span className="font-bold text-xl text-white group-hover:text-[var(--primary-light)] transition-colors">
                                Ment MCP
                            </span>
                        </Link>
                        <p className="text-[var(--text-muted)] text-sm max-w-sm mb-6 leading-relaxed">
                            AI-powered n8n workflow automation platform.
                            Build, deploy, and debug workflows with natural language.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3">
                            <Link
                                href="https://github.com/Mosaictm1/ment-mcp"
                                target="_blank"
                                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 group"
                                aria-label="GitHub"
                            >
                                <svg className="w-5 h-5 text-[var(--text-muted)] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Links - Product */}
                    <div>
                        <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">Product</h4>
                        <ul className="space-y-3 text-sm">
                            {[
                                { href: '#features', label: 'Features' },
                                { href: '#pricing', label: 'Pricing' },
                                { href: '#demo', label: 'Demo' },
                                { href: '/docs', label: 'Documentation' }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors inline-flex items-center gap-2 group"
                                    >
                                        <span className="w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-3" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links - Legal */}
                    <div>
                        <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            {[
                                { href: '/privacy', label: 'Privacy Policy' },
                                { href: '/terms', label: 'Terms of Service' },
                                { href: '/license', label: 'MIT License' }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors inline-flex items-center gap-2 group"
                                    >
                                        <span className="w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-3" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-[var(--text-dim)] text-center md:text-left">
                            © {currentYear} Ment MCP. Open source under{" "}
                            <Link
                                href="/license"
                                className="text-[var(--primary)] hover:text-[var(--primary-light)] transition-colors font-medium"
                            >
                                MIT License
                            </Link>
                            .
                        </p>

                        <div className="flex items-center gap-4 text-xs text-[var(--text-dim)]">
                            <span className="flex items-center gap-2">
                                Built with
                                <span className="text-red-500 animate-pulse">❤️</span>
                                for developers
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
