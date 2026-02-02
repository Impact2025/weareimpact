'use client';

import { useState, useEffect, useCallback } from 'react';
import { List, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

// Extract headings from markdown content with support for custom IDs {#custom-id}
function extractHeadings(content: string): TOCItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const customIdRegex = /\s*\{#([a-z0-9-]+)\}\s*$/i;
  const headings: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    let rawTitle = match[2].replace(/\*\*/g, '').trim();

    // Check for custom ID syntax {#custom-id}
    const customIdMatch = rawTitle.match(customIdRegex);
    let id: string;
    let title: string;

    if (customIdMatch) {
      // Use custom ID and strip it from title
      id = customIdMatch[1];
      title = rawTitle.replace(customIdRegex, '').trim();
    } else {
      // Generate ID from title (same logic as remark-slug)
      title = rawTitle;
      id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    headings.push({ id, title, level });
  }

  return headings;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);

  // Extract headings on mount
  useEffect(() => {
    const extracted = extractHeadings(content);
    setHeadings(extracted);
  }, [content]);

  // Scroll spy to highlight active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
        threshold: 0,
      }
    );

    // Observe all headings
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  if (headings.length < 3) {
    // Don't show TOC for short articles
    return null;
  }

  return (
    <nav className={cn('bg-white border border-slate-200 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <List size={18} />
          <span>Inhoudsopgave</span>
        </div>
        <ChevronUp
          size={18}
          className={cn(
            'text-slate-400 transition-transform',
            !isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <ul className="space-y-1">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
              >
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={cn(
                    'w-full text-left py-1.5 px-3 rounded-lg text-sm transition-all',
                    activeId === heading.id
                      ? 'bg-orange-50 text-orange-700 font-medium'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  {heading.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

// Reading Progress Bar Component
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(scrollProgress, 100));
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-50">
      <div
        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Scroll to Top Button
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 w-12 h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-40"
      aria-label="Scroll naar boven"
    >
      <ChevronUp size={24} />
    </button>
  );
}
