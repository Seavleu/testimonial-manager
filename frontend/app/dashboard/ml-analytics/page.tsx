import { SentimentAnalysis } from '@/components/analytics/sentiment-analysis'
import { AdvancedVisualizations } from '@/components/analytics/advanced-visualizations'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, TrendingUp, Target, Zap, Activity, BarChart3, Lightbulb, AlertTriangle, CheckCircle, Clock, Users, Star } from 'lucide-react'

interface MLAnalyticsPageProps {
  params: { userId: string }
}

export default function MLAnalyticsPage({ params }: MLAnalyticsPageProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* ML Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Models Active</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">8</div>
            <p className="text-xs text-muted-foreground">
              models running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <p className="text-xs text-muted-foreground">
              average accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights Generated</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">156</div>
            <p className="text-xs text-muted-foreground">
              this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Processed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4K</div>
            <p className="text-xs text-muted-foreground">
              testimonials analyzed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ML Capabilities Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Machine Learning Capabilities
          </CardTitle>
          <CardDescription>Overview of AI-powered analytics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Active ML Models</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sentiment Analysis</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Badge variant="outline" className="text-green-600 border-green-300">Active</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Content Categorization</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Badge variant="outline" className="text-green-600 border-green-300">Active</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quality Scoring</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Badge variant="outline" className="text-green-600 border-green-300">Active</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trend Prediction</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300">Training</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recent ML Insights</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Sentiment Model Improved</p>
                    <p className="text-xs text-green-700">Accuracy increased from 89% to 94% after retraining</p>
                    <p className="text-xs text-green-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">New Pattern Detected</p>
                    <p className="text-xs text-blue-700">Customer satisfaction peaks on Tuesdays and Thursdays</p>
                    <p className="text-xs text-blue-600">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Anomaly Detected</p>
                    <p className="text-xs text-yellow-700">Unusual spike in negative feedback detected</p>
                    <p className="text-xs text-yellow-600">6 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main ML Analytics Tabs */}
      <Tabs defaultValue="sentiment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="categorization">Content Categorization</TabsTrigger>
          <TabsTrigger value="prediction">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="visualizations">Advanced Viz</TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-6">
          <SentimentAnalysis userId={params.userId} />
        </TabsContent>

        <TabsContent value="categorization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Content Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Content Categories
                </CardTitle>
                <CardDescription>AI-powered content categorization and classification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Service Quality</span>
                      <Badge variant="outline">Primary Category</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Testimonials related to customer service, support quality, and service delivery
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Confidence: 96%</span>
                      <span>Count: 45</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Product Features</span>
                      <Badge variant="secondary">Secondary Category</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Feedback about product functionality, features, and capabilities
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Confidence: 89%</span>
                      <span>Count: 32</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Value & Pricing</span>
                      <Badge variant="secondary">Secondary Category</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Comments about pricing, value for money, and cost-effectiveness
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Confidence: 92%</span>
                      <span>Count: 28</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categorization Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Categorization Metrics
                </CardTitle>
                <CardDescription>Performance metrics for content categorization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Overall Accuracy</h4>
                    <div className="text-2xl font-bold text-green-600">91.5%</div>
                    <p className="text-xs text-gray-600">Based on 2,400 categorized testimonials</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Processing Speed</h4>
                    <div className="text-2xl font-bold text-blue-600">0.8s</div>
                    <p className="text-xs text-gray-600">Average time per testimonial</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Categories Identified</h4>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-gray-600">Unique content categories</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Confidence Threshold</h4>
                    <div className="text-2xl font-bold text-yellow-600">85%</div>
                    <p className="text-xs text-gray-600">Minimum confidence for auto-categorization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prediction" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trend Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trend Predictions
                </CardTitle>
                <CardDescription>AI-powered trend forecasting and predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Customer Satisfaction Trend</span>
                      <Badge variant="outline" className="text-green-600 border-green-300">Increasing</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Predicted to increase by 8% over the next 30 days
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Confidence: 87%</span>
                      <span>Trend: ↗️</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Testimonial Volume</span>
                      <Badge variant="outline" className="text-blue-600 border-blue-300">Stable</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Expected to remain consistent with current levels
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Confidence: 92%</span>
                      <span>Trend: →</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Negative Feedback Risk</span>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300">Low</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Low risk of increased negative feedback in next 2 weeks
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Confidence: 78%</span>
                      <span>Risk: 🟢</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prediction Models */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Prediction Models
                </CardTitle>
                <CardDescription>Active prediction models and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Sentiment Trend Model</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Accuracy:</span>
                        <span className="font-medium">89.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>2 days ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant="outline" className="text-green-600 border-green-300">Active</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Volume Prediction Model</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Accuracy:</span>
                        <span className="font-medium">94.7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>1 day ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant="outline" className="text-green-600 border-green-300">Active</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Risk Assessment Model</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Accuracy:</span>
                        <span className="font-medium">82.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>3 days ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">Training</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Insights Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Insights Dashboard
                </CardTitle>
                <CardDescription>Comprehensive view of AI-generated insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Customer Experience Insights</span>
                      <Badge variant="outline">High Priority</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Service quality is the primary driver of positive sentiment (78% correlation)
                    </p>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Recommendation:</span>
                      <span className="text-sm">Focus marketing efforts on service quality</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Product Improvement</span>
                      <Badge variant="secondary">Medium Priority</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Interface usability mentioned in 45% of neutral/negative feedback
                    </p>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Action:</span>
                      <span className="text-sm">Schedule UX review session</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Timing Optimization</span>
                      <Badge variant="secondary">Low Priority</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Customer satisfaction peaks on Tuesdays and Thursdays
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Strategy:</span>
                      <span className="text-sm">Schedule important interactions on peak days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insight Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Insight Analytics
                </CardTitle>
                <CardDescription>Metrics and performance of AI insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Insights Generated</h4>
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <p className="text-xs text-gray-600">This month</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Actionable Insights</h4>
                    <div className="text-2xl font-bold text-green-600">89%</div>
                    <p className="text-xs text-gray-600">Of total insights</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Average Confidence</h4>
                    <div className="text-2xl font-bold text-yellow-600">87.3%</div>
                    <p className="text-xs text-gray-600">Across all insights</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Response Time</h4>
                    <div className="text-2xl font-bold">2.1s</div>
                    <p className="text-xs text-gray-600">Average generation time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visualizations" className="space-y-6">
          <AdvancedVisualizations userId={params.userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
