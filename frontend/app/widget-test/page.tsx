'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Code, Eye, Settings, RefreshCw } from 'lucide-react'
import { Header } from '@/components/layout/header'

// TypeScript declarations for the global TestimonialFlow object
declare global {
  interface Window {
    TestimonialFlow: {
      Widget: new (options: any) => any;
    };
  }
}

// Sample testimonials for testing
const sampleTestimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    text: 'This product completely transformed my workflow. I can\'t imagine working without it now!',
    video_url: null,
    approved: true,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Mike Chen',
    text: 'Outstanding customer service and the quality exceeded my expectations. Highly recommended!',
    video_url: null,
    approved: true,
    created_at: '2024-01-10T14:20:00Z'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    text: 'I was skeptical at first, but after using it for a week, I\'m completely sold. Amazing results!',
    video_url: null,
    approved: true,
    created_at: '2024-01-05T09:15:00Z'
  },
  {
    id: '4',
    name: 'David Thompson',
    text: 'The best investment I\'ve made this year. The ROI was immediate and continues to grow.',
    video_url: null,
    approved: true,
    created_at: '2024-01-01T16:45:00Z'
  }
]

export default function WidgetTestPage() {
  const [widgetConfig, setWidgetConfig] = useState({
    userId: 'test-user-123',
    theme: 'light',
    layout: 'cards',
    limit: 4,
    showVideos: true,
    autoRefresh: false
  })

  const [activeWidgets, setActiveWidgets] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Initialize widgets when component mounts
    if (mounted && typeof window !== 'undefined' && window.TestimonialFlow) {
      initializeWidgets()
    }
  }, [mounted]) // Only run when mounted

  useEffect(() => {
    // Re-initialize widgets when config changes
    if (typeof window !== 'undefined' && window.TestimonialFlow && activeWidgets.length > 0) {
      initializeWidgets()
    }
  }, [widgetConfig])

  const initializeWidgets = () => {
    // Clear existing widgets
    setActiveWidgets([])
    
    // Wait for DOM to update
    setTimeout(() => {
      if (window.TestimonialFlow) {
        // Initialize different widget configurations
        const widgets = [
          {
            id: 'widget-cards-light',
            config: { ...widgetConfig, layout: 'cards', theme: 'light' }
          },
          {
            id: 'widget-cards-dark',
            config: { ...widgetConfig, layout: 'cards', theme: 'dark' }
          },
          {
            id: 'widget-list-light',
            config: { ...widgetConfig, layout: 'list', theme: 'light' }
          },
          {
            id: 'widget-list-dark',
            config: { ...widgetConfig, layout: 'list', theme: 'dark' }
          }
        ]

        widgets.forEach(widget => {
          try {
            new window.TestimonialFlow.Widget({
              ...widget.config,
              container: widget.id
            })
            setActiveWidgets(prev => [...prev, widget.id])
          } catch (error) {
            console.error(`Failed to initialize widget ${widget.id}:`, error)
          }
        })
      }
    }, 100)
  }

  const refreshWidgets = () => {
    if (window.TestimonialFlow) {
      activeWidgets.forEach(widgetId => {
        const widget = document.getElementById(widgetId)
        // Try to access the widget instance if it exists
        if (widget && (widget as any).TestimonialFlowWidget) {
          (widget as any).TestimonialFlowWidget.refresh()
        }
      })
    }
  }

  const getEmbedCode = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    return `<script src="${baseUrl}/widget.js"></script>
<div id="testimonial-widget" 
     data-testimonial-widget 
     data-user-id="${widgetConfig.userId}"
     data-theme="${widgetConfig.theme}"
     data-layout="${widgetConfig.layout}"
     data-limit="${widgetConfig.limit}"
     data-show-videos="${widgetConfig.showVideos}">
</div>`
  }

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(getEmbedCode())
      // You could add a toast notification here
      alert('Embed code copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
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
            Widget Test Page
          </h1>
          <p className="text-gray-600">
            Test and preview your testimonial widget with different configurations
          </p>
        </div>

        {/* Configuration Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Widget Configuration
            </CardTitle>
            <CardDescription>
              Customize the widget appearance and behavior
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
                    <SelectItem value="cards">Cards</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="limit">Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="20"
                  value={widgetConfig.limit}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, limit: parseInt(e.target.value) || 4 }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showVideos"
                  checked={widgetConfig.showVideos}
                  onCheckedChange={(checked) => setWidgetConfig(prev => ({ ...prev, showVideos: checked }))}
                />
                <Label htmlFor="showVideos">Show Videos</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoRefresh"
                  checked={widgetConfig.autoRefresh}
                  onCheckedChange={(checked) => setWidgetConfig(prev => ({ ...prev, autoRefresh: checked }))}
                />
                <Label htmlFor="autoRefresh">Auto Refresh</Label>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={initializeWidgets} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Apply Changes
              </Button>
              <Button onClick={refreshWidgets} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Widgets
              </Button>
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
              <div id="widget-cards-light" className="min-h-[400px]">
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
              <div id="widget-cards-dark" className="min-h-[400px]">
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
              <div id="widget-list-light" className="min-h-[400px]">
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
              <div id="widget-list-dark" className="min-h-[400px]">
                {/* Widget will be rendered here */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Embed Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Embed Code
            </CardTitle>
            <CardDescription>
              Copy this code to embed the widget on any website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{getEmbedCode()}</pre>
            </div>
            <Button onClick={copyEmbedCode} className="mt-4">
              <Code className="h-4 w-4 mr-2" />
              Copy Embed Code
            </Button>
          </CardContent>
        </Card>

        {/* Sample Data Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Sample Data</CardTitle>
            <CardDescription>
              This page uses sample testimonials for demonstration. In production, the widget will fetch real testimonials from your API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{testimonial.name}</span>
                    <Badge variant={testimonial.approved ? 'default' : 'secondary'}>
                      {testimonial.approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">&ldquo;{testimonial.text}&rdquo;</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(testimonial.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
