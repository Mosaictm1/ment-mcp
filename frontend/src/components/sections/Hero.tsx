import Link from "next/link";

export default function Hero() {
    return (
        <section
            className="relative overflow-hidden"
            style={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, var(--bg-dark) 0%, var(--bg-darker) 100%)',
            }}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(87, 217, 87, 0.15) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        animation: 'pulse 4s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full opacity-10"
                    style={{
                        background: 'radial-gradient(circle, rgba(87, 217, 87, 0.1) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />
                <div
                    className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
                    style={{
                        background: 'radial-gradient(circle, rgba(87, 217, 87, 0.1) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />
            </div>

            <div className="container relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2.5 glass px-5 py-2.5 rounded-full mb-8 border border-white/10 animate-fade-in-up">
                        <span
                            className="w-2 h-2 rounded-full bg-[var(--primary)]"
                            style={{ animation: 'pulse 2s ease-in-out infinite' }}
                        />
                        <span className="text-sm font-medium text-[var(--text-muted)]">
                            Powered by Model Context Protocol
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="mb-6 animate-fade-in-up delay-100">
                        <span className="gradient-text block mb-2">Make N8N</span>
                        <span className="gradient-text block">More Simple</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-[var(--text-muted)] leading-relaxed animate-fade-in-up delay-200">
                        Connect your AI to n8n and let it build, deploy, and debug workflows for you.
                        <span className="block mt-2">No more copy-pasting JSON. Just describe what you need.</span>
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up delay-300">
                        <Link
                            href="/signup"
                            className="btn btn-primary px-8 py-4 text-base group"
                        >
                            <span>Start for Free</span>
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
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span>View on GitHub</span>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div
                        className="grid grid-cols-3 gap-8 md:gap-12 mb-16 max-w-2xl mx-auto animate-fade-in-up delay-400"
                    >
                        <div className="text-center group cursor-default">
                            <div
                                className="text-4xl md:text-5xl font-bold mb-2 transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(135deg, #fff 0%, var(--primary-light) 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                543
                            </div>
                            <div className="text-xs md:text-sm text-[var(--text-dim)] uppercase tracking-wider font-medium">
                                n8n Nodes
                            </div>
                        </div>
                        <div className="text-center group cursor-default">
                            <div
                                className="text-4xl md:text-5xl font-bold mb-2 transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(135deg, #fff 0%, var(--primary-light) 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                2.7K+
                            </div>
                            <div className="text-xs md:text-sm text-[var(--text-dim)] uppercase tracking-wider font-medium">
                                Templates
                            </div>
                        </div>
                        <div className="text-center group cursor-default">
                            <div
                                className="text-4xl md:text-5xl font-bold mb-2 transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(135deg, #fff 0%, var(--primary-light) 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                99%
                            </div>
                            <div className="text-xs md:text-sm text-[var(--text-dim)] uppercase tracking-wider font-medium">
                                Accuracy
                            </div>
                        </div>
                    </div>

                    {/* Integrations hint */}
                    <div className="text-center animate-fade-in-up delay-500">
                        <p className="text-xs md:text-sm text-[var(--text-dim)] uppercase tracking-wider mb-5 font-medium">
                            Works with your favorite AI tools
                        </p>
                        <div className="flex justify-center gap-6 md:gap-8">
                            {['🤖', '⚡', '🔗', '🧠', '💬'].map((emoji, index) => (
                                <span
                                    key={index}
                                    className="text-3xl md:text-4xl opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-default inline-block"
                                    style={{
                                        filter: 'grayscale(0.3)',
                                        animationDelay: `${index * 0.1}s`,
                                    }}
                                >
                                    {emoji}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                style={{
                    background: 'linear-gradient(to top, var(--bg-darker), transparent)',
                }}
            />
        </section>
    );
}
