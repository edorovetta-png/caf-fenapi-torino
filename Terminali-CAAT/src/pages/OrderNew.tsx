import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useCustomers } from '@/hooks/useCustomers'
import { useProducts } from '@/hooks/useProducts'
import {
  useCreateOrder,
  useAddOrderItem,
  useUpdateOrderItem,
  useDeleteOrderItem,
  useOrderItems,
  useUpdateOrderStatus,
} from '@/hooks/useOrders'
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import OrderItemRow from '@/components/OrderItemRow'
import { toast } from 'sonner'
import { Search, Plus, ArrowLeft } from 'lucide-react'
import type { Order, Product } from '@/types'

export default function OrderNew() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { data: customers } = useCustomers()

  const [customerId, setCustomerId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [productSearch, setProductSearch] = useState('')

  const createOrder = useCreateOrder()
  const addItem = useAddOrderItem()
  const updateItem = useUpdateOrderItem()
  const deleteItem = useDeleteOrderItem()
  const updateStatus = useUpdateOrderStatus()

  const { data: orderItems } = useOrderItems(order?.id)
  const { data: products } = useProducts(
    productSearch ? { search: productSearch } : undefined
  )

  async function handleCreateDraft() {
    if (!customerId) {
      toast.error('Seleziona un cliente')
      return
    }
    if (!session?.user?.id) {
      toast.error('Sessione non valida')
      return
    }
    try {
      const created = await createOrder.mutateAsync({
        customer_id: customerId,
        created_by: session.user.id,
        notes: notes || null,
      })
      setOrder(created)
      toast.success('Bozza ordine creata')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Errore nella creazione'
      )
    }
  }

  async function handleAddProduct(product: Product) {
    if (!order) return
    try {
      await addItem.mutateAsync({
        order_id: order.id,
        product_id: product.id,
        quantity: 1,
        unit_price: product.price,
      })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Errore aggiunta prodotto'
      )
    }
  }

  async function handleUpdateQuantity(
    itemId: string,
    quantity: number,
    unitPrice: number
  ) {
    if (!order) return
    try {
      await updateItem.mutateAsync({
        id: itemId,
        order_id: order.id,
        quantity,
        unit_price: unitPrice,
      })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Errore aggiornamento'
      )
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!order) return
    try {
      await deleteItem.mutateAsync({ id: itemId, order_id: order.id })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Errore eliminazione'
      )
    }
  }

  async function handleConfirm() {
    if (!order) return
    try {
      await updateStatus.mutateAsync({
        id: order.id,
        status: 'confermato',
      })
      toast.success('Ordine confermato')
      navigate(`/orders/${order.id}`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Errore conferma ordine'
      )
    }
  }

  const total = (orderItems ?? []).reduce((sum, i) => sum + i.line_total, 0)

  // Step 1: Create draft
  if (!order) {
    return (
      <div className="p-4 sm:p-6 space-y-4 max-w-lg">
        <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Indietro
        </Button>
        <h2 className="text-2xl font-bold">Nuovo Ordine</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Cliente *</Label>
            <Select
              value={customerId}
              onValueChange={(val) => setCustomerId(val)}
            >
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
          <div className="space-y-1">
            <Label htmlFor="notes">Note</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note opzionali..."
            />
          </div>
          <Button
            onClick={handleCreateDraft}
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? 'Creazione...' : 'Crea Bozza Ordine'}
          </Button>
        </div>
      </div>
    )
  }

  // Step 2: Compose order
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        Indietro
      </Button>
      <h2 className="text-2xl font-bold">
        Componi Ordine #{order.order_number}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Product search */}
        <Card>
          <CardHeader>
            <CardTitle>Cerca Prodotti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome o SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="max-h-80 overflow-y-auto space-y-1">
              {productSearch &&
                (products ?? [])
                  .filter((p) => p.is_active)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between py-2 px-2 rounded hover:bg-muted"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.sku} &middot; {product.price.toFixed(2)}{' '}
                          &euro;/{product.unit}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleAddProduct(product)}
                        disabled={addItem.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              {productSearch && !products?.length && (
                <p className="text-sm text-muted-foreground py-2">
                  Nessun prodotto trovato.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Order summary */}
        <Card>
          <CardHeader>
            <CardTitle>Riepilogo Ordine</CardTitle>
          </CardHeader>
          <CardContent>
            {!orderItems?.length ? (
              <p className="text-sm text-muted-foreground">
                Aggiungi prodotti dall&apos;elenco a sinistra.
              </p>
            ) : (
              <div>
                {orderItems.map((item) => (
                  <OrderItemRow
                    key={item.id}
                    item={item}
                    editable
                    onUpdate={(quantity) =>
                      handleUpdateQuantity(item.id, quantity, item.unit_price)
                    }
                    onDelete={() => handleDeleteItem(item.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <span className="font-bold">Totale</span>
            <span className="font-bold">{total.toFixed(2)} &euro;</span>
          </CardFooter>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate('/orders')}>
          Salva Bozza
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={updateStatus.isPending || !orderItems?.length}
        >
          {updateStatus.isPending ? 'Conferma...' : 'Conferma Ordine'}
        </Button>
      </div>
    </div>
  )
}
