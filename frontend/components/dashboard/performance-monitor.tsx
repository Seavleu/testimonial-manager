'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Gauge, 
  HardDrive,
  Network,
  Cpu,
  Memory,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface PerformanceMetrics {
  cpu: {
    usage: number
    temperature: number
    cores: number
    trend: 'up' | 'down' | 'stable'
  }
  memory: {
    used: number
    total: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }
  network: {
    bandwidth: number
    latency: number
    requests: number
    errors: number
    trend: 'up' | 'down' | 'stable'
  }
  storage: {
    used: number
    total: number
    percentage: number
    iops: number
    trend: 'up' | 'down' | 'stable'
  }
  application: {
    responseTime: number
    throughput: number
    errorRate: number
    uptime: number
    trend: 'up' | 'down' | 'stable'
  }
}

interface PerformanceAlert {
  id: string
  type: 'warning' | 'critical' | 'info'
  message: string
  metric: string
  value: number
  threshold: number
  timestamp: string
  resolved: boolean
}

interface PerformanceMonitorProps {
  userId: string
}

const PERFORMANCE_THRESHOLDS = {
  cpu: { warning: 70, critical: 90 },
  memory: { warning: 80, critical: 95 },
  network: { warning: 1000, critical: 2000 }, // ms latency
  storage: { warning: 85, critical: 95 },
  application: { warning: 500, critical: 1000 } // ms response time
}

export function PerformanceMonitor({ userId }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [monitoring, setMonitoring] = useState(true)
  const [autoOptimize, setAutoOptimize] = useState(false)
  const [loading, setLoading] = useState(true)
  const [optimizationInProgress, setOptimizationInProgress] = useState(false)
  const { toast } = useToast()

  // Mock performance data for demonstration
  const mockMetrics: PerformanceMetrics = {
    cpu: {
      usage: 45,
      temperature: 65,
      cores: 8,
      trend: 'stable'
    },
    memory: {
      used: 6.2,
      total: 16,
      percentage: 38.75,
      trend: 'up'
    },
    network: {
      bandwidth: 125,
      latency: 45,
      requests: 1250,
      errors: 12,
      trend: 'down'
    },
    storage: {
      used: 128,
      total: 512,
      percentage: 25,
      iops: 1500,
      trend: 'stable'
    },
    application: {
      responseTime: 180,
      throughput: 850,
      errorRate: 0.8,
      uptime: 99.92,
      trend: 'up'
    }
  }

  useEffect(() => {
    if (userId && monitoring) {
      startMonitoring()
    }
    return () => stopMonitoring()
  }, [userId, monitoring])

  const startMonitoring = () => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }

  const stopMonitoring = () => {
    // Clear any monitoring intervals
  }

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      // In production, this would fetch from your performance monitoring API
      // const response = await fetch(`/api/performance/${userId}`)
      // const performanceData = await response.json()
      
      // For now, use mock data with some randomization
      const updatedMetrics = {
        ...mockMetrics,
        cpu: {
          ...mockMetrics.cpu,
          usage: Math.max(10, Math.min(90, mockMetrics.cpu.usage + (Math.random() - 0.5) * 20))
        },
        memory: {
          ...mockMetrics.memory,
          used: Math.max(4, Math.min(14, mockMetrics.memory.used + (Math.random() - 0.5) * 2))
        },
        network: {
          ...mockMetrics.network,
          latency: Math.max(20, Math.min(100, mockMetrics.network.latency + (Math.random() - 0.5) * 40))
        }
      }
      
      setMetrics(updatedMetrics)
      checkAlerts(updatedMetrics)
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error)
      toast({
        title: 'Error',
        description: 'Failed to load performance metrics',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const checkAlerts = (currentMetrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = []
    
    // Check CPU usage
    if (currentMetrics.cpu.usage > PERFORMANCE_THRESHOLDS.cpu.critical) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: 'critical',
        message: `CPU usage is critically high: ${currentMetrics.cpu.usage.toFixed(1)}%`,
        metric: 'CPU',
        value: currentMetrics.cpu.usage,
        threshold: PERFORMANCE_THRESHOLDS.cpu.critical,
        timestamp: new Date().toISOString(),
        resolved: false
      })
    } else if (currentMetrics.cpu.usage > PERFORMANCE_THRESHOLDS.cpu.warning) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: 'warning',
        message: `CPU usage is high: ${currentMetrics.cpu.usage.toFixed(1)}%`,
        metric: 'CPU',
        value: currentMetrics.cpu.usage,
        threshold: PERFORMANCE_THRESHOLDS.cpu.warning,
        timestamp: new Date().toISOString(),
        resolved: false
      })
    }

    // Check memory usage
    if (currentMetrics.memory.percentage > PERFORMANCE_THRESHOLDS.memory.critical) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'critical',
        message: `Memory usage is critically high: ${currentMetrics.memory.percentage.toFixed(1)}%`,
        metric: 'Memory',
        value: currentMetrics.memory.percentage,
        threshold: PERFORMANCE_THRESHOLDS.memory.critical,
        timestamp: new Date().toISOString(),
        resolved: false
      })
    }

    // Check application response time
    if (currentMetrics.application.responseTime > PERFORMANCE_THRESHOLDS.application.critical) {
      newAlerts.push({
        id: `app-${Date.now()}`,
        type: 'critical',
        message: `Application response time is critically slow: ${currentMetrics.application.responseTime}ms`,
        metric: 'Response Time',
        value: currentMetrics.application.responseTime,
        threshold: PERFORMANCE_THRESHOLDS.application.critical,
        timestamp: new Date().toISOString(),
        resolved: false
      })
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts])
      
      // Show toast for critical alerts
      newAlerts.forEach(alert => {
        if (alert.type === 'critical') {
          toast({
            title: 'Critical Performance Alert',
            description: alert.message,
            variant: 'destructive'
          })
        }
      })
    }
  }

  const runOptimization = async () => {
    try {
      setOptimizationInProgress(true)
      toast({
        title: 'Optimization Started',
        description: 'Running performance optimization...'
      })

      // In production, this would call your optimization API
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate optimization

      toast({
        title: 'Optimization Complete',
        description: 'Performance has been optimized successfully'
      })

      // Refresh metrics after optimization
      fetchMetrics()
    } catch (error) {
      toast({
        title: 'Optimization Failed',
        description: 'Failed to run performance optimization',
        variant: 'destructive'
      })
    } finally {
      setOptimizationInProgress(false)
    }
  }

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ))
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (value: number, warning: number, critical: number) => {
    if (value >= critical) return 'text-red-600'
    if (value >= warning) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusBadge = (value: number, warning: number, critical: number) => {
    if (value >= critical) return <Badge variant="destructive">Critical</Badge>
    if (value >= warning) return <Badge variant="secondary">Warning</Badge>
    return <Badge variant="default">Good</Badge>
  }

  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Performance Data</h3>
        <p className="text-gray-600">Start monitoring to see performance metrics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Monitor</h2>
          <p className="text-gray-600">Real-time system performance and health monitoring</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="monitoring" className="text-sm">Monitoring</Label>
            <Switch
              id="monitoring"
              checked={monitoring}
              onCheckedChange={setMonitoring}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-optimize" className="text-sm">Auto-optimize</Label>
            <Switch
              id="auto-optimize"
              checked={autoOptimize}
              onCheckedChange={setAutoOptimize}
            />
          </div>
          
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button 
            onClick={runOptimization}
            disabled={optimizationInProgress}
            className="flex items-center gap-2"
          >
            {optimizationInProgress ? (
              <RotateCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {optimizationInProgress ? 'Optimizing...' : 'Optimize'}
          </Button>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CPU Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{metrics.cpu.usage.toFixed(1)}%</div>
              {getTrendIcon(metrics.cpu.trend)}
            </div>
            <Progress 
              value={metrics.cpu.usage} 
              className="mb-2"
              color={getStatusColor(metrics.cpu.usage, PERFORMANCE_THRESHOLDS.cpu.warning, PERFORMANCE_THRESHOLDS.cpu.critical)}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{metrics.cpu.cores} cores</span>
              <span>{metrics.cpu.temperature}°C</span>
              {getStatusBadge(metrics.cpu.usage, PERFORMANCE_THRESHOLDS.cpu.warning, PERFORMANCE_THRESHOLDS.cpu.critical)}
            </div>
          </CardContent>
        </Card>

        {/* Memory Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Memory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{metrics.memory.percentage.toFixed(1)}%</div>
              {getTrendIcon(metrics.memory.trend)}
            </div>
            <Progress 
              value={metrics.memory.percentage} 
              className="mb-2"
              color={getStatusColor(metrics.memory.percentage, PERFORMANCE_THRESHOLDS.memory.warning, PERFORMANCE_THRESHOLDS.memory.critical)}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{metrics.memory.used}GB / {metrics.memory.total}GB</span>
              {getStatusBadge(metrics.memory.percentage, PERFORMANCE_THRESHOLDS.memory.warning, PERFORMANCE_THRESHOLDS.memory.critical)}
            </div>
          </CardContent>
        </Card>

        {/* Network Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Performance</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{metrics.network.latency}ms</div>
              {getTrendIcon(metrics.network.trend)}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Bandwidth:</span>
                <span>{metrics.network.bandwidth} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span>Requests:</span>
                <span>{metrics.network.requests}/min</span>
              </div>
              <div className="flex justify-between">
                <span>Errors:</span>
                <span className="text-red-600">{metrics.network.errors}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{metrics.storage.percentage.toFixed(1)}%</div>
              {getTrendIcon(metrics.storage.trend)}
            </div>
            <Progress 
              value={metrics.storage.percentage} 
              className="mb-2"
              color={getStatusColor(metrics.storage.percentage, PERFORMANCE_THRESHOLDS.storage.warning, PERFORMANCE_THRESHOLDS.storage.critical)}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{metrics.storage.used}GB / {metrics.storage.total}GB</span>
              <span>{metrics.storage.iops} IOPS</span>
            </div>
          </CardContent>
        </Card>

        {/* Application Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Application Performance</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{metrics.application.responseTime}ms</div>
              {getTrendIcon(metrics.application.trend)}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Throughput:</span>
                <span>{metrics.application.throughput} req/s</span>
              </div>
              <div className="flex justify-between">
                <span>Error Rate:</span>
                <span className="text-red-600">{metrics.application.errorRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="text-green-600">{metrics.application.uptime}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">Good</div>
              <div className="text-sm text-muted-foreground mb-4">
                All systems operating normally
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>CPU:</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex justify-between">
                  <span>Network:</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Performance Alerts
            </CardTitle>
            <CardDescription>Active performance issues and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.filter(alert => !alert.resolved).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.type === 'critical' 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.type === 'critical' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                        <span className={`font-medium ${
                          alert.type === 'critical' ? 'text-red-900' : 'text-yellow-900'
                        }`}>
                          {alert.message}
                        </span>
                        <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {alert.metric}: {alert.value} (Threshold: {alert.threshold})
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Recommendations
          </CardTitle>
          <CardDescription>Optimization suggestions based on current metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Memory Optimization</h4>
              <p className="text-sm text-blue-700 mb-3">
                Consider implementing memory pooling for large objects to reduce garbage collection overhead.
              </p>
              <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                Learn More
              </Button>
            </div>
            
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Network Optimization</h4>
              <p className="text-sm text-green-700 mb-3">
                Implement connection pooling and request batching to improve network efficiency.
              </p>
              <Button variant="outline" size="sm" className="text-green-700 border-green-300">
                Learn More
              </Button>
            </div>
            
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Storage Optimization</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Consider implementing data compression and archiving for older data.
              </p>
              <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-300">
                Learn More
              </Button>
            </div>
            
            <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Application Optimization</h4>
              <p className="text-sm text-purple-700 mb-3">
                Implement caching strategies and optimize database queries for better response times.
              </p>
              <Button variant="outline" size="sm" className="text-purple-700 border-purple-300">
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
