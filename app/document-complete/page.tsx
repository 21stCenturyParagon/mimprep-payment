'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function DocuSignCompletePage() {
  const router = useRouter()

  useEffect(() => {
    // You can add any necessary checks here
  }, [])

  const handleContinue = () => {
    // Redirect to Skool
    window.location.href = 'https://www.skool.com/the-banking-vault'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">NDA Signed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for signing the NDA. You're now ready to access our premium content.
          </p>
          <Button onClick={handleContinue} className="w-full">
            Continue to Banking Vault
          </Button>
        </div>
      </Card>
    </div>
  )
}

