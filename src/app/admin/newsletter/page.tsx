'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Calendar,
  Loader2,
  Send,
  BarChart3,
  Mail,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  segment_name: string | null;
  created_at: string;
  updated_at: string;
}

interface CampaignStats {
  total: number;
  drafts: number;
  sent: number;
  scheduled: number;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sending: 'bg-blue-100 text-blue-700',
  sent: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  archived: 'bg-slate-100 text-slate-700',
  failed: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, React.ElementType> = {
  draft: Edit,
  sending: Loader2,
  sent: Send,
  scheduled: Clock,
  archived: Mail,
  failed: Mail,
};

const statusLabels: Record<string, string> = {
  draft: 'Concept',
  sending: 'Wordt verzonden',
  sent: 'Verzonden',
  scheduled: 'Gepland',
  archived: 'Gearchiveerd',
  failed: 'Mislukt',
};

export default function AdminNewsletterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats>({ total: 0, drafts: 0, sent: 0, scheduled: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/newsletter');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setStats(data.stats || { total: 0, drafts: 0, sent: 0, scheduled: 0 });
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (campaignId: string, title: string) => {
    if (!confirm(`Weet je zeker dat je "${title}" wilt verwijderen?`)) {
      return;
    }

    setIsDeleting(campaignId);
    try {
      const response = await fetch('/api/admin/newsletter', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaignId }),
      });

      if (response.ok) {
        setCampaigns(campaigns.filter((c) => c.id !== campaignId));
        setStats((prev) => ({
          ...prev,
          total: prev.total - 1,
          drafts: prev.drafts - (campaigns.find((c) => c.id === campaignId)?.status === 'draft' ? 1 : 0),
          sent: prev.sent - (campaigns.find((c) => c.id === campaignId)?.status === 'sent' ? 1 : 0),
          scheduled: prev.scheduled - (campaigns.find((c) => c.id === campaignId)?.status === 'scheduled' ? 1 : 0),
        }));
      } else {
        alert('Fout bij het verwijderen van de campagne');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Fout bij het verwijderen van de campagne');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSendNow = async (campaignId: string) => {
    try {
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId, send_now: true }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        loadCampaigns();
      } else {
        const error = await response.json();
        alert(error.error || 'Fout bij verzenden');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Fout bij het verzenden');
    }
  };

  const filteredCampaigns = campaigns.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nieuwsbrieven</h1>
          <p className="text-slate-500 mt-1">
            Beheer je nieuwsbriefcampagnes en volg de resultaten
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/newsletter/subscribers">Abonnees & Segmenten</Link>
          </Button>
          <Button asChild className="bg-orange-600 hover:bg-orange-700">
            <Link href="/admin/newsletter/new">
              <Plus size={18} className="mr-2" />
              Nieuwe Campagne
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Totaal Campagnes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Concepten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.drafts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Verzonden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Gepland</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Zoek campagnes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campagne</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gepland/Verzonden</TableHead>
                    <TableHead>Statistieken</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => {
                    const StatusIcon = statusIcons[campaign.status] || Mail;
                    const openRate = campaign.sent_count > 0
                      ? Math.round((campaign.open_count / campaign.sent_count) * 100)
                      : 0;

                    return (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium max-w-md">
                          <div className="truncate">{campaign.title}</div>
                          <div className="text-sm text-slate-500 truncate max-w-xs">
                            {campaign.subject}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[campaign.status] || 'bg-gray-100 text-gray-700'}>
                            <StatusIcon size={12} className={`mr-1 ${campaign.status === 'sending' ? 'animate-spin' : ''}`} />
                            {statusLabels[campaign.status] || campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.scheduled_at ? (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Calendar size={14} />
                              {formatDate(campaign.scheduled_at)}
                            </div>
                          ) : campaign.sent_at ? (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Send size={14} />
                              {formatDate(campaign.sent_at)}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail size={14} className="text-slate-400" />
                              <span>{campaign.sent_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BarChart3 size={14} className="text-slate-400" />
                              <span>{openRate}%</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-500 text-sm">
                            {campaign.segment_name || 'Alle abonnees'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/api/newsletter/preview/${campaign.id}`} target="_blank">
                                  <Eye size={14} className="mr-2" />
                                  Preview
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/newsletter/${campaign.id}`}>
                                  <BarChart3 size={14} className="mr-2" />
                                  Analytics
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/newsletter/${campaign.id}/edit`}>
                                  <Edit size={14} className="mr-2" />
                                  Bewerken
                                </Link>
                              </DropdownMenuItem>
                              {(campaign.status === 'draft' || campaign.status === 'failed') && (
                                <DropdownMenuItem
                                  onClick={() => handleSendNow(campaign.id)}
                                >
                                  <Send size={14} className="mr-2" />
                                  {campaign.status === 'failed' ? 'Opnieuw Verzenden' : 'Nu Verzenden'}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 size={14} className="mr-2" />
                                    Verwijderen
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle> Campagne Verwijderen?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Weet je zeker dat je &lsquo;{campaign.title}&rsquo; wilt
                                      verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(campaign.id, campaign.title)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Verwijderen
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredCampaigns.length === 0 && !isLoading && (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-lg font-medium">Geen campagnes gevonden</p>
                  <p className="text-sm mt-1">
                    {searchQuery
                      ? 'Probeer een andere zoekopdracht'
                      : 'Maak je eerste nieuwsbrief campagne aan'}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
