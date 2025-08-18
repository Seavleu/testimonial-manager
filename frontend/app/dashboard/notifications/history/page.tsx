"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Bell, Filter, Search, Trash2, Check, Clock, AlertCircle, Mail } from 'lucide-react'

interface Notification {
  id: string
  type: 'new_testimonial' | 'weekly_summary' | 'pending_reminder' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: any
}

export default function NotificationHistoryPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
    }
  }, [user?.id])

  const fetchNotifications = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/logs/${user.id}?limit=100`)
      
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
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: "Error",
        description: "Failed to load notification history",
        variant: "destructive"
      })
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_testimonial':
        return <Bell className="h-4 w-4 text-blue-600" />
      case 'weekly_summary':
        return <Mail className="h-4 w-4 text-green-600" />
      case 'pending_reminder':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.type === filter
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast({
        title: "Success",
        description: "All notifications marked as read"
      })
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const clearHistory = async () => {
    try {
      setNotifications([])
      toast({
        title: "Success",
        description: "Notification history cleared"
      })
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access notification history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              You need to be authenticated to view your notification history.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="h-8 w-8 text-indigo-600" />
            Notification History
          </h1>
          <p className="mt-2 text-gray-600">
            View and manage all your notification history
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filter */}
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Notifications</SelectItem>
                      <SelectItem value="new_testimonial">New Testimonials</SelectItem>
                      <SelectItem value="weekly_summary">Weekly Summaries</SelectItem>
                      <SelectItem value="pending_reminder">Pending Reminders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={markAllAsRead}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Mark All Read
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearHistory}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Notifications ({filteredNotifications.length})</span>
              <Badge variant="secondary">
                {notifications.filter(n => !n.read).length} unread
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No notifications found</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-sm font-medium ${
                              !notification.read ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <Badge variant="default" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(notification.timestamp)}
                          </div>
                        </div>
                        <p className={`text-sm mt-1 ${
                          !notification.read ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        {notification.data && (
                          <div className="mt-2 text-xs text-gray-500">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(notification.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
