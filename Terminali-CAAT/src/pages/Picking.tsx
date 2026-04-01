import { useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useOrder,
  useOrderItems,
  useUpdateOrderStatus,
  useAddPickingScan,
} from '@/hooks/useOrders'
import { useRecommendedLots } from '@/hooks/useLots'
import { parseQRData } from '@/lib/qr'
import QRScanner from '@/components/QRScanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle, AlertTriangle, PackageSearch } from 'lucide-react'
import type { OrderItemWithProduct, ProductLot } from '@/types'

export default function Picking() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: order, isLoading: orderLoading } = useOrder(id)
  const { data: orderItems } = useOrderItems(id)
  const updateStatus = useUpdateOrderStatus()
  const addPickingScan = useAddPickingScan()

  // Get unique product IDs for recommended lot lookup
  const productIds = useMemo(
    () => [...new Set((orderItems ?? []).map((i) => i.product_id))],
    [orderItems],
  )
  const { data: recommendedLots } = useRecommendedLots(productIds)

  const pickedCount = (orderItems ?? []).filter((i) => i.picked).length
  const totalCount = (orderItems ?? []).length
  const allPicked = totalCount > 0 && pickedCount === totalCount

  const handleScan = useCallback(
    async (raw: string) => {
      if (!orderItems || !id) return

      const qr = parseQRData(raw)
      if (!qr) {
        toast.error('QR code non valido')
        return
      }

      // Find matching order_item by product_id
      const matchingItem = orderItems.find((i) => i.product_id === qr.id)
      if (!matchingItem) {
        toast.error('Prodotto non nell\'ordine!')
        if (navigator.vibrate) navigator.vibrate([100, 50, 100])
        return
      }

      // Check if already fully picked
      if (matchingItem.quantity_picked >= matchingItem.quantity_ordered) {
        toast.warning('Quantità già raggiunta')
        if (navigator.vibrate) navigator.vibrate([100, 50, 100])
        return
      }

      const lotId = qr.lot ?? null

      // Check if scanned lot differs from recommended
      if (lotId && recommendedLots) {
        const recommended = recommendedLots.get(matchingItem.product_id)
        if (recommended && recommended.id !== lotId) {
          const expiry = recommended.expiry_date
            ? new Date(recommended.expiry_date).toLocaleDateString('it-IT')
            : 'n/d'
          toast.warning(
            `Lotto diverso dal consigliato ${recommended.lot_number} (scad. ${expiry})`,
            { duration: 5000 },
          )
        }
      }

      const newQtyPicked = matchingItem.quantity_picked + 1

      try {
        await addPickingScan.mutateAsync({
          order_id: id,
          order_item_id: matchingItem.id,
          lot_id: lotId ?? '',
          product_id: qr.id,
          quantity: 1,
          new_quantity_picked: newQtyPicked,
          quantity_ordered: matchingItem.quantity_ordered,
        })
        if (navigator.vibrate) navigator.vibrate(100)
        toast.success(
          `${matchingItem.product.name} — ${newQtyPicked}/${matchingItem.quantity_ordered}`,
        )
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Errore durante la scansione',
        )
      }
    },
    [orderItems, id, addPickingScan, recommendedLots],
  )

  async function handleConfirm() {
    if (!order) return
    try {
      await updateStatus.mutateAsync({ id: order.id, status: 'confirmed' })
      toast.success('Ordine confermato')
      navigate(`/orders/${order.id}`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Errore conferma ordine',
      )
    }
  }

  async function handlePartialConfirm() {
    if (!order) return
    try {
      await updateStatus.mutateAsync({
        id: order.id,
        status: 'confirmed',
        notes: (order.notes ? order.notes + ' | ' : '') + 'Evasione parziale',
      })
      toast.success('Ordine confermato (parziale)')
      navigate(`/orders/${order.id}`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Errore conferma ordine',
      )
    }
  }

  if (orderLoading) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-muted-foreground">Caricamento...</p>
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

  // Group items by category
  const grouped = (orderItems ?? []).reduce<
    Record<string, OrderItemWithProduct[]>
  >((acc, item) => {
    const cat = item.product.category ?? 'Senza categoria'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const progressPercent =
    totalCount > 0 ? Math.round((pickedCount / totalCount) * 100) : 0

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/orders/${order.id}`)}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Torna all'ordine
      </Button>

      <div>
        <h2 className="text-2xl font-bold">
          Picking — Ordine #{order.order_number}
        </h2>
        <p className="text-sm text-muted-foreground">{order.customer?.name}</p>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>
            {pickedCount}/{totalCount} prodotti raccolti
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: allPicked ? '#16a34a' : '#eab308',
            }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <Card key={category}>
            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {category}
              </p>
              <div className="space-y-2">
                {items.map((item) => (
                  <PickingItem
                    key={item.id}
                    item={item}
                    recommendedLot={recommendedLots?.get(item.product_id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scanner */}
      {!allPicked && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm font-medium text-center">
              Scansiona prodotto
            </p>
            <QRScanner onScan={handleScan} active={!allPicked} />
            <p className="text-xs text-muted-foreground text-center">
              Inquadra il QR code del prodotto per registrare la raccolta
            </p>
          </CardContent>
        </Card>
      )}

      {/* Bottom buttons */}
      <div className="flex gap-2 pb-8">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handlePartialConfirm}
          disabled={updateStatus.isPending || pickedCount === 0}
        >
          <AlertTriangle className="mr-1 h-4 w-4" />
          Conferma Parziale
        </Button>
        <Button
          className="flex-1"
          onClick={handleConfirm}
          disabled={updateStatus.isPending || !allPicked}
        >
          <CheckCircle className="mr-1 h-4 w-4" />
          Conferma Ordine
        </Button>
      </div>
    </div>
  )
}

/** Single item in the picking checklist */
function PickingItem({
  item,
  recommendedLot,
}: {
  item: OrderItemWithProduct
  recommendedLot?: ProductLot
}) {
  const status =
    item.quantity_picked === 0
      ? 'todo'
      : item.quantity_picked >= item.quantity_ordered
        ? 'done'
        : 'partial'
  const icon =
    status === 'done' ? '\u2705' : status === 'partial' ? '\uD83D\uDFE1' : '\u2B1C'

  return (
    <div
      className={`py-2 px-2 rounded ${status === 'done' ? 'bg-green-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.product.name}</p>
          <p className="text-xs text-muted-foreground">{item.product.sku}</p>
          {item.lot && (
            <p className="text-xs text-muted-foreground">
              Lotto: {item.lot.lot_number}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-medium">
            {item.quantity_picked}/{item.quantity_ordered}
          </p>
          <Badge
            variant={
              status === 'done'
                ? 'default'
                : status === 'partial'
                  ? 'outline'
                  : 'secondary'
            }
            className="text-xs"
          >
            {status === 'done'
              ? 'Completato'
              : status === 'partial'
                ? 'Parziale'
                : 'Da fare'}
          </Badge>
        </div>
      </div>

      {/* Recommended lot suggestion — only show when item is not yet complete */}
      {status !== 'done' && recommendedLot && (
        <div className="ml-8 mt-1 flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 rounded px-2 py-1">
          <PackageSearch className="h-3 w-3 shrink-0" />
          <span>
            Lotto consigliato: <strong>{recommendedLot.lot_number}</strong>
            {recommendedLot.expiry_date && (
              <> &middot; Scad.{' '}
                {new Date(recommendedLot.expiry_date).toLocaleDateString('it-IT')}
              </>
            )}
            &middot; Disp. {recommendedLot.quantity_in_stock} {item.product.unit}
          </span>
        </div>
      )}
    </div>
  )
}
