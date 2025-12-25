import Link from "next/link";

export default function Hero() {
    return (
        <section
            className="bg-[var(--bg-dark)]"
            style={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div className="container">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Badge */}
                    <div className="badge mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                        <span>Powered by Model Context Protocol</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="mb-6">
                        <span className="gradient-text">Make N8N</span>
                        <br />
                        <span className="gradient-text">More Simple</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg mb-10 max-w-xl mx-auto text-[var(--text-muted)]">
                        Connect your AI to n8n and let it build, deploy, and debug workflows for you.
                        No more copy-pasting JSON. Just describe what you need.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
                        <Link href="/signup" className="btn btn-primary px-8 py-3.5">
                            Start for Free
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link href="https://github.com/Mosaictm1/ment-mcp" className="btn btn-secondary px-8 py-3.5">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                            View on GitHub
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-12 mb-16">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">543</div>
                            <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide">n8n Nodes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">2,700+</div>
                            <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide">Templates</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">99%</div>
                            <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide">Accuracy</div>
                        </div>
                    </div>

                    {/* Integrations hint */}
                    <div className="text-center">
                        <p className="text-xs text-[var(--text-dim)] uppercase tracking-wider mb-4">Works with your favorite AI tools</p>
                        <div className="flex justify-center gap-4 opacity-60">
                            <span className="text-2xl">🤖</span>
                            <span className="text-2xl">⚡</span>
                            <span className="text-2xl">🔗</span>
                            <span className="text-2xl">🧠</span>
                            <span className="text-2xl">💬</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
