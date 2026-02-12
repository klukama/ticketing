# Contributing to Ticketing System

Thank you for your interest in contributing to the Ticketing System! This document provides guidelines and information for developers.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- MySQL 8.0 or higher
- npm or yarn package manager
- Git

### Initial Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/klukama/ticketing.git
   cd ticketing
   ```

2. **Install dependencies:**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   cd ..
   ```

3. **Set up MySQL database:**
   ```sql
   CREATE DATABASE ticketing;
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   cd client && cp .env.example .env && cd ..
   ```
   
   Edit the `.env` files with your configuration.

5. **Start development servers:**
   ```bash
   npm run dev
   ```

## Project Structure

```
ticketing/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── api.js      # API client
│   │   └── App.jsx     # Main app component
│   └── package.json
├── server/             # Node.js backend
│   ├── routes/        # API route handlers
│   ├── db.js          # Database connection
│   ├── index.js       # Server entry point
│   └── package.json
└── package.json        # Root package.json
```

## Development Workflow

### Making Changes

1. **Create a new branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards below

3. **Test your changes:**
   ```bash
   # Run linting
   cd client && npm run lint
   
   # Build the frontend
   npm run build
   
   # Test the API endpoints
   # (Use a tool like Postman or curl)
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

5. **Push and create a pull request:**
   ```bash
   git push origin feature/your-feature-name
   ```

## Coding Standards

### JavaScript/React

- Use ES6+ syntax
- Follow ESLint rules (configured in `client/eslint.config.js`)
- Use functional components and hooks in React
- Keep components focused and single-purpose
- Use meaningful variable and function names

### Backend

- Use async/await for asynchronous operations
- Always handle errors properly
- Validate input data
- Use parameterized queries to prevent SQL injection
- Follow RESTful API conventions

### Database

- Use transactions for related operations
- Always use foreign keys for relationships
- Index frequently queried columns
- Avoid N+1 queries

## API Development

### Adding New Endpoints

1. Create or modify a route file in `server/routes/`
2. Use proper HTTP methods (GET, POST, PATCH, DELETE)
3. Return appropriate status codes
4. Handle errors gracefully
5. Add rate limiting if needed

### Example Route:

```javascript
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM table WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Frontend Development

### Adding New Pages

1. Create a new component in `client/src/pages/`
2. Add the route in `client/src/App.jsx`
3. Use Mantine UI components for consistency
4. Use TanStack Query for data fetching

### Example Page:

```javascript
import { Container, Title, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export default function MyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['myData'],
    queryFn: api.getMyData,
  });

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <Container>
      <Title>My Page</Title>
      {/* Your content */}
    </Container>
  );
}
```

## Testing

### Manual Testing

1. Test all CRUD operations
2. Test error scenarios
3. Test with different screen sizes
4. Test with slow network connections
5. Verify data persistence

### Security Testing

Before submitting a PR:

1. Run the linter: `cd client && npm run lint`
2. Check for security vulnerabilities: Review any CodeQL alerts
3. Test input validation
4. Check for SQL injection vulnerabilities

## Pull Request Guidelines

### PR Title

Use descriptive titles:
- `Add user authentication feature`
- `Fix seat selection bug`
- `Improve admin panel UI`

### PR Description

Include:
- What changes were made
- Why the changes were necessary
- How to test the changes
- Any breaking changes
- Screenshots (for UI changes)

### Before Submitting

- [ ] Code follows project coding standards
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Changes are tested manually
- [ ] No console errors
- [ ] Documentation updated if needed

## Database Migrations

When modifying the database schema:

1. Update `server/db.js` with the new schema
2. Document the changes in your PR
3. Consider data migration for existing databases
4. Test with both fresh and existing databases

## Common Issues

### Database Connection Errors

- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

### Frontend Build Errors

- Clear node_modules and reinstall
- Check for conflicting dependencies
- Verify all imports are correct

### CORS Errors

- Check `CORS_ORIGIN` in server `.env`
- Verify `VITE_API_URL` in client `.env`
- Ensure URLs match exactly

## Getting Help

- Open an issue for bugs
- Join discussions for questions
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
