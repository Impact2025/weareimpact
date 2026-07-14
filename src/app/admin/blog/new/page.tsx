'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Sparkles,
  FileText,
  Search,
  Share2,
  Settings,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Calendar,
  Wand2,
  Link2,
  ExternalLink,
  FileCode,
  Type,
  Headphones,
  FileText as FileTextIcon
} from 'lucide-react';
import { upload } from '@vercel/blob/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { RichTextEditor } from '@/components/BlogEditor/RichTextEditor';

type TabType = 'editor' | 'seo' | 'social' | 'settings';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [showAIPanel, setShowAIPanel] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    coverImage: '',
    coverImageAlt: '',
    headerType: 'image' as 'image' | 'color',
    headerColor: 'orange' as 'orange' | 'slate',
    headerTitle: '',
    audioUrl: '',
    audioTitle: '',
    audioDuration: 0,
    transcript: '',
    published: false,
    publishedAt: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    socialInstagram: '',
    socialFacebook: '',
    socialLinkedIn: '',
    socialTwitter: '',
    imagePrompt: '',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const [aiFormData, setAIFormData] = useState({
    keyword: '',
    category: 'ai',
    audience: 'professionals en beslissers in het bedrijfsleven',
    tone: 'professioneel maar toegankelijk',
    length: 'medium' as 'short' | 'medium' | 'long',
  });

  const [rawContent, setRawContent] = useState({
    title: '',
    content: '',
  });

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [suggestedLinks, setSuggestedLinks] = useState<Array<{
    anchorText: string;
    url: string;
    reason: string;
  }>>([]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
      seoTitle: title,
    });
  };

  const handleAIOptimize = async () => {
    if (!rawContent.content || rawContent.content.trim().length < 100) {
      alert('Plak minimaal 100 karakters tekst om te optimaliseren');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/blog/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: rawContent.content,
          title: rawContent.title,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API Error:', result);
        alert(result.error || 'AI optimalisatie mislukt');
        return;
      }

      const { data } = result;

      // Update form with AI optimized content
      setFormData({
        ...formData,
        title: data.title,
        slug: generateSlug(data.title),
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        tags: data.tags.join(', '),
        seoTitle: data.seo.title,
        seoDescription: data.seo.description,
        seoKeywords: data.seo.keywords.join(', '),
        socialInstagram: data.socialMedia.instagram,
        socialFacebook: data.socialMedia.facebook,
        socialLinkedIn: data.socialMedia.linkedin,
        socialTwitter: data.socialMedia.twitter,
        imagePrompt: data.coverImage.prompt,
        coverImageAlt: data.coverImage.alt,
      });

      setShowAIPanel(false);
      setActiveTab('editor');
      alert('✨ Content succesvol geoptimaliseerd! Alle SEO, social media en metadata zijn ingevuld.');
    } catch (error) {
      console.error('Error optimizing content:', error);
      alert('Er ging iets fout bij het optimaliseren. Controleer de console voor details.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhance Only - keeps original text, only fills metadata
  const handleEnhanceOnly = async () => {
    if (!formData.content || formData.content.trim().length < 100) {
      alert('Je hebt minimaal 100 karakters content nodig om te enhancen');
      return;
    }

    if (!formData.title || formData.title.trim().length < 5) {
      alert('Vul eerst een titel in');
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/admin/blog/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: formData.content,
          title: formData.title,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API Error:', result);
        alert(result.error || 'Enhancement mislukt');
        return;
      }

      const { data } = result;

      // Update ONLY metadata fields, keep content unchanged
      setFormData({
        ...formData,
        // Keep these unchanged:
        // title, slug, content - user's original text
        excerpt: data.excerpt || formData.excerpt,
        category: data.category || formData.category,
        tags: data.tags?.join(', ') || formData.tags,
        seoTitle: data.seo?.title || formData.seoTitle,
        seoDescription: data.seo?.description || formData.seoDescription,
        seoKeywords: data.seo?.keywords?.join(', ') || formData.seoKeywords,
        socialInstagram: data.socialMedia?.instagram || formData.socialInstagram,
        socialFacebook: data.socialMedia?.facebook || formData.socialFacebook,
        socialLinkedIn: data.socialMedia?.linkedin || formData.socialLinkedIn,
        socialTwitter: data.socialMedia?.twitter || formData.socialTwitter,
        imagePrompt: data.coverImage?.prompt || formData.imagePrompt,
        coverImageAlt: data.coverImage?.alt || formData.coverImageAlt,
      });

      // Store suggested internal links
      if (data.internalLinks && data.internalLinks.length > 0) {
        setSuggestedLinks(data.internalLinks);
      }

      setActiveTab('seo');
      alert('✨ Metadata succesvol gegenereerd! Je tekst is ongewijzigd. Check de SEO en Social Media tabs.');
    } catch (error) {
      console.error('Error enhancing content:', error);
      alert('Er ging iets fout bij het enhancen. Controleer de console voor details.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Format & SEO - adds HTML structure AND fills metadata
  const handleFormatAndSEO = async () => {
    if (!formData.content || formData.content.trim().length < 100) {
      alert('Je hebt minimaal 100 karakters content nodig om te formatteren');
      return;
    }

    if (!formData.title || formData.title.trim().length < 5) {
      alert('Vul eerst een titel in');
      return;
    }

    setIsFormatting(true);
    try {
      const response = await fetch('/api/admin/blog/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: formData.content,
          title: formData.title,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API Error:', result);
        alert(result.error || 'Formattering mislukt');
        return;
      }

      const { data } = result;

      // Update content WITH formatting AND all metadata
      setFormData({
        ...formData,
        content: data.formattedContent || formData.content,
        excerpt: data.excerpt || formData.excerpt,
        category: data.category || formData.category,
        tags: data.tags?.join(', ') || formData.tags,
        seoTitle: data.seo?.title || formData.seoTitle,
        seoDescription: data.seo?.description || formData.seoDescription,
        seoKeywords: data.seo?.keywords?.join(', ') || formData.seoKeywords,
        socialInstagram: data.socialMedia?.instagram || formData.socialInstagram,
        socialFacebook: data.socialMedia?.facebook || formData.socialFacebook,
        socialLinkedIn: data.socialMedia?.linkedin || formData.socialLinkedIn,
        socialTwitter: data.socialMedia?.twitter || formData.socialTwitter,
        imagePrompt: data.coverImage?.prompt || formData.imagePrompt,
        coverImageAlt: data.coverImage?.alt || formData.coverImageAlt,
      });

      setActiveTab('editor');
      alert('✨ Tekst geformatteerd met headers, alinea\'s en interne links! Alle SEO velden zijn ook ingevuld.');
    } catch (error) {
      console.error('Error formatting content:', error);
      alert('Er ging iets fout bij het formatteren. Controleer de console voor details.');
    } finally {
      setIsFormatting(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiFormData.keyword) {
      alert('Vul een primair keyword in');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiFormData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API Error:', result);
        alert(result.error || 'AI generatie mislukt');
        return;
      }

      const { data } = result;

      // Update form with AI generated content
      setFormData({
        ...formData,
        title: data.title,
        slug: generateSlug(data.title),
        content: data.content,
        excerpt: data.excerpt,
        category: aiFormData.category,
        seoTitle: data.seo.title,
        seoDescription: data.seo.description,
        seoKeywords: data.seo.keywords.join(', '),
        socialInstagram: data.socialMedia.instagram,
        socialFacebook: data.socialMedia.facebook,
        socialLinkedIn: data.socialMedia.linkedin,
        socialTwitter: data.socialMedia.twitter,
        imagePrompt: data.imagePrompt,
      });

      setShowAIPanel(false);
      alert('AI content succesvol gegenereerd! Pas het aan naar wens.');
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Er ging iets fout bij het genereren van content. Controleer de console voor details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || 'Upload mislukt');
        return;
      }

      setFormData({ ...formData, coverImage: result.url });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Er ging iets fout bij het uploaden');
    } finally {
      setIsUploading(false);
    }
  };

  // Read the duration (seconds) from an audio file client-side, for schema.org + UI.
  const getAudioDuration = (file: File): Promise<number> =>
    new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(file);
        const audioEl = document.createElement('audio');
        audioEl.preload = 'metadata';
        audioEl.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          resolve(Number.isFinite(audioEl.duration) ? Math.round(audioEl.duration) : 0);
        };
        audioEl.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(0);
        };
        audioEl.src = url;
      } catch {
        resolve(0);
      }
    });

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    try {
      const duration = await getAudioDuration(file);

      // Direct-to-Blob upload (bypasses the serverless body-size limit for large podcasts).
      const blob = await upload(`podcasts/${Date.now()}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/audio',
      });

      setFormData((prev) => ({
        ...prev,
        audioUrl: blob.url,
        audioDuration: duration,
        audioTitle: prev.audioTitle || file.name.replace(/\.[^.]+$/, ''),
      }));
    } catch (error) {
      console.error('Audio upload error:', error);
      alert('Audio uploaden mislukt: ' + (error instanceof Error ? error.message : 'onbekende fout'));
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          publishedAt: formData.publishedAt || undefined,
          headerType: formData.headerType,
          headerColor: formData.headerColor,
          headerTitle: formData.headerTitle,
          audioUrl: formData.audioUrl,
          audioTitle: formData.audioTitle,
          audioDuration: formData.audioDuration || null,
          transcript: formData.transcript,
        }),
      });

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`Fout bij opslaan: ${errorData.error || 'Onbekende fout'}`);
      }
    } catch (error) {
      console.error('Error saving post:', error);
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
            href="/admin/blog"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nieuwe Blog Post</h1>
            <p className="text-slate-500 mt-1">Plak je tekst en maak het SEO wereldklasse met AI</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleFormatAndSEO}
            disabled={isFormatting || !formData.content || formData.content.length < 100}
            className="border-green-400 text-green-700 hover:bg-green-50"
          >
            {isFormatting ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <FileCode size={18} className="mr-2" />
            )}
            Format & SEO
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleEnhanceOnly}
            disabled={isEnhancing || !formData.content || formData.content.length < 100}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            {isEnhancing ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <Wand2 size={18} className="mr-2" />
            )}
            Metadata Only
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowAIPanel(!showAIPanel)}>
            <Sparkles size={18} className="mr-2" />
            SEO Optimizer
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(`/blog/${formData.slug}`, '_blank')}
            disabled={!formData.slug}
          >
            <Eye size={18} className="mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="editor" className="gap-2">
                  <FileText size={16} />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="seo" className="gap-2">
                  <Search size={16} />
                  SEO
                </TabsTrigger>
                <TabsTrigger value="social" className="gap-2">
                  <Share2 size={16} />
                  Social Media
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings size={16} />
                  Instellingen
                </TabsTrigger>
              </TabsList>

              {/* Editor Tab */}
              <TabsContent value="editor" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Artikel Inhoud</CardTitle>
                    <CardDescription>Schrijf je artikel met de rich text editor</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titel *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={handleTitleChange}
                        placeholder="De toekomst van AI in de welzijnssector"
                        required
                        className="text-2xl font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm">/blog/</span>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData({ ...formData, slug: e.target.value })
                          }
                          placeholder="toekomst-ai-welzijn"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt">Samenvatting</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) =>
                          setFormData({ ...formData, excerpt: e.target.value })
                        }
                        placeholder="Een korte, pakkende samenvatting van 2-3 zinnen..."
                        rows={3}
                      />
                      <p className="text-xs text-slate-500">
                        Deze tekst wordt getoond in overzichten en social media previews
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Artikel Content *</Label>
                      <RichTextEditor
                        content={formData.content}
                        onChange={(html) => setFormData({ ...formData, content: html })}
                        placeholder="Start met schrijven of gebruik de AI generator..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Optimalisatie</CardTitle>
                    <CardDescription>Optimaliseer je artikel voor zoekmachines</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seoTitle">SEO Titel</Label>
                      <Input
                        id="seoTitle"
                        value={formData.seoTitle}
                        onChange={(e) =>
                          setFormData({ ...formData, seoTitle: e.target.value })
                        }
                        placeholder="Titel zoals deze verschijnt in Google"
                        maxLength={60}
                      />
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Max 60 karakters voor optimale weergave</span>
                        <span className={formData.seoTitle.length > 60 ? 'text-red-500' : 'text-slate-500'}>
                          {formData.seoTitle.length}/60
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seoDescription">SEO Beschrijving</Label>
                      <Textarea
                        id="seoDescription"
                        value={formData.seoDescription}
                        onChange={(e) =>
                          setFormData({ ...formData, seoDescription: e.target.value })
                        }
                        placeholder="Meta beschrijving voor zoekmachines..."
                        rows={3}
                        maxLength={160}
                      />
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Max 160 karakters voor optimale weergave</span>
                        <span className={formData.seoDescription.length > 160 ? 'text-red-500' : 'text-slate-500'}>
                          {formData.seoDescription.length}/160
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seoKeywords">Keywords / Tags</Label>
                      <Input
                        id="seoKeywords"
                        value={formData.seoKeywords}
                        onChange={(e) =>
                          setFormData({ ...formData, seoKeywords: e.target.value })
                        }
                        placeholder="ai, impact, strategie, technologie"
                      />
                      <p className="text-xs text-slate-500">
                        Komma-gescheiden keywords (5-8 aanbevolen)
                      </p>
                    </div>

                    {/* Google Preview */}
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <p className="text-xs text-slate-500 mb-2">Google Preview:</p>
                      <div className="space-y-1">
                        <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                          {formData.seoTitle || formData.title || 'Titel van je artikel'}
                        </div>
                        <div className="text-green-700 text-sm">
                          https://weareimpact.nl/blog/{formData.slug || 'url-slug'}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {formData.seoDescription || formData.excerpt || 'Meta beschrijving verschijnt hier...'}
                        </div>
                      </div>
                    </div>

                    {/* Suggested Internal Links */}
                    {suggestedLinks.length > 0 && (
                      <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Link2 className="text-purple-600" size={18} />
                          <p className="font-semibold text-purple-900">Gesuggereerde Interne Links</p>
                        </div>
                        <p className="text-xs text-purple-700 mb-3">
                          Kopieer deze links handmatig naar je tekst voor betere SEO:
                        </p>
                        <div className="space-y-3">
                          {suggestedLinks.map((link, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-purple-100">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900">
                                    &ldquo;{link.anchorText}&rdquo;
                                  </p>
                                  <a
                                    href={`https://weareimpact.nl${link.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-purple-600 hover:underline flex items-center gap-1 mt-1"
                                  >
                                    {link.url}
                                    <ExternalLink size={10} />
                                  </a>
                                  <p className="text-xs text-slate-500 mt-1">{link.reason}</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="shrink-0"
                                  onClick={() => {
                                    const linkHtml = `<a href="https://weareimpact.nl${link.url}">${link.anchorText}</a>`;
                                    navigator.clipboard.writeText(linkHtml);
                                    alert('Link HTML gekopieerd!');
                                  }}
                                >
                                  Kopieer
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Media Tab */}
              <TabsContent value="social" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Posts</CardTitle>
                    <CardDescription>Bereid je social media posts voor</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="socialInstagram">Instagram Post</Label>
                      <Textarea
                        id="socialInstagram"
                        value={formData.socialInstagram}
                        onChange={(e) =>
                          setFormData({ ...formData, socialInstagram: e.target.value })
                        }
                        placeholder="Pakkende Instagram post met hashtags... #AI #Impact"
                        rows={3}
                        maxLength={150}
                      />
                      <p className="text-xs text-slate-500">
                        {formData.socialInstagram.length}/150 karakters - Gebruik 3-5 hashtags
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="socialFacebook">Facebook Post</Label>
                      <Textarea
                        id="socialFacebook"
                        value={formData.socialFacebook}
                        onChange={(e) =>
                          setFormData({ ...formData, socialFacebook: e.target.value })
                        }
                        placeholder="Engaging Facebook post..."
                        rows={3}
                        maxLength={250}
                      />
                      <p className="text-xs text-slate-500">
                        {formData.socialFacebook.length}/250 karakters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="socialLinkedIn">LinkedIn Post</Label>
                      <Textarea
                        id="socialLinkedIn"
                        value={formData.socialLinkedIn}
                        onChange={(e) =>
                          setFormData({ ...formData, socialLinkedIn: e.target.value })
                        }
                        placeholder="Professionele LinkedIn post..."
                        rows={3}
                        maxLength={200}
                      />
                      <p className="text-xs text-slate-500">
                        {formData.socialLinkedIn.length}/200 karakters - Professionele toon
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="socialTwitter">Twitter / X Post</Label>
                      <Textarea
                        id="socialTwitter"
                        value={formData.socialTwitter}
                        onChange={(e) =>
                          setFormData({ ...formData, socialTwitter: e.target.value })
                        }
                        placeholder="Korte, krachtige tweet..."
                        rows={2}
                        maxLength={280}
                      />
                      <p className="text-xs text-slate-500">
                        {formData.socialTwitter.length}/280 karakters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imagePrompt">AI Image Prompt</Label>
                      <Textarea
                        id="imagePrompt"
                        value={formData.imagePrompt}
                        onChange={(e) =>
                          setFormData({ ...formData, imagePrompt: e.target.value })
                        }
                        placeholder="Midjourney/DALL-E prompt voor header afbeelding..."
                        rows={3}
                      />
                      <p className="text-xs text-slate-500">
                        Gebruik dit voor het genereren van een passende header afbeelding
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Artikel Instellingen</CardTitle>
                    <CardDescription>Categorisatie en publicatie instellingen</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="category">Categorie *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer categorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ai">AI</SelectItem>
                            <SelectItem value="impact">Impact</SelectItem>
                            <SelectItem value="strategie">Strategie</SelectItem>
                            <SelectItem value="nieuws">Nieuws</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) =>
                            setFormData({ ...formData, tags: e.target.value })
                          }
                          placeholder="ai, welzijn, technologie"
                        />
                        <p className="text-xs text-slate-500">Komma-gescheiden</p>
                      </div>
                    </div>

                    {/* Header Type Selection */}
                    <div className="space-y-4 border-t pt-4">
                      <Label>Header Afbeelding</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={formData.headerType === 'image' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFormData({ ...formData, headerType: 'image' })}
                          className={formData.headerType === 'image' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                        >
                          <Upload size={16} className="mr-2" />
                          Afbeelding
                        </Button>
                        <Button
                          type="button"
                          variant={formData.headerType === 'color' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFormData({ ...formData, headerType: 'color' })}
                          className={formData.headerType === 'color' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                        >
                          <Type size={16} className="mr-2" />
                          Kleur + Titel
                        </Button>
                      </div>

                      {/* Image Upload Option */}
                      {formData.headerType === 'image' && (
                        <div className="space-y-3">
                          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-orange-400 transition-colors">
                            {formData.coverImage ? (
                              <div className="relative">
                                <img
                                  src={formData.coverImage}
                                  alt="Cover preview"
                                  className="w-full h-48 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Invalid+Image';
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => setFormData({ ...formData, coverImage: '' })}
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                                {isUploading ? (
                                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                                ) : (
                                  <>
                                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="text-sm text-slate-500">
                                      Klik om afbeelding te uploaden
                                    </span>
                                    <span className="text-xs text-slate-400 mt-1">
                                      JPG, PNG, WebP (max 5MB)
                                    </span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  disabled={isUploading}
                                />
                              </label>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>of plak een URL:</span>
                          </div>
                          <Input
                            id="coverImage"
                            value={formData.coverImage}
                            onChange={(e) =>
                              setFormData({ ...formData, coverImage: e.target.value })
                            }
                            placeholder="https://..."
                          />
                          <div className="space-y-2">
                            <Label htmlFor="coverImageAlt">Alt tekst (SEO)</Label>
                            <Input
                              id="coverImageAlt"
                              value={formData.coverImageAlt}
                              onChange={(e) =>
                                setFormData({ ...formData, coverImageAlt: e.target.value })
                              }
                              placeholder="Beschrijvende alt tekst..."
                            />
                          </div>
                        </div>
                      )}

                      {/* Color Background Option */}
                      {formData.headerType === 'color' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Achtergrondkleur</Label>
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, headerColor: 'orange' })}
                                className={`flex-1 h-16 rounded-lg border-2 transition-all ${
                                  formData.headerColor === 'orange'
                                    ? 'border-orange-600 ring-2 ring-orange-600 ring-offset-2'
                                    : 'border-slate-200 hover:border-orange-300'
                                }`}
                                style={{ backgroundColor: '#fb923c' }}
                              >
                                <span className="text-white font-semibold text-sm">Oranje</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, headerColor: 'slate' })}
                                className={`flex-1 h-16 rounded-lg border-2 transition-all ${
                                  formData.headerColor === 'slate'
                                    ? 'border-slate-600 ring-2 ring-slate-600 ring-offset-2'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                                style={{ backgroundColor: '#0f172a' }}
                              >
                                <span className="text-white font-semibold text-sm">Donkerblauw</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="headerTitle">Header Titel</Label>
                            <Input
                              id="headerTitle"
                              value={formData.headerTitle}
                              onChange={(e) =>
                                setFormData({ ...formData, headerTitle: e.target.value })
                              }
                              placeholder="Eigen titel voor de header..."
                            />
                            <p className="text-xs text-slate-500">
                              Laat leeg om de artikel titel te gebruiken
                            </p>
                          </div>

                          {/* Preview */}
                          <div className="space-y-2">
                            <Label>Preview</Label>
                            <div
                              className="w-full h-32 rounded-lg flex items-center justify-center px-4"
                              style={{
                                backgroundColor: formData.headerColor === 'orange' ? '#fb923c' : '#0f172a',
                              }}
                            >
                              <span className="text-white font-bold text-xl text-center">
                                {formData.headerTitle || formData.title || 'Artikel Titel'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Podcast / Audio */}
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center gap-2">
                        <Headphones size={18} className="text-orange-600" />
                        <Label>Podcast (audio)</Label>
                      </div>
                      <p className="text-xs text-slate-500 -mt-2">
                        Upload de NotebookLM-aflevering (.m4a). Voeg een transcript toe voor extra SEO — die tekst wordt geïndexeerd.
                      </p>

                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-orange-400 transition-colors">
                        {formData.audioUrl ? (
                          <div className="space-y-3">
                            <audio controls src={formData.audioUrl} className="w-full" />
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 truncate">
                                {formData.audioDuration
                                  ? `${Math.floor(formData.audioDuration / 60)}:${(formData.audioDuration % 60).toString().padStart(2, '0')} min`
                                  : 'Audio geüpload'}
                              </span>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => setFormData({ ...formData, audioUrl: '', audioDuration: 0 })}
                              >
                                <X size={16} className="mr-1" /> Verwijder
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-28 cursor-pointer">
                            {isUploadingAudio ? (
                              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                            ) : (
                              <>
                                <Headphones className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-sm text-slate-500">Klik om podcast te uploaden</span>
                                <span className="text-xs text-slate-400 mt-1">M4A, MP3, WAV (max 150MB)</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="audio/mp4,audio/x-m4a,audio/aac,audio/mpeg,audio/wav,.m4a,.mp3,.wav"
                              onChange={handleAudioUpload}
                              className="hidden"
                              disabled={isUploadingAudio}
                            />
                          </label>
                        )}
                      </div>

                      {formData.audioUrl && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="audioTitle">Aflevering titel</Label>
                            <Input
                              id="audioTitle"
                              value={formData.audioTitle}
                              onChange={(e) => setFormData({ ...formData, audioTitle: e.target.value })}
                              placeholder="Titel van de podcast-aflevering"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="transcript" className="flex items-center gap-2">
                              <FileTextIcon size={16} />
                              Transcript (SEO)
                            </Label>
                            <Textarea
                              id="transcript"
                              value={formData.transcript}
                              onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                              placeholder="Plak hier het transcript van het gesprek. Deze tekst is uniek t.o.v. het artikel en wordt door Google geïndexeerd."
                              rows={6}
                            />
                            <p className="text-xs text-slate-500">
                              {formData.transcript.length} tekens — hoe completer, hoe meer indexeerbare content.
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="published">Direct Publiceren</Label>
                          <p className="text-sm text-slate-500">
                            Anders wordt het opgeslagen als concept
                          </p>
                        </div>
                        <Switch
                          id="published"
                          checked={formData.published}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, published: checked })
                          }
                        />
                      </div>

                      {/* Publicatiedatum */}
                      <div className="space-y-2">
                        <Label htmlFor="publishedAt" className="flex items-center gap-2">
                          <Calendar size={16} />
                          Publicatiedatum
                        </Label>
                        <Input
                          id="publishedAt"
                          type="datetime-local"
                          value={formData.publishedAt}
                          onChange={(e) =>
                            setFormData({ ...formData, publishedAt: e.target.value })
                          }
                        />
                        <p className="text-xs text-slate-500">
                          Laat leeg om de huidige datum te gebruiken bij publicatie
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/blog')}
              >
                Annuleren
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <Loader2 size={18} className="mr-2 animate-spin" />
                ) : (
                  <Save size={18} className="mr-2" />
                )}
                {formData.published ? 'Publiceren' : 'Opslaan als Concept'}
              </Button>
            </div>
          </form>
        </div>

        {/* AI Optimizer Sidebar */}
        {showAIPanel && (
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-orange-600" size={20} />
                    <CardTitle>✨ SEO Wereldklasse</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIPanel(false)}
                  >
                    {showAIPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                </div>
                <CardDescription>
                  Plak je tekst en AI maakt het SEO wereldklasse
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rawTitle">Titel (optioneel)</Label>
                  <Input
                    id="rawTitle"
                    value={rawContent.title}
                    onChange={(e) =>
                      setRawContent({ ...rawContent, title: e.target.value })
                    }
                    placeholder="Titel van je artikel..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rawContent">Plak je tekst hier *</Label>
                  <Textarea
                    id="rawContent"
                    value={rawContent.content}
                    onChange={(e) =>
                      setRawContent({ ...rawContent, content: e.target.value })
                    }
                    placeholder="Plak hier je ruwe blog tekst (minimaal 100 karakters)..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    {rawContent.content.length} karakters
                    {rawContent.content.length < 100 && ` (minimaal 100 nodig)`}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2">AI doet automatisch:</h4>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>✓ H1, H2, H3 structuur</li>
                    <li>✓ Interne links toevoegen</li>
                    <li>✓ SEO optimalisatie</li>
                    <li>✓ Keywords identificeren</li>
                    <li>✓ Social media posts</li>
                    <li>✓ Categorie bepalen</li>
                    <li>✓ Metadata genereren</li>
                  </ul>
                </div>

                <Button
                  type="button"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={handleAIOptimize}
                  disabled={isGenerating || rawContent.content.length < 100}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Optimaliseren...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="mr-2" />
                      AI Optimaliseren
                    </>
                  )}
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  AI transformeert je tekst naar SEO wereldklasse en vult alle velden in
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
