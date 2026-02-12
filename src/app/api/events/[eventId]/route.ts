import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/events/:id - Get single event with seats
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId])
    const eventData = events as any[]
    
    if (eventData.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    
    const [seats] = await db.query(
      'SELECT * FROM seats WHERE event_id = ? ORDER BY section, row_label, number',
      [eventId]
    )
    
    return NextResponse.json({
      ...eventData[0],
      seats
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

// PATCH /api/events/:id - Update event
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const body = await request.json()
    const {
      title,
      description,
      venue,
      date,
      totalSeats,
      imageUrl,
      leftRows,
      leftCols,
      rightRows,
      rightCols,
      backRows,
      backCols
    } = body
    
    const updates: string[] = []
    const queryParams: any[] = []

    if (title !== undefined) {
      updates.push('title = ?')
      queryParams.push(title)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      queryParams.push(description)
    }
    if (venue !== undefined) {
      updates.push('venue = ?')
      queryParams.push(venue)
    }
    if (date !== undefined) {
      updates.push('date = ?')
      queryParams.push(date)
    }
    if (totalSeats !== undefined) {
      updates.push('total_seats = ?')
      queryParams.push(totalSeats)
    }
    if (imageUrl !== undefined) {
      updates.push('image_url = ?')
      queryParams.push(imageUrl)
    }
    if (leftRows !== undefined) {
      updates.push('left_rows = ?')
      queryParams.push(leftRows)
    }
    if (leftCols !== undefined) {
      updates.push('left_cols = ?')
      queryParams.push(leftCols)
    }
    if (rightRows !== undefined) {
      updates.push('right_rows = ?')
      queryParams.push(rightRows)
    }
    if (rightCols !== undefined) {
      updates.push('right_cols = ?')
      queryParams.push(rightCols)
    }
    if (backRows !== undefined) {
      updates.push('back_rows = ?')
      queryParams.push(backRows)
    }
    if (backCols !== undefined) {
      updates.push('back_cols = ?')
      queryParams.push(backCols)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    queryParams.push(eventId)
    await db.query(
      `UPDATE events SET ${updates.join(', ')} WHERE id = ?`,
      queryParams
    )

    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId])
    const eventData = events as any[]
    
    if (eventData.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    
    return NextResponse.json(eventData[0])
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE /api/events/:id - Delete event
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const [result] = await db.query('DELETE FROM events WHERE id = ?', [eventId]) as any
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
