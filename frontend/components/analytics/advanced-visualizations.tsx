'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  Palette,
  Zap,
  Globe,
  Cube,
  Target,
  Sparkles
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, Legend, ScatterChart, Scatter, ZAxis } from 'recharts'

interface VisualizationData {
  id: string
  name: string
  value: number
  category: string
  timestamp: string
  confidence: number
  metadata?: Record<string, any>
}

interface AdvancedVisualizationsProps {
  userId: string
}

const MOCK_3D_DATA = [
  { x: 10, y: 20, z: 30, value: 100, category: 'A' },
  { x: 15, y: 25, z: 35, value: 150, category: 'B' },
  { x: 20, y: 30, z: 40, value: 200, category: 'C' },
  { x: 25, y: 35, z: 45, value: 250, category: 'A' },
  { x: 30, y: 40, z: 50, value: 300, category: 'B' },
  { x: 35, y: 45, z: 55, value: 350, category: 'C' },
  { x: 40, y: 50, z: 60, value: 400, category: 'A' },
  { x: 45, y: 55, z: 65, value: 450, category: 'B' }
]

const MOCK_REALTIME_DATA = [
  { time: '00:00', value: 65, category: 'Testimonials' },
  { time: '01:00', value: 72, category: 'Testimonials' },
  { time: '02:00', value: 68, category: 'Testimonials' },
  { time: '03:00', value: 75, category: 'Testimonials' },
  { time: '04:00', value: 80, category: 'Testimonials' },
  { time: '05:00', value: 78, category: 'Testimonials' },
  { time: '06:00', value: 85, category: 'Testimonials' },
  { time: '07:00', value: 90, category: 'Testimonials' },
  { time: '08:00', value: 88, category: 'Testimonials' },
  { time: '09:00', value: 92, category: 'Testimonials' },
  { time: '10:00', value: 95, category: 'Testimonials' },
  { time: '11:00', value: 98, category: 'Testimonials' }
]

const MOCK_CATEGORY_DATA = [
  { name: 'Service Quality', value: 45, color: '#10b981' },
  { name: 'Product Features', value: 32, color: '#3b82f6' },
  { name: 'Value & Pricing', value: 28, color: '#f59e0b' },
  { name: 'User Experience', value: 22, color: '#8b5cf6' },
  { name: 'Support', value: 18, color: '#ef4444' },
  { name: 'Performance', value: 15, color: '#06b6d4' }
]

const MOCK_TREND_DATA = [
  { month: 'Jan', positive: 65, neutral: 25, negative: 10 },
  { month: 'Feb', positive: 70, neutral: 22, negative: 8 },
  { month: 'Mar', positive: 75, neutral: 20, negative: 5 },
  { month: 'Apr', positive: 78, neutral: 18, negative: 4 },
  { month: 'May', positive: 82, neutral: 15, negative: 3 },
  { month: 'Jun', positive: 85, neutral: 12, negative: 3 }
]

export function AdvancedVisualizations({ userId }: AdvancedVisualizationsProps) {
  const [activeTab, setActiveTab] = useState('3d')
  const [isRealTimeActive, setIsRealTimeActive] = useState(false)
  const [visualizationSettings, setVisualizationSettings] = useState({
    showGrid: true,
    showLabels: true,
    animationSpeed: 'normal',
    colorScheme: 'default',
    autoRotate: false,
    showLegend: true
  })
  const [realTimeData, setRealTimeData] = useState(MOCK_REALTIME_DATA)
  const [loading, setLoading] = useState(false)
  const realTimeInterval = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (userId) {
      loadVisualizationData()
    }
  }, [userId])

  useEffect(() => {
    if (isRealTimeActive) {
      startRealTimeUpdates()
    } else {
      stopRealTimeUpdates()
    }

    return () => stopRealTimeUpdates()
  }, [isRealTimeActive])

  const loadVisualizationData = async () => {
    try {
      setLoading(true)
      // In production, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    } catch (error) {
      console.error('Failed to load visualization data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load visualization data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const startRealTimeUpdates = () => {
    realTimeInterval.current = setInterval(() => {
      setRealTimeData(prev => {
        const newData = [...prev]
        const lastEntry = newData[newData.length - 1]
        const newTime = new Date(Date.now() + 1000 * 60 * 60).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
        
        newData.push({
          time: newTime,
          value: Math.floor(Math.random() * 20) + 80, // Random value between 80-100
          category: 'Testimonials'
        })
        
        // Keep only last 12 data points
        if (newData.length > 12) {
          newData.shift()
        }
        
        return newData
      })
    }, 5000) // Update every 5 seconds
  }

  const stopRealTimeUpdates = () => {
    if (realTimeInterval.current) {
      clearInterval(realTimeInterval.current)
      realTimeInterval.current = null
    }
  }

  const exportVisualization = (format: 'png' | 'svg' | 'pdf') => {
    toast({
      title: 'Export Started',
      description: `Exporting visualization as ${format.toUpperCase()}...`
    })
    
    // In production, this would actually export the visualization
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: `Visualization exported as ${format.toUpperCase()}`
      })
    }, 2000)
  }

  const toggleVisualizationSetting = (setting: keyof typeof visualizationSettings) => {
    setVisualizationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const getColorScheme = () => {
    const schemes = {
      default: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
      warm: ['#f97316', '#ea580c', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
      cool: ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e', '#082f49'],
      pastel: ['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#78350f', '#451a03']
    }
    return schemes[visualizationSettings.colorScheme as keyof typeof schemes] || schemes.default
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Advanced Visualizations</h2>
          <p className="text-gray-600">Interactive 3D charts, real-time data streaming, and advanced analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsRealTimeActive(!isRealTimeActive)}
            className={`flex items-center gap-2 ${isRealTimeActive ? 'bg-green-50 border-green-300' : ''}`}
          >
            {isRealTimeActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRealTimeActive ? 'Stop' : 'Start'} Real-time
          </Button>
          <Button onClick={() => {}} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Visualization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Visualization Settings
          </CardTitle>
          <CardDescription>Customize visualization appearance and behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Display Options</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showGrid"
                    checked={visualizationSettings.showGrid}
                    onCheckedChange={() => toggleVisualizationSetting('showGrid')}
                  />
                  <Label htmlFor="showGrid">Show Grid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showLabels"
                    checked={visualizationSettings.showLabels}
                    onCheckedChange={() => toggleVisualizationSetting('showLabels')}
                  />
                  <Label htmlFor="showLabels">Show Labels</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showLegend"
                    checked={visualizationSettings.showLegend}
                    onCheckedChange={() => toggleVisualizationSetting('showLegend')}
                  />
                  <Label htmlFor="showLegend">Show Legend</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Animation & Behavior</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoRotate"
                    checked={visualizationSettings.autoRotate}
                    onCheckedChange={() => toggleVisualizationSetting('autoRotate')}
                  />
                  <Label htmlFor="autoRotate">Auto-rotate 3D</Label>
                </div>
                <div>
                  <Label htmlFor="animationSpeed" className="text-sm">Animation Speed</Label>
                  <Select 
                    value={visualizationSettings.animationSpeed} 
                    onValueChange={(value) => setVisualizationSettings(prev => ({ ...prev, animationSpeed: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Appearance</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="colorScheme" className="text-sm">Color Scheme</Label>
                  <Select 
                    value={visualizationSettings.colorScheme} 
                    onValueChange={(value) => setVisualizationSettings(prev => ({ ...prev, colorScheme: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cool">Cool</SelectItem>
                      <SelectItem value="pastel">Pastel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Visualization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="3d">3D Charts</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="interactive">Interactive</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* 3D Charts Tab */}
        <TabsContent value="3d" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 3D Scatter Plot */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cube className="h-5 w-5" />
                  3D Scatter Plot
                </CardTitle>
                <CardDescription>Three-dimensional data visualization with interactive controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
                  <div className="text-center">
                    <Cube className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-blue-900 mb-2">3D Visualization</h3>
                    <p className="text-blue-700 text-sm mb-4">
                      Interactive 3D scatter plot with {MOCK_3D_DATA.length} data points
                    </p>
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <span>X: 10-45</span>
                      <span>Y: 20-55</span>
                      <span>Z: 30-65</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    {MOCK_3D_DATA.length} Data Points
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3D Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  3D Bar Chart
                </CardTitle>
                <CardDescription>Three-dimensional bar chart with depth and perspective</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border-2 border-dashed border-green-300 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-900 mb-2">3D Bar Chart</h3>
                    <p className="text-green-700 text-sm mb-4">
                      Multi-dimensional bar visualization with depth perception
                    </p>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <span>Categories: 6</span>
                      <span>Depth: Enabled</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    3D Perspective
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Layers className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Palette className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Data Streaming
              </CardTitle>
              <CardDescription>Live data updates with WebSocket integration and real-time analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Real-time Chart */}
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={realTimeData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Real-time Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isRealTimeActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-sm font-medium">
                        {isRealTimeActive ? 'Live' : 'Paused'}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {realTimeData.length} Data Points
                    </Badge>
                    <Badge variant="outline">
                      Update: 5s
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRealTimeData(MOCK_REALTIME_DATA)}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportVisualization('png')}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interactive Tab */}
        <TabsContent value="interactive" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interactive Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Interactive Pie Chart
                </CardTitle>
                <CardDescription>Click and hover interactions with dynamic data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={MOCK_CATEGORY_DATA}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {MOCK_CATEGORY_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Badge variant="outline">
                    {MOCK_CATEGORY_DATA.length} Categories
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Sparkles className="h-4 w-4" />
                    Animate
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Interactive Bar Chart
                </CardTitle>
                <CardDescription>Hover effects and click interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_CATEGORY_DATA}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Badge variant="outline">
                    Total: {MOCK_CATEGORY_DATA.reduce((sum, item) => sum + item.value, 0)}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Target className="h-4 w-4" />
                    Focus
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Multi-series Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Multi-series Trends
                </CardTitle>
                <CardDescription>Complex data visualization with multiple data series</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_TREND_DATA}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    Positive: ↗️
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Globe className="h-4 w-4" />
                    Global View
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Advanced Analytics
                </CardTitle>
                <CardDescription>Statistical analysis and data insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                    <h4 className="font-medium text-purple-900 mb-2">Correlation Analysis</h4>
                    <p className="text-sm text-purple-700 mb-3">
                      Strong positive correlation between service quality and customer satisfaction
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-purple-600 border-purple-300">
                        R² = 0.87
                      </Badge>
                      <span className="text-xs text-purple-600">High confidence</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
                    <h4 className="font-medium text-green-900 mb-2">Trend Prediction</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Customer satisfaction expected to increase by 12% in next quarter
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Confidence: 89%
                      </Badge>
                      <span className="text-xs text-green-600">ML Model</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border">
                    <h4 className="font-medium text-orange-900 mb-2">Anomaly Detection</h4>
                    <p className="text-sm text-orange-700 mb-3">
                      Detected unusual pattern in negative feedback volume
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Alert Level: Medium
                      </Badge>
                      <span className="text-xs text-orange-600">Requires attention</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
