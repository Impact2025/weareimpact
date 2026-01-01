'use client';

import { useState } from 'react';
import {
  Search,
  MessageSquare,
  Clock,
  User,
  ChevronRight,
  Download,
  Filter,
  Calendar,
  Bot,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
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

// Types
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  visitorId: string;
  startedAt: string;
  endedAt: string | null;
  messageCount: number;
  source: 'widget' | 'booking' | 'scan';
  status: 'active' | 'completed';
  preview: string;
  messages: ChatMessage[];
  metadata?: {
    page?: string;
    referrer?: string;
    device?: string;
  };
}

// Mock data - will be replaced with Supabase queries
const mockChats: ChatSession[] = [
  {
    id: 'chat-001',
    visitorId: 'visitor-abc123',
    startedAt: '2024-01-15T14:30:00Z',
    endedAt: '2024-01-15T14:45:00Z',
    messageCount: 8,
    source: 'widget',
    status: 'completed',
    preview: 'Ik wil graag meer weten over LEGO Serious Play...',
    messages: [
      {
        role: 'user',
        content: 'Hallo, ik wil graag meer weten over LEGO Serious Play workshops',
        timestamp: '2024-01-15T14:30:00Z',
      },
      {
        role: 'assistant',
        content: 'Welkom! Als Vincent\'s digitale tweeling help ik je graag verder. LEGO® Serious Play is een krachtige methodiek waarbij teams complexe vraagstukken verkennen door te bouwen met LEGO. Dit maakt abstracte ideeën tastbaar.',
        timestamp: '2024-01-15T14:30:15Z',
      },
      {
        role: 'user',
        content: 'Wat kost zo\'n workshop?',
        timestamp: '2024-01-15T14:32:00Z',
      },
      {
        role: 'assistant',
        content: 'De investering hangt af van de grootte van je team en de duur van de sessie. Voor een exacte offerte nodig ik je uit om contact op te nemen via v.munster@weareimpact.nl. Zo kunnen we bespreken wat bij jullie situatie past.',
        timestamp: '2024-01-15T14:32:20Z',
      },
    ],
    metadata: {
      page: '/diensten',
      device: 'desktop',
    },
  },
  {
    id: 'chat-002',
    visitorId: 'visitor-def456',
    startedAt: '2024-01-15T10:15:00Z',
    endedAt: '2024-01-15T10:28:00Z',
    messageCount: 12,
    source: 'booking',
    status: 'completed',
    preview: 'Ik wil een strategiesessie inplannen...',
    messages: [
      {
        role: 'user',
        content: 'Ik wil een strategiesessie inplannen',
        timestamp: '2024-01-15T10:15:00Z',
      },
      {
        role: 'assistant',
        content: 'Geweldig! Ik help je graag bij het inplannen van een strategiesessie met Vincent. Wat is de aanleiding voor deze sessie?',
        timestamp: '2024-01-15T10:15:20Z',
      },
    ],
    metadata: {
      page: '/contact',
      device: 'mobile',
    },
  },
  {
    id: 'chat-003',
    visitorId: 'visitor-ghi789',
    startedAt: '2024-01-14T16:45:00Z',
    endedAt: null,
    messageCount: 3,
    source: 'widget',
    status: 'active',
    preview: 'Hoe kan AI helpen in de zorg?',
    messages: [
      {
        role: 'user',
        content: 'Hoe kan AI helpen in de zorg?',
        timestamp: '2024-01-14T16:45:00Z',
      },
      {
        role: 'assistant',
        content: 'Goede vraag! AI kan in de zorg op veel manieren helpen: van administratieve taken automatiseren tot het ondersteunen van cliëntcontact. Het belangrijkste is dat we technologie inzetten als enabler voor menselijk contact, niet als vervanging.',
        timestamp: '2024-01-14T16:45:30Z',
      },
    ],
    metadata: {
      page: '/',
      device: 'tablet',
    },
  },
  {
    id: 'chat-004',
    visitorId: 'visitor-jkl012',
    startedAt: '2024-01-14T09:20:00Z',
    endedAt: '2024-01-14T09:35:00Z',
    messageCount: 6,
    source: 'scan',
    status: 'completed',
    preview: 'Na de AI-scan wil ik graag vervolgvragen stellen...',
    messages: [
      {
        role: 'user',
        content: 'Na de AI-scan wil ik graag vervolgvragen stellen over de aanbevelingen',
        timestamp: '2024-01-14T09:20:00Z',
      },
      {
        role: 'assistant',
        content: 'Natuurlijk! Ik heb je scan resultaten bekeken. Welke aanbeveling wil je verder bespreken?',
        timestamp: '2024-01-14T09:20:25Z',
      },
    ],
    metadata: {
      page: '/ai-scanner',
      device: 'desktop',
    },
  },
];

const sourceColors: Record<string, string> = {
  widget: 'bg-blue-100 text-blue-700',
  booking: 'bg-green-100 text-green-700',
  scan: 'bg-orange-100 text-orange-700',
};

const sourceLabels: Record<string, string> = {
  widget: 'Chat Widget',
  booking: 'Boekingschat',
  scan: 'AI Scanner',
};

export default function AdminChatsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [chats] = useState(mockChats);

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.visitorId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === 'all' || chat.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    return matchesSearch && matchesSource && matchesStatus;
  });

  const stats = {
    total: chats.length,
    active: chats.filter((c) => c.status === 'active').length,
    today: chats.filter((c) => {
      const today = new Date().toDateString();
      return new Date(c.startedAt).toDateString() === today;
    }).length,
    avgMessages: Math.round(
      chats.reduce((acc, c) => acc + c.messageCount, 0) / chats.length
    ),
  };

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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Chat Logs</h1>
          <p className="text-slate-500 mt-1">
            Bekijk en analyseer alle chatgesprekken
          </p>
        </div>
        <Button onClick={exportChats} variant="outline">
          <Download size={18} className="mr-2" />
          Exporteer
        </Button>
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
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Bron" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle bronnen</SelectItem>
                  <SelectItem value="widget">Chat Widget</SelectItem>
                  <SelectItem value="booking">Boekingschat</SelectItem>
                  <SelectItem value="scan">AI Scanner</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                  onClick={() => setSelectedChat(chat)}
                >
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <User size={18} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">
                          {chat.preview}
                        </p>
                        <p className="text-sm text-slate-500">
                          {chat.visitorId.slice(0, 12)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={sourceColors[chat.source]}>
                      {sourceLabels[chat.source]}
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

          {filteredChats.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Geen gesprekken gevonden</p>
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
                  <Badge className={sourceColors[selectedChat.source]}>
                    {sourceLabels[selectedChat.source]}
                  </Badge>
                  <Badge variant="outline">
                    {formatDate(selectedChat.startedAt)} - {formatTime(selectedChat.startedAt)}
                  </Badge>
                  {selectedChat.metadata?.page && (
                    <Badge variant="outline">
                      Pagina: {selectedChat.metadata.page}
                    </Badge>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {selectedChat?.messages.map((message, idx) => (
                <div
                  key={idx}
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
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
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
    </div>
  );
}
