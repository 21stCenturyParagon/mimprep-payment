import { NextRequest, NextResponse } from 'next/server'
import { getDocuSignAccessToken, getDocuSignUserInfo } from '@/app/server/docusign-actions'
import { DocuSignAuthData } from '@/app/types/docusign'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
  }

  try {
    const tokenData = await getDocuSignAccessToken(code)
    const userInfo = await getDocuSignUserInfo(tokenData.access_token)

    const docusignAuthData: DocuSignAuthData = { tokenData, userInfo }

    // Store the token data and user info in the session or a secure cookie
    const response = NextResponse.redirect(`${request.nextUrl.origin}/success`)
    response.cookies.set('docusign_auth', JSON.stringify(docusignAuthData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokenData.expires_in
    })

    return response
  } catch (error) {
    console.error('DocuSign authentication error:', error)

    let errorMessage = 'Failed to authenticate with DocuSign'
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message
      if (errorMessage.includes('invalid_grant')) {
        statusCode = 400
        errorMessage = 'Invalid or expired authorization code'
      } else if (errorMessage.includes('invalid_client')) {
        statusCode = 401
        errorMessage = 'Invalid DocuSign API credentials'
      }
    }

    // Redirect to success page with error information
    const errorUrl = new URL(`${request.nextUrl.origin}/success`)
    errorUrl.searchParams.set('docusign_error', encodeURIComponent(errorMessage))
    return NextResponse.redirect(errorUrl)
  }
}

