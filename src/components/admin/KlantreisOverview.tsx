'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { KlantreisOverview as Overview } from '@/lib/crm/overview';

const TODO_LIMIT = 8;

export default function KlantreisOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch('/api/admin/klantreis')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) return null;
  if (!data) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <Loader2 size={24} className="animate-spin text-orange-600" />
        </CardContent>
      </Card>
    );
  }

  const todos = showAll ? data.todos : data.todos.slice(0, TODO_LIMIT);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Klantreis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-1">
            {data.funnel.map((stage, index) => (
              <Link
                key={stage.key}
                href={stage.href}
                className="group relative rounded-lg border border-slate-200 p-3 hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
              >
                <p className="text-xs font-medium text-slate-500">{stage.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stage.count}</p>
                {stage.detail && (
                  <p className={`text-xs mt-1 ${stage.alert ? 'text-red-600' : 'text-slate-500'}`}>{stage.detail}</p>
                )}
                {index < data.funnel.length - 1 && (
                  <ChevronRight
                    size={14}
                    className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-slate-300 bg-white rounded-full z-10"
                  />
                )}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Vandaag doen</CardTitle>
        </CardHeader>
        <CardContent>
          {data.todos.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-700 py-4">
              <CheckCircle2 size={18} />
              Niets dat blijft liggen — de klantreis is bij.
            </div>
          ) : (
            <ul className="space-y-1">
              {todos.map((todo, i) => {
                const body = (
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                        todo.severity === 'high' ? 'bg-red-500' : 'bg-amber-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-800">{todo.text}</p>
                      {todo.detail && <p className="text-xs text-slate-500">{todo.detail}</p>}
                    </div>
                    {todo.href && <ArrowRight size={14} className="mt-1 text-slate-400 shrink-0" />}
                  </div>
                );
                return (
                  <li key={i}>
                    {todo.href ? (
                      <Link href={todo.href} className="block rounded-md px-2 py-1.5 hover:bg-slate-50">
                        {body}
                      </Link>
                    ) : (
                      <div className="px-2 py-1.5">{body}</div>
                    )}
                  </li>
                );
              })}
              {data.todos.length > TODO_LIMIT && (
                <li>
                  <button
                    onClick={() => setShowAll((v) => !v)}
                    className="text-xs text-orange-600 hover:underline px-2 pt-1"
                  >
                    {showAll ? 'Minder tonen' : `Nog ${data.todos.length - TODO_LIMIT} tonen`}
                  </button>
                </li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
