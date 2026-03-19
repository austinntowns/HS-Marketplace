import { NextResponse } from 'next/server'
import { saveDraft } from '@/lib/listings/actions'

export async function POST(request: Request) {
  try {
    const { data, listingId } = await request.json()
    const result = await saveDraft(data, listingId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
