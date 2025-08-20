import { GDPRCompliance } from '@/components/compliance/gdpr-compliance'
import { AuditTrail } from '@/components/compliance/audit-trail'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, FileText, Activity, CheckCircle, AlertTriangle, Clock, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CompliancePageProps {
  params: { userId: string }
}

export default function CompliancePage({ params }: CompliancePageProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GDPR Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">95/100</div>
            <p className="text-xs text-muted-foreground">
              Excellent compliance score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3</div>
            <p className="text-xs text-muted-foreground">
              active requests pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              events in last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consent Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">67%</div>
            <p className="text-xs text-muted-foreground">
              of users consent to processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Status Overview
          </CardTitle>
          <CardDescription>Current compliance posture and regulatory requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Regulatory Compliance</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">GDPR Compliance</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Badge variant="outline" className="text-green-600 border-green-300">Compliant</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CCPA Compliance</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Badge variant="outline" className="text-green-600 border-green-300">Compliant</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Retention Policies</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Badge variant="outline" className="text-green-600 border-green-300">Active</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Consent Management</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Badge variant="outline" className="text-green-600 border-green-300">Configured</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recent Compliance Events</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Data Export Request Completed</p>
                    <p className="text-xs text-green-700">GDPR data export for John Doe completed within SLA</p>
                    <p className="text-xs text-green-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Activity className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Processing Activity Updated</p>
                    <p className="text-xs text-blue-700">Marketing analytics processing activity reviewed and updated</p>
                    <p className="text-xs text-blue-600">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Data Deletion Scheduled</p>
                    <p className="text-xs text-yellow-700">Jane Smith's data deletion scheduled for completion within 30 days</p>
                    <p className="text-xs text-yellow-600">6 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Compliance Management Tabs */}
      <Tabs defaultValue="gdpr" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gdpr">GDPR Compliance</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="gdpr" className="space-y-6">
          <GDPRCompliance userId={params.userId} />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditTrail userId={params.userId} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compliance Report Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Compliance Report Templates
                </CardTitle>
                <CardDescription>Pre-built reports for regulatory compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">GDPR Compliance Report</span>
                      <Badge variant="outline">Monthly</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Comprehensive report covering data processing activities, consent management, and data subject rights
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Generate Report
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Data Processing Inventory</span>
                      <Badge variant="outline">Quarterly</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Detailed inventory of all data processing activities with legal basis and retention periods
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Generate Report
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Data Breach Assessment</span>
                      <Badge variant="outline">On-Demand</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Assessment of potential data breaches and incident response readiness
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Generate Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Compliance Metrics
                </CardTitle>
                <CardDescription>Key performance indicators for compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Data Subject Request Response Time</h4>
                    <div className="text-2xl font-bold text-green-600">2.3 days</div>
                    <p className="text-xs text-gray-600">Average response time (SLA: 30 days)</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Consent Management Efficiency</h4>
                    <div className="text-2xl font-bold text-blue-600">94%</div>
                    <p className="text-xs text-gray-600">Consent records properly maintained</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Data Processing Compliance</h4>
                    <div className="text-2xl font-bold text-green-600">98%</div>
                    <p className="text-xs text-gray-600">Processing activities with valid legal basis</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Audit Trail Completeness</h4>
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <p className="text-xs text-gray-600">All system activities logged</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Compliance Calendar
              </CardTitle>
              <CardDescription>Upcoming compliance deadlines and review dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Monthly GDPR Review</span>
                      <Badge variant="outline">Due Soon</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Review data processing activities and consent records</p>
                    <p className="text-xs text-gray-500 mt-2">Due: February 15, 2024</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Quarterly Data Inventory</span>
                      <Badge variant="secondary">Upcoming</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Update data processing inventory and legal basis</p>
                    <p className="text-xs text-gray-500 mt-2">Due: March 31, 2024</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Annual Compliance Assessment</span>
                      <Badge variant="secondary">Upcoming</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Comprehensive compliance review and gap analysis</p>
                    <p className="text-xs text-gray-500 mt-2">Due: December 31, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
