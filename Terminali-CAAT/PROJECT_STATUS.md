# PROJECT STATUS — Magazzino QR (Terminali CAAT)

> Ultimo aggiornamento: 2026-04-01 (Task 3)
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
│   │   └── supabase.ts (Supabase client singleton)
│   ├── types/index.ts (tutti i tipi entità)
│   └── components/ui/ (shadcn components)
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql  (profiles, customers, products, orders, order_items)
│       └── 002_rls_policies.sql   (RLS + auth.user_role() function)
└── tests/
    └── setup.ts
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

---

## 5. Prossimi Step

- Task 4: QR Utilities (TDD)
- Task 5: CSV Export (TDD)
