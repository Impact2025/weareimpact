'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, X, Send, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { createPortal } from 'react-dom';

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
  onspeechend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function IrisVoiceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [mounted, setMounted] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const autoSubmitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for speech support and mount
  useEffect(() => {
    setMounted(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

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

      setTranscript(finalTranscript || interimTranscript);

      // Auto-submit after 1.5s of silence on final result
      if (finalTranscript) {
        if (autoSubmitTimeoutRef.current) {
          clearTimeout(autoSubmitTimeoutRef.current);
        }
        autoSubmitTimeoutRef.current = setTimeout(() => {
          if (finalTranscript.trim()) {
            handleSubmit(finalTranscript.trim());
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

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Text-to-speech
  const speakText = useCallback((text: string) => {
    if (!speakEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

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
      if (transcript.trim()) {
        handleSubmit(transcript.trim());
      }
    } else {
      setTranscript('');
      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        // Recognition might already be running
        console.error('Recognition start error:', e);
      }
    }
  };

  const handleSubmit = async (content: string) => {
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
    };

    setMessages(prev => [...prev, userMessage]);
    setTranscript('');
    setIsLoading(true);

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

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
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
            m.id === assistantMessage.id ? { ...m, content: fullContent } : m
          )
        );
      }

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
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsOpen(true);
    // Auto-start listening when opening
    setTimeout(() => {
      if (speechSupported && !isListening) {
        setTranscript('');
        if (!recognitionRef.current) {
          recognitionRef.current = initRecognition();
        }
        try {
          recognitionRef.current?.start();
          setIsListening(true);
        } catch {
          // Ignore
        }
      }
    }, 300);
  };

  const closeModal = () => {
    setIsOpen(false);
    recognitionRef.current?.abort();
    setIsListening(false);
    window.speechSynthesis?.cancel();
    if (autoSubmitTimeoutRef.current) {
      clearTimeout(autoSubmitTimeoutRef.current);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setTranscript('');
    window.speechSynthesis?.cancel();
  };

  if (!mounted) return null;

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Iris</h2>
              <p className="text-xs text-slate-500">Je persoonlijke assistent</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSpeakEnabled(!speakEnabled)}
              className={`p-2 rounded-full transition-colors ${
                speakEnabled ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {speakEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[300px] overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && !isListening && !transcript ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-slate-500 text-sm">
                Tik op de microfoon en stel je vraag
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['Briefing', 'Wat heb ik morgen?', 'Pipeline'].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSubmit(q)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Voice Input Area */}
        <div className="p-6 bg-gradient-to-t from-slate-50 to-white border-t border-slate-100">
          {/* Transcript display */}
          {(isListening || transcript) && (
            <div className="mb-4 text-center">
              <p className="text-slate-700 text-lg min-h-[28px]">
                {transcript || <span className="text-slate-400">Luisteren...</span>}
              </p>
            </div>
          )}

          {/* Big Microphone Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 scale-110'
                  : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Pulse rings when listening */}
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
                  <span className="absolute inset-[-8px] rounded-full border-4 border-red-300 animate-pulse opacity-50" />
                </>
              )}

              {isListening ? (
                <MicOff className="text-white relative z-10" size={36} />
              ) : (
                <Mic className="text-white relative z-10" size={36} />
              )}
            </button>
          </div>

          {/* Status text */}
          <p className={`text-center mt-4 text-sm transition-colors ${
            isListening ? 'text-red-500 font-medium' : 'text-slate-400'
          }`}>
            {isListening
              ? 'Tik om te stoppen en te verzenden'
              : isLoading
                ? 'Iris denkt na...'
                : 'Tik om te spreken'
            }
          </p>

          {/* Manual text input fallback */}
          {!isListening && messages.length > 0 && (
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(transcript)}
                placeholder="Of typ hier..."
                className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={() => handleSubmit(transcript)}
                disabled={!transcript.trim() || isLoading}
                className="p-2 bg-orange-600 text-white rounded-full disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          )}

          {/* Clear chat button */}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="mt-3 w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Gesprek wissen
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        aria-label="Praat met Iris"
      >
        <Sparkles className="text-white" size={28} />

        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Praat met Iris
        </span>
      </button>

      {/* Portal for modal */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
