"use client";

export default function Demo() {
    return (
        <section id="demo" className="section bg-[var(--bg-dark)] relative overflow-hidden">
            {/* Background decoration */}
            <div
                className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(87, 217, 87, 0.12) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
            />

            <div className="container relative z-10">
                <div className="section-header">
                    <h2>
                        See It in <span className="gradient-text">Action</span>
                    </h2>
                    <p>Watch how Ment MCP transforms natural language into working automations.</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div
                        className="relative aspect-video rounded-2xl overflow-hidden glass border border-white/10 group cursor-pointer animate-fade-in-up"
                        style={{
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(87, 217, 87, 0.1)',
                        }}
                    >
                        {/* Video placeholder with gradient overlay */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: 'linear-gradient(135deg, rgba(87, 217, 87, 0.05) 0%, rgba(60, 184, 60, 0.1) 100%)',
                            }}
                        />

                        {/* Play button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[var(--primary)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl"
                                style={{
                                    boxShadow: '0 8px 24px rgba(87, 217, 87, 0.4), 0 0 0 0 rgba(87, 217, 87, 0.4)',
                                    animation: 'glow 2s ease-in-out infinite',
                                }}
                            >
                                <svg className="w-8 h-8 md:w-10 md:h-10 text-black ml-2 transition-transform group-hover:ml-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </button>
                        </div>

                        {/* Grid pattern overlay */}
                        <div
                            className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{
                                backgroundImage: 'linear-gradient(rgba(87, 217, 87, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(87, 217, 87, 0.1) 1px, transparent 1px)',
                                backgroundSize: '50px 50px',
                            }}
                        />
                    </div>

                    <div className="text-center mt-6 animate-fade-in-up delay-200">
                        <p className="text-sm text-[var(--text-muted)] mb-2">
                            <span className="inline-flex items-center gap-2">
                                <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                6 minute tutorial
                            </span>
                        </p>
                        <p className="text-xs text-[var(--text-dim)]">
                            Learn how to build your first workflow in minutes
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
