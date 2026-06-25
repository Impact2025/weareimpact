'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ReadingItem {
  title: string;
  href: string;
  description: string;
}

interface RelevantReadingProps {
  items: ReadingItem[];
  title?: string;
}

export function RelevantReading({ items, title = 'Verder lezen' }: RelevantReadingProps) {
  if (!items.length) return null;

  return (
    <section className="mt-16 border-t border-slate-700/50 pt-12">
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-slate-400 mb-8">
        Meer weten over dit onderwerp? Lees verder in de kennisbank.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group block rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 transition-all hover:border-orange-500/40 hover:bg-slate-800/60"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                {item.title}
              </h3>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-orange-400 transition-colors mt-1" />
            </div>
            <p className="mt-2 text-sm text-slate-400 line-clamp-2">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
