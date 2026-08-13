-- WeAreImpact Database Schema
-- Run this script to set up the database tables

-- AI Scanner Leads table
CREATE TABLE IF NOT EXISTS ai_scan_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  name VARCHAR(255),
  organization VARCHAR(255),
  phone VARCHAR(50),
  sector VARCHAR(50) NOT NULL,
  challenge VARCHAR(50) NOT NULL,
  ai_usage VARCHAR(50) NOT NULL,
  ai_advice TEXT,
  source VARCHAR(100) DEFAULT '/ai-scanner',
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
  starred BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id VARCHAR(100) NOT NULL,
  source VARCHAR(20) DEFAULT 'widget' CHECK (source IN ('widget', 'booking', 'scan', 'kennisbank')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  page_url VARCHAR(500),
  referrer VARCHAR(500),
  device VARCHAR(50),
  user_agent TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Views / Analytics table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id VARCHAR(100) NOT NULL,
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  referrer VARCHAR(500),
  user_agent TEXT,
  device VARCHAR(50),
  country VARCHAR(100),
  city VARCHAR(100),
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table (general leads from booking, contact forms, etc.)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  source VARCHAR(100) NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
  starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log table (for recent activity feed)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('scan', 'chat', 'blog', 'lead', 'page_view', 'booking', 'newsletter')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Impact Calculator Leads table
CREATE TABLE IF NOT EXISTS impact_calculator_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  naam VARCHAR(255),
  organisatie VARCHAR(255),
  fte INTEGER,
  admin_pct INTEGER,
  ai_pct INTEGER,
  uurloon NUMERIC(6,2),
  weekly_hours_saved NUMERIC(8,2),
  yearly_hours_saved NUMERIC(10,2),
  extra_contacts_per_month INTEGER,
  gross_savings_per_year NUMERIC(12,2),
  hours_per_fte NUMERIC(6,2),
  burnout_range VARCHAR(20),
  investering_kosten NUMERIC(10,2),
  avoided_verzuim_euro NUMERIC(12,2),
  sroi_ratio NUMERIC(6,2),
  source VARCHAR(100) DEFAULT 'impact-calculator',
  email_sent BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
  starred BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_impact_calc_leads_created ON impact_calculator_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_impact_calc_leads_status ON impact_calculator_leads(status);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_scan_leads_created ON ai_scan_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_scan_leads_status ON ai_scan_leads(status);
CREATE INDEX IF NOT EXISTS idx_ai_scan_leads_sector ON ai_scan_leads(sector);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_started ON chat_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor ON chat_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);

CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(type);

-- =============================================
-- CRM TABLES
-- =============================================

-- BEDRIJVEN (Companies)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONTACTEN (Contacts)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    job_title VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    tags TEXT[],
    source VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DEALS (Pipeline)
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    value DECIMAL(12,2),
    stage VARCHAR(50) NOT NULL DEFAULT 'lead',
    probability INTEGER DEFAULT 10,
    expected_close_date DATE,
    description TEXT,
    source VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACTIVITEITEN (Timeline)
CREATE TABLE IF NOT EXISTS crm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    outcome VARCHAR(100),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TAKEN (Tasks)
CREATE TABLE IF NOT EXISTS crm_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'pending',
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LEAD MACHINE TABLES
-- =============================================

-- Named lists / saved searches
CREATE TABLE IF NOT EXISTS lead_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(50) DEFAULT 'weareimpact',
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sbi_codes TEXT[],
  regions TEXT[],
  total_count INTEGER DEFAULT 0,
  scored_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prospect organizations discovered via KVK + AI-scored
CREATE TABLE IF NOT EXISTS prospect_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(50) DEFAULT 'weareimpact',
  kvk_number VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255),
  sbi_code VARCHAR(10),
  sbi_description VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  website VARCHAR(500),
  email VARCHAR(255),
  phone VARCHAR(50),
  contact_person VARCHAR(255),
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 10),
  ai_rationale TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'archived')),
  starred BOOLEAN DEFAULT FALSE,
  notes TEXT,
  list_id UUID REFERENCES lead_lists(id) ON DELETE SET NULL,
  crm_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  scraped_at TIMESTAMP WITH TIME ZONE,
  scored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospect_leads_tenant ON prospect_leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prospect_leads_status ON prospect_leads(status);
CREATE INDEX IF NOT EXISTS idx_prospect_leads_score ON prospect_leads(ai_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_prospect_leads_created ON prospect_leads(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_prospect_leads_kvk ON prospect_leads(kvk_number) WHERE kvk_number IS NOT NULL;

-- =============================================
-- SEO: 404 ERROR LOG
-- =============================================

CREATE TABLE IF NOT EXISTS error_404_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url         VARCHAR(1000) NOT NULL,
  referrer    VARCHAR(1000),
  user_agent  VARCHAR(500),
  hit_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_404_url    ON error_404_log(url);
CREATE INDEX IF NOT EXISTS idx_404_hit_at ON error_404_log(hit_at DESC);

-- =============================================
-- AGENTOS / IRIS INTAKE
-- =============================================

CREATE TABLE IF NOT EXISTS intake_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  organisation VARCHAR(255),
  phone VARCHAR(50),
  answers JSONB NOT NULL,
  duration_seconds INTEGER,
  source VARCHAR(100) DEFAULT '/intake',
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
  starred BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intake_submissions_created ON intake_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intake_submissions_status ON intake_submissions(status);

-- CRM Indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_created ON companies(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_created ON deals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_activities_company ON crm_activities(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact ON crm_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_deal ON crm_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created ON crm_activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_company ON crm_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_deal ON crm_tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON crm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_date ON crm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_created ON crm_tasks(created_at DESC);
