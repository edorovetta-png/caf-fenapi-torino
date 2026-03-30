# PROJECT STATUS — Circolo FENAPI Provincia di Torino

> Ultimo aggiornamento: 2026-03-30 (audit completo + tutti i 28 fix)
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
├── caffenapi/                   # App prenotazioni (gitignored, repo separato)
│   ├── src/
│   │   ├── App.tsx              # Router con ProtectedRoute per admin
│   │   ├── pages/               # 6 pagine (Index, AdminLogin, AdminDashboard, Analytics, ManageAppointment, NotFound)
│   │   ├── components/          # Componenti React (BookingDialog, AdminBookingDialog, ProtectedRoute, ecc.)
│   │   │   └── ui/             # ~50 componenti shadcn/ui
│   │   ├── hooks/               # Custom hooks
│   │   ├── integrations/supabase/ # Client con validazione env + tipi
│   │   └── lib/                 # Utility (servizi, colori)
│   ├── supabase/
│   │   ├── migrations/          # 13 migrazioni SQL (incluso unique constraint)
│   │   └── functions/           # 8 Edge Functions
│   └── package.json
│
├── execution/                   # Script Python (Livello 3)
│   ├── utils.py                 # Utility: logger, env, JSON I/O, retry
│   └── generate_service_pages.py # Generatore pagine servizi HTML
│
├── directives/                  # SOP in Markdown (Livello 1)
│   └── template_direttiva.md    # Template vuoto per nuove direttive
│
├── fenapi-group-brand-guidelines.md  # Brand guidelines complete
├── Gemini.md                    # Istruzioni agente (architettura 3 livelli)
├── CLAUDE.md                    # Contesto per Claude Code
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
- **Design system**: completo in `styles.css`, allineato a brand guidelines
- **JavaScript**: funzionante (scroll, menu, animazioni, counter)
- **Google Analytics 4**: integrato su tutte le pagine
- **Responsive**: breakpoint a 900px e 600px
- **Naming**: coerente "Circolo FENAPI" ovunque
- **Orari**: Lun-Gio 9:00-18:00, Ven 9:00-12:00
- **Cosa manca**:
  - Nessun logo reale (usa placeholder "CF" in SVG)
  - Immagini hero/servizi probabilmente placeholder
  - Nessun sistema di build/ottimizzazione

### App Prenotazioni (`caffenapi/`) — FUNZIONANTE (Vercel + Supabase)
- **Deploy**: caffenapi.vercel.app
- **Repo git separato**: github.com/edorovetta-png/caffenapi.git (gitignored)
- **Brand**: allineato a guidelines (Open Sans, colori #206088/#2c79ac)
- **Prenotazione utente**: dialog multi-step completo
- **Area admin**: login (Supabase Auth) con ProtectedRoute, dashboard, CRUD categorie, gestione operatori
- **Analytics**: pagina dedicata con grafici Recharts
- **Email**: invio conferma sia per prenotazioni utente che admin, con sanitizzazione HTML
- **Google Calendar**: sincronizzazione appuntamenti
- **Database**: 13 migrazioni (incluso unique constraint anti-double-booking)
- **Footer**: con contatti completi (telefono, email, indirizzo, orari)
- **Venerdi**: Michela ha slot fino alle 16:30, altri operatori solo mattina (controllato server-side)
- **Cosa manca**:
  - Test: framework configurato (Vitest) ma copertura da verificare

### Script di Esecuzione (`execution/`) — PARZIALE
- **`utils.py`**: completo e funzionante
- **`generate_service_pages.py`**: funzionante, path relativo, URL Vercel, naming aggiornato
- **Cosa manca**: nessuna direttiva specifica scritta (solo il template vuoto)

---

## 5. Prossimi Step

### Priorita Alta
1. **Logo reale**: sostituire il placeholder "CF" con il logo ufficiale FENAPI su entrambe le app
2. **Immagini reali**: sostituire le immagini placeholder nella hero e nei servizi

### Priorita Media
3. **Dominio unico**: valutare integrazione sito vetrina + app sotto un unico dominio
4. **Test**: aumentare la copertura test nell'app prenotazioni
5. **SEO avanzato**: aggiungere sitemap.xml, robots.txt, og:image

### Priorita Bassa
6. **Build pipeline**: minificazione CSS/JS e ottimizzazione immagini per il sito vetrina
7. **PWA/Accessibilita**: valutare Progressive Web App e audit accessibilita (WCAG)
8. **Direttive**: creare direttive specifiche per i flussi operativi
