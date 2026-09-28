import { parseBlocks } from '@/lib/finance/markdown';

// Rendert het kleine markdown-subset (alinea's, lijsten, **vet**) als React-nodes, zonder HTML-injectie.
export function Rich({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`space-y-4 text-[15.5px] leading-relaxed text-slate-700 ${className}`}>
      {parseBlocks(text).map((block, i) =>
        block.type === 'p' ? (
          <p key={i}>
            {block.inlines.map((s, k) =>
              s.bold ? <strong key={k} className="font-semibold text-slate-900">{s.text}</strong> : <span key={k}>{s.text}</span>,
            )}
          </p>
        ) : (
          <ul key={i} className="space-y-2">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-3">
                <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                <span>
                  {item.map((s, k) =>
                    s.bold ? <strong key={k} className="font-semibold text-slate-900">{s.text}</strong> : <span key={k}>{s.text}</span>,
                  )}
                </span>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
