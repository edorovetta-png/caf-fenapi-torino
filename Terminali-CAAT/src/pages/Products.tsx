import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts, useCreateProduct } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'

const CATEGORIES = [
  { value: 'bevande', label: 'Bevande' },
  { value: 'secchi', label: 'Secchi' },
  { value: 'freschi', label: 'Freschi' },
  { value: 'surgelati', label: 'Surgelati' },
  { value: 'condimenti', label: 'Condimenti' },
  { value: 'altro', label: 'Altro' },
]

const UNITS = [
  { value: 'pz', label: 'Pezzo (pz)' },
  { value: 'kg', label: 'Chilogrammo (kg)' },
  { value: 'lt', label: 'Litro (lt)' },
  { value: 'cartone', label: 'Cartone' },
]

export default function Products() {
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: products, isLoading } = useProducts({
    search: search || undefined,
    category: categoryFilter || undefined,
  })

  const createProduct = useCreateProduct()

  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    unit: 'pz',
    price: '',
    cost_price: '',
    supplier: '',
  })

  function resetForm() {
    setForm({
      sku: '',
      name: '',
      description: '',
      category: '',
      unit: 'pz',
      price: '',
      cost_price: '',
      supplier: '',
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.sku || !form.name || !form.price) {
      toast.error('Compila i campi obbligatori: SKU, Nome, Prezzo vendita')
      return
    }
    try {
      await createProduct.mutateAsync({
        sku: form.sku,
        name: form.name,
        description: form.description || null,
        category: form.category || null,
        unit: form.unit,
        price: parseFloat(form.price),
        cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
        supplier: form.supplier || null,
        vat_rate: 22,
        min_stock: 0,
        is_active: true,
      })
      toast.success('Prodotto creato con successo')
      resetForm()
      setDialogOpen(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Errore nella creazione del prodotto'
      )
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Prodotti</h2>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Nuovo Prodotto
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuovo Prodotto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={form.sku}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sku: e.target.value }))
                    }
                    placeholder="ES001"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Nome prodotto"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="description">Descrizione</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Categoria</Label>
                  <Select
                    value={form.category || null}
                    onValueChange={(val) =>
                      setForm((f) => ({ ...f, category: val ?? '' }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Unita</Label>
                  <Select
                    value={form.unit}
                    onValueChange={(val) =>
                      setForm((f) => ({ ...f, unit: val ?? 'pz' }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona unita" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="price">Prezzo vendita *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, price: e.target.value }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cost_price">Prezzo acquisto</Label>
                    <Input
                      id="cost_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.cost_price}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, cost_price: e.target.value }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="supplier">Fornitore</Label>
                  <Input
                    id="supplier"
                    value={form.supplier}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, supplier: e.target.value }))
                    }
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createProduct.isPending}
                  >
                    {createProduct.isPending ? 'Creazione...' : 'Crea Prodotto'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
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
        {categoryFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCategoryFilter(null)}
          >
            Resetta
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-muted-foreground">Caricamento prodotti...</p>
      ) : !products?.length ? (
        <p className="text-muted-foreground">Nessun prodotto trovato.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Categoria</TableHead>
              <TableHead className="hidden sm:table-cell">Prezzo</TableHead>
              <TableHead>Stato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Link
                    to={`/products/${product.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {product.sku}
                  </Link>
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell className="hidden sm:table-cell capitalize">
                  {product.category ?? '-'}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {product.price.toFixed(2)} &euro;
                </TableCell>
                <TableCell>
                  <Badge
                    variant={product.is_active ? 'default' : 'secondary'}
                  >
                    {product.is_active ? 'Attivo' : 'Disattivo'}
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
