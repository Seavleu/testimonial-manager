'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { analyticsService, AnalyticsStats, TimelineData } from '@/lib/analytics'
import { MetricsCard } from '@/components/dashboard/metrics-card'
import { GrowthChart } from '@/components/dashboard/growth-chart'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { TimelineChart } from '@/components/dashboard/timeline-chart'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Star, 
  Clock,
  Calendar,
  Target,
  Activity,
  ArrowLeft,
  RefreshCw,
  Download,
  Filter,
  AlertCircle
} from 'lucide-react'

export default function AnalyticsDashboardPage() {
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
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
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
  const fetchAnalyticsData = useCallback(async () => {
    if (!mounted || !user) return

    try {
      setLoadingStats(true)
      setError(null)

      // Fetch analytics stats and timeline data in parallel
      const [statsData, timelineData] = await Promise.all([
        analyticsService.getAnalyticsStats(user.id),
        analyticsService.getAnalyticsTimeline(user.id)
      ])

      setStats(statsData)
      setTimelineData(timelineData)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
    } finally {
      setLoadingStats(false)
    }
  }, [mounted, user])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!mounted || !user) return

    const interval = setInterval(() => {
      fetchAnalyticsData()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [fetchAnalyticsData, mounted, user])

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics dashboard...</p>
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
        {/* Header Section */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Comprehensive insights into your testimonial performance
              </p>
              {lastRefresh && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <Button 
                variant="outline"
                onClick={fetchAnalyticsData}
                disabled={loadingStats}
                className="border-2 hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
                {loadingStats ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/export')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800 font-medium">Error loading analytics data</p>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAnalyticsData}
              className="mt-2 border-red-200 text-red-700 hover:bg-red-50"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Testimonials"
            value={stats.total}
            description="All-time testimonials"
            icon={MessageSquare}
            loading={loadingStats}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          />
          <MetricsCard
            title="Approved"
            value={`${stats.approved}`}
            description="Published testimonials"
            icon={Star}
            loading={loadingStats}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          />
          <MetricsCard
            title="This Month"
            value={Math.round(stats.monthlyGrowth)}
            description="New this month"
            icon={Calendar}
            loading={loadingStats}
            trend={{
              value: Math.round(stats.monthlyGrowth),
              isPositive: stats.monthlyGrowth >= 0,
              label: 'vs last month'
            }}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          />
          <MetricsCard
            title="Avg Response Time"
            value={`${Math.round(stats.averageResponseTime)}d`}
            description="Days to approval"
            icon={Clock}
            loading={loadingStats}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <GrowthChart 
              data={stats.monthlyTrends} 
              loading={loadingStats}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
            />
          </div>
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
          data={timelineData} 
          loading={loadingStats}
          className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8"
        />

        {/* Loading State */}
        {loadingStats && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-gray-700 font-medium">Loading analytics data...</p>
              </div>
              <p className="text-sm text-gray-500 mt-2">Fetching real-time statistics and trends</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
