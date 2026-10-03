'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { event } from '@/components/analytics';
import type { AiPmFaq } from '@/lib/ai-pm-pages';

export function FaqAccordion({ faqs, slug }: { faqs: AiPmFaq[]; slug: string }) {
  return (
    <Accordion
      type="single"
      collapsible
      className="space-y-3"
      onValueChange={(v) => {
        if (v) event({ action: 'faq_open', category: 'Engagement', label: `${slug}:${v}` });
      }}
    >
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={`faq-${i}`} className="bg-white border border-slate-200 rounded-lg px-6 overflow-hidden">
          <AccordionTrigger className="text-left hover:no-underline py-5 text-slate-900 font-medium">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-slate-600 pb-5 leading-relaxed">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
