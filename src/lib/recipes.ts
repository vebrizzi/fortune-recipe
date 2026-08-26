import { supabase } from "./supabase";

export type Categoria =
  | "colazione"
  | "main"
  | "primo"
  | "secondo"
  | "contorno"
  | "spuntino";
export const CATEGORIE: Categoria[] = [
  "colazione",
  "main",
  "primo",
  "secondo",
  "contorno",
  "spuntino",
];
export const CATEGORIA_LABEL: Record<Categoria, string> = {
  colazione: "Colazione",
  main: "Main",
  primo: "Primo",
  secondo: "Secondo",
  contorno: "Contorno",
  spuntino: "Spuntino",
};

export const TAG_BASE = ["light", "vegetariano", "vegano", "low cost"];

export type Ricetta = {
  id: string;
  nome: string;
  ingredienti: string | null;
  procedimento: string | null;
  pasto: string[];
  tag: string[];
  standard: boolean;
};

export async function fetchRicetteUtente(deviceId: string): Promise<Ricetta[]> {
  const { data, error } = await supabase
    .from("ricette_utente")
    .select("id, nome, ingredienti, procedimento, pasto, tag")
    .eq("device_id", deviceId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    pasto: r.pasto ?? [],
    tag: r.tag ?? [],
    standard: false,
  }));
}

export async function fetchRicetteStandard(): Promise<Ricetta[]> {
  const { data, error } = await supabase
    .from("ricette_standard")
    .select("id, nome, ingredienti, procedimento, pasto, tag")
    .order("nome");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    pasto: r.pasto ?? [],
    tag: r.tag ?? [],
    standard: true,
  }));
}

export async function fetchImpostazioni(deviceId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("impostazioni_dispositivo")
    .select("usa_ricette_standard")
    .eq("device_id", deviceId)
    .maybeSingle();
  if (error) throw error;
  return data?.usa_ricette_standard ?? true;
}

export async function salvaImpostazioni(deviceId: string, usaStandard: boolean) {
  const { error } = await supabase.from("impostazioni_dispositivo").upsert(
    {
      device_id: deviceId,
      usa_ricette_standard: usaStandard,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "device_id" }
  );
  if (error) throw error;
}

export async function creaRicetta(input: {
  deviceId: string;
  nome: string;
  ingredienti?: string;
  procedimento?: string;
  pasto: string[];
  tag: string[];
}) {
  const { error } = await supabase.from("ricette_utente").insert({
    device_id: input.deviceId,
    nome: input.nome,
    ingredienti: input.ingredienti || null,
    procedimento: input.procedimento || null,
    pasto: input.pasto,
    tag: input.tag,
  });
  if (error) throw error;
}

export async function eliminaRicetta(id: string, deviceId: string) {
  const { error } = await supabase
    .from("ricette_utente")
    .delete()
    .eq("id", id)
    .eq("device_id", deviceId);
  if (error) throw error;
}

/**
 * Associa un'icona pixel/emoji a una ricetta in base a parole chiave nel nome,
 * nei tag e nel pasto. Non mostriamo mai il nome della ricetta sulla ruota:
 * solo l'icona, per l'effetto "sorpresa" richiesto.
 */
const KEYWORD_ICONS: Array<{ keywords: string[]; icon: string }> = [
  { keywords: ["pasta", "spaghett", "penne", "fusilli"], icon: "🍝" },
  { keywords: ["pizza"], icon: "🍕" },
  { keywords: ["pollo", "tacchino"], icon: "🍗" },
  { keywords: ["salmone", "pesce", "tonno", "gamber"], icon: "🐟" },
  { keywords: ["insalata"], icon: "🥗" },
  { keywords: ["uov", "frittata"], icon: "🍳" },
  { keywords: ["zuppa", "lenticchi", "minestr", "fagioli"], icon: "🍲" },
  { keywords: ["curry"], icon: "🍛" },
  { keywords: ["riso"], icon: "🍚" },
  { keywords: ["pancake", "porridge", "avena"], icon: "🥞" },
  { keywords: ["yogurt", "ricotta"], icon: "🥣" },
  { keywords: ["toast", "panino", "pane"], icon: "🥪" },
  { keywords: ["hummus", "ceci"], icon: "🧆" },
  { keywords: ["mela", "frutt", "mandorle", "noci"], icon: "🍎" },
  { keywords: ["popcorn"], icon: "🍿" },
  { keywords: ["quinoa", "bowl"], icon: "🥙" },
  { keywords: ["patate"], icon: "🥔" },
];

const CATEGORIA_FALLBACK_ICON: Record<Categoria, string> = {
  colazione: "☕",
  main: "🍽️",
  primo: "🍝",
  secondo: "🍗",
  contorno: "🥗",
  spuntino: "🍪",
};

export function iconaRicetta(ricetta: Ricetta): string {
  const testo = ricetta.nome.toLowerCase();
  for (const entry of KEYWORD_ICONS) {
    if (entry.keywords.some((k) => testo.includes(k))) return entry.icon;
  }
  const primaCategoria = ricetta.pasto[0] as Categoria | undefined;
  if (primaCategoria && CATEGORIA_FALLBACK_ICON[primaCategoria]) {
    return CATEGORIA_FALLBACK_ICON[primaCategoria];
  }
  return "🍴";
}
