import { headers } from 'next/headers'

const DOCUSIGN_AUTH_BASE_URL = 'https://account-d.docusign.com/oauth'
const DOCUSIGN_API_BASE_URL = 'https://demo.docusign.net/restapi'

export interface DocuSignAuthData {
  tokenData: {
    access_token: string;
    expires_in: number;
    // Add other relevant fields from the token response
  };
  userInfo: {
    accounts: Array<{
      account_id: string;
      // Add other relevant fields from the user info
    }>;
    // Add other relevant fields from the user info
  };
}

export async function getDocuSignAuthUrl() {
  const redirectUri = `${headers().get('origin')}/api/docusign-callback`
  const authUrl = new URL(`${DOCUSIGN_AUTH_BASE_URL}/auth`)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('scope', 'signature')
  authUrl.searchParams.append('client_id', process.env.DOCUSIGN_INTEGRATION_KEY!)
  authUrl.searchParams.append('redirect_uri', redirectUri)

  return authUrl.toString()
}

export async function getDocuSignAccessToken(code: string) {
  const redirectUri = `${headers().get('origin')}/api/docusign-callback`
  const response = await fetch(`${DOCUSIGN_AUTH_BASE_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.DOCUSIGN_INTEGRATION_KEY!,
      client_secret: process.env.DOCUSIGN_SECRET_KEY!,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('DocuSign Token Error:', errorData)
    throw new Error(`Failed to get DocuSign access token: ${errorData.error_description || 'Unknown error'}`)
  }

  return await response.json()
}

export async function getDocuSignUserInfo(accessToken: string) {
  const response = await fetch(`${DOCUSIGN_AUTH_BASE_URL}/userinfo`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('DocuSign UserInfo Error:', errorData)
    throw new Error(`Failed to get DocuSign user info: ${errorData.error_description || 'Unknown error'}`)
  }

  return await response.json()
}

export async function createDocuSignEnvelope(accessToken: string, accountId: string, email: string, name: string) {
  const envelopeDefinition = {
    templateId: 'e796a161-ac62-4acf-9ba7-8360f2b36758',
    templateRoles: [{
      email: email,
      name: name,
      roleName: 'Signer',
    }],
    status: 'sent',
  }

  const response = await fetch(`${DOCUSIGN_API_BASE_URL}/v2.1/accounts/${accountId}/envelopes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ envelopeDefinition }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('DocuSign API Error:', errorData)
    throw new Error(`Failed to create DocuSign envelope: ${errorData.message || 'Unknown error'}`)
  }

  return await response.json()
}

export async function getDocuSignSigningUrl(accessToken: string, accountId: string, envelopeId: string, email: string, name: string) {
  const viewRequest = {
    returnUrl: `${headers().get('origin')}/docusign-complete`,
    authenticationMethod: 'none',
    email: email,
    userName: name,
    clientUserId: '1000',
  }

  const response = await fetch(`${DOCUSIGN_API_BASE_URL}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/views/recipient`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(viewRequest),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('DocuSign View URL Error:', errorData)
    throw new Error(`Failed to get DocuSign signing URL: ${errorData.message || 'Unknown error'}`)
  }

  return await response.json()
}

