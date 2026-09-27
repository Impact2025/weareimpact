'use client';

import Link from 'next/link';
import { Check, ArrowRight, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { CompanyJourney as Journey, JourneyStep } from '@/lib/crm/journey';

const STATE_STYLES: Record<JourneyStep['state'], { dot: string; label: string }> = {
  done: { dot: 'bg-green-600 text-white border-green-600', label: 'text-slate-900' },
  current: { dot: 'bg-orange-600 text-white border-orange-600 ring-4 ring-orange-100', label: 'text-orange-700' },
  todo: { dot: 'bg-white text-slate-400 border-slate-300', label: 'text-slate-400' },
  skipped: { dot: 'bg-slate-100 text-slate-400 border-slate-200', label: 'text-slate-400' },
};

export function CompanyJourney({ journey }: { journey: Journey }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <ol className="grid grid-cols-5 gap-1">
          {journey.steps.map((step, index) => {
            const style = STATE_STYLES[step.state];
            const body = (
              <div className="flex flex-col items-center text-center gap-1">
                <div className="flex items-center w-full">
                  <div className={`h-0.5 flex-1 ${index === 0 ? 'opacity-0' : step.state === 'todo' ? 'bg-slate-200' : 'bg-green-600'}`} />
                  <div className={`h-8 w-8 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${style.dot}`}>
                    {step.state === 'done' ? <Check size={14} /> : step.state === 'skipped' ? <Minus size={14} /> : index + 1}
                  </div>
                  <div
                    className={`h-0.5 flex-1 ${
                      index === journey.steps.length - 1
                        ? 'opacity-0'
                        : journey.steps[index + 1].state === 'todo'
                          ? 'bg-slate-200'
                          : 'bg-green-600'
                    }`}
                  />
                </div>
                <span className={`text-xs sm:text-sm font-medium ${style.label}`}>{step.label}</span>
                {step.detail && <span className="hidden sm:block text-xs text-slate-500 leading-tight">{step.detail}</span>}
              </div>
            );
            return (
              <li key={step.key}>
                {step.href ? (
                  <Link href={step.href} className="block rounded-lg py-1 hover:bg-slate-50">
                    {body}
                  </Link>
                ) : (
                  <div className="py-1">{body}</div>
                )}
              </li>
            );
          })}
        </ol>

        {journey.nextAction && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-orange-50 border border-orange-200 px-4 py-2 text-sm">
            <span className="text-orange-800">
              <span className="font-medium">Volgende stap:</span> {journey.nextAction.text}
            </span>
            {journey.nextAction.href && (
              <Link href={journey.nextAction.href} className="text-orange-700 font-medium flex items-center gap-1 shrink-0 hover:underline">
                Ga naar <ArrowRight size={14} />
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
