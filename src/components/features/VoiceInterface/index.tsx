'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Extend Window interface for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionType;
    webkitSpeechRecognition?: new () => SpeechRecognitionType;
  }
}

// Type declarations for Web Speech API
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEventType {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventType {
  error: string;
}

interface SpeechRecognitionType {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEventType) => void;
  onerror: (event: SpeechRecognitionErrorEventType) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  error: string | null;
}

// Voice commands mapping
const NAVIGATION_COMMANDS: Record<string, string> = {
  'ga naar manifest': 'visie',
  'ga naar visie': 'visie',
  'ga naar expertise': 'pijlers',
  'ga naar scan': 'scan',
  'ga naar ventures': 'ventures',
  'ga naar portfolio': 'ventures',
  'ga naar over': 'over',
  'ga naar vincent': 'over',
  'ga naar contact': 'contact',
  'ga naar blog': '/blog',
  'naar boven': 'top',
  'scroll omhoog': 'top',
};

export function VoiceInterface() {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: '',
    response: '',
    error: null,
  });

  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionType | null>(null);
  const handleVoiceCommandRef = useRef<((transcript: string) => Promise<void>) | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'nl-NL';

      recognitionInstance.onresult = (event: SpeechRecognitionEventType) => {
        const results = event.results;
        let transcript = '';
        for (let i = 0; i < results.length; i++) {
          transcript += results[i][0].transcript;
        }

        setState((prev) => ({ ...prev, transcript }));

        // Check if final result
        if (results[results.length - 1].isFinal) {
          handleVoiceCommandRef.current?.(transcript.toLowerCase());
        }
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEventType) => {
        // Handle different error types appropriately
        const ignoredErrors = ['no-speech', 'aborted'];

        if (ignoredErrors.includes(event.error)) {
          // Silently handle expected errors (user didn't speak or cancelled)
          setState((prev) => ({
            ...prev,
            isListening: false,
          }));
          return;
        }

        // Log actual errors for debugging
        console.error('Speech recognition error:', event.error);

        // Map error codes to user-friendly messages
        const errorMessages: Record<string, string> = {
          'not-allowed': 'Microfoon toegang geweigerd. Sta toegang toe in je browser.',
          'network': 'Netwerkfout. Controleer je internetverbinding.',
          'audio-capture': 'Geen microfoon gevonden.',
          'service-not-allowed': 'Spraakherkenning is niet beschikbaar.',
        };

        setState((prev) => ({
          ...prev,
          isListening: false,
          error: errorMessages[event.error] || 'Spraakherkenning mislukt. Probeer opnieuw.',
        }));
      };

      recognitionInstance.onend = () => {
        setState((prev) => ({ ...prev, isListening: false }));
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleVoiceCommand = useCallback(async (transcript: string) => {
    setState((prev) => ({ ...prev, isProcessing: true }));

    // Check for navigation commands
    for (const [command, target] of Object.entries(NAVIGATION_COMMANDS)) {
      if (transcript.includes(command)) {
        if (target.startsWith('/')) {
          // Full page navigation
          window.location.href = target;
        } else if (target === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Section scroll
          const element = document.getElementById(target);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }

        const response = `Ik navigeer naar ${target === 'top' ? 'boven' : target}`;
        setState((prev) => ({ ...prev, response, isProcessing: false }));
        speak(response);
        return;
      }
    }

    // Special commands
    if (transcript.includes('start scan') || transcript.includes('doe de scan')) {
      const element = document.getElementById('scan');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      const response = 'Ik open de AI Impact Scanner voor je.';
      setState((prev) => ({ ...prev, response, isProcessing: false }));
      speak(response);
      return;
    }

    if (transcript.includes('bel') || transcript.includes('telefoon')) {
      window.location.href = 'tel:0614470977';
      return;
    }

    if (transcript.includes('email') || transcript.includes('mail')) {
      window.location.href = 'mailto:v.munster@weareimpact.nl';
      return;
    }

    // For questions, send to AI
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: transcript }),
      });

      if (!res.ok) throw new Error('Voice query failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value);
        }
      }

      setState((prev) => ({ ...prev, response: fullResponse, isProcessing: false }));
      speak(fullResponse);
    } catch (error) {
      console.error('Voice query error:', error);
      const errorResponse = 'Sorry, ik kon je vraag niet verwerken. Probeer het opnieuw.';
      setState((prev) => ({
        ...prev,
        response: errorResponse,
        isProcessing: false,
        error: errorResponse,
      }));
    }
  }, []);

  // Keep the ref updated with the latest handleVoiceCommand
  useEffect(() => {
    handleVoiceCommandRef.current = handleVoiceCommand;
  }, [handleVoiceCommand]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'nl-NL';
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setState((prev) => ({ ...prev, isSpeaking: true }));
      };

      utterance.onend = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }));
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (state.isListening) {
      recognition.stop();
    } else {
      setState((prev) => ({ ...prev, transcript: '', response: '', error: null }));
      recognition.start();
      setState((prev) => ({ ...prev, isListening: true }));
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Main Voice Button */}
      <Button
        onClick={toggleListening}
        disabled={state.isProcessing}
        className={`w-14 h-14 rounded-full shadow-lg transition-all ${
          state.isListening
            ? 'bg-red-500 hover:bg-red-600 animate-voice-pulse'
            : state.isSpeaking
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-slate-800 hover:bg-slate-700'
        }`}
        aria-label={state.isListening ? 'Stop luisteren' : 'Start spraakbesturing'}
      >
        {state.isProcessing ? (
          <Loader2 size={24} className="animate-spin text-white" />
        ) : state.isListening ? (
          <MicOff size={24} className="text-white" />
        ) : state.isSpeaking ? (
          <Volume2 size={24} className="text-white" />
        ) : (
          <Mic size={24} className="text-white" />
        )}
      </Button>

      {/* Transcript Display */}
      {(state.isListening || state.transcript || state.response) && (
        <div className="absolute bottom-16 left-0 w-72 bg-white rounded-xl shadow-xl p-4 border border-slate-200">
          {state.isListening && (
            <div className="flex items-center gap-2 text-red-500 text-sm mb-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Luisteren...
            </div>
          )}

          {state.transcript && (
            <div className="mb-3">
              <div className="text-xs text-slate-400 mb-1">Je zei:</div>
              <p className="text-slate-800 text-sm">{state.transcript}</p>
            </div>
          )}

          {state.response && (
            <div>
              <div className="text-xs text-slate-400 mb-1">Antwoord:</div>
              <p className="text-slate-600 text-sm">{state.response}</p>
            </div>
          )}

          {state.error && (
            <p className="text-red-500 text-sm mt-2">{state.error}</p>
          )}
        </div>
      )}

      {/* Helper tooltip */}
      {!state.isListening && !state.transcript && (
        <div className="absolute bottom-16 left-0 w-48 bg-slate-900 text-white text-xs rounded-lg p-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          Zeg &ldquo;Ga naar contact&rdquo; of stel een vraag
        </div>
      )}
    </div>
  );
}
