import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TestimonialFlow - Collect & Display Customer Testimonials',
  description: 'Build trust and credibility with authentic customer testimonials. Simple collection, easy management, and beautiful display widgets for your business.',
  keywords: 'testimonials, customer feedback, social proof, reviews, trust, credibility, business growth',
  authors: [{ name: 'TestimonialFlow' }],
  creator: 'TestimonialFlow',
  publisher: 'TestimonialFlow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://testimonialflow.com',
    title: 'TestimonialFlow - Collect & Display Customer Testimonials',
    description: 'Build trust and credibility with authentic customer testimonials. Simple collection, easy management, and beautiful display widgets.',
    siteName: 'TestimonialFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TestimonialFlow - Collect & Display Customer Testimonials',
    description: 'Build trust and credibility with authentic customer testimonials. Simple collection, easy management, and beautiful display widgets.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://testimonialflow.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}