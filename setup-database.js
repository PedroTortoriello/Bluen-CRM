require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Create Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupDatabase() {
  try {
    console.log('Setting up Supabase database...')
    
    // Read schema file
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'sql/schema.sql'), 'utf8')
    const seedSQL = fs.readFileSync(path.join(__dirname, 'sql/seed.sql'), 'utf8')
    
    // Split SQL into individual statements
    const schemaStatements = schemaSQL.split(';').filter(stmt => stmt.trim())
    const seedStatements = seedSQL.split(';').filter(stmt => stmt.trim())
    
    console.log('Executing schema statements...')
    for (const statement of schemaStatements) {
      if (statement.trim()) {
        try {
          const { error } = await supabaseAdmin.rpc('exec_sql', { sql: statement })
          if (error && !error.message.includes('already exists')) {
            console.log(`Warning on statement: ${error.message}`)
          }
        } catch (err) {
          console.log(`Skipping statement (likely already exists): ${err.message}`)
        }
      }
    }
    
    console.log('Executing seed statements...')
    for (const statement of seedStatements) {
      if (statement.trim()) {
        try {
          const { error } = await supabaseAdmin.rpc('exec_sql', { sql: statement })
          if (error && !error.message.includes('already exists') && !error.message.includes('duplicate key')) {
            console.log(`Warning on seed statement: ${error.message}`)
          }
        } catch (err) {
          console.log(`Skipping seed statement: ${err.message}`)
        }
      }
    }
    
    console.log('Database setup completed!')
    
    // Test the connection by fetching tenant data
    const { data: tenant, error } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('slug', 'demo-barbershop')
      .single()
    
    if (tenant) {
      console.log('✅ Database connection successful!')
      console.log('✅ Demo tenant found:', tenant.name)
    } else {
      console.log('❌ Could not find demo tenant:', error)
    }
    
  } catch (error) {
    console.error('Error setting up database:', error)
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase }