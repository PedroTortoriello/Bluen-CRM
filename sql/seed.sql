-- Seed data for barbershop demo
-- This creates sample data for testing the booking system

-- Insert demo tenant
INSERT INTO tenants (
    id,
    name,
    slug,
    cnpj,
    address,
    city,
    state,
    zip_code,
    phone,
    email,
    website,
    primary_color,
    secondary_color,
    timezone,
    currency,
    active,
    plan
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Barbearia Moderna',
    'demo-barbershop',
    '12.345.678/0001-90',
    'Rua das Flores, 123',
    'São Paulo',
    'SP',
    '01234-567',
    '(11) 99999-9999',
    'contato@barbeariamoderna.com.br',
    'https://barbeariamoderna.com.br',
    '#5e819e',
    '#244561',
    'America/Sao_Paulo',
    'BRL',
    true,
    'pro'
);

-- Insert demo services
INSERT INTO services (
    id,
    tenant_id,
    name,
    description,
    category,
    duration_minutes,
    price_cents,
    active,
    public_visible
) VALUES 
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Corte Masculino',
    'Corte moderno com acabamento profissional',
    'Corte',
    30,
    5000,
    true,
    true
),
(
    'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Barba',
    'Aparar e modelar barba com navalha',
    'Barba',
    20,
    3500,
    true,
    true
),
(
    'c3d4e5f6-g7h8-9012-cdef-345678901234',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Corte + Barba',
    'Combo completo: corte e barba',
    'Combo',
    45,
    7500,
    true,
    true
),
(
    'd4e5f6g7-h8i9-0123-defg-456789012345',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Sobrancelha',
    'Design e limpeza de sobrancelhas',
    'Sobrancelha',
    15,
    2000,
    true,
    true
),
(
    'e5f6g7h8-i9j0-1234-efgh-567890123456',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Coloração',
    'Pintura e coloração de cabelo',
    'Coloração',
    90,
    12000,
    true,
    true
),
(
    'f6g7h8i9-j0k1-2345-fghi-678901234567',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Hidratação',
    'Tratamento capilar com hidratação profunda',
    'Tratamento',
    60,
    8000,
    true,
    true
);

-- Insert demo staff
INSERT INTO staff (
    id,
    tenant_id,
    profile_id,
    name,
    email,
    phone,
    bio,
    photo_url,
    commission_percentage,
    commission_fixed_cents,
    active
) VALUES 
(
    '11111111-2222-3333-4444-555555555555',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NULL,
    'Carlos Silva',
    'carlos@barbeariamoderna.com.br',
    '(11) 98888-1111',
    'Barbeiro experiente com 10 anos de profissão. Especialista em cortes modernos e clássicos.',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    50.00,
    0,
    true
),
(
    '22222222-3333-4444-5555-666666666666',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NULL,
    'João Santos',
    'joao@barbeariamoderna.com.br',
    '(11) 98888-2222',
    'Especialista em barbas e bigodes. Técnica refinada com navalha tradicional.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    45.00,
    1000,
    true
),
(
    '33333333-4444-5555-6666-777777777777',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NULL,
    'Ricardo Pereira',
    'ricardo@barbeariamoderna.com.br',
    '(11) 98888-3333',
    'Colorista profissional e expert em tratamentos capilares. Sempre atualizado com as tendências.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    40.00,
    1500,
    true
);

-- Link all staff to all services (staff_services)
INSERT INTO staff_services (staff_id, service_id, duration_minutes_override, price_cents_override, active) VALUES
-- Carlos Silva - all services
('11111111-2222-3333-4444-555555555555', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, NULL, true), -- Corte
('11111111-2222-3333-4444-555555555555', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', NULL, NULL, true), -- Barba
('11111111-2222-3333-4444-555555555555', 'c3d4e5f6-g7h8-9012-cdef-345678901234', NULL, NULL, true), -- Corte + Barba
('11111111-2222-3333-4444-555555555555', 'd4e5f6g7-h8i9-0123-defg-456789012345', NULL, NULL, true), -- Sobrancelha

-- João Santos - barba specialist, takes longer for cuts
('22222222-3333-4444-5555-666666666666', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 35, NULL, true), -- Corte (35 min)
('22222222-3333-4444-5555-666666666666', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 25, 4000, true), -- Barba (25 min, R$40)
('22222222-3333-4444-5555-666666666666', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 50, 8000, true), -- Corte + Barba (50 min, R$80)
('22222222-3333-4444-5555-666666666666', 'd4e5f6g7-h8i9-0123-defg-456789012345', NULL, NULL, true), -- Sobrancelha

-- Ricardo Pereira - colorist, doesn't do basic cuts
('33333333-4444-5555-6666-777777777777', 'c3d4e5f6-g7h8-9012-cdef-345678901234', NULL, NULL, true), -- Corte + Barba
('33333333-4444-5555-6666-777777777777', 'e5f6g7h8-i9j0-1234-efgh-567890123456', 80, 10000, true), -- Coloração (80 min, R$100)
('33333333-4444-5555-6666-777777777777', 'f6g7h8i9-j0k1-2345-fghi-678901234567', 45, 6000, true); -- Hidratação (45 min, R$60)

-- Insert availability rules (working hours)
-- Monday to Friday: 9:00 - 18:00, Saturday: 8:00 - 17:00
INSERT INTO availability_rules (staff_id, day_of_week, start_time, end_time, active) VALUES
-- Carlos Silva
('11111111-2222-3333-4444-555555555555', 1, '09:00', '18:00', true), -- Monday
('11111111-2222-3333-4444-555555555555', 2, '09:00', '18:00', true), -- Tuesday
('11111111-2222-3333-4444-555555555555', 3, '09:00', '18:00', true), -- Wednesday
('11111111-2222-3333-4444-555555555555', 4, '09:00', '18:00', true), -- Thursday
('11111111-2222-3333-4444-555555555555', 5, '09:00', '18:00', true), -- Friday
('11111111-2222-3333-4444-555555555555', 6, '08:00', '17:00', true), -- Saturday

-- João Santos
('22222222-3333-4444-5555-666666666666', 1, '09:00', '18:00', true), -- Monday
('22222222-3333-4444-5555-666666666666', 2, '09:00', '18:00', true), -- Tuesday
('22222222-3333-4444-5555-666666666666', 3, '09:00', '18:00', true), -- Wednesday
('22222222-3333-4444-5555-666666666666', 4, '09:00', '18:00', true), -- Thursday
('22222222-3333-4444-5555-666666666666', 5, '09:00', '18:00', true), -- Friday
('22222222-3333-4444-5555-666666666666', 6, '08:00', '17:00', true), -- Saturday

-- Ricardo Pereira (different schedule)
('33333333-4444-5555-6666-777777777777', 1, '10:00', '19:00', true), -- Monday
('33333333-4444-5555-6666-777777777777', 2, '10:00', '19:00', true), -- Tuesday
('33333333-4444-5555-6666-777777777777', 3, '10:00', '19:00', true), -- Wednesday
('33333333-4444-5555-6666-777777777777', 4, '10:00', '19:00', true), -- Thursday
('33333333-4444-5555-6666-777777777777', 5, '10:00', '19:00', true), -- Friday
('33333333-4444-5555-6666-777777777777', 6, '09:00', '16:00', true); -- Saturday

-- Insert some demo appointments (past and future)
INSERT INTO appointments (
    id,
    tenant_id,
    staff_id,
    service_id,
    customer_id,
    start_time,
    end_time,
    status,
    source,
    notes
) VALUES 
-- We'll need to create customers first, but for now, we'll use placeholder UUIDs
(
    'aa111111-bbbb-cccc-dddd-eeeeeeeeeeee',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '11111111-2222-3333-4444-555555555555',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'cc111111-dddd-eeee-ffff-000000000000',
    '2024-01-15 10:00:00-03',
    '2024-01-15 10:30:00-03',
    'completed',
    'online',
    'Cliente regular'
);

-- Insert demo customers
INSERT INTO customers (
    id,
    tenant_id,
    name,
    email,
    phone,
    notes,
    total_appointments,
    total_spent_cents,
    last_appointment_at
) VALUES
(
    'cc111111-dddd-eeee-ffff-000000000000',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Pedro Oliveira',
    'pedro@email.com',
    '(11) 99999-0001',
    'Cliente VIP, sempre pontual',
    1,
    5000,
    '2024-01-15 10:00:00-03'
),
(
    'dd222222-eeee-ffff-0000-111111111111',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Ana Costa',
    'ana@email.com',
    '(11) 99999-0002',
    'Gosta de conversar durante o corte',
    0,
    0,
    NULL
),
(
    'ee333333-ffff-0000-1111-222222222222',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Lucas Ferreira',
    'lucas@email.com',
    '(11) 99999-0003',
    'Prefere horários pela manhã',
    0,
    0,
    NULL
);

-- Insert some lunch breaks for demonstration
INSERT INTO breaks (
    staff_id,
    start_datetime,
    end_datetime,
    reason,
    recurring
) VALUES
-- Daily lunch breaks
('11111111-2222-3333-4444-555555555555', '2024-06-10 12:00:00-03', '2024-06-10 13:00:00-03', 'Almoço', false),
('22222222-3333-4444-5555-666666666666', '2024-06-10 12:30:00-03', '2024-06-10 13:30:00-03', 'Almoço', false),
('33333333-4444-5555-6666-777777777777', '2024-06-10 13:00:00-03', '2024-06-10 14:00:00-03', 'Almoço', false);

-- Create some demo coupons
INSERT INTO coupons (
    tenant_id,
    code,
    name,
    description,
    discount_type,
    discount_value,
    min_amount_cents,
    max_uses,
    used_count,
    valid_from,
    valid_until,
    active
) VALUES
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'PRIMEIRA',
    'Primeira Visita',
    'Desconto de 20% na primeira visita',
    'percentage',
    20,
    3000,
    100,
    0,
    NOW(),
    NOW() + INTERVAL '30 days',
    true
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'COMBO50',
    'Combo Especial',
    'R$ 50 de desconto em combos acima de R$ 100',
    'fixed',
    5000,
    10000,
    50,
    5,
    NOW(),
    NOW() + INTERVAL '60 days',
    true
);