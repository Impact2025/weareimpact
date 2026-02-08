'use client';

import { Building2, User, Calendar, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/lib/crm/types';
import { formatCurrency, formatDate, dealStageColors, dealStageLabels } from '@/lib/crm/labels';

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
  isDragging?: boolean;
  showStage?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export function DealCard({ deal, onClick, isDragging, showStage = false, dragHandleProps }: DealCardProps) {
  const isOverdue = deal.expectedCloseDate && new Date(deal.expectedCloseDate) < new Date();

  return (
    <Card
      className={`hover:shadow-md transition-all cursor-pointer ${
        isDragging ? 'shadow-lg rotate-2 opacity-90' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {dragHandleProps && (
            <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing mt-1">
              <GripVertical size={16} className="text-slate-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-900 truncate">{deal.title}</h4>

            {deal.companyName && (
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <Building2 size={12} />
                <span className="truncate">{deal.companyName}</span>
              </p>
            )}

            {deal.contactName && deal.contactName.trim() && (
              <p className="text-sm text-slate-400 flex items-center gap-1">
                <User size={12} />
                <span className="truncate">{deal.contactName}</span>
              </p>
            )}

            <div className="flex items-center justify-between mt-2">
              {deal.value ? (
                <span className="font-semibold text-orange-600">
                  {formatCurrency(deal.value)}
                </span>
              ) : (
                <span className="text-sm text-slate-400">Geen waarde</span>
              )}

              {showStage && (
                <Badge className={dealStageColors[deal.stage]}>
                  {dealStageLabels[deal.stage]}
                </Badge>
              )}
            </div>

            {deal.expectedCloseDate && (
              <p className={`text-xs flex items-center gap-1 mt-2 ${
                isOverdue ? 'text-red-600' : 'text-slate-400'
              }`}>
                <Calendar size={12} />
                {formatDate(deal.expectedCloseDate)}
                {isOverdue && <span className="font-medium">(verlopen)</span>}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
