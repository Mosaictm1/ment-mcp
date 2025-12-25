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
        popular: false
    },
    {
        name: "Supporter",
        price: "€19",
        period: "/month",
        features: [
            "Unlimited MCP calls",
            "Everything in Free",
            "Priority support",
            "Early access"
        ],
        cta: "Start Supporter",
        popular: true
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="section">
            <div className="container">
                <div className="section-header">
                    <h2>Simple <span className="text-[var(--primary)]">Pricing</span></h2>
                    <p>Start free, upgrade when you need more.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`card relative ${plan.popular ? "border-2 border-[var(--primary)]" : ""
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--primary)] text-white text-xs font-medium rounded-full">
                                    Popular
                                </div>
                            )}

                            <div className="text-center mb-5">
                                <h3 className="text-lg mb-2">{plan.name}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-3xl font-bold text-[var(--text-dark)]">{plan.price}</span>
                                    <span className="text-sm text-[var(--text-muted)]">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-2.5 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2.5 text-sm">
                                        <svg className="w-4 h-4 text-[var(--primary)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-[var(--text-secondary)]">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/signup"
                                className={`btn w-full text-sm ${plan.popular ? "btn-primary" : "btn-secondary"}`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
