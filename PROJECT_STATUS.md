# PROJECT STATUS — CAF FENAPI Torino

> Ultimo aggiornamento: 2026-03-30
> Questo file serve come contesto condiviso tra Claude e Gemini.

---

## 1. Descrizione del Progetto

Sito web e sistema di prenotazione appuntamenti per il **Circolo FENAPI — Sede Provinciale di Torino** (Centro di Assistenza Fiscale). Il progetto si compone di due applicazioni principali:

- **Sito vetrina** (`frontend/`): sito statico HTML/CSS/JS che presenta i servizi del CAF (730, ISEE, IMU, pensioni, ecc.), con pagine dedicate per ogni servizio.
- **App prenotazioni** (`caffenapi/`): applicazione React (generata con Lovable) per la prenotazione online degli appuntamenti, con dashboard admin, gestione operatori, analytics e integrazione Google Calendar.

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
| Piattaforma | Lovable (deploy e gestione) |

### Backend generico (`backend/`)
| Componente | Tecnologia |
|---|---|
| Framework | FastAPI (Python) |
| Dipendenze | FastAPI, Uvicorn, python-dotenv, Pydantic |

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
├── frontend/                    # Sito vetrina statico
│   ├── index.html               # Homepage (single page con sezioni)
│   ├── styles.css               # Design system completo (CSS custom properties)
│   ├── service-page.css         # Stili condivisi per le pagine servizi
│   ├── script.js                # JS: scroll, menu, animazioni, counter
│   ├── images/                  # Immagini (hero_banner.png, services_image.png)
│   ├── servizi/                 # 8 pagine servizi dedicate
│   │   ├── modello-730.html
│   │   ├── modello-isee.html
│   │   ├── imu-tasi.html
│   │   ├── red.html
│   │   ├── unico-pf.html
│   │   ├── pensioni.html
│   │   ├── invalidita.html
│   │   └── successioni.html
│   └── README.md
│
├── caffenapi/                   # App prenotazioni (React/Lovable) — NON tracciata in git
│   ├── src/
│   │   ├── App.tsx              # Router principale (5 route)
│   │   ├── pages/
│   │   │   ├── Index.tsx        # Homepage prenotazioni (lista servizi + dialog)
│   │   │   ├── AdminLogin.tsx   # Login admin
│   │   │   ├── AdminDashboard.tsx # Dashboard gestione appuntamenti
│   │   │   ├── Analytics.tsx    # Pagina analytics
│   │   │   ├── ManageAppointment.tsx # Gestione singolo appuntamento
│   │   │   └── NotFound.tsx
│   │   ├── components/
│   │   │   ├── BookingDialog.tsx        # Dialog prenotazione (19KB — componente principale)
│   │   │   ├── AdminBookingDialog.tsx   # Dialog admin per modifica prenotazioni
│   │   │   ├── AdminManagement.tsx      # Gestione admin (operatori, ecc.)
│   │   │   ├── AdminDocuments.tsx       # Gestione documenti
│   │   │   ├── CategoryManagement.tsx   # CRUD categorie servizi
│   │   │   ├── DocumentUpload.tsx       # Upload documenti
│   │   │   ├── Header.tsx / Footer.tsx / NavLink.tsx / ServiceCard.tsx
│   │   │   ├── analytics/              # Componenti grafici
│   │   │   └── ui/                     # ~50 componenti shadcn/ui
│   │   ├── hooks/               # Custom hooks
│   │   ├── integrations/supabase/ # Client e tipi Supabase
│   │   └── lib/                 # Utility (servizi, colori)
│   ├── supabase/
│   │   ├── migrations/          # 12 migrazioni SQL
│   │   └── functions/           # 8 Edge Functions
│   │       ├── check-availability
│   │       ├── create-appointment
│   │       ├── google-calendar
│   │       ├── google-drive-upload
│   │       ├── manage-appointment
│   │       ├── manage-operators
│   │       ├── process-email-queue
│   │       └── send-booking-email
│   └── package.json
│
├── backend/                     # API FastAPI (scaffold)
│   ├── main.py                  # 2 endpoint: / e /health
│   └── requirements.txt
│
├── execution/                   # Script Python (Livello 3)
│   ├── utils.py                 # Utility: logger, env, JSON I/O, retry
│   └── generate_service_pages.py # Generatore pagine servizi HTML
│
├── directives/                  # SOP in Markdown (Livello 1)
│   └── template_direttiva.md    # Template vuoto per nuove direttive
│
├── fenapi-group-brand-guidelines.md  # Brand guidelines complete (colori, font, toni)
├── Gemini.md                    # Istruzioni agente (architettura 3 livelli)
├── .env                         # Variabili d'ambiente (chiavi API — vuoto/placeholder)
├── .gitignore
└── requirements.txt             # Dipendenze Python per execution/
```

---

## 4. Stato Attuale di Ogni Componente

### Sito Vetrina (`frontend/`) — FUNZIONANTE
- **Homepage** (`index.html`): completa, con sezioni hero, servizi, chi siamo, contatti, il gruppo
- **8 pagine servizi**: tutte generate e funzionanti, con sidebar, CTA e contenuti specifici
- **Design system**: completo in `styles.css`, basato sulle brand guidelines FENAPI
- **JavaScript**: funzionante — sticky header, mobile menu, scroll-to-top, animazioni fade-in, counter animati
- **Google Analytics 4**: integrato su tutte le pagine
- **Responsive**: layout responsive con breakpoint a 900px e 600px
- **Cosa manca**:
  - Nessun logo reale (usa placeholder "CF" in SVG)
  - Immagini hero/servizi probabilmente placeholder
  - SEO: Open Graph parziale (mancano og:image, og:url)
  - Nessun sistema di build/ottimizzazione (minificazione, compressione immagini)
  - Nessun form di contatto funzionante (i CTA rimandano all'app prenotazioni)

### App Prenotazioni (`caffenapi/`) — FUNZIONANTE (Lovable)
- **Prenotazione utente**: dialog multi-step completo (scelta servizio → data/ora → dati personali → conferma)
- **Verifica disponibilita**: Edge Function `check-availability`
- **Creazione appuntamento**: Edge Function `create-appointment` con conferma email
- **Area admin**: login, dashboard gestione appuntamenti, CRUD categorie, gestione operatori
- **Analytics**: pagina dedicata con grafici Recharts
- **Gestione appuntamento**: pagina per modificare/cancellare un appuntamento esistente
- **Documenti**: upload documenti su Google Drive
- **Email**: sistema di invio email con coda (`process-email-queue`)
- **Google Calendar**: sincronizzazione appuntamenti
- **Database**: 12 migrazioni Supabase (PostgreSQL)
- **Cosa manca**:
  - Non tracciato in git (cartella `caffenapi/` in `??` untracked)
  - Probabilmente gestito separatamente via Lovable
  - Autenticazione admin: da verificare se usa Supabase Auth o sistema custom
  - Test: framework configurato (Vitest) ma copertura da verificare

### Backend FastAPI (`backend/`) — SCAFFOLD
- **Stato**: solo 2 endpoint placeholder (`/` e `/health`)
- **Cosa manca**: nessuna logica di business implementata
- **Nota**: attualmente non utilizzato — la logica backend e in Supabase Edge Functions

### Script di Esecuzione (`execution/`) — PARZIALE
- **`utils.py`**: completo e funzionante (logger, env, JSON I/O, retry decorator)
- **`generate_service_pages.py`**: funzionante, usato per generare le 8 pagine servizi
- **Cosa manca**: nessuna direttiva specifica scritta (solo il template vuoto)

### Brand Guidelines — COMPLETO
- **`fenapi-group-brand-guidelines.md`**: documento completo con palette colori, font, toni, struttura layout
- Correttamente implementato nel CSS del sito vetrina

---

## 5. Prossimi Step

### Priorita Alta
1. **Tracciare `caffenapi/` in git** o decidere se tenerlo come repo separato (attualmente untracked)
2. **Logo reale**: sostituire il placeholder "CF" con il logo ufficiale FENAPI su entrambe le app
3. **Immagini reali**: sostituire le immagini placeholder nella hero e nei servizi

### Priorita Media
4. **SEO**: completare i meta tag Open Graph (og:image, og:url), aggiungere sitemap.xml e robots.txt
5. **Form di contatto**: valutare se aggiungere un form di contatto diretto nel sito vetrina
6. **Collegamento tra le due app**: il sito vetrina rimanda a `caffenapi.vercel.app` per le prenotazioni — valutare se integrare sotto un unico dominio
7. **Direttive**: creare direttive specifiche per i flussi operativi (gestione appuntamenti, onboarding clienti)

### Priorita Bassa
8. **Backend FastAPI**: decidere se svilupparlo (per logica custom) o rimuoverlo (se Supabase basta)
9. **Build pipeline**: aggiungere minificazione CSS/JS e ottimizzazione immagini per il sito vetrina
10. **Test**: aumentare la copertura test nell'app prenotazioni
11. **PWA/Accessibilita**: valutare Progressive Web App e audit accessibilita (WCAG)
