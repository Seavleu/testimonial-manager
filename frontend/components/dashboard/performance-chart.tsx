'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Target, CheckCircle, Clock } from 'lucide-react'

interface PerformanceChartProps {
  approvalRate: number
  averageResponseTime: number
  totalTestimonials: number
  approvedTestimonials: number
  pendingTestimonials: number
  loading?: boolean
  className?: string
}

export function PerformanceChart({
  approvalRate,
  averageResponseTime,
  totalTestimonials,
  approvedTestimonials,
  pendingTestimonials,
  loading = false,
  className = ''
}: PerformanceChartProps) {
  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle>
            <span className="h-6 bg-gray-200 rounded animate-pulse w-40 block"></span>
          </CardTitle>
          <CardDescription>
            <span className="h-4 bg-gray-200 rounded animate-pulse w-56 block"></span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for pie chart
  const pieData = [
    { name: 'Approved', value: approvedTestimonials, color: '#10b981' },
    { name: 'Pending', value: pendingTestimonials, color: '#f59e0b' }
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-blue-600">{`Count: ${payload[0].value}`}</p>
          <p className="text-gray-600">{`Percentage: ${((payload[0].value / totalTestimonials) * 100).toFixed(1)}%`}</p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => (
    <div className="flex justify-center space-x-4 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  )

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>Approval rate, response time, and distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-green-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${approvalRate}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold">{Math.round(approvalRate)}%</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-muted-foreground">Approval Rate</p>
              </div>
              <p className="text-xl font-semibold">{Math.round(approvalRate)}%</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Response Time</p>
              <p className="text-xl font-semibold">{Math.round(averageResponseTime)} days</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center">
              <Target className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Distribution</p>
              <p className="text-xl font-semibold">
                {approvedTestimonials}/{totalTestimonials} approved
              </p>
              <p className="text-xs text-muted-foreground">{pendingTestimonials} pending</p>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Testimonial Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
