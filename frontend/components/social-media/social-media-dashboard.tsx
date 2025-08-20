'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Share2, Calendar, BarChart3, TrendingUp, Users, MessageSquare, Heart, Eye, 
  Clock, Play, Pause, Edit3, Trash2, Plus, Settings, Globe, Smartphone, 
  Monitor, Zap, Target, Filter, Search, Download, RefreshCw, AlertTriangle,
  CheckCircle, Star, Hash, TrendingDown, Activity
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

interface SocialMediaAccount {
  id: string
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'whatsapp'
  name: string
  username: string
  avatar: string
  status: 'connected' | 'disconnected' | 'error'
  followers: number
  engagement: number
  lastSync: string
}

interface ScheduledPost {
  id: string
  content: string
  media?: string[]
  platforms: string[]
  scheduledTime: string
  status: 'scheduled' | 'published' | 'failed' | 'draft'
  engagement: {
    likes: number
    shares: number
    comments: number
    reach: number
  }
}

interface SocialMediaAnalytics {
  platform: string
  followers: number
  engagement: number
  reach: number
  impressions: number
  clicks: number
  conversions: number
}

interface SocialMediaDashboardProps {
  userId: string
}

const MOCK_ACCOUNTS: SocialMediaAccount[] = [
  {
    id: '1',
    platform: 'facebook',
    name: 'Company Facebook',
    username: '@companyfb',
    avatar: '/avatars/facebook.png',
    status: 'connected',
    followers: 15420,
    engagement: 8.5,
    lastSync: '2024-02-13T10:30:00Z'
  },
  {
    id: '2',
    platform: 'twitter',
    name: 'Company Twitter',
    username: '@companytw',
    avatar: '/avatars/twitter.png',
    status: 'connected',
    followers: 8920,
    engagement: 12.3,
    lastSync: '2024-02-13T10:25:00Z'
  },
  {
    id: '3',
    platform: 'linkedin',
    name: 'Company LinkedIn',
    username: '@companyli',
    avatar: '/avatars/linkedin.png',
    status: 'connected',
    followers: 23450,
    engagement: 6.8,
    lastSync: '2024-02-13T10:20:00Z'
  },
  {
    id: '4',
    platform: 'instagram',
    name: 'Company Instagram',
    username: '@companyig',
    avatar: '/avatars/instagram.png',
    status: 'connected',
    followers: 18760,
    engagement: 15.2,
    lastSync: '2024-02-13T10:15:00Z'
  }
]

const MOCK_SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: '1',
    content: 'Excited to share our latest customer success story! 🎉 Our platform has helped businesses increase their testimonials by 300%! #CustomerSuccess #Testimonials',
    media: ['/media/post1.jpg'],
    platforms: ['facebook', 'twitter', 'linkedin'],
    scheduledTime: '2024-02-14T09:00:00Z',
    status: 'scheduled',
    engagement: { likes: 0, shares: 0, comments: 0, reach: 0 }
  },
  {
    id: '2',
    content: 'Did you know? Companies with strong testimonial strategies see 62% higher conversion rates. Ready to boost your business? 💪 #BusinessGrowth #Marketing',
    platforms: ['twitter', 'linkedin'],
    scheduledTime: '2024-02-14T14:00:00Z',
    status: 'scheduled',
    engagement: { likes: 0, shares: 0, comments: 0, reach: 0 }
  }
]

const MOCK_ANALYTICS: SocialMediaAnalytics[] = [
  { platform: 'Facebook', followers: 15420, engagement: 8.5, reach: 45600, impressions: 89200, clicks: 2340, conversions: 156 },
  { platform: 'Twitter', followers: 8920, engagement: 12.3, reach: 28900, impressions: 45600, clicks: 1890, conversions: 98 },
  { platform: 'LinkedIn', followers: 23450, engagement: 6.8, reach: 67800, impressions: 123400, clicks: 3450, conversions: 234 },
  { platform: 'Instagram', followers: 18760, engagement: 15.2, reach: 52300, impressions: 98700, clicks: 4120, conversions: 289 }
]

const PLATFORM_COLORS = {
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  instagram: '#E4405F',
  whatsapp: '#25D366'
}

export function SocialMediaDashboard({ userId }: SocialMediaDashboardProps) {
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [analytics, setAnalytics] = useState<SocialMediaAnalytics[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSocialMediaData()
  }, [userId])

  const loadSocialMediaData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAccounts(MOCK_ACCOUNTS)
      setScheduledPosts(MOCK_SCHEDULED_POSTS)
      setAnalytics(MOCK_ANALYTICS)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load social media data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const connectAccount = async (platform: string) => {
    try {
      // Simulate OAuth flow
      toast({
        title: 'Connecting...',
        description: `Connecting to ${platform}...`
      })
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Success',
        description: `Successfully connected to ${platform}`
      })
      
      loadSocialMediaData()
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to connect to ${platform}`,
        variant: 'destructive'
      })
    }
  }

  const schedulePost = async (post: Omit<ScheduledPost, 'id'>) => {
    try {
      const newPost = { ...post, id: Date.now().toString() }
      setScheduledPosts(prev => [...prev, newPost])
      
      toast({
        title: 'Success',
        description: 'Post scheduled successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule post',
        variant: 'destructive'
      })
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Globe className="h-4 w-4" />
      case 'twitter': return <Globe className="h-4 w-4" />
      case 'linkedin': return <Globe className="h-4 w-4" />
      case 'instagram': return <Smartphone className="h-4 w-4" />
      case 'whatsapp': return <Smartphone className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'disconnected': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPostStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalFollowers = accounts.reduce((sum, account) => sum + account.followers, 0)
  const totalEngagement = accounts.reduce((sum, account) => sum + account.engagement, 0) / accounts.length
  const totalPosts = scheduledPosts.length
  const publishedPosts = scheduledPosts.filter(post => post.status === 'published').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Social Media Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your social media presence across all platforms
          </p>
        </div>
        <Button onClick={loadSocialMediaData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFollowers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngagement.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {publishedPosts} published this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.filter(a => a.status === 'connected').length}</div>
            <p className="text-xs text-muted-foreground">
              {accounts.length} total platforms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="scheduling">Content Scheduling</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Platform Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>Engagement rates across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest social media activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledPosts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {post.content.substring(0, 50)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.scheduledTime).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={getPostStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Connected Accounts
              </CardTitle>
              <CardDescription>
                Manage your social media accounts and connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <Card key={account.id} className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getPlatformIcon(account.platform)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{account.name}</p>
                        <p className="text-xs text-muted-foreground">{account.username}</p>
                      </div>
                      <Badge className={getStatusColor(account.status)}>
                        {account.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Followers:</span>
                        <span className="font-medium">{account.followers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Engagement:</span>
                        <span className="font-medium">{account.engagement}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Sync:</span>
                        <span className="font-medium">
                          {new Date(account.lastSync).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Add New Account */}
                <Card className="p-4 border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center justify-center h-32 space-y-2">
                    <Plus className="h-8 w-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">Add Account</p>
                    <p className="text-xs text-gray-500 text-center">
                      Connect a new social media platform
                    </p>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Scheduling Tab */}
        <TabsContent value="scheduling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Content Scheduling
              </CardTitle>
              <CardDescription>
                Schedule and manage your social media content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledPosts.map((post) => (
                  <Card key={post.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <p className="text-sm">{post.content}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(post.scheduledTime).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            {post.platforms.join(', ')}
                          </span>
                        </div>

                        {post.media && post.media.length > 0 && (
                          <div className="flex space-x-2">
                            {post.media.map((media, index) => (
                              <div key={index} className="w-16 h-16 bg-gray-100 rounded border"></div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={getPostStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Engagement Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>Engagement rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="engagement" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Platform Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>Followers across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="followers"
                    >
                      {analytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(PLATFORM_COLORS)[index % Object.values(PLATFORM_COLORS).length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>Comprehensive performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Platform</th>
                      <th className="text-left p-2">Followers</th>
                      <th className="text-left p-2">Engagement</th>
                      <th className="text-left p-2">Reach</th>
                      <th className="text-left p-2">Impressions</th>
                      <th className="text-left p-2">Clicks</th>
                      <th className="text-left p-2">Conversions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.map((platform) => (
                      <tr key={platform.platform} className="border-b">
                        <td className="p-2 font-medium">{platform.platform}</td>
                        <td className="p-2">{platform.followers.toLocaleString()}</td>
                        <td className="p-2">{platform.engagement}%</td>
                        <td className="p-2">{platform.reach.toLocaleString()}</td>
                        <td className="p-2">{platform.impressions.toLocaleString()}</td>
                        <td className="p-2">{platform.clicks.toLocaleString()}</td>
                        <td className="p-2">{platform.conversions.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
