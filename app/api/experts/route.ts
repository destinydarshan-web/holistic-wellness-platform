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
    const service = searchParams.get('service') || 'astrology' // Default to astrology
    
    // Map frontend mode values to database values
    const modeMapping: { [key: string]: string } = {
      // Astrology mappings
      'vedic': 'Vedic Astrology',
      'western': 'Western Astrology',
      'numerology': 'Numerology',
      'tarot': 'Tarot Reading',
      'palmistry': 'Palmistry',
      'vastu': 'Vastu Shastra',
      'kp': 'KP Astrology',
      'lal-kitab': 'Lal Kitab Astrology',
      'nadi': 'Nadi Astrology',
      'prashna': 'Prashna Astrology',
      'muhurta': 'Muhurta Astrology',
      'horary': 'Horary Astrology',
      'matchmaking': 'Matchmaking',
      'remedial': 'Remedial Astrology',
      // Counselling mappings
      'anxiety': 'Anxiety',
      'depression': 'Depression',
      'relationships': 'Relationships',
      'stress': 'Stress Management',
      'career': 'Career Counselling',
      'trauma': 'Trauma & PTSD',
      'self-esteem': 'Self-Esteem',
      'addiction': 'Addiction Recovery',
      'grief': 'Grief & Loss',
      // Yoga mappings
      'hatha': 'Hatha Yoga',
      'vinyasa': 'Vinyasa Flow',
      'ashtanga': 'Ashtanga',
      'yin': 'Yin Yoga',
      'restorative': 'Restorative',
      'power': 'Power Yoga',
      'meditation': 'Meditation',
      'prenatal': 'Prenatal Yoga',
      'kids': 'Kids Yoga'
    }
    
    const actualMode = mode === 'all' ? 'all' : (modeMapping[mode] || mode)
    
    console.log('=== DEBUG: Fetching experts ===')
    console.log('Params:', { onlineOnly, mode, minPrice, maxPrice, sortBy, service })
    
    // Try different table names to find the correct one
    let data = null
    let error = null
    
    if (service === 'counselling') {
      // Handle counselling service - try expert_counsellors table first
      console.log('=== DEBUG: Trying expert_counsellors table for counselling ===')
      
      // First, let's check what's in the expert_counsellors table
      const { data: allCounsellors, error: allCounsellorsError } = await supabase
        .from("expert_counsellors")
        .select("*")
        .limit(5)
      
      console.log('=== DEBUG: All counsellors in expert_counsellors table ===', { allCounsellors, allCounsellorsError })
      console.log('=== DEBUG: Counsellor profile completion status ===', allCounsellors?.map(c => ({ id: c.id, name: c.display_name, is_complete: c.is_profile_complete })))
      
      const { data: counsellorData, error: counsellorError } = await supabase
        .from("expert_counsellors")
        .select("*")
        // Temporarily remove this filter to see all counsellors
        // .eq("is_profile_complete", true)
        .limit(1)
      
      console.log('expert_counsellors test:', { counsellorData, counsellorError })
      
      if (!counsellorError) {
        // Use expert_counsellors table
        console.log('=== DEBUG: Using expert_counsellors table ===')
        
        let query = supabase
          .from("expert_counsellors")
          .select("*")
          // Temporarily remove this filter to see all counsellors
          // .eq("is_profile_complete", true)
        
        // Simple filter for counsellors with counselling specializations
        query = query.contains("specialties", ["Career Counselling"])
        
        console.log('=== DEBUG: Using simple counselling filter ===')
        
        // Apply mode filter - handle specialties properly for PostgreSQL arrays
        if (actualMode !== 'all') {
          // Use contains for array filtering only (ilike doesn't work on arrays)
          query = query.contains("specialties", [actualMode])
        }
        
        // Apply price filters
        if (minPrice > 0) {
          query = query.gte("price_per_minute", minPrice)
        }
        
        if (maxPrice < 5000) {
          query = query.lte("price_per_minute", maxPrice)
        }
        
        // Apply sorting
        if (sortBy === 'rating') {
          query = query.order("created_at", { ascending: false })
        } else if (sortBy === 'price-low') {
          query = query.order("price_per_minute", { ascending: true })
        } else if (sortBy === 'price-high') {
          query = query.order("price_per_minute", { ascending: false })
        } else {
          query = query.order("created_at", { ascending: false })
        }
        
        const result = await query
        data = result.data
        error = result.error
        console.log('=== DEBUG: expert_counsellors query result ===', { data, error })
        console.log('=== DEBUG: Number of counsellors found ===', data?.length || 0)
        
      } else {
        // Try profiles table with counsellor role as fallback
        console.log('=== DEBUG: Trying profiles table for counsellors ===')
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .eq("status", "approved")
          .eq("role", "counsellor")
          .limit(1)
        
        console.log('profiles counsellor test:', { profilesData, profilesError })
        
        if (!profilesError) {
          // Use profiles table
          console.log('=== DEBUG: Using profiles table for counsellors ===')
          let query = supabase
            .from("profiles")
            .select("*")
            .eq("status", "approved")
            .eq("role", "counsellor")
          
          // Apply mode filter - handle specialties properly for PostgreSQL arrays
          if (mode !== 'all') {
            query = query.or(`specialties.cs.{${mode}},specialization.ilike.%${mode}%`)
          }
          
          // Apply price filters
          if (minPrice > 0) {
            query = query.gte("price_per_minute", minPrice)
          }
          
          if (maxPrice < 5000) {
            query = query.lte("price_per_minute", maxPrice)
          }
          
          // Apply sorting
          if (sortBy === 'rating') {
            query = query.order("created_at", { ascending: false })
          } else if (sortBy === 'price-low') {
            query = query.order("price_per_minute", { ascending: true })
          } else if (sortBy === 'price-high') {
            query = query.order("price_per_minute", { ascending: false })
          } else {
            query = query.order("created_at", { ascending: false })
          }
          
          const result = await query
          data = result.data
          error = result.error
          console.log('=== DEBUG: profiles counsellors query result ===', { data, error })
        } else {
          // Check if there are any counsellors at all
          console.log('=== DEBUG: Checking for any counsellors in profiles ===')
          const { data: allCounsellors, error: allCounsellorsError } = await supabase
            .from("profiles")
            .select("*")
            .eq("role", "counsellor")
            .limit(5)
          
          console.log('All counsellors in profiles:', { allCounsellors, allCounsellorsError })
          
          // Also check what roles exist
          console.log('=== DEBUG: Checking all roles in profiles ===')
          const { data: allRoles, error: allRolesError } = await supabase
            .from("profiles")
            .select("role")
            .limit(10)
          
          console.log('All roles in profiles:', { allRoles, allRolesError })
          
          // Check if there are any approved profiles at all
          console.log('=== DEBUG: Checking all approved profiles ===')
          const { data: allApproved, error: allApprovedError } = await supabase
            .from("profiles")
            .select("role, status, full_name")
            .eq("status", "approved")
            .limit(10)
          
          console.log('All approved profiles:', { allApproved, allApprovedError })
          
          // As a fallback, return some sample data or empty with proper message
          console.log('=== DEBUG: No counsellors found, trying fallback to approved profiles ===')
          
          // Try to get approved profiles and treat them as counsellors for testing
          const { data: approvedProfiles, error: approvedError } = await supabase
            .from("profiles")
            .select("*")
            .eq("status", "approved")
            .limit(10)
          
          console.log('Approved profiles for fallback:', { approvedProfiles, approvedError })
          
          if (!approvedError && approvedProfiles && approvedProfiles.length > 0) {
            // Transform approved profiles to counsellor format
            data = approvedProfiles.map(profile => ({
              ...profile,
              is_profile_complete: true,
              is_online: true,
              modes: ['chat', 'video'],
              specialties: profile.specialties || ['counselling', 'therapy'],
              experience_years: profile.experience_years || 5,
              price_per_minute: profile.price_per_minute || 50,
              hourly_rate: profile.hourly_rate || 3000
            }))
            console.log('=== DEBUG: Using approved profiles as counsellors ===')
          } else {
            console.log('=== DEBUG: No approved profiles found, returning empty array ===')
            data = []
          }
          error = null
        }
      }
    } else if (service === 'yoga') {
      // Handle yoga service - try expert_yoga table first
      console.log('=== DEBUG: Trying expert_yoga table for yoga ===')
      
      const { data: yogaData, error: yogaError } = await supabase
        .from("expert_yoga")
        .select("*")
        .eq("is_profile_complete", true)
        .limit(1)
      
      console.log('expert_yoga test:', { yogaData, yogaError })
      
      if (!yogaError) {
        // Use expert_yoga table
        console.log('=== DEBUG: Using expert_yoga table ===')
        
        let query = supabase
          .from("expert_yoga")
          .select(`
            *,
            profiles!inner(status, full_name)
          `)
          .eq("is_profile_complete", true)
        
        // Join with profiles table to filter by status
        query = query.eq("profiles.status", "approved")
        
        // Apply mode filter - handle specialties properly for PostgreSQL arrays
        if (actualMode !== 'all') {
          // Use contains for array filtering only (ilike doesn't work on arrays)
          query = query.contains("specialties", [actualMode])
        }
        
        // Apply price filters
        if (minPrice > 0) {
          query = query.gte("price_per_minute", minPrice)
        }
        
        if (maxPrice < 5000) {
          query = query.lte("price_per_minute", maxPrice)
        }
        
        // Apply sorting
        if (sortBy === 'rating') {
          query = query.order("created_at", { ascending: false })
        } else if (sortBy === 'price-low') {
          query = query.order("price_per_minute", { ascending: true })
        } else if (sortBy === 'price-high') {
          query = query.order("price_per_minute", { ascending: false })
        } else {
          query = query.order("created_at", { ascending: false })
        }
        
        const result = await query
        data = result.data
        error = result.error
        
      } else {
        // Try profiles table as fallback
        console.log('=== DEBUG: Trying profiles table for yoga ===')
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .eq("status", "approved")
          .eq("specialization", "yoga_trainer")
          .limit(1)
        
        console.log('profiles yoga test:', { profilesData, profilesError })
        
        if (!profilesError) {
          // Use profiles table
          let query = supabase
            .from("profiles")
            .select("*")
            .eq("status", "approved")
            .eq("specialization", "yoga_trainer")
          
          // Apply mode filter - handle specialties properly for PostgreSQL arrays
          if (mode !== 'all') {
            query = query.or(`specialties.cs.{${mode}},specialization.ilike.%${mode}%`)
          }
          
          // Apply price filters
          if (minPrice > 0) {
            query = query.gte("price_per_minute", minPrice)
          }
          
          if (maxPrice < 5000) {
            query = query.lte("price_per_minute", maxPrice)
          }
          
          // Apply sorting
          if (sortBy === 'rating') {
            query = query.order("created_at", { ascending: false })
          } else if (sortBy === 'price-low') {
            query = query.order("price_per_minute", { ascending: true })
          } else if (sortBy === 'price-high') {
            query = query.order("price_per_minute", { ascending: false })
          } else {
            query = query.order("created_at", { ascending: false })
          }
          
          const result = await query
          data = result.data
          error = result.error
        }
      }
    } else {
      // Handle astrology service (original logic)
      console.log('=== DEBUG: Trying expert_astrologers table ===')
      const { data: expertData, error: expertError } = await supabase
        .from("expert_astrologers")
        .select("*")
        .eq("is_profile_complete", true)
        .limit(1)
      
      console.log('expert_astrologers test:', { expertData, expertError })
      
      if (!expertError) {
        // Use expert_astrologers table
        console.log('=== DEBUG: Using expert_astrologers table ===')
        
        let query = supabase
          .from("expert_astrologers")
          .select(`
            *,
            profiles!inner(status, full_name)
          `)
          .eq("is_profile_complete", true)
        
        // Join with profiles table to filter by status
        query = query.eq("profiles.status", "approved")
        
        // Apply mode filter - handle specialties properly for PostgreSQL arrays
        if (actualMode !== 'all') {
          // Use contains for array filtering only (ilike doesn't work on arrays)
          query = query.contains("specialties", [actualMode])
        }
        
        // Apply online filter
        if (onlineOnly) {
          query = query.eq("is_online", true)
        }
        
        // Apply price filters
        if (minPrice > 0) {
          query = query.gte("price_per_minute", minPrice)
        }
        
        if (maxPrice < 5000) {
          query = query.lte("price_per_minute", maxPrice)
        }
        
        // Apply sorting
        if (sortBy === 'rating') {
          query = query.order("created_at", { ascending: false })
        } else if (sortBy === 'price-low') {
          query = query.order("price_per_minute", { ascending: true })
        } else if (sortBy === 'price-high') {
          query = query.order("price_per_minute", { ascending: false })
        } else if (sortBy === 'online') {
          query = query.order("is_online", { ascending: false }).order("created_at", { ascending: false })
        } else if (sortBy === 'experience') {
          query = query.order("experience_years", { ascending: false }).order("created_at", { ascending: false })
        } else {
          // 'recommended' and any other values - sort by created_at desc
          query = query.order("created_at", { ascending: false })
        }
        
        const result = await query
        data = result.data
        error = result.error
        
      } else {
        // Try profiles table as fallback
        console.log('=== DEBUG: Trying profiles table as fallback ===')
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .eq("status", "approved")
          .eq("role", "astrologer")
          .limit(1)
        
        console.log('profiles test:', { profilesData, profilesError })
        
        if (!profilesError) {
          // Use profiles table
          let query = supabase
            .from("profiles")
            .select("*")
            .eq("status", "approved")
            .eq("role", "astrologer")
          
          // Apply mode filter - handle specialties properly for PostgreSQL arrays
          if (mode !== 'all') {
            query = query.or(`specialties.cs.{${mode}},specialization.ilike.%${mode}%`)
          }
          
          // Apply price filters
          if (minPrice > 0) {
            query = query.gte("price_per_minute", minPrice)
          }
          
          if (maxPrice < 5000) {
            query = query.lte("price_per_minute", maxPrice)
          }
        
          // Apply sorting
          if (sortBy === 'rating') {
            query = query.order("created_at", { ascending: false })
          } else if (sortBy === 'price-low') {
            query = query.order("price_per_minute", { ascending: true })
          } else if (sortBy === 'price-high') {
            query = query.order("price_per_minute", { ascending: false })
          } else {
            query = query.order("created_at", { ascending: false })
          }
        
          const result = await query
          data = result.data
          error = result.error
        }
      }
    }
    
    console.log('=== DEBUG: Query Results ===')
    console.log('Data:', data)
    console.log('Error:', error)
    console.log('Data length:', data?.length || 0)
    
    if (error) {
      console.error('Database error:', error)
      throw new Error(`Database query failed: ${error.message}`)
    }
    
    if (!data || data.length === 0) {
      console.log('No experts found, returning empty array')
      return NextResponse.json({
        success: true,
        data: [],
        total: 0
      })
    }
    
    // Map data to frontend expected structure
    const mappedExperts = (data || []).map((expert: any) => ({
      id: expert.id,
      display_name: expert.display_name || expert.full_name || expert.profiles?.full_name || 'Unknown',
      avatar_url: expert.avatar_url || null,
      bio: expert.bio || 'Expert astrologer',
      experience_years: expert.experience_years || 0,
      price_per_minute: expert.price_per_minute || 299,
      hourly_rate: expert.hourly_rate || (expert.price_per_minute || 299) * 60,
      specialties: expert.specialties || expert.specialization || ['General'],
      is_profile_complete: expert.is_profile_complete || true,
      is_online: true, // Default to true since we don't track online status
      modes: ['chat', 'call', 'video'], // Default communication modes
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
        details: (error as any)?.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
