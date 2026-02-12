# Deployment Guide

This guide covers deploying the Ticketing System on various Platform as a Service (PaaS) providers.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment on Virtuozzo Application Platform](#deployment-on-virtuozzo-application-platform)
- [Deployment on Heroku](#deployment-on-heroku)
- [Deployment on Railway](#deployment-on-railway)
- [Deployment on Render](#deployment-on-render)
- [Post-Deployment Steps](#post-deployment-steps)

## Prerequisites

Before deploying, ensure you have:
- A PaaS account (Virtuozzo, Heroku, Railway, Render, etc.)
- Your application code in a Git repository
- MySQL 8.0+ database available or provisioned

## Environment Variables

The following environment variables must be configured in your PaaS environment:

```env
# Database Configuration
DB_HOST=<mysql-host>
DB_USER=<mysql-user>
DB_PASSWORD=<mysql-password>
DB_NAME=ticketing
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=<your-frontend-url>
```

## Deployment on Virtuozzo Application Platform

Virtuozzo Application Platform (also known as Jelastic) is an ideal PaaS for this application.

### Step 1: Create Environment

1. Log in to your Virtuozzo dashboard
2. Click "New Environment"
3. Select the following topology:
   - **Application Server**: Node.js (version 18 or higher)
   - **Database**: MySQL 8.0

### Step 2: Configure Database

1. Once the environment is created, note the MySQL credentials from the dashboard
2. The database will be automatically provisioned

### Step 3: Deploy Application

1. **Via Git:**
   - In your environment, click on the Node.js node
   - Select "Add" → "VCS"
   - Enter your Git repository URL
   - Set branch to `main` (or your deployment branch)
   - Click "Add"

2. **Via Archive:**
   - Build your application locally: `cd client && npm run build`
   - Create a zip archive of your project
   - Upload via the dashboard

### Step 4: Configure Environment Variables

1. Click on the Node.js node
2. Navigate to "Variables"
3. Add all required environment variables listed above
4. Save changes

### Step 5: Initialize Database

The database tables will be created automatically when the application starts for the first time.

### Step 6: Access Application

Your application will be available at:
- `https://<env-name>.<provider-domain>`
- Admin panel: `https://<env-name>.<provider-domain>/admin`

## Deployment on Heroku

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

1. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

2. **Add MySQL add-on:**
   ```bash
   heroku addons:create cleardb:ignite
   ```

3. **Get database URL:**
   ```bash
   heroku config:get CLEARDB_DATABASE_URL
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set DB_HOST=<host-from-cleardb-url>
   heroku config:set DB_USER=<user-from-cleardb-url>
   heroku config:set DB_PASSWORD=<password-from-cleardb-url>
   heroku config:set DB_NAME=<database-from-cleardb-url>
   heroku config:set CORS_ORIGIN=https://your-app-name.herokuapp.com
   ```

5. **Create Procfile:**
   ```
   web: node server/index.js
   ```

6. **Deploy:**
   ```bash
   git push heroku main
   ```

## Deployment on Railway

### Steps

1. **Create new project:**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Add MySQL database:**
   - Click "New" → "Database" → "MySQL"
   - Railway will automatically provision the database

3. **Configure environment variables:**
   - Go to your application service
   - Add all required environment variables
   - Railway automatically provides MySQL connection details

4. **Deploy:**
   - Railway automatically deploys on git push
   - Or trigger manual deployment from dashboard

## Deployment on Render

### Steps

1. **Create Web Service:**
   - Go to Render dashboard
   - Click "New" → "Web Service"
   - Connect your Git repository

2. **Configure service:**
   - **Name**: ticketing-api
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node index.js`

3. **Create MySQL database:**
   - Click "New" → "PostgreSQL" (or use external MySQL)
   - Note the connection details

4. **Set environment variables:**
   - Add all required variables in the Environment section
   - Use the database connection details from step 3

5. **Deploy:**
   - Render automatically deploys your application

## Post-Deployment Steps

### Verify Deployment

1. **Check health endpoint:**
   ```bash
   curl https://your-app-url/api/health
   ```
   Should return: `{"status":"ok","message":"Ticketing API is running"}`

2. **Test database connection:**
   - Access your application
   - Try creating a test event in the admin panel

### Monitoring

- Set up uptime monitoring using the health check endpoint
- Monitor application logs through your PaaS dashboard
- Track database usage and performance

### Scaling

Most PaaS providers allow you to scale your application:
- **Vertical scaling**: Increase memory/CPU
- **Horizontal scaling**: Add more instances
- **Database scaling**: Upgrade database tier

### SSL/HTTPS

Most PaaS providers automatically provide SSL certificates. Ensure:
- Your application is accessible via HTTPS
- Update CORS_ORIGIN to use https:// URLs

### Frontend Deployment

You have two options for the frontend:

**Option 1: Serve from the backend (simple)**
1. Build the frontend: `cd client && npm run build`
2. Serve static files from Express (add middleware in `server/index.js`)

**Option 2: Deploy separately (recommended)**
1. Deploy frontend to Vercel, Netlify, or Cloudflare Pages
2. Update CORS_ORIGIN to match frontend URL

### Backup Strategy

Set up regular database backups:
- Most PaaS providers offer automated backups
- Schedule daily backups for production
- Test restore procedures periodically

## Troubleshooting

### Database Connection Issues

If you see database connection errors:
1. Verify environment variables are correctly set
2. Check database host is accessible from application
3. Ensure database user has proper permissions
4. Check firewall/security group settings

### CORS Errors

If frontend can't connect to backend:
1. Verify CORS_ORIGIN matches frontend URL exactly
2. Ensure it includes the protocol (http:// or https://)
3. No trailing slash in CORS_ORIGIN

### Port Issues

If application won't start:
1. Most PaaS providers set the PORT environment variable
2. Application uses `process.env.PORT || 3000`
3. Don't hardcode the port in production

### Memory Issues

If application crashes due to memory:
1. Upgrade your PaaS plan
2. Optimize database queries
3. Implement caching if needed

## Support

For deployment issues:
- Check PaaS provider documentation
- Review application logs
- Test locally with production environment variables
- Create an issue on GitHub

## Security Checklist

- [ ] Environment variables are set (not hardcoded)
- [ ] Database credentials are secure
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Database backups are enabled
- [ ] Application logs are monitored
- [ ] Dependencies are up to date
