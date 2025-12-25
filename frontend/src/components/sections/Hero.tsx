import Link from "next/link";

export default function Hero() {
    return (
        <section className="section bg-[var(--bg-white)]">
            <div className="container">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-accent)] border border-[var(--border-light)] mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                        <span className="text-xs font-medium text-[var(--text-secondary)]">Powered by Model Context Protocol</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="mb-5">
                        The Evolution From{" "}
                        <span className="text-[var(--primary)]">Frustration</span>
                        {" "}to{" "}
                        <span className="text-[var(--primary-dark)]">Flow</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg mb-10 max-w-xl mx-auto">
                        Stop struggling with broken JSON and outdated configs.
                        Let AI build perfect n8n workflows with direct integration and smart validation.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
                        <Link href="/signup" className="btn btn-primary px-7 py-3.5">
                            Get Started Free
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link href="#demo" className="btn btn-secondary px-7 py-3.5">
                            Watch Demo
                        </Link>
                    </div>

                    {/* Stats - Clean Grid */}
                    <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
                        <div className="text-center p-4">
                            <div className="text-2xl font-bold text-[var(--text-dark)] mb-1">543</div>
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">n8n Nodes</div>
                        </div>
                        <div className="text-center p-4 border-x border-[var(--border-light)]">
                            <div className="text-2xl font-bold text-[var(--text-dark)] mb-1">2,700+</div>
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Templates</div>
                        </div>
                        <div className="text-center p-4">
                            <div className="text-2xl font-bold text-[var(--text-dark)] mb-1">99%</div>
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Accuracy</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
