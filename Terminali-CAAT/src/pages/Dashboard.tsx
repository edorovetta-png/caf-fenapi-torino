import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Package, Users, FileText, ScanLine, Plus } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const ITALIAN_DAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

interface StatsResult {
  ordersToday: number
  bozze: number
  activeProducts: number
  customers: number
}

interface ChartDay {
  day: string
  ordini: number
}

async function fetchStats(isAdmin: boolean): Promise<StatsResult> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const queries: [
    Promise<{ count: number | null; error: unknown }>,
    Promise<{ count: number | null; error: unknown }>,
    Promise<{ count: number | null; error: unknown }>,
    Promise<{ count: number | null; error: unknown }>,
  ] = [
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'bozza'),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    isAdmin
      ? supabase.from('customers').select('*', { count: 'exact', head: true })
      : Promise.resolve({ count: null, error: null }),
  ]

  const [ordersToday, bozze, activeProducts, customers] = await Promise.all(queries)

  return {
    ordersToday: ordersToday.count ?? 0,
    bozze: bozze.count ?? 0,
    activeProducts: activeProducts.count ?? 0,
    customers: customers.count ?? 0,
  }
}

async function fetchWeeklyChart(): Promise<ChartDay[]> {
  const days: ChartDay[] = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const start = d.toISOString()
    const end = new Date(d)
    end.setDate(d.getDate() + 1)
    const endISO = end.toISOString()

    days.push({
      day: ITALIAN_DAYS[d.getDay()],
      start,
      end: endISO,
    } as ChartDay & { start: string; end: string })
  }

  const results = await Promise.all(
    (days as (ChartDay & { start: string; end: string })[]).map(({ start, end }) =>
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['confermato', 'evaso'])
        .gte('created_at', start)
        .lt('created_at', end)
    )
  )

  return days.map((d, i) => ({
    day: d.day,
    ordini: results[i].count ?? 0,
  }))
}

export default function Dashboard() {
  const { profile, isAdmin } = useAuth()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', isAdmin],
    queryFn: () => fetchStats(isAdmin),
  })

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard-weekly-chart'],
    queryFn: fetchWeeklyChart,
    enabled: isAdmin,
  })

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        {profile?.display_name && (
          <p className="text-muted-foreground mt-1">Ciao, {profile.display_name}</p>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link to="/scan">
          <Button>
            <ScanLine className="mr-2 h-4 w-4" />
            Scanner
          </Button>
        </Link>
        <Link to="/orders/new">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Ordine
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Ordini oggi"
          value={statsLoading ? '...' : (stats?.ordersToday ?? 0)}
          icon={ShoppingCart}
        />
        <StatCard
          title="Bozze"
          value={statsLoading ? '...' : (stats?.bozze ?? 0)}
          icon={FileText}
        />
        <StatCard
          title="Prodotti attivi"
          value={statsLoading ? '...' : (stats?.activeProducts ?? 0)}
          icon={Package}
        />
        {isAdmin && (
          <StatCard
            title="Clienti"
            value={statsLoading ? '...' : (stats?.customers ?? 0)}
            icon={Users}
          />
        )}
      </div>

      {/* Weekly chart (admin only) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ordini ultimi 7 giorni</CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <p className="text-sm text-muted-foreground">Caricamento...</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="ordini" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
