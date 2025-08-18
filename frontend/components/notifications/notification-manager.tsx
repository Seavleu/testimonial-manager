"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/lib/auth'

interface Notification {
  id: string
  type: 'new_testimonial' | 'weekly_summary' | 'pending_reminder' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: any
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  addNotification: (notification: Notification) => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/logs/${user.id}?limit=50`)
      
      if (response.ok) {
        const data = await response.json()
        const formattedNotifications = data.logs.map((log: any) => ({
          id: log.id,
          type: log.notification_type,
          title: getNotificationTitle(log.notification_type),
          message: getNotificationMessage(log.notification_type, log.data),
          timestamp: log.created_at,
          read: log.status === 'sent',
          data: log.data
        }))
        
        setNotifications(formattedNotifications)
        setUnreadCount(formattedNotifications.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationTitle = (type: string): string => {
    switch (type) {
      case 'new_testimonial':
        return 'New Testimonial Received'
      case 'weekly_summary':
        return 'Weekly Summary Available'
      case 'pending_reminder':
        return 'Pending Testimonials Reminder'
      default:
        return 'Notification'
    }
  }

  const getNotificationMessage = (type: string, data: any): string => {
    switch (type) {
      case 'new_testimonial':
        return `New testimonial from ${data?.name || 'Anonymous'}`
      case 'weekly_summary':
        return `Weekly summary with ${data?.total_testimonials || 0} testimonials`
      case 'pending_reminder':
        return `${data?.pending_count || 0} testimonials waiting for review`
      default:
        return 'You have a new notification'
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      // In a real implementation, you'd call an API to mark as read
      // await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      
      // In a real implementation, you'd call an API to mark all as read
      // await fetch(`/api/notifications/mark-all-read`, { method: 'PUT' })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
    if (!notification.read) {
      setUnreadCount(prev => prev + 1)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
      
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.id])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Hook for real-time notification updates
export function useRealTimeNotifications() {
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Set up WebSocket connection for real-time notifications
    // This is a placeholder for real WebSocket implementation
    const handleNewNotification = (event: MessageEvent) => {
      try {
        const notification = JSON.parse(event.data)
        addNotification(notification)
      } catch (error) {
        console.error('Error parsing notification:', error)
      }
    }

    // Simulate real-time notifications for demo purposes
    const simulateNotification = () => {
      const demoNotifications = [
        {
          id: `demo-${Date.now()}`,
          type: 'new_testimonial' as const,
          title: 'New Testimonial Received',
          message: 'New testimonial from John Doe',
          timestamp: new Date().toISOString(),
          read: false,
          data: { name: 'John Doe' }
        },
        {
          id: `demo-${Date.now() + 1}`,
          type: 'pending_reminder' as const,
          title: 'Pending Testimonials Reminder',
          message: '3 testimonials waiting for review',
          timestamp: new Date().toISOString(),
          read: false,
          data: { pending_count: 3 }
        }
      ]

      // Only simulate if no real notifications exist
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const notification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)]
        addNotification(notification)
      }
    }

    const interval = setInterval(simulateNotification, 30000)
    return () => clearInterval(interval)
  }, [addNotification])
}

// Component for displaying notification badges
export function NotificationBadge() {
  const { unreadCount } = useNotifications()

  if (unreadCount === 0) return null

  return (
    <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
      {unreadCount > 99 ? '99+' : unreadCount}
    </div>
  )
}

// Component for notification toast
export function NotificationToast() {
  const { notifications, markAsRead } = useNotifications()

  useEffect(() => {
    // Show toast for new unread notifications
    const unreadNotifications = notifications.filter(n => !n.read)
    
    unreadNotifications.forEach(notification => {
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        })
      }
    })
  }, [notifications])

  return null
}
