import { google } from 'googleapis';
import { sql } from '@/lib/db/neon';

export type GSCSite = {
  siteUrl: string;
  permissionLevel: string;
};

export type GSCPageRow = {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GSCQueryRow = {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

const GSC_SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

async function getSetting(key: string): Promise<string | null> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS seo_settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    const rows = await sql`SELECT value FROM seo_settings WHERE key = ${key} LIMIT 1`;
    return rows.length > 0 ? (rows[0].value as string) : null;
  } catch {
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS seo_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`
    INSERT INTO seo_settings (key, value, updated_at)
    VALUES (${key}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
}

export async function getGscConnectionStatus(): Promise<{
  connected: boolean;
  email?: string;
  method?: 'oauth2' | 'service-account';
}> {
  const refreshToken = await getSetting('gsc_refresh_token');
  if (refreshToken) {
    const email = await getSetting('gsc_account_email');
    return { connected: true, email: email || undefined, method: 'oauth2' };
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return { connected: true, method: 'service-account' };
  }
  return { connected: false };
}

async function getAuth() {
  // Prefer OAuth2 refresh token (user's own Google account)
  const refreshToken = await getSetting('gsc_refresh_token');
  if (refreshToken) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not configured');

    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });
    return oauth2;
  }

  // Fall back to service account (won't work for GSC without GSC UI grant)
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    const credentials = JSON.parse(json);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: GSC_SCOPES,
    });
  }

  throw new Error(
    'GSC niet gekoppeld. Ga naar /admin/seo/setup om je Google account te koppelen.'
  );
}

function dateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export async function listGSCSites(): Promise<GSCSite[]> {
  const auth = await getAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sc = google.searchconsole({ version: 'v1', auth: auth as any });
  const res = await sc.sites.list();
  return (res.data.siteEntry || []).map((s) => ({
    siteUrl: s.siteUrl!,
    permissionLevel: s.permissionLevel || 'unknown',
  }));
}

export async function getPagePerformance(
  siteUrl: string,
  days = 90
): Promise<GSCPageRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sc = google.searchconsole({ version: 'v1', auth: getAuth() as any });

  const res = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: dateString(days),
      endDate: dateString(3), // exclude last 3 days (GSC lag)
      dimensions: ['page'],
      rowLimit: 1000,
      dataState: 'all',
    },
  });

  return (res.data.rows || []).map((row) => ({
    page: row.keys![0],
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));
}

export async function getQueryPerformance(
  siteUrl: string,
  days = 90
): Promise<GSCQueryRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sc = google.searchconsole({ version: 'v1', auth: getAuth() as any });

  const res = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: dateString(days),
      endDate: dateString(3),
      dimensions: ['query', 'page'],
      rowLimit: 2000,
      dataState: 'all',
    },
  });

  return (res.data.rows || []).map((row) => ({
    query: row.keys![0],
    page: row.keys![1],
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));
}

export async function getTopQueriesForPage(
  siteUrl: string,
  pageUrl: string,
  days = 90
): Promise<{ query: string; impressions: number; position: number }[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sc = google.searchconsole({ version: 'v1', auth: getAuth() as any });

  const res = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: dateString(days),
      endDate: dateString(3),
      dimensions: ['query'],
      dimensionFilterGroups: [
        {
          filters: [
            {
              dimension: 'page',
              operator: 'equals',
              expression: pageUrl,
            },
          ],
        },
      ],
      rowLimit: 20,
      dataState: 'all',
    },
  });

  return (res.data.rows || [])
    .map((row) => ({
      query: row.keys![0],
      impressions: row.impressions ?? 0,
      position: row.position ?? 0,
    }))
    .slice(0, 10);
}
