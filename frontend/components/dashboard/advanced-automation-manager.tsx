'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Zap, 
  Brain, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Filter,
  Workflow,
  Lightbulb,
  BarChart3,
  Activity,
  Shield,
  Users,
  MessageSquare,
  Star,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface AutomationRule {
  id: string
  name: string
  description: string
  enabled: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  schedule?: {
    enabled: boolean
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'monthly'
    time?: string
    dayOfWeek?: string
    dayOfMonth?: number
  }
  aiEnabled: boolean
  learningMode: boolean
  lastExecuted?: string
  executionCount: number
  successRate: number
  createdAt: string
  updatedAt: string
}

interface RuleCondition {
  id: string
  field: string
  operator: string
  value: string | number | boolean
  logicalOperator?: 'AND' | 'OR'
}

interface RuleAction {
  id: string
  type: string
  parameters: Record<string, any>
  delay?: number
  retryCount?: number
}

interface AdvancedAutomationManagerProps {
  userId: string
}

const RULE_CATEGORIES = [
  'Content Moderation',
  'Quality Control',
  'Engagement Optimization',
  'Spam Detection',
  'Customer Service',
  'Marketing Automation',
  'Data Processing',
  'System Maintenance'
]

const CONDITION_FIELDS = [
  { value: 'text', label: 'Testimonial Text', type: 'text' },
  { value: 'rating', label: 'Rating', type: 'number' },
  { value: 'category', label: 'Category', type: 'select' },
  { value: 'source', label: 'Source', type: 'select' },
  { value: 'length', label: 'Text Length', type: 'number' },
  { value: 'has_video', label: 'Has Video', type: 'boolean' },
  { value: 'has_photo', label: 'Has Photo', type: 'boolean' },
  { value: 'user_agent', label: 'User Agent', type: 'text' },
  { value: 'ip_address', label: 'IP Address', type: 'text' },
  { value: 'submission_time', label: 'Submission Time', type: 'time' }
]

const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'between', label: 'Between' },
  { value: 'regex', label: 'Regex Match' }
]

const ACTION_TYPES = [
  { value: 'approve', label: 'Auto-approve', icon: CheckCircle },
  { value: 'reject', label: 'Auto-reject', icon: AlertTriangle },
  { value: 'flag', label: 'Flag for Review', icon: AlertTriangle },
  { value: 'categorize', label: 'Auto-categorize', icon: Target },
  { value: 'notify', label: 'Send Notification', icon: MessageSquare },
  { value: 'email', label: 'Send Email', icon: MessageSquare },
  { value: 'webhook', label: 'Webhook Call', icon: Zap },
  { value: 'delay', label: 'Delay Processing', icon: Clock },
  { value: 'ai_analysis', label: 'AI Analysis', icon: Brain },
  { value: 'custom_script', label: 'Custom Script', icon: Code }
]

export function AdvancedAutomationManager({ userId }: AdvancedAutomationManagerProps) {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Mock rules for demonstration
  const mockRules: AutomationRule[] = [
    {
      id: '1',
      name: 'High-Rating Auto-Approval',
      description: 'Automatically approve testimonials with 5-star ratings from verified users',
      enabled: true,
      priority: 'high',
      category: 'Quality Control',
      conditions: [
        { id: '1', field: 'rating', operator: 'equals', value: 5 },
        { id: '2', field: 'has_video', operator: 'equals', value: true }
      ],
      actions: [
        { id: '1', type: 'approve', parameters: {} },
        { id: '2', type: 'notify', parameters: { message: 'High-quality testimonial auto-approved' } }
      ],
      aiEnabled: true,
      learningMode: true,
      lastExecuted: '2024-01-16T10:30:00Z',
      executionCount: 156,
      successRate: 98.7,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-16T10:30:00Z'
    },
    {
      id: '2',
      name: 'Spam Detection & Blocking',
      description: 'Identify and block spam testimonials using AI-powered detection',
      enabled: true,
      priority: 'critical',
      category: 'Spam Detection',
      conditions: [
        { id: '1', field: 'text', operator: 'contains', value: 'spam_keywords' },
        { id: '2', field: 'length', operator: 'less_than', value: 10 }
      ],
      actions: [
        { id: '1', type: 'reject', parameters: { reason: 'Spam detected' } },
        { id: '2', type: 'webhook', parameters: { url: '/api/spam-report' } }
      ],
      aiEnabled: true,
      learningMode: true,
      lastExecuted: '2024-01-16T09:15:00Z',
      executionCount: 89,
      successRate: 95.2,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-16T09:15:00Z'
    },
    {
      id: '3',
      name: 'Video Content Enhancement',
      description: 'Automatically enhance video testimonials with AI-generated captions and tags',
      enabled: true,
      priority: 'medium',
      category: 'Content Moderation',
      conditions: [
        { id: '1', field: 'has_video', operator: 'equals', value: true },
        { id: '2', field: 'rating', operator: 'greater_than', value: 3 }
      ],
      actions: [
        { id: '1', type: 'ai_analysis', parameters: { task: 'generate_captions' } },
        { id: '2', type: 'categorize', parameters: { category: 'video_enhanced' } }
      ],
      aiEnabled: true,
      learningMode: false,
      lastExecuted: '2024-01-16T08:45:00Z',
      executionCount: 67,
      successRate: 92.1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-16T08:45:00Z'
    }
  ]

  useEffect(() => {
    if (userId) {
      loadRules()
    }
  }, [userId])

  const loadRules = async () => {
    try {
      setLoading(true)
      // In production, this would fetch from your API
      // const response = await fetch(`/api/automation/rules/${userId}`)
      // const rulesData = await response.json()
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      setRules(mockRules)
    } catch (error) {
      console.error('Failed to load automation rules:', error)
      toast({
        title: 'Error',
        description: 'Failed to load automation rules',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleRule = async (ruleId: string) => {
    try {
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      ))
      
      toast({
        title: 'Rule Updated',
        description: 'Automation rule status changed successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update rule status',
        variant: 'destructive'
      })
    }
  }

  const deleteRule = async (ruleId: string) => {
    try {
      setRules(prev => prev.filter(rule => rule.id !== ruleId))
      toast({
        title: 'Rule Deleted',
        description: 'Automation rule removed successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive'
      })
    }
  }

  const executeRule = async (ruleId: string) => {
    try {
      toast({
        title: 'Rule Execution Started',
        description: 'Running automation rule...'
      })

      // In production, this would call your rule execution API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate execution

      toast({
        title: 'Rule Executed',
        description: 'Automation rule completed successfully'
      })

      // Refresh rules to update execution count
      loadRules()
    } catch (error) {
      toast({
        title: 'Execution Failed',
        description: 'Failed to execute automation rule',
        variant: 'destructive'
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? (
      <Play className="h-4 w-4 text-green-600" />
    ) : (
      <Pause className="h-4 w-4 text-gray-400" />
    )
  }

  const filteredRules = rules.filter(rule => {
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading && rules.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Automation Manager</h2>
          <p className="text-gray-600">AI-powered automation rules and workflow management</p>
        </div>
        
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Rule
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search automation rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {RULE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    {rule.name}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {rule.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(rule.enabled)}
                  <Badge className={getPriorityColor(rule.priority)}>
                    {rule.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Rule Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="text-gray-900">{rule.category}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Conditions:</span>
                  <span className="text-gray-900">{rule.conditions.length} rules</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Actions:</span>
                  <span className="text-gray-900">{rule.actions.length} actions</span>
                </div>
                
                {rule.aiEnabled && (
                  <div className="flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-purple-600">AI-Powered</span>
                    {rule.learningMode && (
                      <Badge variant="outline" className="text-xs">
                        Learning
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{rule.executionCount}</div>
                  <div className="text-xs text-gray-600">Executions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{rule.successRate}%</div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">
                    {rule.lastExecuted ? new Date(rule.lastExecuted).toLocaleDateString() : 'Never'}
                  </div>
                  <div className="text-xs text-gray-600">Last Run</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button 
                  onClick={() => toggleRule(rule.id)}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {rule.enabled ? 'Disable' : 'Enable'}
                </Button>
                
                <Button 
                  onClick={() => executeRule(rule.id)}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Execute
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteRule(rule.id)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRules.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Automation Rules</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No rules match your current filters'
                : 'Create your first automation rule to start automating testimonial management'
              }
            </p>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Rule
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Insights Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Automation Insights
          </CardTitle>
          <CardDescription>Intelligent recommendations for optimizing your automation rules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">Performance Optimization</h4>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Your "High-Rating Auto-Approval" rule has a 98.7% success rate. Consider expanding its scope to include 4-star ratings.
              </p>
              <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                Optimize Rule
              </Button>
            </div>
            
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-900">Efficiency Gains</h4>
              </div>
              <p className="text-sm text-green-700 mb-3">
                AI-powered rules are processing 23% faster than manual review. Consider enabling learning mode for more rules.
              </p>
              <Button variant="outline" size="sm" className="text-green-700 border-green-300">
                Enable Learning
              </Button>
            </div>
            
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Rule Conflicts</h4>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Potential conflict detected between "Spam Detection" and "Video Content Enhancement" rules. Review overlapping conditions.
              </p>
              <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-300">
                Review Conflicts
              </Button>
            </div>
            
            <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Workflow className="h-4 w-4 text-purple-600" />
                <h4 className="font-medium text-purple-900">Workflow Automation</h4>
              </div>
              <p className="text-sm text-purple-700 mb-3">
                Consider creating a workflow that chains multiple rules together for complex testimonial processing scenarios.
              </p>
              <Button variant="outline" size="sm" className="text-purple-700 border-purple-300">
                Create Workflow
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
            <p className="text-xs text-muted-foreground">
              {rules.filter(r => r.enabled).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI-Powered</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.filter(r => r.aiEnabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((rules.filter(r => r.aiEnabled).length / rules.length) * 100).toFixed(1)}% of rules
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.reduce((sum, rule) => sum + rule.executionCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(rules.reduce((sum, rule) => sum + rule.successRate, 0) / rules.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all rules
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
