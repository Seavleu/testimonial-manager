'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Search,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  Users,
  Target,
  Zap
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'

interface SentimentResult {
  id: string
  testimonialId: string
  text: string
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  emotions: {
    joy: number
    sadness: number
    anger: number
    fear: number
    surprise: number
    disgust: number
  }
  topics: string[]
  keywords: string[]
  score: number
  timestamp: string
  processed: boolean
}

interface SentimentInsight {
  id: string
  type: 'trend' | 'anomaly' | 'pattern' | 'recommendation'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  confidence: number
  timestamp: string
  actionable: boolean
  action?: string
}

interface SentimentAnalysisProps {
  userId: string
}

const SENTIMENT_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280'
}

const EMOTION_COLORS = {
  joy: '#fbbf24',
  sadness: '#3b82f6',
  anger: '#ef4444',
  fear: '#8b5cf6',
  surprise: '#06b6d4',
  disgust: '#84cc16'
}

const MOCK_SENTIMENT_RESULTS: SentimentResult[] = [
  {
    id: '1',
    testimonialId: 'test_001',
    text: 'Amazing service! The team went above and beyond to help us. Highly recommend!',
    sentiment: 'positive',
    confidence: 0.94,
    emotions: { joy: 0.8, sadness: 0.1, anger: 0.05, fear: 0.02, surprise: 0.02, disgust: 0.01 },
    topics: ['service quality', 'team performance', 'recommendation'],
    keywords: ['amazing', 'above and beyond', 'highly recommend'],
    score: 0.92,
    timestamp: '2024-02-10T10:30:00Z',
    processed: true
  },
  {
    id: '2',
    testimonialId: 'test_002',
    text: 'The product was okay, nothing special. Expected more for the price.',
    sentiment: 'neutral',
    confidence: 0.78,
    emotions: { joy: 0.3, sadness: 0.4, anger: 0.1, fear: 0.05, surprise: 0.1, disgust: 0.05 },
    topics: ['product quality', 'value for money', 'expectations'],
    keywords: ['okay', 'nothing special', 'expected more'],
    score: 0.45,
    timestamp: '2024-02-10T11:15:00Z',
    processed: true
  },
  {
    id: '3',
    testimonialId: 'test_003',
    text: 'Terrible experience. The product broke after one week. Customer service was unhelpful.',
    sentiment: 'negative',
    confidence: 0.89,
    emotions: { joy: 0.05, sadness: 0.6, anger: 0.8, fear: 0.1, surprise: 0.05, disgust: 0.3 },
    topics: ['product reliability', 'customer service', 'product quality'],
    keywords: ['terrible', 'broke', 'unhelpful'],
    score: 0.15,
    timestamp: '2024-02-10T12:00:00Z',
    processed: true
  },
  {
    id: '4',
    testimonialId: 'test_004',
    text: 'Great value for money. The features are exactly what we needed.',
    sentiment: 'positive',
    confidence: 0.87,
    emotions: { joy: 0.7, sadness: 0.1, anger: 0.05, fear: 0.05, surprise: 0.1, disgust: 0.05 },
    topics: ['value', 'features', 'meeting needs'],
    keywords: ['great value', 'exactly what we needed'],
    score: 0.85,
    timestamp: '2024-02-10T13:45:00Z',
    processed: true
  },
  {
    id: '5',
    testimonialId: 'test_005',
    text: 'Mixed feelings. Good features but the interface is confusing.',
    sentiment: 'neutral',
    confidence: 0.72,
    emotions: { joy: 0.4, sadness: 0.3, anger: 0.2, fear: 0.1, surprise: 0.05, disgust: 0.05 },
    topics: ['features', 'user interface', 'usability'],
    keywords: ['mixed feelings', 'good features', 'confusing'],
    score: 0.52,
    timestamp: '2024-02-10T14:20:00Z',
    processed: true
  }
]

const MOCK_INSIGHTS: SentimentInsight[] = [
  {
    id: '1',
    type: 'trend',
    title: 'Positive Sentiment Increasing',
    description: 'Customer satisfaction has improved by 15% over the last month, with positive sentiment rising from 65% to 80%.',
    severity: 'low',
    confidence: 0.89,
    timestamp: '2024-02-10T15:00:00Z',
    actionable: true,
    action: 'Continue current customer service practices'
  },
  {
    id: '2',
    type: 'anomaly',
    title: 'Unusual Negative Feedback Spike',
    description: 'Detected 3 negative testimonials in the last 24 hours, which is 50% above the normal rate.',
    severity: 'medium',
    confidence: 0.76,
    timestamp: '2024-02-10T14:30:00Z',
    actionable: true,
    action: 'Investigate recent customer service interactions'
  },
  {
    id: '3',
    type: 'pattern',
    title: 'Service Quality Mentioned Most',
    description: 'Service quality is mentioned in 78% of positive testimonials, indicating it\'s a key driver of satisfaction.',
    severity: 'low',
    confidence: 0.92,
    timestamp: '2024-02-10T14:00:00Z',
    actionable: true,
    action: 'Highlight service quality in marketing materials'
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Improve User Interface',
    description: 'Interface confusion is mentioned in 45% of neutral/negative feedback. Consider UX improvements.',
    severity: 'medium',
    confidence: 0.81,
    timestamp: '2024-02-10T13:30:00Z',
    actionable: true,
    action: 'Schedule UX review and interface improvements'
  }
]

export function SentimentAnalysis({ userId }: SentimentAnalysisProps) {
  const [sentimentResults, setSentimentResults] = useState<SentimentResult[]>([])
  const [insights, setInsights] = useState<SentimentInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [processingQueue, setProcessingQueue] = useState<SentimentResult[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (userId) {
      loadSentimentData()
    }
  }, [userId])

  const loadSentimentData = async () => {
    try {
      setLoading(true)
      // In production, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay
      setSentimentResults(MOCK_SENTIMENT_RESULTS)
      setInsights(MOCK_INSIGHTS)
    } catch (error) {
      console.error('Failed to load sentiment data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load sentiment analysis data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const processNewTestimonials = async () => {
    try {
      setLoading(true)
      // Simulate processing new testimonials
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newResults = [
        {
          id: `new_${Date.now()}`,
          testimonialId: `test_${Math.floor(Math.random() * 1000)}`,
          text: 'This is a new testimonial that needs sentiment analysis.',
          sentiment: 'positive' as const,
          confidence: 0.85,
          emotions: { joy: 0.7, sadness: 0.1, anger: 0.05, fear: 0.05, surprise: 0.1, disgust: 0.05 },
          topics: ['new feedback', 'customer experience'],
          keywords: ['new', 'testimonial'],
          score: 0.8,
          timestamp: new Date().toISOString(),
          processed: true
        }
      ]
      
      setSentimentResults(prev => [...newResults, ...prev])
      toast({
        title: 'Success',
        description: 'New testimonials processed and analyzed'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process new testimonials',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getSentimentStats = () => {
    const total = sentimentResults.length
    const positive = sentimentResults.filter(r => r.sentiment === 'positive').length
    const negative = sentimentResults.filter(r => r.sentiment === 'negative').length
    const neutral = sentimentResults.filter(r => r.sentiment === 'neutral').length
    
    const avgScore = sentimentResults.reduce((sum, r) => sum + r.score, 0) / total
    const avgConfidence = sentimentResults.reduce((sum, r) => sum + r.confidence, 0) / total
    
    return { total, positive, negative, neutral, avgScore, avgConfidence }
  }

  const getEmotionStats = () => {
    const emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust']
    return emotions.map(emotion => ({
      emotion,
      value: sentimentResults.reduce((sum, r) => sum + r.emotions[emotion as keyof typeof r.emotions], 0) / sentimentResults.length
    }))
  }

  const getTopicFrequency = () => {
    const topicCount: Record<string, number> = {}
    sentimentResults.forEach(result => {
      result.topics.forEach(topic => {
        topicCount[topic] = (topicCount[topic] || 0) + 1
      })
    })
    
    return Object.entries(topicCount)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  const getInsightSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    }
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getInsightTypeIcon = (type: string) => {
    const icons = {
      trend: <TrendingUp className="h-4 w-4" />,
      anomaly: <AlertTriangle className="h-4 w-4" />,
      pattern: <BarChart3 className="h-4 w-4" />,
      recommendation: <Lightbulb className="h-4 w-4" />
    }
    return icons[type as keyof typeof icons] || <Activity className="h-4 w-4" />
  }

  const stats = getSentimentStats()
  const emotionStats = getEmotionStats()
  const topicFrequency = getTopicFrequency()

  if (loading && sentimentResults.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h2>
          <p className="text-gray-600">AI-powered sentiment analysis and insights for customer testimonials</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={processNewTestimonials}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Process New
          </Button>
          <Button onClick={() => {}} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyzed</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              testimonials processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((stats.positive / stats.total) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.positive} of {stats.total} testimonials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.avgScore.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              out of 1.0 scale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(stats.avgConfidence * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              average confidence
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sentiment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Sentiment Distribution
                </CardTitle>
                <CardDescription>Breakdown of sentiment across all testimonials</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Positive', value: stats.positive, color: SENTIMENT_COLORS.positive },
                        { name: 'Neutral', value: stats.neutral, color: SENTIMENT_COLORS.neutral },
                        { name: 'Negative', value: stats.negative, color: SENTIMENT_COLORS.negative }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Positive', value: stats.positive, color: SENTIMENT_COLORS.positive },
                        { name: 'Neutral', value: stats.neutral, color: SENTIMENT_COLORS.neutral },
                        { name: 'Negative', value: stats.negative, color: SENTIMENT_COLORS.negative }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Positive ({stats.positive})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span className="text-sm">Neutral ({stats.neutral})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Negative ({stats.negative})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emotion Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Emotion Analysis
                </CardTitle>
                <CardDescription>Average emotional content in testimonials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emotionStats.map(({ emotion, value }) => (
                    <div key={emotion} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{emotion}</span>
                        <span className="text-sm text-gray-600">{Math.round(value * 100)}%</span>
                      </div>
                      <Progress value={value * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Top Topics
              </CardTitle>
              <CardDescription>Most frequently mentioned topics in testimonials</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicFrequency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sentiment Analysis Results
              </CardTitle>
              <CardDescription>Detailed sentiment analysis for each testimonial</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentimentResults.map((result) => (
                  <div key={result.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Testimonial #{result.testimonialId}</p>
                        <p className="text-gray-900 mb-2">{result.text}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`${result.sentiment === 'positive' ? 'border-green-300 text-green-700' : 
                                         result.sentiment === 'negative' ? 'border-red-300 text-red-700' : 
                                         'border-gray-300 text-gray-700'}`}
                            >
                              {result.sentiment}
                            </Badge>
                            <span className="text-gray-600">
                              Confidence: {Math.round(result.confidence * 100)}%
                            </span>
                          </div>
                          <span className="text-gray-600">
                            Score: {result.score.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Emotions</h4>
                        <div className="space-y-2">
                          {Object.entries(result.emotions).map(([emotion, value]) => (
                            <div key={emotion} className="flex items-center justify-between">
                              <span className="text-xs capitalize">{emotion}</span>
                              <Progress value={value * 100} className="h-2 w-20" />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Topics & Keywords</h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium">Topics:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.topics.map((topic) => (
                                <Badge key={topic} variant="secondary" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium">Keywords:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.keywords.map((keyword) => (
                                <Badge key={keyword} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI-Generated Insights
              </CardTitle>
              <CardDescription>Machine learning insights and actionable recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getInsightTypeIcon(insight.type)}
                        <div>
                          <h4 className="font-medium">{insight.title}</h4>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getInsightSeverityColor(insight.severity)} mb-2`}>
                          {insight.severity}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          Confidence: {Math.round(insight.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                    
                    {insight.actionable && insight.action && (
                      <div className="p-3 bg-blue-50 rounded border">
                        <p className="text-sm font-medium text-blue-900 mb-1">💡 Actionable Insight</p>
                        <p className="text-sm text-blue-700">{insight.action}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>Generated: {new Date(insight.timestamp).toLocaleString()}</span>
                      <span className="capitalize">{insight.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sentiment Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sentiment Trends
                </CardTitle>
                <CardDescription>Sentiment score trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sentimentResults.slice().reverse().map((r, i) => ({
                    day: i + 1,
                    score: r.score,
                    sentiment: r.sentiment
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Confidence Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Confidence Trends
                </CardTitle>
                <CardDescription>Analysis confidence over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sentimentResults.slice().reverse().map((r, i) => ({
                    day: i + 1,
                    confidence: r.confidence
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
