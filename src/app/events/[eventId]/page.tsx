'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Container, Title, Text, Button, Group, Stack, Paper,
  Grid, Badge, Modal, TextInput, Loader
} from '@mantine/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'

interface Seat {
  id: string
  event_id: string
  row_label: string
  number: number
  section: string
  status: string
  booked_by?: string | null
  booked_at?: string | null
}

interface Event {
  id: string
  title: string
  description: string | null
  venue: string
  date: string
  total_seats: number
  seats: Seat[]
}

export default function EventDetailPage() {
  const params = useParams()
  const id = params?.eventId as string
  const queryClient = useQueryClient()
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [bookingData, setBookingData] = useState({
    customerFirstName: '',
    customerLastName: '',
    sellerFirstName: '',
    sellerLastName: '',
  })

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`)
      if (!res.ok) throw new Error('Failed to fetch event')
      return res.json()
    },
  })

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create booking')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] })
      setBookingModalOpen(false)
      setSelectedSeats([])
      setBookingData({
        customerFirstName: '',
        customerLastName: '',
        sellerFirstName: '',
        sellerLastName: '',
      })
      notifications.show({
        title: 'Success!',
        message: 'Seats booked successfully.',
        color: 'green',
      })
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to book seats.',
        color: 'red',
      })
    },
  })

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return
    
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.id === seat.id)
      if (exists) {
        return prev.filter(s => s.id !== seat.id)
      } else {
        return [...prev, seat]
      }
    })
  }

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedSeats.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Please select at least one seat.',
        color: 'red',
      })
      return
    }
    
    createBookingMutation.mutate({
      eventId: id,
      seatIds: selectedSeats.map(s => s.id),
      ...bookingData,
    })
  }

  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <Loader />
      </Container>
    )
  }

  if (!event) {
    return (
      <Container size="lg" py="xl">
        <Text>Event not found</Text>
        <Link href="/">
          <Button mt="md">Back to Events</Button>
        </Link>
      </Container>
    )
  }

  // Group seats by section
  const leftSeats = event.seats?.filter(s => s.section === 'LEFT') || []
  const rightSeats = event.seats?.filter(s => s.section === 'RIGHT') || []
  const backSeats = event.seats?.filter(s => s.section === 'BACK') || []

  // Organize seats into rows
  const organizeSeats = (seats: Seat[]) => {
    const rows: Record<string, Seat[]> = {}
    seats.forEach(seat => {
      if (!rows[seat.row_label]) {
        rows[seat.row_label] = []
      }
      rows[seat.row_label].push(seat)
    })
    return Object.entries(rows).sort((a, b) => a[0].localeCompare(b[0]))
  }

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.find(s => s.id === seat.id)) return 'blue'
    if (seat.status === 'BOOKED') return 'red'
    if (seat.status === 'RESERVED') return 'yellow'
    return 'green'
  }

  const renderSeatMap = (seats: Seat[], title: string) => {
    if (seats.length === 0) return null
    const rows = organizeSeats(seats)
    
    return (
      <Paper p="md" withBorder>
        <Title order={4} mb="md">{title}</Title>
        <Stack gap="xs">
          {rows.map(([rowLabel, rowSeats]) => (
            <Group key={rowLabel} gap="xs">
              <Text fw={700} w={30}>{rowLabel}</Text>
              {rowSeats.sort((a, b) => a.number - b.number).map(seat => (
                <Button
                  key={seat.id}
                  size="xs"
                  color={getSeatColor(seat)}
                  variant={selectedSeats.find(s => s.id === seat.id) ? 'filled' : 'light'}
                  disabled={seat.status !== 'AVAILABLE'}
                  onClick={() => toggleSeat(seat)}
                  style={{ minWidth: 40 }}
                >
                  {seat.number}
                </Button>
              ))}
            </Group>
          ))}
        </Stack>
      </Paper>
    )
  }

  const availableSeats = event.seats?.filter(s => s.status === 'AVAILABLE').length || 0
  const bookedSeats = event.seats?.filter(s => s.status === 'BOOKED').length || 0

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>{event.title}</Title>
          <Text c="dimmed" size="lg">{event.venue}</Text>
          <Text c="dimmed">{new Date(event.date).toLocaleString()}</Text>
        </div>
        <Link href="/">
          <Button variant="subtle">Back to Events</Button>
        </Link>
      </Group>

      {event.description && (
        <Text mb="xl">{event.description}</Text>
      )}

      <Paper p="md" mb="xl" withBorder>
        <Group justify="space-around">
          <div>
            <Text size="sm" c="dimmed">Total Seats</Text>
            <Text size="xl" fw={700}>{event.total_seats}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Available</Text>
            <Text size="xl" fw={700} c="green">{availableSeats}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Booked</Text>
            <Text size="xl" fw={700} c="red">{bookedSeats}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Selected</Text>
            <Text size="xl" fw={700} c="blue">{selectedSeats.length}</Text>
          </div>
        </Group>
      </Paper>

      <Stack gap="md" mb="xl">
        <Group gap="xs" mb="md">
          <Badge color="green">Available</Badge>
          <Badge color="blue">Selected</Badge>
          <Badge color="red">Booked</Badge>
        </Group>
        
        <Grid>
          {leftSeats.length > 0 && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              {renderSeatMap(leftSeats, 'Left Section')}
            </Grid.Col>
          )}
          {rightSeats.length > 0 && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              {renderSeatMap(rightSeats, 'Right Section')}
            </Grid.Col>
          )}
          {backSeats.length > 0 && (
            <Grid.Col span={12}>
              {renderSeatMap(backSeats, 'Back Section')}
            </Grid.Col>
          )}
        </Grid>
      </Stack>

      {selectedSeats.length > 0 && (
        <Paper p="md" withBorder style={{ position: 'sticky', bottom: 20 }}>
          <Group justify="space-between">
            <div>
              <Text fw={700}>
                {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
              </Text>
              <Text size="sm" c="dimmed">
                {selectedSeats.map(s => `${s.row_label}${s.number}`).join(', ')}
              </Text>
            </div>
            <Group>
              <Button variant="subtle" onClick={() => setSelectedSeats([])}>
                Clear Selection
              </Button>
              <Button onClick={() => setBookingModalOpen(true)}>
                Book Seats
              </Button>
            </Group>
          </Group>
        </Paper>
      )}

      <Modal
        opened={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Book Seats"
        size="md"
      >
        <form onSubmit={handleBooking}>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Booking {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}:{' '}
              {selectedSeats.map(s => `${s.row_label}${s.number}`).join(', ')}
            </Text>

            <Title order={5}>Customer Information</Title>
            <TextInput
              label="First Name"
              placeholder="John"
              value={bookingData.customerFirstName}
              onChange={(e) => setBookingData({ ...bookingData, customerFirstName: e.target.value })}
              required
            />
            <TextInput
              label="Last Name"
              placeholder="Doe"
              value={bookingData.customerLastName}
              onChange={(e) => setBookingData({ ...bookingData, customerLastName: e.target.value })}
              required
            />

            <Title order={5}>Seller Information</Title>
            <TextInput
              label="First Name"
              placeholder="Jane"
              value={bookingData.sellerFirstName}
              onChange={(e) => setBookingData({ ...bookingData, sellerFirstName: e.target.value })}
              required
            />
            <TextInput
              label="Last Name"
              placeholder="Smith"
              value={bookingData.sellerLastName}
              onChange={(e) => setBookingData({ ...bookingData, sellerLastName: e.target.value })}
              required
            />

            <Group justify="flex-end" gap="xs">
              <Button variant="subtle" onClick={() => setBookingModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createBookingMutation.isPending}>
                Confirm Booking
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  )
}
