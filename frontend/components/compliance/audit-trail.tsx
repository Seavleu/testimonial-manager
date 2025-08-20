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
  Activity,
  Shield,
  User,
  Database,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Monitor,
  Lock,
  Unlock,
  Trash2,
  Edit3,
  Plus,
  Users,
  Key
} from 'lucide-react'

interface AuditEvent {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceType: 'testimonial' | 'user' | 'system' | 'security' | 'compliance' | 'widget' | 'automation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  ipAddress: string
  userAgent: string
  details: string
  status: 'success' | 'failure' | 'warning'
  metadata?: Record<string, any>
}

interface AuditTrailProps {
  userId: string
}

const EVENT_TYPES = [
  'All Events',
  'User Authentication',
  'Data Access',
  'Data Modification',
  'Security Events',
  'Compliance Activities',
  'System Changes',
  'Permission Changes'
]

const RESOURCE_TYPES = [
  'All Resources',
  'testimonial',
  'user',
  'system',
  'security',
  'compliance',
  'widget',
  'automation'
]

const SEVERITY_LEVELS = [
  'All Severities',
  'low',
  'medium',
  'high',
  'critical'
]

export function AuditTrail({ userId }: AuditTrailProps) {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([])
  const [filters, setFilters] = useState({
    eventType: 'All Events',
    resourceType: 'All Resources',
    severity: 'All Severities',
    dateRange: '24h',
    searchQuery: '',
    userId: ''
  })
  const [activeTab, setActiveTab] = useState('events')
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  // Mock audit events data
  const mockEvents: AuditEvent[] = [
    {
      id: '1',
      timestamp: '2024-02-07T15:30:00Z',
      userId: 'admin1',
      userName: 'John Admin',
      action: 'User Login',
      resource: 'Authentication System',
      resourceType: 'security',
      severity: 'low',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: 'Successful login from office network',
      status: 'success',
      metadata: { sessionId: 'sess_12345', mfaEnabled: true }
    },
    {
      id: '2',
      timestamp: '2024-02-07T15:25:00Z',
      userId: 'user2',
      userName: 'Sarah Manager',
      action: 'Testimonial Approval',
      resource: 'Testimonial #1234',
      resourceType: 'testimonial',
      severity: 'medium',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      details: 'Approved testimonial from customer feedback',
      status: 'success',
      metadata: { testimonialId: '1234', customerEmail: 'customer@example.com' }
    },
    {
      id: '3',
      timestamp: '2024-02-07T15:20:00Z',
      userId: 'system',
      userName: 'System',
      action: 'Failed Login Attempt',
      resource: 'Authentication System',
      resourceType: 'security',
      severity: 'high',
      ipAddress: '203.45.67.89',
      userAgent: 'Mozilla/5.0 (Unknown) AppleWebKit/537.36',
      details: 'Multiple failed login attempts from suspicious IP',
      status: 'failure',
      metadata: { attempts: 5, blocked: true, reason: 'Brute force attack' }
    },
    {
      id: '4',
      timestamp: '2024-02-07T15:15:00Z',
      userId: 'admin1',
      userName: 'John Admin',
      action: 'Role Permission Update',
      resource: 'User Role: Editor',
      resourceType: 'security',
      severity: 'high',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: 'Updated permissions for Editor role',
      status: 'success',
      metadata: { roleId: 'editor', permissionsAdded: ['testimonials.moderate'], permissionsRemoved: [] }
    },
    {
      id: '5',
      timestamp: '2024-02-07T15:10:00Z',
      userId: 'user3',
      userName: 'Mike Editor',
      action: 'Data Export',
      resource: 'Testimonials Dataset',
      resourceType: 'compliance',
      severity: 'medium',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: 'Exported testimonials data for GDPR compliance',
      status: 'success',
      metadata: { exportType: 'gdpr', recordCount: 150, format: 'CSV' }
    },
    {
      id: '6',
      timestamp: '2024-02-07T15:05:00Z',
      userId: 'system',
      userName: 'System',
      action: 'Automated Backup',
      resource: 'Database Backup',
      resourceType: 'system',
      severity: 'low',
      ipAddress: '127.0.0.1',
      userAgent: 'System/Backup Service',
      details: 'Scheduled database backup completed successfully',
      status: 'success',
      metadata: { backupSize: '2.5GB', duration: '15m', type: 'incremental' }
    },
    {
      id: '7',
      timestamp: '2024-02-07T15:00:00Z',
      userId: 'user4',
      userName: 'Lisa Viewer',
      action: 'Widget Configuration',
      resource: 'Testimonial Widget #567',
      resourceType: 'widget',
      severity: 'low',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      details: 'Updated widget color scheme and layout',
      status: 'success',
      metadata: { widgetId: '567', changes: ['colorScheme', 'layout'] }
    },
    {
      id: '8',
      timestamp: '2024-02-07T14:55:00Z',
      userId: 'admin1',
      userName: 'John Admin',
      action: 'System Settings Update',
      resource: 'Email Configuration',
      resourceType: 'system',
      severity: 'high',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: 'Updated SMTP server configuration',
      status: 'success',
      metadata: { smtpServer: 'smtp.newprovider.com', port: 587, encryption: 'TLS' }
    }
  ]

  useEffect(() => {
    if (userId) {
      loadAuditData()
    }
  }, [userId])

  useEffect(() => {
    applyFilters()
  }, [filters, events])

  const loadAuditData = async () => {
    try {
      setLoading(true)
      // In production, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      setEvents(mockEvents)
    } catch (error) {
      console.error('Failed to load audit data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load audit trail data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...events]

    // Filter by event type
    if (filters.eventType !== 'All Events') {
      filtered = filtered.filter(event => {
        switch (filters.eventType) {
          case 'User Authentication':
            return event.action.toLowerCase().includes('login') || event.action.toLowerCase().includes('logout')
          case 'Data Access':
            return event.action.toLowerCase().includes('view') || event.action.toLowerCase().includes('export')
          case 'Data Modification':
            return event.action.toLowerCase().includes('create') || event.action.toLowerCase().includes('update') || event.action.toLowerCase().includes('delete')
          case 'Security Events':
            return event.resourceType === 'security'
          case 'Compliance Activities':
            return event.resourceType === 'compliance'
          case 'System Changes':
            return event.resourceType === 'system'
          case 'Permission Changes':
            return event.action.toLowerCase().includes('permission') || event.action.toLowerCase().includes('role')
          default:
            return true
        }
      })
    }

    // Filter by resource type
    if (filters.resourceType !== 'All Resources') {
      filtered = filtered.filter(event => event.resourceType === filters.resourceType)
    }

    // Filter by severity
    if (filters.severity !== 'All Severities') {
      filtered = filtered.filter(event => event.severity === filters.severity)
    }

    // Filter by date range
    const now = new Date()
    const filterDate = new Date()
    switch (filters.dateRange) {
      case '1h':
        filterDate.setHours(now.getHours() - 1)
        break
      case '24h':
        filterDate.setDate(now.getDate() - 1)
        break
      case '7d':
        filterDate.setDate(now.getDate() - 7)
        break
      case '30d':
        filterDate.setDate(now.getDate() - 30)
        break
      case '90d':
        filterDate.setDate(now.getDate() - 90)
        break
    }
    filtered = filtered.filter(event => new Date(event.timestamp) >= filterDate)

    // Filter by search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(event =>
        event.action.toLowerCase().includes(query) ||
        event.resource.toLowerCase().includes(query) ||
        event.userName.toLowerCase().includes(query) ||
        event.details.toLowerCase().includes(query)
      )
    }

    // Filter by user ID
    if (filters.userId.trim()) {
      filtered = filtered.filter(event => event.userId.toLowerCase().includes(filters.userId.toLowerCase()))
    }

    setFilteredEvents(filtered)
  }

  const exportAuditLog = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Severity', 'Status', 'IP Address', 'Details'],
      ...filteredEvents.map(event => [
        event.timestamp,
        event.userName,
        event.action,
        event.resource,
        event.severity,
        event.status,
        event.ipAddress,
        event.details
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Export Successful',
      description: 'Audit trail exported to CSV file'
    })
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      success: <CheckCircle className="h-4 w-4 text-green-600" />,
      failure: <AlertTriangle className="h-4 w-4 text-red-600" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
    return icons[status as keyof typeof icons] || <Clock className="h-4 w-4 text-gray-600" />
  }

  const getResourceTypeIcon = (resourceType: string) => {
    const icons = {
      testimonial: <FileText className="h-4 w-4" />,
      user: <User className="h-4 w-4" />,
      system: <Settings className="h-4 w-4" />,
      security: <Shield className="h-4 w-4" />,
      compliance: <Database className="h-4 w-4" />,
      widget: <Monitor className="h-4 w-4" />,
      automation: <Activity className="h-4 w-4" />
    }
    return icons[resourceType as keyof typeof icons] || <FileText className="h-4 w-4" />
  }

  if (loading && events.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Audit Trail</h2>
          <p className="text-gray-600">Track and monitor all system activities and security events</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Button onClick={exportAuditLog} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Log
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Audit Events
            </CardTitle>
            <CardDescription>Refine audit trail results by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={filters.eventType} onValueChange={(value) => setFilters(prev => ({ ...prev, eventType: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resourceType">Resource Type</Label>
                <Select value={filters.resourceType} onValueChange={(value) => setFilters(prev => ({ ...prev, resourceType: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="severity">Severity Level</Label>
                <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="searchQuery">Search Query</Label>
                <Input
                  id="searchQuery"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  placeholder="Search events..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={filters.userId}
                  onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="Filter by user..."
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Events
            <Badge variant="outline" className="ml-2">{filteredEvents.length} events</Badge>
          </CardTitle>
          <CardDescription>Real-time audit trail of system activities and security events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getResourceTypeIcon(event.resourceType)}
                    </div>
                    <div>
                      <h4 className="font-medium">{event.action}</h4>
                      <p className="text-sm text-gray-600">{event.resource}</p>
                      <p className="text-xs text-gray-500">
                        by {event.userName} • {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getSeverityColor(event.severity)} mb-2`}>
                      {event.severity}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(event.status)}
                      <span className="text-sm text-gray-600">{event.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Details</p>
                    <p className="text-gray-600">{event.details}</p>
                  </div>
                  <div>
                    <p className="font-medium">Technical Info</p>
                    <div className="space-y-1 text-gray-600">
                      <p>IP: {event.ipAddress}</p>
                      <p>User Agent: {event.userAgent.substring(0, 50)}...</p>
                    </div>
                  </div>
                </div>

                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border">
                    <p className="text-sm font-medium mb-2">Additional Metadata</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span className="text-gray-600">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No audit events found matching the current filters</p>
                <p className="text-sm">Try adjusting your filter criteria or search query</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
