'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Send,
  MapPin,
  Coffee,
  Linkedin,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { trackEvents } from '@/components/analytics';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [honeypot, setHoneypot] = useState(''); // Anti-spam honeypot
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      setStatus('error');
      setErrorMessage('Er is iets misgegaan. Probeer het later opnieuw.');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Vul alle verplichte velden in');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus('error');
      setErrorMessage('Vul een geldig e-mailadres in');
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, honeypot }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting separately
        if (response.status === 429) {
          setErrorMessage(data.error || 'Je hebt te veel berichten verstuurd. Probeer het later opnieuw.');
        } else {
          setErrorMessage(data.error || 'Er is iets misgegaan');
        }
        throw new Error(data.error || 'Er is iets misgegaan');
      }

      setStatus('success');
      trackEvents.ctaClick('contact_form_submit', 'contact_page');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setStatus('error');
      // Error message already set above for rate limiting
      if (!errorMessage) {
        setErrorMessage(error instanceof Error ? error.message : 'Er is iets misgegaan');
      }
    }
  };

  const openBooking = () => {
    trackEvents.ctaClick('booking_open', 'contact_page');
    window.dispatchEvent(new CustomEvent('openBooking'));
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
              Laten we <span className="text-orange-600">praten</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Geen formulieren, geen wachttijden. Direct in gesprek met Vincent.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">

              {/* Left: Personal Card */}
              <div>
                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-bl-full -mr-10 -mt-10 pointer-events-none" />

                  <div className="relative z-10">
                    {/* Avatar & Info */}
                    <div className="flex items-start gap-5 mb-8">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                          <Image
                            src="/vincent-van-munster.webp"
                            alt="Vincent van Munster"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900"><Link href="/vincent-van-munster" className="hover:text-orange-600 transition-colors">Vincent van Munster</Link></h2>
                        <p className="text-slate-600">Strategic Innovation Partner</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          Beschikbaar voor nieuwe trajecten
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 rounded-2xl">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">{"<"}4u</div>
                        <div className="text-xs text-slate-500">Reactietijd</div>
                      </div>
                      <div className="text-center border-l border-slate-200">
                        <div className="text-2xl font-bold text-slate-900">15+</div>
                        <div className="text-xs text-slate-500">Jaar ervaring</div>
                      </div>
                    </div>

                    {/* Primary CTA */}
                    <Button
                      onClick={openBooking}
                      className="w-full py-6 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-orange-500/25 group"
                    >
                      <Coffee size={22} className="mr-3" />
                      Plan via Iris
                      <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <p className="text-center text-sm text-slate-500 mt-4">
                      30 min vrijblijvend gesprek — Iris plant het direct in, online of in Utrecht
                    </p>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-sm text-slate-400">of neem direct contact op</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Contact Options */}
                    <div className="space-y-3">
                      <Link
                        href="tel:0614470977"
                        onClick={() => trackEvents.ctaClick('phone_click', 'contact_page')}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                          <Phone size={20} className="text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">Bel direct</div>
                          <div className="text-sm text-slate-500">06 14 47 09 77</div>
                        </div>
                        <ArrowRight size={18} className="text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                      </Link>

                      <Link
                        href="mailto:vincent@weareimpact.nl"
                        onClick={() => trackEvents.ctaClick('email_click', 'contact_page')}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                          <Mail size={20} className="text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">E-mail</div>
                          <div className="text-sm text-slate-500">vincent@weareimpact.nl</div>
                        </div>
                        <ArrowRight size={18} className="text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                      </Link>

                      <Link
                        href="https://www.linkedin.com/in/vincent-van-m%C3%BCnster/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvents.ctaClick('linkedin_click', 'contact_page')}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                          <Linkedin size={20} className="text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">LinkedIn</div>
                          <div className="text-sm text-slate-500">Stuur een bericht</div>
                        </div>
                        <ArrowRight size={18} className="text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </div>

                    {/* Location */}
                    <div className="flex items-center justify-center gap-2 mt-8 text-sm text-slate-500">
                      <MapPin size={16} />
                      <span>Utrecht & heel Nederland — ook online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Contact Form */}
              <div>
                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-slate-100">
                  {status === 'success' ? (
                    <div className="text-center py-12">
                      <div className="inline-flex p-5 bg-green-100 rounded-full mb-6">
                        <CheckCircle size={48} className="text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">
                        Bericht ontvangen!
                      </h3>
                      <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                        Ik neem binnen enkele uren contact met je op. Check ook je spam folder.
                      </p>
                      <Button
                        onClick={() => setStatus('idle')}
                        variant="outline"
                        className="rounded-full"
                      >
                        Nog een bericht sturen
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <MessageCircle size={20} className="text-orange-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">Stuur een bericht</h2>
                          <p className="text-sm text-slate-500">Ik reageer binnen 4 uur</p>
                        </div>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Honeypot field - hidden from users, but bots will fill it */}
                        <div className="hidden" aria-hidden="true">
                          <label htmlFor="website">Website</label>
                          <input
                            id="website"
                            name="website"
                            type="text"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            tabIndex={-1}
                            autoComplete="off"
                          />
                        </div>

                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                            Naam <span className="text-orange-500">*</span>
                          </label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Jouw naam"
                            className="h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                            disabled={status === 'loading'}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                              E-mail <span className="text-orange-500">*</span>
                            </label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="jouw@email.nl"
                              className="h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                              disabled={status === 'loading'}
                            />
                          </div>
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                              Telefoon <span className="text-slate-400">(optioneel)</span>
                            </label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="06 12 34 56 78"
                              className="h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                              disabled={status === 'loading'}
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                            Bericht <span className="text-orange-500">*</span>
                          </label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Waar kan ik je mee helpen? Vertel me over je vraag, project of idee..."
                            rows={5}
                            className="rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 resize-none"
                            disabled={status === 'loading'}
                          />
                        </div>

                        {status === 'error' && errorMessage && (
                          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            <AlertCircle size={18} />
                            <span>{errorMessage}</span>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={status === 'loading'}
                          className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50"
                        >
                          {status === 'loading' ? (
                            <>
                              <Loader2 size={20} className="animate-spin mr-2" />
                              Verzenden...
                            </>
                          ) : (
                            <>
                              <Send size={20} className="mr-2" />
                              Verstuur bericht
                            </>
                          )}
                        </Button>

                        <p className="text-center text-xs text-slate-400">
                          Door te verzenden ga je akkoord met de{' '}
                          <Link href="/privacy" className="text-orange-600 hover:underline">
                            privacyverklaring
                          </Link>
                        </p>
                      </form>
                    </>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-orange-500" />
                    <span>Reactie {"<"}4 uur</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-orange-500" />
                    <span>100% persoonlijk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Bar */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Liever meteen plannen?
              </h2>
              <p className="text-slate-400">
                Iris kijkt mijn agenda voor je na en plant direct in.
              </p>
            </div>
            <Button
              onClick={openBooking}
              size="lg"
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold shadow-lg shadow-orange-500/30 whitespace-nowrap"
            >
              <Calendar size={20} className="mr-2" />
              Plan via Iris
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
