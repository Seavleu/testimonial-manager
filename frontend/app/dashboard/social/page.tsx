import { SocialMediaIntegration } from '@/components/social/social-media-integration'

interface SocialPageProps {
  params: { userId: string }
}

export default function SocialPage({ params }: SocialPageProps) {
  return (
    <div className="container mx-auto py-6">
      <SocialMediaIntegration userId={params.userId} />
    </div>
  )
}
