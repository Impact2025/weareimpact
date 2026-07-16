// Google Analytics 4 (GA4) reporting via the Data API, reusing the same
// service-account credentials as Google Calendar.
//
// SETUP (one-time, by Vincent):
//  1. Find the numeric GA4 *property ID* (Admin → Property settings, e.g. 123456789).
//     Note: this is NOT the measurement ID "G-Q8Q67SKTJV".
//  2. In GA4 Admin → Property Access Management, add the service-account email
//     (GOOGLE_SERVICE_ACCOUNT_EMAIL) as a Viewer.
//  3. Set GA4_PROPERTY_ID in the environment.
//
// Until then analyzeAnalytics() returns a clear, actionable setup message so
// Iris can explain what's needed instead of erroring.

import { google } from 'googleapis';

export interface AnalyticsSummary {
  ok: boolean;
  rangeLabel: string;
  error?: string;
  totals?: {
    sessions: number;
    activeUsers: number;
    newUsers: number;
    screenPageViews: number;
    avgSessionDurationSec: number;
    bounceRatePct: number;
  };
  topPages?: { path: string; views: number }[];
  topChannels?: { channel: string; sessions: number }[];
  topCountries?: { country: string; sessions: number }[];
}

function getAnalyticsClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!privateKey || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    throw new Error('Google service-account credentials not configured');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });

  return google.analyticsdata({ version: 'v1beta', auth });
}

/** Resolve a natural-language-ish range keyword into GA4 date strings. */
function resolveRange(range: string): { startDate: string; endDate: string; label: string } {
  const r = (range || 'yesterday').toLowerCase();
  if (r.includes('vandaag') || r === 'today') {
    return { startDate: 'today', endDate: 'today', label: 'vandaag' };
  }
  if (r.includes('7') || r.includes('week')) {
    return { startDate: '7daysAgo', endDate: 'yesterday', label: 'de afgelopen 7 dagen' };
  }
  if (r.includes('28') || r.includes('30') || r.includes('maand') || r.includes('month')) {
    return { startDate: '28daysAgo', endDate: 'yesterday', label: 'de afgelopen 28 dagen' };
  }
  // default: yesterday
  return { startDate: 'yesterday', endDate: 'yesterday', label: 'gisteren' };
}

export async function analyzeAnalytics(range = 'yesterday'): Promise<AnalyticsSummary> {
  const { startDate, endDate, label } = resolveRange(range);

  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    return {
      ok: false,
      rangeLabel: label,
      error:
        'Google Analytics is nog niet gekoppeld. Zet het numerieke GA4 property-ID in GA4_PROPERTY_ID en geef de service-account (GOOGLE_SERVICE_ACCOUNT_EMAIL) Viewer-toegang in GA4. Daarna kan ik je cijfers ophalen.',
    };
  }

  try {
    const analyticsData = getAnalyticsClient();
    const property = `properties/${propertyId}`;
    const dateRanges = [{ startDate, endDate }];

    const [totalsRes, pagesRes, channelsRes, countriesRes] = await Promise.all([
      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges,
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'newUsers' },
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
          ],
        },
      }),
      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges,
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: '5',
        },
      }),
      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges,
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: '5',
        },
      }),
      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges,
          dimensions: [{ name: 'country' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: '5',
        },
      }),
    ]);

    const totalRow = totalsRes.data.rows?.[0]?.metricValues ?? [];
    const num = (i: number) => Number(totalRow[i]?.value ?? 0);

    const topPages = (pagesRes.data.rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? '',
      views: Number(row.metricValues?.[0]?.value ?? 0),
    }));

    const topChannels = (channelsRes.data.rows ?? []).map((row) => ({
      channel: row.dimensionValues?.[0]?.value ?? '',
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
    }));

    const topCountries = (countriesRes.data.rows ?? []).map((row) => ({
      country: row.dimensionValues?.[0]?.value ?? '',
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
    }));

    return {
      ok: true,
      rangeLabel: label,
      totals: {
        sessions: num(0),
        activeUsers: num(1),
        newUsers: num(2),
        screenPageViews: num(3),
        avgSessionDurationSec: Math.round(num(4)),
        bounceRatePct: Math.round(num(5) * 100),
      },
      topPages,
      topChannels,
      topCountries,
    };
  } catch (error) {
    console.error('GA4 analytics error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    // Most common failure: service account lacks access to the property.
    if (/permission|403|forbidden|access/i.test(msg)) {
      return {
        ok: false,
        rangeLabel: label,
        error:
          'Ik heb geen toegang tot de GA4-property. Voeg de service-account als Viewer toe in GA4 Property Access Management en controleer GA4_PROPERTY_ID.',
      };
    }
    return {
      ok: false,
      rangeLabel: label,
      error: 'Ik kon de analytics-cijfers niet ophalen.',
    };
  }
}

/** Compact, model-friendly rendering of the analytics summary. */
export function formatAnalytics(s: AnalyticsSummary): string {
  if (!s.ok) return s.error ?? 'Analytics ophalen mislukte.';
  const t = s.totals!;
  const dur = `${Math.floor(t.avgSessionDurationSec / 60)}m ${t.avgSessionDurationSec % 60}s`;

  const lines = [
    `Analytics voor ${s.rangeLabel}:`,
    `- Sessies: ${t.sessions}`,
    `- Actieve gebruikers: ${t.activeUsers} (waarvan ${t.newUsers} nieuw)`,
    `- Paginaweergaven: ${t.screenPageViews}`,
    `- Gem. sessieduur: ${dur}`,
    `- Bouncepercentage: ${t.bounceRatePct}%`,
  ];

  if (s.topPages?.length) {
    lines.push('', 'Best bekeken pagina\'s:');
    s.topPages.forEach((p) => lines.push(`- ${p.path} (${p.views} views)`));
  }
  if (s.topChannels?.length) {
    lines.push('', 'Verkeersbronnen:');
    s.topChannels.forEach((c) => lines.push(`- ${c.channel}: ${c.sessions} sessies`));
  }
  if (s.topCountries?.length) {
    lines.push('', 'Landen:');
    s.topCountries.forEach((c) => lines.push(`- ${c.country}: ${c.sessions} sessies`));
  }

  return lines.join('\n');
}
