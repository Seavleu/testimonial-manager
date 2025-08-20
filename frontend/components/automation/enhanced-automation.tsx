'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import {
  Zap, Brain, Settings, Play, Pause, RotateCcw, TrendingUp, Activity, 
  Target, Filter, Search, Download, RefreshCw, AlertTriangle, CheckCircle, 
  Clock, Star, MessageSquare, Users, Eye, BarChart3, PieChart, LineChart,
  Plus, Edit3, Trash2, Layers, Workflow, Cpu, Sparkles, Lightbulb, Mail, Share2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

interface AutomationRule {
  id: string
  name: string
  description: string
  type: 'testimonial' | 'email' | 'social' | 'workflow' | 'integration'
  status: 'active' | 'inactive' | 'draft' | 'error'
  priority: 'low' | 'medium' | 'high' | 'critical'
  triggers: string[]
  actions: string[]
  conditions: string[]
  performance: {
    executionCount: number
    successRate: number
    avgExecutionTime: number
    lastExecuted: string
    nextExecution: string
  }
  aiSuggestions: string[]
  isAIOptimized: boolean
}

interface WorkflowStep {
  id: string
  name: string
  type: 'trigger' | 'condition' | 'action' | 'delay' | 'integration'
  config: Record<string, any>
  position: { x: number; y: number }
  connections: string[]
}

interface AutomationAnalytics {
  totalRules: number
  activeRules: number
  executionRate: number
  successRate: number
  avgResponseTime: number
  costSavings: number
  performanceMetrics: {
    rule: string
    executions: number
    successRate: number
    avgTime: number
  }[]
}

interface EnhancedAutomationProps {
  userId: string
}

const MOCK_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: '1',
    name: 'Testimonial Approval Workflow',
    description: 'Automatically approve testimonials with high sentiment scores and moderate content',
    type: 'testimonial',
    status: 'active',
    priority: 'high',
    triggers: ['New testimonial submitted'],
    actions: ['Send approval email', 'Update status', 'Notify team'],
    conditions: ['Sentiment score > 0.7', 'Content length > 50 chars', 'No profanity detected'],
    performance: {
      executionCount: 156,
      successRate: 94.2,
      avgExecutionTime: 2.3,
      lastExecuted: '2024-02-13T10:30:00Z',
      nextExecution: '2024-02-13T11:00:00Z'
    },
    aiSuggestions: [
      'Consider adding sentiment threshold adjustment based on time of day',
      'Optimize email template for higher engagement rates',
      'Add fallback notification for failed approvals'
    ],
    isAIOptimized: true
  },
  {
    id: '2',
    name: 'Social Media Auto-Posting',
    description: 'Automatically share approved testimonials on social media platforms',
    type: 'social',
    status: 'active',
    priority: 'medium',
    triggers: ['Testimonial approved', 'Scheduled time reached'],
    actions: ['Post to Facebook', 'Post to Twitter', 'Post to LinkedIn', 'Track engagement'],
    conditions: ['Testimonial is public', 'Social media accounts connected', 'Within posting hours'],
    performance: {
      executionCount: 89,
      successRate: 97.8,
      avgExecutionTime: 5.2,
      lastExecuted: '2024-02-13T09:15:00Z',
      nextExecution: '2024-02-13T12:00:00Z'
    },
    aiSuggestions: [
      'Optimize posting times based on audience engagement patterns',
      'Add content variation to avoid repetitive posts',
      'Implement A/B testing for different post formats'
    ],
    isAIOptimized: true
  },
  {
    id: '3',
    name: 'Customer Follow-up Sequence',
    description: 'Send personalized follow-up emails based on customer behavior',
    type: 'email',
    status: 'active',
    priority: 'high',
    triggers: ['Testimonial submitted', 'Customer inactive for 7 days'],
    actions: ['Send personalized email', 'Update customer status', 'Schedule reminder'],
    conditions: ['Customer has valid email', 'Not unsubscribed', 'Within business hours'],
    performance: {
      executionCount: 234,
      successRate: 91.5,
      avgExecutionTime: 1.8,
      lastExecuted: '2024-02-13T08:45:00Z',
      nextExecution: '2024-02-13T14:00:00Z'
    },
    aiSuggestions: [
      'Personalize email content based on testimonial sentiment',
      'Optimize send times for higher open rates',
      'Add dynamic content based on customer history'
    ],
    isAIOptimized: false
  }
]

const MOCK_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: '1',
    name: 'New Testimonial Trigger',
    type: 'trigger',
    config: { event: 'testimonial_submitted', source: 'widget' },
    position: { x: 100, y: 100 },
    connections: ['2']
  },
  {
    id: '2',
    name: 'Content Validation',
    type: 'condition',
    config: { 
      checks: ['sentiment_score', 'content_length', 'profanity_filter'],
      thresholds: { sentiment: 0.7, length: 50 }
    },
    position: { x: 300, y: 100 },
    connections: ['3', '4']
  },
  {
    id: '3',
    name: 'Auto Approval',
    type: 'action',
    config: { 
      actions: ['update_status', 'send_notification', 'trigger_social_posting']
    },
    position: { x: 500, y: 50 },
    connections: []
  },
  {
    id: '4',
    name: 'Manual Review',
    type: 'action',
    config: { 
      actions: ['assign_reviewer', 'send_review_request', 'schedule_reminder']
    },
    position: { x: 500, y: 150 },
    connections: []
  }
]

const MOCK_ANALYTICS: AutomationAnalytics = {
  totalRules: 12,
  activeRules: 8,
  executionRate: 87.5,
  successRate: 94.2,
  avgResponseTime: 3.1,
  costSavings: 12450,
  performanceMetrics: [
    { rule: 'Testimonial Approval', executions: 156, successRate: 94.2, avgTime: 2.3 },
    { rule: 'Social Media Posting', executions: 89, successRate: 97.8, avgTime: 5.2 },
    { rule: 'Customer Follow-up', executions: 234, successRate: 91.5, avgTime: 1.8 },
    { rule: 'Data Export', executions: 67, successRate: 98.5, avgTime: 8.7 },
    { rule: 'Backup Creation', executions: 45, successRate: 100, avgTime: 45.2 }
  ]
}

export function EnhancedAutomation({ userId }: EnhancedAutomationProps) {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [analytics, setAnalytics] = useState<AutomationAnalytics | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadAutomationData()
  }, [userId])

  const loadAutomationData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAutomationRules(MOCK_AUTOMATION_RULES)
      setWorkflowSteps(MOCK_WORKFLOW_STEPS)
      setAnalytics(MOCK_ANALYTICS)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load automation data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRuleStatus = async (ruleId: string, newStatus: 'active' | 'inactive') => {
    try {
      setAutomationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, status: newStatus } : rule
        )
      )
      
      toast({
        title: 'Success',
        description: `Rule ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update rule status',
        variant: 'destructive'
      })
    }
  }

  const optimizeRuleWithAI = async (ruleId: string) => {
    try {
      // Simulate AI optimization
      toast({
        title: 'AI Optimization',
        description: 'Analyzing rule performance and generating optimizations...'
      })
      
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setAutomationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, isAIOptimized: true } : rule
        )
      )
      
      toast({
        title: 'Success',
        description: 'Rule optimized with AI suggestions'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to optimize rule with AI',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-blue-100 text-blue-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'testimonial': return <MessageSquare className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'social': return <Share2 className="h-4 w-4" />
      case 'workflow': return <Workflow className="h-4 w-4" />
      case 'integration': return <Layers className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Enhanced Automation Engine</h2>
          <p className="text-muted-foreground">
            AI-powered automation rules, advanced workflows, and performance analytics
          </p>
        </div>
        <Button onClick={loadAutomationData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalRules}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.activeRules} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgResponseTime}s</div>
              <p className="text-xs text-muted-foreground">
                -0.5s from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.costSavings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* AI Optimization Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Optimization Status
                </CardTitle>
                <CardDescription>Rules optimized with artificial intelligence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(rule.type)}
                        <div>
                          <p className="text-sm font-medium">{rule.name}</p>
                          <p className="text-xs text-muted-foreground">{rule.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {rule.isAIOptimized ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Brain className="h-3 w-3 mr-1" />
                            AI Optimized
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Lightbulb className="h-3 w-3 mr-1" />
                            Needs Optimization
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Executions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Executions
                </CardTitle>
                <CardDescription>Latest automation rule executions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationRules.slice(0, 3).map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Last executed: {new Date(rule.performance.lastExecuted).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{rule.performance.executionCount}</p>
                        <p className="text-xs text-muted-foreground">executions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automation Rules
              </CardTitle>
              <CardDescription>
                Manage and configure your automation rules with AI-powered optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <Card key={rule.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(rule.type)}
                          <div>
                            <h3 className="text-lg font-medium">{rule.name}</h3>
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(rule.status)}>
                            {rule.status}
                          </Badge>
                          <Badge className={getPriorityColor(rule.priority)}>
                            {rule.priority}
                          </Badge>
                          {rule.isAIOptimized && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Brain className="h-3 w-3 mr-1" />
                              AI Optimized
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Triggers:</p>
                            <p className="text-muted-foreground">{rule.triggers.join(', ')}</p>
                          </div>
                          <div>
                            <p className="font-medium">Actions:</p>
                            <p className="text-muted-foreground">{rule.actions.join(', ')}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Executions:</p>
                            <p className="text-muted-foreground">{rule.performance.executionCount}</p>
                          </div>
                          <div>
                            <p className="font-medium">Success Rate:</p>
                            <p className="text-muted-foreground">{rule.performance.successRate}%</p>
                          </div>
                          <div>
                            <p className="font-medium">Avg Time:</p>
                            <p className="text-muted-foreground">{rule.performance.avgExecutionTime}s</p>
                          </div>
                        </div>

                        {rule.aiSuggestions.length > 0 && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 mb-2">AI Suggestions:</p>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {rule.aiSuggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <Lightbulb className="h-3 w-3 mt-0.5 text-blue-600" />
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          variant={rule.status === 'active' ? 'outline' : 'default'}
                          onClick={() => toggleRuleStatus(rule.id, rule.status === 'active' ? 'inactive' : 'active')}
                        >
                          {rule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        
                        {!rule.isAIOptimized && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => optimizeRuleWithAI(rule.id)}
                          >
                            <Brain className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button size="sm" variant="outline">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Visual Workflow Builder
              </CardTitle>
              <CardDescription>
                Design and manage complex automation workflows with visual tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Workflow Builder</h3>
                <p className="text-gray-500 mb-4">
                  Drag and drop interface for building complex automation workflows
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Workflow
                </Button>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4">Existing Workflows</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {workflowSteps.filter(step => step.type === 'trigger').map((step) => (
                    <Card key={step.id} className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Zap className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{step.name}</p>
                          <p className="text-xs text-muted-foreground">{step.type}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Rule Performance</CardTitle>
                <CardDescription>Execution metrics across all rules</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.performanceMetrics || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rule" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="executions" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Success Rate Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Distribution</CardTitle>
                <CardDescription>Success rates across different rule types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.performanceMetrics || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ rule, successRate }) => `${rule}: ${successRate}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="successRate"
                    >
                      {analytics?.performanceMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>Comprehensive performance analysis for each rule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Rule</th>
                      <th className="text-left p-2">Executions</th>
                      <th className="text-left p-2">Success Rate</th>
                      <th className="text-left p-2">Avg Time (s)</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.performanceMetrics.map((metric) => (
                      <tr key={metric.rule} className="border-b">
                        <td className="p-2 font-medium">{metric.rule}</td>
                        <td className="p-2">{metric.executions.toLocaleString()}</td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <span>{metric.successRate}%</span>
                            <Progress value={metric.successRate} className="w-20" />
                          </div>
                        </td>
                        <td className="p-2">{metric.avgTime}</td>
                        <td className="p-2">
                          <Badge className={metric.successRate > 95 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {metric.successRate > 95 ? 'Excellent' : 'Good'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
