'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Legend
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Star, 
  Eye, 
  Download, 
  Calendar,
  Filter,
  RefreshCw,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon
} from 'lucide-react'

interface AnalyticsData {
  testimonials: {
    total: number
    approved: number
    pending: number
    rejected: number
    withVideos: number
    withPhotos: number
    averageRating: number
    totalRatings: number
  }
  trends: {
    daily: Array<{ date: string; count: number; approved: number; rating: number }>
    weekly: Array<{ week: string; count: number; growth: number }>
    monthly: Array<{ month: string; count: number; growth: number }>
  }
  engagement: {
    views: number
    clicks: number
    shares: number
    conversions: number
  }
  categories: Array<{ name: string; count: number; percentage: number }>
  sources: Array<{ source: string; count: number; percentage: number }>
}

interface EnhancedAnalyticsDashboardProps {
  userId: string
}

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: LineChartIcon },
  { value: 'area', label: 'Area Chart', icon: AreaChartIcon },
  { value: 'pie', label: 'Pie Chart', icon: PieChartIcon }
]

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
]

export function EnhancedAnalyticsDashboard({ userId }: EnhancedAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [chartType, setChartType] = useState('bar')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showGoals, setShowGoals] = useState(false)
  const [goals, setGoals] = useState({
    monthlyTestimonials: 50,
    approvalRate: 90,
    averageRating: 4.5,
    engagementRate: 75
  })
  const { toast } = useToast()

  // Mock data for demonstration
  const mockData: AnalyticsData = {
    testimonials: {
      total: 247,
      approved: 198,
      pending: 32,
      rejected: 17,
      withVideos: 45,
      withPhotos: 89,
      averageRating: 4.7,
      totalRatings: 156
    },
    trends: {
      daily: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: Math.floor(Math.random() * 10) + 1,
        approved: Math.floor(Math.random() * 8) + 1,
        rating: Math.random() * 2 + 3.5
      })),
      weekly: Array.from({ length: 12 }, (_, i) => ({
        week: `Week ${i + 1}`,
        count: Math.floor(Math.random() * 50) + 20,
        growth: Math.random() * 40 - 20
      })),
      monthly: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        count: Math.floor(Math.random() * 200) + 100,
        growth: Math.random() * 60 - 30
      }))
    },
    engagement: {
      views: 15420,
      clicks: 3240,
      shares: 890,
      conversions: 156
    },
    categories: [
      { name: 'Product Quality', count: 67, percentage: 27 },
      { name: 'Customer Service', count: 54, percentage: 22 },
      { name: 'Value for Money', count: 43, percentage: 17 },
      { name: 'User Experience', count: 38, percentage: 15 },
      { name: 'Recommendation', count: 45, percentage: 18 }
    ],
    sources: [
      { source: 'Website Form', count: 134, percentage: 54 },
      { source: 'Email Campaign', count: 67, percentage: 27 },
      { source: 'Social Media', count: 34, percentage: 14 },
      { source: 'Referral', count: 12, percentage: 5 }
    ]
  }

  useEffect(() => {
    if (userId) {
      fetchAnalyticsData()
    }
  }, [userId, dateRange])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAnalyticsData()
      }, 30000) // Refresh every 30 seconds
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      // In production, this would fetch from your API
      // const response = await fetch(`/api/analytics/${userId}?range=${dateRange}`)
      // const analyticsData = await response.json()
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      setData(mockData)
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      toast({
        title: 'Export Started',
        description: `Generating ${format.toUpperCase()} report...`
      })
      
      // In production, this would call your export API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate export delay
      
      toast({
        title: 'Export Complete',
        description: `${format.toUpperCase()} report downloaded successfully`
      })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate report',
        variant: 'destructive'
      })
    }
  }

  const renderChart = () => {
    if (!data) return null

    const chartData = data.trends.monthly

    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} />
            <Line type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        )
      
      case 'area':
        return (
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
          </AreaChart>
        )
      
      case 'pie':
        return (
          <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <Pie
              data={data.categories}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(${200 + index * 60}, 70%, 50%)`} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )
      
      default: // bar chart
        return (
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        )
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Start collecting testimonials to see your analytics here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights into your testimonial performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Testimonials</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.testimonials.total}</div>
            <p className="text-xs text-muted-foreground">
              +{data.trends.monthly[data.trends.monthly.length - 1]?.growth || 0}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.testimonials.approved / data.testimonials.total) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.testimonials.approved} of {data.testimonials.total} approved
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.testimonials.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Based on {data.testimonials.totalRatings} ratings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.engagement.clicks / data.engagement.views) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.engagement.clicks} clicks from {data.engagement.views} views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Testimonial growth and performance over time</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Categories Distribution</CardTitle>
            <CardDescription>How testimonials are categorized</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.categories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `hsl(${200 + index * 60}, 70%, 50%)` }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{category.count}</span>
                    <Badge variant="secondary">{category.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sources Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Sources Analysis</CardTitle>
            <CardDescription>Where testimonials come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sources.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{source.source}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{source.count}</span>
                    <Badge variant="secondary">{source.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals and Export */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowGoals(!showGoals)}
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          {showGoals ? 'Hide Goals' : 'Set Goals'}
        </Button>
        
        <div className="flex gap-2">
          <Button onClick={() => exportReport('pdf')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={() => exportReport('excel')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => exportReport('csv')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Goals Panel */}
      {showGoals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Goals
            </CardTitle>
            <CardDescription>Set and track your testimonial performance goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="monthly-goal">Monthly Testimonials Goal</Label>
                  <Input
                    id="monthly-goal"
                    type="number"
                    value={goals.monthlyTestimonials}
                    onChange={(e) => setGoals(prev => ({ ...prev, monthlyTestimonials: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="approval-goal">Approval Rate Goal (%)</Label>
                  <Input
                    id="approval-goal"
                    type="number"
                    value={goals.approvalRate}
                    onChange={(e) => setGoals(prev => ({ ...prev, approvalRate: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rating-goal">Average Rating Goal</Label>
                  <Input
                    id="rating-goal"
                    type="number"
                    step="0.1"
                    value={goals.averageRating}
                    onChange={(e) => setGoals(prev => ({ ...prev, averageRating: parseFloat(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="engagement-goal">Engagement Rate Goal (%)</Label>
                  <Input
                    id="engagement-goal"
                    type="number"
                    value={goals.engagementRate}
                    onChange={(e) => setGoals(prev => ({ ...prev, engagementRate: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{goals.monthlyTestimonials}</div>
                  <div className="text-sm text-gray-600">Monthly Goal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{goals.approvalRate}%</div>
                  <div className="text-sm text-gray-600">Approval Goal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{goals.averageRating}</div>
                  <div className="text-sm text-gray-600">Rating Goal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{goals.engagementRate}%</div>
                  <div className="text-sm text-gray-600">Engagement Goal</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
