const KEY = "cosa-mangio-device-id";

/** Restituisce un id univoco per questo dispositivo/browser, creandolo se non esiste. */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
