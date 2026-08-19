'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'MANIFEST', href: '/#manifest', isHash: true },
  { label: 'EXPERTISE', href: '/#diensten', isHash: true },
  { label: 'AI SCAN', href: '/#scan', icon: Sparkles, highlight: true, isHash: true },
  { label: 'IRIS', href: '/iris', isHash: false },
  { label: 'IMPACT CALC', href: '/impact-calculator', isHash: false },
  { label: 'KENNISBANK', href: '/kennisbank', isHash: false },
  { label: 'BLOG', href: '/blog', isHash: false },
  { label: 'CONTACT', href: '/contact', isHash: false },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll lock when mobile menu open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const handleNavClick = useCallback((href: string, isHash: boolean) => {
    closeMobileMenu();
    if (!isHash) return;

    const hashId = href.split('#')[1];
    if (!hashId) return;

    if (pathname === '/') {
      const element = document.getElementById(hashId);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      router.push('/');
      setTimeout(() => {
        const element = document.getElementById(hashId);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [pathname, router, closeMobileMenu]);

  return (
    <>
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
                src="/weareimpact-hart.webp"
                alt="WeAreImpact Logo"
                width={48}
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

          {/* Status badge — desktop only */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-50 border border-green-100 text-xs font-semibold text-green-800 whitespace-nowrap shrink-0">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
            AI &amp; Innovatie in het Sociaal Domein
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-10 text-sm font-medium tracking-wide text-slate-600">
            {navItems.map((item) =>
              item.isHash ? (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href, true)}
                  className={`hover:text-orange-600 transition-colors flex items-center gap-1 ${
                    item.highlight ? 'text-orange-600' : ''
                  }`}
                >
                  {item.icon && <item.icon size={14} />}
                  {item.label}
                </button>
              ) : (
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
              )
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button
              onClick={() => window.dispatchEvent(new CustomEvent('openBooking'))}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/30"
            >
              Let&apos;s Talk
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden relative z-[60] p-1"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span
              className={`block transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-90 opacity-100' : 'rotate-0 opacity-100'
              }`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
      />

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 bg-[#FDFBF7] shadow-2xl flex flex-col md:hidden transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <span className="font-bold text-slate-900 text-sm tracking-widest uppercase">Menu</span>
          <button onClick={closeMobileMenu} aria-label="Sluit menu">
            <X size={22} className="text-slate-500" />
          </button>
        </div>

        {/* Beschikbaarheid badge */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-green-50 border border-green-100 text-xs font-semibold text-green-800">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
            AI &amp; Innovatie in het Sociaal Domein
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col px-6 py-6 gap-1 flex-1">
          {navItems.map((item) =>
            item.isHash ? (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href, true)}
                className={`text-left py-3 text-sm font-semibold tracking-wider border-b border-slate-100 flex items-center gap-2 ${
                  item.highlight ? 'text-orange-600' : 'text-slate-700 hover:text-orange-600'
                } transition-colors`}
              >
                {item.icon && <item.icon size={14} />}
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMobileMenu}
                className={`py-3 text-sm font-semibold tracking-wider border-b border-slate-100 flex items-center gap-2 ${
                  item.highlight ? 'text-orange-600' : 'text-slate-700 hover:text-orange-600'
                } transition-colors`}
              >
                {item.icon && <item.icon size={14} />}
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* CTA */}
        <div className="px-6 py-6 border-t border-slate-100">
          <button
            onClick={() => {
              closeMobileMenu();
              window.dispatchEvent(new CustomEvent('openBooking'));
            }}
            className="w-full py-3.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-orange-600 transition-all duration-300"
          >
            Plan een gesprek
          </button>
        </div>
      </div>
    </>
  );
}
