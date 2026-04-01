import { describe, it, expect } from 'vitest'
import { exportOrderToCSV } from '@/lib/export'
import type { Order, OrderItemWithProduct, Customer } from '@/types'

const mockCustomer: Customer = {
  id: '1', name: 'Mario Rossi', email: null, phone: null,
  address: null, category: null, notes: null, created_at: '', updated_at: '',
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
})
