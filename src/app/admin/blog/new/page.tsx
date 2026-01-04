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
  ChevronUp
} from 'lucide-react';
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
    published: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    socialInstagram: '',
    socialFacebook: '',
    socialLinkedIn: '',
    socialTwitter: '',
    imagePrompt: '',
  });

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
        }),
      });

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        alert('Er ging iets fout bij het opslaan');
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

                    <div className="space-y-2">
                      <Label htmlFor="coverImage">Cover Image URL</Label>
                      <Input
                        id="coverImage"
                        value={formData.coverImage}
                        onChange={(e) =>
                          setFormData({ ...formData, coverImage: e.target.value })
                        }
                        placeholder="https://..."
                      />
                      {formData.coverImage && (
                        <div className="mt-2 border rounded-lg overflow-hidden">
                          <img
                            src={formData.coverImage}
                            alt="Cover preview"
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coverImageAlt">Cover Image Alt Text (SEO)</Label>
                      <Input
                        id="coverImageAlt"
                        value={formData.coverImageAlt}
                        onChange={(e) =>
                          setFormData({ ...formData, coverImageAlt: e.target.value })
                        }
                        placeholder="Beschrijvende alt tekst voor SEO..."
                        maxLength={125}
                      />
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">
                          Alt tekst voor SEO en accessibility (max 125 karakters)
                        </span>
                        <span className={formData.coverImageAlt.length > 125 ? 'text-red-500' : 'text-slate-500'}>
                          {formData.coverImageAlt.length}/125
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
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
