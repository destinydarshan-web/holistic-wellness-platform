import { supabase } from '@/lib/supabaseClient'

export async function POST(request: Request) {
  try {
    const { expert_id, user_id, type, message, appointment_id } = await request.json()
    
    console.log('=== DEBUG: Creating Notification ===')
    console.log('Data:', { expert_id, user_id, type, message, appointment_id })

    // First, check if expert_notifications table exists
    let notificationData = null
    let notificationError = null
    
    try {
      console.log('=== DEBUG: Trying expert_notifications table ===')
      const { data, error } = await supabase
        .from('expert_notifications')
        .insert({
          expert_id,
          user_id,
          type,
          message,
          appointment_id,
          read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      console.log('expert_notifications result:', { data, error })
      
      if (!error) {
        notificationData = data
        notificationError = null
      } else {
        notificationError = error
        console.log('expert_notifications failed, trying fallback')
      }
    } catch (tableError) {
      console.log('expert_notifications table doesn\'t exist, trying fallback')
      notificationError = tableError
    }

    // If expert_notifications failed, try notifications table as fallback
    if (notificationError) {
      try {
        console.log('=== DEBUG: Trying notifications table as fallback ===')
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            recipient_id: expert_id,
            sender_id: user_id,
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
      console.error('All notification methods failed:', notificationError)
      // Don't fail the booking process, just log the error
      return Response.json({ 
        success: true, 
        notification: null,
        warning: 'Notification could not be sent but booking was successful' 
      })
    }

    console.log('✅ Notification created successfully:', notificationData)
    return Response.json({ 
      success: true, 
      notification: notificationData 
    })
    
  } catch (error) {
    console.error('Error in notifications API:', error)
    // Don't fail the booking process
    return Response.json({ 
      success: true, 
      notification: null,
      warning: 'Notification service unavailable but booking was successful' 
    })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const expert_id = searchParams.get('expert_id')

    if (!expert_id) {
      return Response.json({ error: 'Expert ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('expert_notifications')
      .select('*')
      .eq('expert_id', expert_id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
      return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    return Response.json({ notifications: data })
  } catch (error) {
    console.error('Error in notifications GET API:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
