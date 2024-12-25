'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getCustomerEmail, initiateDocuSignAuth, createDocuSignEnvelopeAndGetSigningUrl } from '../actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from "@/components/ui/use-toast"
import Cookies from 'js-cookie'
import { DocuSignAuthData } from '@/app/types/docusign'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'loading' | 'email' | 'name' | 'docusign_email' | 'docusign_auth' | 'nda' | 'complete'>('loading')
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState<string>('')
  const [docuSignEmail, setDocuSignEmail] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    const initializePage = async () => {
      const docusignAuthCookie = Cookies.get('docusign_auth')
      const sessionId = searchParams.get('session_id')
      const docusignError = searchParams.get('docusign_error')

      if (docusignError) {
        handleDocuSignError(decodeURIComponent(docusignError))
        return
      }

      if (docusignAuthCookie) {
        const docusignAuth: DocuSignAuthData = JSON.parse(docusignAuthCookie)
        if (docusignAuth.userInfo.email) {
          setDocuSignEmail(docusignAuth.userInfo.email)
          if (customerName) {
            setStep('nda')
          } else {
            setStep('name')
          }
          return
        }
      }

      if (sessionId) {
        try {
          const email = await getCustomerEmail(sessionId)
          if (email) {
            setCustomerEmail(email)
            setDocuSignEmail(email) // Set DocuSign email to customer email initially
            setStep('name')
          } else {
            setStep('email')
          }
        } catch (error) {
          console.error('Error fetching customer email:', error)
          toast({
            title: "Error",
            description: "Failed to retrieve your information. Please contact support.",
            variant: "destructive",
          })
          setStep('email')
        }
      } else {
        setStep('email')
      }
    }

    initializePage()
  }, [searchParams, toast, customerName])

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
    setCustomerEmail(email)
    setDocuSignEmail(email)
    setStep('name')
  }

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value
    setCustomerName(name)
    setStep('docusign_email')
  }

  const handleDocuSignEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = (e.currentTarget.elements.namedItem('docusign_email') as HTMLInputElement).value
    setDocuSignEmail(email)
    setStep('docusign_auth')
  }

  const handleDocuSignAuth = async () => {
    try {
      const authUrl = await initiateDocuSignAuth()
      window.location.href = authUrl
    } catch (error) {
      console.error('Error initiating DocuSign auth:', error)
      toast({
        title: "Error",
        description: "Failed to initiate DocuSign authentication. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDocuSignError = (error: string) => {
    let description = 'An unexpected error occurred during DocuSign authentication. Please try again.'

    if (error.includes('Invalid or expired authorization code')) {
      description = 'The DocuSign authorization code has expired. Please try authenticating again.'
    } else if (error.includes('Invalid DocuSign API credentials')) {
      description = 'There\'s an issue with our DocuSign integration. Please contact support.'
    }

    toast({
      title: "Authentication Error",
      description: description,
      variant: "destructive",
    })

    setStep('docusign_auth')
  }

  const handleNDAComplete = async () => {
    if (!docuSignEmail || !customerName) {
      toast({
        title: "Error",
        description: "Customer information is incomplete. Please contact support.",
        variant: "destructive",
      })
      return
    }

    try {
      const signingUrl = await createDocuSignEnvelopeAndGetSigningUrl(docuSignEmail, customerName)
      window.location.href = signingUrl
    } catch (error) {
      console.error('Error creating DocuSign envelope:', error)
      toast({
        title: "Error",
        description: "Failed to create NDA. Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <Card className="max-w-md w-full p-6">
        {step === 'loading' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            <p className="text-gray-600">Please wait while we process your information.</p>
          </div>
        )}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <h1 className="text-2xl font-bold mb-4">Confirm Your Email</h1>
            <p className="text-gray-600 mb-4">We couldn't retrieve your email. Please enter it below:</p>
            <input
              type="email"
              name="email"
              required
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="your@email.com"
            />
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        )}
        {step === 'name' && (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <h1 className="text-2xl font-bold mb-4">Your Name</h1>
            <p className="text-gray-600 mb-4">Please enter your full name:</p>
            <input
              type="text"
              name="name"
              required
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="John Doe"
            />
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        )}
        {step === 'docusign_email' && (
          <form onSubmit={handleDocuSignEmailSubmit} className="space-y-4">
            <h1 className="text-2xl font-bold mb-4">DocuSign Email</h1>
            <p className="text-gray-600 mb-4">Please enter the email you'd like to use for signing the NDA:</p>
            <input
              type="email"
              name="docusign_email"
              required
              defaultValue={docuSignEmail}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="your@email.com"
            />
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        )}
        {step === 'docusign_auth' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">DocuSign Authentication</h1>
            <p className="text-gray-600 mb-6">
              Please authenticate with DocuSign to proceed with signing the NDA.
            </p>
            <Button onClick={handleDocuSignAuth} className="w-full">
              Authenticate with DocuSign
            </Button>
          </div>
        )}
        {step === 'nda' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">One Last Step!</h1>
            <p className="text-gray-600 mb-6">
              Please review and sign our NDA to get access to the premium content.
            </p>
            <Button onClick={handleNDAComplete} className="w-full">
              Review NDA
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

