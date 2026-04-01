import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard, Package, Users, ShoppingCart, ScanLine, BarChart3, LogOut,
} from 'lucide-react'

const adminLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scan', label: 'Scanner', icon: ScanLine },
  { to: '/orders', label: 'Ordini', icon: ShoppingCart },
  { to: '/products', label: 'Prodotti', icon: Package },
  { to: '/customers', label: 'Clienti', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

const operatorLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scan', label: 'Scanner', icon: ScanLine },
  { to: '/orders', label: 'Ordini', icon: ShoppingCart },
  { to: '/products', label: 'Prodotti', icon: Package },
]

export default function Layout() {
  const { isAdmin, profile, logout } = useAuth()
  const location = useLocation()
  const links = isAdmin ? adminLinks : operatorLinks

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col border-r bg-white">
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg">Magazzino QR</h1>
          <p className="text-xs text-muted-foreground">{profile?.display_name}</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const active = location.pathname === link.to
            return (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}>
                <Icon className="h-4 w-4" />{link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-2 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={logout}>
            <LogOut className="h-4 w-4" />Esci
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">
        {links.map((link) => {
          const Icon = link.icon
          const active = location.pathname === link.to
          return (
            <Link key={link.to} to={link.to}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}>
              <Icon className="h-5 w-5" />{link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
