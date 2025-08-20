'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Shield,
  Download,
  Trash2,
  Eye,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Database,
  Settings,
  RefreshCw,
  Plus,
  Edit3,
  Search
} from 'lucide-react'

interface DataSubject {
  id: string
  email: string
  name: string
  requestType: 'access' | 'deletion' | 'portability' | 'rectification'
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  submittedAt: string
  completedAt?: string
  notes?: string
}

interface ConsentRecord {
  id: string
  userId: string
  purpose: string
  granted: boolean
  timestamp: string
  ipAddress: string
  userAgent: string
  withdrawnAt?: string
}

interface DataProcessingActivity {
  id: string
  name: string
  purpose: string
  legalBasis: string
  dataCategories: string[]
  retentionPeriod: string
  thirdPartySharing: boolean
  thirdParties: string[]
  status: 'active' | 'inactive' | 'review'
}

interface GDPRComplianceProps {
  userId: string
}

const DATA_CATEGORIES = [
  'Personal Identifiers',
  'Contact Information',
  'Professional Information',
  'Testimonial Content',
  'Usage Analytics',
  'Device Information',
  'Location Data',
  'Communication Preferences'
]

const LEGAL_BASES = [
  'Consent',
  'Contract Performance',
  'Legal Obligation',
  'Legitimate Interest',
  'Vital Interest',
  'Public Task'
]

const PURPOSES = [
  'Service Provision',
  'Customer Support',
  'Marketing Communications',
  'Analytics & Improvement',
  'Legal Compliance',
  'Security & Fraud Prevention'
]

export function GDPRCompliance({ userId }: GDPRComplianceProps) {
  const [dataSubjects, setDataSubjects] = useState<DataSubject[]>([])
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([])
  const [processingActivities, setProcessingActivities] = useState<DataProcessingActivity[]>([])
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<DataProcessingActivity | null>(null)
  const [newRequest, setNewRequest] = useState({
    email: '',
    name: '',
    requestType: 'access' as DataSubject['requestType'],
    notes: ''
  })
  const [newActivity, setNewActivity] = useState({
    name: '',
    purpose: '',
    legalBasis: '',
    dataCategories: [] as string[],
    retentionPeriod: '',
    thirdPartySharing: false,
    thirdParties: [] as string[]
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Mock data
  const mockDataSubjects: DataSubject[] = [
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      requestType: 'access',
      status: 'completed',
      submittedAt: '2024-02-01T10:00:00Z',
      completedAt: '2024-02-03T14:30:00Z',
      notes: 'Data export completed and sent via email'
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      requestType: 'deletion',
      status: 'processing',
      submittedAt: '2024-02-05T15:20:00Z',
      notes: 'Data deletion in progress - scheduled for completion within 30 days'
    },
    {
      id: '3',
      email: 'bob.wilson@example.com',
      name: 'Bob Wilson',
      requestType: 'portability',
      status: 'pending',
      submittedAt: '2024-02-07T09:15:00Z'
    }
  ]

  const mockConsentRecords: ConsentRecord[] = [
    {
      id: '1',
      userId: 'user1',
      purpose: 'Marketing Communications',
      granted: true,
      timestamp: '2024-01-15T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '2',
      userId: 'user2',
      purpose: 'Analytics & Improvement',
      granted: true,
      timestamp: '2024-01-20T14:45:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    {
      id: '3',
      userId: 'user3',
      purpose: 'Marketing Communications',
      granted: false,
      timestamp: '2024-01-25T16:20:00Z',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  ]

  const mockProcessingActivities: DataProcessingActivity[] = [
    {
      id: '1',
      name: 'Testimonial Collection & Display',
      purpose: 'Service Provision',
      legalBasis: 'Contract Performance',
      dataCategories: ['Personal Identifiers', 'Contact Information', 'Professional Information', 'Testimonial Content'],
      retentionPeriod: '5 years or until account deletion',
      thirdPartySharing: false,
      thirdParties: [],
      status: 'active'
    },
    {
      id: '2',
      name: 'Marketing Communications',
      purpose: 'Marketing Communications',
      legalBasis: 'Consent',
      dataCategories: ['Personal Identifiers', 'Contact Information', 'Communication Preferences'],
      retentionPeriod: 'Until consent withdrawal',
      thirdPartySharing: true,
      thirdParties: ['Email Service Provider', 'Marketing Platform'],
      status: 'active'
    },
    {
      id: '3',
      name: 'Analytics & Improvement',
      purpose: 'Analytics & Improvement',
      legalBasis: 'Legitimate Interest',
      dataCategories: ['Usage Analytics', 'Device Information'],
      retentionPeriod: '2 years',
      thirdPartySharing: true,
      thirdParties: ['Analytics Provider'],
      status: 'active'
    }
  ]

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
      setDataSubjects(mockDataSubjects)
      setConsentRecords(mockConsentRecords)
      setProcessingActivities(mockProcessingActivities)
    } catch (error) {
      console.error('Failed to load GDPR data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load GDPR compliance data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const submitDataRequest = async () => {
    if (!newRequest.email.trim() || !newRequest.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide email and name',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      const request: DataSubject = {
        id: `request-${Date.now()}`,
        email: newRequest.email,
        name: newRequest.name,
        requestType: newRequest.requestType,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        notes: newRequest.notes
      }

      setDataSubjects(prev => [request, ...prev])
      setNewRequest({ email: '', name: '', requestType: 'access', notes: '' })
      setShowRequestForm(false)
      
      toast({
        title: 'Success',
        description: 'Data subject request submitted successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit request',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createProcessingActivity = async () => {
    if (!newActivity.name.trim() || !newActivity.purpose.trim() || !newActivity.legalBasis.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide name, purpose, and legal basis',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      const activity: DataProcessingActivity = {
        id: `activity-${Date.now()}`,
        name: newActivity.name,
        purpose: newActivity.purpose,
        legalBasis: newActivity.legalBasis,
        dataCategories: newActivity.dataCategories,
        retentionPeriod: newActivity.retentionPeriod,
        thirdPartySharing: newActivity.thirdPartySharing,
        thirdParties: newActivity.thirdParties,
        status: 'active'
      }

      setProcessingActivities(prev => [...prev, activity])
      setNewActivity({
        name: '',
        purpose: '',
        legalBasis: '',
        dataCategories: [],
        retentionPeriod: '',
        thirdPartySharing: false,
        thirdParties: []
      })
      
      toast({
        title: 'Success',
        description: 'Processing activity created successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create processing activity',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProcessingActivity = async () => {
    if (!editingActivity) return

    try {
      setLoading(true)
      setProcessingActivities(prev => prev.map(activity => 
        activity.id === editingActivity.id ? editingActivity : activity
      ))
      
      setEditingActivity(null)
      toast({
        title: 'Success',
        description: 'Processing activity updated successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update processing activity',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'outline',
      completed: 'default',
      rejected: 'destructive'
    } as const

    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  const getRequestTypeIcon = (type: DataSubject['requestType']) => {
    const icons = {
      access: <Eye className="h-4 w-4" />,
      deletion: <Trash2 className="h-4 w-4" />,
      portability: <Download className="h-4 w-4" />,
      rectification: <Edit3 className="h-4 w-4" />
    }
    return icons[type]
  }

  const getRequestTypeLabel = (type: DataSubject['requestType']) => {
    const labels = {
      access: 'Data Access',
      deletion: 'Data Deletion',
      portability: 'Data Portability',
      rectification: 'Data Rectification'
    }
    return labels[type]
  }

  if (loading && dataSubjects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">GDPR Compliance</h2>
          <p className="text-gray-600">Manage data subject rights, consent, and data processing activities</p>
        </div>
        <Button onClick={() => setShowRequestForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Submit Request
        </Button>
      </div>

      {/* GDPR Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataSubjects.filter(r => r.status === 'pending' || r.status === 'processing').length}</div>
            <p className="text-xs text-muted-foreground">
              Pending and processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consent Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((consentRecords.filter(r => r.granted).length / consentRecords.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              of users consent to processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Activities</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingActivities.filter(a => a.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              Active data processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">95/100</div>
            <p className="text-xs text-muted-foreground">
              GDPR compliance rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Data Requests</TabsTrigger>
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
          <TabsTrigger value="processing">Data Processing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Data Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Data Requests
                </CardTitle>
                <CardDescription>Latest data subject requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dataSubjects.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getRequestTypeIcon(request.requestType)}
                        <div>
                          <p className="text-sm font-medium">{request.name}</p>
                          <p className="text-xs text-gray-600">{getRequestTypeLabel(request.requestType)}</p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Consent Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Consent Overview
                </CardTitle>
                <CardDescription>Current consent status by purpose</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(consentRecords.map(r => r.purpose))).map((purpose) => {
                    const purposeRecords = consentRecords.filter(r => r.purpose === purpose)
                    const consentRate = (purposeRecords.filter(r => r.granted).length / purposeRecords.length) * 100
                    return (
                      <div key={purpose} className="flex items-center justify-between">
                        <span className="text-sm">{purpose}</span>
                        <Badge variant={consentRate > 50 ? 'default' : 'secondary'}>
                          {Math.round(consentRate)}%
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {/* Submit Request Form */}
          {showRequestForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Submit Data Subject Request
                </CardTitle>
                <CardDescription>Submit a request for data access, deletion, portability, or rectification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requestEmail">Email Address</Label>
                    <Input
                      id="requestEmail"
                      type="email"
                      value={newRequest.email}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="requestName">Full Name</Label>
                    <Input
                      id="requestName"
                      value={newRequest.name}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="requestType">Request Type</Label>
                  <Select value={newRequest.requestType} onValueChange={(value: DataSubject['requestType']) => setNewRequest(prev => ({ ...prev, requestType: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="access">Data Access</SelectItem>
                      <SelectItem value="deletion">Data Deletion</SelectItem>
                      <SelectItem value="portability">Data Portability</SelectItem>
                      <SelectItem value="rectification">Data Rectification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="requestNotes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="requestNotes"
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional information about your request..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button onClick={submitDataRequest} disabled={loading} className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Submit Request
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRequestForm(false)
                      setNewRequest({ email: '', name: '', requestType: 'access', notes: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Requests List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Subject Requests
              </CardTitle>
              <CardDescription>Manage and track data subject requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataSubjects.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getRequestTypeIcon(request.requestType)}
                        <div>
                          <h4 className="font-medium">{request.name}</h4>
                          <p className="text-sm text-gray-600">{request.email}</p>
                          <p className="text-sm text-gray-600">{getRequestTypeLabel(request.requestType)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(request.status)}
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                        </p>
                        {request.completedAt && (
                          <p className="text-xs text-gray-500">
                            Completed: {new Date(request.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {request.notes && (
                      <div className="p-3 bg-gray-50 rounded border">
                        <p className="text-sm text-gray-700">{request.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consent Management Tab */}
        <TabsContent value="consent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Consent Management
              </CardTitle>
              <CardDescription>Track and manage user consent for data processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consentRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${record.granted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <h4 className="font-medium">{record.purpose}</h4>
                        <p className="text-sm text-gray-600">User ID: {record.userId}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(record.timestamp).toLocaleDateString()} at {new Date(record.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={record.granted ? 'default' : 'secondary'}>
                        {record.granted ? 'Consented' : 'Declined'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{record.ipAddress}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Processing Tab */}
        <TabsContent value="processing" className="space-y-6">
          {/* Create Processing Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Data Processing Activity
              </CardTitle>
              <CardDescription>Define new data processing activities and their legal basis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activityName">Activity Name</Label>
                  <Input
                    id="activityName"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Customer Analytics"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="activityPurpose">Purpose</Label>
                  <Select value={newActivity.purpose} onValueChange={(value) => setNewActivity(prev => ({ ...prev, purpose: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {PURPOSES.map((purpose) => (
                        <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="legalBasis">Legal Basis</Label>
                  <Select value={newActivity.legalBasis} onValueChange={(value) => setNewActivity(prev => ({ ...prev, legalBasis: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select legal basis" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEGAL_BASES.map((basis) => (
                        <SelectItem key={basis} value={basis}>{basis}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="retentionPeriod">Retention Period</Label>
                  <Input
                    id="retentionPeriod"
                    value={newActivity.retentionPeriod}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, retentionPeriod: e.target.value }))}
                    placeholder="e.g., 2 years or until deletion"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Data Categories</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DATA_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={newActivity.dataCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewActivity(prev => ({
                              ...prev,
                              dataCategories: [...prev.dataCategories, category]
                            }))
                          } else {
                            setNewActivity(prev => ({
                              ...prev,
                              dataCategories: prev.dataCategories.filter(c => c !== category)
                            }))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="thirdPartySharing"
                  checked={newActivity.thirdPartySharing}
                  onCheckedChange={(checked) => setNewActivity(prev => ({ ...prev, thirdPartySharing: checked }))}
                />
                <Label htmlFor="thirdPartySharing" className="text-base font-medium">
                  Third-party data sharing
                </Label>
              </div>

              {newActivity.thirdPartySharing && (
                <div>
                  <Label htmlFor="thirdParties">Third Parties</Label>
                  <Input
                    id="thirdParties"
                    value={newActivity.thirdParties.join(', ')}
                    onChange={(e) => setNewActivity(prev => ({ 
                      ...prev, 
                      thirdParties: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    }))}
                    placeholder="e.g., Analytics Provider, Email Service"
                    className="mt-1"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <Button onClick={createProcessingActivity} disabled={loading} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Activity
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setNewActivity({
                    name: '',
                    purpose: '',
                    legalBasis: '',
                    dataCategories: [],
                    retentionPeriod: '',
                    thirdPartySharing: false,
                    thirdParties: []
                  })}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Processing Activities List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Processing Activities
              </CardTitle>
              <CardDescription>Current data processing activities and their compliance status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingActivities.map((activity) => (
                  <div key={activity.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{activity.name}</h4>
                        <p className="text-sm text-gray-600">{activity.purpose}</p>
                        <p className="text-sm text-gray-600">Legal Basis: {activity.legalBasis}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={activity.status === 'active' ? 'default' : 'secondary'}>
                          {activity.status}
                        </Badge>
                        <Button
                          onClick={() => setEditingActivity(activity)}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Data Categories:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {activity.dataCategories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Retention: {activity.retentionPeriod}</p>
                        <p className="font-medium mt-2">
                          Third-party Sharing: {activity.thirdPartySharing ? 'Yes' : 'No'}
                        </p>
                        {activity.thirdPartySharing && activity.thirdParties.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-600">Parties: {activity.thirdParties.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
