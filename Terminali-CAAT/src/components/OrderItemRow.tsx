import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import type { OrderItemWithProduct } from '@/types'

interface OrderItemRowProps {
  item: OrderItemWithProduct
  editable: boolean
  onUpdate: (quantity: number) => void
  onDelete: () => void
}

export default function OrderItemRow({
  item,
  editable,
  onUpdate,
  onDelete,
}: OrderItemRowProps) {
  const [qty, setQty] = useState(String(item.quantity))

  function handleBlur() {
    const parsed = parseFloat(qty)
    if (isNaN(parsed) || parsed <= 0) {
      setQty(String(item.quantity))
      return
    }
    if (parsed !== item.quantity) {
      onUpdate(parsed)
    }
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.product.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.product.sku} &middot; {item.unit_price.toFixed(2)} &euro;/{item.product.unit}
        </p>
      </div>
      <div className="w-20 shrink-0">
        {editable ? (
          <Input
            type="number"
            step="0.001"
            min="0.001"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onBlur={handleBlur}
            className="text-right h-7 text-sm"
          />
        ) : (
          <span className="block text-right text-sm">{item.quantity}</span>
        )}
      </div>
      <span className="w-20 text-right text-sm shrink-0">
        {item.line_total.toFixed(2)} &euro;
      </span>
      {editable && (
        <Button variant="ghost" size="icon-sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  )
}
