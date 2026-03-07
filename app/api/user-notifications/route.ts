import { supabase } from '@/lib/supabaseClient'

export async function POST(request: Request) {
  try {
    const { user_id, expert_id, type, message, appointment_id } = await request.json()
    
    console.log('=== DEBUG: Creating User Notification ===')
    console.log('Data:', { user_id, expert_id, type, message, appointment_id })

    // First, check if user_notifications table exists
    let notificationData = null
    let notificationError = null
    
    try {
      console.log('=== DEBUG: Trying user_notifications table ===')
      const { data, error } = await supabase
        .from('user_notifications')
        .insert({
          user_id,
          expert_id,
          type,
          message,
          appointment_id,
          read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      console.log('user_notifications result:', { data, error })
      
      if (!error) {
        notificationData = data
        notificationError = null
      } else {
        notificationError = error
        console.log('user_notifications failed, trying fallback')
      }
    } catch (tableError) {
      console.log('user_notifications table doesn\'t exist, trying fallback')
      notificationError = tableError
    }

    // If user_notifications failed, try notifications table as fallback
    if (notificationError) {
      try {
        console.log('=== DEBUG: Trying notifications table as fallback ===')
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            recipient_id: user_id,
            sender_id: expert_id,
            type,
            message,
            appointment_id,
            read: false,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        console.log('notifications fallback result:', { data, error })
        
        if (!error) {
          notificationData = data
          notificationError = null
        } else {
          notificationError = error
        }
      } catch (fallbackError) {
        console.log('notifications table also failed')
        notificationError = fallbackError
      }
    }

    if (notificationError) {
      console.error('All user notification methods failed:', notificationError)
      // Don't fail the process, just log error
      return Response.json({ 
        success: true, 
        notification: null,
        warning: 'User notification could not be sent but action was successful' 
      })
    }

    console.log('✅ User notification created successfully:', notificationData)
    return Response.json({ 
      success: true, 
      notification: notificationData 
    })
    
  } catch (error) {
    console.error('Error in user notifications API:', error)
    // Don't fail the process
    return Response.json({ 
      success: true, 
      notification: null,
      warning: 'User notification service unavailable but action was successful' 
    })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching user notifications:', error)
      return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    return Response.json({ notifications: data })
  } catch (error) {
    console.error('Error in user notifications GET API:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
