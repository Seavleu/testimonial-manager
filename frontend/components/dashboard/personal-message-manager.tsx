'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit3, Trash2, Eye, EyeOff, MessageSquare } from 'lucide-react'

interface PersonalMessage {
  id: string
  title: string
  message: string
  is_visible: boolean
  created_at: string
  updated_at: string
}

interface PersonalMessageManagerProps {
  userId: string
}

export function PersonalMessageManager({ userId }: PersonalMessageManagerProps) {
  const [messages, setMessages] = useState<PersonalMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    is_visible: true
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
  }, [userId])

  const fetchMessages = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/personal-messages/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error: any) {
      console.error('Error fetching messages:', error)
      toast({
        title: 'Error',
        description: 'Failed to load personal messages',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and message are required',
        variant: 'destructive'
      })
      return
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const formDataToSend = new FormData()
      formDataToSend.append('user_id', userId)
      formDataToSend.append('title', formData.title.trim())
      formDataToSend.append('message', formData.message.trim())
      formDataToSend.append('is_visible', formData.is_visible.toString())

      let response
      if (editingId) {
        // Update existing message
        response = await fetch(`${backendUrl}/personal-messages/${editingId}`, {
          method: 'PUT',
          body: formDataToSend
        })
      } else {
        // Create new message
        response = await fetch(`${backendUrl}/personal-messages`, {
          method: 'POST',
          body: formDataToSend
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to save message')
      }

      toast({
        title: 'Success',
        description: editingId ? 'Message updated successfully' : 'Message created successfully'
      })

      // Reset form and refresh data
      setFormData({ title: '', message: '', is_visible: true })
      setIsCreating(false)
      setEditingId(null)
      fetchMessages()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (message: PersonalMessage) => {
    setFormData({
      title: message.title,
      message: message.message,
      is_visible: message.is_visible
    })
    setEditingId(message.id)
    setIsCreating(true)
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/personal-messages/${messageId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }

      toast({
        title: 'Success',
        description: 'Message deleted successfully'
      })

      fetchMessages()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const toggleVisibility = async (messageId: string, currentVisibility: boolean) => {
    try {
      const message = messages.find(m => m.id === messageId)
      if (!message) return

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const formDataToSend = new FormData()
      formDataToSend.append('title', message.title)
      formDataToSend.append('message', message.message)
      formDataToSend.append('is_visible', (!currentVisibility).toString())

      const response = await fetch(`${backendUrl}/personal-messages/${messageId}`, {
        method: 'PUT',
        body: formDataToSend
      })

      if (!response.ok) {
        throw new Error('Failed to update visibility')
      }

      toast({
        title: 'Success',
        description: `Message ${!currentVisibility ? 'shown' : 'hidden'} on collection page`
      })

      fetchMessages()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const cancelEdit = () => {
    setFormData({ title: '', message: '', is_visible: true })
    setIsCreating(false)
    setEditingId(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading personal messages...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Personal Messages
        </CardTitle>
        <CardDescription>
          Create custom messages to display on your testimonial collection page. Only one message can be visible at a time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create/Edit Form */}
        {isCreating && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Edit Message' : 'Create New Message'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Welcome! Share your experience"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Your personal message to clients requesting testimonials..."
                    rows={4}
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500 characters</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_visible"
                    checked={formData.is_visible}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
                  />
                  <Label htmlFor="is_visible">Show on collection page</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingId ? 'Update Message' : 'Create Message'}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Add New Button */}
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Personal Message
          </Button>
        )}

        {/* Messages List */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Alert>
              <AlertDescription>
                No personal messages created yet. Add a message to welcome your clients and encourage them to share their experience.
              </AlertDescription>
            </Alert>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className={message.is_visible ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{message.title}</h4>
                        {message.is_visible ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Eye className="h-3 w-3 mr-1" />
                            Visible
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{message.message}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(message.created_at).toLocaleDateString()}
                        {message.updated_at !== message.created_at && (
                          <span> • Updated: {new Date(message.updated_at).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleVisibility(message.id, message.is_visible)}
                        title={message.is_visible ? 'Hide from collection page' : 'Show on collection page'}
                      >
                        {message.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(message)}
                        title="Edit message"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(message.id)}
                        className="text-red-600 hover:bg-red-50"
                        title="Delete message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}