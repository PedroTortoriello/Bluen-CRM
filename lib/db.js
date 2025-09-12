import { supabaseAdmin } from "./supabaseAdmin"

// Database helper functions
export const db = {
  async getAvailableSlots(tenantId, staffId, serviceId, date) {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_available_slots', {
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

  async getTenant(slug) {
    try {
      const { data, error } = await supabaseAdmin
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

    // --- Nova função para criar staff ---
async createStaff({ name, email, password, tenantSlug }) {
  try {
    if (!tenantSlug) throw new Error('TenantSlug não fornecido')

    // 1. Busca tenant pelo slug
    const { data: tenantData, error: tenantError } = await this.getTenant(tenantSlug)
    if (tenantError) throw tenantError
    if (!tenantData) throw new Error('Tenant não encontrado')

    // 2. Cria usuário no supabaseAdmin Auth (Service Role Key necessária)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError) throw authError

    // 3. Insere staff na tabela
const { data, error } = await supabaseAdmin
  .from('staff')
  .insert([
    {
      name,
      tenant_id: tenantData.id,
      auth_id: authUser.id,
      active: true
    }
  ])
  .select('*')

if (error) throw error

// Pega o primeiro registro do array
const staff = data[0]
return { data: staff, error: null }

  } catch (error) {
    return { data: null, error }
  }
},



  async getStaff(tenantId) {
    try {
const { data, error } = await supabaseAdmin
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

  async getServices(tenantId) {
    try {
      const { data, error } = await supabaseAdmin
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

  async createAppointment(appointmentData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('appointments')
        .insert([appointmentData])
        .select('*')
        .single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async upsertCustomer(customerData) {
    try {
      const { data: existing, error: findError } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('tenant_id', customerData.tenant_id)
        .or(`phone.eq.${customerData.phone},email.eq.${customerData.email}`)
        .maybeSingle()

      if (existing) {
        const { data, error } = await supabaseAdmin
          .from('customers')
          .update(customerData)
          .eq('id', existing.id)
          .select('*')
          .single()
        return { data, error }
      } else {
        const { data, error } = await supabaseAdmin
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
