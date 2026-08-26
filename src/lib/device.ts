const DEVICE_KEY = "cosa-mangio-device-id";
const LIBRI_KEY = "cosa-mangio-libri-v2";
const LIBRI_KEY_LEGACY = "cosa-mangio-libri";
const LIBRO_ATTIVO_KEY = "cosa-mangio-libro-attivo";

export type LibroLocale = {
  codice: string;
  nome: string;
  /** false = seguito in sola lettura (nessuna password valida fornita all'aggiunta). */
  modificabile: boolean;
};

const ALFABETO_CODICE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // niente 0/O/1/I, si confondono

/** Genera un codice breve e leggibile per un nuovo libro di ricette. */
export function generaCodiceLibro(): string {
  let codice = "";
  for (let i = 0; i < 6; i++) {
    codice += ALFABETO_CODICE[Math.floor(Math.random() * ALFABETO_CODICE.length)];
  }
  return codice;
}

/** Restituisce un id univoco per questo dispositivo/browser, creandolo se non esiste. */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function scriviLibri(libri: LibroLocale[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LIBRI_KEY, JSON.stringify(libri));
}

/**
 * Restituisce i libri seguiti da questo dispositivo. Un array vuoto
 * significa "dispositivo nuovo, non ha ancora scelto un libro" (l'app
 * mostra l'onboarding). Se esiste il formato precedente (solo elenco di
 * codici, senza nome/permessi) lo converte automaticamente mantenendo
 * tutto modificabile come si comportava prima.
 */
export function getLibri(): LibroLocale[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LIBRI_KEY);
  if (raw) {
    try {
      const libri = JSON.parse(raw) as LibroLocale[];
      if (Array.isArray(libri)) return libri;
    } catch {
      // formato non valido, si prosegue col fallback legacy
    }
  }
  const legacy = window.localStorage.getItem(LIBRI_KEY_LEGACY);
  if (legacy) {
    try {
      const codici = JSON.parse(legacy) as string[];
      if (Array.isArray(codici) && codici.length > 0) {
        const libri = codici.map((codice) => ({
          codice,
          nome: "Il mio libro",
          modificabile: true,
        }));
        scriviLibri(libri);
        return libri;
      }
    } catch {
      // ignora, si comporta come dispositivo nuovo
    }
  }
  return [];
}

export function salvaLibri(libri: LibroLocale[]) {
  scriviLibri(libri);
}

/** Restituisce il codice del libro su cui vengono salvate le nuove ricette (se esiste). */
export function getLibroAttivo(): string | null {
  if (typeof window === "undefined") return null;
  const libri = getLibri();
  const attivo = window.localStorage.getItem(LIBRO_ATTIVO_KEY);
  if (attivo && libri.some((l) => l.codice === attivo && l.modificabile)) return attivo;
  const primoModificabile = libri.find((l) => l.modificabile);
  return primoModificabile ? primoModificabile.codice : null;
}

export function setLibroAttivo(codice: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LIBRO_ATTIVO_KEY, codice);
}

/** Aggiunge un libro nuovo (o aggiorna nome/permessi se il codice era gia' seguito). */
export function aggiungiOAggiornaLibro(libro: LibroLocale): LibroLocale[] {
  const libri = getLibri();
  const idx = libri.findIndex((l) => l.codice === libro.codice);
  if (idx >= 0) libri[idx] = libro;
  else libri.push(libro);
  scriviLibri(libri);
  return libri;
}

/** Smette di seguire un libro su questo dispositivo (i dati sul server non vengono toccati). */
export function rimuoviLibro(codice: string): LibroLocale[] {
  const libri = getLibri().filter((l) => l.codice !== codice);
  scriviLibri(libri);
  if (typeof window !== "undefined" && window.localStorage.getItem(LIBRO_ATTIVO_KEY) === codice) {
    window.localStorage.removeItem(LIBRO_ATTIVO_KEY);
  }
  return libri;
}
