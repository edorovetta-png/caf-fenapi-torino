import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Login from '@/pages/Login'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Products = lazy(() => import('@/pages/Products'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail'))
const Customers = lazy(() => import('@/pages/Customers'))
const CustomerDetail = lazy(() => import('@/pages/CustomerDetail'))
const Scanner = lazy(() => import('@/pages/Scanner'))
const OrderNew = lazy(() => import('@/pages/OrderNew'))
const Orders = lazy(() => import('@/pages/Orders'))
const OrderDetail = lazy(() => import('@/pages/OrderDetail'))
const Analytics = lazy(() => import('@/pages/Analytics'))
const Inventory = lazy(() => import('@/pages/Inventory'))
const Picking = lazy(() => import('@/pages/Picking'))

function Loading() {
  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-muted-foreground">Caricamento...</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="scan" element={<Scanner />} />
            <Route path="orders/new" element={<OrderNew />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="orders/:id/picking" element={<Picking />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="analytics" element={<ProtectedRoute requiredRole="admin"><Analytics /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
