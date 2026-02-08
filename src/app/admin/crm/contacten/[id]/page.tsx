'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Trash2,
  Plus,
  Loader2,
  Briefcase,
  CheckSquare,
  MessageSquare,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  DealCard,
  ActivityTimeline,
  TaskItem,
  CreateDealDialog,
  CreateTaskDialog,
  LogActivityDialog,
} from '@/components/crm';
import { sourceLabels, formatDate, getContactFullName } from '@/lib/crm/labels';
import type { Contact, Deal, Activity, CrmTask } from '@/lib/crm/types';

interface ContactDetailData {
  contact: Contact;
  activities: Activity[];
  deals: Deal[];
  tasks: CrmTask[];
}

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<ContactDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [showDealDialog, setShowDealDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/crm/contacts/${id}`);
      if (!res.ok) throw new Error('Contact niet gevonden');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/crm/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Kon contact niet verwijderen');
      router.push('/admin/crm/contacten');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
      setDeleting(false);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    await fetch(`/api/admin/crm/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-orange-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Contact niet gevonden'}</p>
        <Link href="/admin/crm/contacten">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Terug naar overzicht
          </Button>
        </Link>
      </div>
    );
  }

  const { contact, activities, deals, tasks } = data;
  const fullName = getContactFullName(contact.firstName, contact.lastName);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-4">
          <Link href="/admin/crm/contacten">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User size={24} className="text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
                  {contact.isPrimary && (
                    <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                {contact.jobTitle && (
                  <p className="text-slate-500">{contact.jobTitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 size={16} className="mr-2" />
            Verwijderen
          </Button>
        </div>
      </div>

      {/* Contact Info Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Contactinfo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.companyName && (
              <div>
                <p className="text-sm text-slate-500">Bedrijf</p>
                <Link
                  href={`/admin/crm/bedrijven/${contact.companyId}`}
                  className="font-medium text-orange-600 hover:underline flex items-center gap-1"
                >
                  <Building2 size={14} />
                  {contact.companyName}
                </Link>
              </div>
            )}

            {contact.email && (
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-orange-600 hover:underline flex items-center gap-1"
                >
                  <Mail size={14} />
                  {contact.email}
                </a>
              </div>
            )}

            {contact.phone && (
              <div>
                <p className="text-sm text-slate-500">Telefoon</p>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-orange-600 hover:underline flex items-center gap-1"
                >
                  <Phone size={14} />
                  {contact.phone}
                </a>
              </div>
            )}

            {contact.source && (
              <div>
                <p className="text-sm text-slate-500">Bron</p>
                <Badge variant="outline">
                  {sourceLabels[contact.source] || contact.source}
                </Badge>
              </div>
            )}

            {contact.tags && contact.tags.length > 0 && (
              <div>
                <p className="text-sm text-slate-500">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {contact.notes && (
              <div>
                <p className="text-sm text-slate-500">Notities</p>
                <p className="text-slate-700 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t text-xs text-slate-400">
              Aangemaakt: {formatDate(contact.createdAt)}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 flex gap-2">
              {contact.email && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${contact.email}`}>
                    <Mail size={14} className="mr-1" />
                    Email
                  </a>
                </Button>
              )}
              {contact.phone && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${contact.phone}`}>
                    <Phone size={14} className="mr-1" />
                    Bellen
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="deals">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deals" className="flex items-center gap-1">
                <Briefcase size={14} />
                <span className="hidden sm:inline">Deals</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">{deals.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-1">
                <CheckSquare size={14} />
                <span className="hidden sm:inline">Taken</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">{tasks.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-1">
                <MessageSquare size={14} />
                <span className="hidden sm:inline">Activiteit</span>
              </TabsTrigger>
            </TabsList>

            {/* Deals Tab */}
            <TabsContent value="deals" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Deals</h3>
                <Button size="sm" onClick={() => setShowDealDialog(true)}>
                  <Plus size={14} className="mr-1" />
                  Deal
                </Button>
              </div>
              {deals.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} showStage />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-slate-500">
                    <Briefcase size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Nog geen deals</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Open taken</h3>
                <Button size="sm" onClick={() => setShowTaskDialog(true)}>
                  <Plus size={14} className="mr-1" />
                  Taak
                </Button>
              </div>
              {tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onComplete={handleTaskComplete}
                      showEntity={false}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-slate-500">
                    <CheckSquare size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Geen open taken</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Activiteiten</h3>
                <Button size="sm" onClick={() => setShowActivityDialog(true)}>
                  <Plus size={14} className="mr-1" />
                  Activiteit
                </Button>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <ActivityTimeline activities={activities} showEntity={false} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Contact verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je "{fullName}" wilt verwijderen? Dit verwijdert ook alle
              gekoppelde activiteiten. Deals en taken worden losgekoppeld maar niet verwijderd.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting && <Loader2 size={14} className="mr-2 animate-spin" />}
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogs */}
      <CreateDealDialog
        open={showDealDialog}
        onOpenChange={setShowDealDialog}
        onCreated={() => fetchData()}
        preselectedCompanyId={contact.companyId}
        preselectedContactId={id}
      />
      <CreateTaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onCreated={() => fetchData()}
        preselectedCompanyId={contact.companyId}
        preselectedContactId={id}
      />
      <LogActivityDialog
        open={showActivityDialog}
        onOpenChange={setShowActivityDialog}
        onCreated={() => fetchData()}
        companyId={contact.companyId}
        contactId={id}
      />
    </div>
  );
}
