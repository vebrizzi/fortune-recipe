import { useEffect, useMemo, useState } from "react";
import { Wheel } from "./components/Wheel";
import { Filters } from "./components/Filters";
import { AggiungiRicetta } from "./components/AggiungiRicetta";
import { ElencoRicette } from "./components/ElencoRicette";
import { Impostazioni } from "./components/Impostazioni";
import { getDeviceId } from "./lib/device";
import {
  creaRicetta,
  eliminaRicetta,
  fetchImpostazioni,
  fetchRicetteStandard,
  fetchRicetteUtente,
  salvaImpostazioni,
  TAG_BASE,
  type Categoria,
  type Ricetta,
} from "./lib/recipes";

const MAX_PIATTI = 6;

type PiattoSlot = {
  categoria: Categoria | null;
  tag: string[];
  spinning: boolean;
  targetIndex: number | null;
  risultato: Ricetta | null;
};

function nuovoSlot(): PiattoSlot {
  return { categoria: null, tag: [], spinning: false, targetIndex: null, risultato: null };
}

export default function App() {
  const deviceId = useMemo(() => getDeviceId(), []);

  const [ricette, setRicette] = useState<Ricetta[]>([]);
  const [usaStandard, setUsaStandard] = useState(true);
  const [caricando, setCaricando] = useState(true);
  const [erroreCaricamento, setErroreCaricamento] = useState<string | null>(null);

  const [numeroPiatti, setNumeroPiatti] = useState(1);
  const [piatti, setPiatti] = useState<PiattoSlot[]>([nuovoSlot()]);

  const [mostraAggiungi, setMostraAggiungi] = useState(false);
  const [mostraElenco, setMostraElenco] = useState(false);
  const [mostraOpzioni, setMostraOpzioni] = useState(false);

  async function ricarica() {
    setCaricando(true);
    setErroreCaricamento(null);
    try {
      const [mie, standard, opzioni] = await Promise.all([
        fetchRicetteUtente(deviceId),
        fetchRicetteStandard(),
        fetchImpostazioni(deviceId),
      ]);
      setUsaStandard(opzioni);
      setRicette(opzioni ? [...mie, ...standard] : mie);
    } catch {
      setErroreCaricamento(
        "Non riesco a raggiungere il database delle ricette. Controlla la connessione o riprova tra poco."
      );
    } finally {
      setCaricando(false);
    }
  }

  useEffect(() => {
    ricarica();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tagDisponibili = useMemo(() => {
    const set = new Set<string>(TAG_BASE);
    ricette.forEach((r) => r.tag.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [ricette]);

  const piattiConRicette = useMemo(
    () =>
      piatti.map((slot) => ({
        ...slot,
        filtrate: ricette.filter((r) => {
          const passaCategoria = !slot.categoria || r.pasto.includes(slot.categoria);
          const passaTag =
            slot.tag.length === 0 || slot.tag.every((t) => r.tag.includes(t));
          return passaCategoria && passaTag;
        }),
      })),
    [piatti, ricette]
  );

  function generaRuote() {
    setPiatti(Array.from({ length: numeroPiatti }, nuovoSlot));
  }

  function aggiornaSlot(i: number, patch: Partial<PiattoSlot>) {
    setPiatti((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function girala(i: number) {
    const slot = piattiConRicette[i];
    if (!slot || slot.filtrate.length === 0 || slot.spinning) return;
    const idx = Math.floor(Math.random() * slot.filtrate.length);
    aggiornaSlot(i, { risultato: null, targetIndex: idx, spinning: true });
  }

  function onSettled(i: number) {
    const slot = piattiConRicette[i];
    const risultato =
      slot && slot.targetIndex !== null ? slot.filtrate[slot.targetIndex] ?? null : null;
    aggiornaSlot(i, { spinning: false, risultato });
  }

  async function handleCambiaOpzioni(v: boolean) {
    setUsaStandard(v);
    try {
      await salvaImpostazioni(deviceId, v);
    } catch {
      // se il salvataggio fallisce manteniamo comunque lo stato locale
    }
    ricarica();
  }

  async function handleSalvaRicetta(input: {
    nome: string;
    ingredienti?: string;
    procedimento?: string;
    pasto: Categoria[];
    tag: string[];
  }) {
    await creaRicetta({ deviceId, ...input });
    await ricarica();
  }

  async function handleElimina(id: string) {
    await eliminaRicetta(id, deviceId);
    await ricarica();
  }

  return (
    <div className="scanlines min-h-screen px-4 py-6">
      <header className="mx-auto mb-6 max-w-md text-center">
        <h1 className="pixel-font text-xl leading-relaxed text-[var(--color-crust)]">
          Cosa mangio
          <br />
          oggi? 🎲
        </h1>
        <button
          className="pixel-btn pixel-btn-ottanio mt-3 px-3 py-2 text-[10px]"
          onClick={() => setMostraOpzioni(true)}
        >
          Opzioni
        </button>
      </header>

      <main className="mx-auto flex max-w-md flex-col items-center gap-4">
        {erroreCaricamento && (
          <div className="pixel-panel w-full p-3 text-center text-sm">
            {erroreCaricamento}
          </div>
        )}

        <div className="pixel-panel flex w-full flex-col gap-2 p-3">
          <span className="text-sm opacity-80">Quanti piatti vuoi generare?</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={MAX_PIATTI}
              className="pixel-input w-20 text-center"
              value={numeroPiatti}
              onChange={(e) =>
                setNumeroPiatti(
                  Math.min(MAX_PIATTI, Math.max(1, Number(e.target.value) || 1))
                )
              }
            />
            <button
              type="button"
              className="pixel-btn pixel-btn-ottanio flex-1 px-3 py-2 text-xs"
              onClick={generaRuote}
            >
              Genera ruote
            </button>
          </div>
        </div>

        {caricando && <p className="text-sm opacity-70">Carico le ricette...</p>}

        {!caricando &&
          piattiConRicette.map((slot, i) => (
            <div
              key={i}
              className="pixel-panel flex w-full flex-col items-center gap-3 p-3"
            >
              <h2 className="pixel-font text-xs">Piatto {i + 1}</h2>

              <Filters
                pasto={slot.categoria}
                setPasto={(c) => aggiornaSlot(i, { categoria: c })}
                tagDisponibili={tagDisponibili}
                tagSelezionati={slot.tag}
                setTagSelezionati={(t) => aggiornaSlot(i, { tag: t })}
              />

              <p className="text-sm opacity-70">
                {slot.filtrate.length} ricett{slot.filtrate.length === 1 ? "a" : "e"}{" "}
                disponibili
              </p>

              <Wheel
                items={slot.filtrate}
                spinning={slot.spinning}
                targetIndex={slot.targetIndex}
                onSettled={() => onSettled(i)}
              />

              <button
                className="pixel-btn pixel-btn-ochre w-full max-w-[19rem] py-4 text-sm"
                onClick={() => girala(i)}
                disabled={slot.spinning || slot.filtrate.length === 0}
              >
                {slot.spinning ? "Sto girando..." : "Cosa mangio oggi?"}
              </button>

              {slot.risultato && !slot.spinning && (
                <div className="pixel-panel w-full max-w-[19rem] p-4 text-center">
                  <p className="text-sm opacity-70">Oggi si mangia:</p>
                  <p className="pixel-font mt-2 text-base">{slot.risultato.nome}</p>
                  {slot.risultato.ingredienti && (
                    <p className="mt-2 text-left text-base">
                      <span className="opacity-70">Ingredienti: </span>
                      {slot.risultato.ingredienti}
                    </p>
                  )}
                  {slot.risultato.procedimento && (
                    <p className="mt-2 text-left text-base">
                      <span className="opacity-70">Procedimento: </span>
                      {slot.risultato.procedimento}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

        <button
          className="text-sm underline opacity-70"
          onClick={() => setMostraElenco(true)}
        >
          Le mie ricette
        </button>
      </main>

      <button
        className="pixel-fab"
        onClick={() => setMostraAggiungi(true)}
        aria-label="Aggiungi ricetta"
      >
        +
      </button>

      {mostraAggiungi && (
        <AggiungiRicetta
          onClose={() => setMostraAggiungi(false)}
          onSalva={handleSalvaRicetta}
        />
      )}

      {mostraElenco && (
        <ElencoRicette
          ricette={ricette}
          onElimina={handleElimina}
          onChiudi={() => setMostraElenco(false)}
        />
      )}

      {mostraOpzioni && (
        <Impostazioni
          usaStandard={usaStandard}
          onCambia={handleCambiaOpzioni}
          onChiudi={() => setMostraOpzioni(false)}
        />
      )}
    </div>
  );
}
