import { Cpu, CheckCircle } from 'lucide-react';
import { AIScanner } from '@/components/features/AIScanner';

export function ScannerSection() {
  return (
    <section
      id="scan"
      className="py-24 bg-slate-900 text-white relative overflow-hidden"
    >
      {/* Background Tech Mesh */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#fb923c 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Cpu size={14} /> Interactive AI Tool
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ervaar de kracht van AI Strategie.
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Benieuwd waar jouw grootste groeikans ligt? Doe de gratis
              Quick-Scan. Onze AI analyseert direct je situatie en geeft
              strategisch advies op maat.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" /> Powered by
                AI
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" /> Direct
                resultaat
              </span>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <AIScanner />
          </div>
        </div>
      </div>
    </section>
  );
}
