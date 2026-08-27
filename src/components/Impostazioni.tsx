import { useEffect, useState } from "react";
import type { LibroLocale } from "../lib/device";
import { ottieniLibri } from "../lib/recipes";

type RisultatoUnione = { ok: true } | { ok: false; messaggio: string };
type AnteprimaLibro = { stato: "idle" | "verificando" | "trovato" | "non-trovato"; nome?: string };

export function Impostazioni({
  usaStandard,
  onCambia,
  onChiudi,
  libri,
  libroAttivo,
  onImpostaAttivo,
  onRimuovi,
  onRinomina,
  onCrea,
  onUnisciti,
}: {
  usaStandard: boolean;
  onCambia: (v: boolean) => void;
  onChiudi: () => void;
  libri: LibroLocale[];
  libroAttivo: string | null;
  onImpostaAttivo: (codice: string) => void;
  onRimuovi: (codice: string) => void;
  onRinomina: (codice: string, nome: string) => Promise<void>;
  onCrea: (nome: string, password?: string) => Promise<string>;
  onUnisciti: (codice: string, password?: string) => Promise<RisultatoUnione>;
}) {
  const [formAperto, setFormAperto] = useState<"nessuno" | "crea" | "unisciti" | "creato">(
    "nessuno"
  );
  const [inRinomina, setInRinomina] = useState<string | null>(null);
  const [nomeRinomina, setNomeRinomina] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [caricando, setCaricando] = useState(false);
  const [copiato, setCopiato] = useState(false);

  const [nomeNuovo, setNomeNuovo] = useState("");
  const [passwordNuovo, setPasswordNuovo] = useState("");
  const [codiceCreato, setCodiceCreato] = useState<string | null>(null);
  const [codiceUnione, setCodiceUnione] = useState("");
  const [passwordUnione, setPasswordUnione] = useState("");
  const [anteprima, setAnteprima] = useState<AnteprimaLibro>({ stato: "idle" });

  useEffect(() => {
    if (formAperto !== "unisciti") return;
    const valore = codiceUnione.trim();
    if (!valore) {
      setAnteprima({ stato: "idle" });
      return;
    }
    setAnteprima({ stato: "verificando" });
    const t = setTimeout(async () => {
      try {
        const info = await ottieniLibri([valore]);
        setAnteprima(
          info[0] ? { stato: "trovato", nome: info[0].nome } : { stato: "non-trovato" }
        );
      } catch {
        setAnteprima({ stato: "idle" });
      }
    }, 450);
    return () => clearTimeout(t);
  }, [codiceUnione, formAperto]);

  async function copiaCodice(codice: string) {
    try {
      await navigator.clipboard.writeText(codice);
    } catch {
      // se il clipboard non e' disponibile non facciamo nulla
    }
  }

  async function copiaCodiceCreato() {
    if (!codiceCreato) return;
    await copiaCodice(codiceCreato);
    setCopiato(true);
    setTimeout(() => setCopiato(false), 1500);
  }

  function iniziaRinomina(libro: LibroLocale) {
    setInRinomina(libro.codice);
    setNomeRinomina(libro.nome);
    setErrore(null);
  }

  async function confermaRinomina(codice: string) {
    if (!nomeRinomina.trim()) return;
    setCaricando(true);
    setErrore(null);
    try {
      await onRinomina(codice, nomeRinomina.trim());
      setInRinomina(null);
    } catch {
      setErrore("Non sono riuscito a rinominare il libro. Riprova.");
    } finally {
      setCaricando(false);
    }
  }

  async function handleCrea() {
    if (!nomeNuovo.trim()) {
      setErrore("Dai un nome al nuovo libro.");
      return;
    }
    setErrore(null);
    setCaricando(true);
    try {
      const codice = await onCrea(nomeNuovo.trim(), passwordNuovo);
      setCodiceCreato(codice);
      setNomeNuovo("");
      setPasswordNuovo("");
      setFormAperto("creato");
    } catch {
      setErrore("Non sono riuscito a creare il libro. Riprova.");
    } finally {
      setCaricando(false);
    }
  }

  async function handleUnisciti() {
    if (!codiceUnione.trim()) {
      setErrore("Inserisci il codice del libro.");
      return;
    }
    setErrore(null);
    setCaricando(true);
    try {
      const risultato = await onUnisciti(codiceUnione.trim(), passwordUnione);
      if (risultato.ok) {
        setCodiceUnione("");
        setPasswordUnione("");
        setFormAperto("nessuno");
      } else {
        setErrore(risultato.messaggio);
      }
    } catch {
      setErrore("Non sono riuscito a controllare il codice. Riprova.");
    } finally {
      setCaricando(false);
    }
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

        <div className="my-4 h-1 w-full rounded-full bg-[var(--color-cream-dark)]" />

        <h3 className="pixel-font text-base">Libri di ricette</h3>
        <p className="mt-1 text-sm opacity-70">
          Le tue ricette vivono in uno o piu' "libri". Segui il codice di un
          libro per vedere le sue ricette; aggiungi anche la password (se ne
          ha una) per poterci scrivere in collaborazione. Le ruote pescano
          sempre da <strong>tutti</strong> i libri che segui insieme: tocca un
          libro per scegliere quello <strong>predefinito</strong>, cioe' dove
          finiscono le nuove ricette che aggiungi (puoi comunque scegliere un
          libro diverso ogni volta, dal form "Aggiungi ricetta").
        </p>

        <ul className="mt-3 flex flex-col gap-1.5">
          {libri.map((l) => (
            <li
              key={l.codice}
              className="rounded-xl bg-[var(--color-cream-dark)] px-3 py-2"
            >
              {inRinomina === l.codice ? (
                <div className="flex gap-1.5">
                  <input
                    className="pixel-input text-sm"
                    value={nomeRinomina}
                    onChange={(e) => setNomeRinomina(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        confermaRinomina(l.codice);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="pixel-btn pixel-btn-ochre px-3 text-xs"
                    onClick={() => confermaRinomina(l.codice)}
                    disabled={caricando}
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => l.modificabile && onImpostaAttivo(l.codice)}
                    title={
                      l.modificabile
                        ? "Imposta come libro predefinito per il salvataggio"
                        : undefined
                    }
                  >
                    <span className="flex flex-wrap items-center gap-1">
                      <span className="truncate text-base">{l.nome}</span>
                      {l.codice === libroAttivo && (
                        <span className="shrink-0 rounded-full bg-[var(--color-ottanio)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-crust)]">
                          Predefinito
                        </span>
                      )}
                    </span>
                    <span className="block font-mono text-xs opacity-60">
                      {l.codice}
                      {!l.modificabile && " · sola lettura"}
                    </span>
                  </button>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className="pixel-btn pixel-btn-ottanio px-2 py-1 text-[10px]"
                      onClick={() => copiaCodice(l.codice)}
                    >
                      Copia
                    </button>
                    {l.modificabile && (
                      <button
                        type="button"
                        className="pixel-btn pixel-btn-ottanio px-2 py-1 text-[10px]"
                        onClick={() => iniziaRinomina(l)}
                      >
                        Rinomina
                      </button>
                    )}
                    <button
                      type="button"
                      className="pixel-btn pixel-btn-wood px-2 py-1 text-[10px]"
                      onClick={() => onRimuovi(l.codice)}
                    >
                      Rimuovi
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {errore && (
          <p className="mt-2 text-sm font-bold text-[var(--color-tomato)]">{errore}</p>
        )}

        {formAperto === "nessuno" && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="pixel-btn pixel-btn-ochre flex-1 py-2 text-sm"
              onClick={() => {
                setFormAperto("crea");
                setErrore(null);
              }}
            >
              Nuovo libro
            </button>
            <button
              type="button"
              className="pixel-btn pixel-btn-ottanio flex-1 py-2 text-sm"
              onClick={() => {
                setFormAperto("unisciti");
                setErrore(null);
              }}
            >
              Aggiungi esistente
            </button>
          </div>
        )}

        {formAperto === "crea" && (
          <div className="mt-3 flex flex-col gap-2">
            <input
              className="pixel-input"
              placeholder="Nome del nuovo libro"
              value={nomeNuovo}
              onChange={(e) => setNomeNuovo(e.target.value)}
            />
            <input
              type="password"
              className="pixel-input"
              placeholder="Password (opzionale)"
              value={passwordNuovo}
              onChange={(e) => setPasswordNuovo(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="pixel-btn pixel-btn-wood flex-1 py-2 text-sm"
                onClick={() => setFormAperto("nessuno")}
              >
                Annulla
              </button>
              <button
                type="button"
                className="pixel-btn pixel-btn-ochre flex-1 py-2 text-sm"
                onClick={handleCrea}
                disabled={caricando}
              >
                Crea
              </button>
            </div>
          </div>
        )}

        {formAperto === "creato" && codiceCreato && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-sm opacity-80">
              Libro creato! Salva questo codice: ti servira' per aggiungerlo su
              altri dispositivi.
            </p>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--color-cream-dark)] px-3 py-2">
              <span className="font-mono text-xl tracking-widest">{codiceCreato}</span>
              <button
                type="button"
                className="pixel-btn pixel-btn-ottanio px-3 text-xs"
                onClick={copiaCodiceCreato}
              >
                {copiato ? "Copiato!" : "Copia"}
              </button>
            </div>
            <button
              type="button"
              className="pixel-btn pixel-btn-ochre w-full py-2 text-sm"
              onClick={() => {
                setCodiceCreato(null);
                setFormAperto("nessuno");
              }}
            >
              Fatto
            </button>
          </div>
        )}

        {formAperto === "unisciti" && (
          <div className="mt-3 flex flex-col gap-2">
            <input
              className="pixel-input font-mono"
              placeholder="Codice del libro"
              value={codiceUnione}
              onChange={(e) => setCodiceUnione(e.target.value)}
            />
            {anteprima.stato === "verificando" && (
              <span className="text-sm opacity-60">Verifico...</span>
            )}
            {anteprima.stato === "trovato" && (
              <span className="text-sm font-bold text-[var(--color-ottanio)]">
                📖 {anteprima.nome}
              </span>
            )}
            {anteprima.stato === "non-trovato" && (
              <span className="text-sm opacity-60">Nessun libro con questo codice.</span>
            )}
            <input
              type="password"
              className="pixel-input"
              placeholder="Password (solo per poter scrivere)"
              value={passwordUnione}
              onChange={(e) => setPasswordUnione(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="pixel-btn pixel-btn-wood flex-1 py-2 text-sm"
                onClick={() => setFormAperto("nessuno")}
              >
                Annulla
              </button>
              <button
                type="button"
                className="pixel-btn pixel-btn-ottanio flex-1 py-2 text-sm"
                onClick={handleUnisciti}
                disabled={caricando}
              >
                Aggiungi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
