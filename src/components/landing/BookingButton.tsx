'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BookingButton({ label = 'Koffie met Vincent' }: { label?: string }) {
  return (
    <Button
      size="lg"
      onClick={() => window.dispatchEvent(new CustomEvent('openBooking'))}
      className="px-8 py-4 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-all group shadow-xl shadow-orange-500/20 flex items-center gap-2"
    >
      {label}
      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
    </Button>
  );
}
