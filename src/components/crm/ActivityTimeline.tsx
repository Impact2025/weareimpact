'use client';

import { Phone, Mail, Calendar, FileText, Building2, Briefcase } from 'lucide-react';
import { Activity, ActivityType } from '@/lib/crm/types';
import { formatRelativeDate, activityTypeLabels } from '@/lib/crm/labels';

const activityIcons: Record<ActivityType, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
};

const activityColors: Record<ActivityType, string> = {
  call: 'bg-green-100 text-green-600',
  email: 'bg-blue-100 text-blue-600',
  meeting: 'bg-purple-100 text-purple-600',
  note: 'bg-gray-100 text-gray-600',
};

interface ActivityTimelineProps {
  activities: Activity[];
  showEntity?: boolean;
}

export function ActivityTimeline({ activities, showEntity = true }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <FileText size={32} className="mx-auto mb-2 opacity-50" />
        <p>Nog geen activiteiten</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type] || FileText;
        const colorClass = activityColors[activity.type] || activityColors.note;

        return (
          <div key={activity.id} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-full ${colorClass}`}>
                <Icon size={14} />
              </div>
              {index < activities.length - 1 && (
                <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">{activity.subject}</p>
                  <p className="text-xs text-slate-400">
                    {activityTypeLabels[activity.type]} • {formatRelativeDate(activity.createdAt)}
                  </p>
                </div>
              </div>

              {activity.description && (
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">
                  {activity.description}
                </p>
              )}

              {activity.outcome && (
                <p className="text-sm text-slate-500 mt-1 italic">
                  Resultaat: {activity.outcome}
                </p>
              )}

              {showEntity && (activity.companyName || activity.dealTitle) && (
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  {activity.companyName && (
                    <span className="flex items-center gap-1">
                      <Building2 size={12} />
                      {activity.companyName}
                    </span>
                  )}
                  {activity.dealTitle && (
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} />
                      {activity.dealTitle}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
