import { NextResponse } from 'next/server'
import { supabaseAdmin, db } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// Handle CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

// GET /api/tenants/[slug] - Get tenant data
// GET /api/tenants/[slug]/services - Get services for tenant
// GET /api/tenants/[slug]/staff - Get staff for tenant
// GET /api/tenants/[slug]/availability - Get available slots
// POST /api/tenants/[slug]/appointments - Create appointment
export async function GET(request, { params }) {
  try {
    const url = new URL(request.url)
    const pathSegments = params.path || []
    const [resource, identifier, subResource] = pathSegments

    if (resource === 'tenants' && identifier) {
      const tenantSlug = identifier

      if (!subResource) {
        // Get tenant data
        const { data: tenant, error } = await db.getTenant(tenantSlug)
        if (error || !tenant) {
          return NextResponse.json({ error: 'Tenant not found' }, { status: 404, headers: corsHeaders })
        }
        return NextResponse.json({ tenant }, { headers: corsHeaders })
      }

      // Get tenant first to validate
      const { data: tenant, error: tenantError } = await db.getTenant(tenantSlug)
      if (tenantError || !tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404, headers: corsHeaders })
      }

      switch (subResource) {
        case 'services':
          const { data: services, error: servicesError } = await db.getServices(tenant.id)
          if (servicesError) {
            return NextResponse.json({ error: servicesError.message }, { status: 500, headers: corsHeaders })
          }
          return NextResponse.json({ services }, { headers: corsHeaders })

        case 'staff':
          const { data: staff, error: staffError } = await db.getStaff(tenant.id)
          if (staffError) {
            return NextResponse.json({ error: staffError.message }, { status: 500, headers: corsHeaders })
          }
          return NextResponse.json({ staff }, { headers: corsHeaders })

        case 'availability':
          const staffId = url.searchParams.get('staff_id')
          const serviceId = url.searchParams.get('service_id')
          const date = url.searchParams.get('date')

          if (!staffId || !serviceId || !date) {
            return NextResponse.json(
              { error: 'Missing required parameters: staff_id, service_id, date' },
              { status: 400, headers: corsHeaders }
            )
          }

          const { data: slots, error: slotsError } = await getAvailableSlots(tenant.id, staffId, serviceId, date)
          if (slotsError) {
            return NextResponse.json({ error: slotsError.message }, { status: 500, headers: corsHeaders })
          }
          return NextResponse.json({ slots }, { headers: corsHeaders })

        default:
          return NextResponse.json({ error: 'Resource not found' }, { status: 404, headers: corsHeaders })
      }
    }

    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404, headers: corsHeaders })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(request, { params }) {
  try {
    const pathSegments = params.path || []
    const [resource, identifier, subResource] = pathSegments

    if (resource === 'tenants' && identifier && subResource === 'appointments') {
      const tenantSlug = identifier
      const body = await request.json()

      // Get tenant
      const { data: tenant, error: tenantError } = await db.getTenant(tenantSlug)
      if (tenantError || !tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404, headers: corsHeaders })
      }

      // Validate required fields
      const { staffId, serviceId, startTime, endTime, customerData } = body
      if (!staffId || !serviceId || !startTime || !endTime || !customerData) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400, headers: corsHeaders }
        )
      }

      // Create or get customer
      const customerRecord = {
        id: uuidv4(),
        tenant_id: tenant.id,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        created_at: new Date().toISOString()
      }

      const { data: customer, error: customerError } = await db.upsertCustomer(customerRecord)
      if (customerError || !customer) {
        return NextResponse.json(
          { error: 'Failed to create customer' },
          { status: 500, headers: corsHeaders }
        )
      }

      // Create appointment
      const appointmentData = {
        id: uuidv4(),
        tenant_id: tenant.id,
        staff_id: staffId,
        service_id: serviceId,
        customer_id: customer.id,
        start_time: startTime,
        end_time: endTime,
        status: 'confirmed',
        source: 'online',
        notes: customerData.notes || '',
        created_at: new Date().toISOString()
      }

      const { data: appointment, error: appointmentError } = await db.createAppointment(appointmentData)
      if (appointmentError || !appointment) {
        return NextResponse.json(
          { error: 'Failed to create appointment' },
          { status: 500, headers: corsHeaders }
        )
      }

      return NextResponse.json({ 
        appointment,
        customer,
        message: 'Appointment created successfully'
      }, { headers: corsHeaders })
    }

    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404, headers: corsHeaders })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

// Availability calculation function
async function getAvailableSlots(tenantId, staffId, serviceId, date) {
  try {
    // Get service details
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('*, staff_services(*)')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      return { data: null, error: new Error('Service not found') }
    }

    // Get staff working hours for the date
    const dayOfWeek = new Date(date).getDay()
    const { data: availability, error: availError } = await supabaseAdmin
      .from('availability_rules')
      .select('*')
      .eq('staff_id', staffId)
      .eq('day_of_week', dayOfWeek)
      .eq('active', true)

    if (availError || !availability || availability.length === 0) {
      return { data: [], error: null } // No availability for this day
    }

    // Get existing appointments for the date
    const { data: appointments, error: appointError } = await supabaseAdmin
      .from('appointments')
      .select('start_time, end_time')
      .eq('staff_id', staffId)
      .eq('status', 'confirmed')
      .gte('start_time', `${date}T00:00:00`)
      .lt('start_time', `${date}T23:59:59`)

    if (appointError) {
      return { data: null, error: appointError }
    }

    // Get service duration (check for staff override first)
    const staffService = service.staff_services?.find(ss => ss.staff_id === staffId)
    const serviceDuration = staffService?.duration_minutes_override || service.duration_minutes
    const servicePrice = staffService?.price_cents_override || service.price_cents

    // Calculate available slots
    const slots = []
    const workingHours = availability[0] // Assuming one working period per day

    // Generate 15-minute slots within working hours
    const startHour = parseInt(workingHours.start_time.split(':')[0])
    const startMinute = parseInt(workingHours.start_time.split(':')[1])
    const endHour = parseInt(workingHours.end_time.split(':')[0])
    const endMinute = parseInt(workingHours.end_time.split(':')[1])

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    for (let minutes = startMinutes; minutes + serviceDuration <= endMinutes; minutes += 15) {
      const slotHour = Math.floor(minutes / 60)
      const slotMinute = minutes % 60
      const slotTime = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`
      const slotDateTime = `${date}T${slotTime}:00`

      // Check if slot conflicts with existing appointments
      const isConflict = appointments.some(apt => {
        const aptStart = new Date(apt.start_time)
        const aptEnd = new Date(apt.end_time)
        const slotStart = new Date(slotDateTime)
        const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000)

        return (slotStart < aptEnd && slotEnd > aptStart)
      })

      if (!isConflict) {
        slots.push({
          time: slotTime,
          datetime: slotDateTime,
          available: true,
          duration: serviceDuration,
          price: servicePrice
        })
      }
    }

    return { data: slots, error: null }
  } catch (error) {
    return { data: null, error }
  }
}