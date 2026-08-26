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
  type Pasto,
  type Ricetta,
} from "./lib/recipes";

export default function App() {
  const deviceId = useMemo(() => getDeviceId(), []);

  const [ricette, setRicette] = useState<Ricetta[]>([]);
  const [usaStandard, setUsaStandard] = useState(true);
  const [caricando, setCaricando] = useState(true);
  const [erroreCaricamento, setErroreCaricamento] = useState<string | null>(null);

  const [pastoFiltro, setPastoFiltro] = useState<Pasto | null>(null);
  const [tagFiltro, setTagFiltro] = useState<string[]>([]);

  const [spinning, setSpinning] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [risultato, setRisultato] = useState<Ricetta | null>(null);

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

  const ricetteFiltrate = useMemo(() => {
    return ricette.filter((r) => {
      const passaPasto = !pastoFiltro || r.pasto.includes(pastoFiltro);
      const passaTag =
        tagFiltro.length === 0 || tagFiltro.every((t) => r.tag.includes(t));
      return passaPasto && passaTag;
    });
  }, [ricette, pastoFiltro, tagFiltro]);

  function girala() {
    if (ricetteFiltrate.length === 0 || spinning) return;
    setRisultato(null);
    const idx = Math.floor(Math.random() * ricetteFiltrate.length);
    setTargetIndex(idx);
    setSpinning(true);
  }

  function onSettled() {
    setSpinning(false);
    if (targetIndex !== null) {
      setRisultato(ricetteFiltrate[targetIndex] ?? null);
    }
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
    pasto: Pasto[];
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

        <Filters
          pasto={pastoFiltro}
          setPasto={setPastoFiltro}
          tagDisponibili={tagDisponibili}
          tagSelezionati={tagFiltro}
          setTagSelezionati={setTagFiltro}
        />

        <p className="text-sm opacity-70">
          {caricando
            ? "Carico le ricette..."
            : `${ricetteFiltrate.length} ricett${ricetteFiltrate.length === 1 ? "a" : "e"} disponibili`}
        </p>

        <Wheel
          items={ricetteFiltrate}
          spinning={spinning}
          targetIndex={targetIndex}
          onSettled={onSettled}
        />

        <button
          className="pixel-btn pixel-btn-ochre w-full max-w-[19rem] py-4 text-sm"
          onClick={girala}
          disabled={spinning || ricetteFiltrate.length === 0 || caricando}
        >
          {spinning ? "Sto girando..." : "Cosa mangio oggi?"}
        </button>

        {risultato && !spinning && (
          <div className="pixel-panel w-full max-w-[19rem] p-4 text-center">
            <p className="text-sm opacity-70">Oggi si mangia:</p>
            <p className="pixel-font mt-2 text-base">{risultato.nome}</p>
            {risultato.ingredienti && (
              <p className="mt-2 text-left text-base">
                <span className="opacity-70">Ingredienti: </span>
                {risultato.ingredienti}
              </p>
            )}
            {risultato.procedimento && (
              <p className="mt-2 text-left text-base">
                <span className="opacity-70">Procedimento: </span>
                {risultato.procedimento}
              </p>
            )}
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
