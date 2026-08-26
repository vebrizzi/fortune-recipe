import { useState } from "react";
import { PASTI, PASTO_LABEL, TAG_BASE, type Pasto } from "../lib/recipes";

export function AggiungiRicetta({
  onClose,
  onSalva,
}: {
  onClose: () => void;
  onSalva: (input: {
    nome: string;
    ingredienti?: string;
    procedimento?: string;
    pasto: Pasto[];
    tag: string[];
  }) => Promise<void>;
}) {
  const [nome, setNome] = useState("");
  const [ingredienti, setIngredienti] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [pastiScelti, setPastiScelti] = useState<Pasto[]>([]);
  const [tagBase, setTagBase] = useState<string[]>([]);
  const [tagCustom, setTagCustom] = useState<string[]>([]);
  const [nuovoTag, setNuovoTag] = useState("");
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  function togglePasto(p: Pasto) {
    setPastiScelti((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function toggleTagBase(t: string) {
    setTagBase((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function aggiungiTagCustom() {
    const t = nuovoTag.trim().toLowerCase();
    if (!t || tagCustom.includes(t) || tagBase.includes(t)) {
      setNuovoTag("");
      return;
    }
    setTagCustom((prev) => [...prev, t]);
    setNuovoTag("");
  }

  async function handleSalva() {
    if (!nome.trim()) {
      setErrore("Il nome della ricetta e' obbligatorio.");
      return;
    }
    setErrore(null);
    setSalvataggio(true);
    try {
      await onSalva({
        nome: nome.trim(),
        ingredienti: ingredienti.trim() || undefined,
        procedimento: procedimento.trim() || undefined,
        pasto: pastiScelti,
        tag: [...tagBase, ...tagCustom],
      });
      onClose();
    } catch {
      setErrore("Non sono riuscito a salvare la ricetta. Riprova.");
    } finally {
      setSalvataggio(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[var(--color-crust)]/70 sm:items-center">
      <div className="pixel-panel max-h-[88vh] w-full max-w-md overflow-y-auto p-4 sm:m-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="pixel-font text-sm">Nuova ricetta</h2>
          <button
            className="pixel-btn pixel-btn-wood px-3 py-2 text-xs"
            onClick={onClose}
            aria-label="Chiudi"
          >
            X
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-80">Nome ricetta *</span>
            <input
              className="pixel-input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Es. Pasta al pesto"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-80">Ingredienti (opzionale)</span>
            <textarea
              className="pixel-input"
              rows={2}
              value={ingredienti}
              onChange={(e) => setIngredienti(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-80">Procedimento (opzionale)</span>
            <textarea
              className="pixel-input"
              rows={3}
              value={procedimento}
              onChange={(e) => setProcedimento(e.target.value)}
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-sm opacity-80">Pasto (multiselezione)</span>
            <div className="flex flex-wrap gap-1.5">
              {PASTI.map((p) => (
                <span
                  key={p}
                  className="pixel-chip"
                  data-active={pastiScelti.includes(p)}
                  onClick={() => togglePasto(p)}
                >
                  {PASTO_LABEL[p]}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm opacity-80">Tag (multiselezione)</span>
            <div className="flex flex-wrap gap-1.5">
              {TAG_BASE.map((t) => (
                <span
                  key={t}
                  className="pixel-chip"
                  data-active={tagBase.includes(t)}
                  onClick={() => toggleTagBase(t)}
                >
                  {t}
                </span>
              ))}
              {tagCustom.map((t) => (
                <span
                  key={t}
                  className="pixel-chip"
                  data-active={true}
                  onClick={() =>
                    setTagCustom((prev) => prev.filter((x) => x !== t))
                  }
                >
                  {t} ×
                </span>
              ))}
            </div>
            <div className="mt-1 flex gap-1.5">
              <input
                className="pixel-input"
                placeholder="Aggiungi tag"
                value={nuovoTag}
                onChange={(e) => setNuovoTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    aggiungiTagCustom();
                  }
                }}
              />
              <button
                type="button"
                className="pixel-btn pixel-btn-ottanio px-3 text-xs"
                onClick={aggiungiTagCustom}
              >
                +
              </button>
            </div>
          </div>

          {errore && (
            <p className="text-sm font-bold text-[var(--color-tomato)]">
              {errore}
            </p>
          )}

          <button
            className="pixel-btn pixel-btn-ochre mt-1 w-full py-3 text-xs"
            onClick={handleSalva}
            disabled={salvataggio}
          >
            {salvataggio ? "Salvataggio..." : "Salva ricetta"}
          </button>
        </div>
      </div>
    </div>
  );
}
