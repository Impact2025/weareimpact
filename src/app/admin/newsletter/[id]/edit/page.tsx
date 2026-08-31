'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  Sparkles,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewsletterEditor } from '@/components/Newsletter/NewsletterEditor';



interface Campaign {
  id: string;
  title: string;
  subject: string;
  preview_text: string | null;
  content_html: string;
  content_text: string | null;
  status: 'draft' | 'sending' | 'sent' | 'scheduled' | 'archived' | 'failed';
  scheduled_at: string | null;
  sent_at: string | null;
  sender_name: string;
  sender_email: string;
  reply_to: string | null;
  utm_campaign: string;
  segment_id: string | null;
  segment_name: string | null;
}

interface Segment {
  id: string;
  name: string;
  subscriber_count?: number;
}

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [segments, setSegments] = useState<Segment[]>([]);

  useEffect(() => {
    fetch('/api/admin/newsletter/tags')
      .then((res) => (res.ok ? res.json() : { tags: [] }))
      .then((data) => setSegments(data.tags || []))
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    preview_text: '',
    content_html: '',
    content_text: '',
    status: 'draft' as 'draft' | 'sending' | 'sent' | 'scheduled' | 'archived' | 'failed',
    scheduled_at: '',
    sender_name: 'WeAreImpact',
    sender_email: 'nieuws@weareimpact.nl',
    reply_to: '',
    utm_campaign: '',
    segment_id: 'all',
    send_now: false,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  useEffect(() => {
    if (campaignId) {
      loadCampaign();
    }
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const res = await fetch(`/api/admin/newsletter?id=${campaignId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCampaign(data.campaign);

      setFormData({
        title: data.campaign.title || '',
        subject: data.campaign.subject || '',
        preview_text: data.campaign.preview_text || '',
        content_html: data.campaign.content_html || '',
        content_text: data.campaign.content_text || '',
        status: data.campaign.status || 'draft',
        scheduled_at: data.campaign.scheduled_at
          ? new Date(data.campaign.scheduled_at).toISOString().slice(0, 16)
          : '',
        sender_name: data.campaign.sender_name || 'WeAreImpact',
        sender_email: data.campaign.sender_email || 'nieuws@weareimpact.nl',
        reply_to: data.campaign.reply_to || '',
        utm_campaign: data.campaign.utm_campaign || '',
        segment_id: data.campaign.segment_id || 'all',
        send_now: false,
      });
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAIGenerate = async (prompt: string) => {
    if (!formData.subject || formData.subject.length < 3) {
      alert('Vul eerst een onderwerp in');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/newsletter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formData.subject,
          prompt: prompt,
          existing_content: formData.content_html,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error('API Error:', result);
        alert(result.error || 'AI generatie mislukt');
        return;
      }

      const { data } = result;
      const newContent = data.content_html || '';

      setFormData((prev) => ({
        ...prev,
        content_html: prev.content_html
          ? `${prev.content_html}\n\n${newContent}`
          : newContent,
        preview_text: data.preview_text || prev.preview_text,
      }));

      alert('✨ AI content succesvol toegevoegd!');
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Er ging iets fout bij het genereren van content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const body: Record<string, unknown> = {
        ...formData,
        content_text: formData.content_text || undefined,
        preview_text: formData.preview_text || undefined,
        scheduled_at: formData.scheduled_at || null,
        reply_to: formData.reply_to || null,
        segment_id: formData.segment_id === 'all' ? null : formData.segment_id,
      };

      const response = await fetch('/api/admin/newsletter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaignId, ...body }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Fout bij opslaan: ${result.error || 'Onbekende fout'}`);
        return;
      }

      // If send_now, trigger sending
      if (formData.send_now) {
        await fetch('/api/admin/newsletter/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaign_id: campaignId, send_now: true }),
        });
      }

      alert('Campagne bijgewerkt!');
      router.push('/admin/newsletter');
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Er ging iets fout bij het opslaan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      utm_campaign: generateSlug(title) || prev.utm_campaign,
    }));
  };

  const handleSendNow = async () => {
    if (!confirm('Weet je zeker dat je deze nouwswbrief nu wilt verzenden?')) {
      return;
    }

    const response = await fetch('/api/admin/newsletter/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: campaignId, send_now: true }),
    });

    const result = await response.json();
    alert(result.message || 'Verzonden!');
    router.refresh();
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-4 mx-auto" />
          <p className="text-slate-500">Campagne laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-slate-900">Campagne Bewerken</h1>
            <p className="text-slate-500 mt-1">
              {formData.title || 'Laad campagne...'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(`/api/newsletter/preview/${campaignId}`, '_blank')}
            disabled={!formData.content_html || !formData.subject}
          >
            <Eye size={18} className="mr-2" />
            Preview
          </Button>
          {formData.status !== 'sent' && formData.status !== 'sending' && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSendNow}
              className="border-green-400 text-green-700 hover:bg-green-50"
            >
              <Send size={18} className="mr-2" />
              {formData.status === 'failed' ? 'Opnieuw Verzenden' : 'Nu Verzenden'}
            </Button>
          )}
          <Button
            type="submit"
            form="campaign-form"
            className="bg-orange-600 hover:bg-orange-700"
            disabled={isLoading || !formData.subject || !formData.content_html}
          >
            {isLoading ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <Save size={18} className="mr-2" />
            )}
            Opslaan
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <form id="campaign-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="details">Details & Segment</TabsTrigger>
              <TabsTrigger value="publish">Publicatie</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campagne Titel</CardTitle>
                  <CardDescription>
                    Interne titel om deze campagne te identificeren
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="AI Updates juni 2026"
                    className="text-xl font-bold"
                    required
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Content</CardTitle>
                  <CardDescription>
                    Schrijf de inhoud van je nieuwsbrief met de pro editor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NewsletterEditor
                    content={formData.content_html}
                    onChange={(html) =>
                      setFormData((prev) => ({ ...prev, content_html: html }))
                    }
                    placeholder="Schrijf je nieuwsbrief inhoud hier..."
                    onGenerateAI={handleAIGenerate}
                    isGenerating={isGenerating}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>VerzendDetails</CardTitle>
                  <CardDescription>
                    Instellingen voor afzender en segmenten
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Onderwerp *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      placeholder="Wat staat er deze keer in?"
                      required
                      maxLength={98}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Maximaal 98 karakters aanbevolen voor optimale weergave</span>
                      <span>{formData.subject.length}/98</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preview_text">Preview tekst</Label>
                    <Textarea
                      id="preview_text"
                      value={formData.preview_text}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, preview_text: e.target.value }))
                      }
                      placeholder="Korte samenvatting die getoond wordt in het inbox overzicht..."
                      rows={2}
                      maxLength={175}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Maximaal 175 karakters</span>
                      <span>{formData.preview_text.length}/175</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="segment_id">Segment</Label>
                    <Select
                      value={formData.segment_id}
                      onValueChange={(val) =>
                        setFormData((prev) => ({ ...prev, segment_id: val }))
                      }
                      disabled={formData.status === 'sent' || formData.status === 'sending'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kies een segment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle actieve abonnees</SelectItem>
                        {segments.map((segment) => (
                          <SelectItem key={segment.id} value={segment.id}>
                            {segment.name} ({segment.subscriber_count ?? 0})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      <Link href="/admin/newsletter/subscribers" className="text-orange-600 hover:underline">
                        Tags beheren en toewijzen aan abonnees →
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Afzender Instellingen</CardTitle>
                  <CardDescription>
                    Wie verstuurt deze nieuwsbrief?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sender_name">Afzender Naam</Label>
                      <Input
                        id="sender_name"
                        value={formData.sender_name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, sender_name: e.target.value }))
                        }
                        placeholder="WeAreImpact"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sender_email">Afzender E-mail</Label>
                      <Input
                        id="sender_email"
                        type="email"
                        value={formData.sender_email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, sender_email: e.target.value }))
                        }
                        placeholder="nieuws@weareimpact.nl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reply_to">Reply-To E-mail</Label>
                    <Input
                      id="reply_to"
                      type="email"
                      value={formData.reply_to || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, reply_to: e.target.value }))
                      }
                      placeholder="v.munster@weareimpact.nl"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="publish" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Publicatie Instellingen</CardTitle>
                  <CardDescription>
                    Kies wanneer en hoe deze campagne wordt verzonden
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="utm_campaign">UTM Campaign</Label>
                    <Input
                      id="utm_campaign"
                      value={formData.utm_campaign || generateSlug(formData.title)}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, utm_campaign: e.target.value }))
                      }
                      placeholder="ai-updates-juni-2026"
                    />
                    <p className="text-xs text-slate-500">
                      Wordt gebruikt voor tracking in Google Analytics
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: val as 'draft' | 'sending' | 'sent' | 'scheduled' | 'archived' | 'failed',
                        }))
                      }
                      disabled={formData.status === 'sent' || formData.status === 'sending'}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Concept (nog niet verzenden)</SelectItem>
                        <SelectItem value="scheduled">Gepland verzenden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.status === 'sending' && (
                    <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                      <p className="text-sm text-blue-700">Deze campagne wordt op dit moment verzonden...</p>
                    </div>
                  )}

                  {formData.status === 'failed' && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700">
                        De vorige verzendpoging is mislukt (of er waren geen actieve abonnees in het gekozen segment). Je kunt het opnieuw proberen met de knop hierboven.
                      </p>
                    </div>
                  )}

                  {formData.status === 'scheduled' && (
                    <div className="space-y-2">
                      <Label htmlFor="scheduled_at">Plan voor</Label>
                      <Input
                        id="scheduled_at"
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, scheduled_at: e.target.value }))
                        }
                      />
                    </div>
                  )}

                  {formData.status === 'draft' && (
                    <div className="flex items-start space-x-3 pt-2">
                      <Switch
                        id="send_now"
                        checked={formData.send_now}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, send_now: checked }))
                        }
                      />
                      <Label htmlFor="send_now" className="font-normal">
                        Direct verzenden in plaats van opslaan als concept
                      </Label>
                    </div>
                  )}

                  {formData.status === 'sent' && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">
                        Deze campagne is verzonden op{' '}
                        {campaign?.sent_at
                          ? new Date(campaign.sent_at).toLocaleDateString('nl-NL')
                          : 'onbekend'}.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - AI Assistant & Tips */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={18} className="text-orange-600" />
                AI Assistant
              </CardTitle>
              <CardDescription>
                Laat AI helpen bij het schrijven van content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() =>
                  handleAIGenerate(
                    'Schrijf een korte, engagerende introductie voor deze nieuwsbrief over de nieuwste ontwikkelingen in AI en welzijn'
                  )
                }
                disabled={isGenerating || !formData.subject}
              >
                Introductie schrijven
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() =>
                  handleAIGenerate(
                    'Voeg een call-to-action sectie toe aan de nieuwsbrief met een knop naar een relevant artikel'
                  )
                }
                disabled={isGenerating || !formData.subject}
              >
                CTA toevoegen
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() =>
                  handleAIGenerate(
                    'Schrijf een nieuws-update over de nieuwste AI-ontwikkelingen bij WeAreImpact deze maand'
                  )
                }
                disabled={isGenerating || !formData.subject}
              >
                Nieuws update genereren
              </Button>
              {isGenerating && (
                <div className="p-3 bg-orange-50 rounded-lg text-sm text-orange-700">
                  AI genereert content...
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => router.push('/admin/newsletter')}
              >
                Annuleren & Sluiten
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
