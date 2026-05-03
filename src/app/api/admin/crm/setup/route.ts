import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// POST - Create CRM tables
export async function POST() {
  try {
    // Create companies table
    await sql`
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
      )
    `;

    // Create contacts table
    await sql`
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
      )
    `;

    // Create deals table
    await sql`
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
      )
    `;

    // Create crm_activities table
    await sql`
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
      )
    `;

    // Create crm_tasks table
    await sql`
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
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_companies_created ON companies(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crm_activities_company ON crm_activities(company_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crm_activities_created ON crm_activities(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crm_tasks_company ON crm_tasks(company_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON crm_tasks(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_date ON crm_tasks(due_date)`;

    return NextResponse.json({
      success: true,
      message: 'CRM tables created successfully'
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      error: 'Failed to create tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
