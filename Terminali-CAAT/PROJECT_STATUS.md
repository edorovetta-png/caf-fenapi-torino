# PROJECT STATUS — Magazzino QR (Terminali CAAT)

> Ultimo aggiornamento: 2026-04-01 (v3 picking flow)
> Questo file serve come contesto condiviso tra Claude e Gemini. Ogni agente DEVE leggerlo prima di iniziare e aggiornarlo dopo ogni modifica significativa.

---

## 1. Descrizione del Progetto

**Magazzino QR** — PWA per gestione magazzino con QR code, composizione ordini multi-operatore, e analytics clienti. Uso interno su rete WiFi, multi-device (desktop gestione + smartphone scanner).

Spec: `docs/superpowers/specs/2026-04-01-magazzino-qr-design.md`
Brief: `brief-magazzino-qr.md` (root workspace)
Piano: `docs/superpowers/plans/2026-04-01-magazzino-qr.md`

---

## 2. Tech Stack

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite 8 |
| UI | Tailwind CSS v4 + shadcn/ui (New York, Zinc) |
| Routing | React Router v7 (lazy loading) |
| State/Cache | TanStack Query v5 |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS) |
| QR | qrcode + html5-qrcode |
| Charts | Recharts |
| Icons | lucide-react |
| Test | Vitest + Testing Library + jsdom |
| Stampa | CSS @media print 50x25mm Zebra |

---

## 3. Struttura Cartelle

```
Terminali-CAAT/
├── PROJECT_STATUS.md
├── brief-magazzino-qr.md
├── .env.example / .env.local (gitignored)
├── package.json, vite.config.ts, tsconfig*.json
├── components.json (shadcn config)
├── index.html (con meta PWA)
├── public/
│   └── manifest.json
├── supabase/migrations/
│   ├── 001_initial_schema.sql
│   └── 002_rls_policies.sql
├── src/
│   ├── main.tsx, App.tsx, index.css
│   ├── types/index.ts
│   ├── lib/ (supabase, qr, export, analytics, utils)
│   ├── hooks/ (useAuth, useProducts, useCustomers, useOrders, useAnalytics, useLots)
│   ├── components/ (Layout, ProtectedRoute, QRCode, QRScanner, LabelPrint, OrderItemRow, StatCard, ui/)
│   └── pages/ (Login, Dashboard, Products, ProductDetail, Customers, CustomerDetail, Scanner, OrderNew, Orders, OrderDetail, Analytics, Inventory)
├── tests/lib/ (qr.test.ts, export.test.ts)
└── docs/superpowers/ (specs/, plans/)
```

---

## 4. Stato Attuale

**Implementazione completa.** Tutti i 16 task del piano eseguiti.

- TypeScript: 0 errori (`npx tsc --noEmit`)
- Test: 8/8 passati (qr + export)
- 16 commit puliti su branch `feat/magazzino-qr`

### Funzionalità implementate

- **Auth**: login email/password, ruoli admin/operatore, RLS su tutte le tabelle
- **Prodotti**: CRUD completo, generazione QR code, stampa etichette 50x25mm Zebra
- **Clienti**: CRUD completo, storico ordini per cliente
- **Ordini**: composizione (manuale + scanner QR), lista con filtri, dettaglio, export CSV
- **Scanner QR**: fotocamera posteriore, parsing QR, aggiunta a ordine, creazione ordine on-the-fly
- **Inventario**: overview stock prodotti con filtri (categoria, stato, ricerca), summary cards, alert lotti in scadenza espandibile
- **Dashboard**: stat cards, grafico ordini settimanali, alert lotti in scadenza e prodotti sotto scorta (admin)
- **Analytics**: trend fatturato, clienti dormienti, cross-selling
- **PWA**: manifest, meta tags iOS/Android

### v3 Picking Flow (2026-04-01)

- **Order statuses**: `draft` -> `picking` -> `confirmed` -> `exported` -> `completed` (+ `annullato`)
- **order_items**: `quantity` rinominato `quantity_ordered`, nuove colonne `quantity_picked`, `vat_rate`, `line_total_vat`, `picked`
- **Nuova tabella**: `picking_scans` (order_id, order_item_id, lot_id, product_id, quantity, scanned_at)
- **Nuova pagina**: `/orders/:id/picking` — checklist prodotti + scanner QR per evasione magazzino
- **Scanner standalone** (`/scan`) ora redirige al flusso picking (non piu usato per composizione ordini)
- **Lot selection rimossa** dalla composizione ordini (lot_id e NULL in bozza, assegnato durante picking)
- TypeScript: 0 errori (`npx tsc --noEmit`)

### Da fare per andare live

1. Eseguire migration SQL v3 (nuove colonne order_items, tabella picking_scans, aggiornamento enum status)
2. Creare progetto Supabase Cloud ed eseguire le migration SQL
3. Configurare .env.local con URL e anon key reali
4. Creare primo utente admin via Supabase dashboard
5. Generare icone PWA (icon-192.png, icon-512.png)
6. (Futuro) Deploy su Vercel
7. (Futuro) Integrazione Arca

---

## 5. Prossimi Step

- Scrivere migration SQL v3 per le nuove colonne e tabella picking_scans
- Setup Supabase Cloud + primo utente admin
- Test end-to-end manuale dell'app con dati reali
- Generare icone PWA
- Deploy Vercel quando pronto
