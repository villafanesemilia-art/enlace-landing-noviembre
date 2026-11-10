import { EVENT } from "@/lib/event";

// Ciclo "atraer · vender · fidelizar": texto girando alrededor de dos flechas circulares.
function pt(angle: number, r: number): [number, number] {
  const rad = (angle * Math.PI) / 180;
  return [200 + r * Math.cos(rad), 200 + r * Math.sin(rad)];
}

function arc(from: number, to: number, r: number): string {
  const [x1, y1] = pt(from, r);
  const [x2, y2] = pt(to, r);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

const RING = "ATRAER · VENDER · FIDELIZAR · ".repeat(3);

export function CycleGraphic({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="Ciclo: atraer, vender, fidelizar">
      <defs>
        <marker id="head" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#D95325" />
        </marker>
        <path id="ring" d="M 40 200 a 160 160 0 1 1 320 0 a 160 160 0 1 1 -320 0" />
      </defs>

      <g className="animate-orbit" style={{ transformOrigin: "200px 200px" }}>
        <text fill="#FDFBF7" fillOpacity="0.85" fontSize="13" fontWeight="600" fontFamily="var(--font-mono)">
          <textPath href="#ring" textLength="1000" lengthAdjust="spacing">
            {RING}
          </textPath>
        </text>
      </g>

      <path d={arc(20, 160, 100)} fill="none" stroke="#D95325" strokeWidth="9" strokeLinecap="round" markerEnd="url(#head)" />
      <path d={arc(200, 340, 100)} fill="none" stroke="#D95325" strokeWidth="9" strokeLinecap="round" markerEnd="url(#head)" />

      <text x="200" y="192" textAnchor="middle" fill="#FDFBF7" fillOpacity="0.7" fontSize="13" fontWeight="600" letterSpacing="3" fontFamily="var(--font-mono)">
        {EVENT.weekday.toUpperCase().slice(0, 3)}
      </text>
      <text x="200" y="228" textAnchor="middle" fill="#FDFBF7" fontSize="38" fontWeight="800" fontFamily="var(--font-sans)">
        {EVENT.day}.11
      </text>
    </svg>
  );
}
