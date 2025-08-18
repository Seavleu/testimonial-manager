'use client'

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
  ArrowRight,
  Play,
  Sparkles,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const benefitsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const floatingElementsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Hero animations
    const heroTl = gsap.timeline()
    
    heroTl
      .from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      })
      .from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.5')
      .from('.hero-buttons', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.3')
      .from('.floating-element', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      }, '-=0.4')

    // Floating animation
    gsap.to('.floating-element', {
      y: -20,
      duration: 3,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.2
    })

    // Features section animations
    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: featuresRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      },
      y: 100,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out'
    })

    // Benefits section animations
    gsap.from('.benefit-item', {
      scrollTrigger: {
        trigger: benefitsRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      },
      x: -50,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    })

    // CTA section animations
    gsap.from('.cta-content', {
      scrollTrigger: {
        trigger: ctaRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      },
      scale: 0.8,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    })

    // Parallax effect for background elements
    gsap.to('.parallax-bg', {
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      },
      y: (i, target) => -target.offsetHeight * 0.5,
      ease: 'none'
    })

    return () => {
      // Cleanup
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Header />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-32 px-4 overflow-hidden">
        {/* Background Elements */}
        <div ref={floatingElementsRef} className="absolute inset-0 overflow-hidden">
          <div className="floating-element absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-xl"></div>
          <div className="floating-element absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl"></div>
          <div className="floating-element absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20 blur-xl"></div>
          <div className="floating-element absolute bottom-40 right-1/3 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20 blur-xl"></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full shadow-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="hero-title text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Collect & Display
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block">
              Customer Testimonials
            </span>
            <span className="text-4xl md:text-5xl text-gray-700 block mt-2">
              Effortlessly
            </span>
          </h1>
          
          <p className="hero-subtitle text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Build trust and credibility with authentic customer testimonials. 
            <span className="font-semibold text-gray-800">Simple collection, easy management, and beautiful display widgets.</span>
          </p>
          
          <div className="hero-buttons flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/login?mode=signup">
              <Button size="lg" className="px-10 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                Start Free Trial
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="px-10 py-6 text-lg border-2 hover:bg-gray-50 transform hover:scale-105 transition-all duration-300">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">Testimonials Collected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Manage Testimonials</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, powerful tools to collect, manage, and display customer feedback with beautiful animations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="feature-card text-center border-0 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Easy Collection</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Share a simple link with customers to collect text and video testimonials instantly
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="feature-card text-center border-0 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-6">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Review & Approve</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Review all submissions and approve only the testimonials you want to display
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="feature-card text-center border-0 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Display Anywhere</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Use our embeddable widget to display testimonials on your website instantly
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="bg-gradient-to-br from-gray-50 to-blue-50 py-32 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Why Testimonials Matter for
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Your Business</span>
              </h2>
              <div className="space-y-6">
                <div className="benefit-item flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Build Trust & Credibility</h3>
                    <p className="text-gray-600 text-lg">92% of consumers trust recommendations from other customers</p>
                  </div>
                </div>
                <div className="benefit-item flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-full flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Increase Conversions</h3>
                    <p className="text-gray-600 text-lg">Testimonials can increase conversion rates by up to 34%</p>
                  </div>
                </div>
                <div className="benefit-item flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full flex-shrink-0">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Improve SEO</h3>
                    <p className="text-gray-600 text-lg">Fresh customer content helps improve search rankings</p>
                  </div>
                </div>
                <div className="benefit-item flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full flex-shrink-0">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Save Time</h3>
                    <p className="text-gray-600 text-lg">Automate testimonial collection instead of chasing customers</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-10 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <BarChart3 className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                <p className="text-gray-600 text-lg">Join hundreds of businesses already using TestimonialFlow</p>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                  <span className="font-semibold text-lg">Free Plan</span>
                  <span className="text-green-600 font-bold text-xl">$0/month</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <span className="font-semibold text-lg">Pro Plan</span>
                  <span className="text-blue-600 font-bold text-xl">$4.99/month</span>
                </div>
                <Link href="/login?mode=signup" className="block">
                  <Button className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                    Start Your Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-32 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            See It In
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Action</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Watch how easy it is to collect and display testimonials with our platform
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-xl">
              <Monitor className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Desktop Widget</h3>
              <p className="text-gray-600">Beautiful responsive widgets for desktop websites</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-xl">
              <Smartphone className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Optimized</h3>
              <p className="text-gray-600">Perfect display on mobile devices and tablets</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-xl">
              <Globe className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Any Platform</h3>
              <p className="text-gray-600">Works on any website, CMS, or platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-32 px-4 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="cta-content">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Collecting
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Testimonials?
              </span>
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Join thousands of businesses building trust with customer testimonials. 
              Start your free trial today and see the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/login?mode=signup">
                <Button size="lg" variant="secondary" className="px-12 py-6 text-lg bg-white text-blue-600 hover:bg-gray-100 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  Get Started Free
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/widget-test">
                <Button size="lg" variant="outline" className="px-12 py-6 text-lg border-2 border-white text-white hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300">
                  Try Widget Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                <Star className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">TestimonialFlow</span>
            </div>
            <div className="text-gray-400 text-lg">
              © 2025 TestimonialFlow. Built for MicroAcquire.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

