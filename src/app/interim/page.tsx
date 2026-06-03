'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Linkedin,
  ArrowUpRight,
  CheckCircle,
  MapPin,
  Clock,
  Download,
  Mail,
  Phone,
  ExternalLink,
  Quote,
  Award,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── DATA ─────────────────────────────────────────────────────────── */

const rollen = [
  {
    code: '01',
    titel: 'Interim Projectleider',
    sub: 'Welzijn & Sociaal Domein',
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
  { waarde: '25+', label: 'jaar directie & management', kleur: 'text-orange-500' },
  { waarde: '10+', label: 'jaar specifiek sociaal domein', kleur: 'text-slate-700' },
  { waarde: '70.000+', label: 'geluksmomenten gerealiseerd', kleur: 'text-orange-500' },
  { waarde: '700+', label: 'deelnemers aangestuurd', kleur: 'text-slate-700' },
  { waarde: '180', label: 'vrijwilligers gemanaged', kleur: 'text-orange-500' },
  { waarde: '4+', label: 'live AI-platforms gebouwd', kleur: 'text-slate-700' },
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

  const [cvModal, setCvModal] = useState(false);
  const [cvForm, setCvForm] = useState({ name: '', email: '', organisatie: '', hp: '' });
  const [cvState, setCvState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [cvError, setCvError] = useState('');

  const openCvModal = () => {
    setCvModal(true);
    setCvState('idle');
    setCvForm({ name: '', email: '', organisatie: '', hp: '' });
    setCvError('');
  };

  const handleCvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCvState('loading');
    setCvError('');
    try {
      const res = await fetch('/api/cv-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cvForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setCvError(data.error || 'Er is iets misgegaan.');
        setCvState('error');
      } else {
        setCvState('success');
      }
    } catch {
      setCvError('Verbinding mislukt. Probeer het opnieuw.');
      setCvState('error');
    }
  };

  return (
    <>

      {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
      <header className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-[#FDFBF7]">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-5xl relative z-10 py-16">
          <div className="grid lg:grid-cols-[1fr_280px] gap-16 items-center">

            {/* ── Links ── */}
            <div>
              {/* status badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-100 shadow-sm text-sm mb-8 hover:border-orange-200 transition-colors cursor-default">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
                <span className="font-bold text-slate-900">Beschikbaar per direct</span>
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0" />
                <span className="text-slate-500 font-medium text-xs">16–24 uur · €125–€140/u</span>
              </div>

              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
                Interim Profiel
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-3 leading-[1.05]">
                Vincent<br />
                <span className="text-gradient">van Münster</span>
              </h1>

              <p className="text-xl text-slate-600 font-medium mb-6">
                Strategic Innovation Partner &amp; Interim Manager
              </p>

              <div className="flex flex-wrap gap-x-3 gap-y-1 mb-8">
                {[
                  'Interim Projectleider Welzijn & Sociaal Domein',
                  'Kwartiermaker Innovatie & AI',
                  'Verandermanager Digitale Transformatie',
                ].map((t, i, arr) => (
                  <span key={t} className="flex items-center gap-3 text-[0.8rem] text-slate-400 font-medium">
                    {t}
                    {i < arr.length - 1 && <span className="text-slate-200">|</span>}
                  </span>
                ))}
              </div>

              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl font-light">
                Geen IT-consultant die een systeem oplevert en vertrekt. Iemand die de taal van de werkvloer én de boardroom spreekt — en zorgt dat het ook echt landt.
              </p>

              <div className="flex flex-col md:flex-row gap-3 flex-wrap">
                <Button
                  onClick={openBookingChat}
                  size="lg"
                  className="px-8 py-4 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-all group shadow-xl shadow-orange-500/20 flex items-center gap-2"
                >
                  Plan een verkenning
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={openCvModal}
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-medium hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                >
                  <Download size={16} />
                  Download CV (PDF)
                </Button>
                <a
                  href="https://www.linkedin.com/in/vincentvanmunster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-full font-medium hover:bg-slate-50 transition-all shadow-sm text-sm"
                >
                  <Linkedin size={15} />
                  LinkedIn
                </a>
              </div>
            </div>

            {/* ── Rechts: foto + contact ── */}
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <div className="w-48 h-56 rounded-3xl overflow-hidden ring-1 ring-slate-200 shadow-xl">
                  <Image
                    src="/vincent-van-munster.png"
                    alt="Vincent van Münster — Interim Strategic Innovation Partner"
                    width={192}
                    height={224}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-green-500 rounded-full text-white text-xs font-bold shadow-lg whitespace-nowrap">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Beschikbaar
                </div>
              </div>

              {/* directe contactkaart */}
              <div className="w-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Direct contact</p>
                <div className="flex flex-col gap-3">
                  <a href="tel:+31614470977" className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium group">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors shrink-0">
                      <Phone size={13} className="text-orange-500" />
                    </div>
                    06 – 144 709 77
                  </a>
                  <a href="mailto:v.munster@weareimpact.nl" className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium group">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors shrink-0">
                      <Mail size={13} className="text-orange-500" />
                    </div>
                    v.munster@weareimpact.nl
                  </a>
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin size={13} className="text-slate-400" />
                    </div>
                    Amsterdam · Haarlem · Leiden
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ KERNCIJFERS ═════════════════════════════════════════════════ */}
      <section className="py-14 bg-white border-y border-slate-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {kerncijfers.map((k) => (
              <div key={k.label} className="text-center">
                <div className={`text-2xl md:text-3xl font-bold mb-1.5 ${k.kleur}`}>{k.waarde}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider leading-snug">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DE SUPERPOWER ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                De superpower
              </div>
              <h2 className="text-4xl font-bold mb-6 text-slate-900 leading-tight">
                Niet de consultant die een rapport schrijft en vertrekt.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Wat mij onderscheidt is de combinatie die bijna niemand heeft:{' '}
                <strong>25 jaar directie- en managementervaring</strong> in het sociaal domein én de{' '}
                <strong>hands-on technologische executiekracht</strong> om het zelf te bouwen en te laten werken.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Ik kan een toekomstgerichte koers uitzetten én met de voeten in de klei het team meenemen in de verandering. Ik spreek de taal van de werkvloer én die van de boardroom.
              </p>
              <div className="space-y-3">
                {[
                  'Strategische visie én operationele daadkracht',
                  'Sectorkennis van binnenuit — geen buitenstaander die het uitlegt',
                  'Bouwt AI-tools zelf — geen leverancier nodig om te begrijpen',
                  'In 16 uur bereik ik wat anderen 32 uur kost',
                  'Komt om overbodig te worden — niet om te verlengen',
                ].map((punt) => (
                  <div key={punt} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-[0.925rem]">{punt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-8 md:mt-0">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-slate-900 text-white p-10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Quote size={120} />
                </div>
                <h3 className="text-2xl font-bold mb-6 leading-snug">25 jaar in de sector. Bouwt AI zelf. Spreekt gewoon Nederlands.</h3>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Mijn succes ontstaat altijd vanuit verbinding — waarbij deelnemers, medewerkers, bestuur en partners zich gezien en gehoord voelen.
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
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Functieprofiel
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">Inzetbaar als</h2>
          </div>

          <div className="flex flex-col gap-6">
            {rollen.map((rol) => (
              <div
                key={rol.code}
                className="group relative bg-white rounded-3xl p-10 border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-300 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                <span className="absolute -bottom-4 right-6 text-9xl font-black text-slate-50 select-none leading-none transition-colors duration-500 group-hover:text-orange-50/80">
                  {rol.code}
                </span>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest">{rol.code}</span>
                    <h3 className="text-xl font-bold text-slate-900 leading-snug">{rol.titel}</h3>
                    <span className="text-sm font-semibold text-orange-600 hidden sm:block">&mdash; {rol.sub}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[0.925rem] mb-5 max-w-3xl">{rol.omschrijving}</p>
                  <div className="inline-flex flex-col gap-1.5">
                    {rol.wanneer.map((w) => (
                      <div key={w} className="flex items-start gap-2 text-slate-600 text-sm">
                        <CheckCircle size={14} className="text-orange-400 shrink-0 mt-0.5" />
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

      {/* ═══ WERKWIJZE — dark section ════════════════════════════════════ */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fb923c 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
              Werkwijze
            </div>
            <h2 className="text-4xl font-bold">Hoe ik werk als interim</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              Geen winkeloppasser. Een doorbreker. Ik kom met spelregels die werken voor beide partijen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Clock, titel: 'Max. 3 dagen/week', sub: '16–24 uur bewust beperkt', tekst: 'Dankzij 25 jaar ervaring en AI-tooling doe ik in 16 uur wat een ander 32 uur kost. U koopt impact, geen uren.' },
              { icon: null, label: '2–6', titel: 'Maanden per opdracht', sub: 'Start binnen 2–4 weken', tekst: 'Lang genoeg voor echte verandering, kort genoeg om scherp te blijven. Ik kom om overbodig te worden.' },
              { icon: MapPin, titel: 'Regio A\'dam · Haarlem · Leiden', sub: 'Hybride werken is de norm', tekst: 'Primair in de regio. Incidenteel landelijk. Aanwezigheid op cruciale momenten altijd vanzelfsprekend.' },
              { icon: null, label: '€125', titel: '– €140 per uur', sub: 'All-in, geen verrassingen', tekst: 'Projectmatige afspraken bespreekbaar. We starten altijd met een gratis verkenning van 30 minuten.' },
            ].map((s, i) => (
              <div key={i} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-7 hover:border-orange-500/40 transition-colors duration-300">
                {s.icon ? (
                  <div className="w-10 h-10 bg-orange-500/15 rounded-xl flex items-center justify-center mb-5">
                    <s.icon size={18} className="text-orange-400" />
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-orange-400 mb-5">{s.label}</div>
                )}
                <h3 className="font-bold text-white text-sm mb-1">{s.titel}</h3>
                <p className="text-orange-400 text-xs font-semibold mb-3">{s.sub}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{s.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRACK RECORD ════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Werkervaring
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">Bewezen in de praktijk</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Elk resultaat hieronder is gerealiseerd in een echte organisatie, met echte mensen, onder echte tijdsdruk.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {tijdlijn.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-7 hover:shadow-xl hover:-translate-y-0.5 hover:border-orange-100 transition-all duration-300">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs font-bold text-orange-500 mb-1">{item.periode}</p>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.rol}</h3>
                    <p className="text-slate-500 text-sm font-medium">{item.org} · {item.locatie}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeKleur[item.type]}`}>
                    {item.type}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {item.resultaten.map((r) => (
                    <div key={r} className="flex items-start gap-2 text-slate-600 text-[0.875rem]">
                      <CheckCircle size={13} className="text-orange-400 shrink-0 mt-0.5" />
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REFERENTIES ═════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Referenties
            </div>
            <h2 className="text-4xl font-bold text-slate-900">Wat anderen zeggen</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { naam: 'Beschikbaar op aanvraag', functie: 'Directeur welzijnsorganisatie', tekst: 'Referenties van directeuren en bestuurders uit het sociaal domein zijn beschikbaar na een eerste kennismakingsgesprek.' },
              { naam: 'Beschikbaar op aanvraag', functie: 'Manager Strategie & Innovatie', tekst: 'Concrete resultaten en getuigenissen van eerdere opdrachtgevers deel ik graag persoonlijk — inclusief contactgegevens voor verificatie.' },
              { naam: 'Beschikbaar op aanvraag', functie: 'Bestuurder gemeente', tekst: 'Een portfolio van gerealiseerde projecten en de naam van betrokken stakeholders is beschikbaar voor serieuze kandidaat-opdrachtgevers.' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="mb-5 text-orange-200"><Quote size={28} /></div>
                <p className="text-slate-600 leading-relaxed text-sm italic mb-6">{t.tekst}</p>
                <div className="pt-5 border-t border-slate-100">
                  <p className="font-bold text-slate-900 text-sm">{t.naam}</p>
                  <p className="text-slate-400 text-xs">{t.functie}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-sm mb-4">Referenties en portfolio beschikbaar na eerste contact</p>
            <Button
              onClick={openBookingChat}
              variant="outline"
              className="px-7 py-3 rounded-full border-slate-200 text-slate-700 hover:bg-white font-medium flex items-center gap-2 mx-auto"
            >
              Vraag referenties op
              <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ SECTOREN ════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Sectoren
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Thuis in het sociaal domein</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { code: 'WZ', label: 'Welzijn & zorg', tekst: 'Dagbesteding, vrijwilligerscentrales, buurtteams, jeugdhulp, maatschappelijke opvang' },
              { code: 'GM', label: 'Gemeenten', tekst: 'Sociaal domein, Wmo, participatie, digitale dienstverlening, beleid & uitvoering' },
              { code: 'SO', label: 'Sociaal ondernemers', tekst: 'Impact-gedreven organisaties die willen groeien zonder menselijke maat te verliezen' },
              { code: 'NP', label: 'Non-profit', tekst: 'Fondsen, koepelorganisaties en maatschappelijke ondernemingen in transitie' },
            ].map((s) => (
              <div key={s.code} className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-orange-600 font-black text-xs">{s.code}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{s.label}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OPLEIDING + TOOLS ═══════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
                Opleiding & certificering
              </div>
              <div className="flex flex-col gap-3">
                {opleidingen.map((o) => (
                  <div
                    key={o.jaar}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${o.highlight ? 'bg-white border-orange-100 shadow-sm' : 'bg-white border-slate-100'}`}
                  >
                    <div className="w-20 shrink-0 pt-0.5">
                      <span className="text-xs font-bold text-orange-500">{o.jaar}</span>
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

            <div>
              <div className="inline-block px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
                AI-tools & technologie
              </div>
              <div className="flex flex-wrap gap-2 mb-10">
                {tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700 hover:border-orange-200 transition-colors"
                  >
                    {tool}
                  </span>
                ))}
              </div>

              <div className="inline-block px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
                Talen
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Nederlands</p>
                    <p className="text-slate-400 text-xs">Moedertaal</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Engels</p>
                    <p className="text-slate-400 text-xs">Goed in woord en geschrift</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ OVER VINCENT ════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#1e293b] text-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-8">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-slate-600 ring-offset-4 ring-offset-[#1e293b]">
                <Image src="/vincent-van-munster.png" alt="Vincent van Münster" width={112} height={112} className="w-full h-full object-cover" />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#1e293b]" />
            </div>

            <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              Over Vincent
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">Wie is Vincent?</h2>

            <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-2xl">
              Tot oktober 2025 was ik directeur van Stichting De Baan in Haarlem — een welzijnsorganisatie met 180 vrijwilligers, 700+ deelnemers en 70.000+ geluksmomenten per jaar voor mensen met een verstandelijke beperking.
            </p>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed max-w-2xl">
              Daarvoor negen jaar voorzitter en directeur van Stichting Philia, waar ik OogvoorLiefde.nl en DatingAssistent opbouwde (bekend van tv, o.a. SynDROOM). Naast mijn bestuurlijke ervaring bouw ik al jaren eigen AI-platforms: Bijeen.app, Iris en diverse andere initiatieven onder WeAreImpact.
            </p>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl">
              Als gecertificeerd <span className="text-orange-400 font-bold">LEGO&reg; Serious Play</span> facilitator begeleid ik teams bij het bouwen van draagvlak voor verandering. In één dag meer bereiken dan maanden vergaderen.
            </p>

            <div className="p-6 bg-slate-800 rounded-2xl border-l-4 border-orange-500 italic text-slate-300 mb-10 max-w-2xl text-left">
              &ldquo;Ik ben geen snelle jongen met een mooi deck. Ik ben iemand die begrijpt waar jij voor staat, en die naast je staat totdat het werkt.&rdquo;
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-10">
              {[
                { value: '25+', label: 'Jaar ervaring' },
                { value: '10+', label: 'Jaar sociaal domein' },
                { value: 'LSP', label: 'Certified facilitator' },
                { value: 'AI', label: 'Gedreven aanpak' },
              ].map((stat) => (
                <div key={stat.label} className="p-5 bg-slate-800 rounded-2xl">
                  <div className="text-2xl font-bold text-orange-400 mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>

            <a
              href="https://www.linkedin.com/in/vincentvanmunster"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-full transition-colors"
            >
              <Linkedin size={15} />
              Verbind op LinkedIn
              <ArrowUpRight size={13} className="opacity-60" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-2xl text-center border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none" />

            <div className="flex flex-wrap items-center justify-center gap-3 mb-6 relative z-10">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Beschikbaar per direct
              </div>
              <span className="text-slate-400 text-sm">16–24 uur/week · €125–€140/u · Amsterdam / Haarlem / Leiden</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 relative z-10 leading-tight">
              Jouw organisatie,{' '}
              <span className="text-orange-600">90 dagen van nu.</span>
            </h2>
            <p className="text-slate-600 text-lg mb-10 relative z-10 max-w-2xl mx-auto leading-relaxed">
              In 30 minuten is duidelijk of ik de juiste match ben voor uw opdracht. Geen verkooppraatje — gewoon een eerlijk gesprek over uw situatie en wat het vraagt.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 flex-wrap">
              <Button
                onClick={openBookingChat}
                size="lg"
                className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2"
              >
                Plan een strategische verkenning
                <ArrowRight size={18} />
              </Button>
              <Button
                onClick={openCvModal}
                variant="outline"
                size="lg"
                className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Download size={16} />
                Download CV (PDF)
              </Button>
            </div>

            {/* directe contactgegevens */}
            <div className="grid sm:grid-cols-3 gap-4 pt-10 mt-6 border-t border-slate-100 relative z-10">
              <a href="tel:+31614470977" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors shrink-0">
                  <Phone size={15} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bel direct</p>
                  <p className="text-slate-800 font-bold text-sm">06 – 144 709 77</p>
                </div>
              </a>
              <a href="mailto:v.munster@weareimpact.nl" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors shrink-0">
                  <Mail size={15} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">E-mail</p>
                  <p className="text-slate-800 font-bold text-sm truncate">v.munster@weareimpact.nl</p>
                </div>
              </a>
              <a href="https://www.linkedin.com/in/vincentvanmunster" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors shrink-0">
                  <Linkedin size={15} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LinkedIn</p>
                  <p className="text-slate-800 font-bold text-sm">Vincent van Münster</p>
                </div>
              </a>
            </div>

            {/* cross-links */}
            <div className="pt-8 mt-4 border-t border-slate-100 relative z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Meer van WeAreImpact</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: 'AI Strategie Consultant', href: '/ai-strategie-consultant' },
                  { label: 'Change Management', href: '/change-management-digitale-transformatie' },
                  { label: 'Programmamanager', href: '/programmamanager-digitale-transformatie' },
                  { label: 'Verandermanagement AI', href: '/interim-verandermanagement-ai-sociaal-domein' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-100 rounded-full text-xs font-medium transition-all"
                  >
                    {link.label}
                    <ExternalLink size={10} className="opacity-40" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CV Download Modal */}
      {cvModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm"
          onClick={() => setCvModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 bg-gradient-to-r from-green-400 via-orange-500 to-violet-500" />

            <div className="p-8">
              {cvState === 'success' ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={30} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">CV verstuurd!</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Verstuurd naar <strong className="text-slate-800">{cvForm.email}</strong>. Controleer ook uw spammap als het niet direct aankomt.
                  </p>
                  <Button onClick={() => setCvModal(false)} className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all">
                    Sluiten
                  </Button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setCvModal(false)}
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
                    aria-label="Sluiten"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
                      <Download size={17} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">CV aanvragen</h3>
                      <p className="text-slate-400 text-xs">Wordt direct per e-mail toegestuurd</p>
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Vul uw gegevens in en ontvang het CV van Vincent van Münster direct in uw inbox.
                  </p>

                  <form onSubmit={handleCvSubmit} className="flex flex-col gap-4">
                    <input
                      type="text"
                      tabIndex={-1}
                      aria-hidden="true"
                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0 }}
                      value={cvForm.hp}
                      onChange={(e) => setCvForm((f) => ({ ...f, hp: e.target.value }))}
                    />

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                        Naam <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        minLength={2}
                        value={cvForm.name}
                        onChange={(e) => setCvForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-colors placeholder:text-slate-400"
                        placeholder="Uw naam"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                        E-mailadres <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={cvForm.email}
                        onChange={(e) => setCvForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-colors placeholder:text-slate-400"
                        placeholder="u@organisatie.nl"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                        Organisatie <span className="text-slate-400 font-normal">(optioneel)</span>
                      </label>
                      <input
                        type="text"
                        value={cvForm.organisatie}
                        onChange={(e) => setCvForm((f) => ({ ...f, organisatie: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-colors placeholder:text-slate-400"
                        placeholder="Naam van uw organisatie"
                      />
                    </div>

                    {cvState === 'error' && (
                      <p className="text-red-600 text-xs bg-red-50 border border-red-100 px-4 py-3 rounded-xl leading-relaxed">
                        {cvError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={cvState === 'loading'}
                      className="mt-1 w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-orange-600 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {cvState === 'loading' ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Versturen...
                        </>
                      ) : (
                        <>
                          <Download size={15} />
                          CV ontvangen per e-mail
                        </>
                      )}
                    </button>

                    <p className="text-center text-[11px] text-slate-400">
                      Uw gegevens worden vertrouwelijk behandeld en niet gedeeld met derden.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
