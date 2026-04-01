import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useCustomer, useUpdateCustomer } from '@/hooks/useCustomers'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import type { Order } from '@/types'

const CATEGORIES = [
  { value: 'ristorante', label: 'Ristorante' },
  { value: 'bar', label: 'Bar' },
  { value: 'privato', label: 'Privato' },
  { value: 'rivendita', label: 'Rivendita' },
  { value: 'altro', label: 'Altro' },
]

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: customer, isLoading, error } = useCustomer(id)
  const updateCustomer = useUpdateCustomer()
  const { isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    notes: '',
  })

  const { data: orders } = useQuery({
    queryKey: ['customer-orders', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', id!)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data as Order[]
    },
    enabled: !!id,
  })

  function startEdit() {
    if (!customer) return
    setForm({
      name: customer.name,
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      category: customer.category ?? '',
      notes: customer.notes ?? '',
    })
    setEditing(true)
  }

  async function handleSave() {
    if (!customer) return
    if (!form.name.trim()) {
      toast.error('Il nome e obbligatorio')
      return
    }
    try {
      await updateCustomer.mutateAsync({
        id: customer.id,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        category: form.category || null,
        notes: form.notes.trim() || null,
      })
      toast.success('Cliente aggiornato')
      setEditing(false)
    } catch {
      toast.error('Errore durante il salvataggio')
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (isLoading) return <div className="p-6">Caricamento...</div>
  if (error || !customer) return <div className="p-6">Cliente non trovato</div>

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate('/customers')}>
        <ArrowLeft className="mr-2 size-4" /> Torna ai Clienti
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{customer.name}</span>
            {isAdmin && !editing && (
              <Button size="sm" variant="outline" onClick={startEdit}>
                Modifica
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="name">Nome (ragione sociale) *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address">Indirizzo</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Categoria</Label>
                <Select
                  value={form.category || null}
                  onValueChange={(val) =>
                    setForm({ ...form, category: val ?? '' })
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
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button onClick={handleSave} disabled={updateCustomer.isPending}>
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
                <dt className="text-muted-foreground">Categoria</dt>
                <dd className="font-medium capitalize">{customer.category ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{customer.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Telefono</dt>
                <dd className="font-medium">{customer.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Indirizzo</dt>
                <dd className="font-medium">{customer.address ?? '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Note</dt>
                <dd className="font-medium">{customer.notes ?? '—'}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ultimi Ordini</CardTitle>
        </CardHeader>
        <CardContent>
          {!orders?.length ? (
            <p className="text-sm text-muted-foreground">Nessun ordine per questo cliente.</p>
          ) : (
            <ul className="divide-y">
              {orders.map((order) => (
                <li key={order.id} className="py-2">
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex items-center justify-between text-sm hover:underline underline-offset-4"
                  >
                    <span className="font-medium text-primary">
                      #{order.order_number}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDate(order.created_at)}
                    </span>
                    <span className="font-medium">
                      {order.total_amount.toFixed(2)} &euro;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
