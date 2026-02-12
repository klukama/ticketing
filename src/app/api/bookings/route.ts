import { NextResponse } from 'next/server'
import { db, ensureDbInitialized } from '@/lib/db'
import { randomUUID } from 'crypto'

// POST /api/bookings - Create a booking
export async function POST(request: Request) {
  try {
    await ensureDbInitialized()
    const body = await request.json()
    const {
      eventId,
      customerFirstName,
      customerLastName,
      sellerFirstName,
      sellerLastName,
      seatIds
    } = body

    if (!eventId || !customerFirstName || !customerLastName || !sellerFirstName || !sellerLastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one seat must be selected' },
        { status: 400 }
      )
    }

    const bookingId = randomUUID()

    // Insert booking
    await db.query(
      `INSERT INTO bookings (id, event_id, customer_first_name, customer_last_name, 
       seller_first_name, seller_last_name) VALUES (?, ?, ?, ?, ?, ?)`,
      [bookingId, eventId, customerFirstName, customerLastName, sellerFirstName, sellerLastName]
    )

    // Update seats to booked status
    const placeholders = seatIds.map(() => '?').join(',')
    await db.query(
      `UPDATE seats SET status = 'BOOKED', booking_id = ?, booked_at = NOW(), 
       booked_by = ? WHERE id IN (${placeholders}) AND event_id = ?`,
      [bookingId, `${customerFirstName} ${customerLastName}`, ...seatIds, eventId]
    )

    // Get booking with seats
    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [bookingId]
    )
    const bookingData = bookings as any[]

    const [seats] = await db.query(
      `SELECT * FROM seats WHERE id IN (${placeholders})`,
      seatIds
    )

    return NextResponse.json({
      ...bookingData[0],
      seats
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
