'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  Legend
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'

interface PredictionData {
  testimonials: {
    current: number
    predicted: number
    confidence: number
    trend: 'up' | 'down' | 'stable'
    growthRate: number
  }
  engagement: {
    current: number
    predicted: number
    confidence: number
    trend: 'up' | 'down' | 'stable'
  }
  quality: {
    current: number
    predicted: number
    confidence: number
    trend: 'up' | 'down' | 'stable'
  }
  seasonal: Array<{ month: string; actual: number; predicted: number; confidence: number }>
  trends: Array<{ period: string; actual: number; predicted: number; confidence: number }>
  insights: Array<{
    id: string
    type: 'trend' | 'anomaly' | 'opportunity' | 'warning'
    title: string
    description: string
    confidence: number
    impact: 'high' | 'medium' | 'low'
    actionable: boolean
  }>
  recommendations: Array<{
    id: string
    category: string
    title: string
    description: string
    expectedImpact: number
    effort: 'low' | 'medium' | 'high'
    priority: 'high' | 'medium' | 'low'
  }>
}

interface PredictiveAnalyticsProps {
  userId: string
}

const PREDICTION_PERIODS = [
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' }
]

const CONFIDENCE_LEVELS = [
  { value: 'high', label: 'High (80%+)', color: 'text-green-600' },
  { value: 'medium', label: 'Medium (60-80%)', color: 'text-yellow-600' },
  { value: 'low', label: 'Low (<60%)', color: 'text-red-600' }
]

export function PredictiveAnalytics({ userId }: PredictiveAnalyticsProps) {
  const [data, setData] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [predictionPeriod, setPredictionPeriod] = useState('3m')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showConfidence, setShowConfidence] = useState(true)
  const { toast } = useToast()

  // Mock data for demonstration
  const mockData: PredictionData = {
    testimonials: {
      current: 247,
      predicted: 312,
      confidence: 85,
      trend: 'up',
      growthRate: 26.3
    },
    engagement: {
      current: 21.0,
      predicted: 24.5,
      confidence: 78,
      trend: 'up'
    },
    quality: {
      current: 4.7,
      predicted: 4.8,
      confidence: 92,
      trend: 'up'
    },
    seasonal: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
      actual: Math.floor(Math.random() * 50) + 20,
      predicted: Math.floor(Math.random() * 50) + 20,
      confidence: Math.floor(Math.random() * 30) + 70
    })),
    trends: Array.from({ length: 8 }, (_, i) => ({
      period: `Week ${i + 1}`,
      actual: Math.floor(Math.random() * 30) + 15,
      predicted: Math.floor(Math.random() * 30) + 15,
      confidence: Math.floor(Math.random() * 30) + 70
    })),
    insights: [
      {
        id: '1',
        type: 'trend',
        title: 'Strong Growth in Video Testimonials',
        description: 'Video testimonials are showing 40% higher engagement rates than text-only testimonials. Consider encouraging more video submissions.',
        confidence: 89,
        impact: 'high',
        actionable: true
      },
      {
        id: '2',
        type: 'opportunity',
        title: 'Peak Collection Time Identified',
        description: 'Testimonials collected between 2-4 PM show 25% higher quality scores. Optimize collection timing.',
        confidence: 76,
        impact: 'medium',
        actionable: true
      },
      {
        id: '3',
        type: 'warning',
        title: 'Declining Response Rate',
        description: 'Email campaign response rates have decreased by 15% over the last month. Review email strategy.',
        confidence: 82,
        impact: 'medium',
        actionable: true
      },
      {
        id: '4',
        type: 'anomaly',
        title: 'Unusual Spike in Weekend Submissions',
        description: 'Weekend testimonial submissions increased by 300% last week. Investigate potential causes.',
        confidence: 65,
        impact: 'low',
        actionable: false
      }
    ],
    recommendations: [
      {
        id: '1',
        category: 'Collection Strategy',
        title: 'Implement Video-First Collection',
        description: 'Prioritize video testimonial collection to capitalize on higher engagement rates.',
        expectedImpact: 25,
        effort: 'medium',
        priority: 'high'
      },
      {
        id: '2',
        category: 'Timing Optimization',
        title: 'Optimize Collection Windows',
        description: 'Focus collection efforts during peak hours (2-4 PM) for better quality submissions.',
        expectedImpact: 15,
        effort: 'low',
        priority: 'medium'
      },
      {
        id: '3',
        category: 'Email Strategy',
        title: 'Revamp Email Campaigns',
        description: 'Update email templates and timing to improve declining response rates.',
        expectedImpact: 20,
        effort: 'medium',
        priority: 'high'
      },
      {
        id: '4',
        category: 'Quality Improvement',
        title: 'Enhanced Review Process',
        description: 'Implement additional quality checks to maintain high approval rates.',
        expectedImpact: 10,
        effort: 'high',
        priority: 'medium'
      }
    ]
  }

  useEffect(() => {
    if (userId) {
      fetchPredictions()
    }
  }, [userId, predictionPeriod])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchPredictions()
      }, 60000) // Refresh every minute
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchPredictions = async () => {
    try {
      setLoading(true)
      // In production, this would fetch from your AI/ML API
      // const response = await fetch(`/api/analytics/predictions/${userId}?period=${predictionPeriod}`)
      // const predictionsData = await response.json()
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay
      setData(mockData)
    } catch (error) {
      console.error('Failed to fetch predictions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load predictive analytics',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case 'opportunity':
        return <Target className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'anomaly':
        return <Brain className="h-4 w-4 text-purple-600" />
      default:
        return <Lightbulb className="h-4 w-4 text-gray-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend':
        return 'border-blue-200 bg-blue-50'
      case 'opportunity':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'anomaly':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
        <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Predictive Data</h3>
        <p className="text-gray-600">Start collecting data to enable AI-powered predictions.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics</h2>
          <p className="text-gray-600">AI-powered insights and future predictions</p>
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
          
          <Select value={predictionPeriod} onValueChange={setPredictionPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PREDICTION_PERIODS.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={fetchPredictions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Advanced'}
          </Button>
        </div>
      </div>

      {/* Key Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonials Prediction</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.testimonials.predicted}</div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(data.testimonials.trend)}
              <span className={`text-sm font-medium ${getTrendColor(data.testimonials.trend)}`}>
                +{data.testimonials.growthRate}%
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={data.testimonials.confidence} className="flex-1" />
              <span className="text-xs text-gray-600">{data.testimonials.confidence}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Confidence level for {predictionPeriod} prediction
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Prediction</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.engagement.predicted}%</div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(data.engagement.trend)}
              <span className={`text-sm font-medium ${getTrendColor(data.engagement.trend)}`}>
                {data.engagement.trend === 'up' ? '+' : ''}{((data.engagement.predicted - data.engagement.current) / data.engagement.current * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={data.engagement.confidence} className="flex-1" />
              <span className="text-xs text-gray-600">{data.engagement.confidence}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Predicted engagement rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Prediction</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.quality.predicted}</div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(data.quality.trend)}
              <span className={`text-sm font-medium ${getTrendColor(data.quality.trend)}`}>
                +{((data.quality.predicted - data.quality.current) * 10).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={data.quality.confidence} className="flex-1" />
              <span className="text-xs text-gray-600">{data.quality.confidence}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Predicted average rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seasonal Predictions */}
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Predictions</CardTitle>
            <CardDescription>Monthly predictions vs actual performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.seasonal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    name="Actual"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    name="Predicted"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trend Predictions */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Predictions</CardTitle>
            <CardDescription>Weekly trend analysis and predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Actual"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights & Recommendations
          </CardTitle>
          <CardDescription>Automated analysis and actionable recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insights */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Key Insights</h4>
              <div className="space-y-3">
                {data.insights.map((insight) => (
                  <div 
                    key={insight.id}
                    className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium text-gray-900">{insight.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Progress value={insight.confidence} className="w-20 h-2" />
                            <span className="text-xs text-gray-600">{insight.confidence}%</span>
                          </div>
                          {insight.actionable && (
                            <Badge variant="default" className="text-xs">
                              Actionable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Recommendations</h4>
              <div className="space-y-3">
                {data.recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{rec.title}</h5>
                      <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Impact:</span>
                        <span className="font-medium text-green-600">+{rec.expectedImpact}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Effort:</span>
                        <Badge className={`text-xs ${getEffortColor(rec.effort)}`}>
                          {rec.effort}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Settings
            </CardTitle>
            <CardDescription>Configure prediction models and confidence thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Confidence Display</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Switch
                      id="show-confidence"
                      checked={showConfidence}
                      onCheckedChange={setShowConfidence}
                    />
                    <Label htmlFor="show-confidence" className="text-sm">
                      Show confidence intervals
                    </Label>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Model Updates</Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Models are automatically updated every 24 hours with new data
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Confidence Thresholds</Label>
                  <div className="space-y-2 mt-2">
                    {CONFIDENCE_LEVELS.map((level) => (
                      <div key={level.value} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${level.color.replace('text-', 'bg-')}`} />
                        <span className="text-sm">{level.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
