'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Play, Image, Calendar, Share2, ExternalLink, Heart } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  text: string
  rating: number
  company?: string
  created_at: string
  photo_url?: string
  video_url?: string
  category?: string
}

interface WidgetPreviewProps {
  settings: any
  previewMode: 'desktop' | 'mobile'
  userId: string
}

export function WidgetPreview({ settings, previewMode, userId }: WidgetPreviewProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Mock testimonials for preview
  const mockTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      text: 'This service completely transformed our business. The quality and attention to detail exceeded all our expectations. Highly recommend!',
      rating: 5,
      company: 'TechCorp Inc.',
      created_at: '2025-01-15',
      category: 'product-quality'
    },
    {
      id: '2',
      name: 'Michael Chen',
      text: 'Outstanding customer service and incredible results. The team went above and beyond to deliver exactly what we needed.',
      rating: 5,
      company: 'StartupXYZ',
      created_at: '2025-01-14',
      category: 'customer-service'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      text: 'Great value for money. The features we got for the price point are incredible. This has been a game-changer for our workflow.',
      rating: 4,
      company: 'Design Studio',
      created_at: '2025-01-13',
      category: 'value'
    },
    {
      id: '4',
      name: 'David Thompson',
      text: 'I was skeptical at first, but this service delivered beyond my expectations. The results speak for themselves.',
      rating: 5,
      company: 'Marketing Pro',
      created_at: '2025-01-12',
      category: 'recommendation'
    }
  ]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setTestimonials(mockTestimonials.slice(0, settings.limit || 4))
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [settings.limit])

  useEffect(() => {
    if (settings.autoRotate && testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % testimonials.length)
      }, settings.rotationSpeed || 5000)

      return () => clearInterval(interval)
    }
  }, [settings.autoRotate, settings.rotationSpeed, testimonials.length])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const renderTestimonial = (testimonial: Testimonial, index: number) => {
    const isActive = index === currentIndex

    return (
      <Card
        key={testimonial.id}
        className={`transition-all duration-300 ${
          isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          borderColor: settings.borderColor,
          borderRadius: `${settings.borderRadius}px`,
          boxShadow: settings.shadow !== 'none' ? getShadowValue(settings.shadow) : 'none'
        }}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: settings.primaryColor }}>
                  {testimonial.name}
                </h4>
                {testimonial.company && (
                  <p className="text-sm" style={{ color: settings.secondaryColor }}>
                    {testimonial.company}
                  </p>
                )}
              </div>
            </div>
            
            {settings.showSocialSharing && (
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Rating */}
          {settings.showRatings && (
            <div className="flex items-center space-x-1 mb-3">
              {renderStars(testimonial.rating)}
              <span className="text-sm ml-2" style={{ color: settings.secondaryColor }}>
                {testimonial.rating}/5
              </span>
            </div>
          )}

          {/* Content */}
          <p className="mb-3 leading-relaxed" style={{ color: settings.textColor }}>
            "{testimonial.text}"
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {settings.showDates && (
                <div className="flex items-center space-x-1 text-sm" style={{ color: settings.secondaryColor }}>
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(testimonial.created_at)}</span>
                </div>
              )}
              
              {testimonial.category && (
                <Badge variant="secondary" className="text-xs">
                  {testimonial.category.replace('-', ' ')}
                </Badge>
              )}
            </div>

            {/* Media indicators */}
            <div className="flex items-center space-x-2">
              {testimonial.photo_url && settings.showPhotos && (
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Image className="h-3 w-3 text-blue-600" />
                </div>
              )}
              {testimonial.video_url && settings.showVideos && (
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <Play className="h-3 w-3 text-red-600" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getShadowValue = (shadow: string) => {
    switch (shadow) {
      case 'light': return '0 1px 3px rgba(0, 0, 0, 0.1)'
      case 'medium': return '0 4px 6px rgba(0, 0, 0, 0.1)'
      case 'heavy': return '0 10px 25px rgba(0, 0, 0, 0.15)'
      default: return 'none'
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: settings.primaryColor }}></div>
      </div>
    )
  }

  if (testimonials.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-center">
        <div>
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" style={{ color: settings.secondaryColor }} />
          <p style={{ color: settings.textColor }}>No testimonials available</p>
          <p className="text-sm" style={{ color: settings.secondaryColor }}>
            Add some testimonials to see them here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Layout-specific rendering */}
      {settings.layout === 'carousel' && (
        <div className="relative">
          <div className="overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className={index === currentIndex ? 'block' : 'hidden'}>
                {renderTestimonial(testimonial, index)}
              </div>
            ))}
          </div>
          
          {/* Navigation */}
          {testimonials.length > 1 && (
            <>
              {settings.showArrows && (
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentIndex(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
                    className="bg-white/80 hover:bg-white shadow-md"
                  >
                    ←
                  </Button>
                </div>
              )}
              
              {settings.showArrows && (
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentIndex(prev => (prev + 1) % testimonials.length)}
                    className="bg-white/80 hover:bg-white shadow-md"
                  >
                    →
                  </Button>
                </div>
              )}
              
              {settings.showDots && (
                <div className="flex justify-center space-x-2 mt-4">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex 
                          ? 'bg-blue-500' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {settings.layout === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((testimonial, index) => renderTestimonial(testimonial, index))}
        </div>
      )}

      {settings.layout === 'list' && (
        <div className="space-y-4">
          {testimonials.map((testimonial, index) => renderTestimonial(testimonial, index))}
        </div>
      )}

      {/* Call to Action */}
      {settings.showCallToAction && (
        <div className="text-center pt-4">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            onClick={() => window.open(settings.callToActionUrl, '_blank')}
          >
            {settings.callToActionText}
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
