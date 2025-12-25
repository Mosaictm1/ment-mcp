const problems = [
    {
        before: "Copy-Paste JSON",
        after: "Direct Deployment",
        description: "Deploy workflows directly to your n8n instance. No more manual imports.",
        emoji: "🚀"
    },
    {
        before: "Outdated Configs",
        after: "Always Current",
        description: "Documentation synced with the latest n8n version automatically.",
        emoji: "🔄"
    },
    {
        before: "Blind Debugging",
        after: "Smart Validation",
        description: "AI validates and fixes errors before deployment. Save hours of debugging.",
        emoji: "✨"
    }
];

export default function ProblemSolution() {
    return (
        <section className="section bg-[var(--bg-dark)] relative overflow-hidden">
            {/* Background decoration */}
            <div
                className="absolute top-1/2 right-0 w-[500px] h-[500px] pointer-events-none opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(87, 217, 87, 0.1) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    transform: 'translateY(-50%)',
                }}
            />

            <div className="container relative z-10">
                <div className="section-header">
                    <h2>
                        From Problem to <span className="gradient-text">Solution</span>
                    </h2>
                    <p>
                        We solved the biggest pain points developers face when using AI to build n8n workflows.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-5">
                    {problems.map((item, index) => (
                        <div
                            key={index}
                            className="card group glass-hover animate-fade-in-up"
                            style={{
                                animationDelay: `${index * 0.15}s`,
                                animationFillMode: 'both',
                            }}
                        >
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                {/* Emoji Icon */}
                                <div
                                    className="text-4xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                                    style={{
                                        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                                    }}
                                >
                                    {item.emoji}
                                </div>

                                {/* Before -> After */}
                                <div className="flex items-center gap-3 md:gap-4 min-w-[280px] flex-shrink-0">
                                    <span className="text-sm md:text-base text-[var(--text-dim)] line-through font-medium">
                                        {item.before}
                                    </span>
                                    <svg
                                        className="w-5 h-5 text-[var(--primary)] flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span className="text-sm md:text-base font-bold text-[var(--primary)] group-hover:text-[var(--primary-light)] transition-colors">
                                        {item.after}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-sm md:text-base text-[var(--text-muted)] group-hover:text-[var(--text-light)] transition-colors leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-12 animate-fade-in-up delay-500">
                    <p className="text-[var(--text-muted)] mb-4">
                        Ready to experience the difference?
                    </p>
                    <a
                        href="#demo"
                        className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-light)] font-semibold transition-all group"
                    >
                        <span>See it in action</span>
                        <svg
                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
