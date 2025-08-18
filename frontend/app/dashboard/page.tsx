'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { TestimonialsTable } from '@/components/dashboard/testimonials-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Download, 
  Share2, 
  Settings,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Award
} from 'lucide-react'

interface DashboardStats {
  total: number
  approved: number
  pending: number
  thisMonth: number
  approvalRate: number
  growthRate: number
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    approved: 0,
    pending: 0,
    thisMonth: 0,
    approvalRate: 0,
    growthRate: 0
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user && mounted) {
      router.push('/login')
    }
  }, [user, loading, router, mounted])

  // Mock stats - in real app, fetch from API
  useEffect(() => {
    if (mounted && user) {
      // Simulate loading stats
      setTimeout(() => {
        setStats({
          total: 24,
          approved: 18,
          pending: 6,
          thisMonth: 8,
          approvalRate: 75,
          growthRate: 12
        })
      }, 1000)
    }
  }, [mounted, user])

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Here's what's happening with your testimonials today
              </p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <Button 
                onClick={() => router.push('/collect')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Collect New
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/widget-test')}
                className="border-2 hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Widget
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Testimonials</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{stats.growthRate}% this month</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">{stats.approvalRate}% approval rate</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-sm text-orange-600">Needs attention</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
                  <div className="flex items-center mt-2">
                    <Zap className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600">Active growth</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Share2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Share Collection Link</h3>
                  <p className="text-sm text-gray-600">Get more testimonials</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  const link = `${window.location.origin}/collect?userId=${user.id}`;
                  navigator.clipboard.writeText(link);
                }}
              >
                Copy Link
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Download className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Export Data</h3>
                  <p className="text-sm text-gray-600">Download in multiple formats</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => router.push('/dashboard/export')}
              >
                Export Now
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Widget Settings</h3>
                  <p className="text-sm text-gray-600">Customize appearance</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                onClick={() => router.push('/dashboard/settings')}
              >
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Monthly Progress
            </CardTitle>
            <CardDescription>
              Your testimonial collection progress this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Collection Goal</span>
                <span className="text-sm text-gray-600">{stats.thisMonth}/20 testimonials</span>
              </div>
              <Progress value={(stats.thisMonth / 20) * 100} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Target: 20 testimonials</span>
                <span className="text-green-600 font-medium">
                  {Math.round((stats.thisMonth / 20) * 100)}% complete
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-orange-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest testimonials and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">New testimonial approved</p>
                  <p className="text-sm text-gray-600">Sarah Johnson's testimonial was approved</p>
                </div>
                <Badge variant="secondary" className="ml-auto">2 hours ago</Badge>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">New testimonial received</p>
                  <p className="text-sm text-gray-600">Mike Chen submitted a testimonial</p>
                </div>
                <Badge variant="secondary" className="ml-auto">5 hours ago</Badge>
              </div>
              <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                <Download className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Data exported</p>
                  <p className="text-sm text-gray-600">Testimonials exported to CSV</p>
                </div>
                <Badge variant="secondary" className="ml-auto">1 day ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials Management */}
        <TestimonialsTable userId={user.id} />
      </main>
    </div>
  )
}