'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ArrowLeft,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Users,
  Briefcase,
  CheckSquare,
  MessageSquare,
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
  ContactCard,
  DealCard,
  ActivityTimeline,
  TaskItem,
  CreateContactDialog,
  CreateDealDialog,
  CreateTaskDialog,
  LogActivityDialog,
} from '@/components/crm';
import { industryLabels, companySizeLabels, formatDate } from '@/lib/crm/labels';
import type { Company, Contact, Deal, Activity, CrmTask } from '@/lib/crm/types';

interface CompanyDetailData {
  company: Company;
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  tasks: CrmTask[];
}

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<CompanyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showDealDialog, setShowDealDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/crm/companies/${id}`);
      if (!res.ok) throw new Error('Bedrijf niet gevonden');
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
      const res = await fetch(`/api/admin/crm/companies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Kon bedrijf niet verwijderen');
      router.push('/admin/crm/bedrijven');
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
        <p className="text-red-600 mb-4">{error || 'Bedrijf niet gevonden'}</p>
        <Link href="/admin/crm/bedrijven">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Terug naar overzicht
          </Button>
        </Link>
      </div>
    );
  }

  const { company, contacts, deals, activities, tasks } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-4">
          <Link href="/admin/crm/bedrijven">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 size={24} className="text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
                {company.city && (
                  <p className="text-slate-500 flex items-center gap-1">
                    <MapPin size={14} />
                    {company.city}
                  </p>
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

      {/* Company Info Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Bedrijfsinfo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.industry && (
              <div>
                <p className="text-sm text-slate-500">Sector</p>
                <Badge variant="outline">
                  {industryLabels[company.industry] || company.industry}
                </Badge>
              </div>
            )}

            {company.size && (
              <div>
                <p className="text-sm text-slate-500">Grootte</p>
                <p className="font-medium">{companySizeLabels[company.size] || company.size}</p>
              </div>
            )}

            {company.website && (
              <div>
                <p className="text-sm text-slate-500">Website</p>
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline flex items-center gap-1"
                >
                  {company.website}
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {company.email && (
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <a href={`mailto:${company.email}`} className="text-orange-600 hover:underline flex items-center gap-1">
                  <Mail size={14} />
                  {company.email}
                </a>
              </div>
            )}

            {company.phone && (
              <div>
                <p className="text-sm text-slate-500">Telefoon</p>
                <a href={`tel:${company.phone}`} className="text-orange-600 hover:underline flex items-center gap-1">
                  <Phone size={14} />
                  {company.phone}
                </a>
              </div>
            )}

            {company.address && (
              <div>
                <p className="text-sm text-slate-500">Adres</p>
                <p>{company.address}</p>
                {company.city && <p>{company.city}</p>}
              </div>
            )}

            {company.notes && (
              <div>
                <p className="text-sm text-slate-500">Notities</p>
                <p className="text-slate-700 whitespace-pre-wrap">{company.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t text-xs text-slate-400">
              Aangemaakt: {formatDate(company.createdAt)}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="contacts">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="contacts" className="flex items-center gap-1">
                <Users size={14} />
                <span className="hidden sm:inline">Contacten</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">{contacts.length}</Badge>
              </TabsTrigger>
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

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Contactpersonen</h3>
                <Button size="sm" onClick={() => setShowContactDialog(true)}>
                  <Plus size={14} className="mr-1" />
                  Contact
                </Button>
              </div>
              {contacts.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {contacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} showCompany={false} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-slate-500">
                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Nog geen contactpersonen</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

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
            <AlertDialogTitle>Bedrijf verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je "{company.name}" wilt verwijderen? Dit verwijdert ook alle
              gekoppelde deals, activiteiten en taken. Contacten worden losgekoppeld maar niet verwijderd.
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
      <CreateContactDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        onCreated={() => fetchData()}
        preselectedCompanyId={id}
      />
      <CreateDealDialog
        open={showDealDialog}
        onOpenChange={setShowDealDialog}
        onCreated={() => fetchData()}
        preselectedCompanyId={id}
      />
      <CreateTaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onCreated={() => fetchData()}
        preselectedCompanyId={id}
      />
      <LogActivityDialog
        open={showActivityDialog}
        onOpenChange={setShowActivityDialog}
        onCreated={() => fetchData()}
        companyId={id}
      />
    </div>
  );
}
