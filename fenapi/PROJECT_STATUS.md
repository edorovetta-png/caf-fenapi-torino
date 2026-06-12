# PROJECT STATUS — Circolo FENAPI Provincia di Torino

> Ultimo aggiornamento: 2026-05-21 (sessione lunga sul booking system. Sez. 7 marcata obsoleta — nuova sez. 8 con stato reale verificato. Produzione gira su `oswjgmavxbypnhhinypj` (Supabase personale), Lovable abbandonato. Tutti i blocker della migrazione (Google SA JSON, Resend, deploy edge function) risolti. Sessione di oggi: fix venerdì pomeriggio in `check-availability` v6, creazione evento GCal server-side in `create-appointment` v10 (così Indifferente atterra sempre in un calendario), colonna "Operatore" in AdminDashboard, relabel "Indifferente"→"Non assegnato" nelle Analytics. Commit unico `caffenapi` `2e2464d` su `main`. 11 appuntamenti 730 Indifferente futuri rassegnati manualmente dall'utente a Erika. **TODO**: assegnare 730 in `user_service_assignments` (oggi nessuno lo ha, causa root del bug 730 "tutti prenotabili"), correggere `config.toml` a `oswjgmavxbypnhhinypj`.)
> Ultimo aggiornamento precedente: 2026-04-15 (banner lingue aggiunto al sito vetrina: strip informativo `🇮🇹 Italiano · 🇪🇸 Hablamos Español · 🇬🇧 We speak English · 🇧🇷 Falamos Português` inserito tra `.header-top` e `.header-main` su tutte le 21 pagine HTML — index, chi-siamo, contatti, 9 servizi, 9 blog. CSS aggiunto in coda a `frontend/styles.css` (`.header-languages` con sfondo crema `#f4f1ea`, hairline oro, testo blu `#1a3a5c`). Responsive: scroll orizzontale single-line su <640px. Solo informativo, nessun selettore lingua. Non ancora committato.)
> Ultimo aggiornamento precedente: 2026-04-14 sera (brief SEO 011+012 applicati insieme e in produzione. Brief 011: caf-torino.html Service con termsOfService+availableLanguage + BreadcrumbList item URL, 8 blog post con publisher BlogPosting espanso inline (Organization+name+logo). Brief 012: rimossi tag deprecati changefreq e priority da 21 URL sitemap.xml, preservati loc+lastmod, payload -40%. 10 file modificati, commit `fd3f5f3`. Verifiche live OK.)
> Ultimo aggiornamento precedente: 2026-04-14 (brief SEO 010 applicato e in produzione: Person image+url completato (index.html+chi-siamo.html), tag `<img>` visibile nella sezione Michela di chi-siamo.html, Service `@id` univoco su tutte 9 le pagine servizio, aggregateRating 4.5/91 aggiunto al LocalBusiness (dati GBP reali). Foto Michela `images/michela-salerno.jpg` creata (400x400 JPG q85, 20KB). Commit `ffcdf66`. Target: rich result eligibility, star rating SERP, entity graph consolidation.)
> Ultimo aggiornamento precedente: 2026-04-13 (brief SEO 009 applicato e in produzione: sameAs LocalBusiness arricchito da 3 a 7 URL (Facebook Torino, PagineGialle, PagineBianche, GuidaMonaci). Nuova city page `/servizi/caf-torino.html` con Service+BreadcrumbList+FAQPage schema, areaServed City Torino, 5 sezioni contenuto unico, mappa embed. Sitemap e llms.txt aggiornati. Internal link da homepage. GBP mancante — da creare manualmente. Commit `afa4ae4`.)
> Ultimo aggiornamento precedente: 2026-04-13 (brief SEO 008 applicato: outbound link .gov.it YMYL su 5 pagine servizio e 8 blog post. 20 nuovi link verso inps.it, agenziaentrate.gov.it, salute.gov.it, comune.torino.it, finanze.gov.it. Tutti con `target="_blank" rel="noopener noreferrer"`, ancore descrittive, posizionamento FENAPI. 14 URL unici verificati 200 OK. Commit `c6afd8e`, branch `seo/brief-008-outbound-gov`, fast-forward merge su `main`, Vercel auto-deploy completato. Nessuna modifica a layout/schema/CSS/sitemap. Target impact: Content/E-E-A-T 66→~74.)
> Ultimo aggiornamento precedente: 2026-04-11 (brief SEO 007 applicato: FAQPage JSON-LD + llms.txt. Target AI Readiness 58→~72, Schema 85→~92.)
> Ultimo aggiornamento precedente: 2026-04-09 (brief SEO 005 **mergiato in main** su branch `seo/brief-005-images`: generata OG image brandizzata `og-fenapi-torino-1200x630.jpg` (75 KB, <200 KB target) via Opzione B — HTML template + Playwright screenshot deterministico; hero convertito in WebP (154 KB) + AVIF (60 KB) con `<picture>` 3-source, `fetchpriority="high"`, `loading="eager"`, `decoding="async"` e preload AVIF+WebP in `<head>` prima del CSS; og:image URL+dimensioni (2048→1200/630) aggiornati su 20 file HTML; LocalBusiness schema image aggiornata; logo alt `"FENAPI"` → `"Logo Circolo FENAPI — Provincia di Torino"` su 20 file; services_image con alt descrittivo + lazy loading. Chiude il TODO 7gg aperto dal brief 001. Atteso LCP: ~4s → ~2s (da verificare con PSI post-deploy). Brief 004 (chi-siamo/contatti standalone) e brief 003 (E-E-A-T YMYL bylines) già mergiati in precedenza.)
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
5. **SEO avanzato**: brief 001 Foundation, 002 hotfix, 003 E-E-A-T YMYL, 004 chi-siamo/contatti e **005 OG image + hero WebP/AVIF + alt audit** tutti applicati e mergiati. Brief 005 ha chiuso il TODO 7gg OG image (nuovo asset `og-fenapi-torino-1200x630.jpg` 75 KB su 20 file HTML, LocalBusiness image aggiornata, hero con `<picture>` AVIF/WebP/PNG + preload + fetchpriority, alt logo descrittivo su 20 file). **TODO aperti**: (1) verificare coordinate geo `45.070756, 7.630822` del LocalBusiness schema su Google Maps; (2) misurare LCP post-deploy con PageSpeed Insights (target ≤2.5s); (3) opzionale: convertire anche `services_image.png` in WebP (sotto la fold, non LCP). Vedi `Caf-Fenapi/SEO-Fenapi/briefs/` per i brief 001-005 completi.

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

> **⚠️ SEZIONE STORICA — OBSOLETA al 2026-05-21.** Il rollback descritto qui sotto è stato successivamente **annullato** in una sessione non documentata fra il 2026-04-07 e il 2026-04-20. Lo stato reale corrente è descritto nella sezione 8 più sotto. Tenuta solo come archivio. Saltare alla sezione 8 per lo stato attuale.

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

---

## 8. Stato reale di produzione (verificato 2026-05-21)

> Sostituisce la sezione 7 obsoleta. Questa è la fotografia operativa attuale.

### Produzione

| Componente | Valore reale |
|---|---|
| Supabase project | **`oswjgmavxbypnhhinypj`** (org `edorovetta-png's Org`) — verificato leggendo il bundle JS di `caffenapi.vercel.app` (`/assets/index-BdZL0Yue.js`) |
| Frontend | `caffenapi.vercel.app` (Vercel auto-deploy dal repo `github.com/edorovetta-png/caffenapi` branch `main`) |
| Edge functions | 8 attive su `oswjgmavxbypnhhinypj`: `create-appointment`, `check-availability`, `google-calendar`, `google-drive-upload`, `send-booking-email`, `process-email-queue`, `manage-appointment`, `manage-operators` |
| Secrets edge function | `GOOGLE_SERVICE_ACCOUNT_JSON`, `RESEND_API_KEY`, `FRIDAY_OPERATOR_ID`, + chiavi interne Supabase — **tutti settati** |
| `patzvzdxsglsbfqymgtz` (Lovable) | **Abbandonato.** Non più usato in produzione. Lovable non sincronizza più nulla. |
| `caffenapi/supabase/config.toml` | Ancora dice `project_id = "patzvzdxsglsbfqymgtz"` ma è ignorato in pratica perché si usa `--project-ref oswjgmavxbypnhhinypj` esplicito. **TODO**: aggiornare il file. |
| Accesso CLI | L'utente ha pieno accesso amministrativo via Supabase CLI: `supabase functions deploy`, `supabase secrets`, `supabase db push` funzionano tutti contro `oswjgmavxbypnhhinypj` |

### Blocker della sez. 7 — tutti risolti

| Ex-blocker | Stato 2026-05-21 |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | ✅ Settato come secret. SA: `caffenapi-booking@fenapi-prenotazioni.iam.gserviceaccount.com`. Accesso confermato ai calendari di Eliane, Erika, Glennys, Leonardo, Michela (diagnostic via temp edge function 2026-04-20) |
| Email service | ✅ Migrato a Resend (`RESEND_API_KEY` settato). `send-booking-email` e `process-email-queue` aggiornate |
| Migrazione dati | ✅ Completata in qualche sessione fra 2026-04-07 e 2026-04-20 |
| Deploy completo edge function | ✅ Tutte e 8 attive |

### Canale di deploy "ufficiale" da qui in poi

- **Frontend**: `git push origin main` sul repo `caffenapi` → Vercel auto-deploy
- **Edge functions**: `supabase functions deploy <name> --project-ref oswjgmavxbypnhhinypj` (richiede `supabase login` con account che ha accesso al progetto — l'utente ce l'ha)
- **Migration DB**: `supabase db push --project-ref oswjgmavxbypnhhinypj`
- **Secrets**: `supabase secrets set NAME=value --project-ref oswjgmavxbypnhhinypj`

### Anomalie note (2026-05-21)

- **Operatori senza `calendar_id`**: `Dott.ssa Daniela Palillo` ha `calendar_id=NULL` → se l'auto-assign Indifferente cade su di lei, la prenotazione non viene messa in nessun calendario. Mitigation: o le si setta un calendar_id, o la si tiene fuori dai servizi con Indifferente.
- **Operatore sospeso con calendar inaccessibile**: `Giorgia Longhi` sospesa (giusto) ma il suo calendario `fenapitorino@gmail.com` risponde 404 al SA — irrilevante finché resta sospesa.
- **Servizi senza operatori**: pericoloso perché l'auto-assign fallisce silenziosamente (operator_id NULL, nessun GCal). `legge-104` aveva il problema, risolto assegnando a Glennys. **`730`** lo aveva fino al 2026-05-21 (nessuno assegnato), risolto durante la sessione di oggi quando l'utente ha distribuito gli appuntamenti Indifferente esistenti su Erika a mano (calendario `fenapicaf2022@gmail.com`).
- **`config.toml` ancora puntato a Lovable**: vedi sopra. Da fixare.

### Fix deployati il 2026-05-21 (sessione corrente)

1. **check-availability v6**: bug venerdì — gli slot pomeridiani per servizi non ammessi (es. 730) e operatori non-Michela il venerdì non erano marcati come occupati. Corretto: `bookedSlots = ALL_SLOTS` invece di `getSlotsForDate(date)` (= `FRIDAY_SLOTS` su venerdì) nei 3 branch di "giornata chiusa" + blocco esplicito pomeriggio per Michela.
2. **create-appointment v10**: creazione evento GCal spostata server-side via fetch interno verso `google-calendar`, così non dipende più dal frontend per la chiamata GCal. Risolve il bug "Indifferente non finisce in nessun calendario" sopravvissuto al fatto che il commit `edeb02f` (2026-03-23) era solo l'aggiunta del campo `assignedOperatorId` nella response.
3. **Frontend BookingDialog**: skip della chiamata GCal lato client se il backend l'ha già creata (controllo `calendarEventId` nella response, backward-compatible).
4. **AdminDashboard**: nuova colonna "Operatore" nella tabella appuntamenti del giorno — mostra `display_name` o "Non assegnato" in italic.
5. **Analytics tables** (`DailyAppointmentsTable`, `CreationDayBookingsTable`): relabel "Indifferente" → "Non assegnato" sui fallback con `operator_id IS NULL`.

Commit unico in `caffenapi` `main`: `2e2464d`. Edge functions deployate via CLI.

### Fix sessione 2026-06-12 (code review: bug evidenti + strutturali) — ✅ DEPLOYATO

Review del codice `caffenapi` su richiesta utente (focus bug/architettura). **In produzione**: commit `caffenapi` `bfac908` (fix) + `51ba24d` (feature contatti) pushati su `main` (Vercel auto-deploy frontend); 3 edge functions deployate via CLI su `oswjgmavxbypnhhinypj` (`create-appointment`, `check-availability`, `manage-appointment`, con `_shared/` caricato come asset). Build+lint+test verdi. **Smoke test produzione OK**: `manage-appointment` `phone:"%"`→400 "Dati non validi"; `create-appointment` weekend→400; `check-availability`→200 con bookedSlots.

Nuovi moduli condivisi: `supabase/functions/_shared/booking-rules.ts` (slot canonici + regole venerdì/gap, unica fonte) e `_shared/google.ts` (auth SA, offset Roma, freeBusy). Eliminano la duplicazione che aveva già prodotto bug.

Bug corretti:
- **A1** — Servizio senza operatori attivi non crea più appuntamenti "nel vuoto": `create-appointment` ritorna 409 esplicito, `check-availability` marca l'intera giornata occupata (prima: inserimento silenzioso con `operator_id=NULL`, nessun GCal).
- **A2** — Fallimento token Google non più silenzioso: helper `getGoogleAccessToken()` logga warning strutturato; `create-appointment` ritorna `calendarCheckSkipped` nella response.
- **A3** — Auto-assign "Indifferente" non sceglie più Michela quando il suo gap 15-min / cap 16:30 la rende non disponibile (prima: 409 spurio anche con altri operatori liberi).
- **A4** — `BookingDialog`/`AdminBookingDialog`: email + evento GCal ora `await` con warning soft (prima fire-and-forget: utente vedeva "confermato" anche se fallivano).
- **S1/S2/S3** — Helper Google/timezone e costanti slot estratti in `_shared/`; rimosso lo slot fantasma `13:30` che era solo in `create-appointment` (ora coerente con frontend `TIME_SLOTS` e `check-availability`).
- **M1** — `manage-appointment`: rifiuto wildcard `%`/`_` in `phone`/`last_name` (prima: `ilike("%")` esponeva/modificava TUTTI gli appuntamenti — buco GDPR). *NB: resta debole il modello "telefono+cognome senza login"; hardening completo via token email rimandato.*
- **M2** — `ProtectedRoute`: aggiunto `onAuthStateChange` (logout/scadenza ora redirige).
- **B1/B2/B3** — filename upload sanificato+indicizzato; dedup lettura env `FRIDAY_OPERATOR_ID`; `email` salvata come `NULL` se vuota.

File toccati: `supabase/functions/{create-appointment,check-availability,manage-appointment}/index.ts`, `_shared/{booking-rules,google}.ts`, `src/components/{BookingDialog,AdminBookingDialog,ProtectedRoute}.tsx`.

**Nuova feature — Vista Contatti + export CSV** (`src/pages/AdminContacts.tsx`, rotta `/admin/contatti`, bottone "Contatti" nell'header dashboard). Elenca i contatti deduplicati per telefono (nome, telefono, email, servizi, n° prenotazioni, ultima data) con filtri ricerca/servizio/intervallo date ed export CSV (separatore `;` + BOM UTF‑8 per Excel IT). Dati **RLS-scoped**: operatore vede solo i suoi servizi, master tutto. Banner GDPR derivato dall'informativa reale (`public/privacy_policy_caf.docx`): contatti usabili per gestione appuntamento, **non** per marketing senza consenso separato (non raccolto dal form), prenotazioni senza pratica max 12 mesi. Solo frontend → deploy via push su repo `caffenapi` (Vercel). Build+lint+test verdi (aggiunto `src/test/booking-rules.test.ts`).

**Consenso marketing — ✅ FATTO e deployato** (commit `caffenapi` `c23e4c4`): checkbox opt-in (deselezionato, separato dall'informativa) nello step form di ogni prenotazione → `create-appointment` scrive `marketing_consent` + `marketing_consent_at`. Colonna DB aggiunta in produzione via `supabase db query --linked` (la migration history ha drift, quindi `db push` evitato; file migration `20260612120000_add_marketing_consent.sql` solo per storia repo). Vista Contatti ora **solo master admin (Michela)**, con colonna "Marketing OK", filtro "solo consenso" ed export del campo nel CSV. Per fare promozioni: filtrare "solo consenso marketing". Testo checkbox: "Sì, voglio ricevere promemoria utili (apertura stagione 730, rinnovo pratiche in scadenza, bonus che potrebbero spettarmi) via email/SMS…".

> ⚠️ Nota drift migration: in `oswjgmavxbypnhhinypj` la history ha disallineamenti (locale `20260413123834` non applicata; remote `20260413120000/120500` assenti in locale). Usare `supabase db query --linked` per DDL puntuale finché non si ripara la history (`supabase migration repair`).

Privacy: l'informativa vincolante è `caffenapi/public/privacy_policy_caf.docx` (Titolare: Fenapi Services Piemonte s.r.l.); il footer linka invece al centro privacy nazionale `fenapigroup.it`. Il checkbox di consenso nel `BookingDialog` compare **solo nello step documenti (730)** e copre l'accettazione dell'informativa, NON un consenso marketing separato.

**TODO deploy**: `supabase functions deploy create-appointment check-availability manage-appointment --project-ref oswjgmavxbypnhhinypj` (le 3 ora dipendono da `_shared/`, che viene incluso automaticamente). Smoke test post-deploy: prenotazione normale, servizio senza operatori (deve dare 409), `manage-appointment` con `phone:"%"` (deve dare 400). `google-calendar` NON è stata toccata (usa scope write, copia helper propria — candidata a futura estrazione).

### TODO aperti

- Aggiornare `caffenapi/supabase/config.toml` a `project_id = "oswjgmavxbypnhhinypj"` per coerenza
- Decidere cosa fare di `Dott.ssa Daniela Palillo` (assegnare calendar_id o limitarne i servizi)
- Rigenerare `service_role key` di `oswjgmavxbypnhhinypj` (sez. 7 — esposta in chat durante la migrazione del 2026-04-07)
- Sostituire fisicamente il QR in vetrina con quello UTM-tagged (`fenapi/qr-code/qr-prenotazioni-negozio.png`), ora che il backend persiste UTM correttamente
