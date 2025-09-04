-- Barbershop SaaS Database Schema for Supabase
-- Multi-tenant architecture with Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'barber', 'reception', 'customer');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE appointment_source AS ENUM ('online', 'phone', 'walk_in', 'admin');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('pix', 'credit_card', 'debit_card', 'cash');

-- TENANTS (Barbershops)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    cnpj VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#5e819e',
    secondary_color VARCHAR(7) DEFAULT '#244561',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    currency VARCHAR(3) DEFAULT 'BRL',
    active BOOLEAN DEFAULT true,
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- PROFILES (User profiles linked to Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    role user_role DEFAULT 'customer',
    avatar_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STAFF (Barbers and employees)
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    bio TEXT,
    photo_url TEXT,
    commission_percentage DECIMAL(5,2) DEFAULT 0,
    commission_fixed_cents INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- SERVICES
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    duration_minutes INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    active BOOLEAN DEFAULT true,
    public_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- STAFF_SERVICES (Many-to-many with price/duration overrides)
CREATE TABLE staff_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    duration_minutes_override INTEGER,
    price_cents_override INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(staff_id, service_id)
);

-- AVAILABILITY_RULES (Staff working hours)
CREATE TABLE availability_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BREAKS (Lunch breaks, time offs, etc.)
CREATE TABLE breaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    reason VARCHAR(255),
    recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CUSTOMERS
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    birth_date DATE,
    notes TEXT,
    tags TEXT[],
    no_show_count INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    total_spent_cents INTEGER DEFAULT 0,
    last_appointment_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- APPOINTMENTS
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status DEFAULT 'confirmed',
    source appointment_source DEFAULT 'online',
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WAITLIST
CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE, -- Optional: any staff or specific staff
    preferred_dates DATE[],
    preferred_times TIME[],
    status VARCHAR(50) DEFAULT 'active',
    notified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    public_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- 'confirmation', 'reminder_24h', 'reminder_2h', 'follow_up'
    channel VARCHAR(50) NOT NULL, -- 'whatsapp', 'email', 'sms'
    recipient VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COUPONS
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    discount_value INTEGER NOT NULL, -- percentage (0-100) or cents
    min_amount_cents INTEGER DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- AUDIT_LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_active ON tenants(active) WHERE active = true;

CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX idx_profiles_role ON profiles(role);

CREATE INDEX idx_staff_tenant_id ON staff(tenant_id);
CREATE INDEX idx_staff_active ON staff(active) WHERE active = true;

CREATE INDEX idx_services_tenant_id ON services(tenant_id);
CREATE INDEX idx_services_active ON services(active) WHERE active = true;

CREATE INDEX idx_staff_services_staff_id ON staff_services(staff_id);
CREATE INDEX idx_staff_services_service_id ON staff_services(service_id);

CREATE INDEX idx_availability_rules_staff_id ON availability_rules(staff_id);
CREATE INDEX idx_availability_rules_day_of_week ON availability_rules(day_of_week);

CREATE INDEX idx_breaks_staff_id ON breaks(staff_id);
CREATE INDEX idx_breaks_datetime ON breaks(start_datetime, end_datetime);

CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);

CREATE INDEX idx_appointments_tenant_id ON appointments(tenant_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_range ON appointments(start_time, end_time);

CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Tenants: Users can only see their own tenant
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (
        id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM staff WHERE tenant_id = tenants.id AND profile_id = auth.uid())
    );

CREATE POLICY "Tenant owners can update their tenant" ON tenants
    FOR UPDATE USING (
        id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
    );

-- Allow public read access to active tenants by slug (for booking widget)
CREATE POLICY "Public can view active tenants by slug" ON tenants
    FOR SELECT USING (active = true);

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view profiles in their tenant" ON profiles
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
        OR id = auth.uid()
    );

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Staff: Tenant members can view staff
CREATE POLICY "Tenant members can view staff" ON staff
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
        OR profile_id = auth.uid()
    );

CREATE POLICY "Managers can manage staff" ON staff
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
    );

-- Allow public read access to active staff (for booking widget)
CREATE POLICY "Public can view active staff" ON staff
    FOR SELECT USING (active = true);

-- Services: Public can view active services
CREATE POLICY "Public can view active services" ON services
    FOR SELECT USING (active = true AND public_visible = true);

CREATE POLICY "Tenant members can view all services" ON services
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Managers can manage services" ON services
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
    );

-- Staff Services: Similar to services
CREATE POLICY "Public can view active staff services" ON staff_services
    FOR SELECT USING (active = true);

CREATE POLICY "Tenant members can manage staff services" ON staff_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM staff s 
            WHERE s.id = staff_services.staff_id 
            AND s.tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Availability Rules: Public read for active rules
CREATE POLICY "Public can view availability rules" ON availability_rules
    FOR SELECT USING (active = true);

CREATE POLICY "Staff can manage their availability" ON availability_rules
    FOR ALL USING (
        staff_id IN (SELECT id FROM staff WHERE profile_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM staff s
            WHERE s.id = availability_rules.staff_id
            AND s.tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
        )
    );

-- Breaks: Similar to availability
CREATE POLICY "Tenant members can view breaks" ON breaks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff s
            WHERE s.id = breaks.staff_id
            AND s.tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Staff can manage their breaks" ON breaks
    FOR ALL USING (
        staff_id IN (SELECT id FROM staff WHERE profile_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM staff s
            WHERE s.id = breaks.staff_id
            AND s.tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
        )
    );

-- Customers: Tenant members can view/manage customers
CREATE POLICY "Tenant members can view customers" ON customers
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Tenant staff can manage customers" ON customers
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'barber', 'reception'))
    );

-- Allow public insert for new customers (booking widget)
CREATE POLICY "Public can create customers" ON customers
    FOR INSERT WITH CHECK (true);

-- Appointments: Complex policies for different roles
CREATE POLICY "Tenant members can view appointments" ON appointments
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
        OR staff_id IN (SELECT id FROM staff WHERE profile_id = auth.uid())
    );

CREATE POLICY "Tenant staff can manage appointments" ON appointments
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'barber', 'reception'))
        OR staff_id IN (SELECT id FROM staff WHERE profile_id = auth.uid())
    );

-- Allow public insert for appointments (booking widget)
CREATE POLICY "Public can create appointments" ON appointments
    FOR INSERT WITH CHECK (true);

-- Other tables follow similar patterns...
-- (Truncated for brevity, but would include policies for payments, waitlist, reviews, etc.)

-- Functions for business logic

-- Function to get available time slots
CREATE OR REPLACE FUNCTION get_available_slots(
    p_tenant_id UUID,
    p_staff_id UUID,
    p_service_id UUID,
    p_date DATE
) RETURNS TABLE (
    time_slot TIME,
    datetime_slot TIMESTAMP WITH TIME ZONE,
    available BOOLEAN,
    duration_minutes INTEGER,
    price_cents INTEGER
) AS $$
DECLARE
    service_duration INTEGER;
    service_price INTEGER;
    work_start TIME;
    work_end TIME;
    slot_time TIME;
    slot_datetime TIMESTAMP WITH TIME ZONE;
    has_conflict BOOLEAN;
BEGIN
    -- Get service details (with staff override if exists)
    SELECT 
        COALESCE(ss.duration_minutes_override, s.duration_minutes),
        COALESCE(ss.price_cents_override, s.price_cents)
    INTO service_duration, service_price
    FROM services s
    LEFT JOIN staff_services ss ON s.id = ss.service_id AND ss.staff_id = p_staff_id
    WHERE s.id = p_service_id;

    -- Get staff working hours for the day
    SELECT ar.start_time, ar.end_time 
    INTO work_start, work_end
    FROM availability_rules ar
    WHERE ar.staff_id = p_staff_id
    AND ar.day_of_week = EXTRACT(DOW FROM p_date)
    AND ar.active = true
    LIMIT 1;

    -- If no working hours found, return empty
    IF work_start IS NULL THEN
        RETURN;
    END IF;

    -- Generate 15-minute slots
    slot_time := work_start;
    WHILE slot_time + INTERVAL '1 minute' * service_duration <= work_end LOOP
        slot_datetime := p_date + slot_time;
        
        -- Check for conflicts with existing appointments
        SELECT EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.staff_id = p_staff_id
            AND a.status = 'confirmed'
            AND (
                (slot_datetime >= a.start_time AND slot_datetime < a.end_time)
                OR (slot_datetime + INTERVAL '1 minute' * service_duration > a.start_time 
                    AND slot_datetime + INTERVAL '1 minute' * service_duration <= a.end_time)
                OR (slot_datetime <= a.start_time 
                    AND slot_datetime + INTERVAL '1 minute' * service_duration >= a.end_time)
            )
        ) INTO has_conflict;

        -- Return the slot
        RETURN QUERY SELECT 
            slot_time,
            slot_datetime,
            NOT has_conflict,
            service_duration,
            service_price;

        -- Increment by 15 minutes
        slot_time := slot_time + INTERVAL '15 minutes';
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;