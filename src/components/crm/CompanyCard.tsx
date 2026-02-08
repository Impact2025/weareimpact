'use client';

import Link from 'next/link';
import { Building2, Users, TrendingUp, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/lib/crm/types';
import { formatCurrency, industryLabels } from '@/lib/crm/labels';

interface CompanyCardProps {
  company: Company;
  onClick?: () => void;
}

export function CompanyCard({ company, onClick }: CompanyCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building2 size={20} className="text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{company.name}</h3>
              {company.city && (
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} />
                  {company.city}
                </p>
              )}
            </div>
          </div>
          {company.website && (
            <a
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-400 hover:text-orange-600"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4">
          {company.industry && (
            <Badge variant="outline" className="text-xs">
              {industryLabels[company.industry] || company.industry}
            </Badge>
          )}
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Users size={14} />
            <span>{company.contactCount || 0}</span>
          </div>
          {(company.dealCount ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <TrendingUp size={14} />
              <span>{company.dealCount} deals</span>
            </div>
          )}
        </div>

        {(company.pipelineValue ?? 0) > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-slate-500">Pipeline waarde</p>
            <p className="font-semibold text-orange-600">
              {formatCurrency(company.pipelineValue)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return (
    <Link href={`/admin/crm/bedrijven/${company.id}`}>
      {content}
    </Link>
  );
}
