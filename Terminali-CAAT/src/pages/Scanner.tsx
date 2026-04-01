import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProduct } from '@/hooks/useProducts'
import { useCustomers } from '@/hooks/useCustomers'
import { useCreateOrder, useAddOrderItem, useOrderItems } from '@/hooks/useOrders'
import { parseQRData } from '@/lib/qr'
import QRScanner from '@/components/QRScanner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

type ScannerState = 'scanning' | 'scanned' | 'select-customer'

export default function Scanner() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { data: customers } = useCustomers()

  const [state, setState] = useState<ScannerState>('scanning')
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [scannedProductId, setScannedProductId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [customerId, setCustomerId] = useState('')
  const [itemCount, setItemCount] = useState(0)

  const { data: product } = useProduct(scannedProductId ?? undefined)
  const { data: orderItems } = useOrderItems(currentOrderId ?? undefined)
  const createOrder = useCreateOrder()
  const addItem = useAddOrderItem()

  // Keep itemCount in sync with orderItems
  const currentItemCount = orderItems?.length ?? itemCount

  const handleScan = useCallback((raw: string) => {
    const qr = parseQRData(raw)
    if (!qr) {
      toast.error('QR code non valido')
      return
    }
    setScannedProductId(qr.id)
    setQuantity('1')
    setState('scanned')
  }, [])

  async function handleAddToOrder() {
    if (!product) return
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) {
      toast.error('Quantità non valida')
      return
    }

    // If no order yet, prompt for customer selection
    if (!currentOrderId) {
      setState('select-customer')
      return
    }

    // Add item to existing order
    try {
      await addItem.mutateAsync({
        order_id: currentOrderId,
        product_id: product.id,
        quantity: qty,
        unit_price: product.price,
      })
      setItemCount((prev) => prev + 1)
      toast.success(`${product.name} aggiunto all'ordine`)
      setScannedProductId(null)
      setState('scanning')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore aggiunta prodotto')
    }
  }

  async function handleCreateOrderAndAdd() {
    if (!customerId) {
      toast.error('Seleziona un cliente')
      return
    }
    if (!session?.user?.id) {
      toast.error('Sessione non valida')
      return
    }
    if (!product) return

    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) {
      toast.error('Quantità non valida')
      return
    }

    try {
      const order = await createOrder.mutateAsync({
        customer_id: customerId,
        created_by: session.user.id,
      })
      setCurrentOrderId(order.id)

      await addItem.mutateAsync({
        order_id: order.id,
        product_id: product.id,
        quantity: qty,
        unit_price: product.price,
      })
      setItemCount(1)
      toast.success(`Ordine creato e ${product.name} aggiunto`)
      setScannedProductId(null)
      setState('scanning')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore creazione ordine')
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold">Scanner QR</h2>

      {/* Scanning state */}
      {state === 'scanning' && (
        <div className="space-y-4">
          <QRScanner onScan={handleScan} active={state === 'scanning'} />
          <p className="text-sm text-muted-foreground text-center">
            Inquadra il codice QR di un prodotto
          </p>
          {currentOrderId && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/orders/${currentOrderId}`)}
            >
              Vedi ordine ({currentItemCount} prod.)
            </Button>
          )}
        </div>
      )}

      {/* Scanned state — product found */}
      {state === 'scanned' && product && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-lg font-semibold">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {product.sku} &middot; {product.price.toFixed(2)} &euro;/{product.unit}
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="qty">Quantità</Label>
              <Input
                id="qty"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setScannedProductId(null)
                  setState('scanning')
                }}
              >
                Annulla
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddToOrder}
                disabled={addItem.isPending}
              >
                {addItem.isPending ? 'Aggiunta...' : "Aggiungi all'ordine"}
              </Button>
            </div>
            {currentOrderId && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/orders/${currentOrderId}`)}
              >
                Vedi ordine ({currentItemCount} prod.)
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scanned but product still loading */}
      {state === 'scanned' && !product && scannedProductId && (
        <p className="text-sm text-muted-foreground text-center">
          Caricamento prodotto...
        </p>
      )}

      {/* Select customer state */}
      {state === 'select-customer' && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Nessun ordine aperto. Seleziona un cliente per crearne uno nuovo.
            </p>
            <div className="space-y-1">
              <Label>Cliente</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona cliente" />
                </SelectTrigger>
                <SelectContent>
                  {(customers ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {product && (
              <div className="text-sm">
                <p>
                  Prodotto: <strong>{product.name}</strong> &times; {quantity}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setScannedProductId(null)
                  setState('scanning')
                }}
              >
                Annulla
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateOrderAndAdd}
                disabled={createOrder.isPending || addItem.isPending}
              >
                {createOrder.isPending || addItem.isPending
                  ? 'Creazione...'
                  : 'Crea ordine e aggiungi'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
