'use client'

import { useState, useEffect } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface NotificationProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose?: () => void
}

export default function Notification({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-[#fdce20]/20 to-amber-500/20',
          border: 'border-[#fdce20]/30',
          text: 'text-[#fdce20]',
          iconBg: 'bg-[#fdce20]/20'
        }
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500/20 to-red-600/20',
          border: 'border-red-500/30',
          text: 'text-red-400',
          iconBg: 'bg-red-500/20'
        }
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          iconBg: 'bg-yellow-500/20'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-[#co84fc]/20 to-blue-500/20',
          border: 'border-[#co84fc]/30',
          text: 'text-[#co84fc]',
          iconBg: 'bg-[#co84fc]/20'
        }
    }
  }

  const colors = getColors()

  return (
    <div className={`fixed top-4 right-4 z-[9999] max-w-md w-full transform transition-all duration-300 ease-out ${
      isAnimating ? 'opacity-0 scale-95 translate-x-2' : 'opacity-100 scale-100 translate-x-0'
    }`}>
      <div className={`${colors.bg} ${colors.border} border backdrop-blur-md rounded-xl p-4 shadow-2xl`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${colors.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <div className={colors.text}>
              {getIcon()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`${colors.text} text-sm font-medium leading-relaxed`}>
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsAnimating(true)
              setTimeout(() => {
                setIsVisible(false)
                onClose?.()
              }, 300)
            }}
            className={`${colors.text}/60 hover:${colors.text} transition-colors duration-200 flex-shrink-0`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper function to show notifications
export const showNotification = (message: string, type: NotificationProps['type'] = 'info') => {
  const notificationId = `notification-${Date.now()}-${Math.random()}`
  
  // Create and append notification to DOM
  const notificationContainer = document.createElement('div')
  notificationContainer.id = notificationId
  document.body.appendChild(notificationContainer)
  
  // Render notification
  const root = createRoot(notificationContainer)
  root.render(<Notification message={message} type={type} />)
  
  // Auto-remove after animation
  setTimeout(() => {
    root.unmount()
    document.body.removeChild(notificationContainer)
  }, 4500)
}
