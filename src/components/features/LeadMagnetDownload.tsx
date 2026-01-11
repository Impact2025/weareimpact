'use client';

import { useState } from 'react';
import { Download, Check, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LeadMagnetDownloadProps {
  articleId: string;
  title: string;
  description?: string;
  type?: string;
  downloadUrl?: string;
}

export function LeadMagnetDownload({
  articleId,
  title,
  description,
  type,
  downloadUrl,
}: LeadMagnetDownloadProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Vul je e-mailadres in');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/kennisbank/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          email,
          leadMagnetType: type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);

        // If there's a download URL, trigger download after a short delay
        if (data.downloadUrl || downloadUrl) {
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = data.downloadUrl || downloadUrl;
            link.download = '';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 500);
        }
      } else {
        setError(data.error || 'Er ging iets mis');
      }
    } catch (err) {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeLabels: Record<string, string> = {
    pdf: 'PDF',
    checklist: 'Checklist',
    template: 'Template',
    spreadsheet: 'Spreadsheet',
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Check className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Gelukt!
            </h3>
            <p className="text-slate-600">
              Je download start automatisch. Check ook je inbox voor meer handige resources.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="text-white" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-slate-600 mb-4">{description}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Je e-mailadres"
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Download size={16} className="mr-2" />
              )}
              Download {typeLabels[type || ''] || 'Bestand'}
            </Button>
          </form>

          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}

          <p className="text-xs text-slate-500 mt-3">
            We sturen je geen spam. Je kunt je altijd uitschrijven.
          </p>
        </div>
      </div>
    </div>
  );
}
