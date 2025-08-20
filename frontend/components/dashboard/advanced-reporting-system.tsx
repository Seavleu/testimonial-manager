'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { 
  FileText, 
  Calendar, 
  Clock, 
  Download, 
  Mail, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3,
  Eye,
  BarChart3,
  TrendingUp,
  Users,
  Star,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Filter,
  Search
} from 'lucide-react'

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom'
  sections: string[]
  recipients: string[]
  schedule: {
    enabled: boolean
    frequency: string
    time: string
    dayOfWeek?: string
    dayOfMonth?: number
  }
  lastGenerated?: string
  nextGeneration?: string
}

interface ReportSection {
  id: string
  name: string
  description: string
  type: 'metrics' | 'charts' | 'tables' | 'insights'
  required: boolean
}

interface AdvancedReportingSystemProps {
  userId: string
}

const REPORT_SECTIONS: ReportSection[] = [
  { id: 'overview', name: 'Executive Summary', description: 'Key metrics and highlights', type: 'metrics', required: true },
  { id: 'trends', name: 'Performance Trends', description: 'Growth and trend analysis', type: 'charts', required: true },
  { id: 'engagement', name: 'Engagement Metrics', description: 'Views, clicks, and conversions', type: 'metrics', required: false },
  { id: 'categories', name: 'Category Analysis', description: 'Testimonial distribution by category', type: 'charts', required: false },
  { id: 'sources', name: 'Source Analysis', description: 'Where testimonials come from', type: 'charts', required: false },
  { id: 'quality', name: 'Quality Metrics', description: 'Ratings and approval rates', type: 'metrics', required: false },
  { id: 'comparison', name: 'Period Comparison', description: 'Compare with previous periods', type: 'charts', required: false },
  { id: 'insights', name: 'AI Insights', description: 'Automated insights and recommendations', type: 'insights', required: false },
  { id: 'forecasts', name: 'Forecasts', description: 'Predictive analytics and trends', type: 'charts', required: false }
]

const REPORT_TYPES = [
  { value: 'daily', label: 'Daily Report', description: 'Daily summary and metrics' },
  { value: 'weekly', label: 'Weekly Report', description: 'Weekly performance overview' },
  { value: 'monthly', label: 'Monthly Report', description: 'Comprehensive monthly analysis' },
  { value: 'quarterly', label: 'Quarterly Report', description: 'Quarterly business review' },
  { value: 'custom', label: 'Custom Report', description: 'Customized report configuration' }
]

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' }
]

export function AdvancedReportingSystem({ userId }: AdvancedReportingSystemProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null)
  const [selectedSections, setSelectedSections] = useState<string[]>(['overview', 'trends'])
  const [reportName, setReportName] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [reportType, setReportType] = useState('monthly')
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [frequency, setFrequency] = useState('monthly')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [recipients, setRecipients] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Mock templates for demonstration
  const mockTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'Executive Monthly Report',
      description: 'Comprehensive monthly overview for stakeholders',
      type: 'monthly',
      sections: ['overview', 'trends', 'engagement', 'quality'],
      recipients: ['ceo@company.com', 'marketing@company.com'],
      schedule: {
        enabled: true,
        frequency: 'monthly',
        time: '09:00',
        dayOfMonth: 1
      },
      lastGenerated: '2024-01-01',
      nextGeneration: '2024-02-01'
    },
    {
      id: '2',
      name: 'Weekly Performance Report',
      description: 'Weekly metrics and quick insights',
      type: 'weekly',
      sections: ['overview', 'trends'],
      recipients: ['team@company.com'],
      schedule: {
        enabled: true,
        frequency: 'weekly',
        time: '08:00',
        dayOfWeek: 'Monday'
      },
      lastGenerated: '2024-01-15',
      nextGeneration: '2024-01-22'
    }
  ]

  useEffect(() => {
    if (userId) {
      loadTemplates()
    }
  }, [userId])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      // In production, this would fetch from your API
      // const response = await fetch(`/api/reports/templates/${userId}`)
      // const templatesData = await response.json()
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Failed to load report templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load report templates',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createTemplate = async () => {
    if (!reportName.trim() || selectedSections.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a report name and select at least one section',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      const newTemplate: ReportTemplate = {
        id: Date.now().toString(),
        name: reportName,
        description: reportDescription,
        type: reportType as any,
        sections: selectedSections,
        recipients: recipients.split(',').map(email => email.trim()).filter(Boolean),
        schedule: {
          enabled: scheduleEnabled,
          frequency,
          time: scheduleTime,
          dayOfWeek: frequency === 'weekly' ? 'Monday' : undefined,
          dayOfMonth: frequency === 'monthly' ? 1 : undefined
        },
        lastGenerated: undefined,
        nextGeneration: scheduleEnabled ? calculateNextGeneration() : undefined
      }

      // In production, this would save to your API
      // const response = await fetch('/api/reports/templates', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newTemplate)
      // })

      setTemplates(prev => [...prev, newTemplate])
      resetForm()
      toast({
        title: 'Success',
        description: 'Report template created successfully'
      })
    } catch (error) {
      console.error('Failed to create template:', error)
      toast({
        title: 'Error',
        description: 'Failed to create report template',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateTemplate = async () => {
    if (!editingTemplate) return

    try {
      setLoading(true)
      const updatedTemplate: ReportTemplate = {
        ...editingTemplate,
        name: reportName,
        description: reportDescription,
        type: reportType as any,
        sections: selectedSections,
        recipients: recipients.split(',').map(email => email.trim()).filter(Boolean),
        schedule: {
          enabled: scheduleEnabled,
          frequency,
          time: scheduleTime,
          dayOfWeek: frequency === 'weekly' ? 'Monday' : undefined,
          dayOfMonth: frequency === 'monthly' ? 1 : undefined
        }
      }

      // In production, this would update via your API
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t))
      resetForm()
      toast({
        title: 'Success',
        description: 'Report template updated successfully'
      })
    } catch (error) {
      console.error('Failed to update template:', error)
      toast({
        title: 'Error',
        description: 'Failed to update report template',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (templateId: string) => {
    try {
      // In production, this would delete via your API
      setTemplates(prev => prev.filter(t => t.id !== templateId))
      toast({
        title: 'Success',
        description: 'Report template deleted successfully'
      })
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete report template',
        variant: 'destructive'
      })
    }
  }

  const generateReport = async (templateId: string) => {
    try {
      setLoading(true)
      toast({
        title: 'Generating Report',
        description: 'Your report is being generated...'
      })

      // In production, this would call your report generation API
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate generation delay

      toast({
        title: 'Report Generated',
        description: 'Your report has been generated and sent to recipients'
      })
    } catch (error) {
      console.error('Failed to generate report:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const editTemplate = (template: ReportTemplate) => {
    setEditingTemplate(template)
    setReportName(template.name)
    setReportDescription(template.description)
    setReportType(template.type)
    setSelectedSections(template.sections)
    setScheduleEnabled(template.schedule.enabled)
    setFrequency(template.schedule.frequency)
    setScheduleTime(template.schedule.time)
    setRecipients(template.recipients.join(', '))
    setShowCreateForm(true)
  }

  const resetForm = () => {
    setEditingTemplate(null)
    setReportName('')
    setReportDescription('')
    setReportType('monthly')
    setSelectedSections(['overview', 'trends'])
    setScheduleEnabled(false)
    setFrequency('monthly')
    setScheduleTime('09:00')
    setRecipients('')
    setShowCreateForm(false)
  }

  const calculateNextGeneration = (): string => {
    const now = new Date()
    const next = new Date(now)
    
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1)
        break
      case 'weekly':
        next.setDate(next.getDate() + 7)
        break
      case 'monthly':
        next.setMonth(next.getMonth() + 1)
        break
      case 'quarterly':
        next.setMonth(next.getMonth() + 3)
        break
    }
    
    return next.toISOString().split('T')[0]
  }

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const getStatusBadge = (template: ReportTemplate) => {
    if (!template.schedule.enabled) {
      return <Badge variant="secondary">Manual</Badge>
    }
    
    if (template.lastGenerated) {
      return <Badge variant="default">Scheduled</Badge>
    }
    
    return <Badge variant="outline">Pending</Badge>
  }

  if (loading && templates.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Advanced Reporting System</h2>
          <p className="text-gray-600">Create, schedule, and manage automated reports</p>
        </div>
        
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingTemplate ? 'Edit Report Template' : 'Create Report Template'}
            </CardTitle>
            <CardDescription>
              Configure your report template with sections, schedule, and recipients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-name">Report Name *</Label>
                <Input
                  id="report-name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe what this report covers"
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Report Sections */}
            <div>
              <Label className="text-base font-medium">Report Sections</Label>
              <p className="text-sm text-gray-600 mb-3">Select the sections to include in your report</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {REPORT_SECTIONS.map((section) => (
                  <div key={section.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={section.id}
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                      disabled={section.required}
                    />
                    <div className="flex-1">
                      <Label htmlFor={section.id} className="text-sm font-medium">
                        {section.name}
                        {section.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <p className="text-xs text-gray-500">{section.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Configuration */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Switch
                  id="schedule-enabled"
                  checked={scheduleEnabled}
                  onCheckedChange={setScheduleEnabled}
                />
                <Label htmlFor="schedule-enabled" className="text-base font-medium">
                  Enable Automated Scheduling
                </Label>
              </div>

              {scheduleEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="schedule-time">Time</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="recipients">Recipients</Label>
                    <Input
                      id="recipients"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      placeholder="email1@company.com, email2@company.com"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button 
                onClick={editingTemplate ? updateTemplate : createTemplate}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
              
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {template.name}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {template.description}
                  </CardDescription>
                </div>
                {getStatusBadge(template)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Template Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant="outline">{template.type}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Sections:</span>
                  <span className="text-gray-900">{template.sections.length} selected</span>
                </div>
                
                {template.schedule.enabled && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Schedule:</span>
                      <span className="text-gray-900">
                        {template.schedule.frequency} at {template.schedule.time}
                      </span>
                    </div>
                    
                    {template.lastGenerated && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Generated:</span>
                        <span className="text-gray-900">{template.lastGenerated}</span>
                      </div>
                    )}
                    
                    {template.nextGeneration && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Next Generation:</span>
                        <span className="text-gray-900">{template.nextGeneration}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Recipients */}
              {template.recipients.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Recipients</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.recipients.map((email, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {email}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button 
                  onClick={() => generateReport(template.id)}
                  disabled={loading}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Generate Now
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => editTemplate(template)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteTemplate(template.id)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Report Templates</h3>
            <p className="text-gray-600 mb-4">
              Create your first report template to start generating automated reports
            </p>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
