import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  Order,
  OrderWithCustomer,
  OrderItemWithProduct,
  OrderStatus,
} from '@/types'

interface OrderFilters {
  status?: OrderStatus
  customer_id?: string
  from?: string
  to?: string
}

async function recalculateOrderTotal(orderId: string) {
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('line_total')
    .eq('order_id', orderId)
  if (itemsError) throw itemsError
  const total_amount = (items ?? []).reduce((sum, i) => sum + i.line_total, 0)
  const { error } = await supabase
    .from('orders')
    .update({ total_amount })
    .eq('id', orderId)
  if (error) throw error
}

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*, customer:customers(*)')
        .order('created_at', { ascending: false })
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.customer_id) query = query.eq('customer_id', filters.customer_id)
      if (filters?.from) query = query.gte('created_at', filters.from)
      if (filters?.to) query = query.lte('created_at', filters.to)
      const { data, error } = await query
      if (error) throw error
      return data as OrderWithCustomer[]
    },
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:customers(*)')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as OrderWithCustomer
    },
    enabled: !!id,
  })
}

export function useOrderItems(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order_items', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, product:products(*)')
        .eq('order_id', orderId!)
        .order('created_at')
      if (error) throw error
      return data as OrderItemWithProduct[]
    },
    enabled: !!orderId,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      customer_id: string
      created_by: string
      notes?: string | null
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_id: input.customer_id,
          created_by: input.created_by,
          status: 'bozza' as OrderStatus,
          notes: input.notes ?? null,
          total_amount: 0,
        })
        .select()
        .single()
      if (error) throw error
      return data as Order
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useAddOrderItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      order_id: string
      product_id: string
      quantity: number
      unit_price: number
    }) => {
      const line_total = input.quantity * input.unit_price
      const { data, error } = await supabase
        .from('order_items')
        .insert({
          order_id: input.order_id,
          product_id: input.product_id,
          quantity: input.quantity,
          unit_price: input.unit_price,
          line_total,
        })
        .select('*, product:products(*)')
        .single()
      if (error) throw error
      await recalculateOrderTotal(input.order_id)
      return data as OrderItemWithProduct
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order_items', variables.order_id] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useUpdateOrderItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      order_id: string
      quantity: number
      unit_price: number
    }) => {
      const line_total = input.quantity * input.unit_price
      const { data, error } = await supabase
        .from('order_items')
        .update({ quantity: input.quantity, unit_price: input.unit_price, line_total })
        .eq('id', input.id)
        .select('*, product:products(*)')
        .single()
      if (error) throw error
      await recalculateOrderTotal(input.order_id)
      return data as OrderItemWithProduct
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order_items', variables.order_id] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useDeleteOrderItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; order_id: string }) => {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', input.id)
      if (error) throw error
      await recalculateOrderTotal(input.order_id)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order_items', variables.order_id] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      status: OrderStatus
      notes?: string | null
    }) => {
      const updates: Record<string, unknown> = { status: input.status }
      if (input.notes !== undefined) updates.notes = input.notes
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', input.id)
        .select('*, customer:customers(*)')
        .single()
      if (error) throw error
      return data as OrderWithCustomer
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', data.id] })
    },
  })
}
