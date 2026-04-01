import { supabase } from '@/lib/supabase'
import type {
  ProductSales,
  CustomerStats,
  DormantCustomer,
  MonthlyRevenue,
  CrossSellPair,
} from '@/types'

export async function fetchTopProductsForCustomer(
  customerId: string
): Promise<ProductSales[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('quantity_ordered, unit_price, line_total, product:products(name, sku), order:orders!inner(customer_id, status)')
    .eq('order.customer_id', customerId)
    .in('order.status', ['confirmed', 'exported', 'completed'])

  if (error) throw error
  if (!data) return []

  const map = new Map<string, ProductSales>()

  for (const row of data as any[]) {
    const name: string = row.product?.name ?? 'Sconosciuto'
    const sku: string = row.product?.sku ?? ''
    const key = sku || name
    const existing = map.get(key)
    if (existing) {
      existing.total_qty += row.quantity_ordered
      existing.total_spent += row.line_total
    } else {
      map.set(key, {
        name,
        sku,
        total_qty: row.quantity_ordered,
        total_spent: row.line_total,
      })
    }
  }

  return [...map.values()]
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 10)
}

export async function fetchCustomerStats(
  customerId: string
): Promise<CustomerStats | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, total_amount, created_at')
    .eq('customer_id', customerId)
    .in('status', ['confirmed', 'exported', 'completed'])
    .order('created_at', { ascending: true })

  if (error) throw error
  if (!data || data.length === 0) return null

  const totalOrders = data.length
  const firstOrder = data[0].created_at
  const lastOrder = data[data.length - 1].created_at
  const totalAmount = data.reduce((s, o) => s + o.total_amount, 0)
  const avgOrderValue = totalAmount / totalOrders

  let avgDaysBetween: number | null = null
  if (totalOrders > 1) {
    const dates = data.map((o) => new Date(o.created_at).getTime())
    let totalDays = 0
    for (let i = 1; i < dates.length; i++) {
      totalDays += (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)
    }
    avgDaysBetween = Math.round(totalDays / (dates.length - 1))
  }

  return {
    customer_id: customerId,
    total_orders: totalOrders,
    first_order: firstOrder,
    last_order: lastOrder,
    avg_order_value: Math.round(avgOrderValue * 100) / 100,
    avg_days_between_orders: avgDaysBetween,
  }
}

export async function fetchDormantCustomers(
  days: number = 30
): Promise<DormantCustomer[]> {
  // Get all customers
  const { data: customers, error: custErr } = await supabase
    .from('customers')
    .select('id, name, phone')

  if (custErr) throw custErr
  if (!customers) return []

  // Get all confirmed/evaded orders grouped by customer
  const { data: orders, error: ordErr } = await supabase
    .from('orders')
    .select('customer_id, total_amount, created_at')
    .in('status', ['confirmed', 'exported', 'completed'])

  if (ordErr) throw ordErr

  const ordersByCustomer = new Map<
    string,
    { dates: string[]; amounts: number[] }
  >()
  for (const o of orders ?? []) {
    const entry = ordersByCustomer.get(o.customer_id)
    if (entry) {
      entry.dates.push(o.created_at)
      entry.amounts.push(o.total_amount)
    } else {
      ordersByCustomer.set(o.customer_id, {
        dates: [o.created_at],
        amounts: [o.total_amount],
      })
    }
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const result: DormantCustomer[] = []

  for (const c of customers) {
    const entry = ordersByCustomer.get(c.id)
    if (!entry) {
      // Never ordered — dormant
      result.push({
        id: c.id,
        name: c.name,
        phone: c.phone,
        last_order_date: null,
        total_orders: 0,
        avg_order_value: 0,
      })
      continue
    }

    const lastDate = entry.dates
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime())[0]

    if (lastDate < cutoff) {
      const avg =
        entry.amounts.reduce((s, v) => s + v, 0) / entry.amounts.length
      result.push({
        id: c.id,
        name: c.name,
        phone: c.phone,
        last_order_date: lastDate.toISOString(),
        total_orders: entry.dates.length,
        avg_order_value: Math.round(avg * 100) / 100,
      })
    }
  }

  return result.sort((a, b) => {
    if (!a.last_order_date && !b.last_order_date) return 0
    if (!a.last_order_date) return 1
    if (!b.last_order_date) return -1
    return b.last_order_date.localeCompare(a.last_order_date)
  })
}

export async function fetchMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .in('status', ['confirmed', 'exported', 'completed'])

  if (error) throw error
  if (!data) return []

  const map = new Map<string, { num_orders: number; revenue: number }>()

  for (const o of data) {
    const month = o.created_at.slice(0, 7) // YYYY-MM
    const entry = map.get(month)
    if (entry) {
      entry.num_orders++
      entry.revenue += o.total_amount
    } else {
      map.set(month, { num_orders: 1, revenue: o.total_amount })
    }
  }

  return [...map.entries()]
    .map(([month, v]) => ({
      month,
      num_orders: v.num_orders,
      revenue: Math.round(v.revenue * 100) / 100,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export async function fetchCrossSelling(): Promise<CrossSellPair[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('order_id, product:products(name)')

  if (error) throw error
  if (!data) return []

  // Group products by order
  const orderProducts = new Map<string, string[]>()
  for (const item of data as any[]) {
    const name: string = item.product?.name ?? 'Sconosciuto'
    const list = orderProducts.get(item.order_id)
    if (list) {
      if (!list.includes(name)) list.push(name)
    } else {
      orderProducts.set(item.order_id, [name])
    }
  }

  // Count pairs
  const pairMap = new Map<string, number>()
  for (const products of orderProducts.values()) {
    if (products.length < 2) continue
    const sorted = [...products].sort()
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const key = `${sorted[i]}|||${sorted[j]}`
        pairMap.set(key, (pairMap.get(key) ?? 0) + 1)
      }
    }
  }

  return [...pairMap.entries()]
    .map(([key, count]) => {
      const [a, b] = key.split('|||')
      return { product_a: a, product_b: b, times_together: count }
    })
    .sort((a, b) => b.times_together - a.times_together)
    .slice(0, 20)
}
