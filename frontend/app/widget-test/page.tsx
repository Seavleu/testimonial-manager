'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Code, Eye, Settings, RefreshCw, ExternalLink, Copy, Play, AlertCircle } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth'

// TypeScript declarations for the global TestimonialFlow object
declare global {
  interface Window {
    TestimonialFlow: {
      Widget: new (options: any) => any;
      autoInit: () => void;
    };
  }
}

export default function WidgetTestPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [widgetConfig, setWidgetConfig] = useState({
    userId: user?.id || 'test-user-123',
    theme: 'light',
    layout: 'cards',
    limit: 4,
    showVideos: true,
    autoRefresh: false,
    showDates: true,
    apiUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  })

  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(false)
  const [widgetLoaded, setWidgetLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  useEffect(() => {
    setMounted(true)
    loadWidgetScript()
    checkApiConnection()
  }, [])

  useEffect(() => {
    if (user?.id) {
      setWidgetConfig(prev => ({ ...prev, userId: user.id }))
    }
  }, [user])

  useEffect(() => {
    if (widgetLoaded && mounted) {
      initializeWidgets()
    }
  }, [widgetLoaded, mounted, widgetConfig])

  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${widgetConfig.apiUrl}/health`)
      if (response.ok) {
        setApiStatus('connected')
        fetchTestimonials()
      } else {
        setApiStatus('error')
      }
    } catch (error) {
      setApiStatus('error')
      console.error('API connection failed:', error)
    }
  }

  const loadWidgetScript = () => {
    // Check if script already exists
    if (document.getElementById('testimonial-widget-script')) {
      setWidgetLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.id = 'testimonial-widget-script'
    script.src = '/widget.js'
    script.onload = () => {
      setWidgetLoaded(true)
      console.log('Widget script loaded successfully')
    }
    script.onerror = () => {
      console.error('Failed to load widget script')
      toast({
        title: 'Widget Script Error',
        description: 'Failed to load widget.js. Make sure the file exists in your public folder.',
        variant: 'destructive'
      })
    }
    document.head.appendChild(script)
  }

  const initializeWidgets = () => {
    if (!window.TestimonialFlow) {
      console.error('TestimonialFlow not available')
      return
    }

    // Clear existing widgets
    const widgetContainers = [
      'widget-cards-light',
      'widget-cards-dark',
      'widget-list-light',
      'widget-list-dark',
      'widget-embed-test'
    ]

    widgetContainers.forEach(id => {
      const container = document.getElementById(id)
      if (container && (container as any).TestimonialFlowWidget) {
        (container as any).TestimonialFlowWidget.destroy()
      }
    })

    // Initialize new widgets
    setTimeout(() => {
      try {
        // Cards Layout - Light Theme
        new window.TestimonialFlow.Widget({
          ...widgetConfig,
          layout: 'cards',
          theme: 'light',
          container: 'widget-cards-light'
        })

        // Cards Layout - Dark Theme
        new window.TestimonialFlow.Widget({
          ...widgetConfig,
          layout: 'cards',
          theme: 'dark',
          container: 'widget-cards-dark'
        })

        // List Layout - Light Theme
        new window.TestimonialFlow.Widget({
          ...widgetConfig,
          layout: 'list',
          theme: 'light',
          container: 'widget-list-light'
        })

        // List Layout - Dark Theme
        new window.TestimonialFlow.Widget({
          ...widgetConfig,
          layout: 'list',
          theme: 'dark',
          container: 'widget-list-dark'
        })

        // Embed test widget
        new window.TestimonialFlow.Widget({
          ...widgetConfig,
          container: 'widget-embed-test'
        })

        console.log('Widgets initialized successfully')
        toast({
          title: 'Success',
          description: 'Widgets updated with new configuration'
        })
      } catch (error) {
        console.error('Failed to initialize widgets:', error)
        toast({
          title: 'Widget Error',
          description: 'Failed to initialize widgets. Check console for details.',
          variant: 'destructive'
        })
      }
    }, 100)
  }

  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${widgetConfig.apiUrl}/testimonials/${widgetConfig.userId}?approved_only=true`)
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data.testimonials || [])
        setApiStatus('connected')
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      setApiStatus('error')
      toast({
        title: 'API Error',
        description: 'Failed to fetch testimonials from API. Check your backend connection.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshWidgets = () => {
    const widgetContainers = ['widget-cards-light', 'widget-cards-dark', 'widget-list-light', 'widget-list-dark', 'widget-embed-test']
    widgetContainers.forEach(id => {
      const container = document.getElementById(id)
      if (container && (container as any).TestimonialFlowWidget) {
        (container as any).TestimonialFlowWidget.refresh()
      }
    })
    
    toast({
      title: 'Success',
      description: 'Widgets refreshed with latest data'
    })
  }

  const getEmbedCode = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    return `<!-- TestimonialFlow Widget -->
<script src="${baseUrl}/widget.js"></script>
<div data-testimonial-widget 
     data-user-id="${widgetConfig.userId}"
     data-theme="${widgetConfig.theme}"
     data-layout="${widgetConfig.layout}"
     data-limit="${widgetConfig.limit}"
     data-show-videos="${widgetConfig.showVideos}"
     data-show-dates="${widgetConfig.showDates}"
     data-auto-refresh="${widgetConfig.autoRefresh}">
</div>`
  }

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(getEmbedCode())
      toast({
        title: 'Success',
        description: 'Embed code copied to clipboard!'
      })
    } catch (err) {
      console.error('Failed to copy: ', err)
      toast({
        title: 'Error',
        description: 'Failed to copy embed code',
        variant: 'destructive'
      })
    }
  }

  const openCollectionPage = () => {
    const url = `${window.location.origin}/collect?userId=${widgetConfig.userId}`
    window.open(url, '_blank')
  }

  const getApiStatusColor = () => {
    switch (apiStatus) {
      case 'connected': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  const getApiStatusText = () => {
    switch (apiStatus) {
      case 'connected': return 'Connected'
      case 'error': return 'Connection Failed'
      default: return 'Checking...'
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Testimonial Widget Test
          </h1>
          <p className="text-gray-600">
            Test and preview your testimonial widget with live data from your API
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-600">API Status:</span>
            <span className={`text-sm font-medium ${getApiStatusColor()}`}>
              {getApiStatusText()}
            </span>
            <span className="text-sm text-gray-500">({widgetConfig.apiUrl})</span>
          </div>
        </div>

        {/* API Connection Warning */}
        {apiStatus === 'error' && (
          <Card className="border-red-200 bg-red-50 mb-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">API Connection Failed</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Cannot connect to backend API. Make sure your backend is running on {widgetConfig.apiUrl}
              </p>
              <Button 
                onClick={checkApiConnection} 
                size="sm" 
                variant="outline" 
                className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{testimonials.length}</div>
              <div className="text-sm text-gray-600">Live Testimonials</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Button onClick={fetchTestimonials} disabled={loading} className="w-full" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Fetch Data'}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Button onClick={openCollectionPage} variant="outline" className="w-full" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Collection Page
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Button onClick={refreshWidgets} variant="outline" className="w-full" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Widgets
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Widget Configuration
            </CardTitle>
            <CardDescription>
              Customize the widget appearance and behavior. Changes apply automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={widgetConfig.userId}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="Enter user ID"
                />
                <p className="text-xs text-gray-500 mt-1">Your unique user identifier</p>
              </div>

              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={widgetConfig.theme}
                  onValueChange={(value) => setWidgetConfig(prev => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="layout">Layout</Label>
                <Select
                  value={widgetConfig.layout}
                  onValueChange={(value) => setWidgetConfig(prev => ({ ...prev, layout: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cards">Cards Grid</SelectItem>
                    <SelectItem value="list">Vertical List</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="limit">Number to Show</Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="20"
                  value={widgetConfig.limit}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, limit: parseInt(e.target.value) || 4 }))}
                />
                <p className="text-xs text-gray-500 mt-1">Maximum testimonials to display</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showVideos"
                  checked={widgetConfig.showVideos}
                  onCheckedChange={(checked) => setWidgetConfig(prev => ({ ...prev, showVideos: checked }))}
                />
                <Label htmlFor="showVideos">Show Video Testimonials</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showDates"
                  checked={widgetConfig.showDates}
                  onCheckedChange={(checked) => setWidgetConfig(prev => ({ ...prev, showDates: checked }))}
                />
                <Label htmlFor="showDates">Show Dates</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoRefresh"
                  checked={widgetConfig.autoRefresh}
                  onCheckedChange={(checked) => setWidgetConfig(prev => ({ ...prev, autoRefresh: checked }))}
                />
                <Label htmlFor="autoRefresh">Auto Refresh (30s)</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Cards Layout - Light Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Cards Layout - Light Theme
              </CardTitle>
              <CardDescription>
                Grid-based card layout with light theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div id="widget-cards-light" className="min-h-[400px] border rounded-lg p-4">
                {/* Widget will be rendered here */}
              </div>
            </CardContent>
          </Card>

          {/* Cards Layout - Dark Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Cards Layout - Dark Theme
              </CardTitle>
              <CardDescription>
                Grid-based card layout with dark theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div id="widget-cards-dark" className="min-h-[400px] border rounded-lg p-4">
                {/* Widget will be rendered here */}
              </div>
            </CardContent>
          </Card>

          {/* List Layout - Light Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                List Layout - Light Theme
              </CardTitle>
              <CardDescription>
                Vertical list layout with light theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div id="widget-list-light" className="min-h-[400px] border rounded-lg p-4">
                {/* Widget will be rendered here */}
              </div>
            </CardContent>
          </Card>

          {/* List Layout - Dark Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                List Layout - Dark Theme
              </CardTitle>
              <CardDescription>
                Vertical list layout with dark theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div id="widget-list-dark" className="min-h-[400px] border rounded-lg p-4">
                {/* Widget will be rendered here */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Embed Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Live Embed Test
            </CardTitle>
            <CardDescription>
              This widget uses the exact same embed code that you'll use on your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div id="widget-embed-test" className="min-h-[300px] border-2 border-dashed border-gray-300 rounded-lg p-4">
              {/* Embed widget will be rendered here */}
            </div>
          </CardContent>
        </Card>

        {/* Embed Code */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Embed Code
            </CardTitle>
            <CardDescription>
              Copy this code and paste it into any website where you want to display testimonials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
              <pre>{getEmbedCode()}</pre>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyEmbedCode}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Embed Code
              </Button>
              <Button variant="outline" onClick={() => window.open('/widget.js', '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Widget.js
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live API Data */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Live API Data
            </CardTitle>
            <CardDescription>
              Real testimonials from your API endpoint: {widgetConfig.apiUrl}/testimonials/{widgetConfig.userId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Loading testimonials...</p>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-gray-600 mb-4">No approved testimonials found for this user ID.</p>
                <div className="space-y-2">
                  <Button onClick={openCollectionPage} size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Create Test Testimonial
                  </Button>
                  <p className="text-xs text-gray-500">
                    Use the collection page to submit a test testimonial, then approve it from your dashboard.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.slice(0, 6).map((testimonial: any) => (
                  <div key={testimonial.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-900">{testimonial.name}</span>
                      <div className="flex gap-1">
                        <Badge variant="default" className="text-xs">Approved</Badge>
                        {testimonial.video_url && (
                          <Badge variant="secondary" className="text-xs">Video</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>ID: {testimonial.id.slice(0, 8)}...</span>
                      <span>{new Date(testimonial.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {testimonials.length > 6 && (
                  <div className="col-span-full text-center text-gray-500 text-sm">
                    ... and {testimonials.length - 6} more testimonials
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Total: {testimonials.length} approved testimonials
              </span>
              <Button onClick={fetchTestimonials} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Widget Status */}
        {!widgetLoaded && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="font-medium">Loading widget script...</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Make sure widget.js exists in your public folder.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}