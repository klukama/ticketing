import { NextResponse } from 'next/server'
import { db, ensureDbInitialized } from '@/lib/db'
import { randomUUID } from 'crypto'

// Helper function to generate seats for an event
function generateSeatsForEvent(eventId: string, config: {
  leftRows: number
  leftCols: number
  rightRows: number
  rightCols: number
  backRows: number
  backCols: number
}) {
  const seats = []
  const { leftRows, leftCols, rightRows, rightCols, backRows, backCols } = config
  
  // Generate left section seats
  for (let row = 0; row < leftRows; row++) {
    const rowLabel = String.fromCharCode(65 + row) // A, B, C, ...
    for (let col = 1; col <= leftCols; col++) {
      seats.push({
        id: randomUUID(),
        event_id: eventId,
        row_label: rowLabel,
        number: col,
        section: 'LEFT',
        status: 'AVAILABLE'
      })
    }
  }
  
  // Generate right section seats
  for (let row = 0; row < rightRows; row++) {
    const rowLabel = String.fromCharCode(65 + row) // A, B, C, ...
    for (let col = 1; col <= rightCols; col++) {
      seats.push({
        id: randomUUID(),
        event_id: eventId,
        row_label: rowLabel,
        number: col,
        section: 'RIGHT',
        status: 'AVAILABLE'
      })
    }
  }
  
  // Generate back section seats if configured
  if (backRows > 0 && backCols > 0) {
    for (let row = 0; row < backRows; row++) {
      const rowLabel = String.fromCharCode(65 + row) // A, B, C, ...
      for (let col = 1; col <= backCols; col++) {
        seats.push({
          id: randomUUID(),
          event_id: eventId,
          row_label: rowLabel,
          number: col,
          section: 'BACK',
          status: 'AVAILABLE'
        })
      }
    }
  }
  
  return seats
}

// GET /api/events - List all events
export async function GET() {
  try {
    await ensureDbInitialized()
    const [rows] = await db.query('SELECT * FROM events ORDER BY date ASC')
    const events = rows as any[]
    
    // Get seat counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const [counts] = await db.query(
          'SELECT COUNT(*) as count FROM seats WHERE event_id = ?',
          [event.id]
        )
        const countData = counts as any[]
        return {
          ...event,
          _count: {
            seats: countData[0].count
          }
        }
      })
    )
    
    return NextResponse.json(eventsWithCounts)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST /api/events - Create event
export async function POST(request: Request) {
  try {
    await ensureDbInitialized()
    const body = await request.json()
    const {
      title,
      description,
      venue,
      date,
      totalSeats,
      imageUrl,
      leftRows = 6,
      leftCols = 5,
      rightRows = 6,
      rightCols = 5,
      backRows = 0,
      backCols = 0
    } = body

    if (!title || !venue || !date) {
      return NextResponse.json(
        { error: 'Title, venue, and date are required' },
        { status: 400 }
      )
    }

    const eventId = randomUUID()
    
    // Insert event
    await db.query(
      `INSERT INTO events (id, title, description, venue, date, total_seats, image_url, 
       left_rows, left_cols, right_rows, right_cols, back_rows, back_cols) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [eventId, title, description, venue, date, totalSeats || 0, imageUrl,
       leftRows, leftCols, rightRows, rightCols, backRows, backCols]
    )
    
    // Generate and insert seats
    const seats = generateSeatsForEvent(eventId, {
      leftRows, leftCols, rightRows, rightCols, backRows, backCols
    })
    
    if (seats.length > 0) {
      const values = seats.map(seat => [
        seat.id, seat.event_id, seat.row_label, seat.number, seat.section, seat.status
      ])
      
      await db.query(
        `INSERT INTO seats (id, event_id, row_label, number, section, status) VALUES ?`,
        [values]
      )
    }

    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId])
    const eventData = events as any[]
    return NextResponse.json(eventData[0], { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
