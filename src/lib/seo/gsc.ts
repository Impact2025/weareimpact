import { google } from 'googleapis';

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

function getAuth() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not configured');

  const credentials = JSON.parse(json);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
}

function dateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export async function listGSCSites(): Promise<GSCSite[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sc = google.searchconsole({ version: 'v1', auth: getAuth() as any });
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
