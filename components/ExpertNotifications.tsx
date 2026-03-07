'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { 
  Bell, 
  X, 
  CheckCircle, 
  Calendar, 
  MessageCircle, 
  Clock,
  User,
  ChevronRight,
  RefreshCw,
  Settings,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react'

interface Notification {
  id: string
  expert_id: string
  user_id: string
  appointment_id?: string
  type: 'appointment_booked' | 'appointment_cancelled' | 'appointment_rescheduled' | 'chat_request' | 'session_started' | 'session_ended' | 'payment_received'
  message: string
  read: boolean
  created_at: string
  updated_at: string
  user_name?: string
  user_email?: string
  action_url?: string
}

export default function ExpertNotifications() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    if (!user || profile?.role !== 'expert' && profile?.role !== 'astrologer' && profile?.role !== 'counsellor') {
      return
    }

    fetchNotifications()
    setupRealtimeSubscription()
  }, [user, profile])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?expert_id=${user!.id}`)
      const data = await response.json()
      
      if (data.notifications) {
        // Enrich notifications with user data
        const enrichedNotifications = await Promise.all(
          data.notifications.map(async (notification: Notification) => {
            if (notification.user_id) {
              const { data: userData } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', notification.user_id)
                .maybeSingle()
              
              return {
                ...notification,
                user_name: userData?.full_name || 'Unknown User',
                user_email: userData?.email || 'unknown@example.com'
              }
            }
            return notification
          })
        )
        
        setNotifications(enrichedNotifications)
        setUnreadCount(enrichedNotifications.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('expert_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'expert_notifications',
          filter: `expert_id=eq.${user!.id}`
        },
        async (payload) => {
          const newNotification = payload.new as Notification
          
          // Enrich with user data
          if (newNotification.user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', newNotification.user_id)
              .maybeSingle()
            
            newNotification.user_name = userData?.full_name || 'Unknown User'
            newNotification.user_email = userData?.email || 'unknown@example.com'
          }
          
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('expert_notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return
      }

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('expert_notifications')
        .update({ read: true })
        .eq('expert_id', user!.id)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return
      }

      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('expert_notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        console.error('Error deleting notification:', error)
        return
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      const deletedNotification = notifications.find(n => n.id === notificationId)
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const clearAllNotifications = async () => {
    try {
      const { error } = await supabase
        .from('expert_notifications')
        .delete()
        .eq('expert_id', user!.id)

      if (error) {
        console.error('Error clearing all notifications:', error)
        return
      }

      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Error clearing all notifications:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'appointment_booked':
      case 'appointment_rescheduled':
        if (notification.appointment_id) {
          router.push(`/expert-dashboard/history`)
        }
        break
      case 'chat_request':
      case 'session_started':
        if (notification.appointment_id) {
          router.push(`/session/chat/${notification.appointment_id}`)
        }
        break
      case 'session_ended':
        if (notification.appointment_id) {
          router.push(`/session/chat/${notification.appointment_id}`)
        }
        break
      case 'payment_received':
        router.push('/expert-dashboard/history')
        break
      default:
        break
    }
    
    setShowNotifications(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_booked':
        return <Calendar className="w-5 h-5 text-blue-400" />
      case 'appointment_cancelled':
        return <X className="w-5 h-5 text-red-400" />
      case 'appointment_rescheduled':
        return <RefreshCw className="w-5 h-5 text-yellow-400" />
      case 'chat_request':
        return <MessageCircle className="w-5 h-5 text-green-400" />
      case 'session_started':
        return <MessageCircle className="w-5 h-5 text-[#fdce20]" />
      case 'session_ended':
        return <CheckCircle className="w-5 h-5 text-purple-400" />
      case 'payment_received':
        return <AlertCircle className="w-5 h-5 text-green-400" />
      default:
        return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return 'bg-white/5 border-white/10'
    
    switch (type) {
      case 'appointment_booked':
        return 'bg-blue-500/10 border-blue-500/30'
      case 'appointment_cancelled':
        return 'bg-red-500/10 border-red-500/30'
      case 'appointment_rescheduled':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'chat_request':
        return 'bg-green-500/10 border-green-500/30'
      case 'session_started':
        return 'bg-[#fdce20]/10 border-[#fdce20]/30'
      case 'session_ended':
        return 'bg-purple-500/10 border-purple-500/30'
      case 'payment_received':
        return 'bg-green-500/10 border-green-500/30'
      default:
        return 'bg-white/5 border-white/10'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'read') return notification.read
    return true
  })

  if (!user || (profile?.role !== 'expert' && profile?.role !== 'astrologer' && profile?.role !== 'counsellor')) {
    return null
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-white/60 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#fdce20] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-[#1C1C24] rounded-xl shadow-2xl border border-white/10 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-[#fdce20] hover:text-amber-400 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-white/10">
            {(['all', 'unread', 'read'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'text-[#fdce20] border-b-2 border-[#fdce20]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                {filterType === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 bg-[#fdce20] text-black text-xs rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-80">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#fdce20]"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">
                  {filter === 'unread' ? 'No unread notifications' : 
                   filter === 'read' ? 'No read notifications' : 
                   'No notifications yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 transition-colors cursor-pointer hover:bg-white/5 ${
                      getNotificationColor(notification.type, notification.read)
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.read ? 'text-white/60' : 'text-white'}`}>
                          {notification.message}
                        </p>
                        {notification.user_name && (
                          <p className="text-xs text-white/40 mt-1">
                            {notification.user_name}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-white/40" />
                          <span className="text-xs text-white/40">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          {!notification.read && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#fdce20]/20 text-[#fdce20]">
                              New
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="p-1 text-white/40 hover:text-[#fdce20] transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="p-1 text-white/40 hover:text-red-400 transition-colors"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10 flex gap-2">
              <button
                onClick={() => {
                  setShowNotifications(false)
                  router.push('/expert-dashboard/history')
                }}
                className="flex-1 text-center text-sm text-[#fdce20] hover:text-amber-400 transition-colors"
              >
                View History
              </button>
              <button
                onClick={clearAllNotifications}
                className="text-center text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  )
}
