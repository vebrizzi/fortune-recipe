import { useEffect, useState } from "react";
import { ottieniLibri } from "../lib/recipes";

type RisultatoUnione = { ok: true } | { ok: false; messaggio: string };
type AnteprimaLibro = { stato: "idle" | "verificando" | "trovato" | "non-trovato"; nome?: string };

export function Onboarding({
  onCrea,
  onUnisciti,
  onFine,
}: {
  onCrea: (nome: string, password?: string) => Promise<string>;
  onUnisciti: (codice: string, password?: string) => Promise<RisultatoUnione>;
  onFine: () => void;
}) {
  const [modo, setModo] = useState<"scelta" | "crea" | "unisciti" | "fatto">("scelta");
  const [esito, setEsito] = useState<{ nome: string; codice?: string } | null>(null);

  const [nome, setNome] = useState("");
  const [password, setPassword] = useState("");
  const [codice, setCodice] = useState("");
  const [passwordUnione, setPasswordUnione] = useState("");
  const [anteprima, setAnteprima] = useState<AnteprimaLibro>({ stato: "idle" });
  const [copiato, setCopiato] = useState(false);

  const [caricando, setCaricando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    const valore = codice.trim();
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
  }, [codice]);

  async function handleCrea() {
    if (!nome.trim()) {
      setErrore("Dai un nome al tuo libro di ricette.");
      return;
    }
    setErrore(null);
    setCaricando(true);
    try {
      const codiceCreato = await onCrea(nome.trim(), password);
      setEsito({ nome: nome.trim(), codice: codiceCreato });
      setModo("fatto");
    } catch {
      setErrore("Non sono riuscito a creare il libro. Riprova.");
    } finally {
      setCaricando(false);
    }
  }

  async function handleUnisciti() {
    if (!codice.trim()) {
      setErrore("Inserisci il codice del libro.");
      return;
    }
    setErrore(null);
    setCaricando(true);
    try {
      const risultato = await onUnisciti(codice.trim(), passwordUnione);
      if (!risultato.ok) {
        setErrore(risultato.messaggio);
      } else {
        setEsito({ nome: anteprima.nome ?? "il libro" });
        setModo("fatto");
      }
    } catch {
      setErrore("Non sono riuscito a controllare il codice. Riprova.");
    } finally {
      setCaricando(false);
    }
  }

  async function copiaCodice(valore: string) {
    try {
      await navigator.clipboard.writeText(valore);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 1500);
    } catch {
      // se il clipboard non e' disponibile non facciamo nulla
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-crust)]/70 px-4">
      <div className="pixel-panel w-full max-w-md p-5">
        <h2 className="pixel-font text-xl">Benvenuto!</h2>

        {modo === "scelta" && (
          <>
            <p className="mt-2 text-base opacity-80">
              Le tue ricette vivono in un "libro" identificato da un codice.
              Vuoi crearne uno nuovo o unirti a uno che esiste gia'?
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                className="pixel-btn pixel-btn-ochre w-full py-3"
                onClick={() => setModo("crea")}
              >
                Crea un nuovo libro
              </button>
              <button
                type="button"
                className="pixel-btn pixel-btn-ottanio w-full py-3"
                onClick={() => setModo("unisciti")}
              >
                Ho gia' un codice
              </button>
            </div>
          </>
        )}

        {modo === "crea" && (
          <div className="mt-3 flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Nome del libro *</span>
              <input
                className="pixel-input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Es. Ricette di casa"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">
                Password (opzionale, per proteggere la scrittura)
              </span>
              <input
                type="password"
                className="pixel-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Lascia vuoto per nessuna password"
              />
            </label>
            {errore && (
              <p className="text-sm font-bold text-[var(--color-tomato)]">{errore}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                className="pixel-btn pixel-btn-wood flex-1 py-3 text-sm"
                onClick={() => setModo("scelta")}
              >
                Indietro
              </button>
              <button
                type="button"
                className="pixel-btn pixel-btn-ochre flex-1 py-3 text-sm"
                onClick={handleCrea}
                disabled={caricando}
              >
                {caricando ? "Creo..." : "Crea"}
              </button>
            </div>
          </div>
        )}

        {modo === "unisciti" && (
          <div className="mt-3 flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Codice del libro *</span>
              <input
                className="pixel-input font-mono"
                value={codice}
                onChange={(e) => setCodice(e.target.value)}
                placeholder="Es. K3F9QZ"
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
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">
                Password (solo se vuoi anche aggiungere ricette)
              </span>
              <input
                type="password"
                className="pixel-input"
                value={passwordUnione}
                onChange={(e) => setPasswordUnione(e.target.value)}
                placeholder="Lascia vuoto per seguire in sola lettura"
              />
            </label>
            {errore && (
              <p className="text-sm font-bold text-[var(--color-tomato)]">{errore}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                className="pixel-btn pixel-btn-wood flex-1 py-3 text-sm"
                onClick={() => setModo("scelta")}
              >
                Indietro
              </button>
              <button
                type="button"
                className="pixel-btn pixel-btn-ochre flex-1 py-3 text-sm"
                onClick={handleUnisciti}
                disabled={caricando}
              >
                {caricando ? "Verifico..." : "Aggiungi"}
              </button>
            </div>
          </div>
        )}

        {modo === "fatto" && esito && (
          <div className="mt-3 flex flex-col gap-3">
            {esito.codice ? (
              <>
                <p className="text-base opacity-80">
                  Libro "{esito.nome}" creato! Salva questo codice: ti servira'
                  per aggiungerlo su altri dispositivi.
                </p>
                <div className="pixel-panel flex items-center justify-between gap-2 p-3">
                  <span className="font-mono text-2xl tracking-widest">
                    {esito.codice}
                  </span>
                  <button
                    type="button"
                    className="pixel-btn pixel-btn-ottanio px-3 text-xs"
                    onClick={() => copiaCodice(esito.codice!)}
                  >
                    {copiato ? "Copiato!" : "Copia"}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-base opacity-80">
                Ti sei unito al libro "{esito.nome}"!
              </p>
            )}
            <button
              type="button"
              className="pixel-btn pixel-btn-ochre w-full py-3"
              onClick={onFine}
            >
              Continua
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
