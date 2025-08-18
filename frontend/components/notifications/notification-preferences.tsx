"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Bell, Mail, Clock, Settings, Save, TestTube } from 'lucide-react'

interface NotificationPreferences {
  id: string
  user_id: string
  email: string
  new_testimonial_notifications: boolean
  weekly_summary: boolean
  pending_reminders: boolean
  pending_reminder_threshold: number
  reminder_frequency: string
  created_at: string
  updated_at: string
}

interface NotificationPreferencesProps {
  userId: string
  userEmail: string
}

export default function NotificationPreferences({ userId, userEmail }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPreferences()
  }, [userId])

  const fetchPreferences = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/preferences/${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      } else if (response.status === 404) {
        // Create default preferences if not found
        await createDefaultPreferences()
      } else {
        throw new Error('Failed to fetch preferences')
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createDefaultPreferences = async () => {
    try {
      const defaultPrefs = {
        user_id: userId,
        email: userEmail,
        new_testimonial_notifications: true,
        weekly_summary: true,
        pending_reminders: true,
        pending_reminder_threshold: 3,
        reminder_frequency: 'daily'
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/preferences/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(defaultPrefs)
      })

      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      } else {
        throw new Error('Failed to create preferences')
      }
    } catch (error) {
      console.error('Error creating preferences:', error)
      toast({
        title: "Error",
        description: "Failed to create notification preferences",
        variant: "destructive"
      })
    }
  }

  const updatePreferences = async () => {
    if (!preferences) return

    setSaving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/preferences/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      })

      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
        toast({
          title: "Success",
          description: "Notification preferences updated successfully"
        })
      } else {
        throw new Error('Failed to update preferences')
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const testNotification = async (type: string) => {
    setTesting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/test/${userId}?notification_type=${type}`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Test Sent",
          description: `Test ${type.replace('_', ' ')} notification sent successfully`
        })
      } else {
        throw new Error('Failed to send test notification')
      }
    } catch (error) {
      console.error('Error testing notification:', error)
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive"
      })
    } finally {
      setTesting(false)
    }
  }

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!preferences) return
    
    setPreferences(prev => prev ? {
      ...prev,
      [key]: !prev[key]
    } : null)
  }

  const handleThresholdChange = (value: string) => {
    if (!preferences) return
    
    setPreferences(prev => prev ? {
      ...prev,
      pending_reminder_threshold: parseInt(value)
    } : null)
  }

  const handleFrequencyChange = (value: string) => {
    if (!preferences) return
    
    setPreferences(prev => prev ? {
      ...prev,
      reminder_frequency: value
    } : null)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Loading preferences...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Failed to load preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchPreferences}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage your email notification settings for testimonial activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Settings
            </h3>
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium">
                Notification Email
              </Label>
              <Input
                id="email"
                type="email"
                value={preferences.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                This is the email address where notifications will be sent
              </p>
            </div>
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification Types
            </h3>
            
            <div className="space-y-4">
              {/* New Testimonial Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">New Testimonial Alerts</Label>
                  <p className="text-xs text-gray-500">
                    Get notified when someone submits a new testimonial
                  </p>
                </div>
                <Switch
                  checked={preferences.new_testimonial_notifications}
                  onCheckedChange={() => handleToggle('new_testimonial_notifications')}
                />
              </div>

              {/* Weekly Summary */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Weekly Summary</Label>
                  <p className="text-xs text-gray-500">
                    Receive a weekly summary of your testimonial activity
                  </p>
                </div>
                <Switch
                  checked={preferences.weekly_summary}
                  onCheckedChange={() => handleToggle('weekly_summary')}
                />
              </div>

              {/* Pending Reminders */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Pending Reminders</Label>
                  <p className="text-xs text-gray-500">
                    Get reminded when you have pending testimonials to review
                  </p>
                </div>
                <Switch
                  checked={preferences.pending_reminders}
                  onCheckedChange={() => handleToggle('pending_reminders')}
                />
              </div>
            </div>
          </div>

          {/* Reminder Settings */}
          {preferences.pending_reminders && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Reminder Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threshold" className="text-sm font-medium">
                    Reminder Threshold
                  </Label>
                  <Select
                    value={preferences.pending_reminder_threshold.toString()}
                    onValueChange={handleThresholdChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 testimonial</SelectItem>
                      <SelectItem value="3">3 testimonials</SelectItem>
                      <SelectItem value="5">5 testimonials</SelectItem>
                      <SelectItem value="10">10 testimonials</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Send reminder when you have this many pending testimonials
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-sm font-medium">
                    Reminder Frequency
                  </Label>
                  <Select
                    value={preferences.reminder_frequency}
                    onValueChange={handleFrequencyChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    How often to send pending reminders
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              onClick={updatePreferences} 
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => testNotification('new_testimonial')}
                disabled={testing}
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                Test New Testimonial
              </Button>
              
              <Button
                variant="outline"
                onClick={() => testNotification('weekly_summary')}
                disabled={testing}
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                Test Weekly Summary
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
