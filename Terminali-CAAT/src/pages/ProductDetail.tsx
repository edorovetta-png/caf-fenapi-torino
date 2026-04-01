import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProduct, useUpdateProduct } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import QRCode from '@/components/QRCode'
import LabelPrint from '@/components/LabelPrint'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Printer } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, error } = useProduct(id)
  const updateProduct = useUpdateProduct()
  const { isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)
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
                <Label htmlFor="unit">Unità</Label>
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
                <dt className="text-muted-foreground">Unità</dt>
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
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 size-4" /> Stampa etichetta
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <QRCode data={product.barcode_data} size={200} />
          </CardContent>
        </Card>
      )}

      {/* Hidden print area */}
      <div className="print-area hidden print:block">
        <LabelPrint product={product} />
      </div>
    </div>
  )
}
