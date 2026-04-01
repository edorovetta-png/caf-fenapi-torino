# PROJECT STATUS — Magazzino QR (Terminali CAAT)

> Ultimo aggiornamento: 2026-04-01 (Task 15)
> Questo file serve come contesto condiviso tra Claude e Gemini. Ogni agente DEVE leggerlo prima di iniziare e aggiornarlo dopo ogni modifica significativa.

---

## 1. Descrizione del Progetto

PWA per gestione magazzino con QR code. Permette di gestire prodotti, clienti, ordini, scansione QR e stampa etichette.

---

## 2. Tech Stack

- **Frontend:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 + shadcn/ui (New York style, Zinc)
- **State/Data:** @tanstack/react-query + Supabase JS client
- **Routing:** react-router-dom v7
- **Charts:** recharts
- **QR:** qrcode + html5-qrcode
- **Icons:** lucide-react
- **Testing:** vitest + @testing-library/react + jsdom

---

## 3. Struttura Cartelle

```
Terminali-CAAT/
├── PROJECT_STATUS.md
├── brief-magazzino-qr.md
├── .env.example             # Template variabili env (versionato)
├── .env.local               # Credenziali Supabase (gitignored via *.local)
├── docs/
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── tailwind.config.ts (via @tailwindcss/vite plugin)
├── postcss.config.js
├── components.json (shadcn/ui config)
├── index.html
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css (Tailwind + shadcn theme)
│   ├── vite-env.d.ts
│   ├── lib/
│   │   ├── utils.ts (cn helper)
│   │   ├── supabase.ts (Supabase client singleton)
│   │   ├── qr.ts (encode/parse/validate QRCodeData)
│   │   └── export.ts (CSV export: order, customers, download)
│   ├── types/index.ts (tutti i tipi entità)
│   └── components/ui/ (shadcn components)
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql  (profiles, customers, products, orders, order_items)
│       └── 002_rls_policies.sql   (RLS + auth.user_role() function)
└── tests/
    ├── setup.ts
    └── lib/
        ├── qr.test.ts (7 tests, all passing)
        └── export.test.ts (1 test, passing)
```

---

## 4. Stato Attuale

- [x] Task 1: Project Scaffolding completato
  - Vite + React + TypeScript inizializzato
  - Tailwind CSS v4 con @tailwindcss/vite plugin configurato
  - shadcn/ui inizializzato con componenti: button, input, label, card, table, select, dialog, dropdown-menu, badge, tabs, separator, sheet, sonner
  - Vitest configurato con jsdom e @testing-library
  - Path alias `@` -> `./src` configurato
  - Dev server e build funzionanti
- [x] Task 2: TypeScript Types completato
  - Creato `src/types/index.ts` con tutti i tipi entità
  - Tipi: UserRole, OrderStatus, Profile, Customer, Product, Order, OrderWithCustomer, OrderItem, OrderItemWithProduct, QRCodeData, CustomerStats, ProductSales, CrossSellPair, DormantCustomer, MonthlyRevenue
  - `npx tsc --noEmit` passa senza errori
- [x] Task 3: Supabase Client + DB Migrations completato
  - Creato `src/lib/supabase.ts` con singleton client (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
  - Creato `.env.example` (versionato) e `.env.local` (gitignored via `*.local`)
  - Creato `supabase/migrations/001_initial_schema.sql`: tabelle profiles, customers, products, orders, order_items + trigger updated_at + handle_new_user
  - Creato `supabase/migrations/002_rls_policies.sql`: RLS abilitato su tutte le tabelle + `auth.user_role()` function + policy admin/operatore
  - `npx tsc --noEmit` passa senza errori

- [x] Task 4: QR Utilities (TDD) completato
  - Creato `tests/lib/qr.test.ts` con 7 test (TDD: scritti prima dell'implementazione)
  - Creato `src/lib/qr.ts` con: `encodeQRData`, `isValidQRData`, `parseQRData`
  - `encodeQRData(sku, id)` → JSON string con `{ app: 'magazzino-qr', sku, id }`
  - `isValidQRData(data)` → type guard per `QRCodeData`
  - `parseQRData(raw)` → `QRCodeData | null` (null per JSON invalido, app errata, campi mancanti)
  - Tutti 7 test passano; `npx tsc --noEmit` senza errori

---

- [x] Task 5: CSV Export Utility (TDD) completato
  - Creato `tests/lib/export.test.ts` con 1 test (TDD: scritto prima dell'implementazione)
  - Creato `src/lib/export.ts` con: `exportOrderToCSV`, `orderCSVFilename`, `downloadCSV`, `exportCustomersToCSV`
  - `exportOrderToCSV(order, items, customer)` → CSV con BOM UTF-8, header semicolon-separated, una riga per item
  - `orderCSVFilename(order)` → `ordine_{number}_{yyyymmdd}.csv`
  - `downloadCSV(content, filename)` → trigger browser download via Blob + anchor
  - `exportCustomersToCSV(customers)` → CSV con BOM, header, una riga per cliente
  - 1 test passa; `npx tsc --noEmit` senza errori

---

---

- [x] Task 13: Dashboard Page completato
  - Creato `src/components/StatCard.tsx`: componente riutilizzabile con titolo, valore, icona (LucideIcon), subtitle opzionale
  - Sostituito `src/pages/Dashboard.tsx` con dashboard completo:
    - Greeting con titolo "Dashboard" + "Ciao, {display_name}"
    - Quick actions: bottoni Scanner (/scan) e Nuovo Ordine (/orders/new)
    - 4 stat cards in grid (ordini oggi, bozze, prodotti attivi, clienti admin-only) — query parallelizzate con Promise.all
    - Bar chart "Ordini ultimi 7 giorni" con Recharts (admin only), giorni in italiano (Lun-Dom)
  - `npx tsc --noEmit` passa senza errori

- [x] Task 15: PWA Configuration completato
  - Creato `public/manifest.json`: configurazione PWA con name, short_name, description, start_url, display standalone, theme/background colors, orientation portrait, icons 192x192 e 512x512
  - Aggiunto 6 meta tag a `index.html` per PWA e iOS:
    - `<link rel="manifest" href="/manifest.json" />`
    - `<meta name="theme-color" content="#1e40af" />`
    - `<meta name="apple-mobile-web-app-capable" content="yes" />`
    - `<meta name="apple-mobile-web-app-status-bar-style" content="default" />`
    - `<meta name="apple-mobile-web-app-title" content="MagQR" />`
    - `<link rel="apple-touch-icon" href="/icon-192.png" />`
  - Committed con: "feat: add PWA manifest and meta tags"

---

## 5. Prossimi Step

- Task 6+: (da definire — scanner, orders, customers pages)
