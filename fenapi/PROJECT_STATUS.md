# PROJECT STATUS — Circolo FENAPI Provincia di Torino

> Ultimo aggiornamento: 2026-04-07 (tracking provenienza prenotazioni: QR negozio vs sito vs diretto)
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
5. **SEO avanzato**: sitemap.xml e robots.txt aggiunti; manca og:image. Blog SEO attivo con primo articolo.

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
- [ ] **Migration da applicare** (`supabase db push` dalla cartella `caffenapi/`)
- [ ] **Deploy edge function** `create-appointment` (Supabase CLI)
- [ ] **Deploy frontend caffenapi** su Vercel (auto al merge nel suo repo separato)
- [ ] **Sostituzione fisica del QR** in negozio (quando comodo)

### Note

- `caffenapi/` è repo git separato (`github.com/edorovetta-png/caffenapi`), gitignored qui. Le modifiche al booking dialog, hook, edge function, migration e Analytics vanno committate **in quel repo**, non in Antigravity.
- `frontend/`, `qr-code/`, `PROJECT_STATUS.md` invece sono nel repo Antigravity principale.
- Il **vecchio QR statico continua a funzionare** finché esiste l'URL nudo: le sue scansioni risultano "Diretto / Sconosciuto" finché non viene sostituito.
