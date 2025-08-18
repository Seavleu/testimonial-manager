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
import { Upload, CheckCircle, AlertCircle, X, FileVideo, Sparkles, Shield, Clock, Users } from 'lucide-react'

const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  text: z.string().min(10, 'Testimonial must be at least 10 characters').max(500, 'Testimonial must be less than 500 characters'),
  video: z.instanceof(File).optional().nullable(),
})

type TestimonialForm = z.infer<typeof testimonialSchema>

interface CollectionFormProps {
  userId?: string
}

// File validation constants
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB in bytes
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi']

export function CollectionForm({ userId }: CollectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>('')
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
  } = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialSchema),
  })

  const textValue = watch('text', '')

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size allowed is 50MB.`
    }

    // Check file type by MIME type
    if (file.type && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return `File type "${file.type}" is not supported. Please use MP4, MOV, WebM, or AVI format.`
    }

    // Check file extension as backup
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `File extension "${extension}" is not supported. Please use .mp4, .mov, .webm, or .avi files.`
    }

    // Check if it's actually a video file (basic check)
    if (!file.type.startsWith('video/') && file.type !== '') {
      return `Selected file doesn't appear to be a video. Please select a valid video file.`
    }

    return null
  }

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null)
      setFileError('')
      setValue('video', null)
      clearErrors('video')
      return
    }

    const error = validateFile(file)
    if (error) {
      setFileError(error)
      setSelectedFile(null)
      setValue('video', null)
      setError('video', { message: error })
    } else {
      setFileError('')
      setSelectedFile(file)
      setValue('video', file)
      clearErrors('video')
    }
  }

  const onSubmit = async (data: TestimonialForm) => {
    console.log('Form submitted with data:', data)
    console.log('User ID:', userId)
    
    if (!userId) {
      toast({
        title: "Error",
        description: "Invalid collection link. Please contact the business owner.",
        variant: "destructive",
      })
      return
    }

    // Final file validation before submission
    if (data.video) {
      const fileValidationError = validateFile(data.video)
      if (fileValidationError) {
        setError('video', { message: fileValidationError })
        toast({
          title: "Invalid File",
          description: fileValidationError,
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)
    
    try {
      // Prepare form data for FastAPI backend
      const formData = new FormData()
      formData.append('user_id', userId)
      formData.append('name', data.name.trim())
      formData.append('text', data.text.trim())
      if (data.video) {
        formData.append('video', data.video)
      }

      // Call FastAPI backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      console.log('Submitting to:', `${backendUrl}/submit-testimonial`)
      
      const response = await fetch(`${backendUrl}/submit-testimonial`, {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'Failed to submit testimonial'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
          console.error('Error response:', errorData)
        } catch (parseError) {
          const errorText = await response.text()
          console.error('Error response (text):', errorText)
          errorMessage = `Server error (${response.status}): ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Success response:', result)

      setIsSuccess(true)
      toast({
        title: "Thank you!",
        description: "Your testimonial has been submitted and is awaiting approval.",
      })
    } catch (error: any) {
      console.error('Error submitting testimonial:', error)
      
      let errorMessage = error.message || 'An unexpected error occurred'
      
      // Handle specific error types
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.'
      } else if (error.message.includes('413')) {
        errorMessage = 'File is too large. Please choose a smaller video file (max 50MB).'
      } else if (error.message.includes('415')) {
        errorMessage = 'File type not supported. Please use MP4, MOV, WebM, or AVI format.'
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

  return (
    <div className="space-y-8">
      {/* Personal Message from Business Owner */}
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

      {/* Process Steps */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Share Your Story</h3>
            <p className="text-sm text-gray-600">Tell us about your experience</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Review Process</h3>
            <p className="text-sm text-gray-600">We'll review your submission</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-r from-pink-600 to-red-600 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Get Published</h3>
            <p className="text-sm text-gray-600">Help others with your feedback</p>
          </div>
        </div>
      </div>

      {/* Main Collection Form */}
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">Share Your Experience</CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Your testimonial helps others understand the value of this service. All testimonials are reviewed before being published.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">Your Name *</Label>
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
            <Label htmlFor="text" className="text-sm font-medium text-gray-700 mb-2 block">Your Testimonial *</Label>
            <Textarea
              id="text"
              {...register('text')}
              placeholder="Share your experience and how this service helped you..."
              rows={5}
              className={`${errors.text ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
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
                {textValue.length}/500 characters
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="video" className="text-sm font-medium text-gray-700 mb-2 block">Video Testimonial (Optional)</Label>
            
            {/* File requirements info */}
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Video Requirements:</strong> MP4, MOV, WebM, or AVI format • Maximum 50MB • Recommended: 30 seconds or less
              </AlertDescription>
            </Alert>

            {/* Selected file display */}
            {selectedFile && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileVideo className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
                      <p className="text-xs text-green-600">
                        {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • {selectedFile.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileChange(null)}
                    className="text-green-600 hover:text-green-800 hover:bg-green-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Error display */}
            {fileError && (
              <Alert className="mb-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fileError}</AlertDescription>
              </Alert>
            )}

            {/* File upload area */}
            <div className="mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50">
              <div className="space-y-3 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="video-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-4 py-2 border border-gray-300 hover:border-blue-400 transition-colors"
                  >
                    <span>{selectedFile ? 'Choose different video' : 'Upload a video'}</span>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.mov,.webm,.avi"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        if (file) {
                          console.log('Selected file:', {
                            name: file.name,
                            type: file.type,
                            size: file.size
                          })
                        }
                        handleFileChange(file)
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

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg py-3 text-lg font-medium"
            disabled={isSubmitting || !!fileError}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit Testimonial'
            )}
          </Button>

          {/* Form submission info */}
          <Alert className="bg-gray-50 border-gray-200">
            <Shield className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-700">
              By submitting this testimonial, you agree to allow its use for promotional purposes. 
              All submissions are reviewed before publication.
            </AlertDescription>
          </Alert>
        </form>
              </CardContent>
      </Card>

      {/* Trust Indicators */}
      <div className="max-w-2xl mx-auto">
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