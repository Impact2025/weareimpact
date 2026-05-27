'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

type Status = {
  connected: boolean;
  email?: string;
  method?: 'oauth2' | 'service-account';
};

function SetupPageInner() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === '1';
  const error = searchParams.get('error');

  const [status, setStatus] = useState<Status | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    fetch('/api/admin/seo/connection-status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false }))
      .finally(() => setLoadingStatus(false));
  }, [success]);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/seo">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            Terug naar SEO
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Google Search Console koppelen</h1>
        <p className="text-slate-500 mt-1">Eenmalig autoriseren — daarna werkt alles automatisch.</p>
      </div>

      {/* Success / error banners */}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle2 size={20} className="text-green-600 shrink-0" />
          <p className="text-green-800 font-medium">Koppeling geslaagd! Je Google account is nu verbonden.</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <XCircle size={20} className="text-red-600 shrink-0" />
          <p className="text-red-800">{decodeURIComponent(error)}</p>
        </div>
      )}

      {/* Connection status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Status
            {loadingStatus ? (
              <Loader2 size={16} className="animate-spin text-slate-400" />
            ) : status?.connected ? (
              <Badge className="bg-green-600">Verbonden</Badge>
            ) : (
              <Badge variant="destructive">Niet verbonden</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          {!loadingStatus && status?.connected && (
            <>
              {status.email && <p>Account: <strong>{status.email}</strong></p>}
              {status.method === 'oauth2' && <p>Methode: OAuth2 (eigen Google account)</p>}
              {status.method === 'service-account' && (
                <p className="text-amber-600">Methode: Service account — werkt mogelijk niet voor GSC. Koppel je Google account hieronder.</p>
              )}
            </>
          )}
          {!loadingStatus && !status?.connected && (
            <p>Nog niet gekoppeld. Klik hieronder om te autoriseren.</p>
          )}
        </CardContent>
      </Card>

      {/* Step 1: Google Cloud credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold">1</span>
            OAuth2-credentials aanmaken
          </CardTitle>
          <CardDescription>Eenmalig in Google Cloud Console — duurt 2 minuten.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <ol className="space-y-2 list-decimal list-inside">
            <li>Ga naar <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline inline-flex items-center gap-1">Google Cloud Console → Credentials <ExternalLink size={12}/></a></li>
            <li>Klik <strong>"Create Credentials" → "OAuth client ID"</strong></li>
            <li>Type: <strong>Web application</strong></li>
            <li>
              Voeg toe bij <strong>Authorized redirect URIs</strong>:
              <code className="block mt-1 bg-slate-100 px-3 py-2 rounded text-xs font-mono break-all">
                {typeof window !== 'undefined' ? window.location.origin : 'https://weareimpact.nl'}/api/admin/seo/oauth/callback
              </code>
            </li>
            <li>Download de credentials en kopieer <strong>Client ID</strong> en <strong>Client Secret</strong> naar je <code>.env.local</code>:</li>
          </ol>
          <pre className="bg-slate-900 text-green-400 text-xs rounded-lg px-4 py-3 overflow-x-auto">{`GOOGLE_CLIENT_ID=jouw-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-jouw-secret`}</pre>
          <p className="text-xs text-slate-400">Herstart de dev server na het toevoegen van de env vars.</p>
        </CardContent>
      </Card>

      {/* Step 2: Authorize */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold">2</span>
            Autoriseer je Google account
          </CardTitle>
          <CardDescription>
            Je wordt naar Google gestuurd en teruggeleid. De refresh token wordt automatisch opgeslagen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <a href="/api/admin/seo/oauth/start">
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Koppel Google Account
            </Button>
          </a>
          {status?.connected && status.method === 'oauth2' && (
            <div className="flex items-center gap-2 mt-2">
              <a href="/api/admin/seo/oauth/start">
                <Button variant="outline" size="sm">
                  <RefreshCw size={14} className="mr-1.5" />
                  Opnieuw koppelen
                </Button>
              </a>
              <span className="text-xs text-slate-400">Als de koppeling is verlopen</span>
            </div>
          )}
        </CardContent>
      </Card>

      {status?.connected && status.method === 'oauth2' && (
        <div className="flex justify-end">
          <Link href="/admin/seo">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Naar SEO Dashboard →
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 size={32} className="animate-spin text-orange-500" /></div>}>
      <SetupPageInner />
    </Suspense>
  );
}
