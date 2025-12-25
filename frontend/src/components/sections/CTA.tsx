import Link from "next/link";

export default function CTA() {
    return (
        <section className="section bg-[var(--bg-dark)] relative overflow-hidden">
            {/* Background effects */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(87, 217, 87, 0.08) 0%, transparent 60%)',
                }}
            />

            <div className="container relative z-10">
                <div
                    className="max-w-3xl mx-auto text-center py-16 px-8 md:px-12 rounded-3xl glass-hover relative overflow-hidden animate-fade-in-up"
                    style={{
                        background: 'var(--bg-glass)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    }}
                >
                    {/* Gradient overlay */}
                    <div
                        className="absolute inset-0 opacity-50 pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle at 50% 0%, rgba(87, 217, 87, 0.1) 0%, transparent 50%)',
                        }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="inline-block mb-4">
                            <span className="text-4xl">🚀</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to <span className="gradient-text">Automate</span>?
                        </h2>

                        <p className="text-[var(--text-muted)] text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                            Join developers building perfect n8n workflows with AI.
                            <span className="block mt-1">Start for free today. No credit card required.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/signup"
                                className="btn btn-primary px-8 py-4 text-base group"
                            >
                                <span>Get Started Free</span>
                                <svg
                                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>

                            <Link
                                href="https://github.com/Mosaictm1/ment-mcp"
                                className="btn btn-secondary px-8 py-4 text-base group glass-hover"
                                target="_blank"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                </svg>
                                <span>View on GitHub</span>
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm">
                                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                    <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Free forever plan</span>
                                </div>
                                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                    <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Open source</span>
                                </div>
                                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                    <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>No credit card</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
