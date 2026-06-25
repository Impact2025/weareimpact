import Image from 'next/image';
import Link from 'next/link';
import { Linkedin, ArrowUpRight } from 'lucide-react';

const stats = [
  { value: '15+', label: 'Jaar ervaring' },
  { value: '2', label: 'Live platforms' },
  { value: 'LSP', label: 'Certified facilitator' },
  { value: 'AI', label: 'Gedreven aanpak' },
];

const expertise = [
  'Interim AI-implementatie voor welzijnsorganisaties',
  'Schaalbare platforms voor gemeenten en stichtingen',
  'LEGO® Serious Play voor organisatieverandering',
];

export function About() {
  return (
    <section id="over" className="py-24 bg-[#1e293b] text-white">
      <div className="container mx-auto px-6 max-w-4xl">

        <div className="flex flex-col items-center text-center">
          {/* Profile photo */}
          <Link href="/vincent-van-munster" className="relative mb-8 block">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-slate-600 ring-offset-4 ring-offset-[#1e293b] hover:ring-orange-500/60 transition-all duration-200">
              <Image
                src="/vincent-van-munster.webp"
                alt="Vincent van Munster"
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#1e293b]" />
          </Link>

          {/* Quote */}
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">
            &ldquo;Ik geloof dat technologie er is om menselijk talent te laten
            bloeien, niet om het te vervangen.&rdquo;
          </h2>

          {/* Bio */}
          <p className="text-slate-400 text-lg mb-6 leading-relaxed max-w-2xl">
            Ik ben Vincent van Munster. Sociaal ondernemer, gecertificeerd{' '}
            <span className="text-orange-400 font-bold">LEGO&reg; Serious Play</span>{' '}
            facilitator en oprichter van platforms die dagelijks impact maken
            voor gemeenten, stichtingen en zorginstellingen.
          </p>

          {/* Expertise bullets */}
          <ul className="text-left space-y-2 mb-10 max-w-lg w-full">
            {expertise.map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-300 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-10">
            {stats.map((stat) => (
              <div key={stat.label} className="p-5 bg-slate-800 rounded-2xl">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* LinkedIn */}
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://www.linkedin.com/in/vincentvanmunster"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-full transition-colors duration-200"
            >
              <Linkedin size={15} />
              Verbind op LinkedIn
              <ArrowUpRight size={13} className="opacity-60" />
            </a>
            <Link href="/vincent-van-munster" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-full transition-colors duration-200">
              Profiel Vincent van Munster
              <ArrowUpRight size={13} className="opacity-60" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
