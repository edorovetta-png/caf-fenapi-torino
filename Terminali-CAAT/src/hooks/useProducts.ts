import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { encodeQRData } from '@/lib/qr'
import type { Product } from '@/types'

export function useProducts(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase.from('products').select('*').order('name')
      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.search) {
        // Remove characters that could inject PostgREST filter syntax
        const safe = filters.search.replace(/[,().]/g, '')
        if (safe) {
          query = query.or(`name.ilike.%${safe}%,sku.ilike.%${safe}%`)
        }
      }
      const { data, error } = await query
      if (error) throw error
      return data as Product[]
    },
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Product
    },
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      product: Omit<Product, 'id' | 'barcode_data' | 'created_at' | 'updated_at'>
    ) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()
      if (error) throw error
      const barcode_data = encodeQRData(data.sku, data.id)
      const { data: updated, error: updateError } = await supabase
        .from('products')
        .update({ barcode_data })
        .eq('id', data.id)
        .select()
        .single()
      if (updateError) throw updateError
      return updated as Product
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Product
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', data.id] })
    },
  })
}
