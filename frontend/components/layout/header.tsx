'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Star,
  LogOut,
  LayoutDashboard,
  BarChart3,
  Bell,
  Palette,
  Zap,
  Search,
  User,
  Settings,
  HelpCircle,
  Plus,
  FileText,
  Download,
  ChevronDown,
  Menu,
  X,
  Shield,
  Brain,
  Share2
} from 'lucide-react'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/error-boundary'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useState, useRef, useEffect } from 'react'
import { SearchResults } from '@/components/search/search-results'

// Simple fallback notification component
const FallbackNotificationBell = () => (
  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
    <Bell className="h-4 w-4" />
    <span className="hidden sm:inline">Notifications</span>
  </Button>
)

// Dynamically import NotificationBell to avoid SSR issues
const NotificationBell = dynamic(() => import('@/components/notifications/notification-bell'), {
  ssr: false,
  loading: FallbackNotificationBell
})

export function Header() {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const getUserInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const navigationItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dashboard/ml-analytics', icon: Brain, label: 'ML Analytics' },
    { href: '/dashboard/automation', icon: Zap, label: 'Automation' },
    { href: '/dashboard/widget-customizer', icon: Palette, label: 'Customizer' },
    { href: '/widget-test', icon: Star, label: 'Widget Test' },
  ]

  const quickActions = [
    { href: '/collect', icon: Plus, label: 'Collect Testimonial' },
    { href: '/dashboard/export', icon: Download, label: 'Export Data' },
    { href: '/dashboard/security', icon: Shield, label: 'Security' },
    { href: '/dashboard/compliance', icon: FileText, label: 'Compliance' },
    { href: '/dashboard/social-media', icon: Share2, label: 'Social Media' },
  ]

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSearchFocus = () => {
    setIsSearchFocused(true)
  }

  const handleSearchBlur = () => {
    // Delay closing to allow for clicks on search results
    setTimeout(() => {
      setIsSearchFocused(false)
    }, 200)
  }

  const handleResultClick = () => {
    setIsSearchFocused(false)
    setSearchQuery('')
  }

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Star className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">TestimonialFlow</span>
          </Link>

          {/* Search Bar */}
        
          {/* Navigation - Only Search, Notifications, and User Dropdown */}
          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Notifications */}
                {user?.id ? (
                  <ErrorBoundary fallback={<FallbackNotificationBell />}>
                    <NotificationBell userId={user.id} />
                  </ErrorBoundary>
                ) : (
                  <FallbackNotificationBell />
                )}

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                          {getUserInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden xl:block text-left">
                        <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                            {getUserInitials(user?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{user?.name || 'User'}</div>
                          <div className="text-xs text-gray-500">{user?.email}</div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Main Navigation Items */}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center space-x-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/analytics" className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Analytics</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/automation" className="flex items-center space-x-2">
                        <Zap className="h-4 w-4" />
                        <span>Automation</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/widget-customizer" className="flex items-center space-x-2">
                        <Palette className="h-4 w-4" />
                        <span>Widget Customizer</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/widget-test" className="flex items-center space-x-2">
                        <Star className="h-4 w-4" />
                        <span>Widget Test</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Quick Actions */}
                    <DropdownMenuItem asChild>
                      <Link href="/collect" className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Collect Testimonial</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/export" className="flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Export Data</span>
                      </Link>
                    </DropdownMenuItem>
                                           <DropdownMenuItem asChild>
                         <Link href="/dashboard/security" className="flex items-center space-x-2">
                           <Shield className="h-4 w-4" />
                           <span>Security</span>
                         </Link>
                       </DropdownMenuItem>
                       
                                                   <DropdownMenuItem asChild>
                              <Link href="/dashboard/compliance" className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>Compliance</span>
                              </Link>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/social-media" className="flex items-center space-x-2">
                                <Share2 className="h-4 w-4" />
                                <span>Social Media</span>
                              </Link>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/notifications" className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>Notification Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/help" className="flex items-center space-x-2">
                        <HelpCircle className="h-4 w-4" />
                        <span>Help & Support</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">TestimonialFlow</span>
          </Link>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            {user && (
              <>
                {/* Mobile Notifications */}
                {user?.id ? (
                  <ErrorBoundary fallback={<FallbackNotificationBell />}>
                    <NotificationBell userId={user.id} />
                  </ErrorBoundary>
                ) : (
                  <FallbackNotificationBell />
                )}

                {/* Mobile User Avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                          {getUserInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                            {getUserInitials(user?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{user?.name || 'User'}</div>
                          <div className="text-xs text-gray-500">{user?.email}</div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Main Navigation Items */}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center space-x-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/analytics" className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Analytics</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/automation" className="flex items-center space-x-2">
                        <Zap className="h-4 w-4" />
                        <span>Automation</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/widget-customizer" className="flex items-center space-x-2">
                        <Palette className="h-4 w-4" />
                        <span>Widget Customizer</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/widget-test" className="flex items-center space-x-2">
                        <Star className="h-4 w-4" />
                        <span>Widget Test</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Quick Actions */}
                    <DropdownMenuItem asChild>
                      <Link href="/collect" className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Collect Testimonial</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/export" className="flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Export Data</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && user && (
          <div className="lg:hidden mt-4 pb-4 border-t pt-4">
            {/* Mobile Search */}
            <div className="mb-4 relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search testimonials, analytics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="pl-10 pr-4 py-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              {/* Mobile Search Results */}
              {isSearchFocused && user?.id && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <SearchResults 
                    query={searchQuery} 
                    userId={user.id}
                    onResultClick={handleResultClick}
                  />
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start flex items-center space-x-3 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
              
              <div className="border-t pt-2 mt-4">
                <div className="text-xs font-medium text-gray-500 mb-2 px-3">Quick Actions</div>
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start flex items-center space-x-3 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <action.icon className="h-4 w-4" />
                      <span>{action.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}