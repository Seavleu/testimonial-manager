'use client'

import { useSearchParams } from 'next/navigation'
import { CollectionForm } from '@/components/testimonial/collection-form'
import { Suspense } from 'react'

function CollectContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  console.log('Collect page - userId from URL:', userId)

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h1>
          <p className="text-gray-600">
            This collection link is invalid. Please contact the business owner for a valid link.
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Expected format: /collect?userId=your-user-id
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Experience</h1>
        <p className="text-gray-600">Your feedback helps others make informed decisions</p>
      </div>
      <CollectionForm userId={userId} />
    </div>
  )
}

export default function CollectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    }>
      <CollectContent />
    </Suspense>
  )
}