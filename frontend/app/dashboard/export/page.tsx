'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  FilePdf, 
  Calendar,
  Filter,
  ArrowLeft,
  CheckCircle,
  Clock,
  Users,
  Star,
  Settings,
  Zap
} from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  text: string
  video_url: string | null
  approved: boolean
  created_at: string
}

interface ExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'excel'
  dateRange: 'all' | 'last7days' | 'last30days' | 'last90days' | 'custom'
  customStartDate?: string
  customEndDate?: string
  includeApproved: boolean
  includePending: boolean
  includeVideos: boolean
  includeMetadata: boolean
  fileName: string
}

export default function ExportPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: 'all',
    includeApproved: true,
    includePending: true,
    includeVideos: true,
    includeMetadata: true,
    fileName: 'testimonials'
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user && mounted) {
      router.push('/login')
    }
  }, [user, loading, router, mounted])

  useEffect(() => {
    if (mounted && user) {
      fetchTestimonials()
    }
  }, [mounted, user])

  const fetchTestimonials = async () => {
    try {
      setLoadingData(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/testimonials/${user?.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials')
      }
      
      const data = await response.json()
      const testimonialsData = data.testimonials || data || []
      setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : [])
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast({
        title: 'Error',
        description: 'Failed to load testimonials',
        variant: 'destructive',
      })
    } finally {
      setLoadingData(false)
    }
  }

  const getFilteredTestimonials = () => {
    let filtered = testimonials

    // Filter by approval status
    if (exportOptions.includeApproved && !exportOptions.includePending) {
      filtered = filtered.filter(t => t.approved)
    } else if (!exportOptions.includeApproved && exportOptions.includePending) {
      filtered = filtered.filter(t => !t.approved)
    }

    // Filter by date range
    const now = new Date()
    let startDate: Date | null = null

    switch (exportOptions.dateRange) {
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'last90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'custom':
        if (exportOptions.customStartDate) {
          startDate = new Date(exportOptions.customStartDate)
        }
        break
    }

    if (startDate) {
      filtered = filtered.filter(t => new Date(t.created_at) >= startDate!)
    }

    if (exportOptions.dateRange === 'custom' && exportOptions.customEndDate) {
      const endDate = new Date(exportOptions.customEndDate)
      filtered = filtered.filter(t => new Date(t.created_at) <= endDate)
    }

    return filtered
  }

  const exportData = async () => {
    try {
      setExporting(true)
      const filteredData = getFilteredTestimonials()
      
      if (filteredData.length === 0) {
        toast({
          title: 'No Data',
          description: 'No testimonials match your export criteria',
          variant: 'destructive',
        })
        return
      }

      const fileName = `${exportOptions.fileName}-${new Date().toISOString().split('T')[0]}`

      switch (exportOptions.format) {
        case 'csv':
          exportToCSV(filteredData, fileName)
          break
        case 'json':
          exportToJSON(filteredData, fileName)
          break
        case 'excel':
          exportToExcel(filteredData, fileName)
          break
        case 'pdf':
          exportToPDF(filteredData, fileName)
          break
      }

      toast({
        title: 'Export Successful',
        description: `${filteredData.length} testimonials exported to ${exportOptions.format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  const exportToCSV = (data: Testimonial[], fileName: string) => {
    const headers = ['Name', 'Text', 'Approved', 'Created Date']
    if (exportOptions.includeVideos) headers.push('Video URL')
    if (exportOptions.includeMetadata) headers.push('ID')

    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        `"${item.name}"`,
        `"${item.text.replace(/"/g, '""')}"`,
        item.approved ? 'Yes' : 'No',
        new Date(item.created_at).toLocaleDateString(),
        ...(exportOptions.includeVideos ? [item.video_url || ''] : []),
        ...(exportOptions.includeMetadata ? [item.id] : [])
      ].join(','))
    ].join('\n')

    downloadFile(csvContent, `${fileName}.csv`, 'text/csv')
  }

  const exportToJSON = (data: Testimonial[], fileName: string) => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalCount: data.length,
      testimonials: data.map(item => ({
        ...item,
        created_at: new Date(item.created_at).toISOString()
      }))
    }

    downloadFile(JSON.stringify(jsonData, null, 2), `${fileName}.json`, 'application/json')
  }

  const exportToExcel = (data: Testimonial[], fileName: string) => {
    // For simplicity, we'll create a CSV that Excel can open
    // In a real app, you'd use a library like xlsx
    exportToCSV(data, fileName)
  }

  const exportToPDF = (data: Testimonial[], fileName: string) => {
    // For simplicity, we'll create a text representation
    // In a real app, you'd use a library like jsPDF
    const pdfContent = data.map((item, index) => 
      `${index + 1}. ${item.name}\n"${item.text}"\nStatus: ${item.approved ? 'Approved' : 'Pending'}\nDate: ${new Date(item.created_at).toLocaleDateString()}\n\n`
    ).join('')

    downloadFile(pdfContent, `${fileName}.txt`, 'text/plain')
  }

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getStats = () => {
    const filtered = getFilteredTestimonials()
    return {
      total: filtered.length,
      approved: filtered.filter(t => t.approved).length,
      pending: filtered.filter(t => !t.approved).length,
      withVideos: filtered.filter(t => t.video_url).length
    }
  }

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading export page...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Export Testimonials
              </h1>
              <p className="text-gray-600 text-lg">
                Download your testimonial data in multiple formats
              </p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <Button 
                onClick={exportData}
                disabled={exporting || stats.total === 0}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Export Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Selection */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Export Format
                </CardTitle>
                <CardDescription>
                  Choose the format for your exported data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'csv', label: 'CSV', icon: FileSpreadsheet, desc: 'Excel compatible' },
                    { value: 'json', label: 'JSON', icon: FileJson, desc: 'Structured data' },
                    { value: 'excel', label: 'Excel', icon: FileSpreadsheet, desc: 'Spreadsheet format' },
                    { value: 'pdf', label: 'PDF', icon: FilePdf, desc: 'Document format' }
                  ].map((format) => (
                    <div
                      key={format.value}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        exportOptions.format === format.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                    >
                      <format.icon className="h-6 w-6 text-gray-600 mb-2" />
                      <p className="font-medium text-sm">{format.label}</p>
                      <p className="text-xs text-gray-500">{format.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Date Range */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  Date Range
                </CardTitle>
                <CardDescription>
                  Select the time period for your export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={exportOptions.dateRange}
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, dateRange: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="last90days">Last 90 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>

                {exportOptions.dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={exportOptions.customStartDate || ''}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, customStartDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={exportOptions.customEndDate || ''}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, customEndDate: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Options */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-purple-600" />
                  Content Options
                </CardTitle>
                <CardDescription>
                  Choose what to include in your export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeApproved"
                      checked={exportOptions.includeApproved}
                      onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeApproved: checked as boolean }))}
                    />
                    <Label htmlFor="includeApproved">Include approved testimonials</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includePending"
                      checked={exportOptions.includePending}
                      onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includePending: checked as boolean }))}
                    />
                    <Label htmlFor="includePending">Include pending testimonials</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeVideos"
                      checked={exportOptions.includeVideos}
                      onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeVideos: checked as boolean }))}
                    />
                    <Label htmlFor="includeVideos">Include video URLs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeMetadata"
                      checked={exportOptions.includeMetadata}
                      onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeMetadata: checked as boolean }))}
                    />
                    <Label htmlFor="includeMetadata">Include metadata (IDs, timestamps)</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Name */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-orange-600" />
                  File Settings
                </CardTitle>
                <CardDescription>
                  Customize your export file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    value={exportOptions.fileName}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, fileName: e.target.value }))}
                    placeholder="Enter file name"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    File will be saved as: {exportOptions.fileName}-{new Date().toISOString().split('T')[0]}.{exportOptions.format}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Stats */}
          <div className="space-y-6">
            {/* Export Preview */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                  Export Preview
                </CardTitle>
                <CardDescription>
                  Summary of your export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Testimonials</span>
                    <Badge variant="secondary">{stats.total}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Approved</span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {stats.approved}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      {stats.pending}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">With Videos</span>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {stats.withVideos}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Export Format</p>
                  <Badge className="text-lg px-4 py-2">
                    {exportOptions.format.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-indigo-600" />
                  Your Testimonials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{testimonials.length}</p>
                  <p className="text-sm text-gray-600">Total Testimonials</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">
                      {testimonials.filter(t => t.approved).length}
                    </p>
                    <p className="text-xs text-gray-600">Approved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-orange-600">
                      {testimonials.filter(t => !t.approved).length}
                    </p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
