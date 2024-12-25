'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { createCheckoutSession } from '@/app/actions'

export function PricingTable() {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const checkoutUrl = await createCheckoutSession('price_1QUwhBC2L0rtj24uyhqiI83U')
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Free Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Free Plan</CardTitle>
          <CardDescription>Perfect for getting started</CardDescription>
          <div className="mt-4">
            <span className="text-3xl font-bold">$0</span>
            <span className="text-gray-500 ml-2">/month</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Basic market analysis</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Limited resources access</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Community support</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Get Started
          </Button>
        </CardFooter>
      </Card>

      {/* Premium Plan */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle>Banking Vault</CardTitle>
          <CardDescription>12 weeks rolling subscription</CardDescription>
          <div className="mt-4">
            <span className="text-3xl font-bold">£899</span>
            <span className="text-gray-500 ml-2">/12 weeks</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Advanced market analysis</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Full resource library access</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Private community access</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>1-on-1 mentoring sessions</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Trading signals</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleUpgrade}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Subscribe Now'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

