'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, MessageSquare, Calendar, User, Mail, Building, Phone, Check, Loader2, ArrowLeft, ChevronRight, Play, BookOpen, ChevronDown, Sparkles, Clock, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { IrisAvatar, IrisInline, useIris, type IrisMoment } from '@/components/features/IrisAvatar';
import { trackEvents } from '@/components/analytics';

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
const IRIS_AVATAR = '/iris-avatar.webp'; // Iris face photo

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
  'Ik was bij het AI Leadership Lab: waar vind ik de slides en prompts?',
  'Hoe pas ik procesautomatisering toe in mijn maatschappelijke organisatie?',
  'Plan een 1-op-1 AI-verkenning met Vincent',
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
            src="/weareimpact-hart.webp"
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

function renderContent(text: string): React.ReactNode[] {
  // Strip markdown headers and parse **bold** + [link](url)
  const cleaned = text.replace(/^#{1,3}\s*/gm, '');
  const tokenRegex = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  while ((match = tokenRegex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) parts.push(cleaned.slice(lastIndex, match.index));
    if (match[0].startsWith('**')) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else {
      parts.push(
        <a key={match.index} href={match[4]} className="text-orange-500 underline hover:text-orange-600 transition-colors">
          {match[3]}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < cleaned.length) parts.push(cleaned.slice(lastIndex));
  return parts.length ? parts : [text];
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
  // Track if this message was shown via live streaming to avoid re-animating it
  const wasStreamedRef = useRef(false);

  useEffect(() => {
    // During live streaming: show content directly as it arrives
    if (message.isStreaming) {
      wasStreamedRef.current = true;
      setDisplayedContent(message.content);
      return;
    }

    // After streaming finished: don't replay the animation
    if (wasStreamedRef.current) {
      setDisplayedContent(message.content);
      if (message.showQuickReplies) setTimeout(() => setShowReplies(true), 200);
      return;
    }

    // Non-streamed assistant message (e.g. booking flow): animate character by character
    if (message.role === 'assistant' && isLatest && message.content) {
      setIsAnimating(true);
      setDisplayedContent('');
      let index = 0;
      const content = message.content;
      const speed = Math.max(10, Math.min(30, 1500 / content.length));
      const timer = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(content.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          setIsAnimating(false);
          if (message.showQuickReplies) setTimeout(() => setShowReplies(true), 200);
        }
      }, speed);
      return () => clearInterval(timer);
    } else {
      setDisplayedContent(message.content);
      if (message.showQuickReplies && !isLatest) setShowReplies(true);
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
            {renderContent(displayedContent)}
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
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    organization: '',
  });
  const [bookingNotes, setBookingNotes] = useState('');
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ id: string; typeName: string; startTime: string; duration: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load stored name and check for first visit
  useEffect(() => {
    setUserName(getStoredName());
    // Check if user has seen Iris welcome before
    const hasSeenIris = localStorage.getItem('weareimpact_iris_welcome');
    setHasSeenWelcome(!!hasSeenIris);
  }, []);

  // Auto-open chat with Iris video for first-time visitors
  useEffect(() => {
    const hasSeenIris = localStorage.getItem('weareimpact_iris_welcome');
    if (!hasSeenIris) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 4000); // 4 seconden na paginaload
      return () => clearTimeout(timer);
    }
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
    trackEvents.chatbotMessage();

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

        // Don't show the META marker while streaming
        const displayContent = fullContent.replace(/<!--META:[\s\S]*?-->/, '');

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, content: displayContent } : m
          )
        );
      }

      // Parse metadata from response (includes article suggestions)
      let suggestedArticles: SuggestedArticle[] = [];
      const metaMatch = fullContent.match(/<!--META:([\s\S]*?)-->/);
      if (metaMatch) {
        try {
          const metadata = JSON.parse(metaMatch[1]);
          if (metadata.articles && Array.isArray(metadata.articles)) {
            suggestedArticles = metadata.articles;
          }
        } catch (e) {
          console.error('Failed to parse metadata:', e);
        }
      }

      // Remove META marker from content
      const cleanContent = fullContent.replace(/<!--META:[\s\S]*?-->/, '').trim();

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

  // Listen for global openIrisChat event — used by standalone pages (bv. /iris)
  // om de widget direct open te zetten, optioneel met een starterprompt.
  useEffect(() => {
    const handleOpenIrisChat = (e: Event) => {
      setIsOpen(true);
      const prompt = (e as CustomEvent<{ prompt?: string }>).detail?.prompt;
      if (prompt) {
        setTimeout(() => sendMessage(prompt), 400);
      }
    };
    window.addEventListener('openIrisChat', handleOpenIrisChat);
    return () => window.removeEventListener('openIrisChat', handleOpenIrisChat);
  }, [messages.length]);

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
        trackEvents.bookingComplete(selectedType.slug);
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
    setActiveDayIndex(0);
    setCustomerData({ name: '', email: '', phone: '', organization: '' });
    setBookingNotes('');
    setShowExtraFields(false);
    setBookingResult(null);
  };

  const goBackBooking = () => {
    if (bookingStep === 'select_time') {
      setBookingStep('select_type');
      setSelectedType(null);
      setActiveDayIndex(0);
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
    trackEvents.bookingStart('iris_chat');
    if (showIrisFirst) {
      // Show Iris booking video first, then proceed
      showIris('booking');
    } else {
      addMessage('user', 'Ik wil een gesprek plannen');
      addMessage('assistant', 'Welk type gesprek past het beste bij je situatie?');
      setBookingStep('select_type');
    }
  };

  // Generate .ics calendar file for download
  const downloadICS = () => {
    if (!bookingResult) return;
    const start = new Date(bookingResult.startTime);
    const end = new Date(start.getTime() + bookingResult.duration * 60000);
    const format = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//WeAreImpact//Booking//NL',
      'BEGIN:VEVENT',
      `DTSTART:${format(start)}`,
      `DTEND:${format(end)}`,
      `SUMMARY:${bookingResult.typeName} met Vincent van Munster`,
      'DESCRIPTION:WeAreImpact gesprek. Vincent neemt contact op met de details.',
      'LOCATION:Online (link volgt per e-mail)',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weareimpact-gesprek.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const greeting = getTimeBasedGreeting();
  const personalGreeting = userName
    ? `${greeting}, ${userName}. Waarmee kan ik je helpen?`
    : `${greeting}. Stel een vraag of plan direct een gesprek.`;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          trackEvents.chatbotOpen();
        }}
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
                    muted
                    onEnded={handleWelcomeVideoEnd}
                    onError={handleWelcomeVideoEnd}
                  />
                  {/* Unmute knop */}
                  <button
                    onClick={() => {
                      if (welcomeVideoRef.current) welcomeVideoRef.current.muted = false;
                    }}
                    className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white text-xs transition-colors flex items-center gap-1"
                  >
                    🔇 Geluid aan
                  </button>
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

            {/* ── BOOKING FLOW ── */}
            {bookingStep !== 'none' && bookingStep !== 'confirmed' && (
              <div className="mt-2 mb-1 animate-in fade-in-0 duration-300">
                {/* Progress steps */}
                <div className="flex items-center justify-between px-1 mb-4">
                  {[
                    { label: 'Gesprek', step: 'select_type' },
                    { label: 'Tijdstip', step: 'select_time' },
                    { label: 'Gegevens', step: 'fill_form' },
                  ].map((s, i) => {
                    const stepOrder = ['select_type', 'select_time', 'fill_form'];
                    const currentIdx = stepOrder.indexOf(bookingStep);
                    const isActive = bookingStep === s.step;
                    const isDone = currentIdx > i;
                    return (
                      <div key={s.step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                            isDone ? 'bg-emerald-500 text-white' :
                            isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' :
                            'bg-slate-200 text-slate-400'
                          )}>
                            {isDone ? <Check size={12} /> : i + 1}
                          </div>
                          <span className={cn(
                            'text-[10px] font-medium transition-colors',
                            isActive ? 'text-orange-600' : isDone ? 'text-emerald-600' : 'text-slate-400'
                          )}>{s.label}</span>
                        </div>
                        {i < 2 && (
                          <div className={cn(
                            'h-0.5 flex-1 mx-1 mb-4 rounded-full transition-all duration-500',
                            isDone ? 'bg-emerald-400' : 'bg-slate-200'
                          )} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 1: Type Selection */}
            {bookingStep === 'select_type' && (
              <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                {/* Featured: Gratis kennismaking */}
                <button
                  onClick={() => handleSelectType(BOOKING_TYPES[0])}
                  className="w-full text-left p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 group animate-in fade-in-0 slide-in-from-bottom-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-orange-100">30 min</span>
                      </div>
                      <div className="font-semibold text-white text-base">Kennismakingsgesprek</div>
                      <div className="text-sm text-orange-100 mt-0.5">Vrijblijvend ontdekken of we een match zijn</div>
                    </div>
                    <ChevronRight size={18} className="text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-2 py-1 px-1">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400">of kies specifiek</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Paid options: compact */}
                {BOOKING_TYPES.slice(1).map((type, idx) => (
                  <button
                    key={type.slug}
                    onClick={() => handleSelectType(type)}
                    className="w-full text-left px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 group animate-in fade-in-0 slide-in-from-bottom-2"
                    style={{ animationDelay: `${(idx + 1) * 60}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-800 text-sm group-hover:text-slate-900">{type.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{type.duration} min</div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Time Selection */}
            {bookingStep === 'select_time' && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <button
                  onClick={goBackBooking}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors mb-3"
                >
                  <ArrowLeft size={13} /> Terug
                </button>

                {/* Selected type chip */}
                {selectedType && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full w-fit">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    <span className="text-xs font-medium text-orange-700">{selectedType.name}</span>
                    <span className="text-xs text-orange-400">· {selectedType.duration} min</span>
                  </div>
                )}

                {availableDays.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      </div>
                      <span className="text-sm text-slate-500">Beschikbaarheid ophalen...</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {/* Day tabs */}
                    <div className="flex overflow-x-auto border-b border-slate-100 scrollbar-none">
                      {availableDays.slice(0, 7).map((day, idx) => {
                        const d = new Date(day.date);
                        const dayShort = d.toLocaleDateString('nl-NL', { weekday: 'short' });
                        const dayNum = d.getDate();
                        const isActive = idx === activeDayIndex;
                        return (
                          <button
                            key={day.date}
                            onClick={() => setActiveDayIndex(idx)}
                            className={cn(
                              'flex flex-col items-center px-3 py-2.5 min-w-[52px] text-center transition-all duration-200 border-b-2 flex-shrink-0',
                              isActive
                                ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            )}
                          >
                            <span className="text-[10px] font-medium uppercase tracking-wide">{dayShort}</span>
                            <span className={cn('text-base font-semibold leading-tight', isActive && 'text-orange-600')}>{dayNum}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Time slots for active day */}
                    <div className="p-3">
                      {availableDays[activeDayIndex]?.slots.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 py-4">Geen beschikbaarheid</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {availableDays[activeDayIndex]?.slots.slice(0, 9).map((slot, slotIdx) => {
                            const time = new Date(slot.start).toLocaleTimeString('nl-NL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                            return (
                              <button
                                key={slotIdx}
                                onClick={() => handleSelectSlot(slot)}
                                className="py-2.5 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 transition-all duration-200 hover:scale-[1.03] active:scale-95 animate-in fade-in-0"
                                style={{ animationDelay: `${slotIdx * 30}ms` }}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <p className="text-center text-xs text-slate-400 mt-3">
                        Geen passend moment?{' '}
                        <a href="mailto:v.munster@weareimpact.nl" className="text-orange-500 hover:underline">Mail ons</a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Form */}
            {bookingStep === 'fill_form' && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <button
                  onClick={goBackBooking}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors mb-3"
                >
                  <ArrowLeft size={13} /> Terug
                </button>

                {/* Summary strip */}
                {selectedType && selectedSlot && (
                  <div className="flex items-center gap-2 mb-3 p-3 bg-slate-900 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{selectedType.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(selectedSlot.start).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' · '}
                        {new Date(selectedSlot.start).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                        {' · '}{selectedType.duration} min
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-emerald-400" />
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmitBooking} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Naam *</label>
                      <Input
                        value={customerData.name}
                        onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                        placeholder="Je volledige naam"
                        required
                        autoFocus
                        className="text-sm border-slate-200 focus:border-orange-300 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">E-mail *</label>
                      <Input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                        placeholder="je@organisatie.nl"
                        required
                        className="text-sm border-slate-200 focus:border-orange-300 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                        Wil je iets meegeven? <span className="font-normal normal-case text-slate-400">(optioneel)</span>
                      </label>
                      <Textarea
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        placeholder="Korte toelichting, context of vraag voor Vincent..."
                        rows={2}
                        className="text-sm border-slate-200 focus:border-orange-300 focus:ring-orange-100 resize-none"
                      />
                    </div>

                    {/* Expandable extra fields */}
                    <button
                      type="button"
                      onClick={() => setShowExtraFields(!showExtraFields)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <ChevronDown size={13} className={cn('transition-transform duration-200', showExtraFields && 'rotate-180')} />
                      {showExtraFields ? 'Minder' : 'Organisatie & telefoon toevoegen'}
                    </button>

                    {showExtraFields && (
                      <div className="space-y-3 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Organisatie</label>
                          <Input
                            value={customerData.organization}
                            onChange={(e) => setCustomerData({ ...customerData, organization: e.target.value })}
                            placeholder="Bedrijf of instelling"
                            className="text-sm border-slate-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Telefoon</label>
                          <Input
                            type="tel"
                            value={customerData.phone}
                            onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                            placeholder="+31 6 ..."
                            className="text-sm border-slate-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-4 pb-4">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200 hover:scale-[1.01]"
                      disabled={isLoading || !customerData.name || !customerData.email}
                    >
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" />Bezig...</>
                      ) : (
                        <>Bevestig gesprek <ChevronRight size={16} className="ml-1" /></>
                      )}
                    </Button>
                    <p className="text-center text-xs text-slate-400 mt-2">
                      Vincent bereidt zich voor op jullie gesprek
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* Confirmation */}
            {bookingStep === 'confirmed' && bookingResult && (
              <div className="mt-2 animate-in fade-in-0 zoom-in-95 duration-500">
                {/* Animated success */}
                <div className="text-center py-5">
                  <div className="relative inline-flex">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg mt-4 mb-1">Je staat in de agenda!</h4>
                  <p className="text-sm text-slate-500">Bevestiging gestuurd naar <span className="font-medium text-slate-700">{customerData.email}</span></p>
                </div>

                {/* Appointment card */}
                <div className="bg-slate-900 rounded-xl p-4 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar size={18} className="text-orange-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{bookingResult.typeName}</div>
                      <div className="text-slate-300 text-sm mt-1">
                        {new Date(bookingResult.startTime).toLocaleDateString('nl-NL', {
                          weekday: 'long', day: 'numeric', month: 'long',
                        })}
                      </div>
                      <div className="text-slate-400 text-sm flex items-center gap-1 mt-0.5">
                        <Clock size={12} />
                        {new Date(bookingResult.startTime).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                        {' '}&mdash;{' '}
                        {new Date(new Date(bookingResult.startTime).getTime() + bookingResult.duration * 60000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* What to expect */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Wat kun je verwachten?</div>
                  <div className="space-y-2">
                    {[
                      'Vincent stuurt een Google Meet link per e-mail',
                      'Gesprek duurt precies ' + bookingResult.duration + ' minuten',
                      'Vrijuit praten, geen verkooppitch',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={9} className="text-emerald-600" />
                        </div>
                        <span className="text-sm text-slate-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadICS}
                    className="flex-1 text-xs border-slate-200 hover:border-slate-300 gap-1.5"
                  >
                    <Download size={13} />
                    Agenda
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetBooking}
                    className="flex-1 text-xs border-slate-200 hover:border-slate-300"
                  >
                    Nieuw gesprek
                  </Button>
                </div>
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
