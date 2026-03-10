import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    
    
    // Test 1: Check if table exists and has data
    const { data: allCounsellors, error: allError } = await supabase
      .from("expert_counsellors")
      .select("*")
      .limit(10)
    
    
    
    // Log specializations details
    if (allCounsellors && allCounsellors.length > 0) {
      allCounsellors.forEach((counsellor, index) => {
        console.log(`=== DEBUG: Counsellor ${index + 1} specializations ===`, {
          id: counsellor.id,
          name: counsellor.display_name,
          specialties: counsellor.specialties,
          specialties_type: typeof counsellor.specialties,
          specialties_length: Array.isArray(counsellor.specialties) ? counsellor.specialties.length : 'Not an array',
          is_profile_complete: counsellor.is_profile_complete
        })
      })
    }
    
    // Test 2: Check profiles table for counsellors
    const { data: profileCounsellors, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("specialization", "counsellor")
      .limit(10)
    
    
    
    // Test 3: Check expert_astrologers for counsellors (should be empty after migration)
    const { data: astrologerCounsellors, error: astrologerError } = await supabase
      .from("expert_astrologers")
      .select("*")
      .limit(10)
    
    
    
    return NextResponse.json({
      success: true,
      tests: {
        expert_counsellors: {
          data: allCounsellors,
          error: allError,
          count: allCounsellors?.length || 0
        },
        profile_counsellors: {
          data: profileCounsellors,
          error: profileError,
          count: profileCounsellors?.length || 0
        },
        expert_astrologers: {
          data: astrologerCounsellors,
          error: astrologerError,
          count: astrologerCounsellors?.length || 0
        }
      }
    })
    
  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test endpoint failed',
        details: (error as any)?.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
