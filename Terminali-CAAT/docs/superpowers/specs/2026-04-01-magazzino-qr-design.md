# Magazzino QR — Design Spec

> Data: 2026-04-01
> Stato: Approvato
> Riferimento: `brief-magazzino-qr.md`

## 1. Overview

Web app PWA per gestione magazzino con QR code, composizione ordini multi-operatore e analytics clienti. Uso interno su rete WiFi, multi-device (desktop per gestione, smartphone per scanner QR).

## 2. Stack Tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Routing | React Router v6 (lazy loading pagine pesanti) |
| State/Cache | TanStack Query + Supabase Realtime |
| Backend/DB | Supabase Cloud (PostgreSQL + Auth + RLS + Realtime) |
| QR Generation | `qrcode` (npm) |
| QR Scanner | `html5-qrcode` (npm) |
| Charts | Recharts (lazy loaded) |
| Stampa etichette | CSS @media print, layout 50x25mm Zebra termica |
| PWA | manifest.json per installazione mobile |
| Deploy | Vercel (futuro, per ora sviluppo locale) |

## 3. Autenticazione e Ruoli

Supabase Auth con email/password. Due ruoli gestiti via `profiles.role`:

### Ruoli

- **admin**: CRUD completo su tutto, accesso analytics, gestione utenti
- **operatore**: scanner QR, creazione/modifica ordini propri in bozza, consultazione prodotti e clienti (sola lettura)

### Tabella `profiles`

| Colonna | Tipo | Note |
|---------|------|------|
| id | uuid | PK, FK → auth.users.id |
| role | text | CHECK ('admin', 'operatore'), default 'operatore' |
| display_name | text | NOT NULL |
| created_at | timestamptz | default now() |

Creata automaticamente via trigger `on_auth_user_created`.

### RLS Policies

- `products`: admin CRUD, operatore SELECT (solo `is_active = true`)
- `customers`: admin CRUD, operatore SELECT
- `orders`: admin tutto, operatore SELECT/INSERT/UPDATE solo propri ordini
- `order_items`: permessi ereditati dall'ordine parent via subquery
- `profiles`: ognuno legge il proprio, admin legge tutti

## 4. Schema Database

Identico al brief con queste aggiunte:

### Tabella `profiles` (nuova)

Vedi sezione 3.

### Modifica a `orders`

Aggiunto campo:

| Colonna | Tipo | Note |
|---------|------|------|
| created_by | uuid | FK → profiles.id, NOT NULL — operatore che ha creato l'ordine |

### Tabelle invariate dal brief

- `customers` — ragione sociale, contatti, categoria, note
- `products` — SKU, nome, prezzo, costo, fornitore, categoria, unità, barcode_data, is_active
- `orders` — order_number (serial), customer_id, status (bozza/confermato/evaso/annullato), total_amount, notes
- `order_items` — order_id, product_id, quantity (decimale), unit_price (snapshot), line_total

### Relazioni

```
auth.users 1 ──→ 1 profiles
profiles   1 ──→ N orders (created_by)
customers  1 ──→ N orders
orders     1 ──→ N order_items
products   1 ──→ N order_items
```

### Indici

Identici al brief:
- `idx_orders_customer`, `idx_orders_created`, `idx_orders_status`
- `idx_order_items_product`, `idx_order_items_order`
- `idx_products_sku`, `idx_products_category`

### Trigger

- `update_updated_at()` su customers, products, orders (dal brief)
- `on_auth_user_created` → crea riga in profiles

## 5. Contenuto QR Code

Identico al brief:

```json
{
  "app": "magazzino-qr",
  "sku": "PROD-001",
  "id": "uuid-del-prodotto"
}
```

Validazione: l'app verifica `app === "magazzino-qr"` per ignorare QR estranei.

## 6. Pagine e Ruoli

### Admin — accesso completo

| Pagina | Route | Descrizione |
|--------|-------|-------------|
| Dashboard | `/` | Riepilogo: ordini oggi, bozze, prodotti attivi, clienti. Grafico ordini ultimi 7 giorni |
| Prodotti | `/products` | CRUD prodotti, ricerca, filtro categoria, stampa QR |
| Dettaglio Prodotto | `/products/:id` | Modifica, genera/stampa QR |
| Stampa Etichetta | `/products/:id/label` | Layout 50x25mm, stampa singola o multipla |
| Clienti | `/customers` | CRUD clienti, ricerca |
| Dettaglio Cliente | `/customers/:id` | Anagrafica + storico ordini + statistiche |
| Scanner | `/scan` | Fullscreen mobile, fotocamera posteriore, composizione ordine via QR |
| Nuovo Ordine | `/orders/new` | Selezione cliente, aggiunta prodotti (manuale o da scanner), note, totale |
| Storico Ordini | `/orders` | Lista con filtri (data, cliente, stato), duplica ordine |
| Dettaglio Ordine | `/orders/:id` | Riepilogo, cambio stato, export CSV |
| Analytics | `/analytics` | Fatturato, ticket medio, margine, trend mensile |
| Analytics Cliente | `/analytics/customer/:id` | Top prodotti, categorie, frequenza, trend, alert dormiente |
| Analytics Prodotto | `/analytics/product/:id` | Vendite, top clienti, trend |

### Operatore — accesso ridotto

| Pagina | Route | Descrizione |
|--------|-------|-------------|
| Dashboard | `/` | Versione ridotta: ordini propri oggi, accesso rapido scanner |
| Scanner | `/scan` | Identico ad admin |
| Nuovo Ordine | `/orders/new` | Identico ad admin |
| Ordini | `/orders` | Solo propri ordini |
| Prodotti | `/products` | Sola lettura (nome, prezzo, categoria) |

### Navigazione

- **Admin desktop**: sidebar con tutte le sezioni
- **Admin mobile**: bottom nav completa
- **Operatore mobile**: bottom nav semplificata (Scanner, Ordini, Prodotti readonly)

## 7. Flusso Scanner

1. Apri `/scan` → attiva fotocamera posteriore (`html5-qrcode`)
2. QR riconosciuto → vibrazione (`navigator.vibrate`), mostra nome prodotto + prezzo
3. Campo quantità (default 1, modificabile)
4. "Aggiungi all'ordine corrente":
   - Se nessun ordine aperto → chiede "Crea nuovo ordine?" → selezione cliente → crea bozza
   - Se ordine aperto → aggiunge riga
5. "Scansiona altro" → torna a step 1
6. Quando finito → riepilogo ordine → "Salva bozza" o "Conferma"

Ordine "aperto" = ordine in stato `bozza` dell'operatore corrente nella sessione attiva (salvato in stato locale TanStack Query, non in URL).

## 8. Analytics (solo admin)

### Panoramica (`/analytics`)

- Fatturato totale con filtro periodo (mese/trimestre/anno)
- Numero ordini nel periodo
- Ticket medio
- Margine medio (se `cost_price` compilato)
- Trend mensile fatturato (line chart)

### Per Cliente (`/analytics/customer/:id`)

- Fatturato totale e numero ordini
- Top 10 prodotti acquistati (barre orizzontali)
- Categorie preferite (donut chart)
- Frequenza ordini (media giorni tra ordini)
- Trend spesa mensile (line chart)
- Alert "dormiente" se ultimo ordine > 30 giorni

### Per Prodotto (`/analytics/product/:id`)

- Quantità venduta nel periodo
- Top clienti acquirenti
- Trend vendite mensili

### Cross-Selling

- Coppie prodotti più frequenti nello stesso ordine (tabella top 20)

### Clienti Dormienti

- Soglia configurabile (default 30 giorni)
- Lista con: ultimo ordine, prodotti abituali, valore medio

### Export

- CSV lista clienti filtrata (per prodotto/categoria/spesa/dormienza)
- Colonne: nome, contatto, prodotti abituali, ultima data ordine

## 9. Export CSV Ordini

Nome file: `ordine_{order_number}_{YYYYMMDD}.csv`

Formato:
- Separatore: `;` (standard italiano)
- Encoding: UTF-8 con BOM
- Decimali: `.`
- Prima riga: header

```csv
SKU;Descrizione;Quantita;UnitaMisura;PrezzoUnitario;TotaleRiga;NoteCliente
```

Integrazione Arca esclusa dallo scope attuale.

## 10. Stampa Etichette

- Layout singola etichetta: 50mm × 25mm (Zebra termica)
- Contenuto: QR code (sinistra) + SKU + Nome prodotto (destra)
- CSS `@media print` con `@page { size: 50mm 25mm; margin: 0; }`
- Stampa multipla: selezione N prodotti → foglio con griglia etichette

## 11. PWA

```json
{
  "name": "Magazzino QR",
  "short_name": "MagQR",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1e40af",
  "orientation": "portrait"
}
```

Necessaria per: icona home screen, fullscreen senza barra browser, accesso rapido scanner. HTTPS richiesto per fotocamera (Vercel lo fornisce, in locale `vite --https` o localhost).

## 12. Struttura File

```
src/
├── components/
│   ├── ui/              # shadcn/ui
│   ├── Layout.tsx       # shell con sidebar/bottom nav, routing per ruolo
│   ├── ProtectedRoute.tsx # wrapper auth + controllo ruolo
│   ├── QRCode.tsx
│   ├── QRScanner.tsx
│   ├── LabelPrint.tsx
│   ├── OrderItemRow.tsx
│   └── StatCard.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Customers.tsx
│   ├── CustomerDetail.tsx
│   ├── Scanner.tsx
│   ├── OrderNew.tsx
│   ├── Orders.tsx
│   ├── OrderDetail.tsx
│   └── Analytics.tsx
├── lib/
│   ├── supabase.ts      # client Supabase
│   ├── export.ts         # funzioni export CSV
│   ├── qr.ts             # utilità generazione/parsing QR
│   └── analytics.ts      # query analytics
├── hooks/
│   ├── useAuth.ts        # auth state + ruolo corrente
│   ├── useProducts.ts
│   ├── useOrders.ts
│   ├── useCustomers.ts
│   └── useAnalytics.ts
└── types/
    └── index.ts
```

Aggiunte rispetto al brief: `ProtectedRoute.tsx` e `useAuth.ts` per gestione ruoli.

## 13. Decisioni Escluse dallo Scope

- Integrazione Arca (Fase 4 futura)
- Deploy su Vercel (per ora solo sviluppo locale)
- Supabase Edge Functions (non necessarie)
- App separata per scanner (monolite con lazy loading)
