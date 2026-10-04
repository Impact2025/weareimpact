import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/send';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { getDownload, downloadUrl, trackedUrl } from '@/lib/ai-pm-downloads';
import {
  CONSENT_VERSION,
  EMAIL_RE,
  cleanPath,
  cleanReferrer,
  cleanTag,
  emailDomain,
  hasMailServer,
  hashIp,
  isDisposable,
  scoreLead,
  segmentFor,
} from '@/lib/ai-pm-leads';
import {
  countRecentByIp,
  insertDownloadLead,
  markDelivery,
  previousResourceCount,
  recentlyNotified,
} from '@/lib/download-leads';
import { generateAiPmDownloadEmail } from '@/lib/email/templates/ai-pm-download';
import { generateAiPmDownloadNotificationEmail } from '@/lib/email/templates/ai-pm-download-notification';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const NOTIFY_EMAIL = 'v.munster@weareimpact.nl';
const MAX_PER_IP_PER_HOUR = 8;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const ipHash = hashIp(ip);

    // Twee lagen: snel in het geheugen, en een harde limiet in de database (geldt over alle instanties).
    if (!rateLimit(`ai-pm-download:${ip}`, MAX_PER_IP_PER_HOUR, 60 * 60 * 1000).success) {
      return NextResponse.json({ error: 'Te veel aanvragen. Probeer het later opnieuw.' }, { status: 429 });
    }
    if ((await countRecentByIp(ipHash)) >= MAX_PER_IP_PER_HOUR) {
      return NextResponse.json({ error: 'Te veel aanvragen. Probeer het later opnieuw.' }, { status: 429 });
    }

    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const organisatie = body.organisatie ? String(body.organisatie).trim().slice(0, 200) : null;
    const download = getDownload(String(body.resource ?? ''));

    if (!download) {
      return NextResponse.json({ error: 'Onbekende download' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }
    // Honeypot: bots vullen het verborgen veld in. We doen alsof het gelukt is, maar slaan niets op.
    if (body.website) {
      return NextResponse.json({ success: true, url: downloadUrl(download) });
    }
    if (isDisposable(email)) {
      return NextResponse.json(
        { error: 'Wegwerp-e-mailadressen kunnen we niet gebruiken. Vul een e-mailadres in waar je echt bereikbaar bent.' },
        { status: 400 },
      );
    }
    if (!(await hasMailServer(emailDomain(email)))) {
      return NextResponse.json(
        { error: 'Dit e-mailadres lijkt niet te bestaan. Controleer de spelling en probeer het opnieuw.' },
        { status: 400 },
      );
    }

    // Segmentering en scoring
    const previous = await previousResourceCount(email);
    const segment = segmentFor(email, organisatie);
    const score = scoreLead({
      segment,
      hasOrganisation: !!organisatie,
      isToolkit: download.id === 'toolkit',
      previousResources: previous,
    });

    const sourcePage = cleanPath(body.sourcePage);
    const referrer = cleanReferrer(body.referrer);
    const utmSource = cleanTag(body.utm_source);
    const utmMedium = cleanTag(body.utm_medium);
    const utmCampaign = cleanTag(body.utm_campaign);
    const followup = body.followup === true;

    const leadId = await insertDownloadLead({
      email,
      organisatie,
      resource: download.id,
      sourcePage,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      segment,
      score,
      ipHash,
      consentVersion: CONSENT_VERSION,
      followupOptin: followup,
    });

    // 1. Bevestiging met de gevolgde link naar de bezoeker
    const tpl = generateAiPmDownloadEmail({ organisatie: organisatie ?? undefined, download, leadId });
    const sent = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    if (sent.success) await markDelivery(leadId, { emailed: true });
    else console.error('AI-PM download mail mislukt:', sent.error);

    // 2. Melding aan Vincent, maar maximaal één per persoon per zes uur
    try {
      if (!(await recentlyNotified(email))) {
        const note = generateAiPmDownloadNotificationEmail({
          email,
          organisatie,
          documentTitle: download.title,
          segment,
          score,
          sourcePage,
          referrer,
          utm: [utmSource, utmMedium, utmCampaign].filter(Boolean).join(' / ') || null,
          followupOptin: followup,
          previousResources: previous,
        });
        const n = await sendEmail({ to: NOTIFY_EMAIL, subject: note.subject, html: note.html, text: note.text, replyTo: email });
        if (n.success) await markDelivery(leadId, { notified: true });
      }
    } catch (e) {
      console.error('AI-PM download melding mislukt:', e);
    }

    // 3. Alleen met expliciete opt-in: nieuwsbrief via de bestaande dubbele bevestiging
    if (followup) {
      try {
        await fetch(new URL('/api/newsletter', request.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: 'ai-pm-download' }),
        });
      } catch (e) {
        console.error('AI-PM opt-in nieuwsbrief mislukt:', e);
      }
    }

    return NextResponse.json({
      success: true,
      url: trackedUrl(leadId, download.id),
      emailed: sent.success,
      followup,
    });
  } catch (error) {
    console.error('AI-PM download error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
