'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { TestimonialsTable } from '@/components/dashboard/testimonials-table'
import { MetricsCard } from '@/components/dashboard/metrics-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { analyticsService, AnalyticsStats } from '@/lib/analytics'
import { GrowthChart } from '@/components/dashboard/growth-chart'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { TimelineChart } from '@/components/dashboard/timeline-chart'
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Download, 
  Share2, 
  Settings,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Award,
  Calendar,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<AnalyticsStats>({
    total: 0,
    approved: 0,
    pending: 0,
    monthlyGrowth: 0,
    approvalRate: 0,
    averageResponseTime: 0,
    monthlyTrends: [],
    approvalTrends: []
  })
  const [timeline, setTimeline] = useState<any[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user && mounted) {
      router.push('/login')
    }
  }, [user, loading, router, mounted])

  // Fetch real analytics data
  const fetchDashboardStats = useCallback(async () => {
    if (!mounted || !user?.id) {
      console.log('No user ID available, skipping analytics fetch')
      return
    }

    try {
      setLoadingStats(true)
      setError(null)

      const [statsData, timelineData] = await Promise.all([
        analyticsService.getAnalyticsStats(user.id),
        analyticsService.getAnalyticsTimeline(user.id)
      ])

      setStats(statsData)
      setTimeline(timelineData)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      
      // Set fallback data instead of showing error
      const fallbackStats: AnalyticsStats = {
        total: 0,
        approved: 0,
        pending: 0,
        monthlyGrowth: 0,
        approvalRate: 0,
        averageResponseTime: 0,
        monthlyTrends: [],
        approvalTrends: []
      }
      
      const fallbackTimeline: any[] = [] // Assuming TimelineData is any[] or similar
      
      setStats(fallbackStats)
      setTimeline(fallbackTimeline)
      setLastRefresh(new Date())
      
      // Only show error for non-connection issues
      if (err instanceof Error && !err.message.includes('Failed to fetch')) {
        setError('Analytics data temporarily unavailable')
      }
    } finally {
      setLoadingStats(false)
    }
  }, [mounted, user])

  useEffect(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  // Auto-refresh every 10 minutes
  useEffect(() => {
    if (!mounted || !user) return

    const interval = setInterval(() => {
      fetchDashboardStats()
    }, 10 * 60 * 1000) // 10 minutes

    return () => clearInterval(interval)
  }, [fetchDashboardStats, mounted, user])

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user.email?.split(`@`)[0]}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Here's what's happening with your testimonials today
              </p>
              {lastRefresh && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <Button 
                onClick={() => router.push('/collect')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Collect New
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/widget-test')}
                className="border-2 hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Widget
              </Button>
              <Button 
                variant="outline"
                onClick={fetchDashboardStats}
                disabled={loadingStats}
                className="border-2 hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
                {loadingStats ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800 font-medium">Error loading dashboard stats</p>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDashboardStats}
              className="mt-2 border-red-200 text-red-700 hover:bg-red-50"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Testimonials"
            value={stats.total}
            description="All-time testimonials"
            icon={MessageSquare}
            loading={loadingStats}
            trend={{
              value: Math.round(stats.monthlyGrowth),
              isPositive: stats.monthlyGrowth >= 0,
              label: 'this month'
            }}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          />
          <MetricsCard
            title="Approved"
            value={stats.approved}
            description="Published testimonials"
            icon={Star}
            loading={loadingStats}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          />
          <MetricsCard
            title="Pending Review"
            value={stats.pending}
            description="Needs attention"
            icon={Clock}
            loading={loadingStats}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          />
          <MetricsCard
            title="Approval Rate"
            value={`${Math.round(stats.approvalRate)}%`}
            description="Quality indicator"
            icon={CheckCircle}
            loading={loadingStats}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <GrowthChart 
            data={stats.monthlyTrends} 
            loading={loadingStats}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
          />
          <PerformanceChart
            approvalRate={stats.approvalRate}
            averageResponseTime={stats.averageResponseTime}
            totalTestimonials={stats.total}
            approvedTestimonials={stats.approved}
            pendingTestimonials={stats.pending}
            loading={loadingStats}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
          />
        </div>

        {/* Timeline Chart */}
        <TimelineChart 
          data={timeline} 
          loading={loadingStats}
          className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8"
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Share2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Share Collection Link</h3>
                  <p className="text-sm text-gray-600">Get more testimonials</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  const link = `${window.location.origin}/collect?userId=${user.id}`;
                  navigator.clipboard.writeText(link);
                }}
              >
                Copy Link
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Download className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Export Data</h3>
                  <p className="text-sm text-gray-600">Download in multiple formats</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => router.push('/dashboard/export')}
              >
                Export Now
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Widget Settings</h3>
                  <p className="text-sm text-gray-600">Customize appearance</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                onClick={() => router.push('/dashboard/settings')}
              >
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Monthly Progress
            </CardTitle>
            <CardDescription>
              Your testimonial collection progress this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Collection Goal</span>
                <span className="text-sm text-gray-600">{stats.total}/20 testimonials</span>
              </div>
              <Progress value={(stats.total / 20) * 100} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Target: 20 testimonials</span>
                <span className="text-green-600 font-medium">
                  {Math.round((stats.total / 20) * 100)}% complete
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-orange-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest testimonials and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">New testimonial approved</p>
                  <p className="text-sm text-gray-600">Sarah Johnson's testimonial was approved</p>
                </div>
                <Badge variant="secondary" className="ml-auto">2 hours ago</Badge>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">New testimonial received</p>
                  <p className="text-sm text-gray-600">Mike Chen submitted a testimonial</p>
                </div>
                <Badge variant="secondary" className="ml-auto">5 hours ago</Badge>
              </div>
              <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                <Download className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Data exported</p>
                  <p className="text-sm text-gray-600">Testimonials exported to CSV</p>
                </div>
                <Badge variant="secondary" className="ml-auto">1 day ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials Management */}
        <TestimonialsTable userId={user.id} />
      </main>
    </div>
  )
}