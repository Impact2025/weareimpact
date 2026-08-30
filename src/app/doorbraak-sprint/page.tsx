'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  FileText,
  TrendingUp,
  Compass,
  Search,
  Wrench,
  ClipboardCheck,
  MapPin,
  Mail,
  Building2,
  Loader2,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SPRINTS = [
  {
    slug: 'sprint-triage',
    title: 'Sprint 1: Intake- & Vraagtriage',
    doelgroep: 'Directie en matchingcoördinatoren bij maatschappelijke platforms & stichtingen.',
    knelpunt: 'Handmatig lezen van mails en formulieren; complexe matching tussen hulpvraag en aanbod.',
    oplevering: 'Automatische extractie, categorisering, matchvoorstel en concept-mail klaar voor review.',
    tijdwinst: '5–10 uur / week',
  },
  {
    slug: 'sprint-offerte',
    title: 'Sprint 2: Offerte- & Leadmachine',
    doelgroep: 'DGA / commercieel verantwoordelijke bij groeiend circulair & sociaal MKB.',
    knelpunt: 'Gespreksnotities blijven liggen; offertes duren te lang; follow-up verwatert.',
    oplevering: 'Notities/transcript direct omgezet in klantdossier, CRM-update en conceptofferte.',
    tijdwinst: '5–8 uur / week',
  },
  {
    slug: 'sprint-impact',
    title: 'Sprint 3: Impact & Subsidies',
    doelgroep: 'Projectleiders en directies met structurele subsidie- en fondsenverantwoording.',
    knelpunt: 'Bewijsstukken, uren en KPI\'s handmatig verzamelen uit losse spreadsheets en mails.',
    oplevering: 'Gestructureerd impactregister dat bewijs ordent en concept-rapportages genereert.',
    tijdwinst: '5–10 uur / week (piek)',
  },
];

const PHASES = [
  {
    icon: Compass,
    title: 'Fit & Focus',
    when: 'Vooraf, 20–30 min Zoom',
    description: 'Samen met de proceseigenaar selecteren we exact 1 urgent en haalbaar proces.',
  },
  {
    icon: FileText,
    title: 'Voorbereiden',
    when: '2–5 dagen vooraf',
    description: 'Procesgrenzen vastleggen op de 1-A4 Sprintbrief; 3–10 geanonimiseerde cases aanleveren.',
  },
  {
    icon: Search,
    title: 'Diagnose',
    when: 'Uur 1, op locatie',
    description: 'Het proces ontleden: trigger, invoer, beslisregels, actie, menselijke controle.',
  },
  {
    icon: Wrench,
    title: 'Doorbraak',
    when: 'Uur 2–3, op locatie',
    description: 'De flow live inrichten, inclusief verplichte human-in-the-loop controlestap. Stresstest op 5 scenario\'s.',
  },
  {
    icon: ClipboardCheck,
    title: 'Borging',
    when: 'Uur 4 + 14 dagen nazorg',
    description: 'Proceseigenaar verwerkt zelfstandig 1 echte case, ontvangt de 1-A4 SOP. Reviewcall op dag 14.',
  },
];

const WEL = [
  'Zakelijke data, publieke info en geanonimiseerde context invoeren.',
  'Elk AI-gegenereerd concept kritisch nalezen vóór verzending.',
  'Twijfelgevallen direct markeren als "menselijke beoordeling vereist".',
];

const NIET = [
  'Nooit BSN, medische gegevens, cliëntdossiers of wachtwoorden invoeren.',
  'Geen geautomatiseerde selectie of afwijzing van sollicitanten of cliënten.',
  'Geen autonome besluitvorming over zorg of financiering.',
];

export default function DoorbraakSprintPage() {
  const [downloadEmail, setDownloadEmail] = useState('');
  const [downloadOrg, setDownloadOrg] = useState('');
  const [isDownloadSubmitting, setIsDownloadSubmitting] = useState(false);
  const [isDownloadSuccess, setIsDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const openBooking = (typeSlug?: string) => {
    window.dispatchEvent(new CustomEvent('openBooking', typeSlug ? { detail: { typeSlug } } : undefined));
  };

  const handleDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadEmail.trim() || isDownloadSubmitting) return;

    setIsDownloadSubmitting(true);
    setDownloadError('');

    try {
      const response = await fetch('/api/doorbraak-sprint/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: downloadEmail, organisatie: downloadOrg }),
      });
      if (!response.ok) throw new Error('Submission failed');
      setIsDownloadSuccess(true);
    } catch {
      setDownloadError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setIsDownloadSubmitting(false);
    }
  };

  return (
    <>
      {/* HERO */}
      <header className="relative min-h-[90vh] flex items-center pt-28 pb-16 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 max-w-4xl text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-100 shadow-sm text-sm mb-8">
            <span className="font-bold text-slate-900">De AI Diagnose &amp; Doorbraak Sprint</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Eén tijdlek. Eén dagdeel. <br />
            <span className="text-gradient">Structureel 5 tot 10 uur per week terug.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Geen open-einde interimcontract en geen theoretisch AI-rapport. Binnen één dagdeel op locatie staat één gekozen, terugkerend werkproces live en werkend in jouw eigen IT-omgeving, inclusief menselijke controle en 14 dagen nazorg. Vaste prijs: <strong className="text-slate-900">€1.750,- excl. btw</strong>.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => openBooking()}
              className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2"
            >
              Plan de gratis Fit & Focus-intake
              <ArrowRight size={18} />
            </Button>
          </div>
          <p className="text-sm text-slate-400 mt-4">20–30 min Zoom · geen verplichtingen · we bepalen samen of dit past</p>
        </div>
      </header>

      {/* KERNPARAMETERS */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="text-2xl font-bold text-orange-600 mb-1">€1.750,-</div>
              <div className="text-sm text-slate-500">vast per sprint, excl. btw</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="text-2xl font-bold text-orange-600 mb-1">5–25 fte</div>
              <div className="text-sm text-slate-500">sociale, circulaire en impact-organisaties</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="text-2xl font-bold text-orange-600 mb-1">5–10 uur</div>
              <div className="text-sm text-slate-500">structurele tijdwinst per week</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="text-2xl font-bold text-orange-600 mb-1">0</div>
              <div className="text-sm text-slate-500">wekelijkse MT-overleggen nodig</div>
            </div>
          </div>
        </div>
      </section>

      {/* MENUKAART */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Kies vooraf exact 1 kernproces
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light">
              Een tweede proces persen we nooit in dezelfde sessie. Dat wordt de natuurlijke aanleiding voor een vervolgsprint.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {SPRINTS.map((sprint) => (
              <div
                key={sprint.slug}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <h3 className="text-base font-bold text-slate-900 mb-3">{sprint.title}</h3>
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Voor</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{sprint.doelgroep}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Knelpunt</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{sprint.knelpunt}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Oplevering</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{sprint.oplevering}</p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">{sprint.tijdwinst}</span>
                </div>
                <Button
                  onClick={() => openBooking(sprint.slug)}
                  className="mt-4 w-full bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  Plan de intake
                  <ArrowRight size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5-FASENMODEL */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Het 5-fasenmodel
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
              Strak geregisseerd voor maximale snelheid en gegarandeerde oplevering.
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {PHASES.map((phase, idx) => (
              <div key={phase.title} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
                <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center text-orange-400 mb-4">
                  <phase.icon size={18} />
                </div>
                <div className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">Fase {idx + 1}</div>
                <h3 className="text-sm font-bold text-white mb-1">{phase.title}</h3>
                <div className="text-xs text-slate-500 mb-2">{phase.when}</div>
                <p className="text-sm text-slate-400 leading-relaxed">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-8">
            <TrendingUp size={20} className="text-orange-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6">
            Binnen 4 tot 6 weken terugverdiend
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed font-light">
            Bij een interne uurwaarde van €65,- levert een tijdwinst van 7,5 uur per week maandelijks al €1.950,- aan capaciteit op. Geen zware nieuwe softwarepakketten: naadloze AI-integratie in de tools die je al gebruikt (Microsoft 365, Google Workspace, CRM of spreadsheets).
          </p>
        </div>
      </section>

      {/* GOVERNANCE */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={20} className="text-orange-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Privacy, ethiek & governance
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light">
              Conform AVG en de EU AI Act. Geen model-training op zakelijke enterprise API's, en altijd een mens die controleert en accordeert vóór externe verzending.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Wel doen</h3>
              </div>
              <ul className="space-y-3">
                {WEL.map((item) => (
                  <li key={item} className="text-sm text-slate-600 leading-relaxed flex gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle size={18} className="text-red-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Nooit doen</h3>
              </div>
              <ul className="space-y-3">
                {NIET.map((item) => (
                  <li key={item} className="text-sm text-slate-600 leading-relaxed flex gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SCOPE */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6">
            Wat er wél en niet in zit
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed font-light mb-4">
            De Sprint richt zich op één afgebakend, terugkerend werkproces. De oplevering bestaat uit een werkende eerste versie in jouw bestaande digitale omgeving, inclusief menselijke controle, een 1-A4 Team-SOP en 14 dagen asynchrone nazorg via e-mail of WhatsApp.
          </p>
          <p className="text-base text-slate-400 leading-relaxed mb-8">
            Buiten scope: complexe software-ontwikkeling, datamigraties, juridisch advies, DPIA-uitvoering en autonome AI-besluitvorming.
          </p>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-left max-w-2xl mx-auto">
            <h3 className="text-sm font-bold text-orange-700 uppercase tracking-widest mb-2">Wat als het KPI-doel niet gehaald wordt?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Na de 14 dagen nazorg toetsen we samen de scorekaart. Wordt het succescriterium niet gehaald, dan volgt kosteloos maximaal 30 minuten asynchrone bijstelling binnen scope. Ligt de oorzaak buiten scope — bijvoorbeeld doordat systeemtoegang op locatie niet werkte — dan spreken we in overleg een passend vervolg af. Dat kan een extra sessie zijn, nooit een verplichting zonder jouw akkoord.
            </p>
          </div>
        </div>
      </section>

      {/* BIJLAGEN */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 bg-orange-50 rounded-bl-full -mr-8 -mt-8 opacity-60 pointer-events-none" />
            <div className="relative z-10 text-center">
              <div className="inline-block px-4 py-1.5 bg-orange-600 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                Gratis templates
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                De Sprintbrief &amp; de Wel/Niet-kaart
              </h2>
              <p className="text-slate-600 mb-8">
                De 1-A4 Sprintbrief &amp; Opdrachtovereenkomst en de Wel/Niet-kaart voor medewerkers, direct in je inbox. Handig om alvast te bekijken vóór de intake.
              </p>

              {isDownloadSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-emerald-800 mb-1">Check je inbox!</h3>
                  <p className="text-emerald-700 text-sm">
                    Beide templates zijn onderweg naar {downloadEmail}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDownloadSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="Je e-mailadres"
                      value={downloadEmail}
                      onChange={(e) => setDownloadEmail(e.target.value)}
                      required
                      className="pl-12 py-6 text-base rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Naam organisatie (optioneel)"
                      value={downloadOrg}
                      onChange={(e) => setDownloadOrg(e.target.value)}
                      className="pl-12 py-6 text-base rounded-xl border-slate-200"
                    />
                  </div>

                  {downloadError && <p className="text-red-600 text-sm">{downloadError}</p>}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isDownloadSubmitting || !downloadEmail.trim()}
                    className="w-full py-6 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30"
                  >
                    {isDownloadSubmitting ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={18} />
                        Even geduld...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2" size={18} />
                        Stuur me de templates
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-semibold mb-6">
            <MapPin size={14} />
            Op locatie, Nederland
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Welk tijdlek nemen we deze maand weg?
          </h2>
          <p className="text-lg text-slate-600 mb-10 font-light max-w-xl mx-auto">
            In een gratis intake van 20–30 minuten bepalen we samen of dit past en welk proces het meeste rust oplevert.
          </p>
          <Button
            size="lg"
            onClick={() => openBooking()}
            className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 inline-flex items-center gap-2"
          >
            <Users size={18} />
            Plan de Fit & Focus-intake
          </Button>
        </div>
      </section>
    </>
  );
}
