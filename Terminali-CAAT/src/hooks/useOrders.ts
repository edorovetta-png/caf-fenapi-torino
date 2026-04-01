import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  Order,
  OrderWithCustomer,
  OrderItemWithProduct,
  OrderStatus,
  PickingScan,
} from '@/types'

/**
 * Returns the last price a customer paid for a product,
 * or null if they never bought it.
 */
export async function getLastPriceForCustomer(
  customerId: string,
  productId: string,
): Promise<number | null> {
  const { data } = await supabase
    .from('order_items')
    .select('unit_price, order:orders!inner(customer_id, status)')
    .eq('product_id', productId)
    .eq('order.customer_id', customerId)
    .in('order.status', ['confirmed', 'exported', 'completed'])
    .order('created_at', { ascending: false })
    .limit(1)

  if (data && data.length > 0) {
    return Number(data[0].unit_price)
  }
  return null
}

interface OrderFilters {
  status?: OrderStatus
  customer_id?: string
  from?: string
  to?: string
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
        .select('*, product:products(*), lot:product_lots(*)')
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
          status: 'draft' as OrderStatus,
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
      quantity_ordered: number
      unit_price: number
      vat_rate: number
    }) => {
      const line_total = input.quantity_ordered * input.unit_price
      const line_total_vat = line_total * (1 + input.vat_rate / 100)
      const { data, error } = await supabase
        .from('order_items')
        .insert({
          order_id: input.order_id,
          product_id: input.product_id,
          quantity_ordered: input.quantity_ordered,
          unit_price: input.unit_price,
          line_total,
          vat_rate: input.vat_rate,
          line_total_vat,
        })
        .select('*, product:products(*), lot:product_lots(*)')
        .single()
      if (error) throw error
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
      quantity_ordered: number
      unit_price: number
      vat_rate: number
    }) => {
      const line_total = input.quantity_ordered * input.unit_price
      const line_total_vat = line_total * (1 + input.vat_rate / 100)
      const { data, error } = await supabase
        .from('order_items')
        .update({
          quantity_ordered: input.quantity_ordered,
          unit_price: input.unit_price,
          line_total,
          vat_rate: input.vat_rate,
          line_total_vat,
        })
        .eq('id', input.id)
        .select('*, product:products(*), lot:product_lots(*)')
        .single()
      if (error) throw error
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

export function usePickingScans(orderId: string | undefined) {
  return useQuery({
    queryKey: ['picking_scans', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('picking_scans')
        .select('*')
        .eq('order_id', orderId!)
        .order('scanned_at', { ascending: false })
      if (error) throw error
      return data as PickingScan[]
    },
    enabled: !!orderId,
  })
}

export function useAddPickingScan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      order_id: string
      order_item_id: string
      lot_id: string
      product_id: string
      quantity: number
      new_quantity_picked: number
      quantity_ordered: number
    }) => {
      // 1. Insert picking_scan record
      const { data: scan, error: scanError } = await supabase
        .from('picking_scans')
        .insert({
          order_id: input.order_id,
          order_item_id: input.order_item_id,
          lot_id: input.lot_id,
          product_id: input.product_id,
          quantity: input.quantity,
        })
        .select()
        .single()
      if (scanError) throw scanError

      // 2. Update order_item: quantity_picked, lot_id, picked status
      const picked = input.new_quantity_picked >= input.quantity_ordered
      const { error: itemError } = await supabase
        .from('order_items')
        .update({
          quantity_picked: input.new_quantity_picked,
          lot_id: input.lot_id,
          picked,
        })
        .eq('id', input.order_item_id)
      if (itemError) throw itemError

      return scan as PickingScan
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['picking_scans', variables.order_id] })
      queryClient.invalidateQueries({ queryKey: ['order_items', variables.order_id] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
