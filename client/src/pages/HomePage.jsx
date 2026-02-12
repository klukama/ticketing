import { Container, Title, Text, Card, Group, Badge, Button, Stack } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function HomePage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: api.getEvents,
  });

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={1}>What&apos;s On</Title>
        <Link to="/admin">
          <Button variant="subtle" color="gray">Admin Panel</Button>
        </Link>
      </Group>
      <Text size="lg" c="dimmed" mb="xl">
        Browse upcoming events and book your seats
      </Text>

      {isLoading && <Text>Loading events...</Text>}

      <Stack gap="md">
        {events?.map((event) => (
          <Card key={event.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Title order={3}>{event.title}</Title>
              <Badge color="blue" variant="light">
                {new Date(event.date).toLocaleDateString()}
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" mb="md">
              {event.venue}
            </Text>

            {event.description && (
              <Text size="sm" mb="md">
                {event.description}
              </Text>
            )}

            <Group justify="space-between" mt="md">
              <Text size="sm" c="dimmed">
                {event.total_seats} total seats
              </Text>
              <Link to={`/events/${event.id}`}>
                <Button variant="filled" color="blue">
                  View Seats
                </Button>
              </Link>
            </Group>
          </Card>
        ))}

        {!isLoading && events?.length === 0 && (
          <Text c="dimmed" ta="center" py="xl">
            No events available at the moment
          </Text>
        )}
      </Stack>
    </Container>
  );
}
