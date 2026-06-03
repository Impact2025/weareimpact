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
  Briefcase,
  Users,
  Zap,
  Layers,
  Building2,
  Heart,
  TrendingUp,
  BarChart3,
  Star,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const rollen = [
  {
    code: '01',
    titel: 'Interim Projectleider Welzijn & Sociaal Domein',
    icon: Building2,
    kleur: 'border-l-orange-400',
    accentBg: 'bg-orange-50',
    accentText: 'text-orange-600',
    omschrijving:
      'Voor organisaties die een AI- of innovatieproject moeten realiseren maar missen wie het ook echt trekt. Ik neem tijdelijk de projectleiding: van scope-definitie en stakeholdermanagement tot oplevering en overdracht.',
    wanneer: [
      'Nieuw AI- of digitaliseringsproject zonder interne trekker',
      'Bestaand project dat dreigt te stranden',
      'Bestuur dat regie wil houden maar executie mist',
    ],
  },
  {
    code: '02',
    titel: 'Kwartiermaker Innovatie & AI',
    icon: Zap,
    kleur: 'border-l-violet-400',
    accentBg: 'bg-violet-50',
    accentText: 'text-violet-600',
    omschrijving:
      'Voor organisaties die een nieuwe werkwijze, afdeling of AI-functie moeten opzetten maar geen blauwdruk hebben. Ik maak de weg vrij: van visie naar structuur, van idee naar bewezen concept — in 3 tot 6 maanden klaar voor overdracht.',
    wanneer: [
      'Fusie of reorganisatie waarbij innovatie een nieuwe plek krijgt',
      'AI-strategie die concreet moet worden',
      'Nieuwe dienst of aanpak die bewezen moet worden',
    ],
  },
  {
    code: '03',
    titel: 'Verandermanager Digitale Transformatie',
    icon: Users,
    kleur: 'border-l-emerald-400',
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-600',
    omschrijving:
      'Voor organisaties die een systeem hebben ingevoerd maar de adoptie mist. Of die weten dat een verandering nodig is maar tegen de weerstand aanlopen. Ik bouw draagvlak van binnenuit — met de taal van de werkvloer én de boardroom.',
    wanneer: [
      'Nieuw systeem of platform dat niet landt bij medewerkers',
      'Cultuurverandering die vastloopt op weerstand',
      'Directie en werkvloer die langs elkaar heen praten',
    ],
  },
];

const trackrecord = [
  {
    periode: '2020 – okt. 2025',
    rol: 'Directeur',
    org: 'Stichting De Baan',
    locatie: 'Haarlem',
    resultaten: [
      '700+ deelnemers en 180 vrijwilligers aangestuurd',
      'Processen gedigitaliseerd — administratieve druk significant verlaagd',
      'DAAR-platform (VrijwilligersCheck + Impact Reserve) gelanceerd',
      '70.000+ geluksmomenten gecreëerd voor mensen in kwetsbare posities',
    ],
  },
  {
    periode: '2019 – heden',
    rol: 'Oprichter & Strategic Innovation Partner',
    org: 'WeAreImpact',
    locatie: 'Amsterdam',
    resultaten: [
      'Bijeen.app gebouwd: AI-gestuurde eventmanagement voor welzijn & gemeenten',
      'DatingAssistent: landelijk AI proof-of-concept platform',
      'Iris: eigen AI-assistent voor professionals in het sociaal domein',
      'AI-strategie & verandermanagement voor welzijnsorganisaties en gemeenten',
    ],
  },
  {
    periode: 'Lopend',
    rol: 'Gecertificeerd facilitator',
    org: 'LEGO® Serious Play — SteentjeBijSteentje',
    locatie: 'Landelijk (max. 10 sessies/jaar)',
    resultaten: [
      'Teams AI-ready in één dag — meer draagvlak dan maanden vergaderen',
      'Bewezen bij directies, MT\'s en werkvloer in het sociaal domein',
      'Gecertificeerd LEGO® Serious Play facilitator',
    ],
  },
];

const competenties = [
  { label: 'AI-implementatie & adoptie', niveau: 95 },
  { label: 'Verandermanagement', niveau: 95 },
  { label: 'Strategische planning', niveau: 90 },
  { label: 'Stakeholdermanagement', niveau: 90 },
  { label: 'LEGO® Serious Play facilitatie', niveau: 88 },
  { label: 'Projectleiding (Agile/Prince2-minded)', niveau: 85 },
  { label: 'AI Governance & AVG', niveau: 82 },
  { label: 'Softwareontwikkeling (Next.js / AI-stack)', niveau: 80 },
];

const spelregels = [
  {
    icon: Clock,
    titel: 'Maximaal 3 dagen per week',
    tekst:
      'Bewust beperkt tot 16–24 uur per week. Dankzij 25 jaar ervaring en AI-tooling doe ik in 16 uur wat een ander 32 uur kost. U koopt geen uren — u koopt impact.',
  },
  {
    icon: CalendarDays,
    titel: '3 tot 6 maanden',
    tekst:
      'Lang genoeg om echte verandering te realiseren, kort genoeg om scherp te blijven. Na het traject staat uw organisatie er zelfstandig voor. Ik kom om overbodig te worden.',
  },
  {
    icon: MapPin,
    titel: 'Regio Amsterdam / Haarlem / Leiden',
    tekst:
      'Primair inzetbaar in de regio. Incidenteel landelijk mogelijk. Hybride werken is de norm — aanwezigheid op cruciale momenten vanzelfsprekend.',
  },
  {
    icon: TrendingUp,
    titel: '€125 – €140 per uur',
    tekst:
      'All-in tarief. Geen verrassingen achteraf. Projectmatige afspraken bespreekbaar. Starten altijd met een gratis strategische verkenning van 30 minuten.',
  },
];

const sectoren = [
  { code: 'WZ', label: 'Welzijn & zorg', tekst: 'Dagbesteding, vrijwilligerscentrales, buurtteams, jeugdhulp, maatschappelijke opvang' },
  { code: 'GM', label: 'Gemeenten', tekst: 'Sociaal domein, Wmo, participatie, digitale dienstverlening, beleid & uitvoering' },
  { code: 'SO', label: 'Sociaal ondernemers', tekst: 'Impact-gedreven organisaties die willen groeien zonder de menselijke maat te verliezen' },
  { code: 'NP', label: 'Non-profit & stichtingen', tekst: 'Fondsen, koepelorganisaties, maatschappelijke ondernemingen in transitie' },
];

export default function InterimProfiel() {
  const openBookingChat = () => {
    window.dispatchEvent(new CustomEvent('openBooking'));
  };

  return (
    <>
      {/* HERO */}
      <header className="relative pt-32 pb-20 overflow-hidden bg-[#0f172a]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #fb923c 0%, transparent 50%), radial-gradient(circle at 20% 80%, #22c55e 0%, transparent 40%)' }} />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-orange-500 to-orange-600" />

        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          {/* Beschikbaarheid — meest prominent */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-green-500/15 border border-green-500/40 text-green-400 font-bold text-sm">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shrink-0" />
              Beschikbaar per direct
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium">
              <Clock size={14} className="text-slate-400" />
              16–24 uur / 3 dagen per week
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium">
              <MapPin size={14} className="text-slate-400" />
              Amsterdam · Haarlem · Leiden
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium">
              <TrendingUp size={14} className="text-slate-400" />
              €125–€140 / uur
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-orange-400 font-bold text-xs uppercase tracking-widest mb-4">Interim Profiel</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
                Vincent<br />
                <span className="text-orange-400">van Munster</span>
              </h1>
              <p className="text-xl text-slate-300 font-semibold mb-3">
                Strategic Innovation Partner
              </p>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Interim manager voor organisaties in het sociaal domein die AI-innovatie en digitale transformatie willen realiseren — waarbij de technologie ook echt landt op de werkvloer.
              </p>

              {/* Drie rollen als chips */}
              <div className="flex flex-col gap-2 mb-10">
                {[
                  'Interim Projectleider Welzijn & Sociaal Domein',
                  'Kwartiermaker Innovatie & AI',
                  'Verandermanager Digitale Transformatie',
                ].map((rol) => (
                  <div key={rol} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <ChevronRight size={14} className="text-orange-400 shrink-0" />
                    {rol}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={openBookingChat}
                  className="px-7 py-3.5 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2"
                >
                  Plan een strategische verkenning
                  <ArrowRight size={16} />
                </Button>
                <a
                  href="https://www.linkedin.com/in/vincentvanmunster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-semibold text-sm transition-all"
                >
                  <Linkedin size={15} />
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Foto + stats */}
            <div className="flex flex-col items-center lg:items-end gap-6">
              <div className="relative">
                <div className="w-48 h-48 rounded-3xl overflow-hidden ring-4 ring-orange-500/30 ring-offset-4 ring-offset-[#0f172a] shadow-2xl">
                  <Image
                    src="/vincent-van-munster.png"
                    alt="Vincent van Munster — Interim Strategic Innovation Partner"
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 px-3 py-1.5 bg-green-500 rounded-full text-white text-xs font-bold shadow-lg">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  Beschikbaar
                </div>
              </div>

              {/* Kerngetallen */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                {[
                  { waarde: '25+', label: 'jaar sociaal domein' },
                  { waarde: '3', label: 'live AI-platforms' },
                  { waarde: '700+', label: 'deelnemers begeleid' },
                  { waarde: '90', label: 'dagen naar resultaat' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black text-orange-400 mb-1">{s.waarde}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider leading-snug">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SPELREGELS — BESCHIKBAARHEID */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Praktische informatie</p>
            <h2 className="text-3xl font-black text-white">Hoe ik werk als interim</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {spelregels.map((s) => (
              <div key={s.titel} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-orange-500/40 transition-colors duration-300">
                <div className="w-10 h-10 bg-orange-500/15 rounded-xl flex items-center justify-center mb-4">
                  <s.icon size={20} className="text-orange-400" />
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{s.titel}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{s.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERIM ROLLEN */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Functieprofiel
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">
              Inzetbaar als
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Drie rollen — één aanpak: vanuit begrip van de sector, de taal van de werkvloer en hands-on technologische executiekracht.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {rollen.map((rol) => (
              <div key={rol.code} className={`rounded-3xl border border-l-4 ${rol.kleur} border-slate-100 bg-white p-8 md:p-10 hover:shadow-xl transition-all duration-300`}>
                <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`w-8 h-8 ${rol.accentBg} rounded-xl flex items-center justify-center shrink-0`}>
                        <rol.icon size={16} className={rol.accentText} />
                      </span>
                      <span className={`text-xs font-black uppercase tracking-widest ${rol.accentText}`}>{rol.code}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">{rol.titel}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm mb-5">{rol.omschrijving}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Wanneer inzetbaar</p>
                      {rol.wanneer.map((w) => (
                        <div key={w} className="flex items-start gap-2 text-slate-600 text-sm">
                          <CheckCircle size={14} className={`${rol.accentText} shrink-0 mt-0.5`} />
                          {w}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-20 h-20 bg-slate-50 rounded-2xl text-4xl font-black text-slate-100 shrink-0">
                    {rol.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRACK RECORD */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Track record
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">
              Bewezen in de praktijk
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Geen theoretische plannen. Elk resultaat hieronder is gerealiseerd in een echte organisatie, met echte mensen, onder echte tijdsdruk.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {trackrecord.map((t) => (
              <div key={t.org} className="bg-white rounded-3xl border border-slate-100 p-8 md:p-10 hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">{t.periode}</p>
                    <h3 className="text-lg font-black text-slate-900">{t.rol}</h3>
                    <p className="text-slate-500 text-sm font-semibold">{t.org}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full text-xs font-semibold text-slate-500 border border-slate-100">
                    <MapPin size={11} />
                    {t.locatie}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {t.resultaten.map((r) => (
                    <div key={r} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Star size={13} className="text-orange-400 shrink-0 mt-0.5" />
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPETENTIES */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                Competenties
              </div>
              <h2 className="text-4xl font-black mb-4 leading-tight">
                Wat ik meeneem de deur in.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Een combinatie die bijna niemand heeft: 25 jaar in het hart van het sociaal domein én de technologische executiekracht om het ook zelf te bouwen. Ik verbind bestuurskamer met werkvloer, strategie met uitvoering.
              </p>
              <div className="p-6 bg-slate-800 rounded-2xl border-l-4 border-orange-500 italic text-slate-300">
                &ldquo;In 16 uur doe ik wat een ander 32 uur kost. Niet omdat ik sneller typ, maar omdat ik weet wat ertoe doet.&rdquo;
              </div>
            </div>

            <div className="space-y-4">
              {competenties.map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-300">{c.label}</span>
                    <span className="text-xs text-slate-500 font-medium">{c.niveau}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
                      style={{ width: `${c.niveau}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTOREN */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Sectoren
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">
              Thuis in het sociaal domein
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {sectoren.map((s) => (
              <div key={s.code} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-lg hover:bg-white transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <span className="text-orange-600 font-black text-xs">{s.code}</span>
                  </div>
                  <h3 className="font-black text-slate-900">{s.label}</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{s.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OVER VINCENT — KORT */}
      <section className="py-24 bg-[#1e293b] text-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid md:grid-cols-[auto_1fr] gap-12 items-start">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-slate-600 ring-offset-4 ring-offset-[#1e293b]">
                  <Image src="/vincent-van-munster.png" alt="Vincent van Munster" width={128} height={128} className="w-full h-full object-cover" />
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#1e293b]" />
              </div>
              <a
                href="https://www.linkedin.com/in/vincentvanmunster"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-full transition-colors"
              >
                <Linkedin size={13} />
                LinkedIn
                <ArrowUpRight size={11} className="opacity-60" />
              </a>
            </div>

            <div>
              <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest mb-5">Over Vincent</div>
              <p className="text-slate-300 text-lg leading-relaxed mb-4">
                Tot oktober 2025 was ik directeur van Stichting De Baan in Haarlem — een welzijnsorganisatie met 180 vrijwilligers, 700+ deelnemers en 70.000 geluksmomenten per jaar. Ik heb er de digitalisering geleid, processen heringericht en een eigen vrijwilligersplatform (DAAR) gebouwd.
              </p>
              <p className="text-slate-400 leading-relaxed mb-4">
                Naast mijn directeursrol bouw ik al jaren eigen AI-platforms: Bijeen.app voor evenementenbeheer in de welzijnssector, DatingAssistent als AI proof-of-concept, en Iris als AI-assistent voor sociaal werkers. Ik combineer die hands-on technologische kennis met de managementervaring van iemand die 25 jaar in het hart van de sector heeft gewerkt.
              </p>
              <p className="text-slate-400 leading-relaxed mb-6">
                Als gecertificeerd LEGO® Serious Play facilitator begeleid ik ook teams bij het bouwen van draagvlak voor verandering — in één dag meer bereiken dan maanden vergaderen.
              </p>
              <div className="p-5 bg-slate-800 rounded-xl border-l-4 border-orange-500 italic text-slate-300 text-sm">
                &ldquo;Ik ben geen snelle jongen met een mooi deck. Ik ben iemand die begrijpt waar u voor staat — en die naast u staat totdat het werkt.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-50 rounded-tr-full -ml-6 -mb-6 opacity-40 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Beschikbaar per direct
                </div>
                <span className="text-sm text-slate-400">16–24 uur/week · Amsterdam / Haarlem / Leiden · €125–€140/u</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                Heeft u een project dat <br />
                <span className="text-orange-600">een doorbreker nodig heeft?</span>
              </h2>
              <p className="text-slate-600 text-lg mb-10 max-w-2xl leading-relaxed">
                In 30 minuten is duidelijk of ik de juiste match ben voor uw opdracht, hoe dat eruitziet en wat het kost. Geen verkooppraatje — gewoon een eerlijk gesprek.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Button
                  onClick={openBookingChat}
                  size="lg"
                  className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2"
                >
                  Plan een strategische verkenning
                  <ArrowRight size={18} />
                </Button>
                <a
                  href="mailto:v.munster@weareimpact.nl"
                  className="flex items-center gap-2 px-8 py-4 bg-white text-slate-800 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all text-sm"
                >
                  <Mail size={16} />
                  v.munster@weareimpact.nl
                </a>
              </div>

              {/* Andere diensten links */}
              <div className="pt-8 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Meer van WeAreImpact</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'AI Strategie Consultant', href: '/ai-strategie-consultant' },
                    { label: 'Change Management', href: '/change-management-digitale-transformatie' },
                    { label: 'Programmamanager', href: '/programmamanager-digitale-transformatie' },
                    { label: 'Verandermanagement AI', href: '/interim-verandermanagement-ai-sociaal-domein' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-100 rounded-full text-xs font-semibold transition-all"
                    >
                      {link.label}
                      <ExternalLink size={10} className="opacity-50" />
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
