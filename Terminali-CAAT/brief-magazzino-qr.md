# 📦 Magazzino QR — Brief Tecnico Completo

## 1. Overview del Progetto

**Nome**: Magazzino QR
**Tipo**: Web app PWA (Progressive Web App)
**Uso**: Gestione magazzino con QR code, composizione ordini, analytics clienti
**Utente**: Operatore magazzino singolo, uso interno su rete WiFi
**Device**: Desktop per gestione anagrafica + smartphone per scansione QR

### Stack Tecnologica

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Backend/DB | Supabase (PostgreSQL + Auth + Realtime) |
| QR Generation | Libreria `qrcode` (npm) |
| QR Scanner | Libreria `html5-qrcode` (npm) |
| Charts | Recharts |
| Deploy | Vercel (collegato a GitHub) |
| Stampa etichette | CSS @media print, layout 50x25mm |

---

## 2. Schema Database (Supabase)

### Tabella: `customers`

| Colonna | Tipo | Note |
|---------|------|------|
| id | uuid | PK, auto-generato |
| name | text | NOT NULL — ragione sociale o nome cliente |
| email | text | nullable |
| phone | text | nullable |
| address | text | nullable |
| category | text | nullable — es. "ristorante", "bar", "privato", "rivendita" |
| notes | text | nullable — note libere |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### Tabella: `products`

| Colonna | Tipo | Note |
|---------|------|------|
| id | uuid | PK, auto-generato |
| sku | text | UNIQUE, NOT NULL — codice prodotto interno |
| name | text | NOT NULL |
| description | text | nullable |
| category | text | nullable — es. "bevande", "secchi", "freschi" |
| unit | text | default 'pz' — unità di misura (pz, kg, lt, cartone) |
| price | numeric(10,2) | NOT NULL — prezzo di vendita |
| cost_price | numeric(10,2) | nullable — prezzo di acquisto (per margine) |
| supplier | text | nullable — nome fornitore |
| barcode_data | text | auto-generato — contenuto del QR code |
| is_active | boolean | default true |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### Tabella: `orders`

| Colonna | Tipo | Note |
|---------|------|------|
| id | uuid | PK, auto-generato |
| order_number | serial | auto-incrementale, per riferimento umano |
| customer_id | uuid | FK → customers.id, NOT NULL |
| status | text | default 'bozza' — enum: bozza, confermato, evaso, annullato |
| notes | text | nullable |
| total_amount | numeric(10,2) | calcolato dalla somma degli items |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### Tabella: `order_items`

| Colonna | Tipo | Note |
|---------|------|------|
| id | uuid | PK, auto-generato |
| order_id | uuid | FK → orders.id, ON DELETE CASCADE |
| product_id | uuid | FK → products.id |
| quantity | numeric(10,3) | NOT NULL — decimale per kg/lt |
| unit_price | numeric(10,2) | prezzo al momento dell'ordine (snapshot) |
| line_total | numeric(10,2) | quantity × unit_price |
| created_at | timestamptz | default now() |

### Relazioni

```
customers 1 ──→ N orders
orders    1 ──→ N order_items
products  1 ──→ N order_items
```

### SQL per creare le tabelle

```sql
-- Customers
CREATE TABLE customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  category text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  unit text DEFAULT 'pz',
  price numeric(10,2) NOT NULL,
  cost_price numeric(10,2),
  supplier text,
  barcode_data text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number serial,
  customer_id uuid NOT NULL REFERENCES customers(id),
  status text DEFAULT 'bozza' CHECK (status IN ('bozza', 'confermato', 'evaso', 'annullato')),
  notes text,
  total_amount numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Items
CREATE TABLE order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity numeric(10,3) NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  line_total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes per performance analytics
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 3. Contenuto del QR Code

Ogni QR code contiene un JSON stringificato:

```json
{
  "app": "magazzino-qr",
  "sku": "PROD-001",
  "id": "uuid-del-prodotto"
}
```

Quando il campo `barcode_data` viene generato (al salvataggio di un nuovo prodotto), si fa:

```typescript
const barcodeData = JSON.stringify({
  app: "magazzino-qr",
  sku: product.sku,
  id: product.id
});
```

L'app verifica che `app === "magazzino-qr"` per ignorare QR estranei.

---

## 4. Schermate e Funzionalità

### 4.1 — Dashboard Home

- Riepilogo rapido: ordini oggi, ordini in bozza, prodotti attivi, clienti totali
- Accesso rapido a: Nuovo Ordine, Scanner, Prodotti, Clienti
- Grafico a barre: ordini ultimi 7 giorni

### 4.2 — Anagrafica Prodotti (`/products`)

- Lista prodotti con ricerca e filtro per categoria
- Per ogni prodotto: nome, SKU, prezzo, categoria, fornitore, stato (attivo/disattivo)
- Azioni: Modifica, Stampa QR, Disattiva
- Bottone "Nuovo Prodotto" → form di creazione
- Al salvataggio: auto-genera `barcode_data` e mostra QR code

### 4.3 — Stampa Etichette QR (`/products/:id/label`)

- Layout etichetta singola 50mm × 25mm (standard Zebra/Dymo)
- Contenuto etichetta: QR code (lato sinistro) + SKU + Nome prodotto (lato destro)
- Bottone "Stampa" → apre dialog di stampa del browser con CSS @media print
- Opzione "Stampa multipla" → seleziona N prodotti e stampa foglio di etichette
- Layout multiplo: griglia di etichette su foglio, con margini per stampante termica

**CSS per stampa etichetta singola:**

```css
@media print {
  @page {
    size: 50mm 25mm;
    margin: 0;
  }
  .label {
    width: 50mm;
    height: 25mm;
    display: flex;
    align-items: center;
    padding: 2mm;
    font-family: 'Arial', sans-serif;
  }
  .label-qr {
    width: 21mm;
    height: 21mm;
  }
  .label-text {
    margin-left: 2mm;
    font-size: 8pt;
    line-height: 1.2;
  }
  .label-sku {
    font-weight: bold;
    font-size: 9pt;
  }
}
```

### 4.4 — Scanner QR (`/scan`)

- Schermata fullscreen ottimizzata per mobile
- Usa `html5-qrcode` con fotocamera posteriore
- Al riconoscimento di un QR:
  1. Vibrazione feedback (navigator.vibrate)
  2. Mostra nome prodotto + prezzo
  3. Campo quantità (default 1, modificabile)
  4. Bottoni: "Aggiungi all'ordine corrente" / "Scansiona altro"
- Se nessun ordine è aperto, chiede: "Crea nuovo ordine?" → seleziona cliente

### 4.5 — Composizione Ordine (`/orders/new`)

- Seleziona cliente (dropdown con ricerca)
- Lista prodotti aggiunti (da scanner o ricerca manuale)
- Per ogni riga: prodotto, quantità (modificabile), prezzo, totale riga
- Rimuovi riga con swipe o bottone
- Totale ordine in fondo
- Note libere
- Azioni: "Salva bozza", "Conferma ordine", "Esporta CSV"

### 4.6 — Storico Ordini (`/orders`)

- Lista ordini con filtri: data, cliente, stato
- Per ogni ordine: numero, cliente, data, totale, stato (badge colorato)
- Click → dettaglio ordine con lista prodotti
- Da qui: "Duplica ordine" (utile per ordini ricorrenti), "Esporta CSV"

### 4.7 — Anagrafica Clienti (`/customers`)

- Lista clienti con ricerca
- Per ogni cliente: nome, categoria, telefono, ultimo ordine
- Click → scheda cliente con:
  - Dati anagrafici (modificabili)
  - Storico ordini del cliente
  - Statistiche (vedi sezione Analytics)

### 4.8 — Dashboard Analytics (`/analytics`)

Questa è la sezione strategica per le offerte mirate.

**Panoramica Generale:**
- Fatturato totale (mese/trimestre/anno)
- Numero ordini nel periodo
- Ticket medio (valore medio ordine)
- Margine medio (se `cost_price` è compilato)

**Per Cliente (`/analytics/customer/:id`):**
- Fatturato totale e numero ordini
- Prodotti più acquistati (top 10, grafico a barre orizzontali)
- Categorie preferite (donut chart)
- Frequenza ordini (ogni quanti giorni ordina in media)
- Trend spesa mensile (line chart)
- Ultimo ordine (con alert se > 30 giorni — cliente "dormiente")

**Per Prodotto (`/analytics/product/:id`):**
- Quantità venduta nel periodo
- Clienti che lo acquistano di più
- Trend vendite mensili

**Analisi Cross-Selling:**
- "Chi compra X compra anche Y" — basato su co-occorrenza negli ordini
- Tabella: coppie di prodotti più frequentemente ordinati insieme

**Clienti Dormienti:**
- Lista clienti che non ordinano da più di N giorni (configurabile, default 30)
- Per ognuno: ultimo ordine, prodotti abituali, valore medio

**Export per Offerte:**
- Bottone "Esporta lista clienti" con filtri:
  - Clienti che comprano un certo prodotto/categoria
  - Clienti con spesa sopra/sotto una soglia
  - Clienti dormienti
- Export in CSV con: nome, contatto, prodotti abituali, ultima data ordine

---

## 5. Query SQL per Analytics

Le principali query da implementare come Supabase views o RPC functions:

```sql
-- Top prodotti per cliente
SELECT
  p.name,
  p.sku,
  SUM(oi.quantity) as total_qty,
  SUM(oi.line_total) as total_spent
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.customer_id = $1
  AND o.status IN ('confermato', 'evaso')
GROUP BY p.id, p.name, p.sku
ORDER BY total_spent DESC
LIMIT 10;

-- Frequenza ordini per cliente
SELECT
  customer_id,
  COUNT(*) as total_orders,
  MIN(created_at) as first_order,
  MAX(created_at) as last_order,
  AVG(total_amount) as avg_order_value,
  EXTRACT(DAY FROM (MAX(created_at) - MIN(created_at))) / NULLIF(COUNT(*) - 1, 0) as avg_days_between_orders
FROM orders
WHERE status IN ('confermato', 'evaso')
GROUP BY customer_id;

-- Clienti dormienti (no ordini da 30+ giorni)
SELECT
  c.id,
  c.name,
  c.phone,
  MAX(o.created_at) as last_order_date,
  COUNT(o.id) as total_orders,
  AVG(o.total_amount) as avg_order_value
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status IN ('confermato', 'evaso')
GROUP BY c.id, c.name, c.phone
HAVING MAX(o.created_at) < now() - interval '30 days'
   OR MAX(o.created_at) IS NULL
ORDER BY last_order_date DESC;

-- Cross-selling: coppie prodotti nello stesso ordine
SELECT
  p1.name as product_a,
  p2.name as product_b,
  COUNT(DISTINCT oi1.order_id) as times_together
FROM order_items oi1
JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi1.product_id < oi2.product_id
JOIN products p1 ON p1.id = oi1.product_id
JOIN products p2 ON p2.id = oi2.product_id
JOIN orders o ON o.id = oi1.order_id
WHERE o.status IN ('confermato', 'evaso')
GROUP BY p1.name, p2.name
ORDER BY times_together DESC
LIMIT 20;

-- Trend mensile fatturato
SELECT
  date_trunc('month', o.created_at) as month,
  COUNT(o.id) as num_orders,
  SUM(o.total_amount) as revenue
FROM orders o
WHERE o.status IN ('confermato', 'evaso')
GROUP BY month
ORDER BY month;
```

---

## 6. Export CSV per Arca

### Formato Standard Export Ordine

Nome file: `ordine_{order_number}_{YYYYMMDD}.csv`

```csv
SKU;Descrizione;Quantita;UnitaMisura;PrezzoUnitario;TotaleRiga;NoteCliente
PROD-001;Pasta Barilla 500g;10;pz;1.20;12.00;Mario Rossi
PROD-045;Olio EVO 1lt;5;pz;8.50;42.50;Mario Rossi
```

**Note:**
- Separatore: punto e virgola (`;`) — standard italiano
- Encoding: UTF-8 con BOM (per compatibilità Excel/Arca)
- Decimali: punto (`.`) — verificare con consulente Arca se vuole virgola
- Prima riga: header
- Il consulente Arca dovrà mappare queste colonne ai campi di importazione del gestionale

### Funzione Export (pseudo-codice)

```typescript
function exportOrderToCSV(order: Order, items: OrderItem[], customer: Customer): string {
  const BOM = '\uFEFF';
  const header = 'SKU;Descrizione;Quantita;UnitaMisura;PrezzoUnitario;TotaleRiga;NoteCliente';
  const rows = items.map(item =>
    `${item.product.sku};${item.product.name};${item.quantity};${item.product.unit};${item.unit_price};${item.line_total};${customer.name}`
  );
  return BOM + header + '\n' + rows.join('\n');
}
```

---

## 7. PWA Configuration

### manifest.json

```json
{
  "name": "Magazzino QR",
  "short_name": "MagQR",
  "description": "Gestione magazzino con QR code",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1e40af",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

La PWA è necessaria per:
- Icona sulla home screen del telefono
- Fullscreen senza barra browser
- Accesso rapido allo scanner

**NOTA**: La fotocamera richiede HTTPS. Vercel lo fornisce automaticamente.

---

## 8. Autenticazione

Per un uso interno singolo, basta un'autenticazione semplice:

- Supabase Auth con email/password
- Un solo utente (o pochi)
- Protezione con Row Level Security (RLS) attiva su tutte le tabelle
- Redirect a /login se non autenticato

---

## 9. Struttura File del Progetto

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── Layout.tsx       # shell con sidebar/navbar
│   ├── QRCode.tsx       # generazione QR (wrapper qrcode lib)
│   ├── QRScanner.tsx    # scanner fotocamera (wrapper html5-qrcode)
│   ├── LabelPrint.tsx   # componente etichetta stampabile
│   ├── OrderItemRow.tsx # riga prodotto nell'ordine
│   └── StatCard.tsx     # card statistica per dashboard
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
│   ├── useProducts.ts
│   ├── useOrders.ts
│   ├── useCustomers.ts
│   └── useAnalytics.ts
└── types/
    └── index.ts          # TypeScript types per tutte le entità
```

---

## 10. Note per il Consulente Arca

Domande da fare al consulente:

1. **Formato file importazione**: CSV o XML? Quali colonne/campi richiede?
2. **Separatore decimali**: punto o virgola?
3. **Encoding file**: UTF-8 o ANSI/Windows-1252?
4. **Codice cliente**: Arca ha un codice interno per ogni cliente? Se sì, aggiungiamo un campo `arca_customer_code` alla tabella customers.
5. **Codice articolo**: Lo SKU che usiamo nell'app deve corrispondere al codice articolo in Arca? Se sì, usiamo lo stesso codice.
6. **Percorso importazione**: C'è una cartella "hot folder" dove depositare i file per l'importazione automatica, o si importa manualmente?

---

## 11. Priorità di Sviluppo (Fasi)

### Fase 1 — MVP (Giorno 1-2)
- Setup Supabase + tabelle
- CRUD Prodotti
- Generazione QR code
- Scanner base
- Composizione ordine
- Export CSV semplice

### Fase 2 — Completamento (Giorno 2-3)
- Anagrafica clienti
- Collegamento ordine-cliente
- Storico ordini con filtri
- Stampa etichette ottimizzata
- PWA manifest

### Fase 3 — Analytics (Giorno 3-4)
- Dashboard analytics
- Statistiche per cliente
- Cross-selling analysis
- Clienti dormienti
- Export liste per offerte mirate

### Fase 4 — Integrazione Arca (Dopo feedback consulente)
- Adattamento formato CSV/XML al formato Arca
- Campo codice Arca su clienti e prodotti
- Eventuale invio automatico del file (se hot folder disponibile)
