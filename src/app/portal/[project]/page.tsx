import { cookies } from 'next/headers';
import { sql } from '@/lib/db/neon';
import { isValidPortalSessionToken, portalCookieName } from '@/lib/crm/portal-session';
import ChatClient from './ChatClient';

export const dynamic = 'force-dynamic';

export default async function PortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ project: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { project: projectSlug } = await params;
  const { error } = await searchParams;

  const store = await cookies();
  const token = store.get(portalCookieName(projectSlug))?.value;
  const authenticated = await isValidPortalSessionToken(token, projectSlug);

  if (!authenticated) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Geen toegang</h1>
          <p style={styles.text}>
            {error === 'invalid_link'
              ? 'Deze link is ongeldig, al gebruikt, of verlopen.'
              : 'Deze pagina is alleen bereikbaar via een persoonlijke link.'}
          </p>
          <p style={styles.text}>Neem contact op met WeAreImpact voor een nieuwe link.</p>
        </div>
      </main>
    );
  }

  const projectRows = await sql`SELECT name, client_name FROM crm_projects WHERE slug = ${projectSlug}`;
  const project = projectRows[0];

  if (!project) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Project niet gevonden</h1>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{project.name}</h1>
        <p style={styles.text}>
          Iris loopt met je door een paar vragen. Antwoord in je eigen woorden en schrijf gerust
          uitgebreid — hoe meer je deelt, hoe beter we je kunnen helpen. Je kunt dit venster
          altijd sluiten en later verdergaan.
        </p>
        <ChatClient projectSlug={projectSlug} />
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8f9fb',
    display: 'flex',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: 640,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 8,
    color: '#1a1a2e',
  },
  text: {
    fontSize: 15,
    lineHeight: 1.5,
    color: '#444',
    marginBottom: 16,
  },
} as const;
