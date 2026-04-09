# PROJECT STATUS — Circolo FENAPI Provincia di Torino

> Ultimo aggiornamento: 2026-04-09 (brief SEO 004 applicato su branch `seo/brief-004-pages`: create pagine standalone `chi-siamo.html` e `contatti.html` indicizzabili basate sul template di `servizi/modello-730.html`. chi-siamo copre storia dal 1992, ruolo di Sede Provinciale CAF FENAPI per Torino/provincia/Piemonte, profilo Michela Salerno Vice-Presidente con anchor `#michela-salerno`, sezione CAF Impresa (contabilità+paghe come differenziatore), perché sceglierci; contatti include NAP completo, mappa Google embed, orari, come raggiungerci, CTA piattaforma prenotazioni. Schema AboutPage + Person (`@id` reference alla homepage + `url` aggiornato) + BreadcrumbList su chi-siamo; ContactPage + BreadcrumbList su contatti. Navigation menu aggiornato su 18 file HTML: `#chi-siamo`/`#contatti` → `chi-siamo.html`/`contatti.html`. sitemap.xml aggiornata (20 URL, lastmod 2026-04-09 su homepage+nuove pagine). Brief 003 E-E-A-T YMYL già applicato e mergiato.)
> Questo file serve come contesto condiviso tra Claude e Gemini.

---

## 1. Descrizione del Progetto

Sito web e sistema di prenotazione appuntamenti per il **Circolo FENAPI — Provincia di Torino** (Centro di Assistenza Fiscale). Il progetto si compone di due applicazioni principali:

- **Sito vetrina** (`frontend/`): sito statico HTML/CSS/JS che presenta i servizi del CAF (730, ISEE, IMU, pensioni, ecc.), con pagine dedicate per ogni servizio.
- **App prenotazioni** (`caffenapi/`): applicazione React per la prenotazione online degli appuntamenti, con dashboard admin, gestione operatori, analytics e integrazione Google Calendar. Deployata su Vercel (caffenapi.vercel.app), repo git separato.

Il progetto segue un'architettura a 3 livelli documentata in `Gemini.md`: Direttive (SOP in Markdown), Orchestrazione (decisioni dell'agente AI), Esecuzione (script Python deterministici).

---

## 2. Tech Stack

### Sito Vetrina (`frontend/`)
| Componente | Tecnologia |
|---|---|
| Markup | HTML5 statico (no framework) |
| Stili | CSS vanilla con custom properties (design system basato su brand guidelines) |
| JavaScript | Vanilla JS (scroll animations, counter, mobile menu, IntersectionObserver) |
| Font | Google Fonts: Open Sans + Shadows Into Light |
| Analytics | Google Analytics 4 (G-YNHWG87MSQ) |
| Hosting | File statici (nessun build step) |

### App Prenotazioni (`caffenapi/`)
| Componente | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| Routing | React Router DOM v6 |
| State/Data | TanStack React Query |
| Forms | React Hook Form + Zod |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Email | Supabase Edge Functions (`send-booking-email`, `process-email-queue`) |
| Calendario | Integrazione Google Calendar (via Edge Function) |
| Documenti | Upload su Google Drive (via Edge Function) |
| Grafici | Recharts |
| Testing | Vitest + Testing Library |
| Deploy | Vercel (caffenapi.vercel.app) |
| Font | Open Sans (allineato a brand guidelines) |

### Script di esecuzione (`execution/`)
| Componente | Tecnologia |
|---|---|
| Linguaggio | Python 3 |
| Dipendenze | python-dotenv, requests |
| Utility | Logging, retry con backoff, JSON I/O |

---

## 3. Struttura delle Cartelle

```
Antigravity/
├── CLAUDE.md                    # Istruzioni generali workspace
├── Gemini.md                    # Istruzioni generali agente
│
├── fenapi/                      # Progetto FENAPI
│   ├── CLAUDE.md                # Istruzioni specifiche progetto FENAPI
│   ├── Gemini.md                # Istruzioni agente specifiche FENAPI
│   ├── PROJECT_STATUS.md        # Stato aggiornato del progetto
│   ├── fenapi-group-brand-guidelines.md  # Brand guidelines
│   │
│   ├── frontend/                # Sito vetrina statico
│   │   ├── index.html           # Homepage
│   │   ├── styles.css           # Design system v2 "Refined Editorial"
│   │   ├── service-page.css     # Stili pagine servizi e blog
│   │   ├── script.js            # JS: scroll, menu, animazioni
│   │   ├── images/              # Immagini e logo
│   │   ├── blog/                # Blog SEO (8 articoli)
│   │   └── servizi/             # 8 pagine servizi dedicate
│   │
│   ├── caffenapi/               # App prenotazioni (gitignored, repo separato)
│   │   ├── src/
│   │   │   ├── pages/           # 6 pagine React
│   │   │   ├── components/      # Componenti + ~50 shadcn/ui
│   │   │   └── lib/             # Utility
│   │   └── supabase/            # Migrazioni + Edge Functions
│   │
│   ├── execution/               # Script Python (Livello 3)
│   │   ├── utils.py
│   │   ├── generate_service_pages.py
│   │   ├── update_logos.py
│   │   └── update_favicons.py
│   │
│   ├── directives/              # SOP in Markdown (Livello 1)
│   └── requirements.txt
├── PROJECT_STATUS.md            # Questo file
├── DEBUG_REPORT.md              # Report audit con stato di tutti i problemi
├── .env                         # Variabili d'ambiente (placeholder)
├── .gitignore
└── requirements.txt             # Dipendenze Python per execution/
```

---

## 4. Stato Attuale di Ogni Componente

### Sito Vetrina (`frontend/`) — FUNZIONANTE
- **Homepage** (`index.html`): completa con tutte le sezioni
- **8 pagine servizi**: funzionanti con Open Graph, header top bar, footer coerente
- **Design system v2 "Refined Editorial"**: redesign completo in `styles.css`
  - Font Lora (serif) per i titoli h1-h4, Open Sans per body e UI
  - Accento oro caldo (#C4A052) per linee decorative sotto i titoli di sezione
  - Top bar scura (#11344a), header glassmorphism, footer scuro (#1e2329)
  - Label uppercase editoriali sopra i titoli ("Cosa facciamo", "Dove trovarci", ecc.)
  - Transizioni cubic-bezier, dot pattern sottile, hover raffinati
  - Coerenza grafica unificata con la piattaforma prenotazioni
- **JavaScript**: funzionante (scroll, menu, animazioni, counter)
- **Google Analytics 4**: integrato su tutte le pagine
- **Responsive**: breakpoint a 1024px, 768px e 480px
- **Naming**: coerente "Circolo FENAPI" ovunque
- **Orari**: Lun-Gio 9:00-18:00, Ven 9:00-12:00
- **Logo reale**: `logo-fenapi.png` integrato in header (70px) e footer (60px) di tutte le pagine, favicon aggiornata
- **Blog SEO** (`frontend/blog/`): sezione blog attiva con 8 articoli pubblicati
  - Pagina indice con lista articoli
  - Articoli: 730, ISEE, IMU, pensioni, invalidità, successioni, bonus famiglie, dichiarazione dipendenti
  - Schema.org Article structured data su ogni articolo
  - CTA verso prenotazioni.fenapipiemonte.org
  - Link "Blog" aggiunto nella navigazione header di tutte le pagine
  - Loghi e favicon aggiornati su tutti gli articoli
- **Cosa manca**:
  - Immagini hero/servizi probabilmente placeholder
  - Nessun sistema di build/ottimizzazione

### App Prenotazioni (`caffenapi/`) — FUNZIONANTE (Vercel + Supabase)
- **Deploy**: caffenapi.vercel.app
- **Repo git separato**: github.com/edorovetta-png/caffenapi.git (gitignored)
- **Design v2 "Refined Editorial"**: redesign per coerenza con sito vetrina
  - Font Lora (serif) per titoli, Open Sans per body, Shadows Into Light per ribbon
  - Header con top bar scura (#11344a) + header glassmorphism (come sito vetrina)
  - Footer ricco: ribbon con citazione, 4 colonne (logo, contatti, sede, orari), bottom bar
  - Hero scuro con accenti geometrici radiali (oro + azzurro)
  - Service cards raffinate con bordo animato e hover lift
  - Sezioni con label uppercase + titolo serif + linea oro decorativa
- **Prenotazione utente**: dialog multi-step completo
- **Area admin**: login (Supabase Auth) con ProtectedRoute, dashboard, CRUD categorie, gestione operatori
- **Analytics**: pagina dedicata con grafici Recharts
- **Email**: invio conferma sia per prenotazioni utente che admin, con sanitizzazione HTML
- **Google Calendar**: sincronizzazione appuntamenti bidirezionale, con validazione server-side tramite `freeBusy` (previene collisioni in fase di Reschedule o assegnazione 'Indifferente')
- **Database**: 13 migrazioni (incluso unique constraint anti-double-booking)
- **Venerdi**: Michela ha slot fino alle 16:30, altri operatori solo mattina (controllato server-side)
- **Cosa manca**:
  - Test: framework configurato (Vitest) ma copertura da verificare

### Script di Esecuzione (`execution/`) — PARZIALE
- **`utils.py`**: completo e funzionante
- **`generate_service_pages.py`**: funzionante, path relativo, URL Vercel, naming aggiornato
- **`update_logos.py`**: script per aggiornare loghi su tutte le pagine HTML
- **`update_favicons.py`**: script per aggiornare favicon su tutte le pagine HTML
- **Cosa manca**: nessuna direttiva specifica scritta (solo il template vuoto)

---

## 5. Prossimi Step

### Priorita Alta
1. **Immagini reali**: sostituire le immagini placeholder nella hero e nei servizi (logo gia sostituito)

### Priorita Media
3. **Dominio unico**: valutare integrazione sito vetrina + app sotto un unico dominio
4. **Test**: aumentare la copertura test nell'app prenotazioni
5. **SEO avanzato**: brief 001 Foundation applicato (canonical, OG/Twitter, LocalBusiness/Service/BlogPosting/BreadcrumbList schema, security headers via `vercel.json`, CTA canonico `prenotazioni.fenapipiemonte.org`, sitemap/robots su `www.`). **Brief 002 hotfix** applicato su branch `seo/brief-002-hotfix` (in attesa preview Vercel + merge): counter "0 Anni" fallback → "33+", scadenze 730/2026 corrette (verificate su agenziaentrate.gov.it: precompilato 30 aprile 2026, presentazione 30 settembre 2026, conservazione documenti in formulazione safe), NAP footer unificato "Via Sagra di San Michele" su 18 file HTML + Maps URL coerenti + iframe homepage fixato. Logo footer §5 opzione A (no-op, scelta esplicita per evitare overflow mobile). **TODO 7gg**: sostituire OG image temporanea `hero_banner.png` (2048×2048 quadrato, 2.3MB) con asset 1200×630 dedicato. **TODO**: verificare coordinate geo `45.0753, 7.6401` del LocalBusiness schema su Google Maps. Vedi `Caf-Fenapi/SEO-Fenapi/briefs/001-foundation-canonical-og-schema-cta.md` e `002-footer-nap-counter-scadenze.md` per dettagli.

### Priorita Bassa
6. **Build pipeline**: minificazione CSS/JS e ottimizzazione immagini per il sito vetrina
7. **PWA/Accessibilita**: valutare Progressive Web App e audit accessibilita (WCAG)
8. **Direttive**: creare direttive specifiche per i flussi operativi

---

## 6. Tracking Provenienza Prenotazioni (2026-04-07)

Sistema per distinguere da dove arrivano le prenotazioni: **QR esposto in negozio** vs **sito vetrina** (Google → fenapipiemonte.org → CTA) vs **accessi diretti**.

### Componenti

| Layer | File | Cosa fa |
|---|---|---|
| **Asset offline** | `qr-code/qr-prenotazioni-negozio.png` + `README.md` | Nuovo QR statico (PNG 1060×1060) che codifica `https://prenotazioni.fenapipiemonte.org/?utm_source=qr_negozio&utm_medium=offline&utm_campaign=vetrina_torino`. Da stampare e sostituire fisicamente al QR esistente quando comodo. |
| **Sito vetrina** | `frontend/**/*.html` (18 file) | Tutti i CTA che linkano alla piattaforma prenotazioni hanno UTM appesi: `?utm_source=sito&utm_medium=referral&utm_campaign=fenapipiemonte`. |
| **DB** | `caffenapi/supabase/migrations/20260407120000_add_appointment_source_tracking.sql` | Aggiunge ad `appointments` le colonne `utm_source`, `utm_medium`, `utm_campaign`, `referrer`, `landing_path` + indice su `utm_source`. **Da applicare con `supabase db push` o dashboard.** |
| **Frontend hook** | `caffenapi/src/hooks/useUtmTracking.ts` | Hook che al primo atterraggio legge `utm_*` dalla URL + `document.referrer` + `pathname`, salva in `sessionStorage` (first-touch attribution: la prima fonte vince), e li ritorna al componente che lo usa. |
| **Booking dialog** | `caffenapi/src/components/BookingDialog.tsx` | Importa `useUtmTracking` e allega i 5 campi al payload di `create-appointment`. |
| **Edge function** | `caffenapi/supabase/functions/create-appointment/index.ts` | Sanitizza i campi UTM dal body (trim + max length) e li scrive nella riga inserita. |
| **Analytics** | `caffenapi/src/pages/Analytics.tsx` | Nuova card "Provenienza Prenotazioni" con pie chart + legenda con conteggio + percentuale. Etichette: "QR Negozio", "Sito Vetrina", "Diretto / Sconosciuto", + fallback su `referrer` (Google organico, Facebook…). |

### Stato deploy

- [x] Codice scritto
- [x] QR PNG generato
- [x] CTA sito vetrina taggati
- [x] Commit + push `caffenapi` (commit `8599556`, `main`)
- [x] Commit + push Antigravity subset fenapi/ (commit `0253337`, `main`)
- [x] **Migration applicata in produzione** (2026-04-07, Supabase project `oswjgmavxbypnhhinypj`, via `supabase db push`)
- [x] **Edge function `create-appointment` deployata in produzione** (2026-04-07, via `supabase functions deploy`)
- [x] **Frontend caffenapi**: auto-deploy Vercel innescato dal push (`caffenapi.vercel.app`)
- [x] **Sito vetrina**: auto-deploy Vercel innescato dal push (dominio `fenapipiemonte.org` su Aruba DNS)
- [ ] **Sostituzione fisica del QR** in negozio (quando comodo — nessun blocker)
- [ ] **Verifica end-to-end**: prenotazione di prova dall'URL UTM-tagged → conferma in Analytics che `utm_source` venga popolato

### Stato Supabase project — chiarimento finale (2026-04-07)

Dopo investigazione approfondita:

- **In produzione gira `patzvzdxsglsbfqymgtz`** — è un progetto Supabase **provisionato da Lovable** sotto la loro Organization, NON sotto l'account dell'utente. L'utente non ha accesso amministrativo (CLI/dashboard) ma il sistema funziona perché Vercel/frontend usano l'anon key.
- `oswjgmavxbypnhhinypj` è il **progetto Supabase personale dell'utente** (org "edorovetta-png's Org"), creato successivamente, dove sono state applicate le migration UTM. Non è quello che il frontend usa.

**Migrazione completa tentata e poi annullata** lo stesso 2026-04-07: vedi sezione 7.

### Note operative

- `caffenapi/` è repo git separato (`github.com/edorovetta-png/caffenapi`), gitignored qui. Le modifiche al booking dialog, hook, edge function, migration e Analytics sono committate **in quel repo**, non in Antigravity.
- `frontend/`, `qr-code/`, `PROJECT_STATUS.md` invece sono nel repo Antigravity principale (`caf-fenapi-torino`).
- Il **vecchio QR statico continua a funzionare** e va lasciato così finché la migrazione completa non è chiusa. Il nuovo QR (`fenapi/qr-code/qr-prenotazioni-negozio.png`) è pronto ma inutile finché il backend non supporta UTM.
- La migration applicata è puramente additiva (`ADD COLUMN IF NOT EXISTS`): le righe esistenti hanno tutte `utm_source = NULL` e quindi compariranno raggruppate sotto "Diretto / Sconosciuto" nella nuova card Analytics.

---

## 7. Tentativo di migrazione a Supabase personale + ROLLBACK (2026-04-07 pomeriggio)

### Cosa è stato scoperto durante la sessione

Il Supabase `patzvzdxsglsbfqymgtz` su cui gira la produzione è stato **provisionato da Lovable** e sta nell'organizzazione di Lovable, NON in `edorovetta-png's Org`. L'utente non ha accesso amministrativo (CLI, dashboard, secrets) — può solo loggarsi come admin tramite l'app. Implicazione: non può applicare migration, deployare edge function, o gestire secrets su quel project. Era impossibile attivare la pipeline UTM tracking lì.

### Cosa è stato fatto

1. ✅ **Migrazione completa dei dati al Supabase personale `oswjgmavxbypnhhinypj`** via uno script Python (`fenapi/scripts/migrate-data-to-new-supabase.py`):
   - 8 auth users creati con UUID originali (Auth Admin API consente di specificare l'id custom — preserva tutte le foreign key)
   - 22 categories (sostituite le 7 di seed iniziale)
   - 7 profiles, 8 user_roles, 1 master_admins, 36 user_service_assignments
   - 34 appointments (con operator_id già coerente grazie agli UUID preservati)
   - 21 document_uploads (solo metadata; i blob in Storage NON sono stati migrati)
2. ✅ **Frontend ridepoyato** su Vercel con env vars puntate al nuovo Supabase: bundle nuovo `jwr8MCz8.js` con URL `oswjgmavxbypnhhinypj`. Verificato pixel-per-pixel.
3. ✅ **Edge function `create-appointment` deployata** sul nuovo project (durante una sessione precedente con `supabase functions deploy`).

### Cosa è rimasto fuori e ha portato al rollback

Le altre **7 edge function** (`check-availability`, `send-booking-email`, `google-calendar`, `google-drive-upload`, `manage-appointment`, `manage-operators`, `process-email-queue`) **non sono state deployate** sul nuovo project. Senza:
- `check-availability` → flusso prenotazione cliente bloccato (niente slot)
- `manage-operators` → admin gestione operatori rotto
- `google-calendar` / `google-drive-upload` → niente sync con Calendar/Drive degli operatori

In più sono emerse **2 dipendenze esterne pesanti** che bloccano la migrazione completa:

| Dipendenza | Cosa è | Stato |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON credenziali service account Google per leggere/scrivere Calendar e Drive degli 8 operatori | ❌ Non disponibile in locale, l'utente non ha attualmente accesso a Google Cloud Console per rigenerarlo. **Bloccante per la migrazione**. |
| `LOVABLE_API_KEY` + `LOVABLE_SEND_URL` | API proprietaria Lovable usata da `send-booking-email` e `process-email-queue` per inviare le email di conferma | ❌ Non disponibile. Le email di conferma erano comunque non in produzione (problemi precedenti con Aruba), quindi non bloccante in pratica. Va sostituito con un servizio email proprio (es. Resend) quando si farà la migrazione completa. |

### Decisione

L'utente non poteva permettersi di perdere la sync Google Calendar e ha richiesto **rollback al setup di stamane**. Eseguito con successo:

1. ✅ Rollback env vars Vercel (production + development): `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` riportate ai valori di `patzvzdxsglsbfqymgtz`
2. ✅ Redeploy production (`vercel --prod`) → bundle è tornato `iSARw9tA.js` (Vercel ha riusato la build cache, byte-per-byte identico al deploy delle 12:12 di stamane)
3. ✅ `caffenapi/supabase/config.toml` rollback a `project_id = "patzvzdxsglsbfqymgtz"`

### Stato post-rollback

| Componente | Stato |
|---|---|
| Frontend | 🟢 Funziona normalmente, identico a stamane |
| Login admin operatori | 🟢 Password originali, niente da comunicare |
| Google Calendar sync | 🟢 Funzionante (continua a usare il vecchio service account su Lovable) |
| Edge function complete | 🟢 Tutte attive sul vecchio project |
| Tracking UTM frontend | 🟡 Codice presente nel bundle (cattura UTM da URL e li passa al body), ma silenziosamente ignorato dalla edge function vecchia |
| Tracking UTM persistito | 🔴 Niente colonne `utm_source` su `patzvzdxsglsbfqymgtz`, quindi card "Provenienza Prenotazioni" sempre vuota |
| Sostituzione fisica QR negozio | 🔴 Da NON fare per ora — il nuovo QR non darebbe alcun beneficio finché backend non supporta UTM |
| Snapshot dati su `oswjgmavxbypnhhinypj` | 🟢 Intatto, pronto per essere riutilizzato quando si completerà la migrazione |

### Cosa serve per chiudere la migrazione (in futuro, quando l'utente ha tempo + accessi)

1. Recuperare o rigenerare `GOOGLE_SERVICE_ACCOUNT_JSON` (ricondividendo gli 8 calendari operatori col nuovo SA via Calendar.google.com)
2. Decidere servizio email (Resend free tier 100/giorno è la scelta ovvia) e modificare `send-booking-email` + `process-email-queue` per usarlo invece di Lovable API
3. Ri-eseguire la migrazione dati con lo script (è idempotente, non duplica) — eventualmente fare prima un nuovo export per recuperare prenotazioni nuove arrivate nel frattempo
4. Deploy completo edge function: `supabase functions deploy` (senza arg, deploya tutte) sul project linkato
5. Settare secrets edge function: `supabase secrets set GOOGLE_SERVICE_ACCOUNT_JSON=@path/al/file.json FRIDAY_OPERATOR_ID=187e9f13-ae3d-4471-b272-835126bec10a RESEND_API_KEY=...`
6. Migrare i file Storage del bucket `appointment-documents` (script separato che scarica/riupload via service_role)
7. Switchare env vars Vercel + redeploy + verifica
8. Sostituire QR fisico in vetrina

### Sicurezza

- La `service_role key` di `oswjgmavxbypnhhinypj` è apparsa in chat durante la migrazione. **Rigenerarla** dalla dashboard Supabase quando comodo (Settings → API → Reset).
- La `anon key` del nuovo project è apparsa anche lei ma è progettata per essere pubblica, nessun rischio.
