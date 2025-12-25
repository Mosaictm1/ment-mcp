"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-[var(--bg-white)] border-b border-[var(--border-light)]">
            <div className="container">
                <nav className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <span className="font-bold text-lg text-[var(--text-dark)]">Ment MCP</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-[var(--text-muted)] hover:text-[var(--text-dark)] text-sm font-medium transition">
                            Features
                        </Link>
                        <Link href="#pricing" className="text-[var(--text-muted)] hover:text-[var(--text-dark)] text-sm font-medium transition">
                            Pricing
                        </Link>
                        <Link href="#demo" className="text-[var(--text-muted)] hover:text-[var(--text-dark)] text-sm font-medium transition">
                            Demo
                        </Link>
                        <Link href="https://github.com" target="_blank" className="text-[var(--text-muted)] hover:text-[var(--text-dark)] text-sm font-medium transition">
                            GitHub
                        </Link>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login" className="text-[var(--text-muted)] hover:text-[var(--text-dark)] text-sm font-medium transition px-3 py-2">
                            Sign In
                        </Link>
                        <Link href="/signup" className="btn btn-primary text-sm py-2.5 px-5">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-accent)]"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg className="w-5 h-5 text-[var(--text-dark)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </nav>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-[var(--border-light)]">
                        <div className="flex flex-col gap-1">
                            <Link href="#features" className="px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] text-sm">Features</Link>
                            <Link href="#pricing" className="px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] text-sm">Pricing</Link>
                            <Link href="#demo" className="px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] text-sm">Demo</Link>
                            <Link href="https://github.com" className="px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] text-sm">GitHub</Link>
                            <hr className="my-2 border-[var(--border-light)]" />
                            <Link href="/login" className="px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] text-sm">Sign In</Link>
                            <Link href="/signup" className="btn btn-primary mt-2 text-center text-sm">Get Started</Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
