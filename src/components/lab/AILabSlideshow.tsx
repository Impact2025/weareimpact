'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, MessageSquare, Send, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// WhatsApp link voor de LSP workshop
const WHATSAPP_NUMBER = '31614470977';
const WHATSAPP_MESSAGE = 'Ik heb net de AI Leadership Lab slideshow doorlopen en wil mijn bouwwerk delen met Iris.';

const LEADERSHIP_LAB_SLIDES = [
  {
    id: 'title',
    title: 'AI als persoonlijke hefboom',
    subtitle: 'Interactieve hands-on workshop',
    time: '15:00 – 17:00',
  },
];

export function AILabSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  // Scroll naar boven bij slide-change
  useEffect(() => {
    const container = document.getElementById('lab-slideshow');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((s) => Math.min(s + 1, SLIDES.length - 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((s) => Math.max(s - 1, 0));
  }, []);

  const copyPrompt = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
      toast.success('Prompt gekopieerd');
    } catch {
      toast.error('Kopiëren mislukt — selecteer de tekst zelf');
    }
  }, []);

  const openWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  };

  const openIrisChat = () => {
    window.dispatchEvent(new CustomEvent('openIrisChat', {
      detail: { prompt: 'Ik heb net de AI Leadership Lab doorlopen. Help mij mijn eerste AI-agent te bouwen.' }
    }));
  };

  const totalSlides = SLIDES.length;

  return (
    <div
      id="lab-slideshow"
      className="relative min-h-screen bg-[#f7f5f1] text-slate-900 font-['Plus_Jakarta_Sans',system-ui,sans-serif] overflow-hidden"
    >
      {/* Slide content */}
      <div className="min-h-[calc(100vh-80px)] flex flex-col">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`flex-1 flex flex-col items-center justify-center px-6 transition-all duration-500 ${
              index === currentSlide ? 'opacity-100 translate-y-0' : 'absolute opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            <div className="max-w-4xl mx-auto w-full">
              <SlideContent
                slide={slide}
                index={index}
                onCopyPrompt={copyPrompt}
                copiedText={copied}
                onWhatsApp={openWhatsApp}
                onIrisChat={openIrisChat}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-2 shadow-lg">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          aria-label="Vorige slide"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-mono text-slate-600">
          {currentSlide + 1} / {totalSlides}
        </span>
        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          aria-label="Volgende slide"
        >
          <ArrowRight size={18} />
        </button>
      </nav>
    </div>
  );
}

// Slide data
interface Slide {
  id: string;
  type: 'title' | 'eyebrow' | 'method' | 'content' | 'qr' | 'cta';
  eyebrow?: string;
  title: string;
  subtitle?: string;
  time?: string;
  content?: React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    id: 'title',
    type: 'title',
    title: 'AI als persoonlijke hefboom',
    subtitle: 'Van administratieve ballast naar echte maatschappelijke impact.',
    time: '15:00 – 17:00',
    eyebrow: 'VOOR DE REST VAN DE ZAAL',
  },
  {
    id: 'method',
    type: 'method',
    title: 'De 3-stappen methode',
    subtitle: '',
    content: (
      <div className="space-y-6">
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex-shrink-0 flex items-center justify-center font-bold">1</div>
          <div>
            <h3 className="font-bold text-lg mb-1">Bouw de frictie</h3>
            <p className="text-slate-600">Met LEGO, niet met woorden. Het bouwwerk dwingt je concreet te worden over wat er nu misgaat.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex-shrink-0 flex items-center justify-center font-bold">2</div>
          <div>
            <h3 className="font-bold text-lg mb-1">Vertaal naar een agent</h3>
            <p className="text-slate-600">Elk bouwwerk wijst naar een taak die een AI-agent kan overnemen: het eerste concept maken.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex-shrink-0 flex items-center justify-center font-bold">3</div>
          <div>
            <h3 className="font-bold text-lg mb-1">Trek de grens</h3>
            <p className="text-slate-600">De belangrijkste vraag: welke stap blijft mensenwerk? En waarom het misgaat als je dat te snel loslaat.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'prompt',
    type: 'content',
    eyebrow: 'Kopieer dit, samen met de foto',
    title: 'Jouw pro-prompt: bouw dit zelf, morgen',
    subtitle: 'Kopiëer & plak in ChatGPT of Claude',
    content: (
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap">
        Analyseer de foto van mijn LEGO-bouwwerk.
        {'\n\n'}Context: dit bouwwerk verbeeldt [mijn grootste administratieve knelpunt / mijn ideale AI-assistent] — [in 1 zin: waarom].
        {'\n\n'}Vertaal wat je ziet naar een concreet AI-hulpprofiel:
        1. Rol — welke rol moet een AI-assistent hier spelen?
        2. Taak — welke ene taak lost dit knelpunt op?
        3. Input — welke informatie heeft de assistent nodig om te starten?
        4. Output — wat moet het opleveren, en in welk format?
        5. Systeemprompt — schrijf de instructie die ik morgen direct kan hergebruiken.
        {'\n\n'}Wees concreet en praktisch: geen bespiegeling, een prompt die ik meteen kan kopiëren.
      </div>
    ),
  },
  {
    id: 'qr',
    type: 'qr',
    title: 'Liever de échte Iris?',
    subtitle: 'Scan en app haar rechtstreeks',
  },
  {
    id: 'why-it-works',
    type: 'eyebrow',
    title: 'Waarom dit werkt',
    content: 'Dezelfde vertaalslag als Iris — van beeld naar rol, taak en instructie — nu in de tool die je al hebt.',
  },
  {
    id: 'cta',
    type: 'cta',
    title: 'Klaar om te starten?',
    subtitle: 'Chat met Iris of deel je bouwwerk via WhatsApp',
    content: (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => {}}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-full font-bold text-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30"
        >
          <MessageSquare size={24} />
          Chat met Iris
        </button>
        <button
          onClick={() => {}}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white rounded-full font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-500/30"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2.01C6.48 2.01 2 6.29 2 11.55c0 2.06.77 3.95 2.06 5.38-.18.85-.26 1.28-.28 2.05-.02.7.16 1.35.47 1.8.31.46.84.68 1.35.69.42.01 1.1-.14 2.13-.48 1.11-.37 2.29-.56 3.3-.56 5.56 0 10.04-4.28 10.04-9.55 0-2.06-.77-3.95-2.06-5.38-.18-.85-.26-1.28-.28-2.05-.02-.7.16-1.35.47-1.8.31-.46.84-.68 1.35-.69.42-.01 1.1.14 2.13.48 1.11.37 2.29.56 3.3.56.09 0 .18.01.27.01.03-.15.06-.31.06-.46-..01-5.26-4.49-9.54-10.04-9.54S2.08 6.29 2.08 11.55c0 2.06.77 3.95 2.06 5.38.18.85.26 1.28.28 2.05.02.7-.16 1.35-.47 1.8-.31.46-.84.68-1.35.69-.42.01-1.1-.14-2.13-.48-1.11-.37-2.29-.56-3.3-.56-5.56 0-10.04-4.28-10.04-9.55 0-2.06-.77-3.95-2.06-5.38z"/>
            <path d="M12 18.25c-.17 0-.3-.13-.3-.3v-4.5c0-.17.13-.3.3-.3s.3.13.3.3v4.5c0 .17-.13.3-.3.3zm0 2.25c-.17 0-.3-.13-.3-.3v-.65c0-.17.13-.3.3-.3s.3.13.3.3v.65c0 .17-.13.3-.3.3z"/>
          </svg>
          Deel via WhatsApp
        </button>
      </div>
    ),
  },
];

interface SlideContentProps {
  slide: Slide;
  index: number;
  onCopyPrompt: (text: string) => void;
  copiedText: string | null;
  onWhatsApp: () => void;
  onIrisChat: () => void;
}

function SlideContent({ slide, onCopyPrompt, copiedText, onWhatsApp, onIrisChat }: SlideContentProps) {
  const basePrompt = `Analyseer de foto van mijn LEGO-bouwwerk.

Context: dit bouwwerk verbeeldt [mijn grootste administratieve knelpunt / mijn ideale AI-assistent] — [in 1 zin: waarom].

Vertaal wat je ziet naar een concreet AI-hulpprofiel:
1. Rol — welke rol moet een AI-assistent hier spelen?
2. Taak — welke ene taak lost dit knelpunt op?
3. Input — welke informatie heeft de assistent nodig om te starten?
4. Output — wat moet het opleveren, en in welk format?
5. Systeemprompt — schrijf de instructie die ik morgen direct kan hergebruiken.

Wees concreet en praktisch: geen bespiegeling, een prompt die ik meteen kan kopiëren.`;

  const promptCardClass = "bg-slate-900 text-slate-100 rounded-2xl p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap relative";

  return (
    <div className="space-y-6">
      {slide.eyebrow && (
        <div className="text-xs font-bold uppercase tracking-widest text-orange-600">
          {slide.eyebrow}
        </div>
      )}

      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
        {slide.title}
      </h2>

      {slide.subtitle && (
        <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
          {slide.subtitle}
        </p>
      )}

      {slide.time && (
        <p className="text-sm text-slate-500 font-medium">{slide.time}</p>
      )}

      {slide.content && slide.type !== 'content' && slide.type !== 'qr' && slide.type !== 'cta' && (
        <div className="mt-8">{slide.content}</div>
      )}

      {/* Prompt slide */}
      {slide.type === 'content' && (
        <div className="mt-8">
          <div className={promptCardClass}>
            {basePrompt}
            <button
              onClick={() => onCopyPrompt(basePrompt)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              aria-label="Kopieer prompt"
            >
              {copiedText === basePrompt ? (
                <CheckCircle size={16} className="text-green-400" />
              ) : (
                <Copy size={16} className="text-slate-400" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* QR code slide */}
      {slide.type === 'qr' && (
        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center gap-4">
            <div
              className="w-48 h-48 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden"
              dangerouslySetInnerHTML={{
                __html: atob(
                  'iVBORw0KGgoAAAANSUhEUgAABGcAAARnCAIAAADWtZw/AAAABmJLR0QA/wD/AP+gvaeTAAAgAElEQVR4nOzbzY0kR3dAUYVQhsyKrtDm8WY8CW0amEVB9yPVUcrH4DkGFF78ZPZcJGbtvf8LAACA/8V/Pz0AAADAaKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACgqCYAAICimgAAAIpqAgAAKKoJAACA1tPTD/zXQojN4WFgAAQElFTkSuQmCC'
                ),
              }}
              style={{ imageRendering: 'pixelated' }}
              aria-label="QR-code Iris LSP workshop"
            />
            <p className="text-sm font-medium text-slate-700 text-center">
              Liever de échte Iris? Scan en app haar rechtstreeks.
            </p>
          </div>
        </div>
      )}

      {/* CTA slide */}
      {slide.type === 'cta' && (
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onIrisChat}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-all shadow-lg"
          >
            <MessageSquare size={24} />
            Chat met Iris
          </button>
          <button
            onClick={onWhatsApp}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white rounded-full font-bold text-lg hover:bg-green-700 transition-all shadow-lg"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2.01C6.48 2.01 2 6.29 2 11.55c0 2.06.77 3.95 2.06 5.38-.18.85-.26 1.28-.28 2.05-.02.7.16 1.35.47 1.8.31.46.84.68 1.35.69.42.01 1.1-.14 2.13-.48 1.11-.37 2.29-.56 3.3-.56.09 0 .18.01.27.01.03-.15.06-.31.06-.46-.01-5.26-4.49-9.54-10.04-9.54S2.08 6.29 2.08 11.55c0 2.06.77 3.95 2.06 5.38.18.85.26 1.28.28 2.05.02.7-.16 1.35-.47 1.8-.31.46-.84.68-1.35.69-.42.01-1.1-.14-2.13-.48-1.11-.37-2.29-.56-3.3-.56-5.56 0-10.04-4.28-10.04-9.55 0-2.06-.77-3.95-2.06-5.38z"/>
              <path d="M12 18.25c-.17 0-.3-.13-.3-.3v-4.5c0-.17.13-.3.3-.3s.3.13.3.3v4.5c0 .17-.13.3-.3.3zm0 2.25c-.17 0-.3-.13-.3-.3v-.65c0-.17.13-.3.3-.3s.3.13.3.3v.65c0 .17-.13.3-.3.3z"/>
            </svg>
            Deel via WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
