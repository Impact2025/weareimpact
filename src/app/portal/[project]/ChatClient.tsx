'use client';

import { useEffect, useRef, useState } from 'react';
import type { Audience } from '@/lib/crm/portal-session';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatClient({ projectSlug, audience }: { projectSlug: string; audience: Audience }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const res = await fetch(`/api/crm/portal/${projectSlug}/${audience}/chat`);
      const data = await res.json();
      const history: Message[] = (data.messages ?? []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      }));
      setFinished(!!data.finished);

      if (history.length === 0) {
        // Eerste bezoek: laat Iris zelf het gesprek openen.
        const openRes = await fetch(`/api/crm/portal/${projectSlug}/${audience}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: '' }),
        });
        const openData = await openRes.json();
        setMessages([{ role: 'assistant', content: openData.reply }]);
        setFinished(!!openData.finished);
      } else {
        setMessages(history);
      }
      setLoading(false);
    }
    init();
  }, [projectSlug, audience]);

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
      const res = await fetch(`/api/crm/portal/${projectSlug}/${audience}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      setFinished(!!data.finished);
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
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setUploadError(uploadData.error ?? 'Upload mislukt.');
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      setSending(true);
      const chatRes = await fetch(`/api/crm/portal/${projectSlug}/${audience}/chat`, {
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
      <div style={chatBoxStyle}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? '#1a1a2e' : '#f1f2f6',
              color: m.role === 'user' ? '#fff' : '#1a1a2e',
              padding: '10px 14px',
              borderRadius: 14,
              maxWidth: '80%',
              fontSize: 15,
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
            }}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {finished ? (
        <p style={{ color: '#2f7a3c', background: '#eef7ef', padding: 12, borderRadius: 8, fontSize: 14 }}>
          Bedankt! Je antwoorden zijn opgeslagen. Je kunt dit venster sluiten.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {uploadError && (
            <p style={{ color: '#a12', background: '#fdecec', padding: 10, borderRadius: 8, fontSize: 13 }}>
              {uploadError}
            </p>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Schrijf hier gerust uitgebreid je antwoord… (Shift+Enter voor een nieuwe regel)"
            rows={5}
            style={inputStyle}
            disabled={sending}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div>
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
              {sending ? '…' : 'Versturen'}
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
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
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
  border: '1px solid #d1d5db',
  fontSize: 15,
  fontFamily: 'inherit',
  resize: 'vertical',
};

const buttonStyle: React.CSSProperties = {
  background: '#1a1a2e',
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
