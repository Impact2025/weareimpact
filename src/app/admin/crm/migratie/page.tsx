'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Users,
  Briefcase,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

interface MigrationPreview {
  leads: {
    total: number;
    uniqueOrganizations: number;
    withEmail: number;
    withName: number;
    byStatus: {
      new: number;
      contacted: number;
      qualified: number;
      converted: number;
    };
  };
  existingCrm: {
    companies: number;
    contacts: number;
    deals: number;
  };
}

interface MigrationResult {
  success: boolean;
  companiesCreated: number;
  contactsCreated: number;
  dealsCreated: number;
  errors: string[];
  message: string;
}

export default function MigrationPage() {
  const [preview, setPreview] = useState<MigrationPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreview();
  }, []);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/crm/migrate');
      if (!res.ok) throw new Error('Kon preview niet laden');
      const data = await res.json();
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    setMigrating(true);
    setError(null);
    setShowConfirm(false);

    try {
      const res = await fetch('/api/admin/crm/migrate', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Migratie mislukt');
      }

      setResult(data);
      // Refresh preview to show updated counts
      fetchPreview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-orange-600 mb-4" />
          <p className="text-slate-500">Migratie preview laden...</p>
        </div>
      </div>
    );
  }

  if (error && !preview) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchPreview}>Opnieuw proberen</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/crm">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads Migreren naar CRM</h1>
          <p className="text-slate-500">
            Converteer je AI Scanner leads naar bedrijven, contacten en deals in het CRM
          </p>
        </div>
      </div>

      {/* Result Banner */}
      {result && (
        <Card className={result.success ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="text-green-600 mt-0.5" size={24} />
              ) : (
                <AlertTriangle className="text-yellow-600 mt-0.5" size={24} />
              )}
              <div>
                <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-yellow-800'}`}>
                  {result.success ? 'Migratie succesvol!' : 'Migratie voltooid met waarschuwingen'}
                </h3>
                <p className={result.success ? 'text-green-700' : 'text-yellow-700'}>
                  {result.message}
                </p>
                {result.errors.length > 0 && (
                  <div className="mt-2 text-sm text-yellow-700">
                    <p className="font-medium">Fouten ({result.errors.length}):</p>
                    <ul className="list-disc list-inside mt-1">
                      {result.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {result.errors.length > 5 && (
                        <li>...en {result.errors.length - 5} meer</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Source: Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="text-orange-600" size={20} />
              AI Scanner Leads
            </CardTitle>
            <CardDescription>Te migreren data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Totaal leads</span>
              <span className="font-semibold text-lg">{preview?.leads.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Unieke organisaties</span>
              <span className="font-semibold">{preview?.leads.uniqueOrganizations || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Met email</span>
              <span className="font-semibold">{preview?.leads.withEmail || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Met naam</span>
              <span className="font-semibold">{preview?.leads.withName || 0}</span>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-slate-500 mb-2">Status verdeling:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Nieuw:</span>
                  <span className="font-medium">{preview?.leads.byStatus.new || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gecontacteerd:</span>
                  <span className="font-medium">{preview?.leads.byStatus.contacted || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gekwalificeerd:</span>
                  <span className="font-medium">{preview?.leads.byStatus.qualified || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Geconverteerd:</span>
                  <span className="font-medium">{preview?.leads.byStatus.converted || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Destination: CRM */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="text-purple-600" size={20} />
              CRM Database
            </CardTitle>
            <CardDescription>Huidige stand</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center gap-2">
                <Building2 size={16} />
                Bedrijven
              </span>
              <span className="font-semibold text-lg">{preview?.existingCrm.companies || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center gap-2">
                <Users size={16} />
                Contacten
              </span>
              <span className="font-semibold text-lg">{preview?.existingCrm.contacts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center gap-2">
                <Briefcase size={16} />
                Deals
              </span>
              <span className="font-semibold text-lg">{preview?.existingCrm.deals || 0}</span>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-slate-500">
                De migratie zal nieuwe records toevoegen. Bestaande records worden niet overschreven.
                Duplicaten worden automatisch overgeslagen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Migration Flow Visual */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                <Brain className="text-orange-600" size={28} />
              </div>
              <p className="text-sm font-medium">Leads</p>
              <p className="text-xs text-slate-500">{preview?.leads.total || 0}</p>
            </div>
            <ArrowRight className="text-slate-300" size={32} />
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Building2 className="text-blue-600" size={28} />
              </div>
              <p className="text-sm font-medium">Bedrijven</p>
              <p className="text-xs text-slate-500">~{preview?.leads.uniqueOrganizations || 0}</p>
            </div>
            <ArrowRight className="text-slate-300" size={32} />
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <Users className="text-green-600" size={28} />
              </div>
              <p className="text-sm font-medium">Contacten</p>
              <p className="text-xs text-slate-500">~{preview?.leads.withEmail || 0}</p>
            </div>
            <ArrowRight className="text-slate-300" size={32} />
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                <Briefcase className="text-purple-600" size={28} />
              </div>
              <p className="text-sm font-medium">Deals</p>
              <p className="text-xs text-slate-500">~{preview?.leads.uniqueOrganizations || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Link href="/admin/crm">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Terug naar CRM
          </Button>
        </Link>
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={migrating || (preview?.leads.total || 0) === 0}
          size="lg"
        >
          {migrating ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Migreren...
            </>
          ) : (
            <>
              Migratie Starten
              <ArrowRight size={16} className="ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leads migreren naar CRM?</AlertDialogTitle>
            <AlertDialogDescription>
              Dit zal {preview?.leads.total || 0} leads converteren naar bedrijven, contacten en deals.
              Bestaande CRM-data wordt niet overschreven. Duplicaten worden automatisch overgeslagen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={runMigration}>
              Start Migratie
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
