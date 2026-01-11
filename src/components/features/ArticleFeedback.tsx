'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ArticleFeedbackProps {
  articleId: string;
}

export function ArticleFeedback({ articleId }: ArticleFeedbackProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<'helpful' | 'not_helpful' | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const submitFeedback = async (helpful: boolean, text?: string) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/kennisbank/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          helpful,
          feedbackText: text,
          visitorId: typeof window !== 'undefined' ? localStorage.getItem('visitorId') : null,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackClick = (helpful: boolean) => {
    setSelectedFeedback(helpful ? 'helpful' : 'not_helpful');

    if (helpful) {
      // Positive feedback - submit immediately
      submitFeedback(true);
    } else {
      // Negative feedback - show text input for more info
      setShowTextInput(true);
    }
  };

  const handleTextSubmit = () => {
    submitFeedback(false, feedbackText);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-green-600">
        <Check size={20} />
        <span className="font-medium">Bedankt voor je feedback!</span>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200 py-6">
      {!showTextInput ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-600 font-medium">Was dit artikel nuttig?</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleFeedbackClick(true)}
              disabled={isSubmitting}
              className={cn(
                'gap-2 transition-all',
                selectedFeedback === 'helpful' && 'bg-green-50 border-green-300 text-green-700'
              )}
            >
              {isSubmitting && selectedFeedback === 'helpful' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ThumbsUp size={18} />
              )}
              Ja, dit hielp
            </Button>
            <Button
              variant="outline"
              onClick={() => handleFeedbackClick(false)}
              disabled={isSubmitting}
              className={cn(
                'gap-2 transition-all',
                selectedFeedback === 'not_helpful' && 'bg-red-50 border-red-300 text-red-700'
              )}
            >
              <ThumbsDown size={18} />
              Nee, ik mis iets
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          <p className="text-slate-600 font-medium">Wat miste je in dit artikel?</p>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Vertel ons wat we kunnen verbeteren..."
            className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowTextInput(false);
                setSelectedFeedback(null);
              }}
            >
              Annuleren
            </Button>
            <Button
              onClick={handleTextSubmit}
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              Versturen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
