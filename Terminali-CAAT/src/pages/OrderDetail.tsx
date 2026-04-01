import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  useOrder,
  useOrderItems,
  useUpdateOrderItem,
  useDeleteOrderItem,
  useUpdateOrderStatus,
  useAddOrderItem,
  getLastPriceForCustomer,
} from '@/hooks/useOrders'
import { useProducts } from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import OrderItemRow from '@/components/OrderItemRow'
import { exportOrderToCSV, orderCSVFilename, downloadCSV } from '@/lib/export'
import { toast } from 'sonner'
import { ArrowLeft, Download, Copy, CheckCircle, Truck, XCircle, Search, Plus, ClipboardList } from 'lucide-react'
import type { OrderStatus, Product } from '@/types'

const STATUS_BADGE_VARIANT: Record<OrderStatus, 'secondary' | 'default' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  picking: 'outline',
  confirmed: 'default',
  exported: 'outline',
  completed: 'default',
  annullato: 'destructive',
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  draft: 'Bozza',
  picking: 'In Picking',
  confirmed: 'Confermato',
  exported: 'Esportato',
  completed: 'Completato',
  annullato: 'Annullato',
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const { data: order, isLoading } = useOrder(id)
  const { data: orderItems } = useOrderItems(id)
  const updateItem = useUpdateOrderItem()
  const deleteItem = useDeleteOrderItem()
  const updateStatus = useUpdateOrderStatus()
  const addItem = useAddOrderItem()
  const [productSearch, setProductSearch] = useState('')
  const { data: searchProducts } = useProducts(
    productSearch ? { search: productSearch } : undefined
  )

  async function handleAddProduct(product: Product) {
    if (!order) return
    try {
      const lastPrice = await getLastPriceForCustomer(order.customer_id, product.id)
      await addItem.mutateAsync({
        order_id: order.id,
        product_id: product.id,
        quantity_ordered: 1,
        unit_price: lastPrice ?? product.price,
        vat_rate: product.vat_rate,
      })
      setProductSearch('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore aggiunta prodotto')
    }
  }

  async function handleStatusChange(status: OrderStatus) {
    if (!order) return
    try {
      await updateStatus.mutateAsync({ id: order.id, status })
      const msgs: Partial<Record<OrderStatus, string>> = {
        confirmed: 'Ordine confermato',
        exported: 'Ordine esportato',
        completed: 'Ordine completato',
        annullato: 'Ordine annullato',
      }
      toast.success(msgs[status] ?? 'Stato aggiornato')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Errore aggiornamento stato'
      )
    }
  }

  async function handleUpdateQuantity(
    itemId: string,
    quantity: number,
    unitPrice: number,
    vatRate: number
  ) {
    if (!order) return
    try {
      await updateItem.mutateAsync({
        id: itemId,
        order_id: order.id,
        quantity_ordered: quantity,
        unit_price: unitPrice,
        vat_rate: vatRate,
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

  function handleExportCSV() {
    if (!order || !orderItems || !order.customer) return
    const csv = exportOrderToCSV(order, orderItems, order.customer)
    const filename = orderCSVFilename(order)
    downloadCSV(csv, filename)
    toast.success('CSV scaricato')
  }

  function handleDuplicate() {
    navigate('/orders/new')
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-muted-foreground">Caricamento ordine...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-muted-foreground">Ordine non trovato.</p>
      </div>
    )
  }

  const editable = order.status === 'draft'
  const imponibile = (orderItems ?? []).reduce((sum, i) => sum + i.line_total, 0)
  const totalVat = (orderItems ?? []).reduce((sum, i) => sum + i.line_total * ((i.product.vat_rate ?? 22) / 100), 0)
  const totaleIvato = imponibile + totalVat

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        Indietro
      </Button>

      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">Ordine #{order.order_number}</h2>
        <Badge variant={STATUS_BADGE_VARIANT[order.status]}>
          {STATUS_LABEL[order.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Details */}
        <Card>
          <CardHeader>
            <CardTitle>Dettagli</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente</span>
              <span className="font-medium">{order.customer?.name ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data</span>
              <span>{new Date(order.created_at).toLocaleDateString('it-IT')}</span>
            </div>
            {order.notes && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Note</span>
                <span className="text-right max-w-[60%]">{order.notes}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-wrap gap-2">
            {order.status === 'draft' && (
              <Button
                size="sm"
                onClick={() => navigate(`/orders/${order.id}/picking`)}
              >
                <ClipboardList className="mr-1 h-4 w-4" />
                Avvia Picking
              </Button>
            )}
            {order.status === 'draft' && isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('confirmed')}
                disabled={updateStatus.isPending}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Conferma
              </Button>
            )}
            {order.status === 'confirmed' && isAdmin && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('exported')}
                disabled={updateStatus.isPending}
              >
                <Truck className="mr-1 h-4 w-4" />
                Esporta
              </Button>
            )}
            {order.status === 'exported' && isAdmin && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('completed')}
                disabled={updateStatus.isPending}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Completa
              </Button>
            )}
            {(order.status === 'draft' || order.status === 'confirmed') &&
              isAdmin && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleStatusChange('annullato')}
                  disabled={updateStatus.isPending}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Annulla
                </Button>
              )}
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-1 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="mr-1 h-4 w-4" />
              Duplica
            </Button>
          </CardFooter>
        </Card>

        {/* Right: Products */}
        <Card>
          <CardHeader>
            <CardTitle>Prodotti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {editable && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Aggiungi prodotto..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {productSearch && (
                  <div className="max-h-40 overflow-y-auto space-y-1 border rounded p-1">
                    {(searchProducts ?? [])
                      .filter((p) => p.is_active)
                      .map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.sku} · {product.price.toFixed(2)} €/{product.unit}
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
                    {!searchProducts?.length && (
                      <p className="text-xs text-muted-foreground p-2">Nessun risultato</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {!orderItems?.length ? (
              <p className="text-sm text-muted-foreground">
                Nessun prodotto in questo ordine.
              </p>
            ) : (
              <div>
                {orderItems.map((item) => (
                  <OrderItemRow
                    key={item.id}
                    item={item}
                    editable={editable}
                    onUpdate={(quantity, unitPrice) =>
                      handleUpdateQuantity(item.id, quantity, unitPrice, item.vat_rate)
                    }
                    onDelete={() => handleDeleteItem(item.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-1">
            <div className="flex justify-between text-sm">
              <span>Imponibile</span>
              <span>{imponibile.toFixed(2)} &euro;</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>IVA</span>
              <span>+{totalVat.toFixed(2)} &euro;</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-1 border-t">
              <span>Totale</span>
              <span>{totaleIvato.toFixed(2)} &euro;</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
