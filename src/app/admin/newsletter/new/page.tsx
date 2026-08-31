'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  Calendar as CalendarIcon,
  Loader2,
  Sparkles,
  Mail,
  Clock,
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

interface Segment {
  id: string;
  name: string;
  subscriber_count?: number;
}

interface CampaignEditorProps {
  existingCampaign?: {
    id: string;
    title: string;
    subject: string;
    preview_text: string | null;
    content_html: string;
    content_text: string | null;
    status: 'draft' | 'sending' | 'sent' | 'scheduled' | 'archived' | 'failed';
    scheduled_at: string | null;
    sender_name: string;
    sender_email: string;
    reply_to: string | null;
    utm_campaign: string;
    segment_id: string | null;
  } | null;
}

export default function CampaignEditorPage({
  existingCampaign = null,
}: CampaignEditorProps) {
  const router = useRouter();
  const isEdit = !!existingCampaign;
  const [isLoading, setIsLoading] = useState(false);
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
    title: existingCampaign?.title || '',
    subject: existingCampaign?.subject || '',
    preview_text: existingCampaign?.preview_text || '',
    content_html: existingCampaign?.content_html || '',
    content_text: existingCampaign?.content_text || '',
    status: existingCampaign?.status || 'draft',
    scheduled_at: existingCampaign?.scheduled_at
      ? new Date(existingCampaign.scheduled_at).toISOString().slice(0, 16)
      : '',
    sender_name: existingCampaign?.sender_name || 'WeAreImpact',
    sender_email: existingCampaign?.sender_email || 'nieuws@weareimpact.nl',
    reply_to: existingCampaign?.reply_to || '',
    utm_campaign: existingCampaign?.utm_campaign || '',
    segment_id: existingCampaign?.segment_id || 'all',
    send_now: false,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
      utm_campaign: generateSlug(title) || prev.utm_campaign,
    }));
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

      let response: Response;
      if (isEdit) {
        response = await fetch('/api/admin/newsletter', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: existingCampaign!.id, ...body }),
        });
      } else {
        response = await fetch('/api/admin/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        alert(`Fout bij opslaan: ${result.error || 'Onbekende fout'}`);
        return;
      }

      // If send_now is true, trigger sending
      if (isEdit && formData.send_now && formData.status === 'sent') {
        // Already sent, just redirect
        router.push('/admin/newsletter');
      } else if (body.send_now && !isEdit) {
        // New campaign — save then send
        const campaignId = result.campaign.id;
        await fetch('/api/admin/newsletter/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaign_id: campaignId, send_now: true }),
        });
      }

      alert(isEdit ? 'Campagne bijgewerkt!' : 'Campagne aangemaakt!');
      router.push('/admin/newsletter');
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Er ging iets fout bij het opslaan');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-slate-900">
              {isEdit ? 'Campagne Bewerken' : 'Nieuwe Nieuwsbrief'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isEdit
                ? 'Bewerk en publiceer je nieuwsbriefcampagne'
                : 'Maak een nieuwe nieuwsbriefcampagne voor je abonnees'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(`/api/newsletter/preview/${existingCampaign?.id || ''}`, '_blank')}
            disabled={!formData.content_html || !formData.subject}
          >
            <EyePreviewButton />
          </Button>
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
            {isEdit ? 'Bijwerken' : 'Opslaan'}
          </Button>
          {!isEdit && (
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading || !formData.subject || !formData.content_html}
              onClick={() => setFormData((prev) => ({ ...prev, send_now: true }))}
            >
              <Send size={18} className="mr-2" />
              Nu Verzenden
            </Button>
          )}
        </div>
      </div>

      {/* Main Form */}
      <form id="campaign-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="seo">Details & Segment</TabsTrigger>
              <TabsTrigger value="social">Aflevering</TabsTrigger>
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

            <TabsContent value="seo" className="space-y-4 mt-4">
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

            <TabsContent value="social" className="space-y-4 mt-4">
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
                          status: val as 'draft' | 'sent' | 'scheduled' | 'archived',
                        }))
                      }
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Voorvertoning</CardTitle>
                  <CardDescription>
                    Controleer hoe de nieuwsbrief eruit ziet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-slate-50">
                    <div className="max-w-xs mx-auto bg-white border rounded-lg shadow">
                      <div className="border-b p-4 bg-orange-50">
                        <h3 className="text-lg font-bold text-slate-900">
                          {formData.subject || 'Jouw onderwerp'}
                        </h3>
                      </div>
                      <div className="p-4 text-sm">
                        {[formData.preview_text || 'Preview tekst verschijnt hier...'].slice(0, 1).map(
                          (text, i) => (
                            <p key={i} className="text-slate-600 line-clamp-2">
                              {text.slice(0, 80)}
                              {text.length > 80 ? '...' : ''}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  </div>
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
                    'Schrijf een korte, engagerende introductie voor deze nieuwsbrief over de nieueste ontwikkelingen in AI en welzijn'
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
              <CardTitle className="flex items-center gap-2">
                <Mail size={18} />
                Tips & Tricks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg">
                <strong className="block text-slate-900 mb-1">Onderwerp</strong>
                <p className="text-slate-600">
                  Houd het onderwerp onder de 50 tekens voor mobiele apparaten.
                  Gebruik emoji&#39;s om aandacht te trekken, maar niet overdreven.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <strong className="block text-slate-900 mb-1">Preview tekst</strong>
                <p className="text-slate-600">
                  Deze tekst wordt naast het onderwerp getoond. Maak hem klikbaar
                  om open rates te verhogen.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <strong className="block text-slate-900 mb-1">UTM tracking</strong>
                <p className="text-slate-600">
                  Alle links krijgen automatisch UTM parameters voor campagne-tracking.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={18} />
                Acties
              </CardTitle>
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

function EyePreviewButton() {
  return (
    <>
      <span>Preview</span>
    </>
  );
}
