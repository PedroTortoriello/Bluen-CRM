import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient(
  'https://vwfjhhgpelhqoeuwwjms.supabase.co', // Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZmpoaGdwZWxocW9ldXd3am1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU0MTI2NywiZXhwIjoyMDczMTE3MjY3fQ.x19sOnzcRn6PX5Ui174TTb6tDWB9WhVxlsTYWc3HeaA' // Service Role Key
)

console.log('Supabase Admin client created:', !!supabaseAdmin)
