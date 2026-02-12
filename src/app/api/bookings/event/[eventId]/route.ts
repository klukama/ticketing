import { NextResponse } from 'next/server'
import { db, ensureDbInitialized } from '@/lib/db'

// GET /api/bookings/event/:eventId - Get bookings for an event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await ensureDbInitialized()
    const { eventId } = await params
    
    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE event_id = ? ORDER BY created_at DESC',
      [eventId]
    )

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
