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
  CheckCircle,
  XCircle,
  BookOpen,
  Brain,
  Target,
  Users,
  Blocks,
  DollarSign,
  RefreshCw,
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

interface KBArticle {
  id: string;
  title: string;
  slug: string;
  category_slug: string;
  status: string;
  difficulty: string;
  published_at: string | null;
  created_at: string;
  views: number;
  reading_time: number;
}

const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  'sociaal-ondernemen': { label: 'Sociaal Ondernemen', color: 'bg-orange-100 text-orange-700', icon: BookOpen },
  'ai-tech': { label: 'AI & Tech', color: 'bg-blue-100 text-blue-700', icon: Brain },
  'vrijwilligers': { label: 'Vrijwilligers', color: 'bg-green-100 text-green-700', icon: Users },
  'impact-meten': { label: 'Impact Meten', color: 'bg-purple-100 text-purple-700', icon: Target },
  'subsidie-funding': { label: 'Subsidie & Funding', color: 'bg-yellow-100 text-yellow-700', icon: DollarSign },
  'lego-serious-play': { label: 'LEGO Serious Play', color: 'bg-red-100 text-red-700', icon: Blocks },
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-50 text-green-600',
  intermediate: 'bg-yellow-50 text-yellow-600',
  advanced: 'bg-red-50 text-red-600',
};

export default function AdminKennisbankPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const response = await fetch('/api/admin/kennisbank');
      if (response.ok) {
        const data = await response.json();
        setArticles(data || []);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Weet je zeker dat je dit artikel wilt verwijderen?')) {
      return;
    }

    setIsDeleting(slug);
    try {
      const response = await fetch(`/api/kennisbank/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArticles(articles.filter((a) => a.slug !== slug));
      } else {
        alert('Fout bij het verwijderen van het artikel');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Fout bij het verwijderen van het artikel');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSyncMarkdown = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch('/api/admin/kennisbank/sync-markdown', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setSyncResult(`Gesynchroniseerd: ${data.inserted} nieuw, ${data.skipped} al aanwezig${data.errors > 0 ? `, ${data.errors} fouten` : ''}`);
        await loadArticles();
      } else {
        setSyncResult('Fout bij synchroniseren');
      }
    } catch {
      setSyncResult('Fout bij synchroniseren');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTogglePublish = async (article: KBArticle) => {
    setIsToggling(article.id);
    try {
      const newStatus = article.status === 'published' ? 'draft' : 'published';
      const response = await fetch(`/api/kennisbank/${article.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        setArticles(
          articles.map((a) =>
            a.id === article.id
              ? { ...a, status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null }
              : a
          )
        );
      } else {
        alert('Fout bij het updaten van de status');
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Fout bij het updaten van de status');
    } finally {
      setIsToggling(null);
    }
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const totalViews = articles.reduce((acc, a) => acc + (a.views || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kennisbank</h1>
          <p className="text-slate-500 mt-1">
            Beheer kennisartikelen, gidsen en stappenplannen
          </p>
        </div>
        <div className="flex items-center gap-2">
          {syncResult && (
            <span className="text-sm text-slate-600">{syncResult}</span>
          )}
          <Button
            variant="outline"
            onClick={handleSyncMarkdown}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <RefreshCw size={18} className="mr-2" />
            )}
            Sync markdown
          </Button>
          <Button asChild className="bg-orange-600 hover:bg-orange-700">
            <Link href="/admin/kennisbank/new">
              <Plus size={18} className="mr-2" />
              Nieuw Artikel
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Totaal Artikelen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Gepubliceerd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {publishedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Concepten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {draftCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Totaal Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Zoek artikelen..."
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
                    <TableHead>Titel</TableHead>
                    <TableHead>Categorie</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => {
                    const catConfig = categoryConfig[article.category_slug] || {
                      label: article.category_slug,
                      color: 'bg-gray-100 text-gray-700',
                      icon: BookOpen,
                    };
                    const CategoryIcon = catConfig.icon;

                    return (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium max-w-md">
                          <div className="truncate">{article.title}</div>
                          <div className="text-xs text-slate-400">{article.reading_time} min leestijd</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${catConfig.color} gap-1`}>
                            <CategoryIcon size={12} />
                            {catConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={difficultyColors[article.difficulty] || 'bg-gray-50 text-gray-600'}>
                            {article.difficulty === 'beginner' ? 'Beginner' :
                             article.difficulty === 'intermediate' ? 'Gemiddeld' : 'Gevorderd'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              article.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {article.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {article.published_at ? (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Calendar size={14} />
                              {new Date(article.published_at).toLocaleDateString('nl-NL')}
                            </div>
                          ) : article.created_at ? (
                            <div className="flex items-center gap-1 text-slate-400">
                              <Calendar size={14} />
                              {new Date(article.created_at).toLocaleDateString('nl-NL')}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{article.views || 0}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/kennisbank/${article.slug}`} target="_blank">
                                  <Eye size={14} className="mr-2" />
                                  Bekijken
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/kennisbank/${article.id}/edit`}>
                                  <Edit size={14} className="mr-2" />
                                  Bewerken
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleTogglePublish(article)}
                                disabled={isToggling === article.id}
                              >
                                {isToggling === article.id ? (
                                  <Loader2 size={14} className="mr-2 animate-spin" />
                                ) : article.status === 'published' ? (
                                  <XCircle size={14} className="mr-2" />
                                ) : (
                                  <CheckCircle size={14} className="mr-2" />
                                )}
                                {article.status === 'published' ? 'Unpublish' : 'Publiceren'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(article.slug)}
                                disabled={isDeleting === article.slug}
                                className="text-red-600"
                              >
                                {isDeleting === article.slug ? (
                                  <Loader2 size={14} className="mr-2 animate-spin" />
                                ) : (
                                  <Trash2 size={14} className="mr-2" />
                                )}
                                Verwijderen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredArticles.length === 0 && !isLoading && (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-lg font-medium">Geen artikelen gevonden</p>
                  <p className="text-sm mt-1">
                    {searchQuery
                      ? 'Probeer een andere zoekopdracht'
                      : 'Maak je eerste kennisbank artikel aan'}
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
