import { createClient } from '@supabase/supabase-js'

// Supabase client for client-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Database helper functions
export const db = {
  // Get available time slots for a specific barber and service
  async getAvailableSlots(tenantId, staffId, serviceId, date) {
    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_tenant_id: tenantId,
        p_staff_id: staffId,
        p_service_id: serviceId,
        p_date: date
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get tenant data by slug
  async getTenant(slug) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .single()
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get staff members for a tenant
  async getStaff(tenantId) {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select(`
          *,
          staff_services (
            service_id,
            duration_minutes_override,
            price_cents_override,
            services (*)
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('active', true)
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get services for a tenant
  async getServices(tenantId) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('active', true)
        .order('name')
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Create appointment
  async createAppointment(appointmentData) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select('*')
        .single()
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Create or get customer
  async upsertCustomer(customerData) {
    try {
      // Try to find existing customer by phone or email
      const { data: existing, error: findError } = await supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', customerData.tenant_id)
        .or(`phone.eq.${customerData.phone},email.eq.${customerData.email}`)
        .maybeSingle()

      if (existing) {
        // Update existing customer
        const { data, error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', existing.id)
          .select('*')
          .single()
        
        return { data, error }
      } else {
        // Create new customer
        const { data, error } = await supabase
          .from('customers')
          .insert([customerData])
          .select('*')
          .single()
        
        return { data, error }
      }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Utility functions
export const formatPrice = (priceCents) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(priceCents / 100)
}

export const formatTime = (timeString) => {
  return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}