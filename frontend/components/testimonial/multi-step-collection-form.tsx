'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea'
import { progressSaver } from '@/lib/progress-saver'
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  X, 
  FileVideo, 
  Sparkles, 
  Shield, 
  Clock, 
  Users,
  ChevronLeft,
  ChevronRight,
  User,
  MessageSquare,
  Star,
  Camera,
  Share2
} from 'lucide-react'

// Enhanced schema for multi-step form
const testimonialSchema = z.object({
  // Step 1: Basic Information
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  
  // Step 2: Experience Details
  rating: z.number().min(1, 'Please select a rating').max(5, 'Rating must be between 1 and 5'),
  category: z.string().min(1, 'Please select a category'),
  text: z.string().min(10, 'Testimonial must be at least 10 characters').max(500, 'Testimonial must be less than 500 characters'),
  
  // Step 3: Media & Additional Info
  video: z.instanceof(File).optional().nullable(),
  photo: z.instanceof(File).optional().nullable(),
  allowSharing: z.boolean(),
  
  // Step 4: Review & Submit
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
})

type TestimonialForm = z.infer<typeof testimonialSchema>

interface MultiStepCollectionFormProps {
  userId?: string
}

// File validation constants
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB in bytes
const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5MB for photos
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi']

// Form steps configuration
const FORM_STEPS = [
  {
    id: 1,
    title: 'Basic Information',
    description: 'Tell us about yourself',
    icon: User,
    fields: ['name', 'email']
  },
  {
    id: 2,
    title: 'Your Experience',
    description: 'Share your experience and rating',
    icon: Star,
    fields: ['rating', 'category', 'text']
  },
  {
    id: 3,
    title: 'Media & Preferences',
    description: 'Add photos, videos, and preferences',
    icon: Camera,
    fields: ['video', 'photo', 'allowSharing']
  },
  {
    id: 4,
    title: 'Review & Submit',
    description: 'Review your testimonial and submit',
    icon: CheckCircle,
    fields: ['termsAccepted']
  }
]

// Category options
const CATEGORIES = [
  { value: 'product', label: 'Product Experience' },
  { value: 'service', label: 'Customer Service' },
  { value: 'support', label: 'Technical Support' },
  { value: 'overall', label: 'Overall Experience' },
  { value: 'recommendation', label: 'Recommendation' }
]

export function MultiStepCollectionForm({ userId }: MultiStepCollectionFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [videoError, setVideoError] = useState<string>('')
  const [photoError, setPhotoError] = useState<string>('')
  const [personalMessage, setPersonalMessage] = useState<{title: string, message: string} | null>(null)
  const [isProgressSaved, setIsProgressSaved] = useState(false)
  const { toast } = useToast()

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch personal message
  useEffect(() => {
    if (mounted && userId) {
      fetchPersonalMessage()
    }
  }, [mounted, userId])

  const fetchPersonalMessage = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/personal-message/${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.message) {
          setPersonalMessage({
            title: data.message.title,
            message: data.message.message
          })
        }
      }
    } catch (error) {
      console.log('No personal message found or error fetching:', error)
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialSchema),
    mode: 'onChange',
    defaultValues: {
      rating: 0,
      category: '',
      allowSharing: true,
      termsAccepted: false,
    }
  })

  const watchedValues = watch()

  // Progress saving functionality
  useEffect(() => {
    if (mounted && userId) {
      // Load saved progress on mount
      const savedProgress = progressSaver.loadProgress(userId)
      if (savedProgress) {
        // Restore form data
        Object.entries(savedProgress.formData).forEach(([key, value]) => {
          if (key === 'video' || key === 'photo') {
            // Handle file objects separately
            if (value && typeof value === 'object' && value.name) {
              // For now, we'll just restore the file name info
              // In a real implementation, you might want to store file data differently
              console.log(`Restored ${key}: ${value.name}`)
            }
          } else {
            setValue(key as any, value)
          }
        })
        
        // Restore step
        setCurrentStep(savedProgress.step)
        
        toast({
          title: 'Progress Restored',
          description: `Resumed from step ${savedProgress.step}`,
        })
      }
    }
  }, [mounted, userId, setValue, toast])

  // Auto-save progress
  useEffect(() => {
    if (mounted && userId) {
      const cleanup = progressSaver.startAutoSave(
        userId,
        () => {
          const formData = getValues()
          // Convert files to serializable format
          const serializableData = {
            ...formData,
            video: selectedVideo ? { name: selectedVideo.name, size: selectedVideo.size } : null,
            photo: selectedPhoto ? { name: selectedPhoto.name, size: selectedPhoto.size } : null,
          }
          return serializableData
        },
        () => currentStep
      )
      
      // Show progress saved indicator
      setIsProgressSaved(true)
      setTimeout(() => setIsProgressSaved(false), 2000)
      
      return cleanup
    }
  }, [mounted, userId, getValues, currentStep, selectedVideo, selectedPhoto])

  // Clear progress function
  const clearProgress = () => {
    if (userId) {
      progressSaver.clearProgress(userId)
      toast({
        title: 'Progress Cleared',
        description: 'Your saved progress has been cleared.',
      })
    }
  }

  // Calculate progress percentage
  const progressPercentage = (currentStep / FORM_STEPS.length) * 100

  // Check if current step is valid
  const isCurrentStepValid = async () => {
    const currentStepFields = FORM_STEPS[currentStep - 1].fields
    const result = await trigger(currentStepFields as any)
    return result
  }

  // Navigation functions
  const nextStep = async () => {
    const isValid = await isCurrentStepValid()
    if (isValid && currentStep < FORM_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // File validation functions
  const validateVideo = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size allowed is 50MB.`
    }

    if (file.type && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return `File type "${file.type}" is not supported. Please use MP4, MOV, WebM, or AVI format.`
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `File extension "${extension}" is not supported. Please use MP4, MOV, WebM, or AVI format.`
    }

    return null
  }

  const validatePhoto = (file: File): string | null => {
    if (file.size > MAX_PHOTO_SIZE) {
      return `Photo is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size allowed is 5MB.`
    }

    if (file.type && !ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return `Photo type "${file.type}" is not supported. Please use JPEG, PNG, or WebP format.`
    }

    return null
  }

  // File handling functions
  const handleVideoChange = (file: File | null) => {
    setVideoError('')
    setSelectedVideo(file)
    
    if (file) {
      const error = validateVideo(file)
      if (error) {
        setVideoError(error)
        setSelectedVideo(null)
      } else {
        setValue('video', file)
      }
    } else {
      setValue('video', null)
    }
  }

  const handlePhotoChange = (file: File | null) => {
    setPhotoError('')
    setSelectedPhoto(file)
    
    if (file) {
      const error = validatePhoto(file)
      if (error) {
        setPhotoError(error)
        setSelectedPhoto(null)
      } else {
        setValue('photo', file)
      }
    } else {
      setValue('photo', null)
    }
  }

  // Rating component
  const RatingInput = () => {
    const [hoveredRating, setHoveredRating] = useState(0)
    const currentRating = watchedValues.rating || 0

    return (
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700">How would you rate your experience? *</Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue('rating', star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-colors"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || currentRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {currentRating > 0 && (
          <p className="text-sm text-gray-600">
            {currentRating === 1 && 'Poor'}
            {currentRating === 2 && 'Fair'}
            {currentRating === 3 && 'Good'}
            {currentRating === 4 && 'Very Good'}
            {currentRating === 5 && 'Excellent'}
          </p>
        )}
        {errors.rating && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.rating.message}
          </p>
        )}
      </div>
    )
  }

  // Form submission
  const onSubmit = async (data: TestimonialForm) => {
    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('text', data.text)
      formData.append('rating', data.rating.toString())
      formData.append('category', data.category)
      formData.append('allowSharing', data.allowSharing.toString())
      
      if (data.email) {
        formData.append('email', data.email)
      }
      
      if (data.video) {
        formData.append('video', data.video)
      }
      
      if (data.photo) {
        formData.append('photo', data.photo)
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/submit-testimonial`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setIsSuccess(true)
        toast({
          title: 'Success!',
          description: 'Your testimonial has been submitted successfully.',
        })
      } else {
        throw new Error('Failed to submit testimonial')
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit testimonial. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Your testimonial has been submitted successfully. It will be reviewed and published once approved.
          </p>
          <Button 
            onClick={() => {
              setIsSuccess(false)
              setCurrentStep(1)
              // Reset form here if needed
            }} 
            variant="outline"
            className="border-2 hover:bg-gray-50 px-8 py-3"
          >
            Submit Another Testimonial
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Personal Message */}
      {personalMessage && (
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2 text-lg">{personalMessage.title}</h3>
                <p className="text-blue-800 leading-relaxed">{personalMessage.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Indicator */}
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Step {currentStep} of {FORM_STEPS.length}
            </h2>
            <span className="text-sm text-gray-500">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Progress Saving Indicator */}
          <div className="flex items-center justify-between mt-2">
            {isProgressSaved && (
              <div className="flex items-center text-xs text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Progress saved
              </div>
            )}
            {progressSaver.hasProgress(userId || '') && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearProgress}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                Clear saved progress
              </Button>
            )}
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {FORM_STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                    ${isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs text-center ${isCurrent ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {FORM_STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            {FORM_STEPS[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Your Name *
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Enter your full name"
                    className={`${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="Enter your email address"
                    className={`${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    We&apos;ll use this to send you a copy of your testimonial
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Experience Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <RatingInput />

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 block">
                    Category *
                  </Label>
                  <select
                    id="category"
                    {...register('category')}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-500 mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <EnhancedTextarea
                    id="text"
                    value={watchedValues.text || ''}
                    onChange={(value) => setValue('text', value)}
                    placeholder="Share your experience and how this service helped you..."
                    rows={5}
                    maxLength={500}
                    label="Your Testimonial *"
                    error={errors.text?.message}
                    className={errors.text ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Media & Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Video Testimonial (Optional)
                  </Label>
                  
                  {selectedVideo && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileVideo className="h-6 w-6 text-green-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-green-800">{selectedVideo.name}</p>
                            <p className="text-xs text-green-600">
                              {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVideoChange(null)}
                          className="text-green-600 hover:text-green-800 hover:bg-green-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {videoError && (
                    <Alert className="mb-4" variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{videoError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50">
                    <div className="space-y-3 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="video-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-4 py-2 border border-gray-300 hover:border-blue-400 transition-colors"
                        >
                          <span>{selectedVideo ? 'Choose different video' : 'Upload a video'}</span>
                          <input
                            id="video-upload"
                            type="file"
                            accept="video/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              handleVideoChange(file)
                            }}
                          />
                        </label>
                        <p className="pl-3 self-center">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        MP4, MOV, WebM, AVI up to 50MB
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Photo (Optional)
                  </Label>
                  
                  {selectedPhoto && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Camera className="h-6 w-6 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">{selectedPhoto.name}</p>
                            <p className="text-xs text-blue-600">
                              {(selectedPhoto.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePhotoChange(null)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {photoError && (
                    <Alert className="mb-4" variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{photoError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50">
                    <div className="space-y-3 text-center">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="photo-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-4 py-2 border border-gray-300 hover:border-blue-400 transition-colors"
                        >
                          <span>{selectedPhoto ? 'Choose different photo' : 'Upload a photo'}</span>
                          <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              handlePhotoChange(file)
                            }}
                          />
                        </label>
                        <p className="pl-3 self-center">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        JPEG, PNG, WebP up to 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowSharing"
                    {...register('allowSharing')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="allowSharing" className="text-sm text-gray-700">
                    Allow my testimonial to be shared on social media
                  </Label>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Review Your Testimonial</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900">{watchedValues.name}</p>
                    </div>
                    
                    {watchedValues.email && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <p className="text-gray-900">{watchedValues.email}</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">Rating:</span>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= (watchedValues.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">Category:</span>
                      <p className="text-gray-900">
                        {CATEGORIES.find(c => c.value === watchedValues.category)?.label}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">Testimonial:</span>
                      <p className="text-gray-900 mt-1">{watchedValues.text}</p>
                    </div>
                    
                    {selectedVideo && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Video:</span>
                        <p className="text-gray-900">{selectedVideo.name}</p>
                      </div>
                    )}
                    
                    {selectedPhoto && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Photo:</span>
                        <p className="text-gray-900">{selectedPhoto.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    {...register('termsAccepted')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="termsAccepted" className="text-sm text-gray-700">
                    I accept the terms and conditions and agree to allow my testimonial to be used for promotional purposes
                  </Label>
                </div>
                {errors.termsAccepted && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.termsAccepted.message}
                  </p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < FORM_STEPS.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Testimonial
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
