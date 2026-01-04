'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [showAIPanel, setShowAIPanel] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    coverImage: '',
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

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const response = await fetch(`/api/blog?id=${postId}`);
      if (!response.ok) {
        throw new Error('Failed to load post');
      }

      const data = await response.json();
      const post = data.posts?.[0];

      if (post) {
        setFormData({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          category: post.category || '',
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
          coverImage: post.cover_image || '',
          published: post.status === 'published',
          seoTitle: post.seo_title || post.title || '',
          seoDescription: post.seo_description || post.excerpt || '',
          seoKeywords: '',
          socialInstagram: '',
          socialFacebook: '',
          socialLinkedIn: '',
          socialTwitter: '',
          imagePrompt: '',
        });
      }
    } catch (error) {
      console.error('Error loading post:', error);
      alert('Kon blog post niet laden');
    } finally {
      setIsLoadingData(false);
    }
  };

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

  const handleSEOOptimize = async () => {
    if (!formData.content || formData.content.trim().length < 100) {
      alert('Voeg eerst inhoud toe (minimaal 100 karakters)');
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await fetch('/api/admin/blog/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: formData.content,
          title: formData.title,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Optimalisatie mislukt');
      }

      const result = await response.json();
      const { data } = result;

      // Update form with optimized content
      setFormData({
        ...formData,
        content: data.content,
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
      });

      alert('✨ Content succesvol geoptimaliseerd met HTML structuur!');
    } catch (error) {
      console.error('Error optimizing content:', error);
      alert('Er ging iets fout bij het optimaliseren: ' + (error instanceof Error ? error.message : ''));
    } finally {
      setIsOptimizing(false);
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

      if (!response.ok) {
        throw new Error('AI generatie mislukt');
      }

      const result = await response.json();
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
      alert('Er ging iets fout bij het genereren van content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: postId,
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

  if (isLoadingData) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-slate-900">Bewerk Blog Post</h1>
            <p className="text-slate-500 mt-1">Update je artikel of laat AI nieuwe content genereren</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleSEOOptimize}
            disabled={isOptimizing || !formData.content}
            className="border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            {isOptimizing ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <Sparkles size={18} className="mr-2" />
            )}
            {isOptimizing ? 'Optimaliseren...' : 'SEO Optimaliseren'}
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowAIPanel(!showAIPanel)}>
            <Sparkles size={18} className="mr-2" />
            AI Generator
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
                    <CardDescription>Bewerk je artikel met de rich text editor</CardDescription>
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
                Wijzigingen Opslaan
              </Button>
            </div>
          </form>
        </div>

        {/* AI Generator Sidebar */}
        {showAIPanel && (
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-orange-600" size={20} />
                    <CardTitle>AI Blog Generator</CardTitle>
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
                  Laat AI nieuwe content genereren (overschrijft huidige tekst)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aiKeyword">Primair Keyword *</Label>
                  <Input
                    id="aiKeyword"
                    value={aiFormData.keyword}
                    onChange={(e) =>
                      setAIFormData({ ...aiFormData, keyword: e.target.value })
                    }
                    placeholder="AI in de zorg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiCategory">Categorie</Label>
                  <Select
                    value={aiFormData.category}
                    onValueChange={(value) =>
                      setAIFormData({ ...aiFormData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="aiAudience">Doelgroep</Label>
                  <Input
                    id="aiAudience"
                    value={aiFormData.audience}
                    onChange={(e) =>
                      setAIFormData({ ...aiFormData, audience: e.target.value })
                    }
                    placeholder="professionals in de zorg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiTone">Tone of Voice</Label>
                  <Select
                    value={aiFormData.tone}
                    onValueChange={(value) =>
                      setAIFormData({ ...aiFormData, tone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professioneel maar toegankelijk">
                        Professioneel maar toegankelijk
                      </SelectItem>
                      <SelectItem value="formeel">Formeel</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="inspirerend">Inspirerend</SelectItem>
                      <SelectItem value="educatief">Educatief</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiLength">Artikel Lengte</Label>
                  <Select
                    value={aiFormData.length}
                    onValueChange={(value: 'short' | 'medium' | 'long') =>
                      setAIFormData({ ...aiFormData, length: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Kort (500-800 woorden)</SelectItem>
                      <SelectItem value="medium">Gemiddeld (1000-1500 woorden)</SelectItem>
                      <SelectItem value="long">Lang (2000-3000 woorden)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={handleAIGenerate}
                  disabled={isGenerating || !aiFormData.keyword}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Genereren...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="mr-2" />
                      Genereer Nieuwe Content
                    </>
                  )}
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  Let op: Dit overschrijft de huidige content
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
