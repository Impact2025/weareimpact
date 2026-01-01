'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'MANIFEST', href: '/#visie' },
  { label: 'EXPERTISE', href: '/#pijlers' },
  { label: 'AI SCAN', href: '/#scan', icon: Sparkles, highlight: true },
  { label: 'KENNISBANK', href: '/kennisbank', icon: BookOpen },
  { label: 'VENTURES', href: '/#ventures' },
  { label: 'VINCENT', href: '/#over' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#FDFBF7]/90 backdrop-blur-md shadow-sm py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="cursor-pointer">
          {!logoError ? (
            <Image
              src="/logo.webp"
              alt="WeAreImpact Logo"
              width={120}
              height={48}
              className="h-12 w-auto object-contain hover:opacity-90 transition-opacity"
              onError={() => setLogoError(true)}
              priority
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                <span className="font-bold text-lg">W</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                WeAreImpact
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-10 text-sm font-medium tracking-wide text-slate-600">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`hover:text-orange-600 transition-colors flex items-center gap-1 ${
                item.highlight ? 'text-orange-600' : ''
              }`}
            >
              {item.icon && <item.icon size={14} />}
              {item.label}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Button
            asChild
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/30"
          >
            <Link href="/#contact">Let&apos;s Talk</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#FDFBF7] shadow-xl p-6 flex flex-col space-y-4 md:hidden border-t border-slate-100">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-left py-2 font-medium ${
                item.highlight ? 'text-orange-600' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-left py-2 text-orange-600 font-bold"
          >
            CONTACT
          </Link>
        </div>
      )}
    </nav>
  );
}
