'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, Clock, ArrowRight, Mic, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category_slug: string;
  reading_time: number;
  difficulty: string;
}

interface KennisbankSearchProps {
  placeholder?: string;
  autoFocus?: boolean;
  showPopularSearches?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

const POPULAR_SEARCHES = [
  'AI implementeren',
  'Vrijwilligersbeleid',
  'Subsidie aanvragen',
  'Impact meten',
  'LEGO Serious Play',
];

const CATEGORY_COLORS: Record<string, string> = {
  'sociaal-ondernemen': 'bg-orange-100 text-orange-700',
  'ai-tech': 'bg-blue-100 text-blue-700',
  'vrijwilligers': 'bg-green-100 text-green-700',
  'impact-meten': 'bg-purple-100 text-purple-700',
  'subsidie-funding': 'bg-yellow-100 text-yellow-700',
  'lego-serious-play': 'bg-red-100 text-red-700',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Gemiddeld',
  advanced: 'Gevorderd',
};

export function KennisbankSearch({
  placeholder = 'Zoek in de kennisbank...',
  autoFocus = false,
  showPopularSearches = true,
  onSearch,
  className,
}: KennisbankSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/kennisbank/search?q=${encodeURIComponent(query)}&limit=6`);
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          router.push(`/kennisbank/${results[selectedIndex].slug}`);
          setIsOpen(false);
        } else if (query.length >= 2) {
          router.push(`/kennisbank?q=${encodeURIComponent(query)}`);
          onSearch?.(query);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, selectedIndex, results, query, router, onSearch]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handlePopularSearch = (search: string) => {
    setQuery(search);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          size={20}
        />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full h-14 pl-12 pr-12 text-lg rounded-2xl border-slate-200 focus:border-orange-300 focus:ring-orange-200 shadow-sm"
        />
        {isLoading && (
          <Loader2
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
            size={20}
          />
        )}
        {!isLoading && query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Popular Searches */}
      {showPopularSearches && !query && !isOpen && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-sm text-slate-500">Populair:</span>
          {POPULAR_SEARCHES.map((search) => (
            <button
              key={search}
              onClick={() => handlePopularSearch(search)}
              className="text-sm text-slate-600 hover:text-orange-600 hover:underline transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      )}

      {/* Results Dropdown */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          {results.length > 0 ? (
            <>
              <div className="p-2">
                {results.map((result, index) => (
                  <Link
                    key={result.id}
                    href={`/kennisbank/${result.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl transition-colors',
                      index === selectedIndex
                        ? 'bg-orange-50'
                        : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="text-slate-400" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">
                        {result.title}
                      </div>
                      <div className="text-sm text-slate-500 line-clamp-1">
                        {result.excerpt}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          CATEGORY_COLORS[result.category_slug] || 'bg-slate-100 text-slate-600'
                        )}>
                          {result.category_slug.replace(/-/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {result.reading_time} min
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      className={cn(
                        'text-slate-300 flex-shrink-0 transition-colors',
                        index === selectedIndex && 'text-orange-500'
                      )}
                      size={16}
                    />
                  </Link>
                ))}
              </div>

              {/* View All Results */}
              <div className="border-t border-slate-100 p-3">
                <Link
                  href={`/kennisbank?q=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Bekijk alle resultaten
                  <ArrowRight size={14} />
                </Link>
              </div>
            </>
          ) : !isLoading ? (
            <div className="p-6 text-center">
              <div className="text-slate-400 mb-2">
                Geen resultaten gevonden voor &quot;{query}&quot;
              </div>
              <p className="text-sm text-slate-500">
                Probeer een andere zoekterm of{' '}
                <Link href="/kennisbank" className="text-orange-600 hover:underline">
                  bekijk alle artikelen
                </Link>
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
