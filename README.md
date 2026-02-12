# Ticketing System

A modern event ticketing and seat selection system built with Node.js, React, Mantine UI, TanStack Query, and MySQL.

## Features

- Browse upcoming events
- Real-time seat selection with interactive seat map
- Seat booking system
- Admin panel for event management
- Responsive design with Mantine UI
- RESTful API backend with Express.js
- MySQL database for data persistence

## Tech Stack

**Frontend:**
- React 19
- Mantine UI 7
- TanStack Query (React Query)
- React Router
- Vite

**Backend:**
- Node.js with Express.js
- MySQL database
- RESTful API architecture

## Project Structure

\`\`\`
ticketing/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── api.js         # API client
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   │   ├── events.js     # Event endpoints
│   │   ├── seats.js      # Seat endpoints
│   │   └── bookings.js   # Booking endpoints
│   ├── db.js             # Database connection
│   ├── index.js          # Server entry point
│   └── package.json
├── .env.example          # Environment variables template
└── package.json          # Root package.json
\`\`\`

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone <repository-url>
   cd ticketing
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ..
   \`\`\`

3. **Set up MySQL database:**
   
   Create a MySQL database:
   \`\`\`sql
   CREATE DATABASE ticketing;
   \`\`\`

4. **Configure environment variables:**
   
   Copy the example env file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Edit \`.env\` with your configuration:
   \`\`\`env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=ticketing
   DB_PORT=3306
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173
   \`\`\`
   
   Configure client environment:
   \`\`\`bash
   cd client
   cp .env.example .env
   \`\`\`
   
   Edit \`client/.env\`:
   \`\`\`env
   VITE_API_URL=http://localhost:3000/api
   \`\`\`

5. **Start the application:**
   
   **Option 1: Run both servers concurrently (recommended for development)**
   \`\`\`bash
   npm run dev
   \`\`\`
   
   **Option 2: Run servers separately**
   
   Terminal 1 - Backend:
   \`\`\`bash
   npm run server
   \`\`\`
   
   Terminal 2 - Frontend:
   \`\`\`bash
   npm run client
   \`\`\`

6. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api
   - Admin Panel: http://localhost:5173/admin

## API Endpoints

### Events

- \`GET /api/events\` - List all events
- \`POST /api/events\` - Create a new event
- \`GET /api/events/:id\` - Get event details with seats
- \`PATCH /api/events/:id\` - Update event
- \`DELETE /api/events/:id\` - Delete event
- \`PATCH /api/events/:eventId/seats\` - Update seat status

### Bookings

- \`POST /api/bookings\` - Create a booking
- \`GET /api/bookings/event/:eventId\` - Get bookings for an event

### Seats

- \`GET /api/seats/event/:eventId\` - Get seats for an event

### Health Check

- \`GET /api/health\` - Server health check

## Deployment on PaaS

This application is ready for deployment on Platform as a Service (PaaS) providers.

### Deployment Steps

1. **Create Environment:**
   - Add a Node.js application server (Node.js 18+)
   - Add a MySQL database node (MySQL 8.0+)

2. **Configure Environment Variables:**
   Set the following environment variables in your PaaS platform:
   \`\`\`
   DB_HOST=<mysql-host>
   DB_USER=<mysql-user>
   DB_PASSWORD=<mysql-password>
   DB_NAME=ticketing
   DB_PORT=3306
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=<your-frontend-url>
   \`\`\`

3. **Deploy Application:**
   - Deploy the application via Git or file upload
   - The database tables will be created automatically on first run

4. **Build Frontend:**
   \`\`\`bash
   cd client && npm run build
   \`\`\`

5. **Access Your Application:**
   - Frontend: \`https://your-domain.com\`
   - Admin Panel: \`https://your-domain.com/admin\`
   - API Health Check: \`https://your-domain.com/api/health\`

## License

MIT
