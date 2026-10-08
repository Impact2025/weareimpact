import type { Metadata } from 'next';
import Link from 'next/link';
import { listPublished } from '@/lib/showcase/case';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Klantvoorbeelden',
  description: 'Wat ondernemers en organisaties met WeAreImpact bereikten: minder handwerk, sneller live, in hun eigen woorden.',
  alternates: { canonical: 'https://weareimpact.nl/showcases' },
};

export default async function ShowcasesPage() {
  const items = await listPublished().catch(() => []);

  return (
    <main className="bg-[#FDFBF7] px-4 pb-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Klantvoorbeelden</h1>
        <p className="mt-3 text-lg text-slate-700">Wat het opleverde, in de woorden van de klant en met gemeten cijfers.</p>

        {items.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">De eerste voorbeelden volgen binnenkort.</p>
        ) : (
          <ul className="mt-10 space-y-4">
            {items.map((i) => (
              <li key={i.slug}>
                <Link href={`/showcases/${i.slug}`} className="block rounded-2xl border border-orange-100 bg-white p-6 transition-shadow hover:shadow-md">
                  <p className="text-sm font-semibold text-orange-600">{i.snapshot.displayName}</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{i.snapshot.headline}</h2>
                  {i.snapshot.intro && <p className="mt-2 text-slate-600">{i.snapshot.intro.slice(0, 180)}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
