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

const MAX_PIATTI = 4;

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

  const staGirando = piattiConRicette.some((s) => s.spinning);
  const nessunaRicettaDisponibile = piattiConRicette.every((s) => s.filtrate.length === 0);

  useEffect(() => {
    setPiatti((prev) => {
      if (numeroPiatti === prev.length) return prev;
      if (numeroPiatti > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: numeroPiatti - prev.length }, nuovoSlot),
        ];
      }
      return prev.slice(0, numeroPiatti);
    });
  }, [numeroPiatti]);

  function aggiornaSlot(i: number, patch: Partial<PiattoSlot>) {
    setPiatti((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function giraleTutte() {
    setPiatti((prev) =>
      prev.map((slot, i) => {
        const filtrate = piattiConRicette[i]?.filtrate ?? [];
        if (filtrate.length === 0 || slot.spinning) return { ...slot, risultato: null };
        const idx = Math.floor(Math.random() * filtrate.length);
        return { ...slot, risultato: null, targetIndex: idx, spinning: true };
      })
    );
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
    <div className="min-h-screen px-4 py-6">
      <header className="mx-auto mb-6 max-w-md text-center">
        <h1 className="pixel-font text-3xl leading-relaxed text-[var(--color-crust)]">
          Cosa mangio oggi? 🎲
        </h1>
        <button
          className="pixel-btn pixel-btn-ottanio mt-3 px-4 py-2 text-sm"
          onClick={() => setMostraOpzioni(true)}
        >
          Opzioni
        </button>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col items-center gap-4">
        {erroreCaricamento && (
          <div className="pixel-panel w-full max-w-md p-3 text-center text-sm">
            {erroreCaricamento}
          </div>
        )}

        <div className="pixel-panel flex w-full max-w-md flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-80">Quanti piatti vuoi generare?</span>
            <span className="pixel-font text-xl">{numeroPiatti}</span>
          </div>
          <input
            type="range"
            min={1}
            max={MAX_PIATTI}
            value={numeroPiatti}
            onChange={(e) => setNumeroPiatti(Number(e.target.value))}
            className="w-full accent-[var(--color-tomato)]"
          />
        </div>

        {caricando && <p className="text-sm opacity-70">Carico le ricette...</p>}

        {!caricando && (
          <button
            className="pixel-btn pixel-btn-ochre w-full max-w-md py-4 text-lg"
            onClick={giraleTutte}
            disabled={staGirando || nessunaRicettaDisponibile}
          >
            {staGirando ? "Sto girando..." : "Cosa mangio oggi?"}
          </button>
        )}

        {!caricando && (
          <div className="flex w-full flex-wrap justify-center gap-4">
            {piattiConRicette.map((slot, i) => (
              <div
                key={i}
                className="pixel-panel flex w-full max-w-[19rem] flex-col items-center gap-3 p-3 sm:w-72"
              >
                <h2 className="pixel-font text-lg">Piatto {i + 1}</h2>

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

                {slot.risultato && !slot.spinning && (
                  <div className="pixel-panel w-full max-w-[19rem] p-4 text-center">
                    <p className="text-sm opacity-70">Oggi si mangia:</p>
                    <p className="pixel-font mt-1 text-xl">{slot.risultato.nome}</p>
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
          </div>
        )}

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
