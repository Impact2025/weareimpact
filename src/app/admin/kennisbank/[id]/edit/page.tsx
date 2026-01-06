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
  Upload,
  X,
  Calendar,
  Type,
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
  const [isUploading, setIsUploading] = useState(false);
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
    header_type: 'image' as 'image' | 'color',
    header_color: 'orange' as 'orange' | 'slate',
    header_title: '',
    difficulty: 'beginner',
    status: 'draft',
    published_at: '',
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
        // Format published_at for datetime-local input
        let publishedAt = '';
        if (article.published_at) {
          const date = new Date(article.published_at);
          publishedAt = date.toISOString().slice(0, 16);
        }
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
          header_type: article.header_type || 'image',
          header_color: article.header_color || 'orange',
          header_title: article.header_title || '',
          difficulty: article.difficulty || 'beginner',
          status: article.status || 'draft',
          published_at: publishedAt,
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

      setFormData({ ...formData, featured_image: result.url });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Er ging iets fout bij het uploaden');
    } finally {
      setIsUploading(false);
    }
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
          published_at: formData.published_at || undefined,
          header_type: formData.header_type,
          header_color: formData.header_color,
          header_title: formData.header_title,
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

                {/* Header Type Selection */}
                <div className="space-y-4 border-t pt-4">
                  <Label>Header Afbeelding</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.header_type === 'image' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, header_type: 'image' })}
                      className={formData.header_type === 'image' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                    >
                      <Upload size={16} className="mr-2" />
                      Afbeelding
                    </Button>
                    <Button
                      type="button"
                      variant={formData.header_type === 'color' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, header_type: 'color' })}
                      className={formData.header_type === 'color' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                    >
                      <Type size={16} className="mr-2" />
                      Kleur + Titel
                    </Button>
                  </div>

                  {/* Image Upload Option */}
                  {formData.header_type === 'image' && (
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-orange-400 transition-colors">
                        {formData.featured_image ? (
                          <div className="relative">
                            <img
                              src={formData.featured_image}
                              alt="Featured preview"
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
                              onClick={() => setFormData({ ...formData, featured_image: '' })}
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
                        id="featured_image"
                        value={formData.featured_image}
                        onChange={(e) =>
                          setFormData({ ...formData, featured_image: e.target.value })
                        }
                        placeholder="https://..."
                      />
                      <div className="space-y-2">
                        <Label htmlFor="featured_image_alt">Alt tekst (SEO)</Label>
                        <Input
                          id="featured_image_alt"
                          value={formData.featured_image_alt}
                          onChange={(e) =>
                            setFormData({ ...formData, featured_image_alt: e.target.value })
                          }
                          placeholder="Beschrijvende alt tekst..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Color Background Option */}
                  {formData.header_type === 'color' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Achtergrondkleur</Label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, header_color: 'orange' })}
                            className={`flex-1 h-16 rounded-lg border-2 transition-all ${
                              formData.header_color === 'orange'
                                ? 'border-orange-600 ring-2 ring-orange-600 ring-offset-2'
                                : 'border-slate-200 hover:border-orange-300'
                            }`}
                            style={{ backgroundColor: '#fb923c' }}
                          >
                            <span className="text-white font-semibold text-sm">Oranje</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, header_color: 'slate' })}
                            className={`flex-1 h-16 rounded-lg border-2 transition-all ${
                              formData.header_color === 'slate'
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
                        <Label htmlFor="header_title">Header Titel</Label>
                        <Input
                          id="header_title"
                          value={formData.header_title}
                          onChange={(e) =>
                            setFormData({ ...formData, header_title: e.target.value })
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
                            backgroundColor: formData.header_color === 'orange' ? '#fb923c' : '#0f172a',
                          }}
                        >
                          <span className="text-white font-bold text-xl text-center">
                            {formData.header_title || formData.title || 'Artikel Titel'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-4">
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

                  {/* Publicatiedatum */}
                  <div className="space-y-2">
                    <Label htmlFor="published_at" className="flex items-center gap-2">
                      <Calendar size={16} />
                      Publicatiedatum
                    </Label>
                    <Input
                      id="published_at"
                      type="datetime-local"
                      value={formData.published_at}
                      onChange={(e) =>
                        setFormData({ ...formData, published_at: e.target.value })
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
