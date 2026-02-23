export function KennisbankSkeleton() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <div className="h-6 w-28 bg-slate-200 rounded-full mb-4 animate-pulse" />
            <div className="h-9 w-64 bg-slate-200 rounded-lg mb-2 animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="h-5 w-24 bg-slate-200 rounded-full mb-3 animate-pulse" />
              <div className="h-4 w-full bg-slate-100 rounded mb-1 animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-100 rounded mb-4 animate-pulse" />
              <div className="h-3 w-full bg-slate-50 rounded mb-1 animate-pulse" />
              <div className="h-3 w-2/3 bg-slate-50 rounded mb-4 animate-pulse" />
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
