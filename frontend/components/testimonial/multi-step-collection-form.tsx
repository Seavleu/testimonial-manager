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
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Star,
  Camera,
  Tag,
  MessageSquare,
  User,
  Heart
} from 'lucide-react'

// Enhanced schema with new fields
const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  text: z.string().min(10, 'Testimonial must be at least 10 characters').max(500, 'Testimonial must be less than 500 characters'),
  rating: z.number().min(1, 'Please provide a rating').max(5, 'Rating must be between 1 and 5'),
  category: z.string().min(1, 'Please select a category'),
  company: z.string().max(100, 'Company name must be less than 100 characters').optional().or(z.literal('')),
  photo: z.instanceof(File).optional().nullable(),
  video: z.instanceof(File).optional().nullable(),
  allowContact: z.boolean().default(false),
})

type TestimonialForm = z.infer<typeof testimonialSchema>

interface MultiStepCollectionFormProps {
  userId?: string
}

// File validation constants
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi']
const ALLOWED_PHOTO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// Categories for testimonials
const TESTIMONIAL_CATEGORIES = [
  { id: 'general', label: 'General Experience', icon: '💬' },
  { id: 'customer-service', label: 'Customer Service', icon: '🎯' },
  { id: 'product-quality', label: 'Product Quality', icon: '⭐' },
  { id: 'value', label: 'Value for Money', icon: '💰' },
  { id: 'recommendation', label: 'Recommendation', icon: '👍' },
  { id: 'problem-solving', label: 'Problem Solving', icon: '🔧' },
]

// Form steps configuration
const FORM_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Let\'s get started with your testimonial',
    icon: Sparkles,
  },
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Tell us about yourself',
    icon: User,
  },
  {
    id: 'experience',
    title: 'Your Experience',
    description: 'Share your story',
    icon: MessageSquare,
  },
  {
    id: 'rating',
    title: 'Rating & Category',
    description: 'Rate your experience',
    icon: Star,
  },
  {
    id: 'media',
    title: 'Media (Optional)',
    description: 'Add photos or video',
    icon: Camera,
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review your testimonial',
    icon: CheckCircle,
  },
]

export function MultiStepCollectionForm({ userId }: MultiStepCollectionFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [videoError, setVideoError] = useState<string>('')
  const [photoError, setPhotoError] = useState<string>('')
  const [personalMessage, setPersonalMessage] = useState<{title: string, message: string} | null>(null)
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
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors,
    trigger,
  } = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      rating: 0,
      category: '',
      allowContact: false,
    }
  })

  const formValues = watch()

  // Don't render until mounted
  if (!mounted) {
    return (
      <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  // File validation functions
  const validateVideo = (file: File): string | null => {
    if (file.size > MAX_VIDEO_SIZE) {
      return `Video is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size allowed is 50MB.`
    }
    if (file.type && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return `Video type "${file.type}" is not supported. Please use MP4, MOV, WebM, or AVI format.`
    }
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_VIDEO_EXTENSIONS.includes(extension)) {
      return `Video extension "${extension}" is not supported. Please use .mp4, .mov, .webm, or .avi files.`
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
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_PHOTO_EXTENSIONS.includes(extension)) {
      return `Photo extension "${extension}" is not supported. Please use .jpg, .jpeg, .png, or .webp files.`
    }
    return null
  }

  const handleVideoChange = (file: File | null) => {
    if (!file) {
      setSelectedVideo(null)
      setVideoError('')
      setValue('video', null)
      clearErrors('video')
      return
    }

    const error = validateVideo(file)
    if (error) {
      setVideoError(error)
      setSelectedVideo(null)
      setValue('video', null)
      setError('video', { message: error })
    } else {
      setVideoError('')
      setSelectedVideo(file)
      setValue('video', file)
      clearErrors('video')
    }
  }

  const handlePhotoChange = (file: File | null) => {
    if (!file) {
      setSelectedPhoto(null)
      setPhotoError('')
      setValue('photo', null)
      clearErrors('photo')
      return
    }

    const error = validatePhoto(file)
    if (error) {
      setPhotoError(error)
      setSelectedPhoto(null)
      setValue('photo', null)
      setError('photo', { message: error })
    } else {
      setPhotoError('')
      setSelectedPhoto(file)
      setValue('photo', file)
      clearErrors('photo')
    }
  }

  // Navigation functions
  const nextStep = async () => {
    const currentStepFields = getStepFields(currentStep)
    const isValid = await trigger(currentStepFields)
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, FORM_STEPS.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const getStepFields = (step: number): (keyof TestimonialForm)[] => {
    switch (step) {
      case 1: return ['name']
      case 2: return ['text']
      case 3: return ['rating', 'category']
      case 4: return []
      case 5: return []
      default: return []
    }
  }

  const isStepComplete = (step: number): boolean => {
    const stepFields = getStepFields(step)
    return stepFields.every(field => {
      const value = formValues[field]
      if (field === 'rating') return value > 0
      if (field === 'category') return value !== ''
      return value && value.toString().trim() !== ''
    })
  }

  const onSubmit = async (data: TestimonialForm) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Invalid collection link. Please contact the business owner.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('user_id', userId)
      formData.append('name', data.name.trim())
      formData.append('text', data.text.trim())
      formData.append('rating', data.rating.toString())
      formData.append('category', data.category)
      if (data.email) formData.append('email', data.email.trim())
      if (data.company) formData.append('company', data.company.trim())
      formData.append('allow_contact', data.allowContact.toString())
      if (data.video) formData.append('video', data.video)
      if (data.photo) formData.append('photo', data.photo)

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/submit-testimonial`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = 'Failed to submit testimonial'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch (parseError) {
          errorMessage = `Server error (${response.status}): ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setIsSuccess(true)
      toast({
        title: "Thank you!",
        description: "Your testimonial has been submitted and is awaiting approval.",
      })
    } catch (error: any) {
      console.error('Error submitting testimonial:', error)
      
      let errorMessage = error.message || 'An unexpected error occurred'
      
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.'
      } else if (error.message.includes('413')) {
        errorMessage = 'File is too large. Please choose smaller files.'
      } else if (error.message.includes('415')) {
        errorMessage = 'File type not supported. Please use supported formats.'
      } else if (error.message.includes('400')) {
        errorMessage = error.message.replace('400:', '').trim()
      }

      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
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
              setCurrentStep(0)
              window.location.reload()
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

  const currentStepData = FORM_STEPS[currentStep]
  const progress = ((currentStep + 1) / FORM_STEPS.length) * 100

  return (
    <div className="space-y-8">
      {/* Personal Message */}
      {personalMessage && currentStep === 0 && (
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {FORM_STEPS.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-8">
          {FORM_STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                index === currentStep
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : index < currentStep
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                index === currentStep
                  ? 'bg-blue-500 text-white'
                  : index < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <span className="text-xs font-medium hidden md:block">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">{currentStepData.title}</CardTitle>
          <CardDescription className="text-gray-600 text-base">
            {currentStepData.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                  <Heart className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Share Your Experience
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your testimonial helps others understand the value of this service. 
                    This will only take a few minutes and we'll guide you through each step.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Share Your Story</h4>
                    <p className="text-sm text-gray-600">Tell us about your experience</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Rate & Categorize</h4>
                    <p className="text-sm text-gray-600">Rate your experience</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Review & Submit</h4>
                    <p className="text-sm text-gray-600">Review and submit</p>
                  </div>
                </div>
              </div>
            )}

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
                    className={`${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
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
                    placeholder="your.email@example.com"
                    className="focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    We'll only use this to contact you if needed
                  </p>
                </div>

                <div>
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700 mb-2 block">
                    Company/Organization (Optional)
                  </Label>
                  <Input
                    id="company"
                    {...register('company')}
                    placeholder="Your company name"
                    className="focus:border-blue-500"
                    maxLength={100}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="text" className="text-sm font-medium text-gray-700 mb-2 block">
                    Your Testimonial *
                  </Label>
                  <Textarea
                    id="text"
                    {...register('text')}
                    placeholder="Share your experience and how this service helped you..."
                    rows={6}
                    className={`${errors.text ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    {errors.text && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.text.message}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {formValues.text?.length || 0}/500 characters
                    </p>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Tip:</strong> Be specific about what you liked, how the service helped you, 
                    and what others might find valuable about your experience.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 3: Rating & Category */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-4 block">
                    How would you rate your experience? *
                  </Label>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setValue('rating', star)}
                        className={`p-2 rounded-lg transition-all ${
                          formValues.rating >= star
                            ? 'text-yellow-500 bg-yellow-50'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        <Star className="h-8 w-8 fill-current" />
                      </button>
                    ))}
                  </div>
                  {formValues.rating > 0 && (
                    <p className="text-center text-sm text-gray-600 mt-2">
                      {formValues.rating === 1 && 'Poor'}
                      {formValues.rating === 2 && 'Fair'}
                      {formValues.rating === 3 && 'Good'}
                      {formValues.rating === 4 && 'Very Good'}
                      {formValues.rating === 5 && 'Excellent'}
                    </p>
                  )}
                  {errors.rating && (
                    <p className="text-sm text-red-500 text-center mt-2">
                      {errors.rating.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-4 block">
                    What category best describes your experience? *
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TESTIMONIAL_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setValue('category', category.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formValues.category === category.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{category.icon}</span>
                          <span className="font-medium text-gray-900">{category.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.category && (
                    <p className="text-sm text-red-500 mt-2">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Media Upload */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-4 block">
                    Add a Photo (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload a photo to accompany your testimonial
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      Choose Photo
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      JPEG, PNG, WebP up to 5MB
                    </p>
                  </div>
                  {selectedPhoto && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Camera className="h-6 w-6 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-800">{selectedPhoto.name}</p>
                            <p className="text-xs text-green-600">
                              {(selectedPhoto.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePhotoChange(null)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-4 block">
                    Add a Video (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <FileVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload a video testimonial
                    </p>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                      onChange={(e) => handleVideoChange(e.target.files?.[0] || null)}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      Choose Video
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      MP4, MOV, WebM, AVI up to 50MB
                    </p>
                  </div>
                  {selectedVideo && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileVideo className="h-6 w-6 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-800">{selectedVideo.name}</p>
                            <p className="text-xs text-green-600">
                              {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVideoChange(null)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Camera className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Optional:</strong> Adding media can make your testimonial more engaging and authentic.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Review Your Testimonial</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Name</Label>
                      <p className="text-gray-900">{formValues.name}</p>
                    </div>
                    
                    {formValues.email && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <p className="text-gray-900">{formValues.email}</p>
                      </div>
                    )}
                    
                    {formValues.company && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Company</Label>
                        <p className="text-gray-900">{formValues.company}</p>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Rating</Label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              formValues.rating >= star ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          ({formValues.rating}/5)
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Category</Label>
                      <Badge variant="secondary" className="mt-1">
                        {TESTIMONIAL_CATEGORIES.find(c => c.id === formValues.category)?.label}
                      </Badge>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Testimonial</Label>
                      <p className="text-gray-900 mt-1">{formValues.text}</p>
                    </div>
                    
                    {(selectedPhoto || selectedVideo) && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Media</Label>
                        <div className="flex space-x-2 mt-1">
                          {selectedPhoto && (
                            <Badge variant="outline" className="flex items-center space-x-1">
                              <Camera className="h-3 w-3" />
                              <span>Photo</span>
                            </Badge>
                          )}
                          {selectedVideo && (
                            <Badge variant="outline" className="flex items-center space-x-1">
                              <FileVideo className="h-3 w-3" />
                              <span>Video</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowContact"
                    {...register('allowContact')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="allowContact" className="text-sm text-gray-700">
                    Allow the business to contact me if they have questions about my testimonial
                  </Label>
                </div>

                <Alert className="bg-gray-50 border-gray-200">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <AlertDescription className="text-gray-700">
                    By submitting this testimonial, you agree to allow its use for promotional purposes. 
                    All submissions are reviewed before publication.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              {currentStep < FORM_STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Submit Testimonial</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Trust Indicators */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Secure & Private</h3>
            <p className="text-sm text-gray-600">Your data is protected</p>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Quick Review</h3>
            <p className="text-sm text-gray-600">Usually within 24 hours</p>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Help Others</h3>
            <p className="text-sm text-gray-600">Share your experience</p>
          </div>
        </div>
      </div>
    </div>
  )
}
