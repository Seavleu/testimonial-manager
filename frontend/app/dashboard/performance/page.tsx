'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PerformanceMonitor } from '@/components/dashboard/performance-monitor'
import { AdvancedAutomationManager } from '@/components/dashboard/advanced-automation-manager'
import { 
  Activity, 
  Zap, 
  Brain, 
  TrendingUp, 
  Gauge, 
  Cpu, 
  Memory,
  Network,
  HardDrive,
  Target,
  Shield,
  Settings
} from 'lucide-react'

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState('monitoring')
  
  // Mock user ID - in production this would come from auth context
  const userId = 'user-123'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance & Automation</h1>
          <p className="text-gray-600">System performance monitoring and AI-powered automation management</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Live Monitoring
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            AI Powered
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Enterprise
          </Badge>
        </div>
      </div>

      {/* Quick Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Excellent</div>
            <p className="text-xs text-muted-foreground">
              All systems operating normally
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">180ms</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-12%</span> from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.92%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Rules</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+1</span> this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Monitoring
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation Management
          </TabsTrigger>
        </TabsList>

        {/* Performance Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">System Performance</h2>
          </div>
          <PerformanceMonitor userId={userId} />
        </TabsContent>

        {/* Automation Management Tab */}
        <TabsContent value="automation" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold">AI Automation</h2>
          </div>
          <AdvancedAutomationManager userId={userId} />
        </TabsContent>
      </Tabs>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Performance Insights
          </CardTitle>
          <CardDescription>Intelligent recommendations for system optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">System Optimization</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Cpu className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">CPU Optimization</p>
                    <p className="text-sm text-blue-700">Consider implementing background job queuing to reduce CPU spikes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Memory className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Memory Management</p>
                    <p className="text-sm text-green-700">Implement object pooling for large testimonial data structures</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Network className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">Network Efficiency</p>
                    <p className="text-sm text-yellow-700">Enable HTTP/2 and implement request compression</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Automation Benefits</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-900">Efficiency Gains</p>
                    <p className="text-sm text-purple-700">AI automation has reduced manual review time by 67%</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <Target className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-indigo-900">Quality Improvement</p>
                    <p className="text-sm text-indigo-700">Automated rules maintain 98.7% accuracy in content moderation</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
                  <Settings className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="font-medium text-pink-900">Scalability</p>
                    <p className="text-sm text-pink-700">System can now handle 3x more testimonials without performance degradation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common performance and automation tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium">Run System Diagnostics</div>
              <div className="text-sm text-gray-600">Comprehensive system health check</div>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium">Optimize Performance</div>
              <div className="text-sm text-gray-600">AI-powered system optimization</div>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium">Test Automation Rules</div>
              <div className="text-sm text-gray-600">Validate rule configurations</div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
            <CardDescription>Smart suggestions for improvement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-900">Enable Auto-scaling</div>
              <div className="text-sm text-blue-700">Automatically adjust resources based on demand</div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="font-medium text-green-900">Implement Caching</div>
              <div className="text-sm text-green-700">Add Redis caching for frequently accessed data</div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="font-medium text-purple-900">Enable Learning Mode</div>
              <div className="text-sm text-purple-700">Let AI improve automation rules over time</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Compliance
            </CardTitle>
            <CardDescription>System security and audit information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <div className="font-medium text-green-900">Security Status</div>
                <div className="text-sm text-green-700">All systems secure</div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <div className="font-medium text-blue-900">Compliance</div>
                <div className="text-sm text-blue-700">GDPR compliant</div>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <div className="font-medium text-yellow-900">Last Audit</div>
                <div className="text-sm text-yellow-700">2 weeks ago</div>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status Overview</CardTitle>
          <CardDescription>Real-time status of all system components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Cpu className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-medium">CPU</div>
              <div className="text-sm text-gray-600">Normal</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Memory className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-medium">Memory</div>
              <div className="text-sm text-gray-600">Normal</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Network className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-medium">Network</div>
              <div className="text-sm text-gray-600">Normal</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <HardDrive className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-medium">Storage</div>
              <div className="text-sm text-gray-600">Normal</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
