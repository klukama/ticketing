# Ticketing System

A modern event ticketing and seat selection system built with Next.js, React, Mantine UI, TanStack Query, and MySQL.

## Features

- Browse upcoming events
- Real-time seat selection with interactive seat map
- Seat booking system
- Admin panel for event management
- Responsive design with Mantine UI
- Next.js API routes (not front-facing endpoints)
- MySQL database for data persistence

## Tech Stack

**Frontend & Backend:**
- Next.js 16 (Full-stack framework)
- React 19
- Mantine UI 7
- TanStack Query (React Query)
- TypeScript

**Database:**
- MySQL 8.0+
- mysql2 driver

## Project Structure

```
ticketing/
├── src/
│   ├── app/
│   │   ├── api/              # Next.js API routes (internal)
│   │   │   ├── events/       # Event endpoints
│   │   │   ├── bookings/     # Booking endpoints
│   │   │   └── health/       # Health check
│   │   ├── admin/            # Admin panel page
│   │   ├── events/           # Event detail pages
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── providers.tsx     # Client-side providers
│   └── lib/
│       └── db.ts             # Database connection
├── .env.example              # Environment variables template
└── package.json              # Dependencies and scripts
```

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ticketing
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up MySQL database:**
   
   Create a MySQL database:
   ```sql
   CREATE DATABASE ticketing;
   ```

4. **Configure environment variables:**
   
   Copy the example env file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=ticketing
   DB_PORT=3306
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

5. **Start the application:**
   
   **Development mode:**
   ```bash
   npm run dev
   ```
   
   **Production build:**
   ```bash
   npm run build
   npm start
   ```

6. **Access the application:**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - API Health Check: http://localhost:3000/api/health

## API Routes

The API routes are **internal** Next.js routes (not front-facing endpoints like in traditional REST APIs). They are used by the Next.js pages internally.

### Events

- `GET /api/events` - List all events
- `POST /api/events` - Create a new event
- `GET /api/events/:id` - Get event details with seats
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `PATCH /api/events/:eventId/seats` - Update seat status

### Bookings

- `POST /api/bookings` - Create a booking
- `GET /api/bookings/event/:eventId` - Get bookings for an event

### Health Check

- `GET /api/health` - Server health check

## Deployment on PaaS

This application is ready for deployment on Platform as a Service (PaaS) providers like Virtuozzo Application Platform.

### Deployment Steps

1. **Create Environment:**
   - Add a Node.js application server (Node.js 18+)
   - Add a MySQL database node (MySQL 8.0+)

2. **Configure Environment Variables:**
   Set the following environment variables in your PaaS platform:
   ```
   DB_HOST=<mysql-host>
   DB_USER=<mysql-user>
   DB_PASSWORD=<mysql-password>
   DB_NAME=ticketing
   DB_PORT=3306
   PORT=3000
   NODE_ENV=production
   ```

3. **Deploy Application:**
   - Deploy the application via Git or file upload
   - The database tables will be created automatically on first run
   - Build the application: `npm run build`

4. **Access Your Application:**
   - Frontend: `https://your-domain.com`
   - Admin Panel: `https://your-domain.com/admin`
   - API Health Check: `https://your-domain.com/api/health`

## License

MIT
