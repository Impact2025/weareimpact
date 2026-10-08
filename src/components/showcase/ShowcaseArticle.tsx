import type { CaseSnapshot } from '@/lib/showcase/case';

// De showcase zoals de klant hem ter goedkeuring ziet en zoals hij later op de site staat: één component,
// zodat wat de klant goedkeurt exact is wat er gepubliceerd wordt.
export function ShowcaseArticle({ snapshot, preview = false }: { snapshot: CaseSnapshot; preview?: boolean }) {
  const { headline, intro, displayName, authorLine, quotes, hoursBefore, hoursAfter, facts } = snapshot;
  const hasHours = hoursBefore != null && hoursAfter != null;

  return (
    <article className="mx-auto w-full max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
        {preview ? 'Voorbeeld van de tekst' : 'Klantvoorbeeld'}
        {displayName ? <span className="text-slate-400"> · {displayName}</span> : null}
      </p>
      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">{headline}</h1>
      {intro && <p className="mt-5 text-lg leading-relaxed text-slate-700">{intro}</p>}

      {(hasHours || facts.length > 0) && (
        <dl className="mt-8 grid gap-3 sm:grid-cols-2">
          {hasHours && (
            <div className="rounded-2xl border border-orange-100 bg-white p-5 sm:col-span-2">
              <dt className="text-sm text-slate-500">Tijd per week</dt>
              <dd className="mt-1 flex items-baseline gap-3 text-slate-900">
                <span className="text-4xl font-bold">{hoursBefore}</span>
                <span className="text-slate-400" aria-hidden>→</span>
                <span className="text-4xl font-bold text-orange-600">{hoursAfter}</span>
                <span className="text-lg text-slate-600">uur</span>
              </dd>
            </div>
          )}
          {facts.map((f) => (
            <div key={f} className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-800">
              {f}
            </div>
          ))}
        </dl>
      )}

      {quotes.length > 0 && (
        <div className="mt-10 space-y-6">
          {quotes.map((q, i) => (
            <figure key={i} className="border-l-4 border-orange-500 bg-white py-4 pl-5 pr-4">
              <blockquote className="text-lg leading-relaxed text-slate-900">&ldquo;{q.text}&rdquo;</blockquote>
              {authorLine && i === quotes.length - 1 && <figcaption className="mt-2 text-sm text-slate-500">{authorLine}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </article>
  );
}
