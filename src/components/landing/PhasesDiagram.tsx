/**
 * Stroomdiagram van de zes fases, met het besluitpunt (fase 4) als ruit en de
 * twee uitgangen "bijsturen" en "stoppen". Alleen op md+; op mobiel staat de
 * genummerde lijst eronder al in dezelfde volgorde.
 */
const NODES = [
  { nr: '1', a: 'Probleem', b: 'scherp' },
  { nr: '2', a: 'Rand-', b: 'voorwaarden' },
  { nr: '3', a: 'Pilot', b: '4-6 weken' },
  { nr: '4', a: 'Besluit', b: 'go / no-go' },
  { nr: '5', a: 'Opschalen', b: 'naar productie' },
  { nr: '6', a: 'Overdracht', b: 'aan jouw team' },
];
const X = (i: number) => 90 + i * 164;

export function PhasesDiagram() {
  return (
    <figure className="hidden md:block mb-14">
      <svg
        viewBox="0 0 1000 330"
        role="img"
        aria-labelledby="phases-title phases-desc"
        className="w-full h-auto"
      >
        <title id="phases-title">De zes fases van een AI-project</title>
        <desc id="phases-desc">
          Probleem scherp, randvoorwaarden, pilot van vier tot zes weken, besluit, opschalen naar productie en overdracht. Bij het besluit kun je doorgaan, bijsturen naar de pilot of stoppen.
        </desc>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#94a3b8" />
          </marker>
          <marker id="arr-o" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#fb923c" />
          </marker>
        </defs>

        {/* verbindingen */}
        {NODES.slice(0, -1).map((_, i) => (
          <line key={i} x1={X(i) + 40} y1="120" x2={X(i + 1) - 40} y2="120" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arr)" />
        ))}

        {/* bijsturen: van besluit terug naar pilot */}
        <path d={`M ${X(3) - 8} 80 C ${X(3) - 20} 20, ${X(2) + 20} 20, ${X(2) + 8} 80`} fill="none" stroke="#fb923c" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#arr-o)" />
        <text x={(X(2) + X(3)) / 2} y="30" textAnchor="middle" fontSize="14" fill="#fb923c" fontWeight="600">bijsturen</text>

        {/* stoppen */}
        <line x1={X(3)} y1="216" x2={X(3)} y2="250" stroke="#fb923c" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#arr-o)" />
        <rect x={X(3) - 118} y="252" width="236" height="46" rx="23" fill="none" stroke="#fb923c" strokeWidth="2" />
        <text x={X(3)} y="280" textAnchor="middle" fontSize="15" fill="#fed7aa" fontWeight="600">Stoppen is een geldige uitkomst</text>

        {/* nodes */}
        {NODES.map((n, i) => {
          const x = X(i);
          const isDecision = i === 3;
          return (
            <g key={n.nr}>
              {isDecision ? (
                <polygon points={`${x},76 ${x + 44},120 ${x},164 ${x - 44},120`} fill="#ea580c" />
              ) : (
                <circle cx={x} cy="120" r="38" fill="#ea580c" />
              )}
              <text x={x} y="129" textAnchor="middle" fontSize="26" fontWeight="700" fill="#fff">{n.nr}</text>
              <text x={x} y="190" textAnchor="middle" fontSize="16" fontWeight="600" fill="#f1f5f9">{n.a}</text>
              <text x={x} y="210" textAnchor="middle" fontSize="14" fill="#94a3b8">{n.b}</text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
