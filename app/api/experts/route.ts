import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG: Supabase Client Check ===')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
    console.log('Supabase client:', supabase ? 'Initialized' : 'Not initialized')
    
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const onlineOnly = searchParams.get('onlineOnly') === 'true'
    const mode = searchParams.get('mode') || 'all'
    const minPrice = parseInt(searchParams.get('minPrice') || '0')
    const maxPrice = parseInt(searchParams.get('maxPrice') || '5000')
    const sortBy = searchParams.get('sortBy') || 'recommended'
    
    console.log('=== DEBUG: Fetching experts ===')
    console.log('Params:', { onlineOnly, mode, minPrice, maxPrice, sortBy })
    
    // Build Supabase query - fetch from expert_astrologers table
    console.log('=== DEBUG: Building Query ===')
    console.log('Table: expert_astrologers')
    console.log('Filters: is_suspended = false')
    
    let query = supabase
      .from("expert_astrologers")
      .select(`
        *,
        profiles(status, full_name)
      `)
      .eq("is_suspended", false)
    
    // Apply price filters
    if (minPrice > 0) {
      query = query.gte("cost_per_minute", minPrice)
    }
    
    if (maxPrice < 5000) {
      query = query.lte("cost_per_minute", maxPrice)
    }
    
    const { data, error } = await query
      .order("is_online", { ascending: false });
    
    console.log("Expert astrologers:", data);
    
    console.log('=== DEBUG: Filtered Query Results ===')
    console.log('Experts fetched:', data)
    console.log('Error:', error)
    console.log('Experts length:', data?.length || 0)
    
    if (error) {
      console.error('Supabase error:', error)
      console.error('Error details:', {
        message: (error as any).message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code
      })
      throw error
    }
    
    // Map expert_astrologers table fields to frontend expected structure
    const mappedExperts = (data || []).map((expert: any) => ({
      id: expert.id,
      name: expert.display_name || 'Unknown',
      specialization: expert.primary_specialization || 'General',
      bio: expert.bio || 'Expert astrologer',
      rating: 4.5, // Default rating
      reviews: 0, // Default reviews
      experience: `${expert.years_of_experience || 0} years`,
      responseTime: expert.response_time || '5 minutes',
      price: expert.cost_per_minute || 299,
      image: expert.profile_photo_url || null,
      online: expert.is_online || false,
      verified: expert.profiles?.status === 'approved',
      modes: [
        ...(expert.chat_enabled ? ['chat'] : []),
        ...(expert.call_enabled ? ['call'] : []),
        ...(expert.video_enabled ? ['video'] : [])
      ],
      languages: expert.languages_spoken || ['English'],
      // Keep original expert data
      ...expert
    }))
    
    console.log('=== DEBUG: Final Results ===')
    console.log('Mapped experts:', mappedExperts)
    console.log('Total count:', mappedExperts.length)
    
    return NextResponse.json({
      success: true,
      data: mappedExperts,
      total: mappedExperts.length
    })
    
  } catch (error) {
    console.error('=== DEBUG: Error Fetching Experts ===')
    console.error('Error:', error)
    console.error('Error type:', typeof error)
    console.error('Error message:', (error as any)?.message)
    console.error('Error stack:', (error as any)?.stack)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch experts',
        details: (error as any)?.message 
      },
      { status: 500 }
    )
  }
}
