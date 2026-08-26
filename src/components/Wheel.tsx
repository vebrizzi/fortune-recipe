import { useEffect, useRef, useState } from "react";
import { iconaRicetta, type Ricetta } from "../lib/recipes";

const COLORS = [
  "var(--color-ochre)",
  "var(--color-tomato)",
  "var(--color-ottanio)",
  "var(--color-wood-light)",
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
    <div className="relative mx-auto aspect-square w-full max-w-[19rem]">
      <div className="absolute left-1/2 top-[-10px] z-10 h-0 w-0 -translate-x-1/2 border-x-[14px] border-t-[24px] border-x-transparent border-t-[var(--color-crust)]" />
      <div className="absolute left-1/2 top-[-6px] z-10 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[18px] border-x-transparent border-t-[var(--color-tomato)]" />
      <svg
        viewBox="0 0 200 200"
        className="wheel-spin h-full w-full"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <circle cx="100" cy="100" r="99" fill="var(--color-paper)" stroke="var(--color-crust)" strokeWidth="4" />
        {items.map((r, i) => {
          const step = 360 / total;
          const mid = i * step + step / 2;
          const [tx, ty] = polar(100, 100, 68, mid);
          return (
            <g key={r.id}>
              <path
                d={slicePath(i, total)}
                fill={COLORS[i % COLORS.length]}
                stroke="var(--color-crust)"
                strokeWidth="2"
              />
              <text
                x={tx}
                y={ty}
                fontSize="16"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${mid} ${tx} ${ty})`}
              >
                {iconaRicetta(r)}
              </text>
            </g>
          );
        })}
        {items.length === 0 && (
          <text
            x="100"
            y="100"
            fontSize="9"
            textAnchor="middle"
            fill="var(--color-crust)"
            className="pixel-font"
          >
            Nessuna ricetta
          </text>
        )}
        <circle cx="100" cy="100" r="18" fill="var(--color-cream)" stroke="var(--color-crust)" strokeWidth="4" />
      </svg>
    </div>
  );
}
