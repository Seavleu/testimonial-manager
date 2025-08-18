'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Palette, 
  Type, 
  Layout, 
  Eye, 
  Download, 
  Copy, 
  RotateCcw,
  Settings,
  Sparkles,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
  showSocialSharing: boolean
  showCallToAction: boolean
  callToActionText: string
  callToActionUrl: string
}

const DEFAULT_SETTINGS: WidgetSettings = {
  // Colors
  primaryColor: '#3b82f6',
  secondaryColor: '#6b7280',
  accentColor: '#10b981',
  backgroundColor: '#ffffff',
  textColor: '#374151',
  borderColor: '#e5e7eb',
  
  // Typography
  fontFamily: 'Inter',
  fontSize: 16,
  fontWeight: '400',
  lineHeight: 1.5,
  
  // Layout
  layout: 'cards',
  position: 'center',
  width: 100,
  maxWidth: 1200,
  padding: 16,
  borderRadius: 8,
  
  // Behavior
  autoRotate: false,
  rotationSpeed: 5000,
  showArrows: true,
  showDots: true,
  pauseOnHover: true,
  
  // Content
  showRatings: true,
  showDates: true,
  showVideos: true,
  showPhotos: true,
  limit: 4,
  
  // Advanced
  customCSS: '',
  animation: 'fade',
  shadow: 'light',
  showSocialSharing: false,
  showCallToAction: false,
  callToActionText: 'Leave a Review',
  callToActionUrl: '#'
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Open Sans', label: 'Open Sans (Readable)' },
  { value: 'Lato', label: 'Lato (Friendly)' },
  { value: 'Poppins', label: 'Poppins (Modern)' },
  { value: 'Montserrat', label: 'Montserrat (Bold)' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro (Professional)' },
  { value: 'Nunito', label: 'Nunito (Rounded)' }
]

const FONT_WEIGHT_OPTIONS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' }
]

const POSITION_OPTIONS = [
  { value: 'center', label: 'Center' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' }
]

const ANIMATION_OPTIONS = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'none', label: 'None' }
]

const SHADOW_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' }
]

interface WidgetCustomizerProps {
  userId: string
  onSettingsChange?: (settings: WidgetSettings) => void
}

export function WidgetCustomizer({ userId, onSettingsChange }: WidgetCustomizerProps) {
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULT_SETTINGS)
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'behavior' | 'content' | 'advanced'>('colors')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const { toast } = useToast()

  useEffect(() => {
    onSettingsChange?.(settings)
  }, [settings, onSettingsChange])

  const updateSetting = <K extends keyof WidgetSettings>(key: K, value: WidgetSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    toast({
      title: 'Settings Reset',
      description: 'All widget settings have been reset to defaults.'
    })
  }

  const generateCustomCSS = () => {
    const css = `
/* TestimonialFlow Widget Custom Styles */
.testimonial-widget {
  font-family: '${settings.fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: ${settings.fontSize}px;
  font-weight: ${settings.fontWeight};
  line-height: ${settings.lineHeight};
  color: ${settings.textColor};
  background-color: ${settings.backgroundColor};
  border: 1px solid ${settings.borderColor};
  border-radius: ${settings.borderRadius}px;
  padding: ${settings.padding}px;
  max-width: ${settings.maxWidth}px;
  width: ${settings.width}%;
  ${settings.shadow !== 'none' ? `box-shadow: ${getShadowValue(settings.shadow)};` : ''}
}

.testimonial-card {
  border-color: ${settings.borderColor};
  border-radius: ${settings.borderRadius}px;
}

.testimonial-card:hover {
  border-color: ${settings.primaryColor};
}

.testimonial-name {
  color: ${settings.primaryColor};
}

.testimonial-date {
  color: ${settings.secondaryColor};
}

.testimonial-video-icon {
  background-color: ${settings.accentColor};
}

${settings.customCSS}
    `.trim()

    return css
  }

  const getShadowValue = (shadow: string) => {
    switch (shadow) {
      case 'light': return '0 1px 3px rgba(0, 0, 0, 0.1)'
      case 'medium': return '0 4px 6px rgba(0, 0, 0, 0.1)'
      case 'heavy': return '0 10px 25px rgba(0, 0, 0, 0.15)'
      default: return 'none'
    }
  }

  const copyCustomCSS = async () => {
    try {
      await navigator.clipboard.writeText(generateCustomCSS())
      toast({
        title: 'CSS Copied',
        description: 'Custom CSS has been copied to clipboard.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy CSS to clipboard.',
        variant: 'destructive'
      })
    }
  }

  const getEmbedCode = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    return `<!-- TestimonialFlow Widget -->
<script src="${baseUrl}/widget.js"></script>
<div data-testimonial-widget 
     data-user-id="${userId}"
     data-theme="custom"
     data-layout="${settings.layout}"
     data-limit="${settings.limit}"
     data-show-videos="${settings.showVideos}"
     data-show-dates="${settings.showDates}"
     data-show-ratings="${settings.showRatings}"
     data-auto-rotate="${settings.autoRotate}"
     data-rotation-speed="${settings.rotationSpeed}"
     data-animation="${settings.animation}"
     data-show-arrows="${settings.showArrows}"
     data-show-dots="${settings.showDots}"
     data-pause-on-hover="${settings.pauseOnHover}"
     data-show-photos="${settings.showPhotos}"
     data-show-social-sharing="${settings.showSocialSharing}"
     data-show-call-to-action="${settings.showCallToAction}"
     data-call-to-action-text="${settings.callToActionText}"
     data-call-to-action-url="${settings.callToActionUrl}">
</div>
<style>
${generateCustomCSS()}
</style>`
  }

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(getEmbedCode())
      toast({
        title: 'Embed Code Copied',
        description: 'Widget embed code has been copied to clipboard.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy embed code.',
        variant: 'destructive'
      })
    }
  }

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'behavior', label: 'Behavior', icon: Settings },
    { id: 'content', label: 'Content', icon: Eye },
    { id: 'advanced', label: 'Advanced', icon: Sparkles }
  ] as const

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          )
        })}
      </div>

      {/* Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Widget Settings</CardTitle>
              <CardDescription>
                Customize your widget appearance and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Colors Tab */}
              {activeTab === 'colors' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                        placeholder="#6b7280"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="accentColor"
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => updateSetting('accentColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.accentColor}
                        onChange={(e) => updateSetting('accentColor', e.target.value)}
                        placeholder="#10b981"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.backgroundColor}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="textColor"
                        type="color"
                        value={settings.textColor}
                        onChange={(e) => updateSetting('textColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.textColor}
                        onChange={(e) => updateSetting('textColor', e.target.value)}
                        placeholder="#374151"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="borderColor">Border Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="borderColor"
                        type="color"
                        value={settings.borderColor}
                        onChange={(e) => updateSetting('borderColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.borderColor}
                        onChange={(e) => updateSetting('borderColor', e.target.value)}
                        placeholder="#e5e7eb"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Typography Tab */}
              {activeTab === 'typography' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select
                      value={settings.fontFamily}
                      onValueChange={(value) => updateSetting('fontFamily', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fontSize">Font Size (px)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider
                        value={[settings.fontSize]}
                        onValueChange={([value]) => updateSetting('fontSize', value)}
                        min={12}
                        max={24}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500 w-8">{settings.fontSize}</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fontWeight">Font Weight</Label>
                    <Select
                      value={settings.fontWeight}
                      onValueChange={(value) => updateSetting('fontWeight', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_WEIGHT_OPTIONS.map((weight) => (
                          <SelectItem key={weight.value} value={weight.value}>
                            {weight.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="lineHeight">Line Height</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider
                        value={[settings.lineHeight]}
                        onValueChange={([value]) => updateSetting('lineHeight', value)}
                        min={1}
                        max={2}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500 w-8">{settings.lineHeight}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Layout Tab */}
              {activeTab === 'layout' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="layout">Layout Type</Label>
                    <Select
                      value={settings.layout}
                      onValueChange={(value: 'cards' | 'list' | 'carousel') => updateSetting('layout', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cards">Cards Grid</SelectItem>
                        <SelectItem value="list">Vertical List</SelectItem>
                        <SelectItem value="carousel">Carousel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={settings.position}
                      onValueChange={(value: any) => updateSetting('position', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITION_OPTIONS.map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="width">Width (%)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider
                        value={[settings.width]}
                        onValueChange={([value]) => updateSetting('width', value)}
                        min={50}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500 w-8">{settings.width}%</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="maxWidth">Max Width (px)</Label>
                    <Input
                      id="maxWidth"
                      type="number"
                      value={settings.maxWidth}
                      onChange={(e) => updateSetting('maxWidth', parseInt(e.target.value) || 1200)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="padding">Padding (px)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider
                        value={[settings.padding]}
                        onValueChange={([value]) => updateSetting('padding', value)}
                        min={8}
                        max={32}
                        step={4}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500 w-8">{settings.padding}</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="borderRadius">Border Radius (px)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider
                        value={[settings.borderRadius]}
                        onValueChange={([value]) => updateSetting('borderRadius', value)}
                        min={0}
                        max={20}
                        step={2}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500 w-8">{settings.borderRadius}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Behavior Tab */}
              {activeTab === 'behavior' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="autoRotate"
                      checked={settings.autoRotate}
                      onCheckedChange={(checked) => updateSetting('autoRotate', checked)}
                    />
                    <Label htmlFor="autoRotate">Auto Rotate</Label>
                  </div>

                  {settings.autoRotate && (
                    <div>
                      <Label htmlFor="rotationSpeed">Rotation Speed (ms)</Label>
                      <Input
                        id="rotationSpeed"
                        type="number"
                        value={settings.rotationSpeed}
                        onChange={(e) => updateSetting('rotationSpeed', parseInt(e.target.value) || 5000)}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Switch
                      id="showArrows"
                      checked={settings.showArrows}
                      onCheckedChange={(checked) => updateSetting('showArrows', checked)}
                    />
                    <Label htmlFor="showArrows">Show Navigation Arrows</Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch
                      id="showDots"
                      checked={settings.showDots}
                      onCheckedChange={(checked) => updateSetting('showDots', checked)}
                    />
                    <Label htmlFor="showDots">Show Dots Indicator</Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch
                      id="pauseOnHover"
                      checked={settings.pauseOnHover}
                      onCheckedChange={(checked) => updateSetting('pauseOnHover', checked)}
                    />
                    <Label htmlFor="pauseOnHover">Pause on Hover</Label>
                  </div>

                  <div>
                    <Label htmlFor="animation">Animation</Label>
                    <Select
                      value={settings.animation}
                      onValueChange={(value: 'fade' | 'slide' | 'zoom' | 'none') => updateSetting('animation', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ANIMATION_OPTIONS.map((animation) => (
                          <SelectItem key={animation.value} value={animation.value}>
                            {animation.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="shadow">Shadow</Label>
                    <Select
                      value={settings.shadow}
                      onValueChange={(value: 'none' | 'light' | 'medium' | 'heavy') => updateSetting('shadow', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SHADOW_OPTIONS.map((shadow) => (
                          <SelectItem key={shadow.value} value={shadow.value}>
                            {shadow.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="limit">Number of Testimonials</Label>
                    <Input
                      id="limit"
                      type="number"
                      min="1"
                      max="20"
                      value={settings.limit}
                      onChange={(e) => updateSetting('limit', parseInt(e.target.value) || 4)}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch
                      id="showRatings"
                      checked={settings.showRatings}
                      onCheckedChange={(checked) => updateSetting('showRatings', checked)}
                    />
                    <Label htmlFor="showRatings">Show Ratings</Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch
                      id="showDates"
                      checked={settings.showDates}
                      onCheckedChange={(checked) => updateSetting('showDates', checked)}
                    />
                    <Label htmlFor="showDates">Show Dates</Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch
                      id="showVideos"
                      checked={settings.showVideos}
                      onCheckedChange={(checked) => updateSetting('showVideos', checked)}
                    />
                    <Label htmlFor="showVideos">Show Videos</Label>
                  </div>

                                <div className="flex items-center space-x-3">
                <Switch
                  id="showPhotos"
                  checked={settings.showPhotos}
                  onCheckedChange={(checked) => updateSetting('showPhotos', checked)}
                />
                <Label htmlFor="showPhotos">Show Photos</Label>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="showSocialSharing"
                  checked={settings.showSocialSharing}
                  onCheckedChange={(checked) => updateSetting('showSocialSharing', checked)}
                />
                <Label htmlFor="showSocialSharing">Show Social Sharing</Label>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="showCallToAction"
                  checked={settings.showCallToAction}
                  onCheckedChange={(checked) => updateSetting('showCallToAction', checked)}
                />
                <Label htmlFor="showCallToAction">Show Call to Action</Label>
              </div>

              {settings.showCallToAction && (
                <>
                  <div>
                    <Label htmlFor="callToActionText">Call to Action Text</Label>
                    <Input
                      id="callToActionText"
                      value={settings.callToActionText}
                      onChange={(e) => updateSetting('callToActionText', e.target.value)}
                      placeholder="Leave a Review"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="callToActionUrl">Call to Action URL</Label>
                    <Input
                      id="callToActionUrl"
                      value={settings.callToActionUrl}
                      onChange={(e) => updateSetting('callToActionUrl', e.target.value)}
                      placeholder="https://example.com/review"
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </div>
          )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customCSS">Custom CSS</Label>
                    <textarea
                      id="customCSS"
                      value={settings.customCSS}
                      onChange={(e) => updateSetting('customCSS', e.target.value)}
                      placeholder="/* Add your custom CSS here */"
                      className="w-full h-32 p-2 border border-gray-300 rounded-md text-sm font-mono resize-none mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add custom CSS to further customize the widget appearance
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={copyCustomCSS} variant="outline" size="sm" className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy CSS
                    </Button>
                    <Button onClick={resetSettings} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Live Preview</CardTitle>
                  <CardDescription>
                    See your changes in real-time
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Desktop
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 ${
                previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
              }`}>
                <div 
                  id="widget-preview"
                  className="min-h-[400px] bg-white rounded-lg overflow-hidden"
                  style={{
                    fontFamily: `'${settings.fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
                    fontSize: `${settings.fontSize}px`,
                    fontWeight: settings.fontWeight,
                    lineHeight: settings.lineHeight,
                    color: settings.textColor,
                    backgroundColor: settings.backgroundColor,
                    border: `1px solid ${settings.borderColor}`,
                    borderRadius: `${settings.borderRadius}px`,
                    padding: `${settings.padding}px`,
                    maxWidth: `${settings.maxWidth}px`,
                    width: `${settings.width}%`,
                    boxShadow: getShadowValue(settings.shadow)
                  }}
                >
                  {/* Preview content will be injected here */}
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Widget preview will appear here</p>
                    <p className="text-sm">Configure your settings to see the live preview</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Embed Code</CardTitle>
              <CardDescription>
                Copy this code to embed your customized widget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4 border border-gray-700">
                <pre>{getEmbedCode()}</pre>
              </div>
              <div className="flex gap-3">
                <Button onClick={copyEmbedCode} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Embed Code
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Widget
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
