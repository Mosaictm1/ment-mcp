"use client";

import Link from "next/link";

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        features: [
            "100 MCP calls/day",
            "All 543 n8n nodes",
            "2,700+ templates",
            "Community support"
        ],
        cta: "Get Started Free",
        popular: false,
        description: "Perfect for trying out Ment MCP"
    },
    {
        name: "Supporter",
        price: "€19",
        period: "/month",
        features: [
            "Unlimited MCP calls",
            "Everything in Free",
            "Priority support",
            "Early access to features"
        ],
        cta: "Start Supporter",
        popular: true,
        description: "Best for professionals"
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="section bg-[var(--bg-darker)] relative overflow-hidden">
            {/* Background decoration */}
            <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(87, 217, 87, 0.1) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />

            <div className="container relative z-10">
                <div className="section-header">
                    <h2>
                        Simple <span className="gradient-text">Pricing</span>
                    </h2>
                    <p>Start free, upgrade when you need more. No hidden fees.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`card relative group glass-hover animate-fade-in-up ${plan.popular ? "border-[var(--primary)]" : ""
                                }`}
                            style={{
                                animationDelay: `${index * 0.1}s`,
                                animationFillMode: 'both',
                            }}
                        >
                            {plan.popular && (
                                <div
                                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[var(--primary)] text-black text-xs font-bold uppercase tracking-wider rounded-full"
                                    style={{
                                        boxShadow: '0 4px 12px rgba(87, 217, 87, 0.4)',
                                    }}
                                >
                                    Most Popular
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-xl mb-2 text-white font-bold">{plan.name}</h3>
                                <p className="text-xs text-[var(--text-muted)] mb-4">{plan.description}</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span
                                        className="text-5xl font-bold transition-all"
                                        style={{
                                            background: 'linear-gradient(135deg, #fff 0%, var(--primary-light) 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        {plan.price}
                                    </span>
                                    <span className="text-sm text-[var(--text-muted)] mb-2">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <svg
                                            className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-[var(--text-muted)] group-hover:text-[var(--text-light)] transition-colors">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/signup"
                                className={`btn w-full text-sm ${plan.popular ? "btn-primary" : "btn-secondary"
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Additional info */}
                <div className="text-center mt-12 animate-fade-in-up delay-300">
                    <p className="text-sm text-[var(--text-muted)] mb-2">
                        All plans include access to our{" "}
                        <span className="text-[var(--primary)] font-semibold">open-source code</span>
                    </p>
                    <p className="text-xs text-[var(--text-dim)]">
                        Cancel anytime • No credit card required for Free plan
                    </p>
                </div>
            </div>
        </section>
    );
}
