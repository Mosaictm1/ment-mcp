import Link from "next/link";

export default function CTA() {
    return (
        <section className="section">
            <div className="container">
                <div className="max-w-2xl mx-auto text-center py-12 px-8 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white">
                    <h2 className="text-2xl font-bold text-white mb-3">Ready to Automate?</h2>
                    <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
                        Join developers building perfect n8n workflows with AI. Start free.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/signup" className="btn bg-white text-[var(--primary-dark)] hover:bg-gray-100 px-6">
                            Get Started Free
                        </Link>
                        <Link href="https://github.com" className="btn border-2 border-white/40 text-white hover:bg-white/10 px-6">
                            GitHub
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
