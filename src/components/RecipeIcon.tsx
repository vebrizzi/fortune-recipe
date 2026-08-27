import type { IconaChiave } from "../lib/recipes";

/**
 * Icone illustrate a colori pieni (non emoji): ogni icona e' un piccolo
 * disegno vettoriale entro un riquadro di ~28x28 centrato sull'origine,
 * pensato per essere posizionato con un <g transform="translate(...)">.
 */
export function RecipeIcon({ chiave }: { chiave: IconaChiave }) {
  switch (chiave) {
    case "pasta":
      return (
        <g>
          <ellipse cx="0" cy="3" rx="13" ry="8" fill="var(--color-ochre-light)" />
          <path
            d="M-9,3 Q-3,-6 3,2 T13,0"
            stroke="var(--color-ochre)"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M-8,7 Q-1,0 6,7 T12,5"
            stroke="var(--color-ochre)"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="4" cy="-1" r="2.3" fill="var(--color-tomato)" />
        </g>
      );
    case "pizza":
      return (
        <g>
          <path d="M0,-13 L11,10 A13,13 0 0,1 -11,10 Z" fill="var(--color-ochre-light)" />
          <path
            d="M-11,10 A13,13 0 0,0 11,10"
            fill="none"
            stroke="var(--color-ochre)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="-2" cy="1" r="1.8" fill="var(--color-tomato)" />
          <circle cx="3" cy="6" r="1.8" fill="var(--color-tomato)" />
          <circle cx="1" cy="-4" r="1.8" fill="var(--color-tomato)" />
        </g>
      );
    case "pollo":
      return (
        <g>
          <ellipse
            cx="-1"
            cy="-3"
            rx="9"
            ry="7"
            fill="var(--color-ochre)"
            transform="rotate(-25 -1 -3)"
          />
          <rect
            x="1"
            y="5"
            width="5"
            height="10"
            rx="2.5"
            fill="var(--color-paper)"
            transform="rotate(-15 3 10)"
          />
        </g>
      );
    case "pesce":
      return (
        <g>
          <path d="M-11,0 C-5,-8 6,-8 12,0 C6,8 -5,8 -11,0 Z" fill="var(--color-wood)" />
          <path d="M10,0 L16,-5 L16,5 Z" fill="var(--color-wood)" />
          <circle cx="-6" cy="-1" r="1.4" fill="var(--color-paper)" />
        </g>
      );
    case "insalata":
      return (
        <g>
          <path d="M-13,2 A13,9 0 0,0 13,2 Z" fill="var(--color-ottanio)" />
          <path
            d="M-13,2 A13,3.5 0 0,0 13,2"
            fill="none"
            stroke="var(--color-wood)"
            strokeWidth="1.4"
          />
          <circle cx="-4" cy="-3" r="3" fill="var(--color-tomato)" />
          <circle cx="3" cy="-5" r="2.4" fill="var(--color-ochre)" />
          <circle cx="6" cy="-1" r="2" fill="var(--color-wood-light)" />
        </g>
      );
    case "uova":
      return (
        <g>
          <ellipse cx="0" cy="0" rx="13" ry="9" fill="var(--color-paper)" />
          <circle cx="1" cy="0" r="5.5" fill="var(--color-ochre)" />
        </g>
      );
    case "zuppa":
      return (
        <g>
          <path d="M-12,1 A12,8 0 0,0 12,1 Z" fill="var(--color-tomato-light)" />
          <path
            d="M-12,1 A12,3 0 0,0 12,1"
            fill="none"
            stroke="var(--color-wood)"
            strokeWidth="1.4"
          />
          <path
            d="M-3,-6 Q-6,-10 -2,-14"
            stroke="var(--color-wood-light)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M4,-6 Q1,-10 5,-14"
            stroke="var(--color-wood-light)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      );
    case "curry":
      return (
        <g>
          <path d="M-12,1 A12,8 0 0,0 12,1 Z" fill="var(--color-ochre)" />
          <path
            d="M-12,1 A12,3 0 0,0 12,1"
            fill="none"
            stroke="var(--color-wood)"
            strokeWidth="1.4"
          />
          <circle cx="-4" cy="-3" r="1.4" fill="var(--color-ottanio)" />
          <circle cx="3" cy="-5" r="1.4" fill="var(--color-ottanio)" />
        </g>
      );
    case "riso":
      return (
        <g>
          <path d="M-11,3 A11,8 0 0,0 11,3 Z" fill="var(--color-paper)" />
          <path d="M-11,3 A11,4 0 0,0 11,3" fill="var(--color-wood)" />
          <circle cx="-3" cy="1" r="1.2" fill="var(--color-ottanio)" />
          <circle cx="2" cy="-1" r="1.2" fill="var(--color-tomato)" />
        </g>
      );
    case "pancake":
      return (
        <g>
          <ellipse cx="0" cy="8" rx="12" ry="3" fill="var(--color-ochre)" />
          <ellipse cx="0" cy="3" rx="11" ry="3" fill="var(--color-ochre-light)" />
          <ellipse cx="0" cy="-2" rx="10" ry="3" fill="var(--color-ochre)" />
          <path
            d="M-4,-7 Q0,-3 4,-7"
            stroke="var(--color-tomato)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "yogurt":
      return (
        <g>
          <path d="M-7,-11 L7,-11 L5,10 A5,3 0 0,1 -5,10 Z" fill="var(--color-paper)" />
          <path
            d="M-6,-4 Q0,-8 6,-4"
            stroke="var(--color-tomato)"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "toast":
      return (
        <g>
          <path d="M-11,10 L-11,-2 A11,10 0 0,1 11,-2 L11,10 Z" fill="var(--color-ochre-light)" />
          <rect x="-11" y="3" width="22" height="3.5" fill="var(--color-tomato)" />
        </g>
      );
    case "hummus":
      return (
        <g>
          <path d="M-12,2 A12,8 0 0,0 12,2 Z" fill="var(--color-ochre-light)" />
          <path
            d="M-12,2 A12,3 0 0,0 12,2"
            fill="none"
            stroke="var(--color-wood)"
            strokeWidth="1.4"
          />
          <path d="M6,-3 L14,0 L6,4 Z" fill="var(--color-ochre)" />
        </g>
      );
    case "frutta":
      return (
        <g>
          <path
            d="M0,-5 C8,-9 13,-1 10,6 C8,12 2,14 0,11 C-2,14 -8,12 -10,6 C-13,-1 -8,-9 0,-5 Z"
            fill="var(--color-tomato)"
          />
          <path
            d="M0,-5 Q1,-10 4,-12"
            stroke="var(--color-wood)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse
            cx="5"
            cy="-10"
            rx="3"
            ry="1.5"
            fill="var(--color-ottanio)"
            transform="rotate(-30 5 -10)"
          />
        </g>
      );
    case "popcorn":
      return (
        <g>
          <path d="M-8,-3 L8,-3 L6,13 L-6,13 Z" fill="var(--color-tomato)" />
          <circle cx="-3" cy="-6" r="3.2" fill="var(--color-paper)" />
          <circle cx="3" cy="-7" r="3.2" fill="var(--color-paper)" />
          <circle cx="0" cy="-9.5" r="3.2" fill="var(--color-paper)" />
        </g>
      );
    case "bowl":
      return (
        <g>
          <path d="M-12,1 A12,8 0 0,0 12,1 Z" fill="var(--color-ottanio)" />
          <path
            d="M-12,1 A12,3 0 0,0 12,1"
            fill="none"
            stroke="var(--color-wood)"
            strokeWidth="1.4"
          />
          <circle cx="-4" cy="-3" r="2.4" fill="var(--color-tomato)" />
          <circle cx="3" cy="-5" r="2.4" fill="var(--color-ochre)" />
          <circle cx="6" cy="-1" r="2" fill="var(--color-wood-light)" />
        </g>
      );
    case "patate":
      return (
        <g>
          <path
            d="M-10,-2 C-11,-8 -3,-11 3,-9 C10,-7 12,0 8,6 C4,12 -6,11 -9,5 C-11,2 -10,0 -10,-2 Z"
            fill="var(--color-ochre)"
          />
          <circle cx="-3" cy="-1" r="1" fill="var(--color-wood)" />
          <circle cx="2" cy="3" r="1" fill="var(--color-wood)" />
        </g>
      );
    case "colazione":
      return (
        <g>
          <path d="M-8,-8 L8,-8 L7,8 A7,4 0 0,1 -7,8 Z" fill="var(--color-paper)" />
          <path
            d="M8,-4 Q14,-4 14,1 Q14,6 8,5"
            fill="none"
            stroke="var(--color-wood)"
            strokeWidth="2"
          />
          <path
            d="M-2,-11 Q0,-13 2,-11"
            stroke="var(--color-ochre)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      );
    case "primo":
      return (
        <g>
          <ellipse cx="0" cy="3" rx="13" ry="8" fill="var(--color-ochre-light)" />
          <path
            d="M-9,3 Q-3,-6 3,2 T13,0"
            stroke="var(--color-ochre)"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="4" cy="-1" r="2.3" fill="var(--color-tomato)" />
        </g>
      );
    case "secondo":
      return (
        <g
          stroke="var(--color-wood)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M-6,-13 L-6,-4" />
          <path d="M-2,-13 L-2,-4" />
          <path d="M2,-13 L2,-4" />
          <path d="M-6,-4 Q-6,1 -2,1 Q2,1 2,-4" />
          <path d="M-2,1 L-2,13" />
          <path d="M8,-13 C11,-13 11,-6 8,-4 L8,13" />
        </g>
      );
    case "contorno":
      return (
        <g>
          <path
            d="M0,-12 C10,-10 12,0 4,10 C-2,14 -10,10 -10,2 C-10,-8 -6,-13 0,-12 Z"
            fill="var(--color-ottanio)"
          />
          <path
            d="M0,-10 Q-2,0 2,10"
            stroke="var(--color-wood)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "spuntino":
      return (
        <g>
          <circle cx="0" cy="0" r="12" fill="var(--color-ochre)" />
          <circle cx="-4" cy="-3" r="1.5" fill="var(--color-wood)" />
          <circle cx="3" cy="-5" r="1.5" fill="var(--color-wood)" />
          <circle cx="5" cy="2" r="1.5" fill="var(--color-wood)" />
          <circle cx="-3" cy="5" r="1.5" fill="var(--color-wood)" />
        </g>
      );
    case "main":
    default:
      return (
        <g>
          <circle cx="0" cy="0" r="12" fill="var(--color-paper)" />
          <circle cx="0" cy="0" r="6" fill="var(--color-cream-dark)" />
        </g>
      );
  }
}
