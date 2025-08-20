import { SocialMediaDashboard } from '@/components/social-media/social-media-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Share2, TrendingUp, Users, MessageSquare, Heart, Eye, Zap, Target, Globe, Smartphone, Monitor } from 'lucide-react'

interface SocialMediaPageProps {
  params: { userId: string }
}

export default function SocialMediaPage({ params }: SocialMediaPageProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Management</h1>
          <p className="text-muted-foreground">
            Manage your social media presence, schedule content, and track performance across all platforms
          </p>
        </div>
        <Button>
          <Share2 className="h-4 w-4 mr-2" />
          Connect New Platform
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">194.6K</div>
            <p className="text-xs text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10.7%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 scheduled for this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">
              -15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Platform Status Overview
          </CardTitle>
          <CardDescription>
            Current status and performance of connected social media platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Facebook</p>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Connected
                </Badge>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-sky-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Twitter</p>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Connected
                </Badge>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">LinkedIn</p>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Connected
                </Badge>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-pink-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Instagram</p>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Connected
                </Badge>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">WhatsApp</p>
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                  Disconnected
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Social Media Dashboard */}
      <SocialMediaDashboard userId={params.userId} />
    </div>
  )
}
