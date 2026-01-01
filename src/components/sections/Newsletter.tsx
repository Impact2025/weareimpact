'use client';

import { useState, FormEvent } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface NewsletterProps {
  source?: string;
  variant?: 'default' | 'compact';
}

export function Newsletter({ source = 'blog', variant = 'default' }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Vul een email adres in');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error || 'Er is iets misgegaan');
        return;
      }

      setStatus('success');
      setMessage(data.message);
      setEmail('');

      // Reset to idle after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);

    } catch (error) {
      console.error('Newsletter signup error:', error);
      setStatus('error');
      setMessage('Er is iets misgegaan. Probeer het later opnieuw.');
    }
  };

  if (variant === 'compact') {
    return (
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Mail size={20} className="text-orange-600" />
          <h3 className="text-lg font-bold text-slate-900">Blijf op de hoogte</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Ontvang maandelijks inzichten over AI, welzijn en sociale innovatie.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="je@email.com"
            disabled={status === 'loading' || status === 'success'}
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full px-4 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'loading' && <Loader2 size={16} className="animate-spin" />}
            {status === 'success' ? 'Aangemeld!' : 'Aanmelden'}
          </button>
        </form>
        {message && (
          <div className={`mt-3 flex items-center gap-2 text-sm ${
            status === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-10 md:p-16 text-center text-white">
      <h2 className="text-3xl font-bold mb-4">
        Blijf op de hoogte van nieuwe artikelen
      </h2>
      <p className="text-slate-400 mb-8 max-w-xl mx-auto">
        Schrijf je in voor de nieuwsbrief en ontvang maandelijks inzichten
        over AI, welzijn en sociale innovatie.
      </p>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="je@email.com"
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {status === 'loading' && <Loader2 size={18} className="animate-spin" />}
            {status === 'success' ? (
              <>
                <CheckCircle size={18} />
                Aangemeld!
              </>
            ) : (
              'Aanmelden'
            )}
          </button>
        </div>

        {message && (
          <div className={`mt-4 flex items-center justify-center gap-2 text-sm ${
            status === 'success' ? 'text-green-400' : 'text-red-400'
          }`}>
            {status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{message}</span>
          </div>
        )}
      </form>
    </div>
  );
}
