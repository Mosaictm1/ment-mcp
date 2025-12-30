const features = [
    {
        icon: "🔧",
        title: "543 Node Coverage",
        description: "Access all n8n nodes with 99% accuracy. Every node documented and ready to use."
    },
    {
        icon: "📚",
        title: "2,700+ Templates",
        description: "Ready-made workflows to customize. Start fast, iterate faster."
    },
    {
        icon: "📊",
        title: "90% Token Savings",
        description: "Diff-based updates for efficiency. Save costs without compromising quality."
    },
    {
        icon: "📡",
        title: "Real-Time Monitoring",
        description: "Watch executions as they happen. Debug in real-time with full visibility."
    },
    {
        icon: "🔌",
        title: "Full API Access",
        description: "Direct n8n API integration. Complete control over your workflows."
    },
    {
        icon: "📖",
        title: "Auto-Updated Docs",
        description: "Always current documentation. Never work with outdated information."
    }
];

export default function Features() {
    return (
        <section id="features" className="section bg-[var(--bg-space)] relative overflow-hidden">
            {/* Background decoration */}
            <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20"
                style={{
                    background: 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
                }}
            />

            <div className="container relative z-10">
                <div className="section-header">
                    <h2>
                        Everything You <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Need</span>
                    </h2>
                    <p>
                        Powerful features that make AI-powered workflow creation seamless and efficient.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="glass-card p-8 rounded-2xl text-center group cursor-default hover:bg-[var(--bg-card-hover)] animate-fade-in-up"
                            style={{
                                animationDelay: `${index * 0.1}s`,
                                animationFillMode: 'both',
                            }}
                        >
                            <div
                                className="text-4xl mb-4 inline-block transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 filter drop-shadow-lg"
                            >
                                {feature.icon}
                            </div>
                            <h4 className="mb-3 text-white font-bold">{feature.title}</h4>
                            <p className="text-sm leading-relaxed text-[var(--text-secondary)] group-hover:text-white transition-colors">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
