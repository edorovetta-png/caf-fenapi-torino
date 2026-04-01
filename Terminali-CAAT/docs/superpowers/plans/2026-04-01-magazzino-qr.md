# Magazzino QR — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a PWA for warehouse management with QR scanning, multi-operator order composition, and customer analytics.

**Architecture:** Single Vite React app with Supabase backend (PostgreSQL + Auth + RLS + Realtime). TanStack Query for data fetching/caching, React Router v6 for routing, shadcn/ui for components. Role-based access (admin/operatore) via Supabase RLS policies.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Supabase, TanStack Query, React Router v6, qrcode, html5-qrcode, Recharts, Vitest

**Spec:** `docs/superpowers/specs/2026-04-01-magazzino-qr-design.md`
**Brief:** `brief-magazzino-qr.md` (root workspace)

---

## File Structure

```
Terminali-CAAT/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── components.json                # shadcn/ui config
├── public/
│   ├── manifest.json
│   ├── icon-192.png
│   └── icon-512.png
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_rls_policies.sql
├── src/
│   ├── main.tsx                   # entry point, providers
│   ├── App.tsx                    # router setup
│   ├── index.css                  # tailwind imports + print styles
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── index.ts               # all entity types + enums
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client singleton
│   │   ├── qr.ts                  # QR encode/decode/validate
│   │   ├── export.ts              # CSV export functions
│   │   └── utils.ts               # cn() helper from shadcn
│   ├── hooks/
│   │   ├── useAuth.ts             # auth state, role, login/logout
│   │   ├── useProducts.ts         # products CRUD queries
│   │   ├── useCustomers.ts        # customers CRUD queries
│   │   ├── useOrders.ts           # orders + items queries
│   │   └── useAnalytics.ts        # analytics queries
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives (button, input, etc.)
│   │   ├── Layout.tsx             # app shell: sidebar (desktop) + bottom nav (mobile)
│   │   ├── ProtectedRoute.tsx     # auth gate + role check
│   │   ├── QRCode.tsx             # renders QR code as SVG/canvas
│   │   ├── QRScanner.tsx          # camera scanner wrapper
│   │   ├── LabelPrint.tsx         # printable label 50x25mm
│   │   ├── OrderItemRow.tsx       # editable row in order composition
│   │   └── StatCard.tsx           # stat card for dashboards
│   └── pages/
│       ├── Login.tsx
│       ├── Dashboard.tsx
│       ├── Products.tsx
│       ├── ProductDetail.tsx
│       ├── Customers.tsx
│       ├── CustomerDetail.tsx
│       ├── Scanner.tsx
│       ├── OrderNew.tsx
│       ├── Orders.tsx
│       ├── OrderDetail.tsx
│       └── Analytics.tsx
├── tests/
│   ├── setup.ts                   # vitest setup
│   ├── lib/
│   │   ├── qr.test.ts
│   │   └── export.test.ts
│   └── hooks/
│       ├── useAuth.test.ts
│       └── useOrders.test.ts
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`, `src/lib/utils.ts`, `components.json`

- [ ] **Step 1: Initialize Vite project**

```bash
cd /Users/edoardorovetta/Desktop/Antigravity/Terminali-CAAT
npm create vite@latest . -- --template react-ts
```

Select: React, TypeScript when prompted. If the directory is not empty, confirm overwrite.

- [ ] **Step 2: Install core dependencies**

```bash
npm install @supabase/supabase-js @tanstack/react-query react-router-dom recharts qrcode html5-qrcode
npm install -D @types/qrcode
```

- [ ] **Step 3: Install Tailwind CSS + shadcn/ui**

```bash
npm install -D tailwindcss @tailwindcss/vite
```

Replace `src/index.css` with:

```css
@import "tailwindcss";
```

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Update `tsconfig.app.json` to add path alias:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsBuildInfoFile",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Select: New York style, Zinc color, CSS variables: yes. This creates `components.json` and `src/lib/utils.ts`.

- [ ] **Step 5: Add shadcn/ui components needed for the project**

```bash
npx shadcn@latest add button input label card table select dialog dropdown-menu badge tabs separator sheet toast sonner
```

- [ ] **Step 6: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Add to `vite.config.ts` (update the existing config):

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
})
```

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server starts on localhost, default React page renders.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript + Tailwind + shadcn/ui project"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Define all entity types**

```typescript
// src/types/index.ts

export type UserRole = 'admin' | 'operatore'

export type OrderStatus = 'bozza' | 'confermato' | 'evaso' | 'annullato'

export interface Profile {
  id: string
  role: UserRole
  display_name: string
  created_at: string
}

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  category: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  category: string | null
  unit: string
  price: number
  cost_price: number | null
  supplier: string | null
  barcode_data: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: number
  customer_id: string
  created_by: string
  status: OrderStatus
  notes: string | null
  total_amount: number
  created_at: string
  updated_at: string
}

export interface OrderWithCustomer extends Order {
  customer: Customer
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  line_total: number
  created_at: string
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product
}

export interface QRCodeData {
  app: 'magazzino-qr'
  sku: string
  id: string
}

// Analytics types
export interface CustomerStats {
  customer_id: string
  total_orders: number
  first_order: string | null
  last_order: string | null
  avg_order_value: number
  avg_days_between_orders: number | null
}

export interface ProductSales {
  name: string
  sku: string
  total_qty: number
  total_spent: number
}

export interface CrossSellPair {
  product_a: string
  product_b: string
  times_together: number
}

export interface DormantCustomer {
  id: string
  name: string
  phone: string | null
  last_order_date: string | null
  total_orders: number
  avg_order_value: number
}

export interface MonthlyRevenue {
  month: string
  num_orders: number
  revenue: number
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions for all entities"
```

---

## Task 3: Supabase Client + Database Migrations

**Files:**
- Create: `src/lib/supabase.ts`, `supabase/migrations/001_initial_schema.sql`, `supabase/migrations/002_rls_policies.sql`, `.env.local`

- [ ] **Step 1: Create Supabase client**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 2: Create .env.local placeholder**

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Add `.env.local` to `.gitignore` if not already there. Create `.env.example` with the same keys but empty values.

- [ ] **Step 3: Write initial schema migration**

```sql
-- supabase/migrations/001_initial_schema.sql

-- Profiles (linked to auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'operatore' CHECK (role IN ('admin', 'operatore')),
  display_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'operatore')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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
  created_by uuid NOT NULL REFERENCES profiles(id),
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

-- Indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_by ON orders(created_by);
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

- [ ] **Step 4: Write RLS policies migration**

```sql
-- supabase/migrations/002_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (auth.user_role() = 'admin');

CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (auth.user_role() = 'admin');

-- PRODUCTS
CREATE POLICY "Anyone authenticated can read active products"
  ON products FOR SELECT
  USING (is_active = true OR auth.user_role() = 'admin');

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.user_role() = 'admin');

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (auth.user_role() = 'admin');

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (auth.user_role() = 'admin');

-- CUSTOMERS
CREATE POLICY "Anyone authenticated can read customers"
  ON customers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert customers"
  ON customers FOR INSERT
  WITH CHECK (auth.user_role() = 'admin');

CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE
  USING (auth.user_role() = 'admin');

CREATE POLICY "Admins can delete customers"
  ON customers FOR DELETE
  USING (auth.user_role() = 'admin');

-- ORDERS
CREATE POLICY "Admins can do anything with orders"
  ON orders FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "Operators can read own orders"
  ON orders FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Operators can create orders"
  ON orders FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Operators can update own draft orders"
  ON orders FOR UPDATE
  USING (created_by = auth.uid() AND status = 'bozza');

-- ORDER ITEMS
CREATE POLICY "Admins can do anything with order items"
  ON order_items FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "Operators can read items of own orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.created_by = auth.uid()
    )
  );

CREATE POLICY "Operators can insert items into own draft orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.created_by = auth.uid()
      AND orders.status = 'bozza'
    )
  );

CREATE POLICY "Operators can update items in own draft orders"
  ON order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.created_by = auth.uid()
      AND orders.status = 'bozza'
    )
  );

CREATE POLICY "Operators can delete items from own draft orders"
  ON order_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.created_by = auth.uid()
      AND orders.status = 'bozza'
    )
  );
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase.ts supabase/ .env.example
git commit -m "feat: add Supabase client and database migration SQL"
```

---

## Task 4: QR Utility Functions (TDD)

**Files:**
- Create: `src/lib/qr.ts`, `tests/lib/qr.test.ts`

- [ ] **Step 1: Write failing tests for QR utilities**

```typescript
// tests/lib/qr.test.ts
import { describe, it, expect } from 'vitest'
import { encodeQRData, parseQRData, isValidQRData } from '@/lib/qr'

describe('encodeQRData', () => {
  it('encodes product data to JSON string', () => {
    const result = encodeQRData('PROD-001', '550e8400-e29b-41d4-a716-446655440000')
    const parsed = JSON.parse(result)
    expect(parsed).toEqual({
      app: 'magazzino-qr',
      sku: 'PROD-001',
      id: '550e8400-e29b-41d4-a716-446655440000',
    })
  })
})

describe('parseQRData', () => {
  it('parses valid QR JSON string', () => {
    const input = JSON.stringify({
      app: 'magazzino-qr',
      sku: 'PROD-001',
      id: '550e8400-e29b-41d4-a716-446655440000',
    })
    const result = parseQRData(input)
    expect(result).toEqual({
      app: 'magazzino-qr',
      sku: 'PROD-001',
      id: '550e8400-e29b-41d4-a716-446655440000',
    })
  })

  it('returns null for invalid JSON', () => {
    expect(parseQRData('not-json')).toBeNull()
  })

  it('returns null for wrong app identifier', () => {
    const input = JSON.stringify({ app: 'other-app', sku: 'X', id: 'Y' })
    expect(parseQRData(input)).toBeNull()
  })

  it('returns null for missing fields', () => {
    const input = JSON.stringify({ app: 'magazzino-qr' })
    expect(parseQRData(input)).toBeNull()
  })
})

describe('isValidQRData', () => {
  it('returns true for valid data', () => {
    expect(isValidQRData({ app: 'magazzino-qr', sku: 'X', id: 'Y' })).toBe(true)
  })

  it('returns false for wrong app', () => {
    expect(isValidQRData({ app: 'other', sku: 'X', id: 'Y' })).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/lib/qr.test.ts
```

Expected: FAIL — module `@/lib/qr` not found.

- [ ] **Step 3: Implement QR utilities**

```typescript
// src/lib/qr.ts
import type { QRCodeData } from '@/types'

export function encodeQRData(sku: string, id: string): string {
  return JSON.stringify({
    app: 'magazzino-qr' as const,
    sku,
    id,
  })
}

export function isValidQRData(data: unknown): data is QRCodeData {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    obj.app === 'magazzino-qr' &&
    typeof obj.sku === 'string' &&
    typeof obj.id === 'string'
  )
}

export function parseQRData(raw: string): QRCodeData | null {
  try {
    const parsed = JSON.parse(raw)
    return isValidQRData(parsed) ? parsed : null
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/lib/qr.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/qr.ts tests/lib/qr.test.ts
git commit -m "feat: add QR code encode/parse/validate utilities with tests"
```

---

## Task 5: CSV Export Utility (TDD)

**Files:**
- Create: `src/lib/export.ts`, `tests/lib/export.test.ts`

- [ ] **Step 1: Write failing tests for CSV export**

```typescript
// tests/lib/export.test.ts
import { describe, it, expect } from 'vitest'
import { exportOrderToCSV, downloadCSV } from '@/lib/export'
import type { Order, OrderItemWithProduct, Customer } from '@/types'

const mockCustomer: Customer = {
  id: '1', name: 'Mario Rossi', email: null, phone: null,
  address: null, category: null, notes: null,
  created_at: '', updated_at: '',
}

const mockOrder: Order = {
  id: '1', order_number: 42, customer_id: '1', created_by: '1',
  status: 'confermato', notes: null, total_amount: 54.50,
  created_at: '2026-04-01T10:00:00Z', updated_at: '2026-04-01T10:00:00Z',
}

const mockItems: OrderItemWithProduct[] = [
  {
    id: '1', order_id: '1', product_id: '1', quantity: 10,
    unit_price: 1.20, line_total: 12.00, created_at: '',
    product: {
      id: '1', sku: 'PROD-001', name: 'Pasta Barilla 500g',
      description: null, category: 'secchi', unit: 'pz',
      price: 1.20, cost_price: null, supplier: null,
      barcode_data: null, is_active: true, created_at: '', updated_at: '',
    },
  },
  {
    id: '2', order_id: '1', product_id: '2', quantity: 5,
    unit_price: 8.50, line_total: 42.50, created_at: '',
    product: {
      id: '2', sku: 'PROD-045', name: 'Olio EVO 1lt',
      description: null, category: 'condimenti', unit: 'pz',
      price: 8.50, cost_price: null, supplier: null,
      barcode_data: null, is_active: true, created_at: '', updated_at: '',
    },
  },
]

describe('exportOrderToCSV', () => {
  it('generates CSV with BOM, header, and semicolon separator', () => {
    const csv = exportOrderToCSV(mockOrder, mockItems, mockCustomer)

    expect(csv.startsWith('\uFEFF')).toBe(true)

    const lines = csv.replace('\uFEFF', '').split('\n')
    expect(lines[0]).toBe('SKU;Descrizione;Quantita;UnitaMisura;PrezzoUnitario;TotaleRiga;NoteCliente')
    expect(lines[1]).toBe('PROD-001;Pasta Barilla 500g;10;pz;1.20;12.00;Mario Rossi')
    expect(lines[2]).toBe('PROD-045;Olio EVO 1lt;5;pz;8.50;42.50;Mario Rossi')
    expect(lines.length).toBe(3)
  })

  it('formats filename correctly', () => {
    const filename = `ordine_${mockOrder.order_number}_20260401.csv`
    expect(filename).toBe('ordine_42_20260401.csv')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/lib/export.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement CSV export**

```typescript
// src/lib/export.ts
import type { Order, OrderItemWithProduct, Customer } from '@/types'

const BOM = '\uFEFF'
const HEADER = 'SKU;Descrizione;Quantita;UnitaMisura;PrezzoUnitario;TotaleRiga;NoteCliente'

export function exportOrderToCSV(
  order: Order,
  items: OrderItemWithProduct[],
  customer: Customer,
): string {
  const rows = items.map((item) =>
    [
      item.product.sku,
      item.product.name,
      item.quantity,
      item.product.unit,
      item.unit_price.toFixed(2),
      item.line_total.toFixed(2),
      customer.name,
    ].join(';'),
  )
  return BOM + HEADER + '\n' + rows.join('\n')
}

export function orderCSVFilename(order: Order): string {
  const date = new Date(order.created_at)
  const ymd =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0')
  return `ordine_${order.order_number}_${ymd}.csv`
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportCustomersToCSV(
  customers: Array<{
    name: string
    phone: string | null
    email: string | null
    top_products: string
    last_order_date: string | null
  }>,
): string {
  const header = 'Nome;Telefono;Email;ProdottiAbituali;UltimoOrdine'
  const rows = customers.map((c) =>
    [
      c.name,
      c.phone ?? '',
      c.email ?? '',
      c.top_products,
      c.last_order_date ?? 'mai',
    ].join(';'),
  )
  return BOM + header + '\n' + rows.join('\n')
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/lib/export.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/export.ts tests/lib/export.test.ts
git commit -m "feat: add CSV export utilities with tests"
```

---

## Task 6: Auth Hook + Login Page

**Files:**
- Create: `src/hooks/useAuth.ts`, `src/pages/Login.tsx`

- [ ] **Step 1: Implement useAuth hook**

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types'

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    profile: null,
    loading: true,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id).then((profile) =>
          setState({ session, profile, loading: false }),
        )
      } else {
        setState({ session: null, profile: null, loading: false })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          const profile = await fetchProfile(session.user.id)
          setState({ session, profile, loading: false })
        } else {
          setState({ session: null, profile: null, loading: false })
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const isAdmin = state.profile?.role === 'admin'
  const role: UserRole | null = state.profile?.role ?? null

  return { ...state, login, logout, isAdmin, role }
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}
```

- [ ] **Step 2: Create Login page**

```tsx
// src/pages/Login.tsx
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore di accesso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Magazzino QR</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Accesso...' : 'Accedi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAuth.ts src/pages/Login.tsx
git commit -m "feat: add auth hook and login page"
```

---

## Task 7: Layout + Protected Routes + Router

**Files:**
- Create: `src/components/ProtectedRoute.tsx`, `src/components/Layout.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`

- [ ] **Step 1: Create ProtectedRoute component**

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'

interface Props {
  children: React.ReactNode
  requiredRole?: UserRole
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
```

- [ ] **Step 2: Create Layout component**

```tsx
// src/components/Layout.tsx
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  ScanLine,
  BarChart3,
  LogOut,
} from 'lucide-react'

const adminLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scan', label: 'Scanner', icon: ScanLine },
  { to: '/orders', label: 'Ordini', icon: ShoppingCart },
  { to: '/products', label: 'Prodotti', icon: Package },
  { to: '/customers', label: 'Clienti', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

const operatorLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scan', label: 'Scanner', icon: ScanLine },
  { to: '/orders', label: 'Ordini', icon: ShoppingCart },
  { to: '/products', label: 'Prodotti', icon: Package },
]

export default function Layout() {
  const { isAdmin, profile, logout } = useAuth()
  const location = useLocation()
  const links = isAdmin ? adminLinks : operatorLinks

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col border-r bg-white">
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg">Magazzino QR</h1>
          <p className="text-xs text-muted-foreground">{profile?.display_name}</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const active = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-2 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Esci
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">
        {links.map((link) => {
          const Icon = link.icon
          const active = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
```

- [ ] **Step 3: Install lucide-react for icons**

```bash
npm install lucide-react
```

- [ ] **Step 4: Update App.tsx with router**

```tsx
// src/App.tsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Login from '@/pages/Login'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Products = lazy(() => import('@/pages/Products'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail'))
const Customers = lazy(() => import('@/pages/Customers'))
const CustomerDetail = lazy(() => import('@/pages/CustomerDetail'))
const Scanner = lazy(() => import('@/pages/Scanner'))
const OrderNew = lazy(() => import('@/pages/OrderNew'))
const Orders = lazy(() => import('@/pages/Orders'))
const OrderDetail = lazy(() => import('@/pages/OrderDetail'))
const Analytics = lazy(() => import('@/pages/Analytics'))

function Loading() {
  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-muted-foreground">Caricamento...</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="scan" element={<Scanner />} />
            <Route path="orders/new" element={<OrderNew />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route
              path="analytics"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Analytics />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: Update main.tsx with providers**

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
)
```

- [ ] **Step 6: Create placeholder pages (so the router works)**

Create each page file with a minimal placeholder. Each will be fleshed out in subsequent tasks:

```tsx
// src/pages/Dashboard.tsx
export default function Dashboard() {
  return <div className="p-6"><h2 className="text-2xl font-bold">Dashboard</h2></div>
}
```

Repeat for: `Products.tsx`, `ProductDetail.tsx`, `Customers.tsx`, `CustomerDetail.tsx`, `Scanner.tsx`, `OrderNew.tsx`, `Orders.tsx`, `OrderDetail.tsx`, `Analytics.tsx` — each with the same structure, changing the title.

- [ ] **Step 7: Verify app compiles and renders**

```bash
npm run dev
```

Expected: App starts, shows login page on `/login`, redirects to login if unauthenticated.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add layout, protected routes, router with lazy loading"
```

---

## Task 8: Products CRUD Hook + Products Page

**Files:**
- Create: `src/hooks/useProducts.ts`, replace placeholder `src/pages/Products.tsx`

- [ ] **Step 1: Implement useProducts hook**

```typescript
// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { encodeQRData } from '@/lib/qr'
import type { Product } from '@/types'

export function useProducts(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('name')

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Product[]
    },
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Product
    },
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'barcode_data' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()
      if (error) throw error

      // Generate barcode_data with the new product's id
      const barcode_data = encodeQRData(data.sku, data.id)
      const { data: updated, error: updateError } = await supabase
        .from('products')
        .update({ barcode_data })
        .eq('id', data.id)
        .select()
        .single()
      if (updateError) throw updateError
      return updated as Product
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Product
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', data.id] })
    },
  })
}
```

- [ ] **Step 2: Implement Products list page**

```tsx
// src/pages/Products.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProducts, useCreateProduct } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'

const CATEGORIES = ['bevande', 'secchi', 'freschi', 'surgelati', 'condimenti', 'altro']
const UNITS = ['pz', 'kg', 'lt', 'cartone']

export default function Products() {
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const { data: products, isLoading } = useProducts({
    search: search || undefined,
    category: categoryFilter || undefined,
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const createProduct = useCreateProduct()

  const [form, setForm] = useState({
    sku: '', name: '', description: '', category: '',
    unit: 'pz', price: '', cost_price: '', supplier: '',
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createProduct.mutateAsync({
        sku: form.sku,
        name: form.name,
        description: form.description || null,
        category: form.category || null,
        unit: form.unit,
        price: parseFloat(form.price),
        cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
        supplier: form.supplier || null,
        is_active: true,
      })
      toast.success('Prodotto creato')
      setDialogOpen(false)
      setForm({ sku: '', name: '', description: '', category: '', unit: 'pz', price: '', cost_price: '', supplier: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore')
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Prodotti</h2>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nuovo Prodotto</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nuovo Prodotto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>SKU *</Label>
                    <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Nome *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Descrizione</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Categoria</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Unità</Label>
                    <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Prezzo vendita *</Label>
                    <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Prezzo acquisto</Label>
                    <Input type="number" step="0.01" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Fornitore</Label>
                  <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" disabled={createProduct.isPending}>
                  {createProduct.isPending ? 'Salvataggio...' : 'Crea Prodotto'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tutte</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Caricamento...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">SKU</th>
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Categoria</th>
                <th className="text-right p-3 font-medium">Prezzo</th>
                <th className="text-center p-3 font-medium hidden sm:table-cell">Stato</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">
                    <Link to={`/products/${p.id}`} className="text-primary hover:underline">{p.sku}</Link>
                  </td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 hidden sm:table-cell">{p.category ?? '—'}</td>
                  <td className="p-3 text-right">€{p.price.toFixed(2)}</td>
                  <td className="p-3 text-center hidden sm:table-cell">
                    <Badge variant={p.is_active ? 'default' : 'secondary'}>
                      {p.is_active ? 'Attivo' : 'Disattivo'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {products?.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nessun prodotto trovato</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useProducts.ts src/pages/Products.tsx
git commit -m "feat: add products CRUD hook and products list page"
```

---

## Task 9: Product Detail + QR Code + Label Print

**Files:**
- Create: `src/components/QRCode.tsx`, `src/components/LabelPrint.tsx`
- Replace: `src/pages/ProductDetail.tsx`
- Modify: `src/index.css` (add print styles)

- [ ] **Step 1: Create QRCode component**

```tsx
// src/components/QRCode.tsx
import { useEffect, useRef } from 'react'
import QRCodeLib from 'qrcode'

interface Props {
  data: string
  size?: number
}

export default function QRCode({ data, size = 128 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 1,
        errorCorrectionLevel: 'M',
      })
    }
  }, [data, size])

  return <canvas ref={canvasRef} />
}
```

- [ ] **Step 2: Create LabelPrint component**

```tsx
// src/components/LabelPrint.tsx
import QRCode from './QRCode'
import type { Product } from '@/types'

interface Props {
  product: Product
}

export default function LabelPrint({ product }: Props) {
  if (!product.barcode_data) return null

  return (
    <div className="label">
      <div className="label-qr">
        <QRCode data={product.barcode_data} size={80} />
      </div>
      <div className="label-text">
        <div className="label-sku">{product.sku}</div>
        <div>{product.name}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add print styles to index.css**

Append to `src/index.css`:

```css
@media print {
  @page {
    size: 50mm 25mm;
    margin: 0;
  }

  body * {
    visibility: hidden;
  }

  .print-area,
  .print-area * {
    visibility: visible;
  }

  .print-area {
    position: absolute;
    left: 0;
    top: 0;
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
    flex-shrink: 0;
  }

  .label-qr canvas {
    width: 21mm !important;
    height: 21mm !important;
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

- [ ] **Step 4: Implement ProductDetail page**

```tsx
// src/pages/ProductDetail.tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProduct, useUpdateProduct } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import QRCode from '@/components/QRCode'
import LabelPrint from '@/components/LabelPrint'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Printer } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { data: product, isLoading } = useProduct(id)
  const updateProduct = useUpdateProduct()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  if (isLoading) return <div className="p-6 text-muted-foreground">Caricamento...</div>
  if (!product) return <div className="p-6">Prodotto non trovato</div>

  function startEditing() {
    setForm({
      name: product!.name,
      sku: product!.sku,
      description: product!.description ?? '',
      category: product!.category ?? '',
      unit: product!.unit,
      price: product!.price.toString(),
      cost_price: product!.cost_price?.toString() ?? '',
      supplier: product!.supplier ?? '',
    })
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateProduct.mutateAsync({
        id: product!.id,
        name: form.name,
        sku: form.sku,
        description: form.description || null,
        category: form.category || null,
        unit: form.unit,
        price: parseFloat(form.price),
        cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
        supplier: form.supplier || null,
      })
      toast.success('Prodotto aggiornato')
      setEditing(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore')
    }
  }

  async function toggleActive() {
    await updateProduct.mutateAsync({ id: product!.id, is_active: !product!.is_active })
    toast.success(product!.is_active ? 'Prodotto disattivato' : 'Prodotto riattivato')
  }

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/products')}>
        <ArrowLeft className="h-4 w-4 mr-2" />Prodotti
      </Button>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Modifica Prodotto' : product.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>SKU</Label>
                    <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Nome</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Descrizione</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Prezzo vendita</Label>
                    <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Prezzo acquisto</Label>
                    <Input type="number" step="0.01" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={updateProduct.isPending}>Salva</Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>Annulla</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">SKU:</span> {product.sku}</div>
                <div><span className="font-medium">Categoria:</span> {product.category ?? '—'}</div>
                <div><span className="font-medium">Unità:</span> {product.unit}</div>
                <div><span className="font-medium">Prezzo:</span> €{product.price.toFixed(2)}</div>
                {product.cost_price && <div><span className="font-medium">Costo:</span> €{product.cost_price.toFixed(2)}</div>}
                {product.supplier && <div><span className="font-medium">Fornitore:</span> {product.supplier}</div>}
                {product.description && <div><span className="font-medium">Descrizione:</span> {product.description}</div>}
                {isAdmin && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={startEditing}>Modifica</Button>
                    <Button variant={product.is_active ? 'destructive' : 'outline'} onClick={toggleActive}>
                      {product.is_active ? 'Disattiva' : 'Riattiva'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {product.barcode_data && (
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <QRCode data={product.barcode_data} size={200} />
              <Button onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />Stampa Etichetta
              </Button>
              <div className="print-area">
                <LabelPrint product={product} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/QRCode.tsx src/components/LabelPrint.tsx src/pages/ProductDetail.tsx src/index.css
git commit -m "feat: add product detail page with QR code generation and label printing"
```

---

## Task 10: Customers CRUD Hook + Pages

**Files:**
- Create: `src/hooks/useCustomers.ts`
- Replace: `src/pages/Customers.tsx`, `src/pages/CustomerDetail.tsx`

- [ ] **Step 1: Implement useCustomers hook**

```typescript
// src/hooks/useCustomers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Customer } from '@/types'

export function useCustomers(search?: string) {
  return useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      let query = supabase.from('customers').select('*').order('name')
      if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
      }
      const { data, error } = await query
      if (error) throw error
      return data as Customer[]
    },
  })
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Customer
    },
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single()
      if (error) throw error
      return data as Customer
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Customer> & { id: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Customer
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customers', data.id] })
    },
  })
}
```

- [ ] **Step 2: Implement Customers list page**

```tsx
// src/pages/Customers.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCustomers, useCreateCustomer } from '@/hooks/useCustomers'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'

const CUSTOMER_CATEGORIES = ['ristorante', 'bar', 'privato', 'rivendita', 'altro']

export default function Customers() {
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const { data: customers, isLoading } = useCustomers(search || undefined)
  const [dialogOpen, setDialogOpen] = useState(false)
  const createCustomer = useCreateCustomer()

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', category: '', notes: '',
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createCustomer.mutateAsync({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        category: form.category || null,
        notes: form.notes || null,
      })
      toast.success('Cliente creato')
      setDialogOpen(false)
      setForm({ name: '', email: '', phone: '', address: '', category: '', notes: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore')
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clienti</h2>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nuovo Cliente</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Nuovo Cliente</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1">
                  <Label>Nome / Ragione sociale *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Telefono</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Indirizzo</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Categoria</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                    <SelectContent>
                      {CUSTOMER_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Note</Label>
                  <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" disabled={createCustomer.isPending}>
                  {createCustomer.isPending ? 'Salvataggio...' : 'Crea Cliente'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cerca per nome o telefono..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Caricamento...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Categoria</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Telefono</th>
              </tr>
            </thead>
            <tbody>
              {customers?.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <Link to={`/customers/${c.id}`} className="text-primary hover:underline">{c.name}</Link>
                  </td>
                  <td className="p-3 hidden sm:table-cell">{c.category ?? '—'}</td>
                  <td className="p-3 hidden sm:table-cell">{c.phone ?? '—'}</td>
                </tr>
              ))}
              {customers?.length === 0 && (
                <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Nessun cliente trovato</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Implement CustomerDetail page**

```tsx
// src/pages/CustomerDetail.tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCustomer, useUpdateCustomer } from '@/hooks/useCustomers'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import type { OrderWithCustomer } from '@/types'

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { data: customer, isLoading } = useCustomer(id)
  const updateCustomer = useUpdateCustomer()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const { data: orders } = useQuery({
    queryKey: ['orders', 'customer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', id!)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data as OrderWithCustomer[]
    },
    enabled: !!id,
  })

  if (isLoading) return <div className="p-6 text-muted-foreground">Caricamento...</div>
  if (!customer) return <div className="p-6">Cliente non trovato</div>

  function startEditing() {
    setForm({
      name: customer!.name,
      email: customer!.email ?? '',
      phone: customer!.phone ?? '',
      address: customer!.address ?? '',
      category: customer!.category ?? '',
      notes: customer!.notes ?? '',
    })
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateCustomer.mutateAsync({
        id: customer!.id,
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        category: form.category || null,
        notes: form.notes || null,
      })
      toast.success('Cliente aggiornato')
      setEditing(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/customers')}>
        <ArrowLeft className="h-4 w-4 mr-2" />Clienti
      </Button>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{editing ? 'Modifica Cliente' : customer.name}</CardTitle></CardHeader>
          <CardContent>
            {editing ? (
              <form onSubmit={handleSave} className="space-y-3">
                <div className="space-y-1"><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Telefono</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                </div>
                <div className="space-y-1"><Label>Indirizzo</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="space-y-1"><Label>Note</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={updateCustomer.isPending}>Salva</Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>Annulla</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Categoria:</span> {customer.category ?? '—'}</div>
                <div><span className="font-medium">Email:</span> {customer.email ?? '—'}</div>
                <div><span className="font-medium">Telefono:</span> {customer.phone ?? '—'}</div>
                <div><span className="font-medium">Indirizzo:</span> {customer.address ?? '—'}</div>
                {customer.notes && <div><span className="font-medium">Note:</span> {customer.notes}</div>}
                {isAdmin && (
                  <div className="pt-4">
                    <Button onClick={startEditing}>Modifica</Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ultimi Ordini</CardTitle></CardHeader>
          <CardContent>
            {orders?.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nessun ordine</p>
            ) : (
              <div className="space-y-2">
                {orders?.map((o) => (
                  <div
                    key={o.id}
                    className="flex justify-between items-center p-2 border rounded cursor-pointer hover:bg-muted/30"
                    onClick={() => navigate(`/orders/${o.id}`)}
                  >
                    <div>
                      <span className="font-mono text-xs">#{o.order_number}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    <span className="font-medium">€{o.total_amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCustomers.ts src/pages/Customers.tsx src/pages/CustomerDetail.tsx
git commit -m "feat: add customers CRUD hook and customer pages"
```

---

## Task 11: Orders Hook + Order Composition + Order List

**Files:**
- Create: `src/hooks/useOrders.ts`, `src/components/OrderItemRow.tsx`
- Replace: `src/pages/OrderNew.tsx`, `src/pages/Orders.tsx`, `src/pages/OrderDetail.tsx`

- [ ] **Step 1: Implement useOrders hook**

```typescript
// src/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Order, OrderWithCustomer, OrderItem, OrderItemWithProduct } from '@/types'

interface OrderFilters {
  status?: string
  customer_id?: string
  from?: string
  to?: string
}

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*, customer:customers(*)')
        .order('created_at', { ascending: false })

      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.customer_id) query = query.eq('customer_id', filters.customer_id)
      if (filters?.from) query = query.gte('created_at', filters.from)
      if (filters?.to) query = query.lte('created_at', filters.to)

      const { data, error } = await query
      if (error) throw error
      return data as OrderWithCustomer[]
    },
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:customers(*)')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as OrderWithCustomer
    },
    enabled: !!id,
  })
}

export function useOrderItems(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order_items', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, product:products(*)')
        .eq('order_id', orderId!)
      if (error) throw error
      return data as OrderItemWithProduct[]
    },
    enabled: !!orderId,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (order: { customer_id: string; created_by: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .insert({ ...order, status: 'bozza' })
        .select()
        .single()
      if (error) throw error
      return data as Order
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useAddOrderItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (item: { order_id: string; product_id: string; quantity: number; unit_price: number }) => {
      const line_total = item.quantity * item.unit_price
      const { data, error } = await supabase
        .from('order_items')
        .insert({ ...item, line_total })
        .select('*, product:products(*)')
        .single()
      if (error) throw error

      // Recalculate order total
      await recalculateOrderTotal(item.order_id)
      return data as OrderItemWithProduct
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['order_items', data.order_id] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useUpdateOrderItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, order_id, quantity, unit_price }: { id: string; order_id: string; quantity: number; unit_price: number }) => {
      const line_total = quantity * unit_price
      const { error } = await supabase
        .from('order_items')
        .update({ quantity, unit_price, line_total })
        .eq('id', id)
      if (error) throw error
      await recalculateOrderTotal(order_id)
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['order_items', vars.order_id] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useDeleteOrderItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, order_id }: { id: string; order_id: string }) => {
      const { error } = await supabase.from('order_items').delete().eq('id', id)
      if (error) throw error
      await recalculateOrderTotal(order_id)
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['order_items', vars.order_id] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updates: Record<string, unknown> = { status }
      if (notes !== undefined) updates.notes = notes
      const { error } = await supabase.from('orders').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

async function recalculateOrderTotal(orderId: string) {
  const { data: items } = await supabase
    .from('order_items')
    .select('line_total')
    .eq('order_id', orderId)
  const total = (items ?? []).reduce((sum, i) => sum + Number(i.line_total), 0)
  await supabase.from('orders').update({ total_amount: total }).eq('id', orderId)
}
```

- [ ] **Step 2: Create OrderItemRow component**

```tsx
// src/components/OrderItemRow.tsx
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { OrderItemWithProduct } from '@/types'

interface Props {
  item: OrderItemWithProduct
  editable: boolean
  onUpdate: (quantity: number) => void
  onDelete: () => void
}

export default function OrderItemRow({ item, editable, onUpdate, onDelete }: Props) {
  const [qty, setQty] = useState(item.quantity.toString())

  function handleBlur() {
    const n = parseFloat(qty)
    if (!isNaN(n) && n > 0 && n !== item.quantity) {
      onUpdate(n)
    } else {
      setQty(item.quantity.toString())
    }
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b text-sm">
      <div className="flex-1">
        <div className="font-medium">{item.product.name}</div>
        <div className="text-xs text-muted-foreground">{item.product.sku} · €{item.unit_price.toFixed(2)}/{item.product.unit}</div>
      </div>
      <div className="w-20">
        {editable ? (
          <Input
            type="number"
            step="0.001"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onBlur={handleBlur}
            className="h-8 text-center"
          />
        ) : (
          <span className="text-center block">{item.quantity}</span>
        )}
      </div>
      <div className="w-20 text-right font-medium">€{item.line_total.toFixed(2)}</div>
      {editable && (
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Implement OrderNew page**

```tsx
// src/pages/OrderNew.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useCustomers } from '@/hooks/useCustomers'
import { useProducts } from '@/hooks/useProducts'
import { useCreateOrder, useAddOrderItem, useOrderItems, useUpdateOrderStatus } from '@/hooks/useOrders'
import OrderItemRow from '@/components/OrderItemRow'
import { useUpdateOrderItem, useDeleteOrderItem } from '@/hooks/useOrders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'

export default function OrderNew() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { data: customers } = useCustomers()
  const [customerId, setCustomerId] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const { data: products } = useProducts({ search: productSearch || undefined })
  const { data: items } = useOrderItems(orderId ?? undefined)

  const createOrder = useCreateOrder()
  const addItem = useAddOrderItem()
  const updateItem = useUpdateOrderItem()
  const deleteItem = useDeleteOrderItem()
  const updateStatus = useUpdateOrderStatus()

  async function handleCreateOrder() {
    if (!customerId || !session) return
    try {
      const order = await createOrder.mutateAsync({
        customer_id: customerId,
        created_by: session.user.id,
        notes: notes || undefined,
      })
      setOrderId(order.id)
      toast.success(`Ordine #${order.order_number} creato come bozza`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore')
    }
  }

  async function handleAddProduct(productId: string, price: number) {
    if (!orderId) return
    await addItem.mutateAsync({
      order_id: orderId,
      product_id: productId,
      quantity: 1,
      unit_price: price,
    })
    setProductSearch('')
  }

  async function handleConfirm() {
    if (!orderId) return
    await updateStatus.mutateAsync({ id: orderId, status: 'confermato', notes })
    toast.success('Ordine confermato')
    navigate(`/orders/${orderId}`)
  }

  const total = items?.reduce((s, i) => s + i.line_total, 0) ?? 0

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Nuovo Ordine</h2>

      {!orderId ? (
        <Card>
          <CardHeader><CardTitle>Seleziona Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Cliente *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Seleziona cliente" /></SelectTrigger>
                <SelectContent>
                  {customers?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Note</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button onClick={handleCreateOrder} disabled={!customerId || createOrder.isPending}>
              Crea Bozza Ordine
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Aggiungi Prodotti</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca prodotto..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {productSearch && products?.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sku} · €{p.price.toFixed(2)}/{p.unit}</div>
                  </div>
                  <Button size="sm" onClick={() => handleAddProduct(p.id, p.price)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Riepilogo Ordine</CardTitle></CardHeader>
            <CardContent>
              {items?.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nessun prodotto aggiunto</p>
              ) : (
                <>
                  {items?.map((item) => (
                    <OrderItemRow
                      key={item.id}
                      item={item}
                      editable
                      onUpdate={(qty) => updateItem.mutate({ id: item.id, order_id: orderId!, quantity: qty, unit_price: item.unit_price })}
                      onDelete={() => deleteItem.mutate({ id: item.id, order_id: orderId! })}
                    />
                  ))}
                  <div className="flex justify-between items-center pt-4 text-lg font-bold">
                    <span>Totale</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => { toast.success('Bozza salvata'); navigate('/orders') }}>
                  Salva Bozza
                </Button>
                <Button variant="default" onClick={handleConfirm} disabled={!items?.length}>
                  Conferma Ordine
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Implement Orders list page**

```tsx
// src/pages/Orders.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '@/hooks/useOrders'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  bozza: 'secondary',
  confermato: 'default',
  evaso: 'outline',
  annullato: 'destructive',
}

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const { data: orders, isLoading } = useOrders({
    status: statusFilter || undefined,
    from: dateFrom || undefined,
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ordini</h2>
        <Link to="/orders/new">
          <Button><Plus className="h-4 w-4 mr-2" />Nuovo Ordine</Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Stato" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tutti</SelectItem>
            <SelectItem value="bozza">Bozza</SelectItem>
            <SelectItem value="confermato">Confermato</SelectItem>
            <SelectItem value="evaso">Evaso</SelectItem>
            <SelectItem value="annullato">Annullato</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-44" />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Caricamento...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">#</th>
                <th className="text-left p-3 font-medium">Cliente</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Data</th>
                <th className="text-right p-3 font-medium">Totale</th>
                <th className="text-center p-3 font-medium">Stato</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((o) => (
                <tr key={o.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">
                    <Link to={`/orders/${o.id}`} className="text-primary hover:underline">#{o.order_number}</Link>
                  </td>
                  <td className="p-3">{o.customer?.name ?? '—'}</td>
                  <td className="p-3 hidden sm:table-cell text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString('it-IT')}
                  </td>
                  <td className="p-3 text-right font-medium">€{o.total_amount.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <Badge variant={STATUS_COLORS[o.status] ?? 'secondary'}>{o.status}</Badge>
                  </td>
                </tr>
              ))}
              {orders?.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nessun ordine trovato</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Implement OrderDetail page**

```tsx
// src/pages/OrderDetail.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useOrder, useOrderItems, useUpdateOrderStatus } from '@/hooks/useOrders'
import { useAuth } from '@/hooks/useAuth'
import { exportOrderToCSV, orderCSVFilename, downloadCSV } from '@/lib/export'
import OrderItemRow from '@/components/OrderItemRow'
import { useUpdateOrderItem, useDeleteOrderItem } from '@/hooks/useOrders'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Download, Copy } from 'lucide-react'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { data: order } = useOrder(id)
  const { data: items } = useOrderItems(id)
  const updateStatus = useUpdateOrderStatus()
  const updateItem = useUpdateOrderItem()
  const deleteItem = useDeleteOrderItem()

  if (!order) return <div className="p-6 text-muted-foreground">Caricamento...</div>

  const editable = order.status === 'bozza'

  function handleExportCSV() {
    if (!order || !items) return
    const csv = exportOrderToCSV(order, items, order.customer)
    downloadCSV(csv, orderCSVFilename(order))
    toast.success('CSV scaricato')
  }

  async function handleDuplicate() {
    toast.info('Duplicazione ordine — vai a Nuovo Ordine e riaggiungi i prodotti')
    navigate('/orders/new')
  }

  async function changeStatus(status: string) {
    await updateStatus.mutateAsync({ id: order!.id, status })
    toast.success(`Ordine ${status}`)
  }

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/orders')}>
        <ArrowLeft className="h-4 w-4 mr-2" />Ordini
      </Button>

      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">Ordine #{order.order_number}</h2>
        <Badge>{order.status}</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Dettagli</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="font-medium">Cliente:</span> {order.customer?.name}</div>
            <div><span className="font-medium">Data:</span> {new Date(order.created_at).toLocaleString('it-IT')}</div>
            {order.notes && <div><span className="font-medium">Note:</span> {order.notes}</div>}
            <div className="flex gap-2 pt-4 flex-wrap">
              {editable && isAdmin && (
                <Button onClick={() => changeStatus('confermato')}>Conferma</Button>
              )}
              {order.status === 'confermato' && isAdmin && (
                <Button onClick={() => changeStatus('evaso')}>Segna come evaso</Button>
              )}
              {editable && (
                <Button variant="destructive" onClick={() => changeStatus('annullato')}>Annulla</Button>
              )}
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />CSV
              </Button>
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />Duplica
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Prodotti</CardTitle></CardHeader>
          <CardContent>
            {items?.map((item) => (
              <OrderItemRow
                key={item.id}
                item={item}
                editable={editable}
                onUpdate={(qty) => updateItem.mutate({ id: item.id, order_id: order.id, quantity: qty, unit_price: item.unit_price })}
                onDelete={() => deleteItem.mutate({ id: item.id, order_id: order.id })}
              />
            ))}
            <div className="flex justify-between items-center pt-4 text-lg font-bold">
              <span>Totale</span>
              <span>€{order.total_amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useOrders.ts src/components/OrderItemRow.tsx src/pages/OrderNew.tsx src/pages/Orders.tsx src/pages/OrderDetail.tsx
git commit -m "feat: add orders hook, order composition, order list and detail pages"
```

---

## Task 12: QR Scanner Page

**Files:**
- Create: `src/components/QRScanner.tsx`
- Replace: `src/pages/Scanner.tsx`

- [ ] **Step 1: Create QRScanner wrapper component**

```tsx
// src/components/QRScanner.tsx
import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onScan: (data: string) => void
  active: boolean
}

export default function QRScanner({ onScan, active }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const scanner = new Html5Qrcode(containerRef.current.id)
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        if (navigator.vibrate) navigator.vibrate(100)
        onScan(decodedText)
      },
      () => {},
    ).catch(console.error)

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [active, onScan])

  return (
    <div
      id="qr-scanner"
      ref={containerRef}
      className="w-full max-w-sm mx-auto rounded-lg overflow-hidden"
    />
  )
}
```

- [ ] **Step 2: Implement Scanner page**

```tsx
// src/pages/Scanner.tsx
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseQRData } from '@/lib/qr'
import { useAuth } from '@/hooks/useAuth'
import { useProduct } from '@/hooks/useProducts'
import { useCustomers } from '@/hooks/useCustomers'
import { useCreateOrder, useAddOrderItem } from '@/hooks/useOrders'
import QRScanner from '@/components/QRScanner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

type ScanState =
  | { step: 'scanning' }
  | { step: 'scanned'; productId: string }
  | { step: 'select-customer' }

export default function Scanner() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { data: customers } = useCustomers()
  const createOrder = useCreateOrder()
  const addItem = useAddOrderItem()

  const [state, setState] = useState<ScanState>({ step: 'scanning' })
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [scannedProductId, setScannedProductId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [customerId, setCustomerId] = useState('')
  const [itemCount, setItemCount] = useState(0)

  const { data: scannedProduct } = useProduct(scannedProductId ?? undefined)

  const handleScan = useCallback((raw: string) => {
    const qr = parseQRData(raw)
    if (!qr) {
      toast.error('QR code non riconosciuto')
      return
    }
    setScannedProductId(qr.id)
    setQuantity('1')
    setState({ step: 'scanned', productId: qr.id })
  }, [])

  async function handleAddToOrder() {
    if (!scannedProduct || !session) return

    let orderId = currentOrderId

    if (!orderId) {
      if (!customerId) {
        setState({ step: 'select-customer' })
        return
      }
      const order = await createOrder.mutateAsync({
        customer_id: customerId,
        created_by: session.user.id,
      })
      orderId = order.id
      setCurrentOrderId(orderId)
      toast.success(`Ordine #${order.order_number} creato`)
    }

    await addItem.mutateAsync({
      order_id: orderId,
      product_id: scannedProduct.id,
      quantity: parseFloat(quantity) || 1,
      unit_price: scannedProduct.price,
    })

    setItemCount((c) => c + 1)
    toast.success(`${scannedProduct.name} aggiunto`)
    setState({ step: 'scanning' })
    setScannedProductId(null)
  }

  async function handleCustomerSelected() {
    if (!customerId) return
    setState({ step: 'scanned', productId: scannedProductId! })
    await handleAddToOrder()
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Scanner QR</h2>
        {currentOrderId && (
          <Button size="sm" onClick={() => navigate(`/orders/${currentOrderId}`)}>
            Vedi ordine ({itemCount} prod.)
          </Button>
        )}
      </div>

      {state.step === 'scanning' && (
        <QRScanner onScan={handleScan} active />
      )}

      {state.step === 'scanned' && scannedProduct && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <div className="text-lg font-bold">{scannedProduct.name}</div>
              <div className="text-sm text-muted-foreground">{scannedProduct.sku} · €{scannedProduct.price.toFixed(2)}/{scannedProduct.unit}</div>
            </div>
            <div className="space-y-1">
              <Label>Quantità</Label>
              <Input
                type="number"
                step="0.001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="text-center text-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleAddToOrder}>
                Aggiungi all'ordine
              </Button>
              <Button variant="outline" onClick={() => { setState({ step: 'scanning' }); setScannedProductId(null) }}>
                Scansiona altro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {state.step === 'select-customer' && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="font-medium">Nessun ordine aperto. Seleziona un cliente per crearne uno.</p>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder="Seleziona cliente" /></SelectTrigger>
              <SelectContent>
                {customers?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCustomerSelected} disabled={!customerId}>
              Crea ordine e aggiungi prodotto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/QRScanner.tsx src/pages/Scanner.tsx
git commit -m "feat: add QR scanner page with camera, product lookup, and order composition"
```

---

## Task 13: Dashboard Page

**Files:**
- Create: `src/components/StatCard.tsx`
- Replace: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Create StatCard component**

```tsx
// src/components/StatCard.tsx
import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
}

export default function StatCard({ title, value, icon: Icon, subtitle }: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground/50" />
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Implement Dashboard page**

```tsx
// src/pages/Dashboard.tsx
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Package, Users, FileText, ScanLine, Plus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { isAdmin, profile } = useAuth()

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]

      const [ordersToday, drafts, activeProducts, totalCustomers] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true })
          .gte('created_at', today),
        supabase.from('orders').select('id', { count: 'exact', head: true })
          .eq('status', 'bozza'),
        supabase.from('products').select('id', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
      ])

      return {
        ordersToday: ordersToday.count ?? 0,
        drafts: drafts.count ?? 0,
        activeProducts: activeProducts.count ?? 0,
        totalCustomers: totalCustomers.count ?? 0,
      }
    },
  })

  const { data: weeklyData } = useQuery({
    queryKey: ['dashboard-weekly'],
    queryFn: async () => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data } = await supabase
        .from('orders')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .in('status', ['confermato', 'evaso'])

      const counts: Record<string, number> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        counts[d.toISOString().split('T')[0]] = 0
      }

      data?.forEach((o) => {
        const day = o.created_at.split('T')[0]
        if (counts[day] !== undefined) counts[day]++
      })

      return Object.entries(counts).map(([date, count]) => ({
        day: new Date(date).toLocaleDateString('it-IT', { weekday: 'short' }),
        ordini: count,
      }))
    },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Ciao, {profile?.display_name}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/scan"><Button><ScanLine className="h-4 w-4 mr-2" />Scanner</Button></Link>
          <Link to="/orders/new"><Button variant="outline"><Plus className="h-4 w-4 mr-2" />Nuovo Ordine</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Ordini oggi" value={stats?.ordersToday ?? 0} icon={ShoppingCart} />
        <StatCard title="Bozze" value={stats?.drafts ?? 0} icon={FileText} />
        <StatCard title="Prodotti attivi" value={stats?.activeProducts ?? 0} icon={Package} />
        {isAdmin && <StatCard title="Clienti" value={stats?.totalCustomers ?? 0} icon={Users} />}
      </div>

      {isAdmin && weeklyData && (
        <Card>
          <CardHeader><CardTitle>Ordini ultimi 7 giorni</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="ordini" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/StatCard.tsx src/pages/Dashboard.tsx
git commit -m "feat: add dashboard with stats and weekly orders chart"
```

---

## Task 14: Analytics Hook + Analytics Page

**Files:**
- Create: `src/hooks/useAnalytics.ts`, `src/lib/analytics.ts`
- Replace: `src/pages/Analytics.tsx`

- [ ] **Step 1: Implement analytics query functions**

```typescript
// src/lib/analytics.ts
import { supabase } from '@/lib/supabase'
import type { ProductSales, CustomerStats, CrossSellPair, DormantCustomer, MonthlyRevenue } from '@/types'

export async function fetchTopProductsForCustomer(customerId: string): Promise<ProductSales[]> {
  const { data, error } = await supabase.rpc('top_products_for_customer', { cid: customerId })
  if (error) {
    // Fallback: manual query if RPC not available
    const { data: items, error: e2 } = await supabase
      .from('order_items')
      .select('quantity, line_total, product:products(name, sku), order:orders!inner(customer_id, status)')
      .eq('order.customer_id', customerId)
      .in('order.status', ['confermato', 'evaso'])

    if (e2) throw e2

    const map = new Map<string, ProductSales>()
    items?.forEach((i: any) => {
      const key = i.product.sku
      const existing = map.get(key) ?? { name: i.product.name, sku: i.product.sku, total_qty: 0, total_spent: 0 }
      existing.total_qty += Number(i.quantity)
      existing.total_spent += Number(i.line_total)
      map.set(key, existing)
    })
    return [...map.values()].sort((a, b) => b.total_spent - a.total_spent).slice(0, 10)
  }
  return data
}

export async function fetchCustomerStats(customerId: string): Promise<CustomerStats | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, total_amount')
    .eq('customer_id', customerId)
    .in('status', ['confermato', 'evaso'])
    .order('created_at')

  if (error) throw error
  if (!data?.length) return null

  const totalOrders = data.length
  const firstOrder = data[0].created_at
  const lastOrder = data[data.length - 1].created_at
  const avgValue = data.reduce((s, o) => s + Number(o.total_amount), 0) / totalOrders

  let avgDays: number | null = null
  if (totalOrders > 1) {
    const firstMs = new Date(firstOrder).getTime()
    const lastMs = new Date(lastOrder).getTime()
    avgDays = (lastMs - firstMs) / (1000 * 60 * 60 * 24) / (totalOrders - 1)
  }

  return {
    customer_id: customerId,
    total_orders: totalOrders,
    first_order: firstOrder,
    last_order: lastOrder,
    avg_order_value: avgValue,
    avg_days_between_orders: avgDays,
  }
}

export async function fetchDormantCustomers(days: number = 30): Promise<DormantCustomer[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const { data: customers, error } = await supabase.from('customers').select('id, name, phone')
  if (error) throw error

  const results: DormantCustomer[] = []
  for (const c of customers ?? []) {
    const { data: orders } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .eq('customer_id', c.id)
      .in('status', ['confermato', 'evaso'])
      .order('created_at', { ascending: false })

    const lastDate = orders?.[0]?.created_at ?? null
    if (lastDate && new Date(lastDate) > cutoff) continue

    results.push({
      id: c.id,
      name: c.name,
      phone: c.phone,
      last_order_date: lastDate,
      total_orders: orders?.length ?? 0,
      avg_order_value: orders?.length
        ? orders.reduce((s, o) => s + Number(o.total_amount), 0) / orders.length
        : 0,
    })
  }

  return results.sort((a, b) => {
    if (!a.last_order_date) return 1
    if (!b.last_order_date) return -1
    return new Date(b.last_order_date).getTime() - new Date(a.last_order_date).getTime()
  })
}

export async function fetchMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total_amount')
    .in('status', ['confermato', 'evaso'])
    .order('created_at')

  if (error) throw error

  const map = new Map<string, { num_orders: number; revenue: number }>()
  data?.forEach((o) => {
    const month = o.created_at.slice(0, 7) // YYYY-MM
    const existing = map.get(month) ?? { num_orders: 0, revenue: 0 }
    existing.num_orders++
    existing.revenue += Number(o.total_amount)
    map.set(month, existing)
  })

  return [...map.entries()].map(([month, v]) => ({ month, ...v }))
}

export async function fetchCrossSelling(): Promise<CrossSellPair[]> {
  // Get all order items grouped by order
  const { data, error } = await supabase
    .from('order_items')
    .select('order_id, product:products(name)')
    .order('order_id')

  if (error) throw error

  const orderProducts = new Map<string, string[]>()
  data?.forEach((i: any) => {
    const list = orderProducts.get(i.order_id) ?? []
    list.push(i.product.name)
    orderProducts.set(i.order_id, list)
  })

  const pairCounts = new Map<string, number>()
  orderProducts.forEach((products) => {
    const unique = [...new Set(products)].sort()
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        const key = `${unique[i]}|||${unique[j]}`
        pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1)
      }
    }
  })

  return [...pairCounts.entries()]
    .map(([key, count]) => {
      const [a, b] = key.split('|||')
      return { product_a: a, product_b: b, times_together: count }
    })
    .sort((a, b) => b.times_together - a.times_together)
    .slice(0, 20)
}
```

- [ ] **Step 2: Implement useAnalytics hook**

```typescript
// src/hooks/useAnalytics.ts
import { useQuery } from '@tanstack/react-query'
import {
  fetchTopProductsForCustomer,
  fetchCustomerStats,
  fetchDormantCustomers,
  fetchMonthlyRevenue,
  fetchCrossSelling,
} from '@/lib/analytics'

export function useTopProducts(customerId: string | undefined) {
  return useQuery({
    queryKey: ['analytics', 'top-products', customerId],
    queryFn: () => fetchTopProductsForCustomer(customerId!),
    enabled: !!customerId,
  })
}

export function useCustomerStats(customerId: string | undefined) {
  return useQuery({
    queryKey: ['analytics', 'customer-stats', customerId],
    queryFn: () => fetchCustomerStats(customerId!),
    enabled: !!customerId,
  })
}

export function useDormantCustomers(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'dormant', days],
    queryFn: () => fetchDormantCustomers(days),
  })
}

export function useMonthlyRevenue() {
  return useQuery({
    queryKey: ['analytics', 'monthly-revenue'],
    queryFn: fetchMonthlyRevenue,
  })
}

export function useCrossSelling() {
  return useQuery({
    queryKey: ['analytics', 'cross-selling'],
    queryFn: fetchCrossSelling,
  })
}
```

- [ ] **Step 3: Implement Analytics page**

```tsx
// src/pages/Analytics.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMonthlyRevenue, useDormantCustomers, useCrossSelling } from '@/hooks/useAnalytics'
import { useCustomers } from '@/hooks/useCustomers'
import StatCard from '@/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, TrendingUp, ShoppingCart, Users } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

export default function Analytics() {
  const { data: monthlyRevenue } = useMonthlyRevenue()
  const [dormantDays, setDormantDays] = useState(30)
  const { data: dormant } = useDormantCustomers(dormantDays)
  const { data: crossSell } = useCrossSelling()

  const totalRevenue = monthlyRevenue?.reduce((s, m) => s + m.revenue, 0) ?? 0
  const totalOrders = monthlyRevenue?.reduce((s, m) => s + m.num_orders, 0) ?? 0
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Fatturato totale" value={`€${totalRevenue.toFixed(2)}`} icon={DollarSign} />
        <StatCard title="Ordini totali" value={totalOrders} icon={ShoppingCart} />
        <StatCard title="Ticket medio" value={`€${avgTicket.toFixed(2)}`} icon={TrendingUp} />
      </div>

      <Tabs defaultValue="trend">
        <TabsList>
          <TabsTrigger value="trend">Trend</TabsTrigger>
          <TabsTrigger value="dormant">Dormienti</TabsTrigger>
          <TabsTrigger value="cross">Cross-Selling</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <Card>
            <CardHeader><CardTitle>Trend Fatturato Mensile</CardTitle></CardHeader>
            <CardContent>
              {monthlyRevenue?.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenue}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">Nessun dato disponibile</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dormant">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Clienti Dormienti</CardTitle>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Soglia giorni:</Label>
                  <Input
                    type="number"
                    value={dormantDays}
                    onChange={(e) => setDormantDays(parseInt(e.target.value) || 30)}
                    className="w-20 h-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dormant?.length ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Cliente</th>
                        <th className="text-left p-3 font-medium">Ultimo ordine</th>
                        <th className="text-right p-3 font-medium">Ordini</th>
                        <th className="text-right p-3 font-medium">Media</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dormant.map((c) => (
                        <tr key={c.id} className="border-t">
                          <td className="p-3">
                            <Link to={`/customers/${c.id}`} className="text-primary hover:underline">{c.name}</Link>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {c.last_order_date ? new Date(c.last_order_date).toLocaleDateString('it-IT') : 'Mai'}
                          </td>
                          <td className="p-3 text-right">{c.total_orders}</td>
                          <td className="p-3 text-right">€{c.avg_order_value.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Nessun cliente dormiente</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cross">
          <Card>
            <CardHeader><CardTitle>Cross-Selling — Coppie più frequenti</CardTitle></CardHeader>
            <CardContent>
              {crossSell?.length ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Prodotto A</th>
                        <th className="text-left p-3 font-medium">Prodotto B</th>
                        <th className="text-right p-3 font-medium">Volte insieme</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crossSell.map((pair, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-3">{pair.product_a}</td>
                          <td className="p-3">{pair.product_b}</td>
                          <td className="p-3 text-right font-medium">{pair.times_together}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Dati insufficienti</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/analytics.ts src/hooks/useAnalytics.ts src/pages/Analytics.tsx
git commit -m "feat: add analytics page with revenue trends, dormant customers, and cross-selling"
```

---

## Task 15: PWA Configuration

**Files:**
- Create: `public/manifest.json`
- Modify: `index.html`

- [ ] **Step 1: Create PWA manifest**

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

- [ ] **Step 2: Update index.html to link manifest and add meta tags**

Add inside `<head>` of `index.html`:

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#1e40af" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="MagQR" />
<link rel="apple-touch-icon" href="/icon-192.png" />
```

- [ ] **Step 3: Create placeholder icons**

Generate simple placeholder PNG icons (192x192 and 512x512) using a canvas-based approach, or use a placeholder. For now, create simple SVG-based placeholders that will be replaced with real icons later:

```bash
# We'll create simple placeholder PNGs later — for now just commit the manifest
```

- [ ] **Step 4: Commit**

```bash
git add public/manifest.json index.html
git commit -m "feat: add PWA manifest and meta tags"
```

---

## Task 16: Update PROJECT_STATUS.md

**Files:**
- Modify: `PROJECT_STATUS.md`

- [ ] **Step 1: Update PROJECT_STATUS.md with current state**

```markdown
# PROJECT STATUS — Terminali CAAT (Magazzino QR)

> Ultimo aggiornamento: 2026-04-01
> Questo file serve come contesto condiviso tra Claude e Gemini. Ogni agente DEVE leggerlo prima di iniziare e aggiornarlo dopo ogni modifica significativa.

---

## 1. Descrizione del Progetto

**Magazzino QR** — Web app PWA per gestione magazzino con QR code, composizione ordini multi-operatore, e analytics clienti. Uso interno su rete WiFi.

Spec completa: `docs/superpowers/specs/2026-04-01-magazzino-qr-design.md`
Brief originale: `brief-magazzino-qr.md` (root workspace)

---

## 2. Tech Stack

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Routing | React Router v6 (lazy loading) |
| State/Cache | TanStack Query + Supabase Realtime |
| Backend/DB | Supabase Cloud (PostgreSQL + Auth + RLS) |
| QR | qrcode + html5-qrcode |
| Charts | Recharts |
| Stampa | CSS @media print 50x25mm Zebra |
| Deploy | Vercel (futuro) |

---

## 3. Struttura Cartelle

```
Terminali-CAAT/
├── PROJECT_STATUS.md
├── public/
│   └── manifest.json
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_rls_policies.sql
├── src/
│   ├── components/ (Layout, ProtectedRoute, QRCode, QRScanner, LabelPrint, OrderItemRow, StatCard, ui/)
│   ├── pages/ (Dashboard, Products, ProductDetail, Customers, CustomerDetail, Scanner, OrderNew, Orders, OrderDetail, Analytics, Login)
│   ├── hooks/ (useAuth, useProducts, useCustomers, useOrders, useAnalytics)
│   ├── lib/ (supabase, qr, export, analytics, utils)
│   └── types/
├── tests/
│   └── lib/ (qr.test.ts, export.test.ts)
└── docs/superpowers/
    ├── specs/2026-04-01-magazzino-qr-design.md
    └── plans/2026-04-01-magazzino-qr.md
```

---

## 4. Stato Attuale

Progetto appena pianificato. Spec e plan completati. Implementazione non ancora iniziata.

Ruoli: admin (accesso completo) + operatore (scanner e ordini propri).
Supabase: da creare.
Deploy: locale per ora.

---

## 5. Prossimi Step

1. Scaffolding progetto (Task 1-3)
2. Utility functions con TDD (Task 4-5)
3. Auth + Layout + Router (Task 6-7)
4. CRUD Prodotti + QR + Stampa (Task 8-9)
5. CRUD Clienti (Task 10)
6. Ordini + Scanner (Task 11-12)
7. Dashboard + Analytics (Task 13-14)
8. PWA (Task 15)
```

- [ ] **Step 2: Commit**

```bash
git add PROJECT_STATUS.md
git commit -m "docs: update PROJECT_STATUS.md with project plan and structure"
```

---

## Summary

| Task | Descrizione | Commit |
|------|-------------|--------|
| 1 | Scaffolding Vite + React + Tailwind + shadcn | `feat: scaffold...` |
| 2 | TypeScript types | `feat: add TypeScript type definitions...` |
| 3 | Supabase client + SQL migrations | `feat: add Supabase client and database migration...` |
| 4 | QR utilities (TDD) | `feat: add QR code encode/parse/validate...` |
| 5 | CSV export (TDD) | `feat: add CSV export utilities...` |
| 6 | Auth hook + Login page | `feat: add auth hook and login page` |
| 7 | Layout + ProtectedRoute + Router | `feat: add layout, protected routes, router...` |
| 8 | Products CRUD hook + list page | `feat: add products CRUD hook and products list...` |
| 9 | Product detail + QR + Label print | `feat: add product detail page with QR code...` |
| 10 | Customers CRUD + pages | `feat: add customers CRUD hook and customer...` |
| 11 | Orders hook + composition + list + detail | `feat: add orders hook, order composition...` |
| 12 | QR Scanner page | `feat: add QR scanner page with camera...` |
| 13 | Dashboard | `feat: add dashboard with stats and weekly...` |
| 14 | Analytics page | `feat: add analytics page with revenue trends...` |
| 15 | PWA manifest | `feat: add PWA manifest and meta tags` |
| 16 | Update PROJECT_STATUS.md | `docs: update PROJECT_STATUS.md...` |
