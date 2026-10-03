import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Cpu, BarChart3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingButton } from './BookingButton';
import { TrackedLink } from './TrackedLink';
import { LandingTracking } from './LandingTracking';
import { FaqAccordion } from './FaqAccordion';
import { PhasesDiagram } from './PhasesDiagram';
import { AI_PM_DOWNLOADS } from '@/lib/ai-pm-downloads';
import { AI_PM_PAGES, BASE_URL, PHASES, type AiPmPage } from '@/lib/ai-pm-pages';

function schemas(p: AiPmPage) {
  const url = `${BASE_URL}/${p.slug}`;
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: p.breadcrumb,
    description: p.metaDescription,
    url,
    serviceType: 'AI-projectmanagement',
    provider: {
      '@type': 'Person',
      name: 'Vincent van Munster',
      url: `${BASE_URL}/vincent-van-munster`,
      jobTitle: 'AI-projectmanager',
      worksFor: { '@type': 'Organization', name: 'WeAreImpact', url: BASE_URL },
    },
    areaServed: { '@type': 'Country', name: 'Netherlands' },
    offers: {
      '@type': 'Offer',
      description: 'Gratis kennismakingsgesprek van 30 minuten',
      price: '0',
      priceCurrency: 'EUR',
    },
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: p.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  const crumbs: { name: string; item: string }[] = [{ name: 'Home', item: BASE_URL }];
  if (!p.isPillar) crumbs.push({ name: 'AI-projectmanager', item: `${BASE_URL}/ai-projectmanager` });
  crumbs.push({ name: p.breadcrumb, item: url });
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  };
  return [service, faq, breadcrumb];
}

export function AiPmLanding({ page: p }: { page: AiPmPage }) {
  const siblings = AI_PM_PAGES.filter((s) => s.slug !== p.slug);

  return (
    <>
      <LandingTracking slug={p.slug} />
      {schemas(p).map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      {/* HERO */}
      <header className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
          {!p.isPillar && (
            <nav aria-label="Kruimelpad" className="text-xs text-slate-500 mb-6">
              <Link href="/" className="hover:text-orange-600">Home</Link>
              {' / '}
              <Link href="/ai-projectmanager" className="hover:text-orange-600">AI-projectmanager</Link>
              {' / '}
              <span className="text-slate-700">{p.breadcrumb}</span>
            </nav>
          )}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-100 shadow-sm text-sm mb-8">
            <span className="font-bold text-slate-900">Vincent van Munster</span>
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
            <span className="text-slate-600 font-medium tracking-wide uppercase text-xs">{p.eyebrow}</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            {p.h1a} <br className="hidden md:block" />
            <span className="text-gradient">{p.h1b}</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto font-light leading-relaxed">{p.lead}</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center flex-wrap">
            <BookingButton location={`ai_pm_${p.slug}_hero`} />
            <Button asChild variant="outline" size="lg" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-medium hover:bg-slate-50 shadow-sm">
              <TrackedLink href="/ai-scan" ctaName="ai_scan" location={`ai_pm_${p.slug}_hero`} className="flex items-center gap-2"><Cpu size={18} />Doe de gratis AI-scan</TrackedLink>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-medium hover:bg-slate-50 shadow-sm">
              <TrackedLink href="/impact-calculator" ctaName="impact_calculator" location={`ai_pm_${p.slug}_hero`} className="flex items-center gap-2"><BarChart3 size={18} />Bereken mijn impact</TrackedLink>
            </Button>
          </div>
        </div>
      </header>

      {/* DIRECT ANTWOORD (snippet- en AI-antwoordblok) */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="p-8 bg-slate-50 rounded-2xl border-l-4 border-orange-500">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">{p.answer.question}</h2>
            <p className="text-slate-700 text-lg leading-relaxed">{p.answer.text}</p>
          </div>
        </div>
      </section>

      {/* PROBLEMEN */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight text-center mb-14">{p.problemsTitle}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {p.problems.map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-all">
                <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-[0.95rem]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AANPAK */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight text-center mb-14">{p.approachTitle}</h2>
          <div className="flex flex-col gap-6">
            {p.approach.map((a, i) => (
              <div key={a.title} className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-black">0{i + 1}</span>
                  <h3 className="text-xl font-bold text-slate-900">{a.title}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed mb-5 text-[0.95rem]">{a.text}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-lg text-sm text-orange-700">
                  <CheckCircle size={15} className="text-orange-500 shrink-0" />
                  <span><span className="font-semibold">Resultaat:</span> {a.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ZES FASES (alleen pijler) */}
      {p.isPillar && (
        <section id="werkwijze" className="py-24 bg-slate-900 text-white">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight text-center mb-4">Van idee naar productie in zes fases</h2>
            <p className="text-slate-400 text-center max-w-2xl mx-auto mb-14">
              Dit is de volgorde die ik in elk AI-project aanhoud. Uitgebreid beschreven in het artikel{' '}
              <Link href="/kennisbank/ai-implementatie-in-6-fases" className="text-orange-400 underline">AI-implementatie in 6 fases</Link>.
            </p>
            <PhasesDiagram />
            <ol className="grid md:grid-cols-2 gap-6">
              {PHASES.map((ph) => (
                <li key={ph.nr} className="bg-slate-800 rounded-2xl p-7 border border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-sm flex items-center justify-center">{ph.nr}</span>
                    <h3 className="font-bold text-lg">{ph.title}</h3>
                  </div>
                  <p className="text-slate-300 text-[0.95rem] leading-relaxed">{ph.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* INZET EN TARIEF */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 text-center">Inzet en tarief</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { v: '€125-140', l: 'per uur' },
              { v: '16-24 uur', l: 'per week, bewust' },
              { v: '30 min', l: 'gratis kennismaking' },
            ].map((s) => (
              <div key={s.l} className="p-6 bg-white rounded-2xl border border-slate-100 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{s.v}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>
          <p className="text-slate-600 leading-relaxed text-center max-w-3xl mx-auto">
            Mijn tarief ligt hoger dan gemiddeld, omdat ik in 16 uur doe wat anderen 32 uur kost. Je betaalt voor resultaat, niet voor uren. Een afgebakende pilot kan ik op vaste prijs aanbieden. In het portaal kijk je live mee met milestones en openstaande acties. Meer over kosten lees je in{' '}
            <Link href="/kennisbank/wat-kost-een-ai-projectmanager" className="text-orange-600 underline">wat kost een AI-projectmanager</Link>.
          </p>
        </div>
      </section>

      {/* BEWIJS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">Waarom je mij kunt vertrouwen</h2>
          <div className="flex justify-center mb-8">
            <Link href="/vincent-van-munster" className="block">
              <Image
                src="/vincent-van-munster.webp"
                alt="Vincent van Munster, AI-projectmanager en oprichter van WeAreImpact"
                width={112}
                height={112}
                className="w-28 h-28 rounded-full object-cover ring-4 ring-orange-100"
              />
            </Link>
          </div>
          <ul className="space-y-4 text-slate-600 leading-relaxed max-w-3xl mx-auto">
            <li><strong className="text-slate-900">25+ jaar in het sociaal domein.</strong> Tot 1 oktober 2025 directeur van Stichting de Baan, met 700+ deelnemers en 180 vrijwilligers.</li>
            <li><strong className="text-slate-900">Ik bouw wat ik adviseer.</strong> Onder meer DAAR (vrijwilligersplatform), Iris en AgentOS (mijn AI-laag met vaste goedkeuringsstap) en dit klantportaal.</li>
            <li><strong className="text-slate-900">Gecertificeerd LEGO® Serious Play-facilitator.</strong> Voor draagvlak dat blijft, ook bij scepsis.</li>
            <li><strong className="text-slate-900">Eerlijk over wat niet werkt.</strong> Soms is stoppen de beste uitkomst en dat zeg ik dan.</li>
          </ul>
          <p className="text-center mt-8">
            <Link href="/vincent-van-munster" className="text-orange-600 font-semibold underline">Lees meer over Vincent van Munster</Link>
          </p>
        </div>
      </section>

      {/* GRATIS HULPMIDDELEN */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Gratis hulpmiddelen voor je AI-project</h2>
              <p className="text-slate-600 mt-2">{AI_PM_DOWNLOADS.length} documenten die ik zelf gebruik, van kick-off tot overdracht.</p>
            </div>
            <TrackedLink href="/ai-projectmanager-templates" ctaName="templates_all" location={`ai_pm_${p.slug}_downloads`} className="text-orange-600 font-semibold underline whitespace-nowrap">
              Alle {AI_PM_DOWNLOADS.length} templates bekijken
            </TrackedLink>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {AI_PM_DOWNLOADS.filter((d) => d.featured).map((d) => (
              <TrackedLink key={d.id} href={`/ai-projectmanager-templates#${d.id}`} ctaName={`template_${d.id}`} location={`ai_pm_${p.slug}_downloads`} className="group block rounded-2xl border border-slate-100 bg-slate-50 p-6 hover:border-orange-300 hover:bg-orange-50/40 transition-all">
                <FileText className="text-orange-600 mb-3" size={22} />
                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-orange-700">{d.short}</h3>
                <p className="text-sm text-slate-500">{d.pages}</p>
              </TrackedLink>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-900">Veelgestelde vragen</h2>
          <FaqAccordion faqs={p.faqs} slug={p.slug} />
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-2xl text-center border border-slate-100">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">{p.ctaTitle}</h2>
            <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">{p.ctaText}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
              <BookingButton label="Plan een gesprek" location={`ai_pm_${p.slug}_cta`} />
              <Button asChild variant="outline" size="lg" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50">
                <TrackedLink href="/contact" ctaName="contact" location={`ai_pm_${p.slug}_cta`} className="flex items-center gap-2">Of stuur een bericht <ArrowRight size={18} /></TrackedLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* VERDER LEZEN + CLUSTER */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-2xl font-bold mb-8">Verder lezen</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-14">
            {p.related.map((r) => (
              <Link key={r.href} href={r.href} className="group block rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 hover:border-orange-500/40 transition-all">
                <h3 className="font-semibold group-hover:text-orange-400">{r.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{r.description}</p>
              </Link>
            ))}
          </div>
          <h2 className="text-xl font-bold mb-4">Meer over AI-projectmanagement</h2>
          <ul className="flex flex-wrap gap-3 text-sm">
            {siblings.map((s) => (
              <li key={s.slug}>
                <Link href={`/${s.slug}`} className="inline-block px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200">{s.breadcrumb}</Link>
              </li>
            ))}
            <li>
              <Link href="/ai-projectmanager-templates" className="inline-block px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200">Gratis templates</Link>
            </li>
            <li>
              <Link href="/ai-projectmanagement-begrippen" className="inline-block px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200">Begrippenlijst</Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
