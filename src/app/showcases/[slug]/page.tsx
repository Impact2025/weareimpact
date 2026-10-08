import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/showcase/case';
import { ShowcaseArticle } from '@/components/showcase/ShowcaseArticle';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublished(slug).catch(() => null);
  if (!item) return { title: 'Showcase niet gevonden', robots: { index: false, follow: false } };
  const url = `https://weareimpact.nl/showcases/${slug}`;
  const description = item.snapshot.intro.slice(0, 160) || item.snapshot.headline;
  return {
    title: item.snapshot.headline,
    description,
    // Elke pagina verklaart zichzelf als origineel: de layout zet anders de homepage als canonical.
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title: item.snapshot.headline, description, locale: 'nl_NL', siteName: 'WeAreImpact' },
  };
}

export default async function ShowcasePage({ params }: Props) {
  const { slug } = await params;
  const item = await getPublished(slug).catch(() => null);
  if (!item) notFound();

  return (
    <main className="bg-[#FDFBF7] px-4 pb-20 pt-28 sm:pt-32">
      <ShowcaseArticle snapshot={item.snapshot} />
      <section className="mx-auto mt-14 max-w-3xl rounded-2xl bg-slate-900 p-8 text-white">
        <h2 className="text-2xl font-bold">Ook een knelpunt dat tijd kost?</h2>
        <p className="mt-2 text-slate-300">Plan een sparringsessie van 30 minuten. Dan weet je binnen een gesprek of en hoe ik kan helpen.</p>
        <Link href="/contact" className="mt-5 inline-flex rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700">
          Plan een gesprek
        </Link>
      </section>
      <p className="mx-auto mt-6 max-w-3xl text-sm text-slate-500">
        <Link href="/showcases" className="hover:underline">Alle klantvoorbeelden</Link>
      </p>
    </main>
  );
}
