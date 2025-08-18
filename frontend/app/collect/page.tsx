'use client'

import { useSearchParams } from 'next/navigation'
import { CollectionForm } from '@/components/testimonial/collection-form'
import { Suspense } from 'react'
import { AlertCircle, Heart, Star, MessageCircle } from 'lucide-react'

function CollectContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  console.log('Collect page - userId from URL:', userId)

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h1>
            <p className="text-gray-600 mb-4">
              This collection link is invalid. Please contact the business owner for a valid link.
            </p>
            <p className="text-xs text-gray-400">
              Expected format: /collect?userId=your-user-id
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
        
        <div className="relative container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full shadow-lg">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Share Your Experience
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your feedback helps others make informed decisions and supports our community
            </p>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-3 text-gray-600">
                <Star className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium">Quick & Easy</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-gray-600">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium">Help Others</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-gray-600">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Share Stories</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 pb-16 max-w-4xl">
        <CollectionForm userId={userId} />
      </div>
    </div>
  )
}

export default function CollectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-8">
          <div className="animate-pulse text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <CollectContent />
    </Suspense>
  )
}