import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { encodeQRData } from '@/lib/qr'
import type { ProductLot, ProductStock, ExpiringLot } from '@/types'

export function useLots(productId: string | undefined) {
  return useQuery({
    queryKey: ['lots', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_lots')
        .select('*')
        .eq('product_id', productId!)
        .order('received_at', { ascending: false })
      if (error) throw error
      return data as ProductLot[]
    },
    enabled: !!productId,
  })
}

export function useActiveLots(productId: string | undefined) {
  return useQuery({
    queryKey: ['lots', productId, 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_lots')
        .select('*')
        .eq('product_id', productId!)
        .eq('is_active', true)
        .gt('quantity_in_stock', 0)
        .order('expiry_date', { ascending: true })
      if (error) throw error
      return data as ProductLot[]
    },
    enabled: !!productId,
  })
}

export function useLot(lotId: string | undefined) {
  return useQuery({
    queryKey: ['lot', lotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_lots')
        .select('*')
        .eq('id', lotId!)
        .single()
      if (error) throw error
      return data as ProductLot
    },
    enabled: !!lotId,
  })
}

export function useCreateLot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      sku,
      ...lot
    }: Omit<ProductLot, 'id' | 'qr_data' | 'created_at' | 'updated_at'> & {
      sku: string
    }) => {
      const { data, error } = await supabase
        .from('product_lots')
        .insert(lot)
        .select()
        .single()
      if (error) throw error
      const qr_data = encodeQRData(sku, data.product_id, data.id)
      const { data: updated, error: updateError } = await supabase
        .from('product_lots')
        .update({ qr_data })
        .eq('id', data.id)
        .select()
        .single()
      if (updateError) throw updateError
      return updated as ProductLot
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lots', data.product_id] })
    },
  })
}

/**
 * Fetches the recommended lot (FEFO — earliest expiry with sufficient stock)
 * for each product ID. Returns a Map<productId, ProductLot>.
 */
export function useRecommendedLots(productIds: string[]) {
  return useQuery({
    queryKey: ['lots', 'recommended', productIds],
    queryFn: async () => {
      if (!productIds.length) return new Map<string, ProductLot>()
      const { data, error } = await supabase
        .from('product_lots')
        .select('*')
        .in('product_id', productIds)
        .eq('is_active', true)
        .gt('quantity_in_stock', 0)
        .order('expiry_date', { ascending: true, nullsFirst: false })
      if (error) throw error
      // Pick the first lot per product (earliest expiry)
      const map = new Map<string, ProductLot>()
      for (const lot of (data as ProductLot[])) {
        if (!map.has(lot.product_id)) {
          map.set(lot.product_id, lot)
        }
      }
      return map
    },
    enabled: productIds.length > 0,
  })
}

export function useProductStock() {
  return useQuery({
    queryKey: ['product_stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_stock')
        .select('*')
      if (error) throw error
      return data as ProductStock[]
    },
  })
}

export function useExpiringLots() {
  return useQuery({
    queryKey: ['expiring_lots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expiring_lots')
        .select('*')
      if (error) throw error
      return data as ExpiringLot[]
    },
  })
}
