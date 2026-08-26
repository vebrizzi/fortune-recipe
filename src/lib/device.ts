const DEVICE_KEY = "cosa-mangio-device-id";
const LIBRI_KEY = "cosa-mangio-libri";
const LIBRO_ATTIVO_KEY = "cosa-mangio-libro-attivo";

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

function leggiLibri(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LIBRI_KEY);
    const libri = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(libri) ? libri : [];
  } catch {
    return [];
  }
}

function scriviLibri(libri: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LIBRI_KEY, JSON.stringify(libri));
}

/**
 * Restituisce i codici dei "libri di ricette" seguiti da questo dispositivo.
 * Il primo avvio segue automaticamente il proprio libro personale (il
 * device_id), cosi' il comportamento e' identico a prima finche' non si
 * aggiunge un altro codice.
 */
export function getLibri(): string[] {
  const libri = leggiLibri();
  if (libri.length > 0) return libri;
  const proprio = [getDeviceId()];
  scriviLibri(proprio);
  return proprio;
}

/** Restituisce il libro su cui vengono salvate le nuove ricette. */
export function getLibroAttivo(): string {
  const libri = getLibri();
  if (typeof window === "undefined") return libri[0];
  const attivo = window.localStorage.getItem(LIBRO_ATTIVO_KEY);
  if (attivo && libri.includes(attivo)) return attivo;
  return libri[0];
}

export function setLibroAttivo(codice: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LIBRO_ATTIVO_KEY, codice);
}

/** Aggiunge (e segue) un libro esistente tramite il suo codice. */
export function aggiungiLibro(codice: string): string[] {
  const normalizzato = codice.trim();
  if (!normalizzato) return getLibri();
  const libri = getLibri();
  if (!libri.includes(normalizzato)) {
    libri.push(normalizzato);
    scriviLibri(libri);
  }
  return libri;
}

/** Smette di seguire un libro. Se resta vuoto, ripristina il proprio libro personale. */
export function rimuoviLibro(codice: string): string[] {
  let libri = getLibri().filter((l) => l !== codice);
  if (libri.length === 0) libri = [getDeviceId()];
  scriviLibri(libri);
  if (getLibroAttivo() === codice) setLibroAttivo(libri[0]);
  return libri;
}
