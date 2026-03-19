import { NextResponse } from 'next/server'
import { changeListingStatus } from '@/lib/listings/actions'
import type { ListingStatus } from '@/lib/listings/types'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { targetStatus, reason } = await request.json() as { action: string; targetStatus: ListingStatus; reason?: string }

    await changeListingStatus(id, targetStatus, reason)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
