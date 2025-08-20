import { EnhancedAutomation } from '@/components/automation/enhanced-automation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Brain, TrendingUp, Activity, Target, Workflow, Cpu, Sparkles, Lightbulb, BarChart3, PieChart, LineChart } from 'lucide-react'

interface EnhancedAutomationPageProps {
  params: { userId: string }
}

export default function EnhancedAutomationPage({ params }: EnhancedAutomationPageProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Automation Engine</h1>
          <p className="text-muted-foreground">
            AI-powered automation rules, advanced workflows, and intelligent performance optimization
          </p>
        </div>
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Create New Rule
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              8 active, 4 inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Optimized</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              58% of rules optimized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12.4K</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Capabilities Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Capabilities Overview
          </CardTitle>
          <CardDescription>
            Advanced artificial intelligence features for automation optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Smart Suggestions</p>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Workflow className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Workflow Optimization</p>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Cpu className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Performance AI</p>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Predictive Analytics</p>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  Beta
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Enhanced Automation Dashboard */}
      <EnhancedAutomation userId={params.userId} />
    </div>
  )
}
