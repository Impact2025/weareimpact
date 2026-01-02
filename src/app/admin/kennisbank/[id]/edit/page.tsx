'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Sparkles,
  FileText,
  Search,
  Settings,
  HelpCircle,
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

type TabType = 'editor' | 'seo' | 'faq' | 'settings';

interface FAQItem {
  question: string;
  answer: string;
}

export default function EditKennisbankArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('editor');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    excerpt: '',
    content: '',
    category_slug: '',
    tags: '',
    featured_image: '',
    featured_image_alt: '',
    difficulty: 'beginner',
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    faqItems: [] as FAQItem[],
    leadMagnetTitle: '',
    leadMagnetDescription: '',
    leadMagnetType: '',
  });

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      const response = await fetch(`/api/admin/kennisbank/${id}`);
      if (response.ok) {
        const article = await response.json();
        setFormData({
          title: article.title || '',
          slug: article.slug || '',
          subtitle: article.subtitle || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          category_slug: article.category_slug || '',
          tags: article.tags?.join(', ') || '',
          featured_image: article.featured_image || '',
          featured_image_alt: article.featured_image_alt || '',
          difficulty: article.difficulty || 'beginner',
          status: article.status || 'draft',
          seoTitle: article.seo_title || '',
          seoDescription: article.seo_description || '',
          seoKeywords: article.seo_keywords?.join(', ') || '',
          faqItems: article.faq_items || [],
          leadMagnetTitle: article.lead_magnet_title || '',
          leadMagnetDescription: article.lead_magnet_description || '',
          leadMagnetType: article.lead_magnet_type || '',
        });
      } else {
        alert('Artikel niet gevonden');
        router.push('/admin/kennisbank');
      }
    } catch (error) {
      console.error('Error loading article:', error);
      alert('Fout bij het laden van het artikel');
    } finally {
      setIsFetching(false);
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
      seoTitle: formData.seoTitle || title.slice(0, 60),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/kennisbank/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          seo_title: formData.seoTitle,
          seo_description: formData.seoDescription,
          seo_keywords: formData.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean),
          faq_items: formData.faqItems,
          lead_magnet_title: formData.leadMagnetTitle,
          lead_magnet_description: formData.leadMagnetDescription,
          lead_magnet_type: formData.leadMagnetType,
        }),
      });

      if (response.ok) {
        router.push('/admin/kennisbank');
      } else {
        const error = await response.json();
        alert(error.error || 'Er ging iets fout bij het opslaan');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Er ging iets fout bij het opslaan');
    } finally {
      setIsLoading(false);
    }
  };

  const addFaqItem = () => {
    setFormData({
      ...formData,
      faqItems: [...formData.faqItems, { question: '', answer: '' }],
    });
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqItems = [...formData.faqItems];
    newFaqItems[index][field] = value;
    setFormData({ ...formData, faqItems: newFaqItems });
  };

  const removeFaqItem = (index: number) => {
    setFormData({
      ...formData,
      faqItems: formData.faqItems.filter((_, i) => i !== index),
    });
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
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
            href="/admin/kennisbank"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Artikel Bewerken</h1>
            <p className="text-slate-500 mt-1 truncate max-w-md">{formData.title}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(`/kennisbank/${formData.slug}`, '_blank')}
            disabled={!formData.slug}
          >
            <Eye size={18} className="mr-2" />
            Preview
          </Button>
        </div>
      </div>

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
            <TabsTrigger value="faq" className="gap-2">
              <HelpCircle size={16} />
              FAQ
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
                <CardDescription>Bewerk je kennisartikel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    required
                    className="text-xl font-bold"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-sm">/kennisbank/</span>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Ondertitel</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Samenvatting *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Artikel Content (Markdown) *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={20}
                    className="font-mono text-sm"
                    required
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
                    maxLength={60}
                  />
                  <p className="text-xs text-slate-500">{formData.seoTitle.length}/60</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Beschrijving</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, seoDescription: e.target.value })
                    }
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-slate-500">{formData.seoDescription.length}/160</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">Keywords</Label>
                  <Input
                    id="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={(e) =>
                      setFormData({ ...formData, seoKeywords: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Veelgestelde Vragen (FAQ)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.faqItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <Label>Vraag {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFaqItem(index)}
                        className="text-red-500"
                      >
                        Verwijderen
                      </Button>
                    </div>
                    <Input
                      value={item.question}
                      onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                    />
                    <Textarea
                      value={item.answer}
                      onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                      rows={3}
                    />
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addFaqItem} className="w-full">
                  <HelpCircle size={16} className="mr-2" />
                  FAQ Item Toevoegen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Magnet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leadMagnetTitle">Titel</Label>
                  <Input
                    id="leadMagnetTitle"
                    value={formData.leadMagnetTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, leadMagnetTitle: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadMagnetDescription">Beschrijving</Label>
                  <Textarea
                    id="leadMagnetDescription"
                    value={formData.leadMagnetDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, leadMagnetDescription: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadMagnetType">Type</Label>
                  <Select
                    value={formData.leadMagnetType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, leadMagnetType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="checklist">Checklist</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Artikel Instellingen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categorie *</Label>
                    <Select
                      value={formData.category_slug}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category_slug: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer categorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sociaal-ondernemen">Sociaal Ondernemen</SelectItem>
                        <SelectItem value="ai-tech">AI & Technologie</SelectItem>
                        <SelectItem value="vrijwilligers">Vrijwilligersmanagement</SelectItem>
                        <SelectItem value="impact-meten">Impact Meten</SelectItem>
                        <SelectItem value="subsidie-funding">Subsidie & Funding</SelectItem>
                        <SelectItem value="lego-serious-play">LEGO Serious Play</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Moeilijkheidsgraad</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) =>
                        setFormData({ ...formData, difficulty: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Gemiddeld</SelectItem>
                        <SelectItem value="advanced">Gevorderd</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image}
                    onChange={(e) =>
                      setFormData({ ...formData, featured_image: e.target.value })
                    }
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="published">Gepubliceerd</Label>
                      <p className="text-sm text-slate-500">Status van het artikel</p>
                    </div>
                    <Switch
                      id="published"
                      checked={formData.status === 'published'}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, status: checked ? 'published' : 'draft' })
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
            onClick={() => router.push('/admin/kennisbank')}
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
            Opslaan
          </Button>
        </div>
      </form>
    </div>
  );
}
