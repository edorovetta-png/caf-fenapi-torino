import type { Order, OrderItemWithProduct, Customer } from '@/types'

const BOM = '\uFEFF'
const HEADER = 'SKU;Descrizione;Quantita;UnitaMisura;PrezzoUnitario;TotaleRiga;NoteCliente'

export function exportOrderToCSV(_order: Order, items: OrderItemWithProduct[], customer: Customer): string {
  const rows = items.map((item) =>
    [item.product.sku, item.product.name, item.quantity_ordered, item.product.unit,
     item.unit_price.toFixed(2), item.line_total.toFixed(2), customer.name].join(';')
  )
  return BOM + HEADER + '\n' + rows.join('\n')
}

export function orderCSVFilename(order: Order): string {
  const date = new Date(order.created_at)
  const ymd = date.getFullYear().toString() +
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
  customers: Array<{ name: string; phone: string | null; email: string | null; top_products: string; last_order_date: string | null }>
): string {
  const header = 'Nome;Telefono;Email;ProdottiAbituali;UltimoOrdine'
  const rows = customers.map((c) =>
    [c.name, c.phone ?? '', c.email ?? '', c.top_products, c.last_order_date ?? 'mai'].join(';')
  )
  return BOM + header + '\n' + rows.join('\n')
}
