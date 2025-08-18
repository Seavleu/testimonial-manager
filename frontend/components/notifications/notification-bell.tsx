"use client"

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, Clock, AlertCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'new_testimonial' | 'weekly_summary' | 'pending_reminder' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: any
}

interface NotificationBellProps {
  userId: string
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (userId) {
      fetchNotifications()
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [userId])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    if (!userId) return
    
    try {
      setError(null)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/notifications/logs/${userId}?limit=20`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.logs && Array.isArray(data.logs)) {
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
        } else {
          setNotifications([])
          setUnreadCount(0)
        }
      } else {
        console.warn('Failed to fetch notifications:', response.status)
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setError('Failed to load notifications')
      setNotifications([])
      setUnreadCount(0)
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
      // In a real implementation, you'd call an API to mark as read
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      toast({
        title: "Success",
        description: "All notifications marked as read"
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_testimonial':
        return <Bell className="h-4 w-4 text-blue-600" />
      case 'weekly_summary':
        return <Check className="h-4 w-4 text-green-600" />
      case 'pending_reminder':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-1 h-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading notifications...
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-600">
                  {error}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                  <p className="text-sm">You'll see notifications here when they arrive</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors",
                        !notification.read && "bg-blue-50"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={cn(
                              "text-sm font-medium",
                              !notification.read && "text-blue-900"
                            )}>
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className={cn(
                            "text-sm mt-1",
                            !notification.read ? "text-blue-700" : "text-gray-600"
                          )}>
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Footer */}
              <div className="p-3 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {unreadCount} unread
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600 hover:text-blue-700 p-1 h-auto"
                    onClick={() => {
                      setIsOpen(false)
                      // Navigate to notification settings
                      window.location.href = '/dashboard/notifications'
                    }}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
