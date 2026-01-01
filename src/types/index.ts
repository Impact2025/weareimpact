// Blog types
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: BlogCategory;
  tags: string[];
  author: Author;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  status: 'draft' | 'published';
  seo: SEOMeta;
}

export type BlogCategory = 'ai' | 'impact' | 'strategie' | 'nieuws';

export interface Author {
  name: string;
  avatar?: string;
  bio?: string;
}

export interface SEOMeta {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}

// AI Scanner types
export interface ScanQuestion {
  id: number;
  question: string;
  options: ScanOption[];
}

export interface ScanOption {
  label: string;
  value: string;
  description?: string;
}

export interface ScanResult {
  title: string;
  summary: string;
  recommendations: string[];
  matchedTraject: string;
  confidence: number;
}

export interface ScanAnswers {
  [questionId: number]: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  metadata?: {
    topic?: string;
    source?: string;
  };
}

// Voice types
export interface VoiceCommand {
  command: string;
  action: 'navigate' | 'query' | 'action';
  target?: string;
  response?: string;
}

// Lead types
export interface Lead {
  id: string;
  email?: string;
  scanResults?: ScanResult;
  chatHistory?: ChatMessage[];
  source: 'scanner' | 'chat' | 'contact';
  createdAt: Date;
}

// Admin types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

export interface DashboardStats {
  totalVisitors: number;
  totalScans: number;
  totalChats: number;
  totalLeads: number;
  conversionRate: number;
}
