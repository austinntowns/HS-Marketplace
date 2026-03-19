import { NextResponse } from 'next/server'
import { executeAction } from '@/lib/listings/action-tokens'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const result = await executeAction(token)

  // Redirect to confirmation page
  const url = new URL('/action-complete', request.url)
  url.searchParams.set('success', result.success.toString())
  url.searchParams.set('message', result.message)

  return NextResponse.redirect(url.toString())
}
