'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, MessageSquare, Calendar, User, Mail, Building, Phone, Check, Loader2, ArrowLeft, ChevronRight, Play, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { IrisAvatar, IrisInline, useIris, type IrisMoment } from '@/components/features/IrisAvatar';

// Types
interface SuggestedArticle {
  title: string;
  slug: string;
  excerpt: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  showQuickReplies?: boolean;
  suggestedArticles?: SuggestedArticle[];
}

interface BookingType {
  slug: string;
  name: string;
  duration: number;
  price: string;
  description: string;
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface DaySlots {
  date: string;
  dayName: string;
  slots: TimeSlot[];
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  organization: string;
}

type BookingStep = 'none' | 'select_type' | 'select_time' | 'fill_form' | 'confirmed';

// Constants
const VINCENT_AVATAR = '/vincent-avatar.jpg'; // Add Vincent's photo to public folder
const IRIS_AVATAR = '/iris-avatar.png'; // Iris face photo

const BOOKING_TYPES: BookingType[] = [
  {
    slug: 'kennismaking',
    name: 'Kennismakingsgesprek',
    duration: 30,
    price: 'Gratis',
    description: 'Vrijblijvend kennismaken en mogelijkheden verkennen'
  },
  {
    slug: 'strategie-ai',
    name: 'AI Strategiesessie',
    duration: 60,
    price: '€150',
    description: 'Concrete AI-strategie voor jouw organisatie'
  },
  {
    slug: 'strategie-impact',
    name: 'Impact Strategiesessie',
    duration: 60,
    price: '€150',
    description: 'Sociale impact en innovatie roadmap'
  },
  {
    slug: 'lego-intro',
    name: 'LEGO Serious Play Intro',
    duration: 90,
    price: '€250',
    description: 'Introductie workshop voor teams'
  },
];

const STARTER_PROMPTS = [
  'Hoe kan AI de welzijnssector versterken?',
  'Wat is LEGO Serious Play?',
  'Vertel over WeAreImpact ventures',
];

const BOOKING_KEYWORDS = [
  'afspraak', 'plannen', 'gesprek', 'meeting', 'bellen', 'contact',
  'kennismaken', 'sessie', 'boeken', 'agenda', 'beschikbaar', 'wanneer'
];

// Keywords that trigger Iris video moments
const IRIS_TRIGGERS: Record<IrisMoment, string[]> = {
  'welcome': [], // Triggered on first open
  'ai-expert': ['ai', 'artificial intelligence', 'kunstmatige intelligentie', 'chatgpt', 'automatiseren', 'welzijn', 'zorg', 'innovatie'],
  'lego-play': ['lego', 'serious play', 'workshop', 'team', 'teambuilding', 'bouwen', 'creativiteit'],
  'booking': [], // Triggered by booking flow
};

// Utility functions
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
};

const getStoredName = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('weareimpact_user_name');
};

const storeName = (name: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('weareimpact_user_name', name);
  }
};

// Iris Avatar Component (met Iris gezicht)
function IrisAvatarSmall({ size = 'md', showStatus = false }: { size?: 'sm' | 'md' | 'lg'; showStatus?: boolean }) {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const [imgError, setImgError] = useState(false);

  return (
    <div className={cn('relative flex-shrink-0', sizeClasses[size])}>
      {!imgError ? (
        <Image
          src={IRIS_AVATAR}
          alt="Iris"
          fill
          className="rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={cn(
          'rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center',
          sizeClasses[size]
        )}>
          <Image
            src="/WeAreImpact_hart.png"
            alt="Iris"
            width={size === 'sm' ? 20 : size === 'md' ? 28 : 40}
            height={size === 'sm' ? 20 : size === 'md' ? 28 : 40}
            className="object-contain"
          />
        </div>
      )}
      {showStatus && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}

// Vincent Avatar Component
function VincentAvatar({ size = 'md', showStatus = false }: { size?: 'sm' | 'md' | 'lg'; showStatus?: boolean }) {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const [imgError, setImgError] = useState(false);

  return (
    <div className={cn('relative flex-shrink-0', sizeClasses[size])}>
      {!imgError ? (
        <Image
          src={VINCENT_AVATAR}
          alt="Vincent van Munster"
          fill
          className="rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={cn(
          'rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-semibold',
          sizeClasses[size],
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          V
        </div>
      )}
      {showStatus && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}

// Animated Message Component
function AnimatedMessage({
  message,
  isLatest,
  onQuickReply
}: {
  message: Message;
  isLatest: boolean;
  onQuickReply?: (text: string) => void;
}) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  useEffect(() => {
    if (message.role === 'assistant' && isLatest && message.content && !message.isStreaming) {
      // Streaming text effect for new assistant messages
      setIsAnimating(true);
      setDisplayedContent('');

      let index = 0;
      const content = message.content;
      const speed = Math.max(10, Math.min(30, 1500 / content.length)); // Adaptive speed

      const timer = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(content.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          setIsAnimating(false);
          // Show quick replies after animation completes
          if (message.showQuickReplies) {
            setTimeout(() => setShowReplies(true), 200);
          }
        }
      }, speed);

      return () => clearInterval(timer);
    } else {
      setDisplayedContent(message.content);
      if (message.showQuickReplies && !isLatest) {
        setShowReplies(true);
      }
    }
  }, [message.content, message.role, isLatest, message.isStreaming, message.showQuickReplies]);

  const quickReplies = [
    { text: 'Vertel meer', action: 'Vertel me hier meer over' },
    { text: 'Plan gesprek', action: 'Ik wil een gesprek plannen' },
  ];

  return (
    <div
      className={cn(
        'flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.role === 'assistant' && (
        <IrisAvatarSmall size="sm" />
      )}
      <div className="flex flex-col gap-2 max-w-[80%]">
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm',
            message.role === 'user'
              ? 'bg-slate-900 text-white rounded-br-sm'
              : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
          )}
        >
          <p className="whitespace-pre-wrap leading-relaxed">
            {displayedContent}
            {isAnimating && (
              <span className="inline-block w-0.5 h-4 bg-slate-400 ml-0.5 animate-pulse" />
            )}
          </p>
        </div>

        {/* Suggested Articles from Kennisbank */}
        {showReplies && message.role === 'assistant' && message.suggestedArticles && message.suggestedArticles.length > 0 && (
          <div className="mt-2 space-y-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <BookOpen size={12} />
              <span>Relevante artikelen:</span>
            </div>
            {message.suggestedArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/kennisbank/${article.slug}`}
                className="block p-3 bg-gradient-to-r from-orange-50 to-white border border-orange-100 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all group"
              >
                <div className="font-medium text-sm text-slate-800 group-hover:text-orange-600 transition-colors">
                  {article.title}
                </div>
                <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {article.excerpt}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Replies */}
        {showReplies && message.role === 'assistant' && onQuickReply && (
          <div className="flex gap-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
            {quickReplies.map((reply) => (
              <button
                key={reply.text}
                onClick={() => onQuickReply(reply.action)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                {reply.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DigitalTwin() {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  // Iris welcome video state
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);
  const [welcomeVideoFading, setWelcomeVideoFading] = useState(false);
  const [showWelcomeTyping, setShowWelcomeTyping] = useState(false);
  const [welcomeMessageStep, setWelcomeMessageStep] = useState(0);
  const welcomeVideoRef = useRef<HTMLVideoElement>(null);

  // Iris state
  const { currentMoment, isVisible: isIrisVisible, showIris, hideIris } = useIris();

  // Booking state
  const [bookingStep, setBookingStep] = useState<BookingStep>('none');
  const [selectedType, setSelectedType] = useState<BookingType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableDays, setAvailableDays] = useState<DaySlots[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    organization: '',
  });
  const [bookingResult, setBookingResult] = useState<{ id: string; typeName: string; startTime: string; duration: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load stored name and check for first visit
  useEffect(() => {
    setUserName(getStoredName());
    // Check if user has seen Iris welcome before
    const hasSeenIris = localStorage.getItem('weareimpact_iris_welcome');
    setHasSeenWelcome(!!hasSeenIris);
  }, []);

  // Show Iris welcome video on first chat open
  useEffect(() => {
    if (isOpen && !hasSeenWelcome && messages.length === 0) {
      // Start welcome video flow
      const timer = setTimeout(() => {
        setShowWelcomeVideo(true);
        localStorage.setItem('weareimpact_iris_welcome', 'true');
        setHasSeenWelcome(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasSeenWelcome, messages.length]);

  // Handle welcome video end - start the fade and typing sequence
  const handleWelcomeVideoEnd = () => {
    // Start fade out
    setWelcomeVideoFading(true);

    // After fade, show typing indicator
    setTimeout(() => {
      setShowWelcomeVideo(false);
      setWelcomeVideoFading(false);
      setShowWelcomeTyping(true);

      // Show first message after typing
      setTimeout(() => {
        setWelcomeMessageStep(1);

        // Show second message
        setTimeout(() => {
          setShowWelcomeTyping(false);
          setWelcomeMessageStep(2);
        }, 1500);
      }, 1200);
    }, 800);
  };

  // Skip welcome video
  const skipWelcomeVideo = () => {
    handleWelcomeVideoEnd();
  };

  // Detect Iris triggers in messages
  const detectIrisMoment = (text: string): IrisMoment | null => {
    const lower = text.toLowerCase();
    for (const [moment, keywords] of Object.entries(IRIS_TRIGGERS)) {
      if (keywords.length > 0 && keywords.some(k => lower.includes(k))) {
        return moment as IrisMoment;
      }
    }
    return null;
  };

  // Handle Iris action callbacks
  const handleIrisAction = (action: string) => {
    hideIris();
    switch (action) {
      case 'ai-sector':
        sendMessage('Hoe kan AI mijn sector versterken?');
        break;
      case 'booking':
        startBooking();
        break;
      case 'show-calendar':
        setBookingStep('select_type');
        break;
      default:
        break;
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, bookingStep]);

  // Fetch availability when type is selected
  useEffect(() => {
    if (selectedType) {
      fetchAvailability(selectedType.slug);
    }
  }, [selectedType]);

  const fetchAvailability = async (type: string) => {
    try {
      const response = await fetch(`/api/booking/availability?type=${type}`);
      const data = await response.json();
      setAvailableDays(data.days || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const addMessage = useCallback((
    role: 'user' | 'assistant',
    content: string,
    options?: { isStreaming?: boolean; showQuickReplies?: boolean }
  ) => {
    setMessages(prev => [...prev, {
      id: generateId(),
      role,
      content,
      isStreaming: options?.isStreaming,
      showQuickReplies: options?.showQuickReplies,
    }]);
  }, []);

  // Listen for global openBooking event (must be after addMessage definition)
  useEffect(() => {
    const handleOpenBooking = () => {
      setIsOpen(true);
      // Start booking flow after a short delay
      setTimeout(() => {
        if (messages.length === 0) {
          const greeting = getTimeBasedGreeting();
          addMessage('assistant', `${greeting}! Leuk dat je een gesprek wilt plannen. Wat voor type gesprek past het beste bij je?`);
        } else {
          addMessage('assistant', 'Laten we een gesprek plannen. Wat voor type past het beste bij je?');
        }
        setBookingStep('select_type');
      }, 300);
    };

    window.addEventListener('openBooking', handleOpenBooking);
    return () => window.removeEventListener('openBooking', handleOpenBooking);
  }, [messages.length, addMessage]);

  const detectBookingIntent = (text: string): boolean => {
    const lower = text.toLowerCase();
    return BOOKING_KEYWORDS.some(keyword => lower.includes(keyword));
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage = content.trim();
    addMessage('user', userMessage);
    setInput('');
    setIsLoading(true);

    // Check for booking intent
    if (detectBookingIntent(userMessage)) {
      setTimeout(() => {
        addMessage('assistant', 'Goed. Welk type gesprek past het beste bij je situatie?');
        setBookingStep('select_type');
        setIsLoading(false);
      }, 400);
      return;
    }

    // Regular chat with AI
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      const assistantId = generateId();
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      }]);

      let fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullContent += chunk;

        // Don't show the article marker while streaming
        const displayContent = fullContent.replace(/<!--ARTICLES:.*?-->/s, '');

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, content: displayContent } : m
          )
        );
      }

      // Parse article suggestions from response
      let suggestedArticles: SuggestedArticle[] = [];
      const articlesMatch = fullContent.match(/<!--ARTICLES:(.*?)-->/s);
      if (articlesMatch) {
        try {
          suggestedArticles = JSON.parse(articlesMatch[1]);
        } catch (e) {
          console.error('Failed to parse article suggestions:', e);
        }
      }

      // Remove article marker from content
      const cleanContent = fullContent.replace(/<!--ARTICLES:.*?-->/s, '').trim();

      // Mark streaming as complete and enable quick replies
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? {
            ...m,
            content: cleanContent,
            isStreaming: false,
            showQuickReplies: true,
            suggestedArticles: suggestedArticles.length > 0 ? suggestedArticles : undefined
          } : m
        )
      );
    } catch (error) {
      console.error('Chat error:', error);
      addMessage('assistant', 'Er ging iets mis. Probeer het opnieuw of mail naar v.munster@weareimpact.nl');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectType = (type: BookingType) => {
    setSelectedType(type);
    addMessage('user', type.name);
    addMessage('assistant', `${type.name} — ${type.duration} minuten. Kies een moment:`);
    setBookingStep('select_time');
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    const date = new Date(slot.start);
    const formattedDate = date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const formattedTime = date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    addMessage('user', `${formattedDate}, ${formattedTime}`);
    addMessage('assistant', 'Vul je gegevens in ter bevestiging.');
    setBookingStep('fill_form');
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerData.name || !customerData.email || !selectedType || !selectedSlot) {
      return;
    }

    // Store name for future visits
    storeName(customerData.name.split(' ')[0]);

    setIsLoading(true);

    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType: selectedType.slug,
          startTime: selectedSlot.start,
          customer: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone || undefined,
            organization: customerData.organization || undefined,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBookingResult(data.booking);
        setBookingStep('confirmed');
        addMessage('assistant', `Bevestigd. Je ontvangt een e-mail op ${customerData.email} met de details en videocall link.`);
      } else {
        addMessage('assistant', 'Er ging iets mis. Probeer opnieuw of mail naar v.munster@weareimpact.nl');
      }
    } catch {
      addMessage('assistant', 'Fout bij het boeken. Neem contact op via v.munster@weareimpact.nl');
    } finally {
      setIsLoading(false);
    }
  };

  const resetBooking = () => {
    setBookingStep('none');
    setSelectedType(null);
    setSelectedSlot(null);
    setCustomerData({ name: '', email: '', phone: '', organization: '' });
    setBookingResult(null);
  };

  const goBackBooking = () => {
    if (bookingStep === 'select_time') {
      setBookingStep('select_type');
      setSelectedType(null);
    } else if (bookingStep === 'fill_form') {
      setBookingStep('select_time');
      setSelectedSlot(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const startBooking = (showIrisFirst = false) => {
    if (showIrisFirst) {
      // Show Iris booking video first, then proceed
      showIris('booking');
    } else {
      addMessage('user', 'Ik wil een gesprek plannen');
      addMessage('assistant', 'Welk type gesprek past het beste bij je situatie?');
      setBookingStep('select_type');
    }
  };

  const greeting = getTimeBasedGreeting();
  const personalGreeting = userName
    ? `${greeting}, ${userName}. Waarmee kan ik je helpen?`
    : `${greeting}. Stel een vraag of plan direct een gesprek.`;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-full shadow-lg transition-all duration-300 hover:bg-slate-800 hover:scale-105 hover:shadow-xl',
          'animate-in fade-in-0 zoom-in-95 duration-300',
          isOpen && 'hidden'
        )}
        aria-label="Open assistent"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IrisAvatarSmall size="md" showStatus={true} />
              <div>
                <div className="font-semibold tracking-tight">Iris</div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Digitale collega van Vincent
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {/* Welcome Video Flow */}
            {showWelcomeVideo && messages.length === 0 && bookingStep === 'none' && (
              <div className={cn(
                "relative flex flex-col items-center justify-center h-full transition-opacity duration-700",
                welcomeVideoFading && "opacity-0"
              )}>
                <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl bg-slate-800">
                  <video
                    ref={welcomeVideoRef}
                    src="/videos/iris/welcome.mp4"
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted={false}
                    onEnded={handleWelcomeVideoEnd}
                    onError={handleWelcomeVideoEnd}
                  />
                  {/* Skip button */}
                  <button
                    onClick={skipWelcomeVideo}
                    className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white text-xs transition-colors"
                  >
                    Overslaan →
                  </button>
                </div>
              </div>
            )}

            {/* Welcome Messages after video (uitgestoken hand) */}
            {!showWelcomeVideo && welcomeMessageStep > 0 && messages.length === 0 && bookingStep === 'none' && (
              <div className="py-4 space-y-4">
                {/* Typing indicator */}
                {showWelcomeTyping && (
                  <div className="flex gap-3 justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    <IrisAvatarSmall size="sm" />
                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* First message: Koffie */}
                {welcomeMessageStep >= 1 && !showWelcomeTyping && (
                  <div className="flex gap-3 justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    <IrisAvatarSmall size="sm" />
                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm max-w-[85%]">
                      <p className="text-slate-700 text-sm">De (virtuele) koffie staat klaar! ☕</p>
                    </div>
                  </div>
                )}

                {/* Second message: Uitnodiging */}
                {welcomeMessageStep >= 2 && (
                  <div className="flex gap-3 justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                    <IrisAvatarSmall size="sm" />
                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm max-w-[85%]">
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Vincent zit vol verhalen en ideeën, maar hij is vooral benieuwd naar jou.
                        Zullen we dat gesprek inplannen om samen impact te maken?
                      </p>
                    </div>
                  </div>
                )}

                {/* Action buttons after welcome */}
                {welcomeMessageStep >= 2 && (
                  <div className="space-y-2 mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500" style={{ animationDelay: '200ms' }}>
                    <button
                      onClick={() => startBooking()}
                      className="w-full p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                      <Calendar size={16} />
                      Ja, plan een gesprek
                    </button>

                    <div className="space-y-2">
                      {STARTER_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(prompt)}
                          className="w-full text-left p-3 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center justify-between group"
                        >
                          <span>{prompt}</span>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Regular Empty State (for returning visitors) */}
            {!showWelcomeVideo && welcomeMessageStep === 0 && messages.length === 0 && bookingStep === 'none' && hasSeenWelcome && (
              <div className="py-6 animate-in fade-in-0 duration-500">
                <div className="text-center mb-6">
                  <IrisAvatarSmall size="lg" showStatus={true} />
                  <p className="text-slate-600 text-sm mt-4 leading-relaxed">
                    {personalGreeting}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Iris, digitale collega van Vincent
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  {STARTER_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(prompt)}
                      className="w-full text-left p-3 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center justify-between group animate-in fade-in-0 slide-in-from-bottom-2"
                      style={{ animationDelay: `${idx * 75}ms` }}
                    >
                      <span>{prompt}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => startBooking()}
                  className="w-full p-3 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all duration-200 flex items-center justify-center gap-2 animate-in fade-in-0 slide-in-from-bottom-2"
                  style={{ animationDelay: '225ms' }}
                >
                  <Calendar size={16} />
                  Gesprek plannen
                </button>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, idx) => (
              <AnimatedMessage
                key={message.id}
                message={message}
                isLatest={idx === messages.length - 1}
                onQuickReply={bookingStep === 'none' ? sendMessage : undefined}
              />
            ))}

            {/* Booking Type Selection */}
            {bookingStep === 'select_type' && (
              <div className="space-y-2 mt-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                {BOOKING_TYPES.map((type, idx) => (
                  <button
                    key={type.slug}
                    onClick={() => handleSelectType(type)}
                    className="w-full text-left p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 group animate-in fade-in-0 slide-in-from-bottom-2"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900 group-hover:text-slate-700">
                          {type.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {type.duration} min · {type.price}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Time Selection */}
            {bookingStep === 'select_time' && (
              <div className="space-y-3 mt-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <button
                  onClick={goBackBooking}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Terug
                </button>

                {availableDays.length === 0 ? (
                  <div className="text-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    <span className="text-sm text-slate-500">Beschikbaarheid laden...</span>
                  </div>
                ) : (
                  availableDays.slice(0, 5).map((day, idx) => (
                    <div
                      key={day.date}
                      className="bg-white rounded-xl p-4 border border-slate-200 animate-in fade-in-0 slide-in-from-bottom-2"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="font-medium text-slate-900 text-sm mb-3 flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {day.dayName}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {day.slots.slice(0, 6).map((slot, slotIdx) => {
                          const time = new Date(slot.start).toLocaleTimeString('nl-NL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          return (
                            <button
                              key={slotIdx}
                              onClick={() => handleSelectSlot(slot)}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-all duration-200 hover:scale-105"
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Form */}
            {bookingStep === 'fill_form' && (
              <div className="mt-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <button
                  onClick={goBackBooking}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors mb-3"
                >
                  <ArrowLeft size={14} />
                  Terug
                </button>

                <form onSubmit={handleSubmitBooking} className="bg-white rounded-xl p-4 border border-slate-200 space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5">
                      <User size={12} /> Naam
                    </label>
                    <Input
                      value={customerData.name}
                      onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                      placeholder="Je volledige naam"
                      required
                      className="text-sm transition-all duration-200 focus:scale-[1.01]"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5">
                      <Mail size={12} /> E-mail
                    </label>
                    <Input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                      placeholder="je@email.nl"
                      required
                      className="text-sm transition-all duration-200 focus:scale-[1.01]"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5">
                      <Building size={12} /> Organisatie
                      <span className="text-slate-400 font-normal">optioneel</span>
                    </label>
                    <Input
                      value={customerData.organization}
                      onChange={(e) => setCustomerData({ ...customerData, organization: e.target.value })}
                      placeholder="Bedrijf of organisatie"
                      className="text-sm transition-all duration-200 focus:scale-[1.01]"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5">
                      <Phone size={12} /> Telefoon
                      <span className="text-slate-400 font-normal">optioneel</span>
                    </label>
                    <Input
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                      placeholder="+31 6 12345678"
                      className="text-sm transition-all duration-200 focus:scale-[1.01]"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-sm transition-all duration-200 hover:scale-[1.02]"
                    disabled={isLoading || !customerData.name || !customerData.email}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Bevestigen
                  </Button>
                </form>
              </div>
            )}

            {/* Confirmation */}
            {bookingStep === 'confirmed' && bookingResult && (
              <div className="mt-2 bg-white rounded-xl p-5 border border-slate-200 text-center animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Afspraak bevestigd</h4>
                <div className="text-sm text-slate-600 space-y-1 mb-4">
                  <p className="font-medium">{bookingResult.typeName}</p>
                  <p>
                    {new Date(bookingResult.startTime).toLocaleDateString('nl-NL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  <p className="text-slate-500">
                    {new Date(bookingResult.startTime).toLocaleTimeString('nl-NL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} · {bookingResult.duration} min
                  </p>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Bevestiging verzonden naar {customerData.email}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetBooking}
                  className="text-sm transition-all duration-200 hover:scale-105"
                >
                  Nieuwe afspraak
                </Button>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && bookingStep === 'none' && (
              <div className="flex gap-3 justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <IrisAvatarSmall size="sm" />
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {bookingStep === 'none' && (
            <div className="p-4 border-t border-slate-200 bg-white">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Stel een vraag..."
                  disabled={isLoading}
                  className="flex-1 text-sm transition-all duration-200 focus:scale-[1.01]"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="bg-slate-900 hover:bg-slate-800 transition-all duration-200 hover:scale-105"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </Button>
              </form>
              {messages.length > 0 && (
                <button
                  onClick={() => startBooking()}
                  className="mt-2 w-full text-xs text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Calendar size={12} />
                  Gesprek plannen met Vincent
                </button>
              )}
            </div>
          )}

          {/* Booking step indicator */}
          {bookingStep !== 'none' && bookingStep !== 'confirmed' && (
            <div className="px-4 py-3 border-t border-slate-200 bg-white">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={cn(
                          'w-6 h-1 rounded-full transition-colors duration-300',
                          (bookingStep === 'select_type' && step === 1) ||
                          (bookingStep === 'select_time' && step <= 2) ||
                          (bookingStep === 'fill_form' && step <= 3)
                            ? 'bg-slate-900'
                            : 'bg-slate-200'
                        )}
                      />
                    ))}
                  </div>
                  <span>
                    {bookingStep === 'select_type' && 'Type gesprek'}
                    {bookingStep === 'select_time' && 'Kies moment'}
                    {bookingStep === 'fill_form' && 'Gegevens'}
                  </span>
                </div>
                <button
                  onClick={resetBooking}
                  className="hover:text-slate-700 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Iris Avatar Modal */}
      {currentMoment && (
        <IrisAvatar
          moment={currentMoment}
          isVisible={isIrisVisible}
          onClose={hideIris}
          onAction={handleIrisAction}
        />
      )}
    </>
  );
}
