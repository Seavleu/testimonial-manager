import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Star, 
  MessageSquare, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Collect & Display Customer
            <span className="text-blue-600 block">Testimonials Effortlessly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Build trust and credibility with authentic customer testimonials. 
            Simple collection, easy management, and beautiful display widgets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?mode=signup">
              <Button size="lg" className="px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="px-8">
                See Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Testimonials
            </h2>
            <p className="text-xl text-gray-600">
              Simple, powerful tools to collect, manage, and display customer feedback
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Easy Collection</CardTitle>
                <CardDescription>
                  Share a simple link with customers to collect text and video testimonials
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Review & Approve</CardTitle>
                <CardDescription>
                  Review all submissions and approve only the testimonials you want to display
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Display Anywhere</CardTitle>
                <CardDescription>
                  Use our embeddable widget to display testimonials on your website instantly
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Testimonials Matter for Your Business
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Build Trust & Credibility</h3>
                    <p className="text-gray-600">92% of consumers trust recommendations from other customers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Increase Conversions</h3>
                    <p className="text-gray-600">Testimonials can increase conversion rates by up to 34%</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Improve SEO</h3>
                    <p className="text-gray-600">Fresh customer content helps improve search rankings</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Save Time</h3>
                    <p className="text-gray-600">Automate testimonial collection instead of chasing customers</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-center mb-6">
                <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">Ready to Get Started?</h3>
                <p className="text-gray-600">Join hundreds of businesses already using TestimonialFlow</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Free Plan</span>
                  <span className="text-green-600 font-semibold">$0/month</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="font-medium">Pro Plan</span>
                  <span className="text-blue-600 font-semibold">$4.99/month</span>
                </div>
                <Link href="/login?mode=signup" className="block">
                  <Button className="w-full">Start Your Free Trial</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20 px-4 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Collecting Testimonials?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses building trust with customer testimonials
          </p>
          <Link href="/login?mode=signup">
            <Button size="lg" variant="secondary" className="px-8">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Star className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">TestimonialFlow</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 TestimonialFlow. Built for MicroAcquire.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const metadata = {
  title: 'TestimonialFlow - Collect & Display Customer Testimonials',
  description: 'Build trust and credibility with authentic customer testimonials. Simple collection, easy management, and beautiful display widgets.',
  keywords: 'testimonials, customer feedback, social proof, reviews, trust, credibility',
}