'use client';

import { useEffect, useState } from 'react';

interface Question {
  id: string;
  question: string;
  status: 'open' | 'answered';
  client_answer: string | null;
  answered_at: string | null;
}

export default function QuestionsClient({ projectSlug }: { projectSlug: string }) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/crm/portal/${projectSlug}/questions`)
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions ?? []))
      .catch(() => setQuestions([]));
  }, [projectSlug]);

  async function submit(questionId: string) {
    const answer = drafts[questionId]?.trim();
    if (!answer) return;
    setSavingId(questionId);
    try {
      const res = await fetch(`/api/crm/portal/${projectSlug}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answer }),
      });
      if (res.ok) {
        setQuestions((prev) =>
          prev?.map((q) =>
            q.id === questionId
              ? { ...q, status: 'answered', client_answer: answer, answered_at: new Date().toISOString() }
              : q,
          ) ?? null,
        );
      }
    } finally {
      setSavingId(null);
    }
  }

  if (questions === null) {
    return <p style={{ color: '#666' }}>Bezig met laden…</p>;
  }

  if (questions.length === 0) {
    return <p style={{ color: '#666' }}>Er staan op dit moment geen vragen voor je open.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {questions.map((q) => (
        <div key={q.id} style={cardStyle}>
          <p style={{ fontWeight: 600, marginBottom: 8, color: '#1a1a2e' }}>{q.question}</p>
          {q.status === 'answered' ? (
            <p style={{ color: '#2f7a3c', background: '#eef7ef', padding: 10, borderRadius: 8 }}>
              {q.client_answer}
            </p>
          ) : (
            <>
              <textarea
                value={drafts[q.id] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                rows={3}
                placeholder="Typ hier je antwoord…"
                style={textareaStyle}
              />
              <button
                onClick={() => submit(q.id)}
                disabled={savingId === q.id || !drafts[q.id]?.trim()}
                style={buttonStyle}
              >
                {savingId === q.id ? 'Opslaan…' : 'Versturen'}
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 16,
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: 10,
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: 15,
  fontFamily: 'inherit',
  resize: 'vertical',
  marginBottom: 8,
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
