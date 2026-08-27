import { useState } from "react";
import { iconaRicetta, type Ricetta } from "../lib/recipes";

type Tipo = "mie" | "tutte";

export function ElencoRicette({
  ricette,
  onElimina,
  onChiudi,
  libriModificabili,
}: {
  ricette: Ricetta[];
  onElimina: (id: string) => Promise<void>;
  onChiudi: () => void;
  libriModificabili: string[];
}) {
  const [tipo, setTipo] = useState<Tipo>("mie");
  const [eliminando, setEliminando] = useState<string | null>(null);

  const visibili =
    tipo === "mie" ? ricette.filter((r) => !r.standard) : ricette;

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

        <div className="mb-3 flex gap-1.5">
          <span
            className="pixel-chip"
            data-active={tipo === "mie"}
            onClick={() => setTipo("mie")}
          >
            Solo mie
          </span>
          <span
            className="pixel-chip"
            data-active={tipo === "tutte"}
            onClick={() => setTipo("tutte")}
          >
            Tutte
          </span>
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
                <span className="text-xl">{iconaRicetta(r)}</span>
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
