import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  useMonthlyRevenue,
  useDormantCustomers,
  useCrossSelling,
} from '@/hooks/useAnalytics'
import StatCard from '@/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign, TrendingUp, ShoppingCart } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function formatEur(n: number): string {
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Mai'
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function Analytics() {
  const [dormantDays, setDormantDays] = useState(30)

  const { data: monthlyRevenue, isLoading: loadingRevenue } = useMonthlyRevenue()
  const { data: dormant, isLoading: loadingDormant } = useDormantCustomers(dormantDays)
  const { data: crossSell, isLoading: loadingCross } = useCrossSelling()

  const totals = useMemo(() => {
    if (!monthlyRevenue || monthlyRevenue.length === 0)
      return { revenue: 0, orders: 0, ticket: 0 }
    const revenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0)
    const orders = monthlyRevenue.reduce((s, m) => s + m.num_orders, 0)
    return {
      revenue,
      orders,
      ticket: orders > 0 ? Math.round((revenue / orders) * 100) / 100 : 0,
    }
  }, [monthlyRevenue])

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Fatturato totale"
          value={loadingRevenue ? '...' : `€ ${formatEur(totals.revenue)}`}
          icon={DollarSign}
        />
        <StatCard
          title="Ordini totali"
          value={loadingRevenue ? '...' : totals.orders}
          icon={ShoppingCart}
        />
        <StatCard
          title="Ticket medio"
          value={loadingRevenue ? '...' : `€ ${formatEur(totals.ticket)}`}
          icon={TrendingUp}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trend">
        <TabsList>
          <TabsTrigger value="trend">Trend</TabsTrigger>
          <TabsTrigger value="dormienti">Dormienti</TabsTrigger>
          <TabsTrigger value="cross-selling">Cross-Selling</TabsTrigger>
        </TabsList>

        {/* Trend tab */}
        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fatturato mensile</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRevenue ? (
                <p className="text-sm text-muted-foreground">Caricamento...</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={monthlyRevenue}
                    margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
                  >
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={((value: number) => [`€ ${formatEur(value)}`, 'Fatturato']) as any}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dormienti tab */}
        <TabsContent value="dormienti">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <CardTitle className="text-base">Clienti dormienti</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="dormant-days" className="text-sm whitespace-nowrap">
                    Soglia giorni
                  </Label>
                  <Input
                    id="dormant-days"
                    type="number"
                    min={1}
                    value={dormantDays}
                    onChange={(e) => setDormantDays(Number(e.target.value) || 30)}
                    className="w-20"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDormant ? (
                <p className="text-sm text-muted-foreground">Caricamento...</p>
              ) : !dormant || dormant.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nessun cliente dormiente con questa soglia.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium">Cliente</th>
                        <th className="pb-2 font-medium">Ultimo ordine</th>
                        <th className="pb-2 font-medium text-right">Ordini</th>
                        <th className="pb-2 font-medium text-right">Media (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dormant.map((c) => (
                        <tr key={c.id} className="border-b last:border-0">
                          <td className="py-2">
                            <Link
                              to={`/customers/${c.id}`}
                              className="text-primary underline-offset-4 hover:underline"
                            >
                              {c.name}
                            </Link>
                          </td>
                          <td className="py-2">{formatDate(c.last_order_date)}</td>
                          <td className="py-2 text-right">{c.total_orders}</td>
                          <td className="py-2 text-right">{formatEur(c.avg_order_value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cross-Selling tab */}
        <TabsContent value="cross-selling">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 20 coppie di prodotti</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCross ? (
                <p className="text-sm text-muted-foreground">Caricamento...</p>
              ) : !crossSell || crossSell.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nessun dato di cross-selling disponibile.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium">Prodotto A</th>
                        <th className="pb-2 font-medium">Prodotto B</th>
                        <th className="pb-2 font-medium text-right">Volte insieme</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crossSell.map((pair, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2">{pair.product_a}</td>
                          <td className="py-2">{pair.product_b}</td>
                          <td className="py-2 text-right">{pair.times_together}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
