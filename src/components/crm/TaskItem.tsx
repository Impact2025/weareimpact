'use client';

import { useState } from 'react';
import { Check, Circle, Calendar, Building2, Briefcase, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CrmTask } from '@/lib/crm/types';
import { formatDate, taskPriorityColors, taskPriorityLabels } from '@/lib/crm/labels';

interface TaskItemProps {
  task: CrmTask;
  onComplete?: (taskId: string) => Promise<void>;
  onUncomplete?: (taskId: string) => Promise<void>;
  onClick?: () => void;
  showEntity?: boolean;
}

export function TaskItem({ task, onComplete, onUncomplete, onClick, showEntity = true }: TaskItemProps) {
  const [loading, setLoading] = useState(false);

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();
  const isCompleted = task.status === 'completed';

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      if (isCompleted && onUncomplete) {
        await onUncomplete(task.id);
      } else if (!isCompleted && onComplete) {
        await onComplete(task.id);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        isCompleted
          ? 'bg-slate-50 border-slate-200'
          : isOverdue
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-slate-200 hover:border-slate-300'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Checkbox */}
      <Button
        variant="ghost"
        size="sm"
        className={`p-0 h-6 w-6 rounded-full ${
          isCompleted ? 'text-green-600' : 'text-slate-400 hover:text-orange-600'
        }`}
        onClick={handleToggle}
        disabled={loading}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isCompleted ? (
          <Check size={18} />
        ) : (
          <Circle size={18} />
        )}
      </Button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-medium ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
            {task.title}
          </p>
          <Badge className={`flex-shrink-0 ${taskPriorityColors[task.priority]}`}>
            {taskPriorityLabels[task.priority]}
          </Badge>
        </div>

        {task.description && (
          <p className={`text-sm mt-1 ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs">
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${
              isOverdue
                ? 'text-red-600 font-medium'
                : isToday
                ? 'text-orange-600 font-medium'
                : 'text-slate-400'
            }`}>
              {isOverdue && <AlertTriangle size={12} />}
              <Calendar size={12} />
              {isToday ? 'Vandaag' : formatDate(task.dueDate)}
            </span>
          )}

          {showEntity && (
            <>
              {task.companyName && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Building2 size={12} />
                  {task.companyName}
                </span>
              )}
              {task.dealTitle && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Briefcase size={12} />
                  {task.dealTitle}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
