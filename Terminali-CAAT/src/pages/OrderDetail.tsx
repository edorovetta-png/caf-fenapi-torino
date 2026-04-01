import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  useOrder,
  useOrderItems,
  useUpdateOrderItem,
  useDeleteOrderItem,
  useUpdateOrderStatus,
} from '@/hooks/useOrders'
import { Button } from '@/components/ui/button'
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
import { ArrowLeft, Download, Copy, CheckCircle, Truck, XCircle } from 'lucide-react'
import type { OrderStatus } from '@/types'

const STATUS_BADGE_VARIANT: Record<OrderStatus, 'secondary' | 'default' | 'outline' | 'destructive'> = {
  bozza: 'secondary',
  confermato: 'default',
  evaso: 'outline',
  annullato: 'destructive',
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  bozza: 'Bozza',
  confermato: 'Confermato',
  evaso: 'Evaso',
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

  async function handleStatusChange(status: OrderStatus) {
    if (!order) return
    try {
      await updateStatus.mutateAsync({ id: order.id, status })
      toast.success(
        status === 'confermato'
          ? 'Ordine confermato'
          : status === 'evaso'
            ? 'Ordine evaso'
            : 'Ordine annullato'
      )
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Errore aggiornamento stato'
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

  const editable = order.status === 'bozza'
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
            {order.status === 'bozza' && isAdmin && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('confermato')}
                disabled={updateStatus.isPending}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Conferma
              </Button>
            )}
            {order.status === 'confermato' && isAdmin && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('evaso')}
                disabled={updateStatus.isPending}
              >
                <Truck className="mr-1 h-4 w-4" />
                Segna evaso
              </Button>
            )}
            {(order.status === 'bozza' || order.status === 'confermato') &&
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
          <CardContent>
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
                      handleUpdateQuantity(item.id, quantity, unitPrice)
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
