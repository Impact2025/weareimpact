'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  User,
  RefreshCw,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  meetLink?: string;
  attendees?: string[];
}

interface DayEvents {
  date: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  events: CalendarEvent[];
}

export default function AgendaPage() {
  const [weekEvents, setWeekEvents] = useState<DayEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
  const monthNames = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'
  ];

  const fetchWeekEvents = useCallback(async () => {
    setLoading(true);
    try {
      const weekStart = (() => {
        const d = new Date(currentWeekStart);
        d.setHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0];
      })();

      const res = await fetch(`/api/admin/calendar/events?weekStart=${weekStart}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.week)) {
          // Backfill dayName/dayNumber in case the API omits them.
          const week: DayEvents[] = data.week.map((day: any, i: number) => ({
            date: day.date,
            dayName: day.dayName || dayNames[i],
            dayNumber: day.dayNumber ?? new Date(day.date).getDate(),
            isToday: day.isToday ?? false,
            events: (day.events || []).map((e: any) => ({
              id: e.id,
              summary: e.summary,
              start: e.start,
              end: e.end,
              meetLink: e.meetLink,
              attendees: e.attendees || [],
            })),
          }));
          setWeekEvents(week);
        }
      } else {
        console.error('Agenda API gaf status', res.status);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart]);

  const handleBlockTime = useCallback(async () => {
    const title = window.prompt('Wat wil je blokkeren? (bijv. "Dieptewerk")');
    if (!title) return;
    const hours = window.prompt('Vanaf hoe laat? (uur, 0-23)', '9');
    const until = window.prompt('Tot hoe laat? (uur, 0-23)', '12');
    if (!hours || !until) return;

    const day = new Date(currentWeekStart);
    day.setHours(0, 0, 0, 0);
    const start = new Date(day);
    start.setDate(start.getDate());
    start.setHours(parseInt(hours, 10), 0, 0, 0);
    const end = new Date(start);
    end.setHours(parseInt(until, 10), 0, 0, 0);

    try {
      const res = await fetch('/api/admin/calendar/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          description: 'Geblokkeerd via Agenda',
        }),
      });
      if (res.ok) {
        fetchWeekEvents();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Blokkeren mislukt: ${data.error || res.status}`);
      }
    } catch (err) {
      console.error('Block failed:', err);
      alert('Blokkeren mislukt (netwerkfout).');
    }
  }, [currentWeekStart, fetchWeekEvents]);

  useEffect(() => {
    fetchWeekEvents();
  }, [fetchWeekEvents]);

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  const getWeekLabel = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    if (currentWeekStart.getMonth() === endOfWeek.getMonth()) {
      return `${currentWeekStart.getDate()} - ${endOfWeek.getDate()} ${monthNames[currentWeekStart.getMonth()]} ${currentWeekStart.getFullYear()}`;
    }
    return `${currentWeekStart.getDate()} ${monthNames[currentWeekStart.getMonth()]} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()]} ${currentWeekStart.getFullYear()}`;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agenda</h1>
          <p className="text-slate-500 mt-1">{getWeekLabel()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Vandaag
          </Button>
          <div className="flex">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight size={18} />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={fetchWeekEvents} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Link href="/admin/iris">
            <Button>
              <Sparkles size={16} className="mr-2" />
              Vraag Iris
            </Button>
          </Link>
        </div>
      </div>

      {/* Week Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {weekEvents.map((day) => (
            <div
              key={day.date}
              className={`p-4 text-center border-r border-slate-100 last:border-r-0 ${
                day.isToday ? 'bg-orange-50' : ''
              }`}
            >
              <div className="text-xs text-slate-500 uppercase font-medium">
                {day.dayName}
              </div>
              <div
                className={`text-2xl font-bold mt-1 ${
                  day.isToday ? 'text-orange-600' : 'text-slate-900'
                }`}
              >
                {day.dayNumber}
              </div>
            </div>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-7 min-h-[400px]">
          {weekEvents.map((day) => (
            <div
              key={day.date}
              className={`p-2 border-r border-slate-100 last:border-r-0 ${
                day.isToday ? 'bg-orange-50/50' : ''
              }`}
            >
              {day.events.length > 0 ? (
                <div className="space-y-2">
                  {day.events.map((event) => (
                    <div
                      key={event.id}
                      className="p-2 bg-orange-100 border-l-4 border-orange-500 rounded-r-lg text-xs"
                    >
                      <div className="font-medium text-slate-900 truncate">
                        {event.summary}
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 mt-1">
                        <Clock size={10} />
                        {formatTime(event.start)}
                      </div>
                      {event.meetLink && (
                        <a
                          href={event.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline mt-1"
                        >
                          <Video size={10} />
                          Meet
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="text-xs text-slate-300">-</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={handleBlockTime}
          className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Plus className="text-white" size={20} />
            </div>
            <div>
              <div className="font-semibold text-slate-900">Tijd blokkeren</div>
              <div className="text-xs text-slate-500">Blokkeer direct een gat in je agenda</div>
            </div>
          </div>
        </div>

        <Link
          href="/admin/iris"
          className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="text-white" size={20} />
            </div>
            <div>
              <div className="font-semibold text-slate-900">Afspraak zoeken</div>
              <div className="text-xs text-slate-500">Vraag Iris wanneer iets gepland is</div>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/iris"
          className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <div>
              <div className="font-semibold text-slate-900">Beschikbaarheid</div>
              <div className="text-xs text-slate-500">Bekijk vrije slots voor afspraken</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Info */}
      <div className="bg-slate-50 rounded-xl p-4 text-center">
        <p className="text-sm text-slate-500">
          Je agenda is live gekoppeld aan Google Calendar — hier zie je je echte
          afspraken van de week. Blokkeer tijd met één klik, of vraag{' '}
          <Link href="/admin/iris" className="text-orange-600 font-medium hover:underline">
            Iris
          </Link>{' '}
          om afspraken te zoeken of je planning te bespreken.
        </p>
      </div>
    </div>
  );
}
