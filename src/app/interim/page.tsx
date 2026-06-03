'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Linkedin,
  ArrowUpRight,
  CheckCircle,
  MapPin,
  Clock,
  CalendarDays,
  Download,
  Users,
  Zap,
  Building2,
  TrendingUp,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  Quote,
  Award,
  Star,
  Briefcase,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── DATA ─────────────────────────────────────────────────────────── */

const rollen = [
  {
    code: '01',
    titel: 'Interim Projectleider',
    sub: 'Welzijn & Sociaal Domein',
    icon: Building2,
    kleur: 'from-orange-500 to-orange-600',
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    omschrijving:
      'Voor organisaties die een AI- of innovatieproject moeten realiseren maar missen wie het ook echt trekt. Van scope-definitie en stakeholdermanagement tot oplevering en overdracht aan het eigen team.',
    wanneer: [
      'Nieuw AI- of digitaliseringsproject zonder interne trekker',
      'Bestaand project dat dreigt te stranden op mensen of planning',
      'Bestuur dat regie wil houden maar uitvoering mist',
    ],
  },
  {
    code: '02',
    titel: 'Kwartiermaker',
    sub: 'Innovatie & AI',
    icon: Zap,
    kleur: 'from-violet-500 to-violet-600',
    border: 'border-violet-200',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    omschrijving:
      'Voor organisaties die een nieuwe werkwijze, afdeling of AI-functie moeten opzetten maar geen blauwdruk hebben. Van visie naar structuur, van idee naar bewezen concept — in 3 tot 6 maanden klaar voor overdracht.',
    wanneer: [
      'Fusie of reorganisatie waarbij innovatie een nieuwe plek krijgt',
      'AI-strategie die van papier naar uitvoering moet',
      'Nieuwe dienst of aanpak die bewezen moet worden',
    ],
  },
  {
    code: '03',
    titel: 'Verandermanager',
    sub: 'Digitale Transformatie',
    icon: Users,
    kleur: 'from-emerald-500 to-emerald-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    omschrijving:
      'Voor organisaties die een systeem hebben ingevoerd maar de adoptie mist. Of die weten dat een verandering nodig is maar vastlopen op weerstand. Draagvlak van binnenuit — met de taal van werkvloer én boardroom.',
    wanneer: [
      'Nieuw platform of systeem dat niet landt bij medewerkers',
      'Cultuurverandering die vastloopt op angst of weerstand',
      'Kloof tussen directie en werkvloer die de voortgang blokkeert',
    ],
  },
];

const kerncijfers = [
  { waarde: '25+', label: 'jaar directie & management', kleur: 'text-orange-400' },
  { waarde: '10+', label: 'jaar specifiek sociaal domein', kleur: 'text-violet-400' },
  { waarde: '70.000+', label: 'geluksmomenten gerealiseerd', kleur: 'text-emerald-400' },
  { waarde: '700+', label: 'deelnemers aangestuurd', kleur: 'text-sky-400' },
  { waarde: '180', label: 'vrijwilligers gemanaged', kleur: 'text-amber-400' },
  { waarde: '4+', label: 'live AI-platforms gebouwd', kleur: 'text-rose-400' },
];

const tijdlijn = [
  {
    periode: '2023 – 2025',
    rol: 'Directeur',
    org: 'Stichting De Baan',
    locatie: 'Haarlem',
    type: 'sociaal domein',
    resultaten: [
      '700+ deelnemers en 180 vrijwilligers — strategische én operationele leiding',
      '70.000+ geluksmomenten per jaar — aantoonbare maatschappelijke impact',
      'Strategische subsidies verworven voor renovatie & grootschalige verduurzaming',
      'Eigen AI-assistent ontwikkeld voor efficiëntere rapportages en fondsenwerving',
    ],
  },
  {
    periode: '2022',
    rol: 'Manager Strategie & Innovatie',
    org: 'MeerWaarde',
    locatie: 'Nederland',
    type: 'innovatie',
    resultaten: [
      'Ontwikkeling en implementatie van strategische verander- en innovatietrajecten',
    ],
  },
  {
    periode: '2018 – heden',
    rol: 'Oprichter & Strategic Innovation Partner',
    org: 'WeAreImpact',
    locatie: 'Hoofddorp',
    type: 'ondernemer',
    resultaten: [
      'Bijeen.app: AI-gestuurde community tool voor welzijn & gemeenten',
      'Iris: eigen AI-assistent voor professionals in het sociaal domein',
      'De Impact Box (2021–2025): inclusief werkgeverschap voor mensen met beperking',
      'AI-strategie & verandermanagement voor welzijnsorganisaties en gemeenten',
    ],
  },
  {
    periode: '2013 – 2022',
    rol: 'Voorzitter / Directeur (t/m 2018)',
    org: 'Stichting Philia',
    locatie: 'Landelijk',
    type: 'sociaal domein',
    resultaten: [
      'OogvoorLiefde.nl: grootste datingsite voor mensen met een beperking in NL',
      'DatingAssistent.nl: AI-platform, bekend van tv (o.a. SynDROOM)',
      'Strategisch meerjarenbeleid, Theory of Change en landelijke fondsenwerving',
      '9 jaar leidinggeven aan vrijwilligers, projectmedewerkers en landelijke netwerken',
    ],
  },
  {
    periode: '2011 – 2013',
    rol: 'General Manager',
    org: 'Baran Sanitair BV',
    locatie: 'Nederland',
    type: 'management',
    resultaten: [
      'Opstart, positionering en leiding van exclusieve showroom (6 fte)',
      'Succesvolle marktintroductie en online groei',
    ],
  },
  {
    periode: '2010 – 2011',
    rol: 'Interim Projectmanager / Operations Manager',
    org: 'PMT',
    locatie: 'Nederland',
    type: 'interim',
    resultaten: [
      'Herstructurering bedrijfsprocessen, opzet Operations-team',
      'Implementatie projectmanagementsysteem',
    ],
  },
];

const opleidingen = [
  { jaar: '2025', titel: 'Facilitator / Coach LEGO® Serious Play', inst: 'Gecertificeerd', highlight: true },
  { jaar: '2018', titel: 'Grow Impact programma', inst: 'Social Enterprise NL', highlight: false },
  { jaar: '2017', titel: 'Sociaal Ondernemen', inst: 'Nyenrode Business Universiteit', highlight: true },
  { jaar: '2016', titel: 'Groeiprogramma', inst: 'Oranje Fonds', highlight: false },
  { jaar: '1998–2001', titel: 'International Management', inst: 'HES Amsterdam', highlight: false },
];

const tools = ['Claude AI', 'ChatGPT', 'Gemini', 'Perplexity', 'GROK', 'Zapier', 'Midjourney', 'HeyGen', 'Next.js', 'SEO & SEA', 'Analytics', 'Photoshop'];

const typeKleur: Record<string, string> = {
  'sociaal domein': 'bg-orange-100 text-orange-700',
  'innovatie': 'bg-violet-100 text-violet-700',
  'ondernemer': 'bg-emerald-100 text-emerald-700',
  'management': 'bg-sky-100 text-sky-700',
  'interim': 'bg-amber-100 text-amber-700',
};

/* ─── COMPONENT ─────────────────────────────────────────────────────── */

export default function InterimProfiel() {
  const openBookingChat = () => {
    window.dispatchEvent(new CustomEvent('openBooking'));
  };

  return (
    <>

      {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
      <header className="relative bg-[#0a0f1e] overflow-hidden">
        {/* achtergrond gloed */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-orange-600/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        {/* top accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-400 via-orange-500 to-violet-500" />

        <div className="container mx-auto px-6 max-w-6xl pt-32 pb-20 relative z-10">
          <div className="grid lg:grid-cols-[1fr_340px] gap-16 items-center">

            {/* ── Links ── */}
            <div>
              {/* beschikbaarheid */}
              <div className="flex flex-wrap gap-2.5 mb-10">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 font-bold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Beschikbaar per direct
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold">
                  <Clock size={12} />
                  16–24 uur · 3 dagen/week
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold">
                  <MapPin size={12} />
                  Amsterdam · Haarlem · Leiden
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold">
                  <TrendingUp size={12} />
                  €125–€140 / uur
                </div>
              </div>

              {/* naam + titel */}
              <p className="text-orange-400 font-black text-xs uppercase tracking-[4px] mb-4">Interim Profiel</p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.02] tracking-tight mb-3">
                Vincent<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  van Münster
                </span>
              </h1>
              <p className="text-slate-300 text-xl font-semibold mb-8 tracking-wide">
                Strategic Innovation Partner &amp; Interim Manager
              </p>

              {/* drie rollen */}
              <div className="flex flex-col gap-2.5 mb-10">
                {[
                  { titel: 'Interim Projectleider Welzijn & Sociaal Domein', kleur: 'text-orange-400' },
                  { titel: 'Kwartiermaker Innovatie & AI', kleur: 'text-violet-400' },
                  { titel: 'Verandermanager Digitale Transformatie', kleur: 'text-emerald-400' },
                ].map((r) => (
                  <div key={r.titel} className="flex items-center gap-3">
                    <ChevronRight size={14} className={r.kleur} />
                    <span className="text-slate-300 text-sm font-medium">{r.titel}</span>
                  </div>
                ))}
              </div>

              {/* openingszin */}
              <p className="text-slate-400 text-lg leading-relaxed max-w-xl mb-10 border-l-2 border-orange-500/40 pl-5">
                Geen IT-consultant die een systeem oplevert en vertrekt. Maar iemand die de taal van de werkvloer én de boardroom spreekt — en zorgt dat het ook echt landt.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={openBookingChat}
                  className="px-7 py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-bold shadow-2xl shadow-orange-500/25 flex items-center gap-2 transition-all"
                >
                  Plan een verkenning
                  <ArrowRight size={16} />
                </Button>
                <a
                  href="/cv-vincent-van-munster.pdf"
                  download
                  className="flex items-center gap-2 px-7 py-3.5 bg-white/8 hover:bg-white/15 text-white border border-white/15 rounded-full font-semibold text-sm transition-all backdrop-blur-sm"
                >
                  <Download size={15} />
                  Download CV (PDF)
                </a>
                <a
                  href="https://www.linkedin.com/in/vincentvanmunster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-full font-semibold text-sm transition-all"
                >
                  <Linkedin size={14} />
                  LinkedIn
                </a>
              </div>
            </div>

            {/* ── Rechts: foto + directe contact ── */}
            <div className="flex flex-col items-center gap-6">
              {/* foto */}
              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-orange-500/30 to-violet-500/20 blur-2xl scale-110" />
                <div className="relative w-56 h-64 rounded-[2rem] overflow-hidden ring-1 ring-white/10 shadow-2xl">
                  <Image
                    src="/vincent-van-munster.png"
                    alt="Vincent van Münster — Interim Strategic Innovation Partner"
                    width={224}
                    height={256}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-green-500 rounded-full text-white text-xs font-black shadow-xl whitespace-nowrap">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Beschikbaar per direct
                </div>
              </div>

              {/* directe contactkaart */}
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Direct contact</p>
                <div className="flex flex-col gap-3">
                  <a href="tel:+31614470977" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors text-sm font-semibold group">
                    <div className="w-8 h-8 bg-orange-500/15 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                      <Phone size={13} className="text-orange-400" />
                    </div>
                    06 – 144 709 77
                  </a>
                  <a href="mailto:v.munster@weareimpact.nl" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors text-sm font-semibold group">
                    <div className="w-8 h-8 bg-orange-500/15 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                      <Mail size={13} className="text-orange-400" />
                    </div>
                    v.munster@weareimpact.nl
                  </a>
                  <a href="https://www.linkedin.com/in/vincentvanmunster" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors text-sm font-semibold group">
                    <div className="w-8 h-8 bg-orange-500/15 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                      <Linkedin size={13} className="text-orange-400" />
                    </div>
                    linkedin.com/in/vincentvanmunster
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ KERNCIJFERS ═════════════════════════════════════════════════ */}
      <section className="bg-slate-900 border-y border-slate-800">
        <div className="container mx-auto px-6 max-w-6xl py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {kerncijfers.map((k) => (
              <div key={k.label} className="text-center">
                <div className={`text-3xl md:text-4xl font-black mb-1.5 ${k.kleur}`}>{k.waarde}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider leading-snug">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WAT VINCENT ANDERS MAAKT ════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                De superpower
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
                Niet de consultant die een rapport schrijft en vertrekt.
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                Wat mij onderscheidt is de combinatie die bijna niemand heeft: <strong>25 jaar directie- en managementervaring</strong> in het sociaal domein én de <strong>hands-on technologische executiekracht</strong> om het zelf te bouwen en te laten werken.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Ik kan een toekomstgerichte koers uitzetten en de businesscase presenteren aan bestuurders — én met de voeten in de klei het team meenemen in de verandering. Ik spreek de taal van de werkvloer én die van de boardroom.
              </p>

              <div className="space-y-3">
                {[
                  'Strategische visie én operationele daadkracht',
                  'Sectorkennnis van binnenuit — geen buitenstaander die het uitlegt',
                  'Bouwt AI-tools zelf — geen leverancier nodig om te begrijpen',
                  'In 16 uur bereik ik wat anderen 32 uur kost',
                  'Komt om overbodig te worden — niet om te verlengen',
                ].map((punt) => (
                  <div key={punt} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium">{punt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-8 -right-8 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-60" />
              <div className="relative bg-slate-900 text-white rounded-3xl p-10 shadow-2xl">
                <div className="absolute top-6 right-6 opacity-10"><Quote size={80} /></div>
                <p className="text-2xl font-black leading-snug mb-6">
                  &ldquo;Mijn succes ontstaat altijd vanuit verbinding — waarbij deelnemers, medewerkers, bestuur en partners zich gezien en gehoord voelen.&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-700">
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                    <Image src="/vincent-van-munster.png" alt="Vincent" width={48} height={48} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Vincent van Münster</p>
                    <p className="text-slate-400 text-xs">Strategic Innovation Partner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DRIE ROLLEN ═════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Functieprofiel
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Inzetbaar als
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {rollen.map((rol) => (
              <div key={rol.code} className="group bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${rol.kleur} flex items-center justify-center mb-4 shadow-lg`}>
                    <rol.icon size={22} className="text-white" />
                  </div>
                  <p className={`text-xs font-black uppercase tracking-widest ${rol.text} mb-1`}>{rol.code}</p>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{rol.titel}</h3>
                  <p className={`text-sm font-semibold ${rol.text}`}>{rol.sub}</p>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">{rol.omschrijving}</p>

                <div className={`rounded-xl ${rol.bg} ${rol.border} border p-4`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${rol.text} mb-3`}>Wanneer inzetbaar</p>
                  <div className="space-y-2">
                    {rol.wanneer.map((w) => (
                      <div key={w} className="flex items-start gap-2 text-slate-700 text-xs font-medium">
                        <ChevronRight size={12} className={`${rol.text} shrink-0 mt-0.5`} />
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TIJDLIJN / TRACK RECORD ═════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Werkervaring
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Bewezen in de praktijk
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Elk resultaat hieronder is gerealiseerd in een echte organisatie, met echte mensen, onder echte tijdsdruk.
            </p>
          </div>

          <div className="relative">
            {/* tijdlijn-lijn */}
            <div className="absolute left-[7.5rem] top-0 bottom-0 w-px bg-slate-100 hidden md:block" />

            <div className="flex flex-col gap-0">
              {tijdlijn.map((item, i) => (
                <div key={i} className="group relative md:grid md:grid-cols-[120px_1fr] gap-8 pb-10 last:pb-0">
                  {/* periode */}
                  <div className="hidden md:flex flex-col items-end gap-2 pt-1">
                    <p className="text-xs font-black text-orange-500 text-right leading-tight">{item.periode}</p>
                    <div className="w-3 h-3 rounded-full bg-white border-2 border-orange-400 absolute right-0 top-1.5 translate-x-[calc(100%+2rem+1.5px)]" />
                  </div>

                  {/* kaart */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-7 hover:shadow-xl hover:border-orange-100 transition-all duration-300">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="md:hidden text-xs font-black text-orange-500 mb-1">{item.periode}</p>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">{item.rol}</h3>
                        <p className="text-slate-500 text-sm font-semibold">{item.org}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${typeKleur[item.type]}`}>
                          {item.type}
                        </span>
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-full text-[10px] font-semibold text-slate-400 border border-slate-100">
                          <MapPin size={9} />
                          {item.locatie}
                        </span>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {item.resultaten.map((r) => (
                        <div key={r} className="flex items-start gap-2 text-slate-600 text-sm">
                          <Star size={12} className="text-orange-400 shrink-0 mt-0.5" />
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS PLACEHOLDER ════════════════════════════════════ */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Referenties
            </div>
            <h2 className="text-4xl font-black text-slate-900">Wat anderen zeggen</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { naam: 'Beschikbaar op aanvraag', functie: 'Directeur welzijnsorganisatie', tekst: 'Referenties van directeuren en bestuurders uit het sociaal domein zijn beschikbaar na een eerste kennismakingsgesprek.' },
              { naam: 'Beschikbaar op aanvraag', functie: 'Manager Strategie & Innovatie', tekst: 'Concrete resultaten en getuigenissen van eerdere opdrachtgevers deel ik graag persoonlijk — inclusief contactgegevens voor verificatie.' },
              { naam: 'Beschikbaar op aanvraag', functie: 'Bestuurder gemeente', tekst: 'Een portfolio van gerealiseerde projecten en de naam van betrokken stakeholders is beschikbaar voor serieuze kandidaat-opdrachtgevers.' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <div className="mb-5 text-orange-300"><Quote size={32} /></div>
                <p className="text-slate-600 leading-relaxed text-sm italic mb-6">{t.tekst}</p>
                <div className="pt-5 border-t border-slate-100">
                  <p className="font-black text-slate-900 text-sm">{t.naam}</p>
                  <p className="text-slate-400 text-xs font-medium">{t.functie}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-slate-500 text-sm mb-4">Referenties en portfolio beschikbaar na eerste contact</p>
            <Button
              onClick={openBookingChat}
              variant="outline"
              className="px-7 py-3 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2 mx-auto"
            >
              Vraag referenties op
              <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ WERKWIJZE — SPELREGELS ══════════════════════════════════════ */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Werkwijze
            </div>
            <h2 className="text-4xl font-black">Hoe ik werk als interim</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Geen winkeloppasser. Een doorbreker. Ik kom met spelregels die werken voor beide partijen.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Clock, titel: 'Max. 3 dagen/week', sub: '16–24 uur bewust beperkt', tekst: 'Dankzij 25 jaar ervaring en AI-tooling doe ik in 16 uur wat een ander 32 uur kost. U koopt impact, geen uren.' },
              { icon: CalendarDays, titel: '3 tot 6 maanden', sub: 'Start binnen 2–4 weken', tekst: 'Lang genoeg voor echte verandering, kort genoeg om scherp te blijven. Ik kom om overbodig te worden.' },
              { icon: MapPin, titel: 'Regio A\'dam · Haarlem · Leiden', sub: 'Hybride werken is de norm', tekst: 'Primair in de regio. Incidenteel landelijk. Aanwezigheid op cruciale momenten altijd vanzelfsprekend.' },
              { icon: TrendingUp, titel: '€125–€140 per uur', sub: 'All-in, geen verrassingen', tekst: 'Projectmatige afspraken bespreekbaar. We starten altijd met een gratis verkenning van 30 minuten.' },
            ].map((s) => (
              <div key={s.titel} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-7 hover:border-orange-500/40 transition-colors duration-300">
                <div className="w-10 h-10 bg-orange-500/15 rounded-xl flex items-center justify-center mb-5">
                  <s.icon size={20} className="text-orange-400" />
                </div>
                <h3 className="font-black text-white text-sm mb-1">{s.titel}</h3>
                <p className="text-orange-400 text-xs font-bold mb-3">{s.sub}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{s.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTOREN ════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">Sectoren</div>
            <h2 className="text-3xl font-black text-slate-900">Thuis in het sociaal domein</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { code: 'WZ', label: 'Welzijn & zorg', tekst: 'Dagbesteding, vrijwilligerscentrales, buurtteams, jeugdhulp, maatschappelijke opvang' },
              { code: 'GM', label: 'Gemeenten', tekst: 'Sociaal domein, Wmo, participatie, digitale dienstverlening, beleid & uitvoering' },
              { code: 'SO', label: 'Sociaal ondernemers', tekst: 'Impact-gedreven organisaties die willen groeien zonder menselijke maat te verliezen' },
              { code: 'NP', label: 'Non-profit', tekst: 'Fondsen, koepelorganisaties en maatschappelijke ondernemingen in transitie' },
            ].map((s) => (
              <div key={s.code} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-orange-600 font-black text-xs">{s.code}</span>
                </div>
                <h3 className="font-black text-slate-900 text-sm mb-2">{s.label}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OPLEIDING + TOOLS ═══════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Opleiding */}
            <div>
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                Opleiding & certificering
              </div>
              <div className="flex flex-col gap-3">
                {opleidingen.map((o) => (
                  <div key={o.jaar} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${o.highlight ? 'bg-white border-orange-100 shadow-sm' : 'bg-white border-slate-100'}`}>
                    <div className="w-16 shrink-0 pt-0.5">
                      <span className="text-xs font-black text-orange-500">{o.jaar}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{o.titel}</p>
                      <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
                        {o.highlight && <Award size={10} className="text-orange-400" />}
                        {o.inst}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools + talen */}
            <div>
              <div className="inline-block px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                AI-tools & technologie
              </div>
              <div className="flex flex-wrap gap-2 mb-10">
                {tools.map((tool) => (
                  <span key={tool} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm hover:border-orange-200 transition-colors">
                    {tool}
                  </span>
                ))}
              </div>

              <div className="inline-block px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest mb-5">
                Talen
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div>
                    <p className="font-black text-slate-900 text-sm">Nederlands</p>
                    <p className="text-slate-400 text-xs">Moedertaal</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div>
                    <p className="font-black text-slate-900 text-sm">Engels</p>
                    <p className="text-slate-400 text-xs">Goed in woord en geschrift</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ OVER VINCENT ════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#0f172a] text-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-[200px_1fr] gap-12 items-start">
            <div className="flex flex-col items-center md:items-start gap-5">
              <div className="relative">
                <div className="w-36 h-36 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                  <Image src="/vincent-van-munster.png" alt="Vincent van Münster" width={144} height={144} className="w-full h-full object-cover" />
                </div>
                <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0f172a] shadow" />
              </div>
              <div className="text-center md:text-left">
                <p className="font-black text-white text-sm">Vincent van Münster</p>
                <p className="text-orange-400 text-xs font-semibold">Strategic Innovation Partner</p>
                <p className="text-slate-500 text-xs mt-0.5">Nieuw-Vennep · 25 mrt 1977</p>
              </div>
              <a
                href="https://www.linkedin.com/in/vincentvanmunster"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-full transition-colors"
              >
                <Linkedin size={12} />
                LinkedIn profiel
                <ArrowUpRight size={10} className="opacity-50" />
              </a>
            </div>

            <div>
              <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">Over Vincent</div>
              <p className="text-slate-200 text-lg leading-relaxed mb-5">
                Tot oktober 2025 was ik directeur van Stichting De Baan in Haarlem — een welzijnsorganisatie met 180 vrijwilligers, 700+ deelnemers en 70.000+ geluksmomenten per jaar voor mensen met een verstandelijke beperking. Daarvoor negen jaar voorzitter en directeur van Stichting Philia, waar ik onder andere OogvoorLiefde.nl en DatingAssistent opbouwde (bekend van tv, o.a. SynDROOM).
              </p>
              <p className="text-slate-400 leading-relaxed mb-5">
                Naast mijn bestuurlijke ervaring bouw ik al jaren eigen AI-platforms: Bijeen.app voor evenementenbeheer in de welzijnssector, Iris als AI-assistent voor sociaal werkers en diverse andere initiatieven onder WeAreImpact. Die hands-on technologische kennis — gecombineerd met 25 jaar managementervaring in het hart van de sector — maakt mij tot de vertaler die organisaties nodig hebben.
              </p>
              <p className="text-slate-400 leading-relaxed mb-8">
                Als gecertificeerd LEGO® Serious Play facilitator begeleid ik teams bij het bouwen van draagvlak voor verandering. In één dag meer bereiken dan maanden vergaderen. Gepassioneerd door innovatie, AI-tools en maatschappelijke vraagstukken. Vader van twee kinderen, tennist, fietst en zeilt graag.
              </p>
              <div className="p-6 bg-slate-800/60 rounded-xl border-l-4 border-orange-500 italic text-slate-300 text-sm leading-relaxed">
                &ldquo;Mijn kracht ligt in het ontlasten van professionals in de praktijk — niet met theoretische plannen maar met werkende, innovatieve oplossingen. Enthousiast, respectvol en resultaatgericht, altijd met een scherp oog voor de bedoeling en het lef om te vernieuwen.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
            {/* gradient top */}
            <div className="h-2 bg-gradient-to-r from-green-400 via-orange-500 to-violet-500" />

            <div className="p-10 md:p-16">
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-black">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Beschikbaar per direct
                </div>
                <span className="text-slate-400 text-sm">16–24 uur/week · €125–€140/u · Amsterdam / Haarlem / Leiden</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-5 leading-tight">
                Heeft u een project dat een <span className="text-orange-600">doorbreker</span> nodig heeft?
              </h2>
              <p className="text-slate-600 text-lg mb-10 max-w-2xl leading-relaxed">
                In 30 minuten is duidelijk of ik de juiste match ben voor uw opdracht. Geen verkooppraatje — gewoon een eerlijk gesprek over uw situatie en wat het vraagt.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Button
                  onClick={openBookingChat}
                  size="lg"
                  className="px-8 py-4 bg-orange-600 text-white rounded-full font-black hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/25 flex items-center gap-2"
                >
                  Plan een strategische verkenning
                  <ArrowRight size={18} />
                </Button>
                <a
                  href="/cv-vincent-van-munster.pdf"
                  download
                  className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all text-sm"
                >
                  <Download size={16} />
                  Download CV (PDF)
                </a>
              </div>

              {/* directe contactgegevens */}
              <div className="grid sm:grid-cols-3 gap-4 pt-8 border-t border-slate-100">
                <a href="tel:+31614470977" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors shrink-0">
                    <Phone size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bel direct</p>
                    <p className="text-slate-800 font-bold text-sm">06 – 144 709 77</p>
                  </div>
                </a>
                <a href="mailto:v.munster@weareimpact.nl" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors shrink-0">
                    <Mail size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">E-mail</p>
                    <p className="text-slate-800 font-bold text-sm truncate">v.munster@weareimpact.nl</p>
                  </div>
                </a>
                <a href="https://www.linkedin.com/in/vincentvanmunster" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors shrink-0">
                    <Linkedin size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LinkedIn</p>
                    <p className="text-slate-800 font-bold text-sm">Vincent van Münster</p>
                  </div>
                </a>
              </div>

              {/* cross-links */}
              <div className="pt-8 mt-4 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Meer van WeAreImpact</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'AI Strategie Consultant', href: '/ai-strategie-consultant' },
                    { label: 'Change Management', href: '/change-management-digitale-transformatie' },
                    { label: 'Programmamanager', href: '/programmamanager-digitale-transformatie' },
                    { label: 'Verandermanagement AI', href: '/interim-verandermanagement-ai-sociaal-domein' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-100 rounded-full text-xs font-semibold transition-all"
                    >
                      {link.label}
                      <ExternalLink size={10} className="opacity-40" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
