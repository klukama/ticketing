# Ticketing System - Project Summary

## Overview

This project is a complete event ticketing and seat selection system built from scratch based on the [klukama/ticketer](https://github.com/klukama/ticketer) demo repository. It provides a modern web application for managing events and booking seats with an interactive seat map.

## Architecture

### Technology Stack

**Backend:**
- Node.js + Express.js
- MySQL database
- RESTful API architecture
- Rate limiting for security (100 requests per 15 minutes per IP)
- UUID-based identifiers

**Frontend:**
- React 19
- Mantine UI 7 (component library)
- TanStack Query (data fetching and caching)
- React Router 7 (navigation)
- Vite (build tool)

### Key Features

1. **Event Management**
   - Create, read, update, delete events
   - Configurable seating sections (left, right, back)
   - Automatic seat generation based on configuration
   - Event date and venue information

2. **Interactive Seat Selection**
   - Visual seat map with color-coded status
   - Real-time seat availability
   - Multi-seat selection
   - Section-based organization (left, right, back)

3. **Booking System**
   - Customer and seller information capture
   - Automatic ticket number generation
   - Booking history tracking
   - Seat status management (Available, Reserved, Booked)

4. **Admin Panel**
   - Event CRUD operations
   - View all bookings per event
   - Statistics dashboard
   - Event status tracking (past/upcoming)

## Database Schema

### Events Table
- Stores event information
- Configurable seating layout (rows × columns for each section)
- Timestamps for creation and updates

### Seats Table
- Linked to events via foreign key
- Row and seat number identification
- Section designation (LEFT, RIGHT, BACK)
- Status tracking with timestamps
- Booking relationship

### Bookings Table
- Stores customer and seller information
- Links to events and seats
- Tracks booking timestamps

## Security Features

1. **SQL Injection Protection**
   - Parameterized queries throughout
   - Database name validation with regex
   - Prepared statements for all user inputs

2. **Rate Limiting**
   - 100 requests per 15 minutes per IP address
   - Applied to all API routes
   - Prevents abuse and DoS attacks

3. **Input Validation**
   - Required field validation
   - Type checking
   - Proper error handling

4. **CORS Configuration**
   - Configurable origin via environment variable
   - Prevents unauthorized cross-origin access

## API Endpoints

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event with seats
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `PATCH /api/events/:eventId/seats` - Update seat status

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/event/:eventId` - Get event bookings

### Seats
- `GET /api/seats/event/:eventId` - Get event seats

### System
- `GET /api/health` - Health check

## Deployment Ready

The application is ready for deployment on PaaS platforms:

1. **Environment Configuration**
   - All settings via environment variables
   - Separate configs for development and production
   - Example files provided

2. **Database Auto-Initialization**
   - Automatic database creation on first run
   - Table creation with proper schema
   - No manual SQL scripts needed

3. **Build Process**
   - Frontend builds to static files
   - Optimized for production
   - Ready for CDN deployment

4. **Documentation**
   - Comprehensive README
   - Detailed deployment guide
   - Contributing guidelines

## Development Experience

### Code Quality
- ESLint configured and passing
- React best practices
- Proper error handling
- Clean code structure

### Developer Tools
- Hot reload for both frontend and backend
- Concurrent development servers
- Environment-based configuration
- Clear project structure

### Testing Status
- All dependencies installed successfully
- Frontend builds without errors
- Linting passes with no errors
- CodeQL security analysis passes (0 alerts)

## Files and Structure

```
ticketing/
├── server/                  # Backend server
│   ├── routes/
│   │   ├── events.js       # Event CRUD operations
│   │   ├── seats.js        # Seat management
│   │   └── bookings.js     # Booking operations
│   ├── db.js               # Database connection & schema
│   ├── index.js            # Server entry point
│   └── package.json        # Server dependencies
├── client/                  # Frontend application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── EventDetailPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── api.js          # API client
│   │   ├── App.jsx         # Main app
│   │   └── main.jsx        # Entry point
│   ├── postcss.config.cjs  # PostCSS for Mantine
│   └── package.json        # Client dependencies
├── README.md               # Main documentation
├── DEPLOYMENT.md           # Deployment guide
├── CONTRIBUTING.md         # Contribution guidelines
├── .env.example           # Environment template
└── package.json           # Root scripts

Total Lines of Code: ~1,500+ lines
```

## Success Metrics

✅ All features from demo repository implemented
✅ Modern tech stack (React 19, Mantine UI 7)
✅ MySQL database integration
✅ PaaS deployment ready
✅ Security best practices applied
✅ Comprehensive documentation
✅ Zero linting errors
✅ Zero security alerts
✅ Successful production build

## Next Steps for Users

1. Install dependencies: `npm install && cd server && npm install && cd ../client && npm install`
2. Set up MySQL database
3. Configure environment variables
4. Run development server: `npm run dev`
5. Access application at http://localhost:5173
6. Visit admin panel at http://localhost:5173/admin

## License

MIT
