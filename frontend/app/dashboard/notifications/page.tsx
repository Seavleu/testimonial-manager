"use client"

import { useAuth } from '@/lib/auth'
import NotificationPreferences from '@/components/notifications/notification-preferences'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Mail, Shield, Info, History } from 'lucide-react'
import Link from 'next/link'

export default function NotificationsPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access notification settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              You need to be authenticated to manage your notification preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="h-8 w-8 text-indigo-600" />
            Notification Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your email notifications and stay informed about your testimonial activities
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Receive email alerts for new testimonials, weekly summaries, and pending reminders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Privacy & Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Full control over what notifications you receive and when
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-purple-600" />
                Test & Verify
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Test your notification settings to ensure everything works correctly
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notification Preferences */}
        <NotificationPreferences 
          userId={user.id} 
          userEmail={user.email || 'user@example.com'} 
        />

        {/* Quick Actions */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard/notifications/history">
                  <Button variant="outline" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    View Notification History
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">New Testimonial Alerts</h4>
                <p className="text-sm text-gray-600">
                  Get instant notifications when someone submits a new testimonial. This helps you stay on top of new content and respond quickly to customer feedback.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Weekly Summaries</h4>
                <p className="text-sm text-gray-600">
                  Receive a comprehensive weekly report of your testimonial activity, including new submissions, approvals, and overall performance metrics.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Pending Reminders</h4>
                <p className="text-sm text-gray-600">
                  Never let testimonials sit unapproved for too long. Get reminded when you have pending testimonials waiting for your review.
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Important Notes</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You can unsubscribe from all notifications at any time</li>
                  <li>• Test notifications are sent to your registered email address</li>
                  <li>• Notification preferences are saved automatically</li>
                  <li>• You can adjust reminder thresholds based on your workflow</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
