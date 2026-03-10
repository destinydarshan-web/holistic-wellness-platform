import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// Helper function to determine service type and table
const getServiceTypeAndTable = (specialties: string[], userRole?: string) => {
  
  
  
  
  const specialtiesLower = specialties.map(s => s.toLowerCase())
  
  
  // Check specialties for service type indicators
  if (specialtiesLower.some(s => s.includes('astrology') || s.includes('vedic') || s.includes('tarot') || s.includes('numerology'))) {
    
    return { serviceType: 'astrology', table: 'expert_astrologers' }
  }
  if (specialtiesLower.some(s => s.includes('anxiety') || s.includes('depression') || s.includes('counselling') || s.includes('therapy'))) {
    
    return { serviceType: 'counselling', table: 'expert_counsellors' }
  }
  if (specialtiesLower.some(s => s.includes('yoga') || s.includes('vinyasa') || s.includes('ashtanga') || s.includes('hatha'))) {
    
    return { serviceType: 'yoga', table: 'expert_yoga' }
  }
  if (specialtiesLower.some(s => s.includes('meditation') || s.includes('mindfulness') || s.includes('breathing') || s.includes('vipassana'))) {
    
    return { serviceType: 'meditation', table: 'expert_meditation' }
  }
  
  // Fallback to role-based detection
  
  if (userRole === 'astrologer') {
    
    return { serviceType: 'astrology', table: 'expert_astrologers' }
  }
  if (userRole === 'expert') {
    return { serviceType: 'meditation', table: 'expert_meditation' }
  }
  
  // Default fallback
  
  return { serviceType: 'meditation', table: 'expert_meditation' }
}

export async function POST(request: NextRequest) {
  try {
    
    
    // Get auth token from request
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      
      return NextResponse.json({
        success: false,
        error: 'Invalid authentication token'
      }, { status: 401 })
    }
    
    
    
    
    
    
    const body = await request.json()
    const { id, display_name, bio, experience_years, price_per_minute, specialties, avatar_url } = body
    
    
    
    
    
    
    // Validate that the ID in request matches authenticated user
    if (id !== user.id) {
      
      
      
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: You can only update your own profile'
      }, { status: 403 })
    }
    
    // Validate required fields
    if (!display_name || !price_per_minute || !specialties || specialties.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: display_name, price_per_minute, specialties'
      }, { status: 400 })
    }
    
    // Validate avatar_url length (base64 can be very long)
    if (avatar_url && avatar_url.length > 1000000) { // ~1MB limit for base64
      return NextResponse.json({
        success: false,
        error: 'Avatar image is too large. Please use a smaller image.'
      }, { status: 400 })
    }
    
    // Check if this is a profile completion (all required fields filled)
    const isProfileComplete = !!display_name && 
                              !!price_per_minute && 
                              !!specialties && 
                              specialties.length > 0
    
    
    console.log('Required fields filled:', {
      display_name: !!display_name,
      price_per_minute: !!price_per_minute,
      specialties: !!specialties && specialties.length > 0,
      isProfileComplete
    })
    
    
    // Validate boolean fields
    const validatedData = {
      id,
      display_name: display_name || '',
      bio: bio || '',
      experience_years: experience_years || 0,
      price_per_minute: price_per_minute || 0,
      specialties: specialties || [],
      avatar_url: avatar_url || '',
      is_profile_complete: isProfileComplete, // This should be boolean
      updated_at: new Date().toISOString()
    }
    
    
    
    
    
    
    
    
    console.log('Data:', { 
      display_name, 
      bio, 
      experience_years, 
      price_per_minute, 
      specialties, 
      avatar_url: avatar_url ? `${avatar_url.substring(0, 50)}... (length: ${avatar_url.length})` : 'none' 
    })
    
    // Determine service type and correct table
    const { serviceType, table } = getServiceTypeAndTable(specialties || [], user.user_metadata?.role)
    
    
    
    
    
    
    // Additional check: Force meditation for 'expert' role regardless of specialties
    let finalTable = table
    let finalServiceType = serviceType
    
    if (user.user_metadata?.role === 'expert') {
      
      finalTable = 'expert_meditation'
      finalServiceType = 'meditation'
    }
    
    
    
    
    
    // Check if expert entry exists in the correct table
    
    const { data: existingProfile, error: checkError } = await supabase
      .from(finalTable)
      .select("*")
      .eq("id", user.id)
      .single()
    
    
    
    
    // Upsert expert profile to the correct table
    const { data, error } = await supabase
      .from(finalTable)
      .upsert(validatedData, {
        onConflict: 'id'
      })
      .select()
      .single()
    
    if (error) {
      
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      if (error.code === '42501') {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions to perform this action',
          details: error.details
        }, { status: 403 })
      } else {
        return NextResponse.json({
          success: false,
          error: `Failed to save profile: ${error.message}`,
          details: error.details
        }, { status: 500 })
      }
    }
    
    
    
    
    return NextResponse.json({
      success: true,
      data: data,
      message: isProfileComplete ? 'Profile completed successfully!' : 'Profile saved successfully!'
    })
    
  } catch (error) {
    
    
    return NextResponse.json({
      success: false,
      error: `Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
