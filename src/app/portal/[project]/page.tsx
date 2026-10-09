import { cookies } from 'next/headers';
import { sql } from '@/lib/db/neon';
import { resolvePortalAudience } from '@/lib/crm/portal-session';
import PortalTabs from './PortalTabs';

export const dynamic = 'force-dynamic';

export default async function PortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ project: string }>;
  searchParams: Promise<{ error?: string; tab?: string }>;
}) {
  const { project: projectSlug } = await params;
  const { error, tab } = await searchParams;

  const store = await cookies();
  const audience = await resolvePortalAudience(projectSlug, (name) => store.get(name)?.value);

  if (!audience) {
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

  const projectRows = await sql`SELECT name, client_name, pulse_enabled FROM crm_projects WHERE slug = ${projectSlug}`;
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
          Welkom in het voortgangsportaal van {project.name}. Hier volg je de status en oplevering
          van het werk volgens onze afspraken, beantwoord je vragen en deel je documenten.
        </p>
        <PortalTabs projectSlug={projectSlug} audience={audience} pulseEnabled={!!project.pulse_enabled} initialTab={tab} />
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
