"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'glass border-b border-white/10 shadow-lg'
                    : 'bg-transparent border-b border-[var(--border-dark)]'
                }`}
            style={{
                backdropFilter: isScrolled ? 'blur(20px)' : 'blur(8px)',
                WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'blur(8px)',
            }}
        >
            <div className="container">
                <nav className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 group"
                    >
                        <div
                            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                            style={{
                                boxShadow: '0 4px 12px rgba(87, 217, 87, 0.3)',
                            }}
                        >
                            <span className="text-black font-bold text-base md:text-lg">M</span>
                        </div>
                        <span className="font-bold text-lg md:text-xl text-white transition-colors group-hover:text-[var(--primary-light)]">
                            Ment MCP
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { href: '#features', label: 'Features' },
                            { href: '#pricing', label: 'Pricing' },
                            { href: '#demo', label: 'Demo' },
                            { href: 'https://github.com/Mosaictm1/ment-mcp', label: 'GitHub', external: true }
                        ].map((link, index) => (
                            <Link
                                key={index}
                                href={link.href}
                                target={link.external ? '_blank' : undefined}
                                className="relative text-[var(--text-muted)] hover:text-white text-sm font-medium transition-colors group"
                            >
                                {link.label}
                                <span
                                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all duration-300 group-hover:w-full"
                                    style={{
                                        boxShadow: '0 0 8px var(--primary)',
                                    }}
                                />
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-[var(--text-muted)] hover:text-white text-sm font-medium transition-all px-4 py-2.5 rounded-lg hover:bg-white/5"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="btn btn-primary text-sm py-2.5 px-6"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2.5 rounded-lg hover:bg-white/5 transition-all"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6 text-white transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{
                                transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0)',
                            }}
                        >
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </nav>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="py-4 border-t border-white/10">
                        <div className="flex flex-col gap-1">
                            {[
                                { href: '#features', label: 'Features' },
                                { href: '#pricing', label: 'Pricing' },
                                { href: '#demo', label: 'Demo' },
                                { href: 'https://github.com/Mosaictm1/ment-mcp', label: 'GitHub' }
                            ].map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-4 py-3 rounded-lg text-[var(--text-muted)] hover:bg-white/5 hover:text-white text-sm font-medium transition-all"
                                    style={{
                                        animationDelay: `${index * 0.05}s`,
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <hr className="my-2 border-white/10" />
                            <Link
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="px-4 py-3 rounded-lg text-[var(--text-muted)] hover:bg-white/5 hover:text-white text-sm font-medium transition-all"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                onClick={() => setIsMenuOpen(false)}
                                className="btn btn-primary mt-2 text-center text-sm"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
