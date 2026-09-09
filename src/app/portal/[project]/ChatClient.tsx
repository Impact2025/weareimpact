'use client';

import { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatClient({ projectSlug }: { projectSlug: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [finished, setFinished] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const res = await fetch(`/api/crm/portal/${projectSlug}/chat`);
      const data = await res.json();
      const history: Message[] = (data.messages ?? []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      }));
      setFinished(!!data.finished);

      if (history.length === 0) {
        // Eerste bezoek: laat Iris zelf het gesprek openen.
        const openRes = await fetch(`/api/crm/portal/${projectSlug}/chat`, {
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
  }, [projectSlug]);

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
      const res = await fetch(`/api/crm/portal/${projectSlug}/chat`, {
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
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Typ je antwoord…"
            style={inputStyle}
            disabled={sending}
          />
          <button onClick={send} disabled={sending || !input.trim()} style={buttonStyle}>
            {sending ? '…' : 'Versturen'}
          </button>
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
  flex: 1,
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: 15,
  fontFamily: 'inherit',
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
