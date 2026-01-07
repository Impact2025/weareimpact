'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Users,
  FileText,
  ArrowRight,
  Loader2,
  Mail,
  Building2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FAQ } from '@/components/sections/FAQ';

export default function AIProofChecklistPage() {
  const [email, setEmail] = useState('');
  const [organisatie, setOrganisatie] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/checklist-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, organisatie }),
      });

      if (!response.ok) throw new Error('Submission failed');

      setIsSuccess(true);
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden bg-white">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-sm mb-8">
            <Shield className="w-4 h-4 text-orange-600" />
            <span className="text-orange-700 font-medium">Gratis Download</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Is jouw organisatie <br className="hidden md:block" />
            <span className="text-gradient">AI-Proof in 2026?</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            De meeste sociale organisaties zijn het niet. En de tijd dringt.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-orange-600 mb-1">18%</div>
              <div className="text-sm text-slate-500">van zorgorganisaties gebruikt AI</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-orange-600 mb-1">50%</div>
              <div className="text-sm text-slate-500">heeft geen AI-strategie</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-orange-600 mb-1">Feb 2025</div>
              <div className="text-sm text-slate-500">AI-geletterdheid verplicht</div>
            </div>
          </div>

          <p className="text-lg text-slate-700 mb-8 font-medium">
            Download de gratis checklist met 15 praktische stappen om je organisatie klaar te maken voor de AI-toekomst.
          </p>

          <Button
            size="lg"
            className="px-8 py-6 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/20 text-lg"
            onClick={() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Download className="mr-2" size={20} />
            Download Gratis Checklist
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-slate-400">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Het Probleem
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Het is geen gebrek aan geld. <br />Het is gebrek aan <span className="text-orange-600">kennis</span>.
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
            <div className="flex items-start gap-4 mb-8">
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Onderzoek toont dat <strong className="text-slate-900">74,6% van organisaties &quot;gebrek aan ervaring&quot; noemt als grootste drempel</strong> — niet kosten of technische beperkingen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-8">
              <div className="p-3 bg-slate-100 rounded-xl">
                <Clock className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-lg text-slate-700 leading-relaxed">
                  De EU AI Act stelt nieuwe eisen. <strong className="text-slate-900">Augustus 2026 is de deadline</strong> voor hoog-risico systemen. Maar veel organisaties weten niet eens welke tools ze gebruiken, laat staan of die compliant zijn.
                </p>
              </div>
            </div>

            <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-lg text-green-800 font-medium">
                Het goede nieuws? Met de juiste voorbereiding kun je dit gat dichten. In dagen, niet maanden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              De Oplossing
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Wat zit er in de checklist?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: FileText, title: '15 concrete actiepunten', desc: 'Geen vage theorie, maar praktische stappen' },
              { icon: Users, title: '5 categorieën', desc: 'Van inventarisatie tot communicatie' },
              { icon: CheckCircle, title: 'Quick wins', desc: '3 dingen die je vandaag kunt doen' },
              { icon: Clock, title: 'Tijdlijn', desc: 'Welke deadlines zijn er en wanneer?' },
              { icon: AlertTriangle, title: 'Waarschuwing', desc: 'Leer van het Toeslagenschandaal' },
              { icon: Shield, title: 'EU AI Act', desc: 'Gebaseerd op actueel onderzoek (januari 2026)' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <item.icon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Author Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-slate-800 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                Over de auteur
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Vincent van Munster
              </h2>
              <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                Oprichter van WeAreImpact met 10+ jaar ervaring in de sociale sector. Als directeur van Stichting de Baan leidde hij een organisatie met 700+ deelnemers en 180 vrijwilligers.
              </p>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Hij combineert strategische visie met praktische AI-implementatie.
              </p>
              <div className="p-6 bg-slate-800 rounded-2xl border-l-4 border-orange-500">
                <p className="text-slate-200 italic">
                  &quot;Ik zie dagelijks hoe sociale organisaties worstelen met AI. Niet door gebrek aan budget, maar door gebrek aan kennis. Deze checklist geeft je de eerste stappen.&quot;
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-slate-700 rounded-full flex items-center justify-center ring-4 ring-slate-600 ring-offset-4 ring-offset-slate-900">
                <span className="text-5xl font-bold text-orange-400">VM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download CTA Section */}
      <section id="download" className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
            {/* Decorative Circle */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none" />

            <div className="relative z-10 text-center">
              <div className="inline-block px-4 py-1.5 bg-orange-600 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                Gratis Download
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Download nu — gratis
              </h2>

              <p className="text-slate-600 text-lg mb-8">
                Vul je e-mailadres in en ontvang direct de AI-Proof Checklist.
              </p>

              {isSuccess ? (
                <div className="p-6 bg-green-50 rounded-2xl border border-green-200">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">Check je inbox!</h3>
                  <p className="text-green-700">
                    De checklist is onderweg naar {email}. Kijk ook even in je spam folder.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="Je e-mailadres"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 py-6 text-lg rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Naam organisatie (optioneel)"
                      value={organisatie}
                      onChange={(e) => setOrganisatie(e.target.value)}
                      className="pl-12 py-6 text-lg rounded-xl border-slate-200"
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !email.trim()}
                    className="w-full px-8 py-6 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={20} />
                        Even geduld...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2" size={20} />
                        Download Checklist
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-slate-500">
                    Je gegevens zijn veilig. Geen spam, wel waardevolle follow-up tips.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Footer CTA */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Hulp nodig bij de implementatie?
          </h3>
          <p className="text-slate-600 mb-6">
            Boek een gratis 30-minuten AI-Readiness Gesprek.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              variant="outline"
              className="px-6 py-3 rounded-full"
            >
              <Link href="mailto:v.munster@weareimpact.nl" className="flex items-center gap-2">
                <Mail size={18} />
                v.munster@weareimpact.nl
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="px-6 py-3 rounded-full"
            >
              <Link href="tel:0614470977" className="flex items-center gap-2">
                06-144 709 77
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
