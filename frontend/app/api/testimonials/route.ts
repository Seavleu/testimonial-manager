'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Code, Eye, Settings, RefreshCw } from 'lucide-react';
import { Header } from '@/components/layout/header';

// Sample testimonials
const sampleTestimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    text: 'This product completely transformed my workflow. I can\'t imagine working without it now!',
    video_url: null,
    approved: true,
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Mike Chen',
    text: 'Outstanding customer service and the quality exceeded my expectations. Highly recommended!',
    video_url: null,
    approved: true,
    created_at: '2024-01-10T14:20:00Z',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    text: 'I was skeptical at first, but after using it for a week, I\'m completely sold. Amazing results!',
    video_url: null,
    approved: true,
    created_at: '2024-01-05T09:15:00Z',
  },
  {
    id: '4',
    name: 'David Thompson',
    text: 'The best investment I\'ve made this year. The ROI was immediate and continues to grow.',
    video_url: null,
    approved: true,
    created_at: '2024-01-01T16:45:00Z',
  },
];

export default function WidgetTestPage() {
  const [widgetConfig, setWidgetConfig] = useState({
    userId: 'test-user-123',
    theme: 'light',
    layout: 'cards',
    limit: 4,
    showVideos: true,
    autoRefresh: false,
  });
  const [activeWidgets, setActiveWidgets] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.TestimonialFlow) {
      initializeWidgets();
    }
  }, [widgetConfig]);

  const initializeWidgets = () => {
    setActiveWidgets([]);
    setTimeout(() => {
      if (window.TestimonialFlow) {
        const widgets = [
          { id: 'widget-cards-light', config: { ...widgetConfig, layout: 'cards', theme: 'light' } },
          { id: 'widget-cards-dark', config: { ...widgetConfig, layout: 'cards', theme: 'dark' } },
          { id: 'widget-list-light', config: { ...widgetConfig, layout: 'list', theme: 'light' } },
          { id: 'widget-list-dark', config: { ...widgetConfig, layout: 'list', theme: 'dark' } },
        ];

        widgets.forEach((widget) => {
          try {
            new window.TestimonialFlow.Widget({
              ...widget.config,
              container: widget.id,
            });
            setActiveWidgets((prev) => [...prev, widget.id]);
          } catch (error) {
            console.error(`Failed to initialize widget ${widget.id}:`, error);
          }
        });
      }
    }, 100);
  };

  const refreshWidgets = () => {
    if (window.TestimonialFlow) {
      activeWidgets.forEach((widgetId) => {
        const widget = document.getElementById(widgetId);
        if (widget && widget.TestimonialFlowWidget) {
          widget.TestimonialFlowWidget.refresh();
        }
      });
    }
  };

  const getEmbedCode = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `<script src="${baseUrl}/widget.js" defer></script>
<div id="testimonial-widget" 
     data-user-id="${widgetConfig.userId}"
     data-theme="${widgetConfig.theme}"
     data-layout="${widgetConfig.layout}"
     data-limit="${widgetConfig.limit}"
     data-show-videos="${widgetConfig.showVideos}">
</div>`;
  };

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(getEmbedCode());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Auto-refresh logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (widgetConfig.autoRefresh) {
      interval = setInterval(refreshWidgets, 5000);
    }
    return () => clearInterval(interval);
  }, [widgetConfig.autoRefresh]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Testimonial Widget Studio <Badge variant="secondary" className="animate-pulse">Live</Badge>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Explore and configure your testimonial widget</p>
        </header>

        {/* Configuration Panel */}
        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Settings className="h-6 w-6" />
              Widget Settings
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Customize your widget’s appearance and behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="userId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  User ID <span className="text-gray-500">(e.g., test-user-123)</span>
                </Label>
                <Input
                  id="userId"
                  value={widgetConfig.userId}
                  onChange={(e) => setWidgetConfig((prev) => ({ ...prev, userId: e.target.value }))}
                  className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                  placeholder="Enter user ID"
                />
              </div>
              <div>
                <Label htmlFor="theme" className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</Label>
                <Select
                  value={widgetConfig.theme}
                  onValueChange={(value) => setWidgetConfig((prev) => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="layout" className="text-sm font-medium text-gray-700 dark:text-gray-300">Layout</Label>
                <Select
                  value={widgetConfig.layout}
                  onValueChange={(value) => setWidgetConfig((prev) => ({ ...prev, layout: value }))}
                >
                  <SelectTrigger className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cards">Cards</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="limit" className="text-sm font-medium text-gray-700 dark:text-gray-300">Limit (1-20)</Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="20"
                  value={widgetConfig.limit}
                  onChange={(e) =>
                    setWidgetConfig((prev) => ({
                      ...prev,
                      limit: Math.min(Math.max(1, parseInt(e.target.value) || 1), 20),
                    }))
                  }
                  className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showVideos"
                  checked={widgetConfig.showVideos}
                  onCheckedChange={(checked) => setWidgetConfig((prev) => ({ ...prev, showVideos: checked }))}
                />
                <Label htmlFor="showVideos" className="text-sm text-gray-700 dark:text-gray-300">Show Videos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoRefresh"
                  checked={widgetConfig.autoRefresh}
                  onCheckedChange={(checked) => setWidgetConfig((prev) => ({ ...prev, autoRefresh: checked }))}
                />
                <Label htmlFor="autoRefresh" className="text-sm text-gray-700 dark:text-gray-300">Auto Refresh</Label>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={initializeWidgets}
                variant="outline"
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Apply Changes
              </Button>
              <Button
                onClick={refreshWidgets}
                variant="outline"
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Widget Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[
            { id: 'widget-cards-light', title: 'Cards - Light', desc: 'Grid layout with light theme' },
            { id: 'widget-cards-dark', title: 'Cards - Dark', desc: 'Grid layout with dark theme' },
            { id: 'widget-list-light', title: 'List - Light', desc: 'Vertical list with light theme' },
            { id: 'widget-list-dark', title: 'List - Dark', desc: 'Vertical list with dark theme' },
          ].map(({ id, title, desc }) => (
            <Card
              key={id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Eye className="h-5 w-5" /> {title}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">{desc}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div
                  id={id}
                  className={`min-h-[400px] ${widgetConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4`}
                >
                  {/* Widget rendered here */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Embed Code */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Code className="h-5 w-5" /> Embed Code
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Copy this code to embed the widget on your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{getEmbedCode()}</pre>
            </div>
            <Button
              onClick={copyEmbedCode}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Code className="h-4 w-4 mr-2" /> {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
          </CardContent>
        </Card>

        {/* Sample Data */}
        <Card className="mt-8 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Sample Testimonials</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Preview the data used for testing. Real data will come from your API in production.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{testimonial.name}</span>
                    <Badge
                      variant={testimonial.approved ? 'default' : 'secondary'}
                      className="animate-pulse-once"
                    >
                      {testimonial.approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    &quot;{testimonial.text}&quot;
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(testimonial.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Add to `frontend/globals.css` or a similar stylesheet
/* 
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes pulseOnce {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.animate-pulse-once {
  animation: pulseOnce 1.5s ease-in-out;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}
*/