import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProduct, useUpdateProduct } from '@/hooks/useProducts'
import { useLots, useCreateLot } from '@/hooks/useLots'
import { useAuth } from '@/hooks/useAuth'
import QRCode from '@/components/QRCode'
import LabelPrint from '@/components/LabelPrint'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { ArrowLeft, Printer, Plus } from 'lucide-react'
import type { ProductLot } from '@/types'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, error } = useProduct(id)
  const { data: lots, isLoading: lotsLoading } = useLots(id)
  const updateProduct = useUpdateProduct()
  const createLot = useCreateLot()
  const { isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)
  const [lotDialogOpen, setLotDialogOpen] = useState(false)
  const [printLot, setPrintLot] = useState<ProductLot | null>(null)
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    unit: '',
    price: 0,
    cost_price: 0,
    supplier: '',
    description: '',
  })
  const [lotForm, setLotForm] = useState({
    lot_number: '',
    expiry_date: '',
    quantity_received: '',
    cost_price: '',
    supplier: '',
    notes: '',
  })

  function startEdit() {
    if (!product) return
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category ?? '',
      unit: product.unit,
      price: product.price,
      cost_price: product.cost_price ?? 0,
      supplier: product.supplier ?? '',
      description: product.description ?? '',
    })
    setEditing(true)
  }

  async function handleSave() {
    if (!product) return
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        name: form.name,
        sku: form.sku,
        category: form.category || null,
        unit: form.unit,
        price: form.price,
        cost_price: form.cost_price || null,
        supplier: form.supplier || null,
        description: form.description || null,
      })
      toast.success('Prodotto aggiornato')
      setEditing(false)
    } catch {
      toast.error('Errore durante il salvataggio')
    }
  }

  async function toggleActive() {
    if (!product) return
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        is_active: !product.is_active,
      })
      toast.success(product.is_active ? 'Prodotto disattivato' : 'Prodotto attivato')
    } catch {
      toast.error('Errore durante l\'aggiornamento')
    }
  }

  function openLotDialog() {
    if (!product) return
    setLotForm({
      lot_number: '',
      expiry_date: '',
      quantity_received: '',
      cost_price: '',
      supplier: product.supplier ?? '',
      notes: '',
    })
    setLotDialogOpen(true)
  }

  async function handleCreateLot(e: React.FormEvent) {
    e.preventDefault()
    if (!product) return
    if (!lotForm.lot_number || !lotForm.quantity_received) {
      toast.error('Compila i campi obbligatori: Numero lotto, Quantita ricevuta')
      return
    }
    try {
      await createLot.mutateAsync({
        sku: product.sku,
        product_id: product.id,
        lot_number: lotForm.lot_number,
        expiry_date: lotForm.expiry_date || null,
        quantity_received: parseFloat(lotForm.quantity_received),
        quantity_in_stock: parseFloat(lotForm.quantity_received),
        cost_price: lotForm.cost_price ? parseFloat(lotForm.cost_price) : null,
        supplier: lotForm.supplier || null,
        received_at: new Date().toISOString(),
        notes: lotForm.notes || null,
        is_active: true,
      })
      toast.success('Lotto creato con successo')
      setLotDialogOpen(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Errore nella creazione del lotto'
      )
    }
  }

  function getLotStatus(lot: ProductLot): { label: string; variant: 'default' | 'secondary' | 'destructive' } {
    if (lot.expiry_date && new Date(lot.expiry_date) < new Date()) {
      return { label: 'Scaduto', variant: 'destructive' }
    }
    if (lot.quantity_in_stock <= 0) {
      return { label: 'Esaurito', variant: 'secondary' }
    }
    return { label: 'Attivo', variant: 'default' }
  }

  function handlePrintLot(lot: ProductLot) {
    setPrintLot(lot)
    // Allow React to render the print area before printing
    setTimeout(() => window.print(), 100)
  }

  if (isLoading) return <div className="p-6">Caricamento...</div>
  if (error || !product) return <div className="p-6">Prodotto non trovato</div>

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate('/products')}>
        <ArrowLeft className="mr-2 size-4" /> Torna ai Prodotti
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{product.name}</span>
            {isAdmin && !editing && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={startEdit}>
                  Modifica
                </Button>
                <Button
                  size="sm"
                  variant={product.is_active ? 'destructive' : 'default'}
                  onClick={toggleActive}
                >
                  {product.is_active ? 'Disattiva' : 'Attiva'}
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="category">Categoria</Label>
                <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="unit">Unita</Label>
                <Input id="unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="price">Prezzo vendita</Label>
                <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cost_price">Prezzo acquisto</Label>
                <Input id="cost_price" type="number" step="0.01" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="supplier">Fornitore</Label>
                <Input id="supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="description">Descrizione</Label>
                <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button onClick={handleSave} disabled={updateProduct.isPending}>
                  Salva
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Annulla
                </Button>
              </div>
            </div>
          ) : (
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-muted-foreground">SKU</dt>
                <dd className="font-medium">{product.sku}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Categoria</dt>
                <dd className="font-medium">{product.category ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Unita</dt>
                <dd className="font-medium">{product.unit}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Prezzo vendita</dt>
                <dd className="font-medium">€ {product.price.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Prezzo acquisto</dt>
                <dd className="font-medium">{product.cost_price != null ? `€ ${product.cost_price.toFixed(2)}` : '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fornitore</dt>
                <dd className="font-medium">{product.supplier ?? '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Descrizione</dt>
                <dd className="font-medium">{product.description ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Stato</dt>
                <dd className="font-medium">{product.is_active ? 'Attivo' : 'Inattivo'}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      {product.barcode_data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>QR Code</span>
              <Button size="sm" variant="outline" onClick={() => { setPrintLot(null); window.print() }}>
                <Printer className="mr-2 size-4" /> Stampa etichetta
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <QRCode data={product.barcode_data} size={200} />
          </CardContent>
        </Card>
      )}

      {/* Lotti */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lotti</span>
            {isAdmin && (
              <Dialog open={lotDialogOpen} onOpenChange={setLotDialogOpen}>
                <DialogTrigger
                  render={
                    <Button size="sm" onClick={openLotDialog}>
                      <Plus className="mr-1 h-4 w-4" />
                      Nuovo Lotto
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nuovo Lotto</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateLot} className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="lot_number">Numero lotto *</Label>
                      <Input
                        id="lot_number"
                        value={lotForm.lot_number}
                        onChange={(e) => setLotForm((f) => ({ ...f, lot_number: e.target.value }))}
                        placeholder="LOT-001"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lot_expiry_date">Data di scadenza</Label>
                      <Input
                        id="lot_expiry_date"
                        type="date"
                        value={lotForm.expiry_date}
                        onChange={(e) => setLotForm((f) => ({ ...f, expiry_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lot_quantity_received">Quantita ricevuta *</Label>
                      <Input
                        id="lot_quantity_received"
                        type="number"
                        step="0.01"
                        min="0"
                        value={lotForm.quantity_received}
                        onChange={(e) => setLotForm((f) => ({ ...f, quantity_received: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lot_cost_price">Prezzo acquisto</Label>
                      <Input
                        id="lot_cost_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={lotForm.cost_price}
                        onChange={(e) => setLotForm((f) => ({ ...f, cost_price: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lot_supplier">Fornitore</Label>
                      <Input
                        id="lot_supplier"
                        value={lotForm.supplier}
                        onChange={(e) => setLotForm((f) => ({ ...f, supplier: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lot_notes">Note</Label>
                      <Input
                        id="lot_notes"
                        value={lotForm.notes}
                        onChange={(e) => setLotForm((f) => ({ ...f, notes: e.target.value }))}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createLot.isPending}>
                        {createLot.isPending ? 'Creazione...' : 'Crea Lotto'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lotsLoading ? (
            <p className="text-muted-foreground">Caricamento lotti...</p>
          ) : !lots?.length ? (
            <p className="text-muted-foreground">Nessun lotto registrato.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lotto</TableHead>
                  <TableHead className="hidden sm:table-cell">Ricevuto</TableHead>
                  <TableHead className="hidden sm:table-cell">Scadenza</TableHead>
                  <TableHead>Qta</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lots.map((lot) => {
                  const status = getLotStatus(lot)
                  return (
                    <TableRow key={lot.id}>
                      <TableCell className="font-medium">{lot.lot_number}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {new Date(lot.received_at).toLocaleDateString('it-IT')}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {lot.expiry_date
                          ? new Date(lot.expiry_date).toLocaleDateString('it-IT')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {lot.quantity_in_stock} / {lot.quantity_received}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintLot(lot)}
                        >
                          <Printer className="mr-1 size-3" /> QR
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Hidden print area */}
      <div className="print-area hidden print:block">
        <LabelPrint product={product} lot={printLot ?? undefined} />
      </div>
    </div>
  )
}
