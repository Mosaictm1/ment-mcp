"use client";

import Link from "next/link";
import Image from "next/image";
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
                ? 'bg-[var(--bg-glass-strong)] border-b border-[var(--border-glass)] backdrop-blur-xl shadow-lg'
                : 'bg-transparent border-b border-transparent'
                }`}
        >
            <div className="container">
                <nav className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 group"
                    >
                        <div
                            className="w-10 h-10 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-lg shadow-purple-500/20"
                        >
                            <Image
                                src="/logo.jpg"
                                alt="Ment Logo"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="font-bold text-lg md:text-xl text-white transition-colors group-hover:text-[var(--primary)]">
                            Ment
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
                                className="relative text-[var(--text-secondary)] hover:text-white text-sm font-medium transition-colors group py-2"
                            >
                                {link.label}
                                <span
                                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-300 group-hover:w-full rounded-full"
                                />
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-[var(--text-secondary)] hover:text-white text-sm font-medium transition-all px-4 py-2.5 rounded-lg hover:bg-white/5"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="btn btn-primary text-sm py-2.5 px-6 rounded-lg font-semibold shadow-purple-500/20"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2.5 rounded-lg hover:bg-white/5 transition-all text-[var(--text-secondary)] hover:text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6 transition-transform duration-300"
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
                    <div className="py-4 border-t border-[var(--border-glass)]">
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
                                    className="px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-white text-sm font-medium transition-all"
                                    style={{
                                        animationDelay: `${index * 0.05}s`,
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <hr className="my-2 border-[var(--border-glass)]" />
                            <Link
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-white text-sm font-medium transition-all"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                onClick={() => setIsMenuOpen(false)}
                                className="btn btn-primary mt-2 text-center text-sm mx-4 mb-2"
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
