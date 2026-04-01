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
