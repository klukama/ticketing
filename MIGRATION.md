# Migration to Next.js Architecture

## Overview

This project has been migrated from a separate Express backend + Vite/React frontend architecture to a **unified Next.js full-stack application**. This aligns with the architecture used in the [ticketer](https://github.com/klukama/ticketer) reference repository.

## Key Changes

### Architecture

**Before (Express + Vite/React):**
- Separate `server/` directory with Express.js API
- Separate `client/` directory with Vite + React
- Front-facing REST API endpoints
- CORS configuration needed
- Two separate dev servers

**After (Next.js):**
- Unified `src/app/` directory with Next.js
- Internal API routes (not front-facing)
- No CORS needed (same-origin)
- Single dev server
- Server-side rendering capable

### Directory Structure

```
Old:                          New:
ticketing/                    ticketing/
├── client/                   ├── src/
│   ├── src/                  │   ├── app/
│   │   ├── pages/            │   │   ├── api/         # Next.js API routes
│   │   ├── api.js            │   │   ├── admin/       # Admin page
│   │   ├── App.jsx           │   │   ├── events/      # Event pages
│   │   └── main.jsx          │   │   ├── layout.tsx   # Root layout
│   └── package.json          │   │   ├── page.tsx     # Home page
├── server/                   │   │   └── providers.tsx
│   ├── routes/               │   └── lib/
│   │   ├── events.js         │       └── db.ts        # Database
│   │   ├── seats.js          ├── .env.example
│   │   └── bookings.js       └── package.json
│   ├── db.js
│   ├── index.js
│   └── package.json
└── package.json
```

### Technology Stack

**Removed:**
- Express.js
- Vite
- React Router
- CORS middleware
- body-parser
- Separate client/server packages

**Added:**
- Next.js 16
- TypeScript support
- Unified React 19 app
- Built-in API routes
- Automatic code splitting

### API Routes

The API routes are now **internal Next.js routes**, not front-facing REST endpoints. They are located in `src/app/api/` and follow Next.js conventions:

- `src/app/api/events/route.ts` - Events API
- `src/app/api/events/[eventId]/route.ts` - Individual event API
- `src/app/api/events/[eventId]/seats/route.ts` - Seats API
- `src/app/api/bookings/route.ts` - Bookings API
- `src/app/api/health/route.ts` - Health check

### Database Connection

The database connection has been moved to `src/lib/db.ts` and uses lazy initialization to avoid connection errors during build time.

### Environment Variables

The `.env` file has been simplified:
- Removed: `CORS_ORIGIN` (no longer needed)
- Same database configuration
- `PORT` now controls the Next.js server port

### Scripts

**Before:**
```json
{
  "dev": "concurrently \"npm run server\" \"npm run client\"",
  "server": "cd server && node index.js",
  "client": "cd client && npm run dev",
  "build": "cd client && npm run build"
}
```

**After:**
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## Benefits

1. **Simplified Architecture**: Single codebase, single dev server
2. **Better Performance**: Server-side rendering, automatic code splitting
3. **TypeScript Support**: Built-in TypeScript support
4. **API Security**: API routes are internal, not exposed as public REST endpoints
5. **Modern Stack**: Using the latest Next.js 16 with React 19
6. **Easier Deployment**: Single application to deploy
7. **Consistent with Reference**: Matches the ticketer architecture

## Migration Checklist

- [x] Create Next.js project structure
- [x] Migrate API routes from Express to Next.js
- [x] Migrate React pages to Next.js pages
- [x] Convert JavaScript to TypeScript
- [x] Update database connection
- [x] Update package.json dependencies
- [x] Update README documentation
- [x] Test build process
- [ ] Remove old client/ and server/ directories (after verification)
- [ ] Update deployment documentation

## Backward Compatibility

The old `client/` and `server/` directories are still present but are no longer used. They will be removed in a future commit after the migration is fully verified.

## Testing the Migration

1. Install dependencies: `npm install`
2. Set up `.env` file with database credentials
3. Run development server: `npm run dev`
4. Visit http://localhost:3000
5. Test all features:
   - Home page listing events
   - Admin panel (create/edit/delete events)
   - Event detail page with seat selection
   - Booking functionality

## Deployment

The deployment process has been simplified:

```bash
# Build the application
npm run build

# Start production server
npm start
```

The application will run on the port specified in the `PORT` environment variable (default: 3000).
