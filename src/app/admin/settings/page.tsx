'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Shield,
  Globe,
  Mail,
  Key,
  Save,
  Bot,
  Calendar,
  MessageSquare,
  Brain,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface Settings {
  profile: {
    name: string;
    email: string;
  };
  notifications: {
    emailNewLead: boolean;
    emailNewChat: boolean;
    emailWeeklyReport: boolean;
    browserNotifications: boolean;
  };
  ai: {
    chatEnabled: boolean;
    scannerEnabled: boolean;
    bookingEnabled: boolean;
    maxTokens: string;
    temperature: string;
  };
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: 'Vincent van Munster',
    email: 'v.munster@weareimpact.nl',
    role: 'Administrator',
  });

  const [notifications, setNotifications] = useState({
    emailNewLead: true,
    emailNewChat: false,
    emailWeeklyReport: true,
    browserNotifications: true,
  });

  const [aiSettings, setAiSettings] = useState({
    chatEnabled: true,
    scannerEnabled: true,
    bookingEnabled: true,
    maxTokens: '400',
    temperature: '0.7',
    systemPromptPreview:
      'Je bent Vincent van Munster\'s digitale tweeling - een AI-assistent die antwoordt vanuit Vincent\'s perspectief en expertise...',
  });

  const [integrations] = useState({
    googleCalendarConnected: true,
    supabaseConnected: true,
    openrouterConnected: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data: Settings = await res.json();
        if (data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
        }
        if (data.notifications) {
          setNotifications((prev) => ({ ...prev, ...data.notifications }));
        }
        if (data.ai) {
          setAiSettings((prev) => ({ ...prev, ...data.ai }));
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Kon instellingen niet laden');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            name: profile.name,
            email: profile.email,
          },
          notifications,
          ai: {
            chatEnabled: aiSettings.chatEnabled,
            scannerEnabled: aiSettings.scannerEnabled,
            bookingEnabled: aiSettings.bookingEnabled,
            maxTokens: aiSettings.maxTokens,
            temperature: aiSettings.temperature,
          },
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Kon instellingen niet opslaan');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-orange-600 mb-4" />
          <p className="text-slate-500">Instellingen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Instellingen</h1>
          <p className="text-slate-500 mt-1">
            Beheer je account en website instellingen
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSettings} variant="outline" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin mr-2' : 'mr-2'} />
            Vernieuwen
          </Button>
          <Button
            onClick={handleSave}
            className="bg-orange-600 hover:bg-orange-700"
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : saved ? (
              <Check size={18} className="mr-2" />
            ) : (
              <Save size={18} className="mr-2" />
            )}
            {saved ? 'Opgeslagen!' : 'Opslaan'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            Profiel
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            Notificaties
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot size={16} />
            AI Config
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Globe size={16} />
            Integraties
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Profiel Instellingen
              </CardTitle>
              <CardDescription>
                Beheer je persoonlijke gegevens en account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Naam</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield size={18} />
                  Beveiliging
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key size={18} className="text-slate-500" />
                      <div>
                        <p className="font-medium">Wachtwoord wijzigen</p>
                        <p className="text-sm text-slate-500">
                          Beheer via environment variables
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Wijzigen
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className="text-slate-500" />
                      <div>
                        <p className="font-medium">Twee-factor authenticatie</p>
                        <p className="text-sm text-slate-500">
                          Extra beveiliging (binnenkort)
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Inschakelen
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={20} />
                Notificatie Voorkeuren
              </CardTitle>
              <CardDescription>
                Bepaal wanneer en hoe je op de hoogte wordt gebracht
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Mail size={18} />
                  Email Notificaties
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain size={18} className="text-orange-500" />
                      <div>
                        <p className="font-medium">Nieuwe AI Scanner Lead</p>
                        <p className="text-sm text-slate-500">
                          Ontvang email bij elke nieuwe scan
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailNewLead}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          emailNewLead: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare size={18} className="text-green-500" />
                      <div>
                        <p className="font-medium">Nieuw Chatgesprek</p>
                        <p className="text-sm text-slate-500">
                          Ontvang email bij elke nieuwe chat
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailNewChat}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          emailNewChat: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-blue-500" />
                      <div>
                        <p className="font-medium">Wekelijks Rapport</p>
                        <p className="text-sm text-slate-500">
                          Ontvang elke maandag een samenvatting
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailWeeklyReport}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          emailWeeklyReport: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Globe size={18} />
                  Browser Notificaties
                </h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Push Notificaties</p>
                    <p className="text-sm text-slate-500">
                      Ontvang real-time notificaties in je browser
                    </p>
                  </div>
                  <Switch
                    checked={notifications.browserNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        browserNotifications: checked,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Config Tab */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot size={20} />
                AI Configuratie
              </CardTitle>
              <CardDescription>
                Beheer de AI-functies van je website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Actieve Functies</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare size={18} className="text-green-500" />
                      <div>
                        <p className="font-medium">Chat Widget</p>
                        <p className="text-sm text-slate-500">
                          Digitale tweeling chatbot op de website
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={aiSettings.chatEnabled}
                      onCheckedChange={(checked) =>
                        setAiSettings({ ...aiSettings, chatEnabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain size={18} className="text-orange-500" />
                      <div>
                        <p className="font-medium">AI Scanner</p>
                        <p className="text-sm text-slate-500">
                          AI-readiness assessment tool
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={aiSettings.scannerEnabled}
                      onCheckedChange={(checked) =>
                        setAiSettings({ ...aiSettings, scannerEnabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-blue-500" />
                      <div>
                        <p className="font-medium">Booking Assistant</p>
                        <p className="text-sm text-slate-500">
                          AI-gestuurde afspraken planning
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={aiSettings.bookingEnabled}
                      onCheckedChange={(checked) =>
                        setAiSettings({ ...aiSettings, bookingEnabled: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Model Instellingen</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Select
                      value={aiSettings.maxTokens}
                      onValueChange={(value) =>
                        setAiSettings({ ...aiSettings, maxTokens: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="200">200 (Kort)</SelectItem>
                        <SelectItem value="400">400 (Standaard)</SelectItem>
                        <SelectItem value="800">800 (Lang)</SelectItem>
                        <SelectItem value="1500">1500 (Zeer lang)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      Maximale lengte van AI-antwoorden
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperatuur</Label>
                    <Select
                      value={aiSettings.temperature}
                      onValueChange={(value) =>
                        setAiSettings({ ...aiSettings, temperature: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.3">0.3 (Precies)</SelectItem>
                        <SelectItem value="0.5">0.5 (Gebalanceerd)</SelectItem>
                        <SelectItem value="0.7">0.7 (Creatief)</SelectItem>
                        <SelectItem value="0.9">0.9 (Zeer creatief)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      Hogere waarde = meer variatie in antwoorden
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">System Prompt Preview</h3>
                <Textarea
                  value={aiSettings.systemPromptPreview}
                  readOnly
                  className="min-h-[100px] bg-slate-50"
                />
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <ExternalLink size={12} />
                  System prompt wijzigen in{' '}
                  <code className="bg-slate-100 px-1 rounded">
                    /api/chat/route.ts
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} />
                Integraties
              </CardTitle>
              <CardDescription>
                Verbind externe services met je website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Google Calendar */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Google Calendar</p>
                      <p className="text-sm text-slate-500">
                        Synchroniseer afspraken met je agenda
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrations.googleCalendarConnected ? (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <Check size={16} />
                        Verbonden
                      </span>
                    ) : (
                      <Button variant="outline" size="sm">
                        Verbinden
                      </Button>
                    )}
                  </div>
                </div>

                {/* Supabase */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        viewBox="0 0 109 113"
                        fill="currentColor"
                      >
                        <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" />
                        <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Supabase</p>
                      <p className="text-sm text-slate-500">
                        Database en authenticatie
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrations.supabaseConnected ? (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <Check size={16} />
                        Verbonden
                      </span>
                    ) : (
                      <Button variant="outline" size="sm">
                        Verbinden
                      </Button>
                    )}
                  </div>
                </div>

                {/* OpenRouter */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bot size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">OpenRouter</p>
                      <p className="text-sm text-slate-500">
                        AI model provider voor chat en scanner
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrations.openrouterConnected ? (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <Check size={16} />
                        Verbonden
                      </span>
                    ) : (
                      <Button variant="outline" size="sm">
                        Verbinden
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">API Keys</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Supabase URL</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            'NEXT_PUBLIC_SUPABASE_URL',
                            'supabase-url'
                          )
                        }
                      >
                        {copied === 'supabase-url' ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    </div>
                    <code className="text-sm bg-slate-200 px-2 py-1 rounded block overflow-x-auto">
                      NEXT_PUBLIC_SUPABASE_URL=***
                    </code>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label>OpenRouter API Key</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard('OPENROUTER_API_KEY', 'openrouter')
                        }
                      >
                        {copied === 'openrouter' ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    </div>
                    <code className="text-sm bg-slate-200 px-2 py-1 rounded block overflow-x-auto">
                      OPENROUTER_API_KEY=***
                    </code>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                  <ExternalLink size={12} />
                  API keys worden beheerd via environment variables in Vercel
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
