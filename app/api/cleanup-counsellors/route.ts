import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST() {
  try {
    
    
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
      
      return NextResponse.json(
        { success: false, error: 'Failed to fetch counsellors' },
        { status: 500 }
      )
    }
    
    
    
    let updatedCount = 0
    
    // Clean up each counsellor's specializations
    for (const counsellor of counsellors || []) {
      
      
      
      // Filter out astrology specializations, keep only counselling ones
      const cleanedSpecializations = (counsellor.specialties || []).filter((spec: string) => 
        counsellingSpecializations.includes(spec)
      )
      
      
      
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
          
        } else {
          
          updatedCount++
        }
      } else {
        
      }
    }
    
    
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up specializations for ${updatedCount} counsellors`,
      updatedCount: updatedCount,
      totalCounsellors: counsellors?.length || 0
    })
    
  } catch (error) {
    
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
