import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCustomers, useCreateCustomer } from '@/hooks/useCustomers'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  { value: 'ristorante', label: 'Ristorante' },
  { value: 'bar', label: 'Bar' },
  { value: 'privato', label: 'Privato' },
  { value: 'rivendita', label: 'Rivendita' },
  { value: 'altro', label: 'Altro' },
]

export default function Customers() {
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: customers, isLoading } = useCustomers(search || undefined)
  const createCustomer = useCreateCustomer()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    notes: '',
  })

  function resetForm() {
    setForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      category: '',
      notes: '',
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Il nome (ragione sociale) e obbligatorio')
      return
    }
    try {
      await createCustomer.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        category: form.category || null,
        notes: form.notes.trim() || null,
      })
      toast.success('Cliente creato con successo')
      resetForm()
      setDialogOpen(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Errore nella creazione del cliente'
      )
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clienti</h2>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Nuovo Cliente
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuovo Cliente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Nome (ragione sociale) *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Es. Ristorante Da Mario"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="email@esempio.it"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="+39 ..."
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="address">Indirizzo</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
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
                  <Label htmlFor="notes">Note</Label>
                  <Input
                    id="notes"
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createCustomer.isPending}
                  >
                    {createCustomer.isPending ? 'Creazione...' : 'Crea Cliente'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome o telefono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-muted-foreground">Caricamento clienti...</p>
      ) : !customers?.length ? (
        <p className="text-muted-foreground">
          Nessun cliente trovato. {isAdmin && 'Clicca "Nuovo Cliente" per aggiungerne uno.'}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Categoria</TableHead>
              <TableHead className="hidden sm:table-cell">Telefono</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Link
                    to={`/customers/${customer.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell capitalize">
                  {customer.category ?? '-'}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {customer.phone ?? '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
