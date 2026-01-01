import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, FileText, Brain, MessageSquare, TrendingUp } from 'lucide-react';

// In production, this would come from the database
const stats = [
  {
    label: 'Totaal Bezoekers',
    value: '1,234',
    change: '+12%',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    label: 'AI Scans',
    value: '89',
    change: '+24%',
    icon: Brain,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    label: 'Chat Gesprekken',
    value: '156',
    change: '+8%',
    icon: MessageSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    label: 'Blog Posts',
    value: '12',
    change: '+2',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

const recentActivity = [
  { type: 'scan', message: 'Nieuwe AI scan afgerond', time: '5 min geleden' },
  { type: 'chat', message: 'Chat gesprek gestart', time: '12 min geleden' },
  { type: 'blog', message: 'Blog post gepubliceerd', time: '1 uur geleden' },
  { type: 'scan', message: 'Nieuwe AI scan afgerond', time: '2 uur geleden' },
  { type: 'chat', message: 'Chat gesprek gestart', time: '3 uur geleden' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Welkom terug! Hier is een overzicht van je website.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                <TrendingUp size={14} />
                <span>{stat.change} deze maand</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recente Activiteit</CardTitle>
            <CardDescription>Laatste acties op de website</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'scan'
                        ? 'bg-orange-100 text-orange-600'
                        : activity.type === 'chat'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    {activity.type === 'scan' ? (
                      <Brain size={18} />
                    ) : activity.type === 'chat' ? (
                      <MessageSquare size={18} />
                    ) : (
                      <FileText size={18} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {activity.message}
                    </p>
                    <p className="text-sm text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Snelle Acties</CardTitle>
            <CardDescription>Veelgebruikte taken</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <a
              href="/admin/blog/new"
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Nieuwe Blog Post</p>
                <p className="text-sm text-slate-500">
                  Schrijf en publiceer een artikel
                </p>
              </div>
            </a>
            <a
              href="/admin/leads"
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Brain size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Bekijk AI Leads</p>
                <p className="text-sm text-slate-500">
                  Scan resultaten en contactgegevens
                </p>
              </div>
            </a>
            <a
              href="/admin/chats"
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare size={24} className="text-green-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Chat Transcripts</p>
                <p className="text-sm text-slate-500">
                  Bekijk gesprekken met de chatbot
                </p>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
