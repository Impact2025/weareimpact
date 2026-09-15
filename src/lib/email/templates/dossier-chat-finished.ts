import { emailShell, emailCard, emailButton, EMAIL_COLORS } from './emailLayout';

interface DossierChatFinishedData {
  projectName: string;
  projectSlug: string;
  audience: 'klant' | 'opdrachtgever';
  finishedAt: Date;
  summary: string;
  nextSteps: string | null;
  questions: Array<{ question: string; client_answer: string | null }>;
}

const AUDIENCE_LABEL: Record<DossierChatFinishedData['audience'], string> = {
  klant: 'de klant',
  opdrachtgever: 'de opdrachtgever',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Naar Vincent, zodra Iris een portal-gesprek afrondt (finish_conversation) —
 * zodat hij niet zelf hoeft te checken of, en wanneer, een gesprek klaar is. */
export function generateDossierChatFinishedEmail(data: DossierChatFinishedData): {
  subject: string;
  html: string;
  text: string;
} {
  const formattedDateTime = data.finishedAt.toLocaleString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const dossierUrl = `https://weareimpact.nl/admin/dossiers/${data.projectSlug}`;
  const subject = `Gesprek afgerond: ${data.projectName} (${AUDIENCE_LABEL[data.audience]})`;

  const questionsHtml = data.questions
    .map(
      (q) => `
                <tr>
                  <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9;">
                    <p style="margin: 0 0 6px; font-size: 14px; color: #1e293b; font-weight: 600;">${escapeHtml(q.question)}</p>
                    <p style="margin: 0; font-size: 14px; color: #475569; white-space: pre-wrap;">${q.client_answer ? escapeHtml(q.client_answer) : '(geen antwoord)'}</p>
                  </td>
                </tr>`,
    )
    .join('');

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                ${AUDIENCE_LABEL[data.audience]} heeft het gesprek met Iris over
                <strong>${escapeHtml(data.projectName)}</strong> afgerond op
                <strong>${formattedDateTime}</strong>.
              </p>

              ${emailCard(`
                <p style="margin: 0 0 12px; font-size: 13px; color: ${EMAIL_COLORS.ink}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Plan / vervolgstappen</p>
                <p style="margin: 0 0 12px; font-size: 15px; color: #334155; white-space: pre-wrap;">${escapeHtml(data.summary)}</p>
                ${data.nextSteps ? `<p style="margin: 0; font-size: 15px; color: #334155; white-space: pre-wrap;"><strong>Vervolgstappen:</strong> ${escapeHtml(data.nextSteps)}</p>` : ''}
              `)}

              <p style="margin: 28px 0 12px; font-size: 13px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Alle vragen &amp; antwoorden</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px;">
                ${questionsHtml}
              </table>

              ${emailButton('Open dossier in admin', dossierUrl)}
  `.trim();

  const html = emailShell({
    preheader: `${AUDIENCE_LABEL[data.audience]} heeft het gesprek over ${data.projectName} afgerond op ${formattedDateTime}.`,
    title: 'Gesprek afgerond',
    subtitle: data.projectName,
    body,
    footerNote: 'Deze email is automatisch verzonden door WeAreImpact',
  });

  const text = `
GESPREK AFGEROND: ${data.projectName} (${AUDIENCE_LABEL[data.audience]})

Afgerond op: ${formattedDateTime}

PLAN / VERVOLGSTAPPEN:
-----------------------
${data.summary}
${data.nextSteps ? `\nVervolgstappen: ${data.nextSteps}` : ''}

VRAGEN & ANTWOORDEN:
---------------------
${data.questions.map((q) => `- ${q.question}\n  ${q.client_answer || '(geen antwoord)'}`).join('\n\n')}

Open dossier: ${dossierUrl}
  `.trim();

  return { subject, html, text };
}
