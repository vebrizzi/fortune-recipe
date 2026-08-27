import { useEffect, useRef, useState } from "react";
import { chiaveIconaRicetta, type Ricetta } from "../lib/recipes";
import { RecipeIcon } from "./RecipeIcon";

const COLORS = [
  "var(--color-ottanio)",
  "var(--color-ochre)",
  "var(--color-tomato)",
  "var(--color-wood)",
];

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
}

function slicePath(index: number, total: number) {
  const step = 360 / total;
  const start = index * step;
  const end = start + step;
  const [x1, y1] = polar(100, 100, 96, start);
  const [x2, y2] = polar(100, 100, 96, end);
  const large = step > 180 ? 1 : 0;
  return `M100,100 L${x1},${y1} A96,96 0 ${large},1 ${x2},${y2} Z`;
}

export function Wheel({
  items,
  spinning,
  targetIndex,
  onSettled,
}: {
  items: Ricetta[];
  spinning: boolean;
  targetIndex: number | null;
  onSettled: () => void;
}) {
  const [angle, setAngle] = useState(0);
  const turns = useRef(0);

  useEffect(() => {
    if (!spinning || targetIndex === null || items.length === 0) return;
    const step = 360 / items.length;
    const center = targetIndex * step + step / 2;
    turns.current += 6;
    setAngle(turns.current * 360 - center);
    const t = setTimeout(onSettled, 4600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, targetIndex, items.length]);

  const total = Math.max(items.length, 1);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[19rem] drop-shadow-md">
      <div className="absolute left-1/2 top-[-4px] z-10 h-0 w-0 -translate-x-1/2 border-x-[11px] border-t-[20px] border-x-transparent border-t-[var(--color-tomato)]" />
      <svg
        viewBox="0 0 200 200"
        className="wheel-spin h-full w-full"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <circle cx="100" cy="100" r="98" fill="var(--color-paper)" />
        {items.map((r, i) => {
          const step = 360 / total;
          const mid = i * step + step / 2;
          const [tx, ty] = polar(100, 100, 66, mid);
          return (
            <g key={r.id}>
              <path
                d={slicePath(i, total)}
                fill={COLORS[i % COLORS.length]}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth="1"
              />
              <g
                transform={`translate(${tx} ${ty}) rotate(${mid})`}
                style={{ filter: "drop-shadow(0 1px 1.5px rgba(47,72,88,0.35))" }}
              >
                <RecipeIcon chiave={chiaveIconaRicetta(r)} />
              </g>
            </g>
          );
        })}
        {items.length === 0 && (
          <text
            x="100"
            y="100"
            fontSize="12"
            textAnchor="middle"
            fill="var(--color-crust)"
            className="pixel-font"
          >
            Nessuna ricetta
          </text>
        )}
        <circle cx="100" cy="100" r="16" fill="var(--color-cream)" />
      </svg>
    </div>
  );
}
