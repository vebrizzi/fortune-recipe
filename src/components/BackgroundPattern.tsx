import { RecipeIcon } from "./RecipeIcon";
import type { IconaChiave } from "../lib/recipes";

const TILE = 150;

const ICONE_PATTERN: Array<{ chiave: IconaChiave; x: number; y: number; rot: number; scala: number }> = [
  { chiave: "pasta", x: 20, y: 20, rot: -12, scala: 0.9 },
  { chiave: "pollo", x: 105, y: 15, rot: 18, scala: 0.8 },
  { chiave: "insalata", x: 60, y: 75, rot: 6, scala: 0.9 },
  { chiave: "frutta", x: 125, y: 105, rot: -18, scala: 0.85 },
  { chiave: "riso", x: 15, y: 115, rot: 10, scala: 0.8 },
  { chiave: "pesce", x: 85, y: 130, rot: -6, scala: 0.85 },
];

/**
 * Motivo decorativo di sfondo: le stesse icone illustrate della ruota,
 * ripetute a tappeto dietro ai contenuti, molto trasparenti per non
 * distrarre dalla lettura.
 */
export function BackgroundPattern() {
  return (
    <svg
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: -1, opacity: 0.3 }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="pattern-icone-sfondo"
          width={TILE}
          height={TILE}
          patternUnits="userSpaceOnUse"
        >
          {ICONE_PATTERN.map((icona, i) => (
            <g
              key={i}
              transform={`translate(${icona.x} ${icona.y}) rotate(${icona.rot}) scale(${icona.scala})`}
            >
              <RecipeIcon chiave={icona.chiave} />
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pattern-icone-sfondo)" />
    </svg>
  );
}
