import { useState } from "react";
import { chiaveIconaRicetta, type Ricetta } from "../lib/recipes";
import { RecipeIcon } from "./RecipeIcon";
import type { LibroLocale } from "../lib/device";

export function ElencoRicette({
  ricette,
  onElimina,
  onChiudi,
  libri,
  libriModificabili,
}: {
  ricette: Ricetta[];
  onElimina: (id: string) => Promise<void>;
  onChiudi: () => void;
  libri: LibroLocale[];
  libriModificabili: string[];
}) {
  const [tipo, setTipo] = useState<string>("tutte");
  const [eliminando, setEliminando] = useState<string | null>(null);

  const visibili =
    tipo === "tutte" ? ricette : ricette.filter((r) => r.libro === tipo);

  async function handleElimina(id: string) {
    setEliminando(id);
    try {
      await onElimina(id);
    } finally {
      setEliminando(null);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[var(--color-crust)]/70 sm:items-center">
      <div className="pixel-panel max-h-[88vh] w-full max-w-md overflow-y-auto p-4 sm:m-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="pixel-font text-sm">Le mie ricette</h2>
          <button
            className="pixel-btn pixel-btn-wood px-3 py-2 text-xs"
            onClick={onChiudi}
            aria-label="Chiudi"
          >
            X
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          <span
            className="pixel-chip"
            data-active={tipo === "tutte"}
            onClick={() => setTipo("tutte")}
          >
            Tutte
          </span>
          {libri.map((l) => (
            <span
              key={l.codice}
              className="pixel-chip"
              data-active={tipo === l.codice}
              onClick={() => setTipo(l.codice)}
            >
              {l.nome}
            </span>
          ))}
        </div>

        {visibili.length === 0 && (
          <p className="py-6 text-center opacity-70">
            Nessuna ricetta da mostrare.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {visibili.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-2xl bg-[var(--color-cream-dark)] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <svg viewBox="-16 -16 32 32" className="h-8 w-8 shrink-0">
                  <RecipeIcon chiave={chiaveIconaRicetta(r)} />
                </svg>
                <div>
                  <p className="leading-tight">{r.nome}</p>
                  <p className="text-sm opacity-60">
                    {r.standard ? "standard" : "mia"}
                    {r.pasto.length > 0 ? ` · ${r.pasto.join(", ")}` : ""}
                  </p>
                </div>
              </div>
              {!r.standard && r.libro && libriModificabili.includes(r.libro) && (
                <button
                  className="pixel-btn pixel-btn-wood px-2 py-1 text-[10px]"
                  onClick={() => handleElimina(r.id)}
                  disabled={eliminando === r.id}
                >
                  {eliminando === r.id ? "..." : "Elimina"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
