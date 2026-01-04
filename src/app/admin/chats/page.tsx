'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MessageSquare,
  Clock,
  User,
  ChevronRight,
  ChevronLeft,
  Download,
  Filter,
  Calendar,
  Bot,
  Trash2,
  Loader2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  visitorId: string;
  source: 'widget' | 'booking' | 'scan' | 'kennisbank';
  status: 'active' | 'completed';
  pageUrl?: string;
  device?: string;
  messageCount: number;
  preview: string;
  startedAt: string;
  endedAt: string | null;
  messages?: ChatMessage[];
}

interface ChatStats {
  total: number;
  active: number;
  today: number;
  avgMessages: number;
}

const sourceColors: Record<string, string> = {
  widget: 'bg-blue-100 text-blue-700',
  booking: 'bg-green-100 text-green-700',
  scan: 'bg-orange-100 text-orange-700',
  kennisbank: 'bg-purple-100 text-purple-700',
};

const sourceLabels: Record<string, string> = {
  widget: 'Chat Widget',
  booking: 'Boekingschat',
  scan: 'AI Scanner',
  kennisbank: 'Kennisbank',
};

const ITEMS_PER_PAGE = 20;

export default function AdminChatsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [stats, setStats] = useState<ChatStats>({ total: 0, active: 0, today: 0, avgMessages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<ChatSession | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: (page * ITEMS_PER_PAGE).toString(),
      });
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/chats?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setChats(data.sessions || []);
      setTotal(data.total || 0);
      setStats(data.stats || { total: 0, active: 0, today: 0, avgMessages: 0 });
    } catch (err) {
      setError('Kon chats niet laden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, sourceFilter, statusFilter]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const fetchChatDetails = async (chatId: string) => {
    setLoadingChat(true);
    try {
      const res = await fetch(`/api/admin/chats?id=${chatId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSelectedChat(data.session);
    } catch (err) {
      console.error('Failed to fetch chat details:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const deleteChat = async (chat: ChatSession) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/chats?id=${chat.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setChats(chats.filter((c) => c.id !== chat.id));
        setSelectedChat(null);
        setDeleteConfirm(null);
        setTotal((t) => t - 1);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.preview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.visitorId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return 'Actief';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    return `${minutes} min`;
  };

  const exportChats = () => {
    const data = JSON.stringify(filteredChats, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (loading && chats.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-orange-600 mb-4" />
          <p className="text-slate-500">Chat logs laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Chat Logs</h1>
          <p className="text-slate-500 mt-1">
            Bekijk en analyseer alle chatgesprekken
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchChats} variant="outline" size="sm" disabled={loading}>
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Vernieuwen
          </Button>
          <Button onClick={exportChats} variant="outline" disabled={chats.length === 0}>
            <Download size={18} className="mr-2" />
            Exporteer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Totaal Gesprekken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Actieve Chats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Vandaag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Gem. Berichten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgMessages}</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <Button onClick={fetchChats} variant="link" className="ml-2 text-red-700">
            Opnieuw proberen
          </Button>
        </div>
      )}

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Zoek in gesprekken..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[160px]">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Bron" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle bronnen</SelectItem>
                  <SelectItem value="widget">Chat Widget</SelectItem>
                  <SelectItem value="booking">Boekingschat</SelectItem>
                  <SelectItem value="scan">AI Scanner</SelectItem>
                  <SelectItem value="kennisbank">Kennisbank</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="active">Actief</SelectItem>
                  <SelectItem value="completed">Afgerond</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gesprek</TableHead>
                <TableHead>Bron</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Duur</TableHead>
                <TableHead>Berichten</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChats.map((chat) => (
                <TableRow
                  key={chat.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => fetchChatDetails(chat.id)}
                >
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <User size={18} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">
                          {chat.preview || 'Geen preview'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {chat.visitorId?.slice(0, 12)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={sourceColors[chat.source] || 'bg-gray-100 text-gray-700'}>
                      {sourceLabels[chat.source] || chat.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={chat.status === 'active' ? 'default' : 'secondary'}
                      className={
                        chat.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : ''
                      }
                    >
                      {chat.status === 'active' ? 'Actief' : 'Afgerond'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar size={14} />
                      {formatDate(chat.startedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock size={14} />
                      {formatDuration(chat.startedAt, chat.endedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-500">
                      <MessageSquare size={14} />
                      {chat.messageCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ChevronRight size={18} className="text-slate-400" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredChats.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Geen gesprekken gevonden</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-slate-500">
                Pagina {page + 1} van {totalPages} ({total} gesprekken)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Vorige
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || loading}
                >
                  Volgende
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Detail Dialog */}
      <Dialog open={!!selectedChat} onOpenChange={() => setSelectedChat(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare size={20} />
              Chat Transcript
            </DialogTitle>
            <DialogDescription>
              {selectedChat && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className={sourceColors[selectedChat.source] || 'bg-gray-100 text-gray-700'}>
                    {sourceLabels[selectedChat.source] || selectedChat.source}
                  </Badge>
                  <Badge variant="outline">
                    {formatDate(selectedChat.startedAt)} - {formatTime(selectedChat.startedAt)}
                  </Badge>
                  {selectedChat.pageUrl && (
                    <Badge variant="outline">
                      Pagina: {selectedChat.pageUrl}
                    </Badge>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {loadingChat ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-orange-600" />
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {selectedChat?.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'assistant' ? '' : 'flex-row-reverse'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        message.role === 'assistant'
                          ? 'bg-orange-100'
                          : 'bg-slate-100'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <Bot size={16} className="text-orange-600" />
                      ) : (
                        <User size={16} className="text-slate-600" />
                      )}
                    </div>
                    <div
                      className={`flex-1 max-w-[80%] ${
                        message.role === 'assistant' ? '' : 'text-right'
                      }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          message.role === 'assistant'
                            ? 'bg-slate-100 text-slate-900'
                            : 'bg-orange-600 text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {(!selectedChat?.messages || selectedChat.messages.length === 0) && (
                  <p className="text-center text-slate-500 py-8">Geen berichten gevonden</p>
                )}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => selectedChat && setDeleteConfirm(selectedChat)}
            >
              <Trash2 size={14} className="mr-2" />
              Verwijderen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedChat) {
                  const data = JSON.stringify(selectedChat, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `chat-${selectedChat.id}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
            >
              <Download size={14} className="mr-2" />
              Export
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chat verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je dit gesprek wilt verwijderen?
              Alle berichten worden ook verwijderd. Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteChat(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 size={14} className="mr-2 animate-spin" />
              ) : (
                <Trash2 size={14} className="mr-2" />
              )}
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
