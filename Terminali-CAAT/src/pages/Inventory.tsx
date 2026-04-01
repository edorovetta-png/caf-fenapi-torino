import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductStock, useExpiringLots } from '@/hooks/useLots'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Button } from '@/components/ui/button'
import StatCard from '@/components/StatCard'
import {
  Search,
  Package,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react'
import type { StockStatus } from '@/types'

const CATEGORIES = [
  { value: 'bevande', label: 'Bevande' },
  { value: 'secchi', label: 'Secchi' },
  { value: 'freschi', label: 'Freschi' },
  { value: 'surgelati', label: 'Surgelati' },
  { value: 'condimenti', label: 'Condimenti' },
  { value: 'altro', label: 'Altro' },
]

const STATUS_OPTIONS: { value: StockStatus | 'tutti'; label: string }[] = [
  { value: 'tutti', label: 'Tutti gli stati' },
  { value: 'ok', label: 'OK' },
  { value: 'sotto_scorta', label: 'Sotto scorta' },
  { value: 'in_scadenza', label: 'In scadenza' },
  { value: 'scaduto', label: 'Scaduto' },
  { value: 'esaurito', label: 'Esaurito' },
]

function statusBadge(status: StockStatus) {
  const config: Record<StockStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string; label: string }> = {
    ok: { variant: 'default', className: '', label: 'OK' },
    sotto_scorta: { variant: 'outline', className: 'border-yellow-500 text-yellow-700 bg-yellow-50', label: 'Sotto scorta' },
    in_scadenza: { variant: 'outline', className: 'border-orange-500 text-orange-700 bg-orange-50', label: 'In scadenza' },
    scaduto: { variant: 'destructive', className: '', label: 'Scaduto' },
    esaurito: { variant: 'secondary', className: '', label: 'Esaurito' },
  }
  const c = config[status]
  return <Badge variant={c.variant} className={c.className}>{c.label}</Badge>
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Inventory() {
  const navigate = useNavigate()
  const { data: products, isLoading } = useProductStock()
  const { data: expiringLots } = useExpiringLots()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [expiringExpanded, setExpiringExpanded] = useState(false)

  const filtered = useMemo(() => {
    if (!products) return []
    return products.filter((p) => {
      if (search) {
        const q = search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false
      }
      if (categoryFilter && p.category !== categoryFilter) return false
      if (statusFilter && statusFilter !== 'tutti' && p.stock_status !== statusFilter) return false
      return true
    })
  }, [products, search, categoryFilter, statusFilter])

  const counts = useMemo(() => {
    if (!products) return { total: 0, sotto_scorta: 0, in_scadenza: 0, esaurito: 0 }
    return {
      total: products.length,
      sotto_scorta: products.filter((p) => p.stock_status === 'sotto_scorta').length,
      in_scadenza: products.filter((p) => p.stock_status === 'in_scadenza').length,
      esaurito: products.filter((p) => p.stock_status === 'esaurito').length,
    }
  }, [products])

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h2 className="text-2xl font-bold">Inventario</h2>

      {/* Expiring lots alert */}
      {expiringLots && expiringLots.length > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-4 w-4" />
                {expiringLots.length} lott{expiringLots.length === 1 ? 'o' : 'i'} in scadenza entro 30 giorni
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpiringExpanded(!expiringExpanded)}
              >
                {expiringExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {expiringExpanded && (
            <CardContent className="pt-0">
              <div className="space-y-2">
                {expiringLots.map((lot) => (
                  <div key={lot.lot_id} className="flex items-center justify-between text-sm border-b border-orange-200 pb-2 last:border-0">
                    <div>
                      <span className="font-medium">{lot.product_name}</span>
                      <span className="text-muted-foreground ml-2">Lotto: {lot.lot_number}</span>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-muted-foreground">{lot.quantity_in_stock} in stock</span>
                      <span className="text-orange-700 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lot.days_until_expiry}g
                      </span>
                      <span className="text-muted-foreground">{formatDate(lot.expiry_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Prodotti totali" value={isLoading ? '...' : counts.total} icon={Package} />
        <StatCard title="Sotto scorta" value={isLoading ? '...' : counts.sotto_scorta} icon={AlertTriangle} />
        <StatCard title="In scadenza" value={isLoading ? '...' : counts.in_scadenza} icon={Clock} />
        <StatCard title="Esauriti" value={isLoading ? '...' : counts.esaurito} icon={XCircle} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(val) => setCategoryFilter(val)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tutte le categorie" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tutti gli stati" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(categoryFilter || (statusFilter && statusFilter !== 'tutti')) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setCategoryFilter(null); setStatusFilter(null) }}
          >
            Resetta
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-muted-foreground">Caricamento inventario...</p>
      ) : !filtered.length ? (
        <p className="text-muted-foreground">Nessun prodotto trovato.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Categoria</TableHead>
              <TableHead>Giacenza</TableHead>
              <TableHead className="hidden sm:table-cell">Lotti attivi</TableHead>
              <TableHead className="hidden sm:table-cell">Prossima scadenza</TableHead>
              <TableHead>Stato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow
                key={p.product_id}
                className="cursor-pointer"
                onClick={() => navigate(`/products/${p.product_id}`)}
              >
                <TableCell className="font-medium">{p.sku}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell className="hidden sm:table-cell capitalize">{p.category ?? '-'}</TableCell>
                <TableCell>{p.total_stock} {p.unit}</TableCell>
                <TableCell className="hidden sm:table-cell">{p.active_lots}</TableCell>
                <TableCell className="hidden sm:table-cell">{formatDate(p.nearest_expiry)}</TableCell>
                <TableCell>{statusBadge(p.stock_status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
