'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Star, LogOut, LayoutDashboard, BarChart3, Bell, Palette, Zap } from 'lucide-react'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/error-boundary'

// Simple fallback notification component
const FallbackNotificationBell = () => (
  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
    <Bell className="h-4 w-4" />
    <span>Notifications</span>
  </Button>
)

// Dynamically import NotificationBell to avoid SSR issues
const NotificationBell = dynamic(() => import('@/components/notifications/notification-bell'), {
  ssr: false,
  loading: FallbackNotificationBell
})

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Star className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">TestimonialFlow</span>
        </Link>
        
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Button>
              </Link>
              <Link href="/widget-test">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Widget Test</span>
                </Button>
              </Link>
              <Link href="/dashboard/widget-customizer">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Customizer</span>
                </Button>
              </Link>
              <Link href="/dashboard/automation">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Automation</span>
                </Button>
              </Link>
              {user?.id ? (
                <ErrorBoundary fallback={<FallbackNotificationBell />}>
                  <NotificationBell userId={user.id} />
                </ErrorBoundary>
              ) : (
                <FallbackNotificationBell />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/login?mode=signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}