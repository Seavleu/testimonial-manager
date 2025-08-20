'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Shield,
  Smartphone,
  Mail,
  Key,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'
import QRCode from 'qrcode'

interface MFAMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  verified: boolean
  setupComplete: boolean
}

interface MFASetupProps {
  userId: string
}

const MFA_METHODS: MFAMethod[] = [
  {
    id: 'totp',
    name: 'Authenticator App',
    description: 'Use apps like Google Authenticator, Authy, or Microsoft Authenticator',
    icon: <Key className="h-5 w-5" />,
    enabled: false,
    verified: false,
    setupComplete: false
  },
  {
    id: 'sms',
    name: 'SMS Verification',
    description: 'Receive verification codes via text message',
    icon: <Smartphone className="h-5 w-5" />,
    enabled: false,
    verified: false,
    setupComplete: false
  },
  {
    id: 'email',
    name: 'Email Verification',
    description: 'Receive verification codes via email',
    icon: <Mail className="h-5 w-5" />,
    enabled: false,
    verified: false,
    setupComplete: false
  }
]

export function MFASetup({ userId }: MFASetupProps) {
  const [methods, setMethods] = useState<MFAMethod[]>(MFA_METHODS)
  const [activeMethod, setActiveMethod] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string>('')
  const [secretKey, setSecretKey] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(false)
  const [setupStep, setSetupStep] = useState<'select' | 'setup' | 'verify'>('select')
  const { toast } = useToast()

  useEffect(() => {
    if (userId) {
      loadMFASettings()
    }
  }, [userId])

  const loadMFASettings = async () => {
    try {
      setLoading(true)
      // In production, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      
      // Mock data - in production, fetch actual MFA settings
      const mockMethods = methods.map(method => ({
        ...method,
        enabled: Math.random() > 0.5,
        verified: Math.random() > 0.7,
        setupComplete: Math.random() > 0.6
      }))
      
      setMethods(mockMethods)
    } catch (error) {
      console.error('Failed to load MFA settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load MFA settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const generateTOTPSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return secret
  }

  const generateQRCode = async (secret: string, email: string) => {
    try {
      const otpauth = `otpauth://totp/${encodeURIComponent(email)}?secret=${secret}&issuer=TestimonialMS&algorithm=SHA1&digits=6&period=30`
      const qrCodeDataURL = await QRCode.toDataURL(otpauth)
      setQrCode(qrCodeDataURL)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const setupMethod = async (methodId: string) => {
    setActiveMethod(methodId)
    setSetupStep('setup')
    
    if (methodId === 'totp') {
      const secret = generateTOTPSecret()
      setSecretKey(secret)
      await generateQRCode(secret, 'user@example.com')
    }
  }

  const verifyMethod = async () => {
    if (!activeMethod || !verificationCode.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter the verification code',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      // In production, this would verify with your API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate verification delay
      
      // Update method status
      setMethods(prev => prev.map(method => 
        method.id === activeMethod 
          ? { ...method, enabled: true, verified: true, setupComplete: true }
          : method
      ))
      
      setSetupStep('select')
      setActiveMethod(null)
      setVerificationCode('')
      
      toast({
        title: 'Success',
        description: `${methods.find(m => m.id === activeMethod)?.name} has been successfully enabled`
      })
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Invalid verification code. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleMethod = async (methodId: string, enabled: boolean) => {
    try {
      setLoading(true)
      // In production, this would update via your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      
      setMethods(prev => prev.map(method => 
        method.id === methodId 
          ? { ...method, enabled, verified: enabled ? method.verified : false }
          : method
      ))
      
      toast({
        title: 'Success',
        description: `${methods.find(m => m.id === methodId)?.name} has been ${enabled ? 'enabled' : 'disabled'}`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update MFA method',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: 'Secret key copied to clipboard'
    })
  }

  const downloadBackupCodes = () => {
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    )
    
    const content = `Backup Codes for TestimonialMS\n\n${backupCodes.join('\n')}\n\nStore these codes in a safe place. Each code can only be used once.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getMethodStatus = (method: MFAMethod) => {
    if (method.enabled && method.verified) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    } else if (method.enabled && !method.verified) {
      return <Badge variant="secondary">Pending</Badge>
    } else {
      return <Badge variant="outline">Inactive</Badge>
    }
  }

  if (loading && methods.every(m => !m.enabled)) {
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
          <h2 className="text-2xl font-bold text-gray-900">Multi-Factor Authentication</h2>
          <p className="text-gray-600">Enhance your account security with multiple verification methods</p>
        </div>
        <Button variant="outline" onClick={downloadBackupCodes} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Backup Codes
        </Button>
      </div>

      {/* MFA Methods Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map((method) => (
          <Card key={method.id} className={`${method.enabled ? 'border-green-200 bg-green-50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {method.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <CardDescription className="text-sm">{method.description}</CardDescription>
                  </div>
                </div>
                {getMethodStatus(method)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor={`mfa-${method.id}`} className="text-sm font-medium">
                  Enable {method.name}
                </Label>
                <Switch
                  id={`mfa-${method.id}`}
                  checked={method.enabled}
                  onCheckedChange={(enabled) => toggleMethod(method.id, enabled)}
                  disabled={loading}
                />
              </div>
              
              {method.enabled && !method.setupComplete && (
                <Button 
                  onClick={() => setupMethod(method.id)}
                  size="sm"
                  className="w-full"
                >
                  Complete Setup
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Setup/Verification Modal */}
      {activeMethod && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {methods.find(m => m.id === activeMethod)?.icon}
              Setup {methods.find(m => m.id === activeMethod)?.name}
            </CardTitle>
            <CardDescription>
              Follow the steps below to complete your MFA setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {setupStep === 'setup' && (
              <>
                {activeMethod === 'totp' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h4 className="font-medium mb-2">Scan QR Code</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Use your authenticator app to scan this QR code
                      </p>
                      {qrCode && (
                        <div className="inline-block p-4 bg-white border rounded-lg">
                          <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="secretKey" className="text-sm font-medium">
                        Manual Entry (if QR code doesn't work)
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          id="secretKey"
                          value={showSecret ? secretKey : '•'.repeat(secretKey.length)}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(secretKey)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeMethod === 'sms' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => setSetupStep('verify')}
                      disabled={!phoneNumber.trim()}
                      className="w-full"
                    >
                      Send Verification Code
                    </Button>
                  </div>
                )}

                {activeMethod === 'email' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => setSetupStep('verify')}
                      disabled={!email.trim()}
                      className="w-full"
                    >
                      Send Verification Code
                    </Button>
                  </div>
                )}

                {activeMethod === 'totp' && (
                  <Button 
                    onClick={() => setSetupStep('verify')}
                    className="w-full"
                  >
                    Continue to Verification
                  </Button>
                )}
              </>
            )}

            {setupStep === 'verify' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="verificationCode" className="text-sm font-medium">
                    Verification Code
                  </Label>
                  <Input
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="mt-1 text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={verifyMethod}
                    disabled={loading || !verificationCode.trim()}
                    className="flex-1"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Verify & Enable'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSetupStep('setup')}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setActiveMethod(null)
                  setSetupStep('select')
                  setVerificationCode('')
                  setQrCode('')
                  setSecretKey('')
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Enable at least two MFA methods for redundancy</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Store backup codes in a secure location</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Use authenticator apps instead of SMS when possible</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>Never share your verification codes with anyone</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>Keep your backup codes separate from your devices</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>Regularly review and update your MFA settings</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
