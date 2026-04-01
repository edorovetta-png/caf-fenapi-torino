import { useQuery } from '@tanstack/react-query'
import {
  fetchTopProductsForCustomer,
  fetchCustomerStats,
  fetchDormantCustomers,
  fetchMonthlyRevenue,
  fetchCrossSelling,
} from '@/lib/analytics'

export function useTopProducts(customerId: string | undefined) {
  return useQuery({
    queryKey: ['analytics', 'top-products', customerId],
    queryFn: () => fetchTopProductsForCustomer(customerId!),
    enabled: !!customerId,
  })
}

export function useCustomerStats(customerId: string | undefined) {
  return useQuery({
    queryKey: ['analytics', 'customer-stats', customerId],
    queryFn: () => fetchCustomerStats(customerId!),
    enabled: !!customerId,
  })
}

export function useDormantCustomers(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'dormant', days],
    queryFn: () => fetchDormantCustomers(days),
  })
}

export function useMonthlyRevenue() {
  return useQuery({
    queryKey: ['analytics', 'monthly-revenue'],
    queryFn: fetchMonthlyRevenue,
  })
}

export function useCrossSelling() {
  return useQuery({
    queryKey: ['analytics', 'cross-selling'],
    queryFn: fetchCrossSelling,
  })
}
