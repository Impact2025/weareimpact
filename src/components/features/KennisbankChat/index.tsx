'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Loader2, ChevronDown, ChevronUp, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedArticles?: Array<{ title: string; slug: string; excerpt: string }>;
}

interface KennisbankChatProps {
  articleTitle?: string;
  articleSlug?: string;
  suggestedQuestions?: string[];
}

const IRIS_AVATAR = '/iris-avatar.webp';

const DEFAULT_QUESTIONS = [
  'Leg dit in eenvoudige taal uit',
  'Wat zijn de belangrijkste punten?',
  'Hoe pas ik dit toe in mijn organisatie?',
];

function IrisAvatar({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';

  return (
    <div className={cn('relative flex-shrink-0', sizeClasses)}>
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
          sizeClasses
        )}>
          <Sparkles className="text-orange-500" size={size === 'sm' ? 16 : 20} />
        </div>
      )}
    </div>
  );
}

export function KennisbankChat({ articleTitle, articleSlug, suggestedQuestions }: KennisbankChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const questions = suggestedQuestions || DEFAULT_QUESTIONS;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage = content.trim();
    const newUserMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: userMessage,
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Add context about current article
      const contextMessage = articleTitle
        ? `[Context: De gebruiker leest het kennisbank artikel "${articleTitle}"]`
        : '';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...(contextMessage ? [{ role: 'system', content: contextMessage }] : []),
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage },
          ],
          includeKennisbank: true,
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      const assistantId = `${Date.now()}-assistant`;
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
      }]);

      let fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullContent += chunk;

        const displayContent = fullContent.replace(/<!--META:[\s\S]*?-->/, '');
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, content: displayContent } : m
          )
        );
      }

      // Parse metadata (contains article suggestions and session info)
      let suggestedArticles: Array<{ title: string; slug: string; excerpt: string }> = [];
      const metaMatch = fullContent.match(/<!--META:([\s\S]*?)-->/);
      if (metaMatch) {
        try {
          const metadata = JSON.parse(metaMatch[1]);
          suggestedArticles = metadata.articles || [];
          // Filter out current article
          if (articleSlug) {
            suggestedArticles = suggestedArticles.filter(a => a.slug !== articleSlug);
          }
        } catch (e) {
          console.error('Failed to parse metadata:', e);
        }
      }

      const cleanContent = fullContent.replace(/<!--META:[\s\S]*?-->/, '').trim();
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? {
            ...m,
            content: cleanContent,
            suggestedArticles: suggestedArticles.length > 0 ? suggestedArticles : undefined,
          } : m
        )
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: 'Er ging iets mis. Probeer het opnieuw.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <IrisAvatar size="md" />
          <div className="text-left">
            <div className="text-sm md:text-base font-semibold text-slate-900">Vraag het aan Iris</div>
            <div className="text-xs text-slate-500">AI assistent voor dit artikel</div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-slate-400" size={18} />
        ) : (
          <ChevronDown className="text-slate-400" size={18} />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-100">
          {/* Messages */}
          <div className="max-h-64 md:max-h-80 overflow-y-auto p-3 md:p-4 space-y-3 bg-slate-50">
            {messages.length === 0 ? (
              <div className="text-center py-3 md:py-4">
                <p className="text-xs md:text-sm text-slate-500 mb-3 md:mb-4">
                  Stel een vraag over dit artikel
                </p>
                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(q)}
                      className="w-full text-left p-2.5 md:p-3 bg-white rounded-lg border border-slate-200 text-xs md:text-sm text-slate-700 hover:border-orange-300 hover:bg-orange-50 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-1.5 md:gap-2',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && <IrisAvatar size="sm" />}
                    <div className="flex flex-col gap-2 max-w-[85%] md:max-w-[80%]">
                      <div
                        className={cn(
                          'px-2.5 md:px-3 py-2 rounded-xl text-xs md:text-sm',
                          message.role === 'user'
                            ? 'bg-slate-900 text-white rounded-br-sm'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>

                      {/* Suggested Articles */}
                      {message.suggestedArticles && message.suggestedArticles.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <BookOpen size={10} />
                            <span>Gerelateerd:</span>
                          </div>
                          {message.suggestedArticles.slice(0, 2).map((article) => (
                            <Link
                              key={article.slug}
                              href={`/kennisbank/${article.slug}`}
                              className="block p-2 bg-orange-50 border border-orange-100 rounded-lg text-xs hover:border-orange-300 transition-colors"
                            >
                              <span className="font-medium text-slate-800 line-clamp-2">{article.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <IrisAvatar size="sm" />
                    <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl rounded-bl-sm">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-2.5 md:p-3 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Stel een vraag..."
                disabled={isLoading}
                className="flex-1 text-xs md:text-sm h-9 md:h-10"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-orange-600 hover:bg-orange-700 h-9 w-9 md:h-10 md:w-10"
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin md:w-4 md:h-4" />
                ) : (
                  <Send size={14} className="md:w-4 md:h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
