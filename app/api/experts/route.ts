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
    
    // Build Supabase query - fetch from expert_astrologers table with join to profiles
    console.log('=== DEBUG: Building Query ===')
    console.log('Table: expert_astrologers')
    console.log('Filters: is_profile_complete = true, profiles.status = approved')
    
    let query = supabase
      .from("expert_astrologers")
      .select(`
        *,
        profiles!inner(status, full_name)
      `)
      .eq("is_profile_complete", true)
    
    // Join with profiles table to filter by status
    query = query.eq("profiles.status", "approved")
    
    // Apply mode filter
    if (mode !== 'all') {
      query = query.contains("specialties", `"${mode}"`)
    }
    
    // Apply price filters
    if (minPrice > 0) {
      query = query.gte("price_per_minute", minPrice)
    }
    
    if (maxPrice < 5000) {
      query = query.lte("price_per_minute", maxPrice)
    }
    
    // Apply sorting (simplified - no is_online column)
    if (sortBy === 'rating') {
      query = query.order("created_at", { ascending: false }) // newest first as proxy for rating
    } else if (sortBy === 'price-low') {
      query = query.order("price_per_minute", { ascending: true })
    } else if (sortBy === 'price-high') {
      query = query.order("price_per_minute", { ascending: false })
    } else {
      // Default: recommended (newest first)
      query = query.order("created_at", { ascending: false })
    }
    
    let data, error;
    
    try {
      const result = await query;
      data = result.data;
      error = result.error;
    } catch (err) {
      console.error('Database connection or query error:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', (err as any)?.message);
      
      // Return empty array for any connection/query issues
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        fallback: true,
        message: 'Using fallback due to database connection issues'
      })
    }
    
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
      
      // If table doesn't exist or other connection issues, return empty array instead of crashing
      if ((error as any).code === 'PGRST116' || (error as any).message?.includes('relation') || (error as any).message?.includes('fetch failed')) {
        console.log('Table does not exist or connection issue, returning empty experts array')
        return NextResponse.json({
          success: true,
          data: [],
          total: 0
        })
      }
      
      throw error
    }
    
    // Map expert_astrologers table fields to frontend expected structure
    const mappedExperts = (data || []).map((expert: any) => ({
      id: expert.id,
      display_name: expert.display_name || expert.profiles?.full_name || 'Unknown',
      avatar_url: expert.avatar_url || null,
      bio: expert.bio || 'Expert astrologer',
      experience_years: expert.experience_years || 0,
      price_per_minute: expert.price_per_minute || 299,
      specialties: expert.specialties || ['General'],
      is_profile_complete: expert.is_profile_complete || true,
      is_online: true, // Default to true since we don't track online status
      created_at: expert.created_at,
      updated_at: expert.updated_at,
      // Keep original expert data for compatibility
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
