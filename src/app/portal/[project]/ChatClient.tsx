'use client';

import { useEffect, useRef, useState } from 'react';
import type { Audience } from '@/lib/crm/portal-session';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatClient({
  projectSlug,
  audience,
  mode = 'chat',
}: {
  projectSlug: string;
  audience: Audience;
  mode?: 'chat' | 'pulse';
}) {
  const endpoint = `/api/crm/portal/${projectSlug}/${audience}/${mode}`;
  const isPulse = mode === 'pulse';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [focus, setFocus] = useState(false);
  const [progress, setProgress] = useState<{ answered: number; total: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const res = await fetch(endpoint);
      const data = await res.json();
      const history: Message[] = (data.messages ?? []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      }));
      setFinished(!!data.finished);
      if (data.progress) setProgress(data.progress);

      if (isPulse && !data.pulse) {
        setMessages([{ role: 'assistant', content: 'Er staat op dit moment geen weekcheck open. Je krijgt vrijdag een uitnodiging van me.' }]);
        setLoading(false);
        return;
      }
      if (history.length === 0) {
        // Eerste bezoek: laat Iris zelf het gesprek openen.
        const openRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: '' }),
        });
        const openData = await openRes.json();
        setMessages([{ role: 'assistant', content: openData.reply }]);
        setFinished(!!openData.finished);
        if (openData.progress) setProgress(openData.progress);
      } else {
        setMessages(history);
      }
      setLoading(false);
    }
    init();
  }, [projectSlug, audience, endpoint]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setSending(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      setFinished(!!data.finished);
      if (data.progress) setProgress(data.progress);
    } finally {
      setSending(false);
    }
  }

  async function uploadFile(file: File) {
    if (sending || uploading) return;
    setUploadError(null);
    setUploading(true);
    setMessages((prev) => [...prev, { role: 'user', content: `[Document geüpload: ${file.name}]` }]);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch(`/api/crm/portal/${projectSlug}/${audience}/documents`, {
        method: 'POST',
        body: formData,
      });
      // Een te groot bestand (Vercel kapt rond 4,5 MB af) geeft geen JSON terug.
      const uploadData = await uploadRes.json().catch(() => ({
        error:
          uploadRes.status === 413
            ? 'Dit bestand is te groot (maximaal ongeveer 4 MB). Plak de belangrijkste tekst in het gesprek, of deel een kleiner bestand.'
            : 'Upload mislukt. Probeer het opnieuw, of plak de tekst in het gesprek.',
      }));
      if (!uploadRes.ok) {
        setUploadError(uploadData.error ?? 'Upload mislukt.');
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      setSending(true);
      const chatRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '', documentId: uploadData.documentId }),
      });
      const chatData = await chatRes.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: chatData.reply }]);
      setFinished(!!chatData.finished);
    } finally {
      setUploading(false);
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (loading) {
    return <p style={{ color: '#666' }}>Bezig met laden…</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {!isPulse && progress && progress.total > 0 && (
        <div style={{ fontSize: 13, color: '#666' }}>
          <div style={{ background: '#e5e7eb', borderRadius: 4, height: 6, overflow: 'hidden' }}>
            <div style={{ background: '#f97316', height: 6, width: `${Math.round((progress.answered / progress.total) * 100)}%` }} />
          </div>
          <div style={{ marginTop: 4 }}>{progress.answered} van {progress.total} onderwerpen besproken</div>
        </div>
      )}
      <div style={chatBoxStyle}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? '#ffedd5' : '#eef2ff',
              border: `1px solid ${m.role === 'user' ? '#fed7aa' : '#c7d2fe'}`,
              color: '#1a1a2e',
              padding: '10px 14px',
              borderRadius: 14,
              maxWidth: '80%',
              fontSize: 15,
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
            }}
          >
            {m.content.replace(/\*\*/g, '')}
          </div>
        ))}
        {(sending || uploading) && (
          <div style={{ alignSelf: 'flex-start', color: '#888', fontSize: 14, padding: '4px 4px' }}>Iris schrijft…</div>
        )}
        <div ref={bottomRef} />
      </div>

      {finished && (
        <p style={{ color: '#2f7a3c', background: '#eef7ef', padding: 12, borderRadius: 8, fontSize: 14, margin: 0 }}>
          {isPulse ? 'Bedankt, je weekcheck is binnen.' : 'Je antwoorden zijn opgeslagen. Je kunt hier nog steeds vragen stellen of iets aanvullen.'}
        </p>
      )}
      {!(isPulse && finished) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f5f7ff', border: '1px solid #c7d2fe', borderRadius: 14, padding: 14 }}>
          {uploadError && (
            <p style={{ color: '#a12', background: '#fdecec', padding: 10, borderRadius: 8, fontSize: 13 }}>
              {uploadError}
            </p>
          )}
          <label style={{ fontSize: 13, fontWeight: 700, color: '#4338ca' }}>Jouw antwoord</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Typ hier je antwoord…"
            rows={3}
            style={{ ...inputStyle, ...(focus ? inputFocusStyle : null) }}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            disabled={sending}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={isPulse ? { display: 'none' } : undefined}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(file);
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || uploading}
                style={{ ...secondaryButtonStyle }}
                type="button"
              >
                {uploading ? 'Bezig met uploaden…' : '+ Document delen (pdf, tekst)'}
              </button>
            </div>
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              style={buttonStyle}
            >
              {sending ? '…' : 'Versturen →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const chatBoxStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  background: '#fbfcff',
  border: '1px solid #e0e7ff',
  borderRadius: 14,
  padding: 16,
  minHeight: 300,
  maxHeight: '60vh',
  overflowY: 'auto',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: 8,
  border: '2px solid #a5b4fc',
  background: '#fff',
  color: '#1a1a2e',
  fontSize: 15,
  fontFamily: 'inherit',
  resize: 'vertical',
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
};

const inputFocusStyle: React.CSSProperties = {
  borderColor: '#4f46e5',
  boxShadow: '0 0 0 4px rgba(79,70,229,0.15)',
};

const buttonStyle: React.CSSProperties = {
  background: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 16px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  background: '#fff',
  color: '#1a1a2e',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};
