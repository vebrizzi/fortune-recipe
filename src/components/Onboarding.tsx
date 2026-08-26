import { useState } from "react";

type RisultatoUnione = { ok: true } | { ok: false; messaggio: string };

export function Onboarding({
  onCrea,
  onUnisciti,
}: {
  onCrea: (nome: string, password?: string) => Promise<void>;
  onUnisciti: (codice: string, password?: string) => Promise<RisultatoUnione>;
}) {
  const [modo, setModo] = useState<"scelta" | "crea" | "unisciti">("scelta");

  const [nome, setNome] = useState("");
  const [password, setPassword] = useState("");
  const [codice, setCodice] = useState("");
  const [passwordUnione, setPasswordUnione] = useState("");

  const [caricando, setCaricando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  async function handleCrea() {
    if (!nome.trim()) {
      setErrore("Dai un nome al tuo libro di ricette.");
      return;
    }
    setErrore(null);
    setCaricando(true);
    try {
      await onCrea(nome.trim(), password);
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
      const risultato = await onUnisciti(codice.trim().toUpperCase(), passwordUnione);
      if (!risultato.ok) setErrore(risultato.messaggio);
    } catch {
      setErrore("Non sono riuscito a controllare il codice. Riprova.");
    } finally {
      setCaricando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-crust)]/70 px-4">
      <div className="pixel-panel w-full max-w-md p-5">
        <h2 className="pixel-font text-xl">Benvenuto! 🎲</h2>

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
      </div>
    </div>
  );
}
