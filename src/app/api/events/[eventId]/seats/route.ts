import { NextResponse } from 'next/server'
import { db, ensureDbInitialized } from '@/lib/db'

// PATCH /api/events/:eventId/seats - Update seat status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await ensureDbInitialized()
    const { eventId } = await params
    const body = await request.json()
    const { seatIds, status, bookedBy, bookingId } = body
    
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { error: 'seatIds array is required' },
        { status: 400 }
      )
    }
    
    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }
    
    const updates = ['status = ?']
    const queryParams = [status]
    
    if (status === 'BOOKED') {
      updates.push('booked_by = ?', 'booked_at = NOW()')
      queryParams.push(bookedBy || null)
      
      if (bookingId) {
        updates.push('booking_id = ?')
        queryParams.push(bookingId)
      }
    } else if (status === 'AVAILABLE') {
      updates.push('booked_by = NULL', 'booked_at = NULL', 'booking_id = NULL', 'ticket_number = NULL')
    }
    
    // Update each seat
    for (const seatId of seatIds) {
      await db.query(
        `UPDATE seats SET ${updates.join(', ')} WHERE id = ? AND event_id = ?`,
        [...queryParams, seatId, eventId]
      )
    }
    
    // Return updated seats
    const placeholders = seatIds.map(() => '?').join(',')
    const [seats] = await db.query(
      `SELECT * FROM seats WHERE id IN (${placeholders})`,
      seatIds
    )
    
    return NextResponse.json(seats)
  } catch (error) {
    console.error('Error updating seats:', error)
    return NextResponse.json({ error: 'Failed to update seats' }, { status: 500 })
  }
}
