'use client';

import { useState } from 'react';
import {
  Search,
  Brain,
  Mail,
  Phone,
  Building2,
  Calendar,
  ChevronRight,
  Download,
  Filter,
  Star,
  StarOff,
  Trash2,
  ExternalLink,
  TrendingUp,
  Users,
  Target,
  BarChart3,
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
import { Separator } from '@/components/ui/separator';

// Types
interface ScanLead {
  id: string;
  email: string;
  name?: string;
  organization?: string;
  phone?: string;
  createdAt: string;
  starred: boolean;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  scanData: {
    sector: string;
    challenge: string;
    aiUsage: string;
  };
  aiAdvice: string;
  source: string;
  notes?: string;
}

// Mock data
const mockLeads: ScanLead[] = [
  {
    id: 'lead-001',
    email: 'jan.devries@zorginstelling.nl',
    name: 'Jan de Vries',
    organization: 'Zorginstelling De Zonnewijzer',
    phone: '06-12345678',
    createdAt: '2024-01-15T14:30:00Z',
    starred: true,
    status: 'qualified',
    scanData: {
      sector: 'zorg',
      challenge: 'tijd',
      aiUsage: 'beetje',
    },
    aiAdvice:
      'Op basis van je antwoorden zie ik kansen voor AI-gedreven automatisering van administratieve taken. Met beperkte AI-ervaring adviseer ik te starten met een pilot voor geautomatiseerde rapportages. Dit kan direct 20% tijdwinst opleveren voor je medewerkers.',
    source: '/ai-scanner',
  },
  {
    id: 'lead-002',
    email: 'lisa.bakker@gemeente.nl',
    name: 'Lisa Bakker',
    organization: 'Gemeente Westerveld',
    createdAt: '2024-01-15T10:15:00Z',
    starred: false,
    status: 'new',
    scanData: {
      sector: 'overheid',
      challenge: 'tech',
      aiUsage: 'nee',
    },
    aiAdvice:
      'Als overheidsorganisatie met verouderde systemen en nog geen AI-ervaring, adviseer ik te beginnen met een inventarisatie van processen die veel handmatige data-invoer vereisen. Een LEGO® Serious Play sessie kan helpen om met je team de digitale transformatie te visualiseren.',
    source: '/ai-scanner',
  },
  {
    id: 'lead-003',
    email: 'peter.jansen@mkbbedrijf.nl',
    name: 'Peter Jansen',
    organization: 'TechStart BV',
    phone: '06-87654321',
    createdAt: '2024-01-14T16:45:00Z',
    starred: true,
    status: 'contacted',
    scanData: {
      sector: 'mkb',
      challenge: 'team',
      aiUsage: 'ja',
    },
    aiAdvice:
      'Als MKB-bedrijf dat al actief AI gebruikt, ligt de uitdaging vooral in teamontwikkeling. Ik adviseer een workshop waarin je team leert AI-tools effectief in te zetten. Dit vergroot adoptie en voorkomt eilandjes van kennis.',
    source: '/ai-scanner',
  },
  {
    id: 'lead-004',
    email: 'anna.smit@stichting.nl',
    name: 'Anna Smit',
    organization: 'Stichting Wijkwerk',
    createdAt: '2024-01-14T09:20:00Z',
    starred: false,
    status: 'converted',
    scanData: {
      sector: 'nonprofit',
      challenge: 'geld',
      aiUsage: 'beetje',
    },
    aiAdvice:
      'Voor non-profits met beperkt budget zijn er slimme manieren om AI in te zetten. Denk aan gratis tools voor vrijwilligerscoördinatie. DAAR - een van Vincent\'s ventures - kan hier perfect bij helpen met het meetbaar maken van impact.',
    source: '/ai-scanner',
  },
  {
    id: 'lead-005',
    email: 'mark.visser@zorginnovatie.nl',
    name: 'Mark Visser',
    organization: 'ZorgInnovatie Lab',
    createdAt: '2024-01-13T11:00:00Z',
    starred: false,
    status: 'new',
    scanData: {
      sector: 'zorg',
      challenge: 'tech',
      aiUsage: 'ja',
    },
    aiAdvice:
      'Als innovatielab in de zorg met al actieve AI-integratie, adviseer ik te focussen op privacy-first oplossingen. Vincent\'s ervaring met Bewaardvoorjou kan waardevol zijn voor het ethisch implementeren van AI in cliëntcontact.',
    source: '/ai-scanner',
  },
];

const sectorLabels: Record<string, string> = {
  zorg: 'Zorg & Welzijn',
  overheid: 'Onderwijs & Overheid',
  mkb: 'MKB / Commercieel',
  nonprofit: 'Non-profit / Stichting',
};

const challengeLabels: Record<string, string> = {
  tijd: 'Tijd & Capaciteit',
  geld: 'Financiering',
  tech: 'Verouderde Systemen',
  team: 'Teamontwikkeling',
};

const aiUsageLabels: Record<string, string> = {
  nee: 'Geen AI',
  beetje: 'Beperkt (ChatGPT)',
  ja: 'Actief geïntegreerd',
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
};

const statusLabels: Record<string, string> = {
  new: 'Nieuw',
  contacted: 'Gecontacteerd',
  qualified: 'Gekwalificeerd',
  converted: 'Klant',
};

export default function AdminLeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<ScanLead | null>(null);
  const [leads, setLeads] = useState(mockLeads);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.organization?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector =
      sectorFilter === 'all' || lead.scanData.sector === sectorFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesSector && matchesStatus;
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    converted: leads.filter((l) => l.status === 'converted').length,
  };

  const toggleStar = (id: string) => {
    setLeads(
      leads.map((lead) =>
        lead.id === id ? { ...lead, starred: !lead.starred } : lead
      )
    );
  };

  const updateStatus = (id: string, status: ScanLead['status']) => {
    setLeads(
      leads.map((lead) => (lead.id === id ? { ...lead, status } : lead))
    );
    if (selectedLead?.id === id) {
      setSelectedLead({ ...selectedLead, status });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const exportLeads = () => {
    const data = filteredLeads.map((lead) => ({
      naam: lead.name || '-',
      email: lead.email,
      organisatie: lead.organization || '-',
      telefoon: lead.phone || '-',
      sector: sectorLabels[lead.scanData.sector],
      uitdaging: challengeLabels[lead.scanData.challenge],
      ai_niveau: aiUsageLabels[lead.scanData.aiUsage],
      status: statusLabels[lead.status],
      datum: formatDate(lead.createdAt),
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map((row) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Scanner Leads</h1>
          <p className="text-slate-500 mt-1">
            Beheer leads uit de AI-readiness scanner
          </p>
        </div>
        <Button onClick={exportLeads} variant="outline">
          <Download size={18} className="mr-2" />
          Exporteer CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Users size={16} />
              Totaal Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Target size={16} />
              Nieuwe Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <BarChart3 size={16} />
              Gekwalificeerd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.qualified}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <TrendingUp size={16} />
              Conversies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.converted}
            </div>
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
                placeholder="Zoek op naam, email of organisatie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle sectoren</SelectItem>
                  <SelectItem value="zorg">Zorg & Welzijn</SelectItem>
                  <SelectItem value="overheid">Onderwijs & Overheid</SelectItem>
                  <SelectItem value="mkb">MKB / Commercieel</SelectItem>
                  <SelectItem value="nonprofit">Non-profit</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  <SelectItem value="new">Nieuw</SelectItem>
                  <SelectItem value="contacted">Gecontacteerd</SelectItem>
                  <SelectItem value="qualified">Gekwalificeerd</SelectItem>
                  <SelectItem value="converted">Klant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Uitdaging</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedLead(lead)}
                >
                  <TableCell>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(lead.id);
                      }}
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      {lead.starred ? (
                        <Star
                          size={18}
                          className="text-yellow-500 fill-yellow-500"
                        />
                      ) : (
                        <StarOff size={18} className="text-slate-300" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">
                        {lead.name || lead.email}
                      </p>
                      {lead.organization && (
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Building2 size={12} />
                          {lead.organization}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {sectorLabels[lead.scanData.sector]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {challengeLabels[lead.scanData.challenge]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[lead.status]}>
                      {statusLabels[lead.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar size={14} />
                      {formatDate(lead.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ChevronRight size={18} className="text-slate-400" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Brain size={48} className="mx-auto mb-4 opacity-50" />
              <p>Geen leads gevonden</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain size={20} className="text-orange-600" />
              Lead Details
            </DialogTitle>
            <DialogDescription>
              Bekijk en beheer deze lead
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Contactgegevens
                  </h3>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Mail size={18} className="text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <a
                          href={`mailto:${selectedLead.email}`}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {selectedLead.email}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                    {selectedLead.name && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Users size={18} className="text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Naam</p>
                          <p className="font-medium">{selectedLead.name}</p>
                        </div>
                      </div>
                    )}
                    {selectedLead.organization && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Building2 size={18} className="text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Organisatie</p>
                          <p className="font-medium">{selectedLead.organization}</p>
                        </div>
                      </div>
                    )}
                    {selectedLead.phone && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Phone size={18} className="text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Telefoon</p>
                          <a
                            href={`tel:${selectedLead.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {selectedLead.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Scan Results */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Scan Resultaten
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500">Sector</p>
                      <p className="font-medium">
                        {sectorLabels[selectedLead.scanData.sector]}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500">Uitdaging</p>
                      <p className="font-medium">
                        {challengeLabels[selectedLead.scanData.challenge]}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500">AI Niveau</p>
                      <p className="font-medium">
                        {aiUsageLabels[selectedLead.scanData.aiUsage]}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* AI Advice */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">
                    AI Advies
                  </h3>
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                    <p className="text-slate-700 leading-relaxed">
                      {selectedLead.aiAdvice}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Status Update */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Status Wijzigen
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(['new', 'contacted', 'qualified', 'converted'] as const).map(
                      (status) => (
                        <Button
                          key={status}
                          variant={
                            selectedLead.status === status ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => updateStatus(selectedLead.id, status)}
                          className={
                            selectedLead.status === status
                              ? 'bg-orange-600 hover:bg-orange-700'
                              : ''
                          }
                        >
                          {statusLabels[status]}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 size={14} className="mr-2" />
              Verwijderen
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedLead) {
                    window.open(`mailto:${selectedLead.email}`, '_blank');
                  }
                }}
              >
                <Mail size={14} className="mr-2" />
                Email
              </Button>
              {selectedLead?.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedLead) {
                      window.open(`tel:${selectedLead.phone}`, '_blank');
                    }
                  }}
                >
                  <Phone size={14} className="mr-2" />
                  Bellen
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
