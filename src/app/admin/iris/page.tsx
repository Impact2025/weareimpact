'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Calendar,
  Briefcase,
  CheckSquare,
  Trash2,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Web Speech API types
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function IrisAdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoSubmitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition() as SpeechRecognitionInstance;
    recognition.lang = 'nl-NL';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setInput(finalTranscript || interimTranscript);

      // Auto-submit after 1.5s of silence on final result
      if (finalTranscript) {
        if (autoSubmitTimeoutRef.current) {
          clearTimeout(autoSubmitTimeoutRef.current);
        }
        autoSubmitTimeoutRef.current = setTimeout(() => {
          if (finalTranscript.trim()) {
            sendMessage(finalTranscript.trim());
          }
        }, 1500);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
      setIsListening(false);
    };

    return recognition;
  }, []);

  // Check for speech recognition support
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = initRecognition();
    }
  }, [initRecognition]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Text-to-speech for Iris responses
  const speakText = useCallback((text: string) => {
    if (!speakEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Remove markdown formatting
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\n/g, '. ')
      .replace(/- /g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'nl-NL';
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [speakEnabled]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (autoSubmitTimeoutRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current);
      }
      // Submit what we have
      if (input.trim()) {
        sendMessage(input.trim());
      }
    } else {
      setInput('');
      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error('Recognition start error:', e);
      }
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Stop listening
    if (isListening) {
      recognitionRef.current?.abort();
      setIsListening(false);
    }
    if (autoSubmitTimeoutRef.current) {
      clearTimeout(autoSubmitTimeoutRef.current);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Prepare messages for API
    const apiMessages = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch('/api/admin/iris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      let fullContent = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullContent += chunk;

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessage.id
              ? { ...m, content: fullContent }
              : m
          )
        );
      }

      // Speak the response
      if (fullContent) {
        speakText(fullContent);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Er ging iets mis. Probeer het opnieuw.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    window.speechSynthesis?.cancel();
  };

  // Quick action categories
  const quickActionCategories = [
    {
      title: 'Agenda',
      icon: Calendar,
      color: 'orange',
      actions: [
        { label: 'Vandaag', action: 'Wat heb ik vandaag?' },
        { label: 'Morgen', action: 'Wat heb ik morgen?' },
        { label: 'Deze week', action: 'Wat staat er deze week op de planning?' },
        { label: 'Blokkeer tijd', action: 'Blokkeer morgenochtend van 9 tot 12' },
      ]
    },
    {
      title: 'CRM',
      icon: Briefcase,
      color: 'blue',
      actions: [
        { label: 'Briefing', action: 'Geef me mijn morning briefing' },
        { label: 'Pipeline', action: 'Wat is mijn pipeline waard?' },
        { label: 'Follow-ups', action: 'Welke klanten moet ik opvolgen?' },
        { label: 'Nieuwe deal', action: 'Voeg een nieuwe deal toe' },
      ]
    },
    {
      title: 'Taken',
      icon: CheckSquare,
      color: 'green',
      actions: [
        { label: 'Vandaag', action: 'Wat moet ik vandaag doen?' },
        { label: 'Achterstallig', action: 'Welke taken zijn achterstallig?' },
        { label: 'Nieuwe taak', action: 'Plan een follow-up met' },
        { label: 'Voltooid', action: 'Wat heb ik deze week afgerond?' },
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'orange': return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 'blue': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'green': return 'bg-green-50 border-green-200 hover:bg-green-100';
      default: return 'bg-slate-50 border-slate-200 hover:bg-slate-100';
    }
  };

  const getIconColorClasses = (color: string) => {
    switch (color) {
      case 'orange': return 'text-orange-600';
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-7rem)] flex flex-col pb-16 lg:pb-0">
      {/* Header - compact on mobile */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Iris</h1>
            <p className="text-sm text-slate-500 hidden sm:block">Je persoonlijke AI-assistent</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSpeakEnabled(!speakEnabled)}
            className={`h-10 w-10 lg:h-9 lg:w-auto p-0 lg:px-3 ${speakEnabled ? 'bg-orange-50 border-orange-300' : ''}`}
          >
            {speakEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span className="ml-2 hidden lg:inline">
              {speakEnabled ? 'Aan' : 'Uit'}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            disabled={messages.length === 0}
            className="h-10 w-10 lg:h-9 lg:w-auto p-0 lg:px-3"
          >
            <Trash2 size={18} />
            <span className="ml-2 hidden lg:inline">Wissen</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col">
              {/* Welcome Section - compact on mobile */}
              <div className="text-center mb-4 lg:mb-8">
                <h2 className="text-lg lg:text-xl font-semibold text-slate-900 mb-1">
                  Hoi Vincent!
                </h2>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Vraag me om je agenda, CRM of taken te beheren.
                </p>
              </div>

              {/* Voice Input Hero - responsive size */}
              <div className="flex flex-col items-center justify-center py-4 lg:py-8">
                <button
                  onClick={toggleListening}
                  disabled={!speechSupported}
                  className={`relative w-24 h-24 lg:w-32 lg:h-32 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 scale-110'
                      : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-105'
                  } ${!speechSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
                      <span className="absolute inset-[-8px] lg:inset-[-12px] rounded-full border-4 border-red-300 animate-pulse opacity-50" />
                    </>
                  )}
                  {isListening ? (
                    <MicOff className="text-white relative z-10" size={36} />
                  ) : (
                    <Mic className="text-white relative z-10" size={36} />
                  )}
                </button>
                <p className={`mt-3 text-sm ${isListening ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                  {isListening ? 'Tik om te stoppen' : 'Tik om te spreken'}
                </p>
                {isListening && input && (
                  <p className="mt-2 text-base text-slate-700 max-w-xs text-center px-4">
                    &ldquo;{input}&rdquo;
                  </p>
                )}
              </div>

              {/* Quick Actions Grid - responsive */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 mt-auto">
                {quickActionCategories.map((category) => (
                  <div key={category.title} className={`rounded-xl border p-3 lg:p-4 ${getColorClasses(category.color)}`}>
                    <div className="flex items-center gap-2 mb-2 lg:mb-3">
                      <category.icon className={getIconColorClasses(category.color)} size={18} />
                      <h3 className="font-semibold text-slate-900 text-sm lg:text-base">{category.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.actions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => sendMessage(action.action)}
                          className="px-4 py-2.5 bg-white/80 hover:bg-white active:bg-white rounded-full text-sm text-slate-700 transition-colors shadow-sm min-h-[44px]"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats Row - hidden on mobile */}
              <div className="hidden lg:flex items-center justify-center gap-8 mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={16} />
                  <span className="text-sm">Realtime agenda sync</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <TrendingUp size={16} />
                  <span className="text-sm">CRM integratie</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Mic size={16} />
                  <span className="text-sm">Nederlandse spraakherkenning</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content.split('\n').map((line, i) => (
                          <span key={i}>
                            {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j}>{part.slice(2, -2)}</strong>;
                              }
                              return part;
                            })}
                            {i < message.content.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-orange-200' : 'text-slate-400'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString('nl-NL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl px-5 py-3">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                        <span
                          className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.15s' }}
                        />
                        <span
                          className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.3s' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area - larger touch targets */}
        <div className="border-t border-slate-200 p-3 lg:p-4 bg-slate-50">
          {/* Voice status */}
          {isListening && (
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-500 font-medium">Luisteren...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 lg:gap-3">
            {/* Microphone Button - 48px touch target */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white border-2 border-slate-200 hover:border-orange-300 active:bg-orange-50 text-slate-600'
                }`}
              >
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
            )}

            {/* Text Input - larger on mobile */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Luisteren...' : 'Vraag Iris...'}
              className="flex-1 min-w-0 px-4 py-3 bg-white border-2 border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base text-slate-900 placeholder-slate-400"
              disabled={isLoading}
            />

            {/* Send Button - 48px touch target */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all duration-200"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
