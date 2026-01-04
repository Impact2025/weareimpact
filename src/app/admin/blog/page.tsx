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

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  published_at: string | null;
  created_at: string;
  views: number;
}

const categoryColors: Record<string, string> = {
  ai: 'bg-blue-100 text-blue-700',
  impact: 'bg-green-100 text-green-700',
  strategie: 'bg-purple-100 text-purple-700',
  nieuws: 'bg-orange-100 text-orange-700',
};

export default function AdminBlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      // Fetch both published and draft posts for admin dashboard
      const [publishedRes, draftRes] = await Promise.all([
        fetch('/api/blog?status=published'),
        fetch('/api/blog?status=draft')
      ]);

      let allPosts: BlogPost[] = [];

      if (publishedRes.ok) {
        const data = await publishedRes.json();
        allPosts = [...allPosts, ...(data.posts || [])];
      }

      if (draftRes.ok) {
        const data = await draftRes.json();
        allPosts = [...allPosts, ...(data.posts || [])];
      }

      // Sort by created_at, newest first
      allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Weet je zeker dat je dit artikel wilt verwijderen?')) {
      return;
    }

    setIsDeleting(postId);
    try {
      const response = await fetch('/api/blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId }),
      });

      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== postId));
      } else {
        alert('Fout bij het verwijderen van het artikel');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Fout bij het verwijderen van het artikel');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    setIsToggling(post.id);
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      const response = await fetch('/api/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: post.id,
          status: newStatus,
        }),
      });

      if (response.ok) {
        setPosts(
          posts.map((p) =>
            p.id === post.id
              ? { ...p, status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null }
              : p
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

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Blog Posts</h1>
          <p className="text-slate-500 mt-1">
            Beheer je artikelen en publicaties
          </p>
        </div>
        <Button asChild className="bg-orange-600 hover:bg-orange-700">
          <Link href="/admin/blog/new">
            <Plus size={18} className="mr-2" />
            Nieuwe Post
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Totaal Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
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

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Zoek posts..."
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
                    <TableHead>Status</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium max-w-md">
                        <div className="truncate">{post.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={categoryColors[post.category] || 'bg-gray-100 text-gray-700'}>
                          {post.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            post.status === 'published' ? 'default' : 'secondary'
                          }
                          className={
                            post.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {post.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {post.published_at ? (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar size={14} />
                            {new Date(post.published_at).toLocaleDateString('nl-NL')}
                          </div>
                        ) : post.created_at ? (
                          <div className="flex items-center gap-1 text-slate-400">
                            <Calendar size={14} />
                            {new Date(post.created_at).toLocaleDateString('nl-NL')}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{post.views || 0}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/blog/${post.slug}`} target="_blank">
                                <Eye size={14} className="mr-2" />
                                Bekijken
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/blog/${post.id}/edit`}>
                                <Edit size={14} className="mr-2" />
                                Bewerken
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleTogglePublish(post)}
                              disabled={isToggling === post.id}
                            >
                              {isToggling === post.id ? (
                                <Loader2 size={14} className="mr-2 animate-spin" />
                              ) : post.status === 'published' ? (
                                <XCircle size={14} className="mr-2" />
                              ) : (
                                <CheckCircle size={14} className="mr-2" />
                              )}
                              {post.status === 'published' ? 'Unpublish' : 'Publiceren'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(post.id)}
                              disabled={isDeleting === post.id}
                              className="text-red-600"
                            >
                              {isDeleting === post.id ? (
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
                  ))}
                </TableBody>
              </Table>

              {filteredPosts.length === 0 && !isLoading && (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-lg font-medium">Geen posts gevonden</p>
                  <p className="text-sm mt-1">
                    {searchQuery
                      ? 'Probeer een andere zoekopdracht'
                      : 'Maak je eerste blog post aan'}
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
