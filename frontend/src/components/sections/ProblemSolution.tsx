const problems = [
    {
        before: "Copy-Paste JSON",
        after: "Direct Deployment",
        description: "Deploy workflows directly to your n8n instance."
    },
    {
        before: "Outdated Configs",
        after: "Always Current",
        description: "Documentation synced with the latest n8n version."
    },
    {
        before: "Blind Debugging",
        after: "Smart Validation",
        description: "AI validates and fixes errors before deployment."
    }
];

export default function ProblemSolution() {
    return (
        <section className="section">
            <div className="container">
                <div className="section-header">
                    <h2>From Problem to <span className="text-[var(--primary)]">Solution</span></h2>
                    <p>We solved the biggest pain points developers face when using AI to build n8n workflows.</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-4">
                    {problems.map((item, index) => (
                        <div key={index} className="card flex items-center gap-6">
                            {/* Before → After */}
                            <div className="flex items-center gap-3 min-w-[280px]">
                                <span className="text-sm text-[var(--text-muted)] line-through">
                                    {item.before}
                                </span>
                                <svg className="w-4 h-4 text-[var(--primary)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <span className="text-sm font-semibold text-[var(--primary-dark)]">
                                    {item.after}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-[var(--text-muted)] hidden md:block">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
