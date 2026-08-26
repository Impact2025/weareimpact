'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, Send, User, Mail, Building, Phone, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BookingType {
  slug: string;
  name: string;
  duration: number;
  price: string;
  icon: string;
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

type Step = 'chat' | 'select_type' | 'select_time' | 'fill_form' | 'confirmed';

// Main Component
export function BookingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hoi! 👋 Wil je een afspraak plannen met Vincent? Ik help je graag. Waar ben je naar op zoek?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<BookingType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableDays, setAvailableDays] = useState<DaySlots[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    organization: '',
  });
  const [booking, setBooking] = useState<{ id: string; typeName: string; startTime: string; duration: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const bookingTypes: BookingType[] = [
    { slug: 'kennismaking', name: 'Kennismakingsgesprek', duration: 30, price: '', icon: '' },
    { slug: 'strategie-ai', name: 'AI Strategiesessie', duration: 60, price: '', icon: '' },
    { slug: 'strategie-impact', name: 'Impact Strategiesessie', duration: 60, price: '', icon: '' },
    { slug: 'lego-intro', name: 'LEGO Serious Play Intro', duration: 90, price: '', icon: '' },
  ];

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage('user', userMessage);
    setIsLoading(true);

    // Simple keyword detection for quick responses
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('afspraak') || lowerMessage.includes('plannen') || lowerMessage.includes('gesprek')) {
      setTimeout(() => {
        addMessage('assistant', 'Goed idee! Wat voor gesprek past het beste bij jou? Kies hieronder:');
        setStep('select_type');
        setIsLoading(false);
      }, 500);
      return;
    }

    // For other messages, use AI
    try {
      const response = await fetch('/api/booking/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })).concat({
            role: 'user',
            content: userMessage,
          }),
        }),
      });

      const data = await response.json();
      addMessage('assistant', data.message);

      if (data.action === 'show_types') {
        setStep('select_type');
      }
    } catch {
      addMessage('assistant', 'Er ging iets mis. Kies hieronder een type gesprek:');
      setStep('select_type');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectType = (type: BookingType) => {
    setSelectedType(type);
    addMessage('user', `${type.icon} ${type.name}`);
    addMessage('assistant', `${type.icon} ${type.name} - goede keuze! Hier zijn de beschikbare momenten:`);
    setStep('select_time');
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

    addMessage('user', `📅 ${formattedDate} om ${formattedTime}`);
    addMessage('assistant', 'Perfect! Nog even je gegevens zodat Vincent weet wie hij kan verwachten:');
    setStep('fill_form');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerData.name || !customerData.email || !selectedType || !selectedSlot) {
      return;
    }

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
        // De server bevestigt niet meer automatisch (zie api/booking/create) —
        // Vincent keurt de aanvraag zelf goed via de link in zijn mail. De
        // getoonde details komen daarom uit wat de bezoeker net koos, niet uit
        // een 'geboekt'-antwoord dat er niet meer is.
        setBooking({
          id: data.requestId,
          typeName: selectedType.name,
          startTime: selectedSlot.start,
          duration: selectedType.duration,
        });
        setStep('confirmed');
        addMessage('assistant', `Je aanvraag is verstuurd! Vincent bevestigt 'm persoonlijk — je hoort dan op ${customerData.email} of dit moment past.`);
      } else {
        addMessage('assistant', 'Er ging iets mis bij het aanvragen. Probeer het opnieuw of mail naar v.munster@weareimpact.nl');
      }
    } catch {
      addMessage('assistant', 'Er ging iets mis. Neem contact op via v.munster@weareimpact.nl');
    } finally {
      setIsLoading(false);
    }
  };

  const resetBooking = () => {
    setStep('chat');
    setSelectedType(null);
    setSelectedSlot(null);
    setCustomerData({ name: '', email: '', phone: '', organization: '' });
    setBooking(null);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hoi! 👋 Wil je een afspraak plannen met Vincent? Ik help je graag.',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all hover:scale-105',
          isOpen && 'hidden'
        )}
      >
        <Calendar className="w-5 h-5" />
        <span className="font-medium">Plan een gesprek</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-lg font-bold">
                V
              </div>
              <div>
                <h3 className="font-semibold">Plan met Vincent</h3>
                <p className="text-xs text-slate-300">Meestal binnen 24 uur bevestigd</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] bg-slate-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2',
                    message.role === 'user'
                      ? 'bg-orange-500 text-white rounded-br-md'
                      : 'bg-white text-slate-800 shadow-sm rounded-bl-md'
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {/* Booking Type Selection */}
            {step === 'select_type' && (
              <div className="space-y-2">
                {bookingTypes.map((type) => (
                  <button
                    key={type.slug}
                    onClick={() => handleSelectType(type)}
                    className="w-full text-left p-3 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium text-slate-800 group-hover:text-orange-600">
                            {type.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {type.duration} min
                          </div>
                        </div>
                      </div>
                      <div className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Time Selection */}
            {step === 'select_time' && (
              <div className="space-y-3">
                {availableDays.length === 0 ? (
                  <div className="text-center py-4 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Beschikbaarheid laden...
                  </div>
                ) : (
                  availableDays.slice(0, 5).map((day) => (
                    <div key={day.date} className="bg-white rounded-xl p-3 shadow-sm">
                      <div className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        {day.dayName}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {day.slots.slice(0, 6).map((slot, idx) => {
                          const time = new Date(slot.start).toLocaleTimeString('nl-NL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectSlot(slot)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-orange-100 hover:text-orange-700 rounded-lg text-sm font-medium transition-colors"
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
            {step === 'fill_form' && (
              <form onSubmit={handleSubmitForm} className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                    <User className="w-4 h-4" /> Naam *
                  </label>
                  <Input
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    placeholder="Je naam"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                    <Mail className="w-4 h-4" /> E-mail *
                  </label>
                  <Input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    placeholder="je@email.nl"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                    <Building className="w-4 h-4" /> Organisatie
                  </label>
                  <Input
                    value={customerData.organization}
                    onChange={(e) => setCustomerData({ ...customerData, organization: e.target.value })}
                    placeholder="Optioneel"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                    <Phone className="w-4 h-4" /> Telefoon
                  </label>
                  <Input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    placeholder="Optioneel"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={isLoading || !customerData.name || !customerData.email}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Bevestig afspraak
                </Button>
              </form>
            )}

            {/* Confirmation */}
            {step === 'confirmed' && booking && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-4xl mb-3">📨</div>
                <h4 className="font-semibold text-green-800 mb-2">Aanvraag verstuurd!</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p className="font-medium">{booking.typeName}</p>
                  <p>
                    {new Date(booking.startTime).toLocaleDateString('nl-NL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  <p>
                    {new Date(booking.startTime).toLocaleTimeString('nl-NL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} ({booking.duration} min)
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-xs text-green-600 mb-3">
                    Vincent bevestigt dit moment persoonlijk — je hoort het per mail op {customerData.email}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetBooking}
                    className="text-green-700 border-green-300"
                  >
                    Nieuwe afspraak plannen
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {step === 'chat' && (
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Typ je bericht..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    addMessage('user', 'Ik wil een afspraak plannen');
                    addMessage('assistant', 'Goed idee! Wat voor gesprek past het beste bij jou?');
                    setStep('select_type');
                  }}
                  className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
                >
                  📅 Afspraak plannen
                </button>
                <button
                  onClick={() => {
                    setInputValue('Wat kan Vincent voor mij betekenen?');
                  }}
                  className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
                >
                  ❓ Meer info
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default BookingAssistant;
