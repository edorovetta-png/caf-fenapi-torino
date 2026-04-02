# PROJECT STATUS — CAAT Reactivation

> Ultimo aggiornamento: 2026-03-31 (aggiunto flusso conferma ordine)
> Questo file serve come contesto condiviso tra Claude e Gemini. Ogni agente DEVE leggerlo prima di iniziare e aggiornarlo dopo ogni modifica significativa.

---

## 1. Descrizione del Progetto

Sistema per riattivare clienti dormienti di un'azienda alimentare al **CAAT di Torino** (Centro Agro Alimentare). Il sistema identifica automaticamente i clienti che non acquistano da oltre 60 giorni, genera offerte personalizzate tramite Claude API, e le invia via WhatsApp dopo approvazione del titolare.

**Fasi del progetto:**
1. Database e Seed Data
2. Edge Functions Core
3. Logica Conversazionale
4. WebApp Simulatore
5. WhatsApp Reale
6. Collegamento Arca (gestionale)

---

## 2. Tech Stack

| Componente | Tecnologia |
|---|---|
| Database | Supabase (PostgreSQL) |
| Backend | Supabase Edge Functions (Deno) |
| Frontend | Next.js (Vercel) |
| AI | Claude API (generazione offerte) |
| Messaggistica | WhatsApp Cloud API |
| Trascrizione audio | OpenAI Whisper |
| Deploy | Vercel (frontend) + Supabase (backend) |

---

## 3. Infrastruttura

- **Progetto Supabase:** `caat-reactivation` (migrato il 2 Aprile 2026)
- **Project ref:** `guffyjkiumnbmxbrrxls`
- **Dashboard:** https://supabase.com/dashboard/project/guffyjkiumnbmxbrrxls
- **Vecchio project ref (dismesso):** `jdfhapyzmhfwndczwvxi`
- **Credenziali:** in `.env.local` (gitignored)

---

## 4. Struttura Cartelle

```
Caat-reactivation/
├── CLAUDE.md                    # Istruzioni per Claude Code
├── Gemini.md                    # Istruzioni per Gemini
├── PROJECT_STATUS.md            # Questo file — stato condiviso
├── .env.local                   # Credenziali Supabase (gitignored)
├── .gitignore
│
├── supabase/
│   ├── config.toml              # Config Supabase CLI (generato da init)
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # Schema 10 tabelle
│   ├── seed/
│   │   └── seed.sql             # Dati di test (copia in supabase/seed.sql)
│   └── seed.sql                 # Seed usato da Supabase CLI
│
├── FASE-1-database-seed.md      # Spec Fase 1 ✅
├── FASE-2-edge-functions-core.md    # Spec Fase 2
├── FASE-3-logica-conversazionale.md # Spec Fase 3
├── FASE-4-webapp-simulatore.md      # Spec Fase 4
├── FASE-5-whatsapp-reale.md         # Spec Fase 5
└── FASE-6-collegamento-arca.md      # Spec Fase 6
```

---

## 5. Stato Fasi

### Fase 1: Database e Seed Data — COMPLETATA ✅

**Schema database (10 tabelle):**
- `clienti` — 30 record (18 dormienti, 12 attivi)
- `prodotti` — 50 record (latticini, conserve, olio, farine, salumi, pasta, pesce, bevande)
- `storico_acquisti` — 4132 righe (pattern realistici per categoria: pizzerie, ristoranti, trattorie, ecc.)
- `novita_prodotti` — 4 record (Burrata Affumicata, Tartufo Nero, Olio Monocultivar, Ravioli al Plin)
- `regole_commerciali` — 6 regole (sconto base/aggressivo, trasporto gratis, novità, limite prodotti, validità)
- `config_sistema` — 7 parametri (ore cron, soglie, mock_mode=true)
- `owner_session` — 1 record (stato: idle)
- `offerte_giornaliere` — vuota (verrà popolata dalla Fase 2)
- `conversazioni` — vuota (verrà popolata dalla Fase 3)
- `blacklist` — vuota

**Indici:** su storico_acquisti(cliente_id, data_acquisto), offerte_giornaliere(stato, data_generazione)
**Trigger:** updated_at automatico su clienti, offerte_giornaliere, owner_session
**RLS:** disabilitato (verrà attivato nella Fase 4)

**Dati chiave dormienti:**
- Range dormienza: 70-191 giorni
- Categorie: 4 ristoranti, 3 pizzerie, 3 rosticcerie, 2 bar, 2 catering, 2 trattorie, 1 hotel, 1 trattoria
- Ogni cliente ha 3-6 prodotti abituali con storico 12 mesi

### Fase 2: Edge Functions Core — COMPLETATA ✅ (mock mode)

**Edge Functions deployate (4):**
- `extract-dormant` — Estrae dormienti, genera offerte (mock Claude), salva in offerte_giornaliere
- `notify-owner` — Compone riepilogo per titolare, invia via WhatsApp (mock), aggiorna owner_session
- `send-approved` — Invia messaggi approvati ai clienti (mock), aggiorna stato offerte
- `transcribe-audio` — Stub per Whisper API (mock restituisce testo fisso)

**Shared utilities (`_shared/`):**
- `supabase.ts` — Client Supabase con service role key
- `claude.ts` — Wrapper Claude API con mock mode (genera offerte realistiche senza API key)
- `whatsapp.ts` — Mock sender che salva in tabella conversazioni
- `whisper.ts` — Mock trascrizione audio

**Test eseguiti:**
- extract-dormant: 18 clienti processati, 18 offerte generate, 0 errori
- notify-owner: messaggio riepilogativo inviato al titolare (mock), 18 offerte elencate
- transcribe-audio: mock transcription funzionante
- Offerta JSON contiene: prodotti_suggeriti con sconti, novita_suggerite, trasporto_gratuito, messaggio_cliente, reasoning

**Nota:** Tutto in MOCK MODE (mock_mode=true in config_sistema). Per Claude API reale, settare ANTHROPIC_API_KEY nei secrets Supabase e mock_mode=false.

**Cron jobs:** non ancora configurati su Supabase (richiedono Piano Pro per pg_cron). Le funzioni sono invocabili manualmente via HTTP.

### Fase 3: Logica Conversazionale — COMPLETATA ✅ (mock mode)

**Edge Functions deployate (4):**
- `whatsapp-webhook` — Router messaggi: smista tra titolare e clienti basandosi sul numero
- `owner-interaction` — Gestisce comandi titolare: OK, VEDI n, MOD n, RIMANDA n, STOP n, esclusioni, intent naturale
- `client-interaction` — Gestisce risposte clienti: identifica cliente, chiama ai-reply, escalation
- `ai-reply` — Genera risposte mock contestuali (interesse, domande, reclami, STOP)

**Flusso scheda-per-scheda (aggiornato):**
- notify-owner manda intro + prima scheda, una alla volta
- Formato: `[n/totale] — Nome (gg dormiente) + prodotti + novità + trasporto`
- `invia` / `ok` / `sì` → approva e passa alla scheda successiva
- `posticipa` / `rimanda` → postpone 14gg, passa alla prossima
- `cancella` / `stop` → chiede conferma CONFERMO, poi blacklist + prossima
- `modifica: [istruzioni]` → Claude riformula, mostra preview, chiede SÌ
- `invia tutti` → approva tutti i restanti e chiude la revisione
- owner_session traccia `indice_corrente` e `offerte_ids[]` (migration 002)
- A fine revisione: triggera send-approved automaticamente
- **CORS Fixato**: Aggiunto supporto CORS sulle Edge function in modo che il trigger dalla WebApp su `localhost:3000` funzioni correttamente.
- **Test Claude API Reale (1 Aprile)**: Disattivata la mock mode, triggerata l'estrazione ed elaborate con successo 18 offerte complete con reasoning contestuale via Claude API reali.

**Test end-to-end eseguito:**
1. extract-dormant → 18 offerte generate
2. notify-owner → riepilogo inviato al titolare
3. VEDI 1 → dettaglio Ristorante Aurora
4. RIMANDA 3 → Rosticceria Sapori del Sud posticipata 14gg
5. OK → 17 messaggi approvati e inviati ai clienti
6. Cliente risponde "mi interessa" → risposta AI con riepilogo ordine

**Risultato finale:** 17 sent, 1 postponed, 0 excluded. 25 messaggi in conversazioni.

**Flusso conferma ordine (aggiunto post-Fase 3):**
- Migration `003_order_confirmed.sql`: aggiunto stato `order_confirmed` + campo `ordine_confermato` (jsonb) a offerte_giornaliere
- `ai-reply`: detecta conferme ordine ("sì", "confermo", "va bene", "procediamo") solo dopo che il sistema ha chiesto "Vuoi confermare?"
- `client-interaction`: quando `order_confirmed=true`, compone riepilogo ordine con prodotti/quantità/prezzi, notifica il titolare ("📦 NUOVO ORDINE — ..."), conferma al cliente ("✅ Ordine ricevuto!"), aggiorna stato in `order_confirmed` e salva `ordine_confermato` jsonb
- Quantità default stimate dal nome prodotto (200g→6pz, 1kg→2pz, 5L→1pz, ecc.)

### Fase 4: WebApp Admin + Simulatore — COMPLETATA ✅

**Stack:** Next.js 16 + TypeScript + Tailwind CSS + Supabase client
**Directory:** `apps/admin/`

**Pagine implementate (9):**
- **Dashboard** (`/`) — 4 KPI cards (dormienti, offerte inviate, tasso risposta, riattivati) + tabella ultime 10 offerte
- **Simulatore** (`/simulatore`) — Due pannelli chat affiancati: titolare (comandi OK/VEDI/MOD/RIMANDA/STOP) + cliente (risposte). Bottoni "Trigger Estrazione" e "Trigger Riepilogo". Realtime subscription su conversazioni
- **Clienti** (`/clienti`) — Lista con stato (attivo/dormiente/blacklist), dettaglio con storico acquisti e offerte, toggle blacklist
- **Import Dati** (`/import`) — 4 sezioni: Clienti (CSV + testo libero con Claude), Prodotti (CSV), Storico Acquisti (CSV), Novità Prodotti (testo libero con Claude). Validazione client-side, anteprima, progress bar, report. Template CSV scaricabili. Gestisce UTF-8 BOM, separatori comma/semicolon, date DD/MM/YYYY.
- **Regole** (`/regole`) — CRUD completo con toggle attiva/disattiva, editor JSON condizione/azione
- **Conversazioni** (`/conversazioni`) — Storico con filtri (titolare/cliente), bolle chat stile WhatsApp
- **Consumo** (`/consumo`) — Costi in tempo reale: WhatsApp (template vs free), Claude API (offerte + risposte), Database (righe/piano), Hosting. Totale mensile con color-coding. Tabella proiezione costi per scala.
- **Impostazioni** (`/impostazioni`) — Config sistema editabile (ore, soglie, mock_mode toggle)
- **Login** (`/login`) — Placeholder (auth completa in produzione)

**Edge Functions aggiuntive (3):**
- `import-csv` — Import CSV per clienti, prodotti, storico_acquisti. Upsert su arca_id, campi vuoti non sovrascrivono (approach B). Gestisce formati numero, date, boolean.
- `parse-text` — Parsing testo libero via Claude API per aggiunta clienti e novità prodotti. Due azioni: parse (anteprima) e save (salvataggio).
- `usage-stats` — Aggregazione consumi mensili: messaggi WhatsApp, chiamate Claude, righe DB. Calcolo costi stimati.

**Componenti:** Sidebar, KpiCard, ChatBubble, TokenBanner
**Build:** OK, tutte le pagine generate staticamente
**Dev server:** http://localhost:3000

### Fase 5: WhatsApp Reale — COMPLETATA ✅

**Backend e Codice (Completato e Deployato):**
- `_shared/whatsapp.ts`: invio reale via Meta Graph API v22.0 quando `mock_mode=false`. Supporta template e testo libero. Normalizzazione numeri E.164. Language code `en` per `notifica_titolare`, `it` per gli altri.
- `whatsapp-webhook/index.ts`: verifica webhook Meta (GET), parsing messaggi Cloud API (text, button, interactive, audio), gestione status updates (delivered/read → 200 ack), routing titolare/cliente.
- `owner-interaction`: quando il titolare risponde in stato idle con offerte pending, avvia automaticamente la revisione scheda-per-scheda come testo libero (nella finestra 24h).
- `notify-owner`: invia intro via template `notifica_titolare`, la prima scheda viene mandata quando il titolare risponde (apre finestra 24h).
- `send-approved`: invia offerte ai clienti via template `riattivazione_cliente`.
- Tutte le 8 Edge Functions deployate in produzione (2 Aprile 2026).

**Infrastruttura (Completata):**
- Progetto migrato su `guffyjkiumnbmxbrrxls` (2 Aprile 2026)
- Secrets configurati: `WA_ACCESS_TOKEN`, `WA_PHONE_NUMBER_ID` (967226749817711), `WA_BUSINESS_ACCOUNT_ID`, `WA_VERIFY_TOKEN`
- Webhook verificato e attivo su Meta
- `mock_mode=false`, `telefono_titolare=393428629687`

**Template WhatsApp:**
- `riattivazione_cliente` ({{1}}=nome, {{2}}=offerta, lingua: it) — ✅ ATTIVO
- `notifica_titolare` ({{1}}=contenuto, lingua: en) — ✅ ATTIVO

**Test end-to-end reale completato (2 Aprile 2026):**
- notify-owner → messaggio template ricevuto su WhatsApp ✅
- Risposta "OK" → webhook riceve, owner-interaction avvia revisione, scheda inviata ✅

### Fase 6: Collegamento Arca — NON INIZIATA

---

## 6. Prossimi Step

1. **Fase 5:** Approvazione template `notifica_titolare` + test end-to-end reale
2. Configurare cron jobs (richiede Piano Pro Supabase per pg_cron)
3. **Fase 6:** Collegamento Arca (gestionale)
_(Nota: ANTHROPIC_API_KEY è già configurata nei secrets. Per attivare il flusso reale, mettere `mock_mode=false` dalle Impostazioni della WebApp)_
