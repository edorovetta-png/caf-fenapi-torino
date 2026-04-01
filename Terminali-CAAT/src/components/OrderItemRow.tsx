import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import type { OrderItemWithProduct } from '@/types'

interface OrderItemRowProps {
  item: OrderItemWithProduct
  editable: boolean
  onUpdate: (quantity: number, unitPrice: number) => void
  onDelete: () => void
}

export default function OrderItemRow({
  item,
  editable,
  onUpdate,
  onDelete,
}: OrderItemRowProps) {
  const [qty, setQty] = useState(String(item.quantity))
  const [price, setPrice] = useState(item.unit_price.toFixed(2))

  const vatRate = item.product.vat_rate ?? 22
  const lineNet = item.line_total
  const lineVat = lineNet * (vatRate / 100)

  function handleQtyBlur() {
    const parsed = parseFloat(qty)
    if (isNaN(parsed) || parsed <= 0) {
      setQty(String(item.quantity))
      return
    }
    if (parsed !== item.quantity) {
      onUpdate(parsed, parseFloat(price))
    }
  }

  function handlePriceBlur() {
    const parsed = parseFloat(price)
    if (isNaN(parsed) || parsed < 0) {
      setPrice(item.unit_price.toFixed(2))
      return
    }
    if (parsed !== item.unit_price) {
      onUpdate(parseFloat(qty), parsed)
    }
  }

  return (
    <div className="flex items-center gap-2 py-2 border-b last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.product.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.product.sku} &middot; IVA {vatRate}%
        </p>
      </div>
      <div className="w-20 shrink-0">
        {editable ? (
          <Input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={handlePriceBlur}
            className="text-right h-7 text-sm"
          />
        ) : (
          <span className="block text-right text-sm">{item.unit_price.toFixed(2)} &euro;</span>
        )}
      </div>
      <div className="w-16 shrink-0">
        {editable ? (
          <Input
            type="number"
            step="0.001"
            min="0.001"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onBlur={handleQtyBlur}
            className="text-right h-7 text-sm"
          />
        ) : (
          <span className="block text-right text-sm">{item.quantity}</span>
        )}
      </div>
      <div className="w-20 text-right text-xs shrink-0">
        <div className="font-medium">{lineNet.toFixed(2)} &euro;</div>
        <div className="text-muted-foreground">+{lineVat.toFixed(2)}</div>
      </div>
      {editable && (
        <Button variant="ghost" size="icon-sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  )
}
