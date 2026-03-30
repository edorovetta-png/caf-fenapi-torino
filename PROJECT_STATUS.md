# PROJECT STATUS — CAF FENAPI Torino

> Ultimo aggiornamento: 2026-03-30 (audit + fix batch 1-7)
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
- **Fix applicati (2026-03-30)**:
  - URL prenotazioni aggiornati da caffenapi.lovable.app a caffenapi.vercel.app (tutte le pagine)
  - Bottone CTA "Chiama" nelle pagine servizi: rimosso override colore che lo rendeva invisibile
  - Date ISEE aggiornate da 2022/2024 a 2024/2026
  - Footer pagine servizi allineati tra loro (modello-730 aveva struttura diversa)
  - Aggiunto rel="noopener noreferrer" a tutti i link target="_blank" nei footer servizi
  - Google Maps embed: corretto URL con place ID invalido
  - Footer homepage: URL enti allineati a fenapigroup.it + aggiornati da HTTP a HTTPS
  - Ternario ridondante rimosso da script.js
- **Cosa manca**:
  - Nessun logo reale (usa placeholder "CF" in SVG)
  - Immagini hero/servizi probabilmente placeholder
  - SEO: Open Graph mancante su pagine servizi (og:title, og:description, og:image)
  - Nessun sistema di build/ottimizzazione (minificazione, compressione immagini)
  - Header top bar (telefono/email) assente nelle pagine servizi
  - Footer homepage vs footer servizi hanno struttura diversa (by design, ma da valutare)

### App Prenotazioni (`caffenapi/`) — FUNZIONANTE (Vercel + Supabase)
- **Deploy**: caffenapi.vercel.app (migrato da Lovable)
- **Repo git separato**: github.com/edorovetta-png/caffenapi.git (gitignored dal repo principale)
- **Prenotazione utente**: dialog multi-step completo (scelta servizio → data/ora → dati personali → conferma)
- **Verifica disponibilita**: Edge Function `check-availability`
- **Creazione appuntamento**: Edge Function `create-appointment` con conferma email
- **Area admin**: login (Supabase Auth), dashboard, CRUD categorie, gestione operatori
- **Analytics**: pagina dedicata con grafici Recharts
- **Gestione appuntamento**: pagina per modificare/cancellare un appuntamento esistente
- **Documenti**: upload documenti su Google Drive
- **Email**: sistema di invio email con coda + sanitizzazione HTML input
- **Google Calendar**: sincronizzazione appuntamenti
- **Database**: 12 migrazioni Supabase (PostgreSQL)
- **Fix applicati (2026-03-30)**:
  - Input HTML sanitizzato nelle email (prevenzione injection)
  - UUID operatore venerdi estratto in env var FRIDAY_OPERATOR_ID
  - Collisione React Query key admin-categories risolta (3 key distinte)
  - Non-null assertion rimossa in AdminLogin (null-check esplicito)
  - Validazione weekend aggiunta lato server in create-appointment
- **Cosa ancora aperta**:
  - Race condition: check disponibilita + insert non in transazione (rischio doppia prenotazione)
  - Brand visuale diverso dal sito vetrina (font/colori non allineati alle guidelines)
  - Nessuna info contatto (telefono/email/indirizzo) nell'app
  - Orari venerdi: app non offre slot pomeridiani, sito dice 14-16
  - Route admin senza guard a livello router (componenti montano prima del check auth)
  - Email non inviata per prenotazioni create dall'admin
  - NavLink.tsx mai usato (dead code)
  - Test: framework configurato (Vitest) ma copertura da verificare

### Backend FastAPI (`backend/`) — SCAFFOLD
- **Stato**: solo 2 endpoint placeholder (`/` e `/health`)
- **Cosa manca**: nessuna logica di business implementata
- **Nota**: attualmente non utilizzato — la logica backend e in Supabase Edge Functions

### Script di Esecuzione (`execution/`) — PARZIALE
- **`utils.py`**: completo e funzionante (logger, env, JSON I/O, retry decorator)
- **`generate_service_pages.py`**: funzionante, usato per generare le 8 pagine servizi (path ora relativo, URL aggiornato a Vercel)
- **Cosa manca**: nessuna direttiva specifica scritta (solo il template vuoto)

### Brand Guidelines — COMPLETO
- **`fenapi-group-brand-guidelines.md`**: documento completo con palette colori, font, toni, struttura layout
- Correttamente implementato nel CSS del sito vetrina

---

## 5. Prossimi Step

### Priorita Alta
1. **Brand allineamento caffenapi**: font e colori dell'app prenotazioni non corrispondono alle brand guidelines (usa Plus Jakarta Sans + colori HSL diversi invece di Open Sans + #206088)
2. **Logo reale**: sostituire il placeholder "CF" con il logo ufficiale FENAPI su entrambe le app
3. **Race condition prenotazioni**: wrappare check disponibilita + insert in una transazione DB per prevenire doppie prenotazioni
4. **Orari venerdi**: allineare sito vetrina e app (sito dice 14-16, app non offre slot pomeridiani)

### Priorita Media
5. **SEO**: aggiungere Open Graph meta tags alle pagine servizi, sitemap.xml e robots.txt
6. **Contatti in app**: aggiungere telefono, email e indirizzo nell'app prenotazioni
7. **Auth guard router**: proteggere route admin a livello di router (non solo useEffect nei componenti)
8. **Collegamento tra le due app**: valutare dominio unico
9. **Immagini reali**: sostituire le immagini placeholder nella hero e nei servizi

### Priorita Bassa
10. **Backend FastAPI**: decidere se svilupparlo o rimuoverlo (attualmente non usato)
11. **Build pipeline**: minificazione CSS/JS e ottimizzazione immagini per il sito vetrina
12. **Test**: aumentare la copertura test nell'app prenotazioni
13. **Dead code**: rimuovere NavLink.tsx (mai importato)
14. **PWA/Accessibilita**: valutare Progressive Web App e audit accessibilita (WCAG)
