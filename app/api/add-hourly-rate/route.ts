import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST() {
  try {
    console.log('Checking if hourly_rate column exists...')
    
    // Try to select the hourly_rate column
    const { data, error } = await supabase
      .from('expert_astrologers')
      .select('hourly_rate')
      .limit(1)
    
    if (error && error.message.includes('column "hourly_rate" does not exist')) {
      console.log('Column does not exist. Manual SQL required.')
      return NextResponse.json({ 
        error: 'Column does not exist',
        message: 'The hourly_rate column needs to be added manually to the database.',
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to SQL Editor',
          '3. Run this SQL command:',
          'ALTER TABLE expert_astrologers ADD COLUMN hourly_rate INTEGER DEFAULT 17940;',
          '4. Then run this to update existing records:',
          'UPDATE expert_astrologers SET hourly_rate = COALESCE(hourly_rate, price_per_minute * 60) WHERE hourly_rate IS NULL;'
        ],
        sql: 'ALTER TABLE expert_astrologers ADD COLUMN hourly_rate INTEGER DEFAULT 17940;'
      }, { status: 400 })
    }
    
    if (error) {
      return NextResponse.json({ 
        error: 'Database error',
        message: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'hourly_rate column exists and is ready to use',
      data: data 
    })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Unexpected error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
