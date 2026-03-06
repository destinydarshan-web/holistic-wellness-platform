import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST() {
  try {
    console.log('=== DEBUG: Fixing counsellor profile completeness ===')
    
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
    
    // Check each counsellor's profile completeness
    for (const counsellor of counsellors || []) {
      console.log('=== DEBUG: Processing counsellor ===', counsellor.display_name)
      
      // Check if profile should be complete
      const shouldBeComplete = 
        counsellor.display_name && 
        counsellor.bio && 
        counsellor.experience_years !== undefined && 
        counsellor.price_per_minute !== undefined &&
        counsellor.specialties && 
        counsellor.specialties.length > 0
      
      console.log('=== DEBUG: Should be complete ===', shouldBeComplete)
      console.log('=== DEBUG: Current is_profile_complete ===', counsellor.is_profile_complete)
      
      // Update if profile should be complete but isn't marked as such
      if (shouldBeComplete && !counsellor.is_profile_complete) {
        const { error: updateError } = await supabase
          .from("expert_counsellors")
          .update({ 
            is_profile_complete: true,
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
    
    console.log('=== DEBUG: Profile completeness fix completed ===', { updatedCount })
    
    return NextResponse.json({
      success: true,
      message: `Updated profile completeness for ${updatedCount} counsellors`,
      updatedCount: updatedCount,
      totalCounsellors: counsellors?.length || 0
    })
    
  } catch (error) {
    console.error('=== DEBUG: Profile completeness fix error ===', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Profile completeness fix failed',
        details: (error as any)?.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
