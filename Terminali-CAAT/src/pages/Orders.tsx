import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useOrders } from '@/hooks/useOrders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus } from 'lucide-react'
import type { OrderStatus } from '@/types'

const STATUS_OPTIONS: { value: OrderStatus | 'tutti'; label: string }[] = [
  { value: 'tutti', label: 'Tutti' },
  { value: 'bozza', label: 'Bozza' },
  { value: 'confermato', label: 'Confermato' },
  { value: 'evaso', label: 'Evaso' },
  { value: 'annullato', label: 'Annullato' },
]

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

export default function Orders() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'tutti'>('tutti')
  const [dateFilter, setDateFilter] = useState('')

  const filters: Record<string, string | undefined> = {}
  if (statusFilter !== 'tutti') filters.status = statusFilter
  if (dateFilter) filters.from = dateFilter

  const { data: orders, isLoading } = useOrders(
    statusFilter !== 'tutti' || dateFilter
      ? {
          status: statusFilter !== 'tutti' ? statusFilter : undefined,
          from: dateFilter || undefined,
        }
      : undefined
  )

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ordini</h2>
        <Link to="/orders/new">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Nuovo Ordine
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val as OrderStatus | 'tutti')}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full sm:w-[180px]"
        />
        {(statusFilter !== 'tutti' || dateFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('tutti')
              setDateFilter('')
            }}
          >
            Resetta
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-muted-foreground">Caricamento ordini...</p>
      ) : !orders?.length ? (
        <p className="text-muted-foreground">Nessun ordine trovato.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden sm:table-cell">Data</TableHead>
              <TableHead className="hidden sm:table-cell">Totale</TableHead>
              <TableHead>Stato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <TableCell className="font-medium text-primary">
                  #{order.order_number}
                </TableCell>
                <TableCell>{order.customer?.name ?? '-'}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {new Date(order.created_at).toLocaleDateString('it-IT')}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {order.total_amount.toFixed(2)} &euro;
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE_VARIANT[order.status]}>
                    {STATUS_LABEL[order.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
