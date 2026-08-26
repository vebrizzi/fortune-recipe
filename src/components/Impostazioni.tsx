import { useState } from "react";

export function Impostazioni({
  usaStandard,
  onCambia,
  onChiudi,
  codiceDispositivo,
  libri,
  libroAttivo,
  onAggiungiLibro,
  onRimuoviLibro,
  onImpostaAttivo,
}: {
  usaStandard: boolean;
  onCambia: (v: boolean) => void;
  onChiudi: () => void;
  codiceDispositivo: string;
  libri: string[];
  libroAttivo: string;
  onAggiungiLibro: (codice: string) => void;
  onRimuoviLibro: (codice: string) => void;
  onImpostaAttivo: (codice: string) => void;
}) {
  const [nuovoCodice, setNuovoCodice] = useState("");
  const [copiato, setCopiato] = useState(false);

  async function copiaCodice() {
    try {
      await navigator.clipboard.writeText(codiceDispositivo);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 1500);
    } catch {
      // se il clipboard non e' disponibile non facciamo nulla
    }
  }

  function handleAggiungi() {
    const codice = nuovoCodice.trim();
    if (!codice) return;
    onAggiungiLibro(codice);
    setNuovoCodice("");
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[var(--color-crust)]/70 sm:items-center">
      <div className="pixel-panel max-h-[88vh] w-full max-w-md overflow-y-auto p-4 sm:m-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="pixel-font text-lg">Opzioni</h2>
          <button
            className="pixel-btn pixel-btn-wood px-3 py-2 text-xs"
            onClick={onChiudi}
            aria-label="Chiudi"
          >
            X
          </button>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3 py-2 text-lg">
          <span>Usa anche le ricette standard</span>
          <input
            type="checkbox"
            checked={usaStandard}
            onChange={(e) => onCambia(e.target.checked)}
            className="h-5 w-5 accent-[var(--color-ottanio)]"
          />
        </label>
        <p className="text-sm opacity-70">
          Se disattivata, la ruota usera' solo le ricette che hai aggiunto tu
          su questo dispositivo.
        </p>

        <hr className="my-4 border-[var(--color-cream-dark)]" />

        <h3 className="pixel-font text-base">Libri di ricette</h3>
        <p className="mt-1 text-sm opacity-70">
          Le tue ricette personali vivono in un "libro" identificato da un
          codice. Copia il tuo codice e incollalo su un altro dispositivo per
          vedere e aggiungere le stesse ricette da entrambi.
        </p>

        <div className="mt-3 flex flex-col gap-1">
          <span className="text-sm opacity-80">Il tuo codice</span>
          <div className="flex gap-1.5">
            <input
              className="pixel-input font-mono text-sm"
              value={codiceDispositivo}
              readOnly
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              className="pixel-btn pixel-btn-ottanio px-3 text-xs"
              onClick={copiaCodice}
            >
              {copiato ? "Copiato!" : "Copia"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1">
          <span className="text-sm opacity-80">Aggiungi un libro esistente</span>
          <div className="flex gap-1.5">
            <input
              className="pixel-input text-sm"
              placeholder="Incolla qui un codice"
              value={nuovoCodice}
              onChange={(e) => setNuovoCodice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAggiungi();
                }
              }}
            />
            <button
              type="button"
              className="pixel-btn pixel-btn-ochre px-3 text-xs"
              onClick={handleAggiungi}
            >
              Aggiungi
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1">
          <span className="text-sm opacity-80">
            Libri seguiti (tocca per salvare le nuove ricette li')
          </span>
          <ul className="flex flex-col gap-1.5">
            {libri.map((codice) => (
              <li
                key={codice}
                className="flex items-center justify-between gap-2 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-3 py-2"
              >
                <button
                  type="button"
                  className="flex-1 truncate text-left font-mono text-sm"
                  onClick={() => onImpostaAttivo(codice)}
                  title={codice}
                >
                  {codice === libroAttivo ? "● " : "○ "}
                  {codice}
                </button>
                <button
                  type="button"
                  className="pixel-btn pixel-btn-wood px-2 py-1 text-[10px]"
                  onClick={() => onRimuoviLibro(codice)}
                  disabled={libri.length === 1}
                >
                  Rimuovi
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
