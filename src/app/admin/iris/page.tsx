'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Send, Calendar, Clock, Trash2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Web Speech API types
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
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
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check for speech recognition support
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition() as SpeechRecognitionInstance;
      recognition.lang = 'nl-NL';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Ignore "no-speech" - just means user didn't say anything
        if (event.error !== 'no-speech') {
          console.error('Speech recognition error:', event.error);
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Text-to-speech for Iris responses
  const speakText = useCallback((text: string) => {
    if (!speakEnabled || !window.speechSynthesis) return;

    // Remove markdown formatting
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\n/g, '. ')
      .replace(/- /g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'nl-NL';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [speakEnabled]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

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

  const quickActions = [
    { label: 'Komende week', action: 'Wat staat er deze week op de planning?' },
    { label: 'Morgen', action: 'Wat heb ik morgen?' },
    { label: 'Blokkeer vandaag', action: 'Blokkeer de rest van vandaag' },
  ];

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Praat met Iris</h1>
          <p className="text-slate-500">Je persoonlijke agenda-assistent</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSpeakEnabled(!speakEnabled)}
            className={speakEnabled ? 'bg-orange-50 border-orange-300' : ''}
          >
            {speakEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="ml-2 hidden sm:inline">
              {speakEnabled ? 'Spraak aan' : 'Spraak uit'}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            disabled={messages.length === 0}
          >
            <Trash2 size={16} />
            <span className="ml-2 hidden sm:inline">Wissen</span>
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">👋</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Hoi Vincent!
              </h2>
              <p className="text-slate-500 max-w-md mb-6">
                Ik ben Iris, je persoonlijke agenda-assistent. Vraag me om je agenda te bekijken,
                tijd te blokkeren, of afspraken op te zoeken.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 justify-center">
                {quickActions.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => sendMessage(qa.action)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-sm text-slate-700 transition-colors flex items-center gap-2"
                  >
                    <Calendar size={14} />
                    {qa.label}
                  </button>
                ))}
              </div>

              {/* Capabilities */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                <div className="p-4 bg-orange-50 rounded-lg text-left">
                  <Calendar className="text-orange-600 mb-2" size={20} />
                  <h3 className="font-medium text-slate-900">Agenda blokkeren</h3>
                  <p className="text-sm text-slate-600">&quot;Blokkeer vrijdag 17 januari&quot;</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-left">
                  <Clock className="text-blue-600 mb-2" size={20} />
                  <h3 className="font-medium text-slate-900">Afspraken zoeken</h3>
                  <p className="text-sm text-slate-600">&quot;Wanneer is de notaris?&quot;</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-left">
                  <Mic className="text-green-600 mb-2" size={20} />
                  <h3 className="font-medium text-slate-900">Spraakbesturing</h3>
                  <p className="text-sm text-slate-600">Klik op de microfoon</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-orange-600 text-white'
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
                      className={`text-xs mt-1 ${
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
                  <div className="bg-slate-100 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <span
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <span
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            {/* Microphone Button */}
            {speechSupported && (
              <Button
                type="button"
                variant={isListening ? 'default' : 'outline'}
                size="icon"
                onClick={toggleListening}
                className={isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </Button>
            )}

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Luisteren...' : 'Vraag Iris iets...'}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isLoading}
            />

            {/* Send Button */}
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Send size={20} />
            </Button>
          </form>

          {/* Speech Status */}
          {isListening && (
            <p className="text-sm text-red-500 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Luisteren... Spreek nu.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
