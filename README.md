# Cosa mangio oggi? 🎲

App "ruota della fortuna" per decidere cosa cucinare, con ricette
standard condivise e ricette personali per dispositivo (nessun login
richiesto). Costruita con Vite + React + TypeScript + Tailwind CSS,
dati su Supabase (Postgres).

## Cosa fa

- Slider "Quanti piatti vuoi generare?" (1-4): aggiorna in tempo reale
  il numero di ruote indipendenti mostrate (una per piatto, ciascuna
  con i propri filtri), centrate e disposte in orizzontale su schermi
  larghi, impilate su mobile.
- Un solo bottone "Cosa mangio oggi?" (sotto le ruote) fa girare
  **tutte** le ruote contemporaneamente, estraendo una ricetta a caso
  per ciascun piatto (mostrata con un'**icona illustrata**, non il
  nome - niente emoji, un piccolo set di disegni SVG a colori pieni in
  `src/components/RecipeIcon.tsx`).
- Filtri opzionali per ogni ruota: categoria (singola selezione tra
  Tutti, Colazione, Main, Primo, Secondo, Contorno, Spuntino) e tag
  (multiselezione da menu a tendina).
- Bottone **+** per salvare una ricetta propria: nome (obbligatorio),
  ingredienti e procedimento (opzionali), categoria e tag in
  multiselezione, con possibilita' di aggiungere tag personalizzati.
- Schermata "Le mie ricette" con filtro **solo mie / tutte** ed
  eliminazione delle ricette proprie.
- Opzione "Usa anche le ricette standard": se disattivata, la ruota usa
  solo le ricette create dall'utente su quel dispositivo.
- Nessun account: ogni dispositivo/browser ha un id casuale salvato in
  `localStorage`, usato solo per le impostazioni e per registrare quale
  dispositivo ha creato ogni ricetta.
- **Libri di ricette con nome**: le ricette proprie vivono in un "libro"
  con un nome e un codice breve (es. `K3F9QZ`). Al primo avvio l'app
  chiede se creare un nuovo libro o unirsi a uno esistente incollandone
  il codice.
- **Collaborazione opzionale con password**: un libro puo' avere una
  password. Chi la conosce si unisce in "collaborazione" (puo' anche
  scrivere/eliminare ricette); chi non la mette, o non la conosce, segue
  il libro in **sola lettura**. Un dispositivo puo' seguire piu' libri
  insieme; le nuove ricette si salvano sempre sul libro scelto come
  attivo. Tutto si gestisce dal pannello Opzioni (rinomina, aggiungi,
  cambia libro attivo, smetti di seguire).

## Struttura del progetto

```
src/
  App.tsx                    orchestrazione stato, fetch, filtri, spin
  lib/
    device.ts                id dispositivo + libri di ricette seguiti (localStorage)
    supabase.ts              client Supabase (da variabili d'ambiente)
    database.types.ts        tipi TypeScript dello schema Postgres
    recipes.ts                tipi ricetta, CRUD, gestione libri, mappa icone
  components/
    Wheel.tsx                 la ruota SVG animata
    Filters.tsx                filtro pasto + tag a tendina
    AggiungiRicetta.tsx         form di creazione ricetta
    ElencoRicette.tsx           elenco/gestione ricette
    Impostazioni.tsx            toggle ricette standard + gestione libri
    Onboarding.tsx              scelta iniziale "crea libro" / "unisciti"
supabase/
  migration.sql               migrazione da eseguire sul progetto Supabase esistente
```

## 1. Database (Supabase)

Il progetto e' collegato al Supabase dedicato `fortunerecipe`
(`jceaixxavftisrjbzyqk`). Prima di avviare l'app, apri l'SQL editor del
progetto Supabase e incolla il contenuto di `supabase/migration.sql`.
Lo script crea:
- `ricette_standard`, `ricette_utente` (con la colonna `libro`, che
  raggruppa le ricette in "libri") e `impostazioni_dispositivo`;
- `libri` (codice, nome, password hashata con pgcrypto) e le funzioni
  `crea_libro`, `rinomina_libro`, `verifica_password_libro`,
  `libri_info`, usate dal client al posto di leggere/scrivere la
  tabella direttamente (cosi' l'hash della password non transita mai
  verso il browser).

E' idempotente: puoi eseguirlo anche piu' volte senza rischi, anche per
aggiornare un progetto gia' esistente a una versione precedente dello
schema.

> Nota sulla sicurezza: le policy RLS su `ricette_utente` (`USING (true)`)
> permettono a chiunque conosca il codice di un libro di leggerne e
> scriverne le ricette direttamente via API, indipendentemente dalla
> password. La password su un libro e' quindi un **cancelletto lato
> applicazione** (impedisce che l'app stessa proponga la scrittura a chi
> non la conosce, e la sua versione hashata non lascia mai il database),
> non una barriera crittografica reale sui dati: chi ha davvero brutte
> intenzioni e conosce il codice potrebbe comunque scrivere bypassando
> l'app. Per un'app di ricette personali/famigliari e' un compromesso
> accettabile, ma e' bene saperlo - non e' "privacy vera", e' "privacy
> per obscurity" con in piu' un piccolo ostacolo di cortesia.

## 2. Sviluppo locale

```bash
npm install
cp .env.example .env   # gia' precompilato con URL e chiave pubblica del progetto fortunerecipe
npm run dev
```

La chiave in `.env.example` e' la publishable key di Supabase: e'
pensata per stare nel bundle del client, la sicurezza reale e' demandata
alle policy RLS, non alla segretezza della chiave.

## 3. Build di produzione

```bash
npm run build
```

Genera una cartella `dist/` con file statici (HTML/CSS/JS): l'app e' una
SPA pura, non serve un server Node in produzione.

## 4. Come pubblicarla

Qualunque hosting per siti statici va bene. Le opzioni piu' semplici:

### Opzione A - Vercel o Netlify (consigliata, gratuita)
1. Crea un repository Git (GitHub/GitLab) con questo codice.
2. Su vercel.com o netlify.com, "Import project" dal repository.
3. Framework preset: Vite. Build command: `npm run build`. Output
   directory: `dist`.
4. Aggiungi le variabili d'ambiente nel pannello del progetto:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   (valori come in `.env.example`)
5. Deploy: ottieni un URL pubblico (`tuoapp.vercel.app` o
   `tuoapp.netlify.app`), aggiornato a ogni push.

### Opzione B - GitHub Pages
1. `npm run build`.
2. Pubblica il contenuto di `dist/` sul branch `gh-pages` (es. con il
   pacchetto `gh-pages` o un workflow GitHub Actions).
3. Le variabili d'ambiente vanno impostate a build time come "secrets"
   nel workflow Actions, perche' GitHub Pages e' solo hosting statico
   senza configurazione a runtime.

### Opzione C - hosting statico qualsiasi
Basta caricare il contenuto di `dist/` (dopo `npm run build` con le
variabili d'ambiente gia' impostate) su qualsiasi hosting statico:
server proprio, Cloudflare Pages, Firebase Hosting, un bucket S3 con
CDN, ecc.

In tutti i casi il database resta lo stesso progetto Supabase: l'app
pubblicata parlera' con gli stessi dati che vedi in locale.

## Palette e stile

Palette ispirata a un moodboard "recipe book": salvia
(`--color-ottanio` #9BC4BC), blu baltico (`--color-wood` #33658A), blu
antracite (`--color-crust` #2F4858, testo/scuro), bronzo miele
(`--color-ochre` #F6AE2D) e arancio (`--color-tomato` #F26419),
definiti in `src/index.css` come token Tailwind. Font: "Lobster"
(script) per il titolo principale, "Baloo 2" (bold) per sottotitoli e
bottoni, "Nunito" per i testi lunghi. Lo sfondo della pagina e' una
sfumatura diagonale tra i due blu e il bronzo miele; i pannelli
restano bianchi per contrasto.

Stile "a riempimento", senza bordi: pannelli, bottoni, chip e input non
hanno un contorno disegnato, la separazione visiva viene solo dal
contrasto tra colori di sfondo e da ombre morbide (`box-shadow`). Anche
la ruota non ha contorni sulle fette: i colori pieni bastano a
distinguerle.
