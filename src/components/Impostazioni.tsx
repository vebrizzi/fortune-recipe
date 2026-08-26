import { useState } from "react";
import type { LibroLocale } from "../lib/device";

type RisultatoUnione = { ok: true } | { ok: false; messaggio: string };

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
  onCrea: (nome: string, password?: string) => Promise<void>;
  onUnisciti: (codice: string, password?: string) => Promise<RisultatoUnione>;
}) {
  const [formAperto, setFormAperto] = useState<"nessuno" | "crea" | "unisciti">("nessuno");
  const [inRinomina, setInRinomina] = useState<string | null>(null);
  const [nomeRinomina, setNomeRinomina] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [caricando, setCaricando] = useState(false);

  const [nomeNuovo, setNomeNuovo] = useState("");
  const [passwordNuovo, setPasswordNuovo] = useState("");
  const [codiceUnione, setCodiceUnione] = useState("");
  const [passwordUnione, setPasswordUnione] = useState("");

  async function copiaCodice(codice: string) {
    try {
      await navigator.clipboard.writeText(codice);
    } catch {
      // se il clipboard non e' disponibile non facciamo nulla
    }
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
      await onCrea(nomeNuovo.trim(), passwordNuovo);
      setNomeNuovo("");
      setPasswordNuovo("");
      setFormAperto("nessuno");
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
      const risultato = await onUnisciti(codiceUnione.trim().toUpperCase(), passwordUnione);
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

        <hr className="my-4 border-[var(--color-cream-dark)]" />

        <h3 className="pixel-font text-base">Libri di ricette</h3>
        <p className="mt-1 text-sm opacity-70">
          Le tue ricette vivono in uno o piu' "libri". Segui il codice di un
          libro per vedere le sue ricette; aggiungi anche la password (se ne
          ha una) per poterci scrivere in collaborazione.
        </p>

        <ul className="mt-3 flex flex-col gap-1.5">
          {libri.map((l) => (
            <li
              key={l.codice}
              className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-3 py-2"
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
                    className="flex-1 truncate text-left"
                    onClick={() => l.modificabile && onImpostaAttivo(l.codice)}
                    title={l.modificabile ? "Imposta come libro attivo" : undefined}
                  >
                    <span className="text-base">
                      {l.codice === libroAttivo ? "● " : "○ "}
                      {l.nome}
                    </span>
                    <span className="ml-1 font-mono text-xs opacity-60">
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

        {formAperto === "unisciti" && (
          <div className="mt-3 flex flex-col gap-2">
            <input
              className="pixel-input font-mono"
              placeholder="Codice del libro"
              value={codiceUnione}
              onChange={(e) => setCodiceUnione(e.target.value)}
            />
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
