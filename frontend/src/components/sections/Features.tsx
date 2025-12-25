const features = [
    {
        icon: "🔧",
        title: "543 Node Coverage",
        description: "Access all n8n nodes with 99% accuracy."
    },
    {
        icon: "📚",
        title: "2,700+ Templates",
        description: "Ready-made workflows to customize."
    },
    {
        icon: "📊",
        title: "90% Token Savings",
        description: "Diff-based updates for efficiency."
    },
    {
        icon: "📡",
        title: "Real-Time Monitoring",
        description: "Watch executions as they happen."
    },
    {
        icon: "🔌",
        title: "Full API Access",
        description: "Direct n8n API integration."
    },
    {
        icon: "📖",
        title: "Auto-Updated Docs",
        description: "Always current documentation."
    }
];

export default function Features() {
    return (
        <section id="features" className="section bg-[var(--bg-white)]">
            <div className="container">
                <div className="section-header">
                    <h2>Everything You Need</h2>
                    <p>Powerful features that make AI-powered workflow creation seamless.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
                    {features.map((feature, index) => (
                        <div key={index} className="card text-center">
                            <div className="text-3xl mb-3">{feature.icon}</div>
                            <h4 className="mb-2">{feature.title}</h4>
                            <p className="text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
