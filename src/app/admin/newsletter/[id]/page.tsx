'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Copy,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Campaign {
  id: string;
  title: string;
  subject: string;
  preview_text: string | null;
  status: 'draft' | 'sending' | 'sent' | 'scheduled' | 'archived' | 'failed';
  scheduled_at: string | null;
  sent_at: string | null;
  sent_count: number;
  open_count: number;
  click_count: number;
  bounce_count: number;
  unsubscribe_count: number;
  segment_name: string | null;
  created_at: string;
  updated_at: string;
}

interface Recipient {
  id: string;
  email: string;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
}

export default function CampaignAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (campaignId) {
      loadCampaign();
      loadRecipients();
    }
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const res = await fetch(`/api/admin/newsletter?id=${campaignId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCampaign(data.campaign);
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecipients = async () => {
    try {
      const res = await fetch(`/api/admin/newsletter-recipients?campaign_id=${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        setRecipients(data.recipients || []);
      }
    } catch (error) {
      console.error('Error loading recipients:', error);
    }
  };

  const openRate = campaign?.sent_count
    ? Math.round((campaign.open_count / campaign.sent_count) * 100)
    : 0;

  const clickRate = campaign?.sent_count
    ? Math.round((campaign.click_count / campaign.sent_count) * 100)
    : 0;

  const unsubscribeRate = campaign?.sent_count
    ? ((campaign.unsubscribe_count / campaign.sent_count) * 100).toFixed(1)
    : '0';

  const bounceRate = campaign?.sent_count
    ? ((campaign.bounce_count / campaign.sent_count) * 100).toFixed(1)
    : '0';

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Campagne niet gevonden</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/newsletter"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {campaign.title}
            </h1>
            <p className="text-slate-500 mt-1">{campaign.subject}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Badge
            className={
              campaign.status === 'sent'
                ? 'bg-green-100 text-green-700'
                : campaign.status === 'scheduled' || campaign.status === 'sending'
                  ? 'bg-blue-100 text-blue-700'
                  : campaign.status === 'failed'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
            }
          >
            {campaign.status === 'sent'
              ? 'Verzonden'
              : campaign.status === 'sending'
                ? 'Wordt verzonden'
                : campaign.status === 'scheduled'
                  ? 'Gepland'
                  : campaign.status === 'failed'
                    ? 'Mislukt'
                    : 'Concept'}
          </Badge>
          <Link href={`/admin/newsletter/${campaign.id}/edit`}>
            <Button variant="outline">
              <Copy size={16} className="mr-2" />
              Bewerken
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Verzonden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{campaign.sent_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRate}%</div>
            <div className="text-sm text-slate-500">{campaign.open_count} opens</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clickRate}%</div>
            <div className="text-sm text-slate-500">{campaign.click_count} clicks</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Bounces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{campaign.bounce_count}</div>
            <div className="text-sm text-slate-500">{bounceRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Unsubscribed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{campaign.unsubscribe_count}</div>
            <div className="text-sm text-slate-500">{unsubscribeRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Verzendgeschiedenis</CardTitle>
          <CardDescription>
            {campaign.scheduled_at
              ? `Gepland voor ${formatDate(campaign.scheduled_at)}`
              : campaign.sent_at
                ? `Verzonden op ${formatDate(campaign.sent_at)}`
                : 'Nog niet verzonden'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Send size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Campagne aangemaakt</p>
                <p className="text-sm text-slate-500">{formatDate(campaign.created_at)}</p>
              </div>
            </div>
            {campaign.sent_at && (
              <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Send size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Campagne verzonden</p>
                  <p className="text-sm text-green-700">
                    {campaign.sent_count} abonnees bereikt
                  </p>
                  <p className="text-sm text-slate-500">{formatDate(campaign.sent_at)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recipients Table */}
      {(campaign.status === 'sent' || campaign.status === 'sending') && (
        <Card>
          <CardHeader>
            <CardTitle>Ontvangers</CardTitle>
            <CardDescription>
              Individuele tracking per abonnee
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recipients.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>Geen ontvangerdata beschikbaar</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-mailadres</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verzonden</TableHead>
                    <TableHead>Geopend</TableHead>
                    <TableHead>Geklikt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {r.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            r.status === 'opened'
                              ? 'bg-green-100 text-green-700'
                              : r.status === 'clicked'
                                ? 'bg-blue-100 text-blue-700'
                                : r.status === 'sent'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-red-100 text-red-700'
                          }
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {r.sent_at ? formatDate(r.sent_at) : '-'}
                      </TableCell>
                      <TableCell>
                        {r.opened_at ? formatDate(r.opened_at) : '-'}
                      </TableCell>
                      <TableCell>
                        {r.clicked_at ? formatDate(r.clicked_at) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
