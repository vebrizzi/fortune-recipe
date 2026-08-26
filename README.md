# Cosa mangio oggi? 🎲

App "ruota della fortuna" stile 8-bit per decidere cosa cucinare, con
ricette standard condivise e ricette personali per dispositivo (nessun
login richiesto). Costruita con Vite + React + TypeScript + Tailwind CSS,
dati su Supabase (Postgres).

## Cosa fa

- Slider "Quanti piatti vuoi generare?" (1-4): aggiorna in tempo reale
  il numero di ruote indipendenti mostrate (una per piatto, ciascuna
  con i propri filtri), centrate e disposte in orizzontale su schermi
  larghi, impilate su mobile.
- Un solo bottone "Cosa mangio oggi?" fa girare **tutte** le ruote
  contemporaneamente, estraendo una ricetta a caso per ciascun piatto
  (mostrata con un'**icona**, non il nome).
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
  `localStorage`, usato per associare le proprie ricette e impostazioni.

## Struttura del progetto

```
src/
  App.tsx                    orchestrazione stato, fetch, filtri, spin
  lib/
    device.ts                id per-dispositivo
    supabase.ts              client Supabase (da variabili d'ambiente)
    database.types.ts        tipi TypeScript dello schema Postgres
    recipes.ts                tipi ricetta, CRUD, mappa icone
  components/
    Wheel.tsx                 la ruota SVG animata
    Filters.tsx                filtro pasto + tag a tendina
    AggiungiRicetta.tsx         form di creazione ricetta
    ElencoRicette.tsx           elenco/gestione ricette
    Impostazioni.tsx            toggle ricette standard
supabase/
  migration.sql               migrazione da eseguire sul progetto Supabase esistente
```

## 1. Database (Supabase)

Il progetto e' collegato al Supabase dedicato `fortunerecipe`
(`jceaixxavftisrjbzyqk`). E' un progetto nuovo/vuoto: prima di avviare
l'app, apri l'SQL editor del progetto Supabase e incolla il contenuto di
`supabase/migration.sql`. Lo script crea le tabelle `ricette_standard`,
`ricette_utente` e `impostazioni_dispositivo` con RLS aperta e filtrata
per `device_id` lato applicazione. E' idempotente: puoi eseguirlo anche
piu' volte senza rischi.

> Nota sulla sicurezza: le policy RLS attuali (`USING (true)`) permettono
> a chiunque conosca la chiave pubblica di leggere/scrivere righe di
> qualunque `device_id`, non solo il proprio: l'isolamento e' solo
> convenzionale lato client, non garantito dal database. Per un'app di
> ricette personali e' un compromesso accettabile, ma e' bene saperlo -
> non e' "privacy vera", e' "privacy per obscurity".

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

Colori "da cucina" definiti in `src/index.css` come token Tailwind:
marrone (`--color-wood`), ocra (`--color-ochre`), rosso pomodoro
(`--color-tomato`), verde ottanio (`--color-ottanio`, un teal scuro -
se intendevi un'altra tonalita' con "ottanio" e' il primo punto da
sistemare). Stile semplice e pulito: font "Baloo 2" (bold) per i
titoli, "Patrick Hand" (handwritten) per bottoni/etichette, "Nunito"
per i testi, pannelli con angoli arrotondati e ombre morbide, ruota con
icone piu' grandi e stilizzate.
