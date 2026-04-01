import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Customer } from '@/types'

export function useCustomers(search?: string) {
  return useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      let query = supabase.from('customers').select('*').order('name')
      if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
      const { data, error } = await query
      if (error) throw error
      return data as Customer[]
    },
  })
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*').eq('id', id!).single()
      if (error) throw error
      return data as Customer
    },
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('customers').insert(customer).select().single()
      if (error) throw error
      return data as Customer
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Customer> & { id: string }) => {
      const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data as Customer
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customers', data.id] })
    },
  })
}
