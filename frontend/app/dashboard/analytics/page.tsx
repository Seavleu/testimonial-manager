'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnhancedAnalyticsDashboard } from '@/components/dashboard/enhanced-analytics-dashboard'
import { AdvancedReportingSystem } from '@/components/dashboard/advanced-reporting-system'
import { PredictiveAnalytics } from '@/components/dashboard/predictive-analytics'
import { 
  BarChart3, 
  FileText, 
  Brain, 
  TrendingUp, 
  Users, 
  Star, 
  MessageSquare,
  Activity,
  Target,
  Zap,
  AlertTriangle
} from 'lucide-react'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock user ID - in production this would come from auth context
  const userId = 'user-123'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h1>
          <p className="text-gray-600">Comprehensive insights and AI-powered predictions for your testimonial performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Live Data
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Testimonials</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.2</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">21.0%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3.2%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+26.3%</div>
            <p className="text-xs text-muted-foreground">
              Predicted for next quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reporting" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reporting
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Predictions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Enhanced Analytics Dashboard */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Performance Overview</h2>
          </div>
          <EnhancedAnalyticsDashboard userId={userId} />
        </TabsContent>

        {/* Reporting Tab - Advanced Reporting System */}
        <TabsContent value="reporting" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Report Management</h2>
          </div>
          <AdvancedReportingSystem userId={userId} />
        </TabsContent>

        {/* Predictions Tab - Predictive Analytics */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold">AI Predictions</h2>
          </div>
          <PredictiveAnalytics userId={userId} />
        </TabsContent>
      </Tabs>

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Export
            </CardTitle>
            <CardDescription>Export your analytics data in various formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Export Charts & Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Export Trends Analysis
            </Button>
          </CardContent>
        </Card>

        {/* AI Insights Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights Summary
            </CardTitle>
            <CardDescription>Latest AI-generated insights and recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Video testimonials show 40% higher engagement</p>
                <p className="text-xs text-blue-700">Consider encouraging more video submissions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <Target className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Peak collection time: 2-4 PM</p>
                <p className="text-xs text-green-700">Optimize collection timing for better quality</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Email response rates declining</p>
                <p className="text-xs text-yellow-700">Review and update email strategy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help & Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Help & Resources</CardTitle>
          <CardDescription>Learn how to make the most of your analytics dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium mb-1">Understanding Metrics</h4>
              <p className="text-sm text-gray-600">Learn what each metric means and how to interpret them</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium mb-1">AI Predictions</h4>
              <p className="text-sm text-gray-600">How our AI models work and what predictions mean</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium mb-1">Report Templates</h4>
              <p className="text-sm text-gray-600">Create and customize automated reports</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
