import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Contextuele link van een kennisbankartikel terug naar de bijbehorende
 * dienstpagina.
 *
 * Reden: alle dienstpagina's linken naar de kennisbank, maar geen enkel artikel
 * linkte terug. Daardoor stroomde interne linkwaarde structureel weg van de
 * pagina's die moeten ranken. De ankertekst is bewust het exacte zoekwoord.
 */

interface Service {
  /** Ankertekst — bewust gelijk aan het zoekwoord waarop de pagina moet ranken. */
  anchor: string;
  href: string;
  /** Zin waarin de link staat; {link} wordt vervangen door de ankertekst. */
  sentence: string;
  /** Termen die in slug, tags, categorie of titel op dit onderwerp wijzen. */
  match: string[];
}

const SERVICES: Service[] = [
  {
    anchor: 'programmamanager digitale transformatie',
    href: '/programmamanager-digitale-transformatie',
    sentence:
      'Loopt je transformatieprogramma vast tussen ambitie en uitvoering? Ik werk als {link} voor gemeenten, zorg en welzijn.',
    match: [
      'digitale-transformatie',
      'digitale transformatie',
      'transformatie',
      'digitalisering',
      'roadmap',
      'programmamanagement',
    ],
  },
  {
    anchor: 'change management bij digitale transformatie',
    href: '/change-management-digitale-transformatie',
    sentence:
      'Zit de weerstand niet in de techniek maar in de mensen? Zo pak ik {link} aan.',
    match: [
      'change-management',
      'cultuurverandering',
      'draagvlak',
      'weerstand',
      'lego-serious-play',
      'lego serious play',
      'eigenaarschap',
      'teamontwikkeling',
    ],
  },
  {
    anchor: 'interim verandermanagement in het sociaal domein',
    href: '/interim-verandermanagement-ai-sociaal-domein',
    sentence:
      'Tijdelijk iemand nodig die dit van binnenuit trekt? Lees meer over {link}.',
    match: ['interim', 'interim-manager', 'projectleider', 'verandermanagement'],
  },
  {
    anchor: 'AI strategie consultant',
    href: '/ai-strategie-consultant',
    sentence:
      'Wil je hier een strategie van maken die op één A4 past? Ik werk als {link} voor gemeenten en welzijn.',
    match: [
      'ai-strategie',
      'strategie',
      'governance',
      'ai-act',
      'algoritmeregister',
      'business-case',
      'business case',
      'beleid',
    ],
  },
  {
    anchor: 'AI consultant sociaal domein',
    href: '/ai-consultant-sociaal-domein',
    sentence:
      'Wil je dit in je eigen organisatie werkend krijgen? Ik help als {link}.',
    // Bewust breed: dit is de terugvaloptie voor alle overige AI-artikelen.
    match: [
      'ai',
      'ai-implementatie',
      'kunstmatige intelligentie',
      'chatgpt',
      'privacy',
      'avg',
      'welzijn',
      'sociaal-domein',
      'sociaal domein',
      'gemeente',
      'non-profit',
    ],
  },
];

interface RelatedServiceProps {
  slug: string;
  title: string;
  tags?: string[];
  categorySlug?: string;
}

/** Kiest de dienst met de meeste term-treffers; specifieke diensten staan bovenaan. */
export function pickService({
  slug,
  title,
  tags = [],
  categorySlug = '',
}: RelatedServiceProps): Service | null {
  // tags kan uit de database als null terugkomen, niet alleen als undefined.
  const safeTags = Array.isArray(tags) ? tags : [];
  const haystack = [slug, title, categorySlug ?? '', ...safeTags]
    .join(' ')
    .toLowerCase();

  let best: Service | null = null;
  let bestScore = 0;

  for (const service of SERVICES) {
    const score = service.match.filter((term) => haystack.includes(term)).length;
    // Strikt groter dan: bij gelijkspel wint de eerste, en dus de meest specifieke.
    if (score > bestScore) {
      best = service;
      bestScore = score;
    }
  }

  return best;
}

export function RelatedService(props: RelatedServiceProps) {
  const service = pickService(props);
  if (!service) return null;

  const [before, after] = service.sentence.split('{link}');

  return (
    <section className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6">
      <p className="text-slate-700 leading-relaxed">
        {before}
        <Link
          href={service.href}
          className="font-semibold text-orange-600 underline underline-offset-4 hover:text-orange-700"
        >
          {service.anchor}
        </Link>
        {after}
      </p>
      <Link
        href={service.href}
        className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-orange-600"
      >
        Bekijk de aanpak
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </section>
  );
}
