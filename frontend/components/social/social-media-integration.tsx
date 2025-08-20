'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageCircle,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Target,
  BarChart3,
  Hash,
  Globe,
  Mail,
  Bell,
  Eye,
  Heart,
  MessageSquare
} from 'lucide-react'

interface SocialPlatform {
  id: string
  name: string
  icon: string
  type: 'social' | 'messaging' | 'professional'
  connected: boolean
  accessToken?: string
  refreshToken?: string
  expiresAt?: string
  profileData?: {
    id: string
    name: string
    username: string
    avatar?: string
    followers?: number
  }
}

interface SocialPost {
  id: string
  platform: string
  content: string
  media?: string[]
  hashtags: string[]
  scheduledFor?: string
  postedAt?: string
  status: 'draft' | 'scheduled' | 'posted' | 'failed'
  engagement: {
    likes: number
    shares: number
    comments: number
    clicks: number
    reach: number
  }
}

interface SocialAnalytics {
  overview: {
    totalPosts: number
    totalEngagement: number
    totalReach: number
    averageEngagementRate: number
  }
  platformPerformance: Array<{
    platform: string
    posts: number
    engagement: number
    reach: number
    engagementRate: number
  }>
  engagementTrends: Array<{
    date: string
    engagement: number
    reach: number
    posts: number
  }>
  topHashtags: Array<{
    hashtag: string
    usage: number
    engagement: number
  }>
  bestTimes: Array<{
    day: string
    hour: number
    engagement: number
  }>
}

interface SocialMediaIntegrationProps {
  userId: string
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    type: 'social',
    connected: false
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '🐦',
    type: 'social',
    connected: false
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    type: 'professional',
    connected: false
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    type: 'social',
    connected: false
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    type: 'messaging',
    connected: false
  }
]

const POST_TEMPLATES = [
  {
    id: 'testimonial-share',
    name: 'Testimonial Share',
    template: '🌟 Amazing feedback from {customer_name} at {company}! "{testimonial_text}" #customerfeedback #testimonial #satisfiedcustomer',
    variables: ['customer_name', 'company', 'testimonial_text']
  },
  {
    id: 'weekly-highlight',
    name: 'Weekly Highlight',
    template: '📊 This week we received {count} amazing testimonials! Thank you to all our valued customers. #weeklyupdate #gratitude #customersuccess',
    variables: ['count']
  },
  {
    id: 'rating-celebration',
    name: 'Rating Celebration',
    template: '🎉 We\'re thrilled to maintain our {rating}/5 rating! Thank you for the trust and support. #excellence #quality #customersatisfaction',
    variables: ['rating']
  }
]

export function SocialMediaIntegration({ userId }: SocialMediaIntegrationProps) {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(SOCIAL_PLATFORMS)
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [analytics, setAnalytics] = useState<SocialAnalytics | null>(null)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null)
  const [postContent, setPostContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [hashtags, setHashtags] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [autoPosting, setAutoPosting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useToast()

  // Mock data for demonstration
  const mockPosts: SocialPost[] = [
    {
      id: '1',
      platform: 'facebook',
      content: '🌟 Amazing feedback from Sarah Johnson at TechCorp Inc.! "This service completely transformed our business. The quality and attention to detail exceeded all our expectations. Highly recommend!" #customerfeedback #testimonial #satisfiedcustomer',
      hashtags: ['#customerfeedback', '#testimonial', '#satisfiedcustomer'],
      scheduledFor: undefined,
      postedAt: '2025-01-25T10:30:00Z',
      status: 'posted',
      engagement: {
        likes: 45,
        shares: 12,
        comments: 8,
        clicks: 23,
        reach: 1200
      }
    },
    {
      id: '2',
      platform: 'twitter',
      content: '🎉 We\'re thrilled to maintain our 4.7/5 rating! Thank you for the trust and support. #excellence #quality #customersatisfaction',
      hashtags: ['#excellence', '#quality', '#customersatisfaction'],
      scheduledFor: undefined,
      postedAt: '2025-01-24T15:45:00Z',
      status: 'posted',
      engagement: {
        likes: 67,
        shares: 23,
        comments: 15,
        clicks: 34,
        reach: 2100
      }
    }
  ]

  const mockAnalytics: SocialAnalytics = {
    overview: {
      totalPosts: 24,
      totalEngagement: 1247,
      totalReach: 15600,
      averageEngagementRate: 8.0
    },
    platformPerformance: [
      { platform: 'Facebook', posts: 8, engagement: 456, reach: 5200, engagementRate: 8.8 },
      { platform: 'Twitter', posts: 12, engagement: 567, reach: 7800, engagementRate: 7.3 },
      { platform: 'LinkedIn', posts: 4, engagement: 224, reach: 2600, engagementRate: 8.6 }
    ],
    engagementTrends: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      engagement: Math.floor(Math.random() * 50) + 20,
      reach: Math.floor(Math.random() * 800) + 400,
      posts: Math.floor(Math.random() * 3) + 1
    })),
    topHashtags: [
      { hashtag: '#customerfeedback', usage: 15, engagement: 234 },
      { hashtag: '#testimonial', usage: 12, engagement: 189 },
      { hashtag: '#satisfiedcustomer', usage: 8, engagement: 156 },
      { hashtag: '#quality', usage: 6, engagement: 98 },
      { hashtag: '#excellence', usage: 5, engagement: 87 }
    ],
    bestTimes: [
      { day: 'Monday', hour: 10, engagement: 89 },
      { day: 'Tuesday', hour: 14, engagement: 76 },
      { day: 'Wednesday', hour: 11, engagement: 92 },
      { day: 'Thursday', hour: 15, engagement: 81 },
      { day: 'Friday', hour: 9, engagement: 67 }
    ]
  }

  useEffect(() => {
    if (userId) {
      loadData()
    }
  }, [userId])

  const loadData = async () => {
    try {
      setLoading(true)
      // In production, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      setPosts(mockPosts)
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Failed to load social media data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load social media data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const connectPlatform = async (platformId: string) => {
    try {
      setLoading(true)
      // In production, this would initiate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate OAuth delay
      
      setPlatforms(prev => prev.map(p => 
        p.id === platformId 
          ? { 
              ...p, 
              connected: true,
              profileData: {
                id: 'mock-id',
                name: `${p.name} User`,
                username: `user_${platformId}`,
                followers: Math.floor(Math.random() * 10000) + 1000
              }
            }
          : p
      ))
      
      toast({
        title: 'Success',
        description: `Successfully connected to ${platforms.find(p => p.id === platformId)?.name}`
      })
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to platform',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const disconnectPlatform = async (platformId: string) => {
    try {
      setPlatforms(prev => prev.map(p => 
        p.id === platformId 
          ? { ...p, connected: false, profileData: undefined }
          : p
      ))
      
      toast({
        title: 'Disconnected',
        description: `Successfully disconnected from ${platforms.find(p => p.id === platformId)?.name}`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect platform',
        variant: 'destructive'
      })
    }
  }

  const createPost = async () => {
    if (!postContent.trim() || selectedPlatforms.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide post content and select at least one platform',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      const newPost: SocialPost = {
        id: Date.now().toString(),
        platform: selectedPlatforms[0], // For now, just use first platform
        content: postContent,
        hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
        scheduledFor: scheduledTime || undefined,
        status: scheduledTime ? 'scheduled' : 'draft',
        engagement: {
          likes: 0,
          shares: 0,
          comments: 0,
          clicks: 0,
          reach: 0
        }
      }

      // In production, this would save to your API
      setPosts(prev => [newPost, ...prev])
      resetForm()
      toast({
        title: 'Success',
        description: 'Post created successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePost = async () => {
    if (!editingPost) return

    try {
      setLoading(true)
      const updatedPost: SocialPost = {
        ...editingPost,
        content: postContent,
        hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
        scheduledFor: scheduledTime || undefined,
        status: scheduledTime ? 'scheduled' : 'draft'
      }

      setPosts(prev => prev.map(p => p.id === editingPost.id ? updatedPost : p))
      resetForm()
      toast({
        title: 'Success',
        description: 'Post updated successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (postId: string) => {
    try {
      setPosts(prev => prev.filter(p => p.id !== postId))
      toast({
        title: 'Success',
        description: 'Post deleted successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive'
      })
    }
  }

  const postNow = async (postId: string) => {
    try {
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, status: 'posted', postedAt: new Date().toISOString() }
          : p
      ))
      toast({
        title: 'Success',
        description: 'Post published successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish post',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setEditingPost(null)
    setPostContent('')
    setSelectedPlatforms([])
    setHashtags('')
    setScheduledTime('')
    setShowCreatePost(false)
  }

  const editPost = (post: SocialPost) => {
    setEditingPost(post)
    setPostContent(post.content)
    setSelectedPlatforms([post.platform])
    setHashtags(post.hashtags.join(' '))
    setScheduledTime(post.scheduledFor || '')
    setShowCreatePost(true)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      scheduled: 'outline',
      posted: 'default',
      failed: 'destructive'
    } as const

    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  const getPlatformIcon = (platformId: string) => {
    const icons = {
      facebook: <Facebook className="h-4 w-4" />,
      twitter: <Twitter className="h-4 w-4" />,
      linkedin: <Linkedin className="h-4 w-4" />,
      instagram: <Instagram className="h-4 w-4" />,
      whatsapp: <MessageCircle className="h-4 w-4" />
    }
    return icons[platformId as keyof typeof icons] || <Globe className="h-4 w-4" />
  }

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social Media Integration</h2>
          <p className="text-gray-600">Manage your social media presence and automate testimonial sharing</p>
        </div>

        <Button onClick={() => setShowCreatePost(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </div>

      {/* Platform Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Connected Platforms
          </CardTitle>
          <CardDescription>Connect your social media accounts to start sharing testimonials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className={`p-4 border rounded-lg ${
                  platform.connected ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <h4 className="font-medium">{platform.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{platform.type}</p>
                    </div>
                  </div>
                  <Badge variant={platform.connected ? 'default' : 'secondary'}>
                    {platform.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>

                {platform.connected && platform.profileData && (
                  <div className="mb-3 p-3 bg-white rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">{platform.profileData.name}</span>
                    </div>
                    <p className="text-xs text-gray-600">@{platform.profileData.username}</p>
                    <p className="text-xs text-gray-600">{platform.profileData.followers?.toLocaleString()} followers</p>
                  </div>
                )}

                <Button
                  onClick={() => platform.connected ? disconnectPlatform(platform.id) : connectPlatform(platform.id)}
                  variant={platform.connected ? 'outline' : 'default'}
                  size="sm"
                  className="w-full"
                  disabled={loading}
                >
                  {platform.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Post Form */}
      {showCreatePost && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </CardTitle>
            <CardDescription>
              {editingPost ? 'Update your post content and settings' : 'Create a new social media post'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="postContent">Post Content</Label>
              <Textarea
                id="postContent"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Write your post content here..."
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="platforms">Select Platforms</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {platforms.filter(p => p.connected).map((platform) => (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`platform-${platform.id}`}
                      checked={selectedPlatforms.includes(platform.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlatforms([...selectedPlatforms, platform.id])
                        } else {
                          setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id))
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`platform-${platform.id}`} className="text-sm">
                      {platform.icon} {platform.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="hashtags">Hashtags</Label>
              <Input
                id="hashtags"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#customerfeedback #testimonial #satisfiedcustomer"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="scheduledTime">Schedule Post (Optional)</Label>
              <Input
                id="scheduledTime"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={editingPost ? updatePost : createPost}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {editingPost ? 'Update Post' : 'Create Post'}
              </Button>

              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {analytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.overview.totalPosts}</div>
                    <p className="text-xs text-muted-foreground">
                      Across all platforms
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.overview.totalEngagement.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Likes, shares, comments
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.overview.totalReach.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Unique users reached
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Engagement Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.overview.averageEngagementRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      Engagement per post
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                  <CardDescription>How your posts perform across different platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.platformPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="platform" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="engagement" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="reach" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Trends</CardTitle>
                  <CardDescription>Your engagement performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.engagementTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={3} />
                        <Line type="monotone" dataKey="reach" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-6">
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(post.platform)}
                      <div>
                        <h4 className="font-medium">{post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}</h4>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(post.status)}
                          {post.postedAt && (
                            <span className="text-sm text-gray-500">
                              {new Date(post.postedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => editPost(post)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deletePost(post.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{post.content}</p>

                  {post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.hashtags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {post.status === 'draft' && (
                    <Button
                      onClick={() => postNow(post.id)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Post Now
                    </Button>
                  )}

                  {post.status === 'posted' && (
                    <div className="grid grid-cols-5 gap-4 pt-3 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{post.engagement.likes}</div>
                        <div className="text-xs text-gray-600">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{post.engagement.shares}</div>
                        <div className="text-xs text-gray-600">Shares</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{post.engagement.comments}</div>
                        <div className="text-xs text-gray-600">Comments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{post.engagement.clicks}</div>
                        <div className="text-xs text-gray-600">Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-600">{post.engagement.reach.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Reach</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {posts.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Share2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first social media post to start sharing testimonials
                  </p>
                  <Button onClick={() => setShowCreatePost(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Post
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Top Hashtags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Top Performing Hashtags
                  </CardTitle>
                  <CardDescription>Your most engaging hashtags</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topHashtags.map((hashtag, index) => (
                      <div key={hashtag.hashtag} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-sm">
                            {hashtag.hashtag}
                          </Badge>
                          <span className="text-sm text-gray-600">Used {hashtag.usage} times</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {hashtag.engagement} engagements
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Best Posting Times */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Best Posting Times
                  </CardTitle>
                  <CardDescription>When your audience is most engaged</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.bestTimes}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="engagement" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automated Posting
              </CardTitle>
              <CardDescription>Automatically share testimonials on social media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Switch
                  id="autoPosting"
                  checked={autoPosting}
                  onCheckedChange={setAutoPosting}
                />
                <Label htmlFor="autoPosting" className="text-base font-medium">
                  Enable Automated Posting
                </Label>
              </div>

              {autoPosting && (
                <div className="space-y-4 pl-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Posting Schedule
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postingFrequency">Frequency</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="postingTime">Time</Label>
                        <Input
                          id="postingTime"
                          type="time"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Post Templates
                    </Label>
                    <div className="space-y-2">
                      {POST_TEMPLATES.map((template) => (
                        <div key={template.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <Button variant="outline" size="sm">
                              Use Template
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">{template.template}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
