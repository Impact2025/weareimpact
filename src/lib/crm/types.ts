// CRM TypeScript Types

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields from joins
  contactCount?: number;
  dealCount?: number;
  pipelineValue?: number;
}

export interface Contact {
  id: string;
  companyId?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  isPrimary: boolean;
  notes?: string;
  tags?: string[];
  source?: string;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  companyName?: string;
}

export interface Deal {
  id: string;
  companyId?: string;
  contactId?: string;
  title: string;
  value?: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate?: string;
  description?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  companyName?: string;
  contactName?: string;
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Activity {
  id: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  type: ActivityType;
  subject: string;
  description?: string;
  outcome?: string;
  completedAt?: string;
  createdAt: string;
  // Joined fields
  companyName?: string;
  contactName?: string;
  dealTitle?: string;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'note';

export interface CrmTask {
  id: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  // Joined fields
  companyName?: string;
  contactName?: string;
  dealTitle?: string;
}

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Dashboard types
export interface PipelineStats {
  totalValue: number;
  dealCount: number;
  weightedValue: number;
  byStage: {
    stage: DealStage;
    count: number;
    value: number;
  }[];
}

export interface DashboardStats {
  pipeline: PipelineStats;
  tasksToday: number;
  tasksPending: number;
  overdueFollowups: number;
  recentWins: {
    title: string;
    value: number;
    closedAt: string;
  }[];
}

// Form types for creating/updating
export interface CompanyInput {
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface ContactInput {
  companyId?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  isPrimary?: boolean;
  notes?: string;
  tags?: string[];
  source?: string;
}

export interface DealInput {
  companyId?: string;
  contactId?: string;
  title: string;
  value?: number;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: string;
  description?: string;
  source?: string;
}

export interface ActivityInput {
  companyId?: string;
  contactId?: string;
  dealId?: string;
  type: ActivityType;
  subject: string;
  description?: string;
  outcome?: string;
}

export interface TaskInput {
  companyId?: string;
  contactId?: string;
  dealId?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}
