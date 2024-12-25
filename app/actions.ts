'use server'

import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { getDocuSignAuthUrl, createDocuSignEnvelope, getDocuSignSigningUrl } from './server/docusign-actions'
import { DocuSignAuthData } from './types/docusign'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCheckoutSession(priceId: string) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: `${headers().get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${headers().get('origin')}`,
  })

  return session.url
}

export async function getCustomerEmail(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['customer'],
  })
  return session.customer_details?.email || null
}

export async function initiateDocuSignAuth() {
  return await getDocuSignAuthUrl()
}

export async function createDocuSignEnvelopeAndGetSigningUrl(email: string, name: string) {
  const cookieStore = cookies()
  const docusignAuthCookie = cookieStore.get('docusign_auth')

  if (!docusignAuthCookie) {
    throw new Error('DocuSign authentication required')
  }

  const { tokenData, userInfo } = JSON.parse(docusignAuthCookie.value) as DocuSignAuthData

  const envelope = await createDocuSignEnvelope(tokenData.access_token, userInfo.accounts[0].account_id, email, name)
  const signingUrl = await getDocuSignSigningUrl(tokenData.access_token, userInfo.accounts[0].account_id, envelope.envelopeId, email, name)

  return signingUrl.url
}

