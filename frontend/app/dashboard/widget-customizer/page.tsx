'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { WidgetCustomizer } from '@/components/widget/widget-customizer'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import { 
  Palette, 
  Eye, 
  Code, 
  Download, 
  Settings, 
  Sparkles,
  ArrowLeft,
  Save,
  Share2
} from 'lucide-react'
import Link from 'next/link'

interface WidgetSettings {
  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderColor: string
  
  // Typography
  fontFamily: string
  fontSize: number
  fontWeight: string
  lineHeight: number
  
  // Layout
  layout: 'cards' | 'list' | 'carousel'
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  width: number
  maxWidth: number
  padding: number
  borderRadius: number
  
  // Behavior
  autoRotate: boolean
  rotationSpeed: number
  showArrows: boolean
  showDots: boolean
  pauseOnHover: boolean
  
  // Content
  showRatings: boolean
  showDates: boolean
  showVideos: boolean
  showPhotos: boolean
  limit: number
  
  // Advanced
  customCSS: string
  animation: 'fade' | 'slide' | 'zoom' | 'none'
  shadow: 'none' | 'light' | 'medium' | 'heavy'
}

export default function WidgetCustomizerPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentSettings, setCurrentSettings] = useState<WidgetSettings | null>(null)
  const [savedSettings, setSavedSettings] = useState<WidgetSettings[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadSavedSettings()
  }, [])

  const loadSavedSettings = () => {
    try {
      const saved = localStorage.getItem('widget-settings')
      if (saved) {
        setSavedSettings(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load saved settings:', error)
    }
  }

  const saveCurrentSettings = () => {
    if (!currentSettings) return

    try {
      const newSettings = [...savedSettings, { ...currentSettings, id: Date.now(), name: `Widget ${savedSettings.length + 1}` }]
      setSavedSettings(newSettings)
      localStorage.setItem('widget-settings', JSON.stringify(newSettings))
      
      toast({
        title: 'Settings Saved',
        description: 'Your widget settings have been saved successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive'
      })
    }
  }

  const handleSettingsChange = (settings: WidgetSettings) => {
    setCurrentSettings(settings)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Widget Customizer
              </h1>
              <p className="text-gray-600 text-lg">
                Create and customize your testimonial widgets with advanced styling options
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  User ID: {user?.id || 'Not logged in'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {savedSettings.length} saved configurations
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4 lg:mt-0">
              <Button 
                onClick={saveCurrentSettings}
                disabled={!currentSettings}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
              <Link href="/widget-test">
                <Button variant="outline" className="border-2 hover:bg-gray-50">
                  <Eye className="h-4 w-4 mr-2" />
                  Test Widget
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                <Palette className="h-8 w-8 mx-auto mb-2" />
              </div>
              <div className="text-sm text-gray-600">Color Schemes</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                <Settings className="h-8 w-8 mx-auto mb-2" />
              </div>
              <div className="text-sm text-gray-600">Layout Options</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                <Sparkles className="h-8 w-8 mx-auto mb-2" />
              </div>
              <div className="text-sm text-gray-600">Advanced Features</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">
                <Code className="h-8 w-8 mx-auto mb-2" />
              </div>
              <div className="text-sm text-gray-600">Embed Code</div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Configurations */}
        {savedSettings.length > 0 && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5 text-green-600" />
                Saved Configurations
              </CardTitle>
              <CardDescription>
                Your previously saved widget configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedSettings.map((setting, index) => (
                  <div key={setting.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{setting.name}</span>
                      <div className="flex gap-1">
                        <Badge variant="default" className="text-xs">{setting.layout}</Badge>
                        <Badge variant="secondary" className="text-xs">{setting.fontFamily}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border" style={{ backgroundColor: setting.primaryColor }}></div>
                        <span>Primary: {setting.primaryColor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border" style={{ backgroundColor: setting.backgroundColor }}></div>
                        <span>Background: {setting.backgroundColor}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Widget Customizer */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-600" />
              Customize Your Widget
            </CardTitle>
            <CardDescription>
              Use the tabs below to customize colors, typography, layout, behavior, content, and advanced settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WidgetCustomizer 
              userId={user?.id || 'demo-user'} 
              onSettingsChange={handleSettingsChange}
            />
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-600" />
                Design Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Color scheme customization with color picker
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Typography options with 8+ font families
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Layout positioning and sizing controls
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Border radius and shadow customization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Custom CSS injection support
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Advanced Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Auto-rotation with customizable timing
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Navigation arrows and dots indicators
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Pause on hover functionality
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Multiple animation types (fade, slide, zoom)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Live preview with desktop/mobile modes
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
