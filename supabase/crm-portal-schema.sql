-- CRM client portal: magic-link toegang voor klanten tot hun eigen,
-- gecureerde vragenlijst. Nooit de volledige interne dossierbestanden
-- (crm/<project>/open-vragen.md e.d.) — alleen wat expliciet in
-- crm_questions is gezet, is client-facing.

CREATE TABLE IF NOT EXISTS crm_projects (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug TEXT NOT NULL REFERENCES crm_projects(slug) ON DELETE CASCADE,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered')),
  client_answer TEXT,
  answered_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_questions_project
  ON crm_questions(project_slug, sort_order);

-- Magic links zijn single-use en kortlevend. We slaan een hash van het
-- token op, nooit het token zelf (zelfde principe als een wachtwoord-hash) —
-- zo lekt een leesbare DB-dump geen bruikbare links.
CREATE TABLE IF NOT EXISTS crm_magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug TEXT NOT NULL REFERENCES crm_projects(slug) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_magic_links_project
  ON crm_magic_links(project_slug);
