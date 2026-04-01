export type UserRole = 'admin' | 'operatore'
export type OrderStatus = 'draft' | 'picking' | 'confirmed' | 'exported' | 'completed' | 'annullato'

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
  vat_rate: number
  min_stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductLot {
  id: string
  product_id: string
  lot_number: string
  expiry_date: string | null
  quantity_received: number
  quantity_in_stock: number
  cost_price: number | null
  supplier: string | null
  received_at: string
  qr_data: string
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductLotWithProduct extends ProductLot {
  product: Product
}

export type StockStatus = 'ok' | 'sotto_scorta' | 'in_scadenza' | 'scaduto' | 'esaurito'

export interface ProductStock {
  product_id: string
  sku: string
  name: string
  category: string | null
  unit: string
  price: number
  min_stock: number
  total_stock: number
  active_lots: number
  nearest_expiry: string | null
  stock_status: StockStatus
}

export interface ExpiringLot {
  lot_id: string
  lot_number: string
  expiry_date: string
  quantity_in_stock: number
  sku: string
  product_name: string
  category: string | null
  days_until_expiry: number
}

export interface Order {
  id: string
  order_number: number
  customer_id: string
  created_by: string
  status: OrderStatus
  notes: string | null
  total_amount: number
  total_with_vat: number
  exported_at: string | null
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
  lot_id: string | null
  quantity_ordered: number
  quantity_picked: number
  unit_price: number
  line_total: number
  vat_rate: number
  line_total_vat: number
  picked: boolean
  created_at: string
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product
  lot: ProductLot | null
}

export interface QRCodeData {
  app: 'magazzino-qr'
  sku: string
  id: string
  lot?: string
}

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

export interface PickingScan {
  id: string
  order_id: string
  order_item_id: string
  lot_id: string
  product_id: string
  quantity: number
  scanned_at: string
}
