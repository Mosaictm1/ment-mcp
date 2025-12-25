export default function Demo() {
    return (
        <section id="demo" className="section bg-[var(--bg-white)]">
            <div className="container">
                <div className="section-header">
                    <h2>See It in <span className="text-[var(--primary)]">Action</span></h2>
                    <p>Watch how Ment MCP transforms natural language into working automations.</p>
                </div>

                <div className="max-w-3xl mx-auto">
                    {/* Video Container */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--text-dark)] shadow-lg">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-lg">
                                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-sm text-[var(--text-muted)] mt-4">6 minute tutorial</p>
                </div>
            </div>
        </section>
    );
}
