const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations
)

async function addHourlyRateColumn() {
  try {
    console.log('Adding hourly_rate column to expert_astrologers table...')
    
    // Add the column using raw SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE expert_astrologers ADD COLUMN IF NOT EXISTS hourly_rate INTEGER DEFAULT 17940;`
    })
    
    if (error) {
      console.error('Error adding column:', error)
      
      // Try alternative approach
      console.log('Trying alternative approach...')
      const { error: error2 } = await supabase
        .from('expert_astrologers')
        .select('hourly_rate')
        .limit(1)
      
      if (error2 && error2.message.includes('column "hourly_rate" does not exist')) {
        console.log('Column does not exist. Please run the migration manually:')
        console.log('ALTER TABLE expert_astrologers ADD COLUMN hourly_rate INTEGER DEFAULT 17940;')
      } else {
        console.log('Column might already exist or there was a different error.')
      }
    } else {
      console.log('Successfully added hourly_rate column!')
      
      // Update existing records
      const { error: updateError } = await supabase.rpc('exec_sql', {
        sql: `UPDATE expert_astrologers SET hourly_rate = COALESCE(hourly_rate, price_per_minute * 60) WHERE hourly_rate IS NULL;`
      })
      
      if (updateError) {
        console.error('Error updating existing records:', updateError)
      } else {
        console.log('Successfully updated existing records!')
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

addHourlyRateColumn()
