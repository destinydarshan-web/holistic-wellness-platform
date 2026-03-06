import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST() {
  try {
    console.log('=== DEBUG: Starting counsellor specialization cleanup ===')
    
    // Define counselling specializations
    const counsellingSpecializations = [
      'Cognitive Behavioral Therapy',
      'Relationship Counselling',
      'Career Counselling',
      'Mental Health Counselling',
      'Family Therapy',
      'Stress Management',
      'Anxiety & Depression',
      'Life Coaching',
      'Substance Abuse Counselling',
      'Grief Counselling'
    ]
    
    // Define astrology specializations to remove
    const astrologySpecializations = [
      'Vedic Astrology',
      'Western Astrology',
      'Numerology',
      'Palmistry',
      'Vastu Shastra',
      'Tarot Reading',
      'Face Reading',
      'Kundli Matching',
      'Horoscope Reading',
      'Remedial Astrology'
    ]
    
    // Get all counsellors
    const { data: counsellors, error: fetchError } = await supabase
      .from("expert_counsellors")
      .select("*")
    
    if (fetchError) {
      console.error('=== DEBUG: Error fetching counsellors ===', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch counsellors' },
        { status: 500 }
      )
    }
    
    console.log('=== DEBUG: Found counsellors ===', counsellors?.length || 0)
    
    let updatedCount = 0
    
    // Clean up each counsellor's specializations
    for (const counsellor of counsellors || []) {
      console.log('=== DEBUG: Processing counsellor ===', counsellor.display_name)
      console.log('=== DEBUG: Current specializations ===', counsellor.specialties)
      
      // Filter out astrology specializations, keep only counselling ones
      const cleanedSpecializations = (counsellor.specialties || []).filter((spec: string) => 
        counsellingSpecializations.includes(spec)
      )
      
      console.log('=== DEBUG: Cleaned specializations ===', cleanedSpecializations)
      
      // Only update if specializations changed
      if (JSON.stringify(counsellor.specialties) !== JSON.stringify(cleanedSpecializations)) {
        const { error: updateError } = await supabase
          .from("expert_counsellors")
          .update({ 
            specialties: cleanedSpecializations,
            updated_at: new Date().toISOString()
          })
          .eq("id", counsellor.id)
        
        if (updateError) {
          console.error('=== DEBUG: Error updating counsellor ===', updateError)
        } else {
          console.log('=== DEBUG: Successfully updated counsellor ===', counsellor.display_name)
          updatedCount++
        }
      } else {
        console.log('=== DEBUG: No update needed for counsellor ===', counsellor.display_name)
      }
    }
    
    console.log('=== DEBUG: Cleanup completed ===', { updatedCount })
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up specializations for ${updatedCount} counsellors`,
      updatedCount: updatedCount,
      totalCounsellors: counsellors?.length || 0
    })
    
  } catch (error) {
    console.error('=== DEBUG: Cleanup error ===', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cleanup failed',
        details: (error as any)?.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
