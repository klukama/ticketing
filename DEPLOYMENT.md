# Deployment Guide

This guide covers deploying the Ticketing System on Virtuozzo Application Platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment on Virtuozzo Application Platform](#deployment-on-virtuozzo-application-platform)
- [Post-Deployment Steps](#post-deployment-steps)

## Prerequisites

Before deploying, ensure you have:
- A Virtuozzo Application Platform account
- Your application code in a Git repository
- Access to your Virtuozzo dashboard

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
2. Click **"New Environment"** button
3. In the topology wizard, configure the following:
   - **Application Server**: 
     - Select **Node.js** from the application server options
     - Choose version **18** or higher
     - Set cloudlets (resources): Minimum 1, Maximum 8 (adjustable based on your needs)
   - **Database**: 
     - Add **MySQL** node
     - Select version **8.0** or higher
     - Set cloudlets: Minimum 1, Maximum 4
4. Enter a name for your environment (e.g., "ticketing-app")
5. Click **"Create"** and wait for the environment to be provisioned (usually takes 1-2 minutes)

### Step 2: Configure Database

1. Once the environment is created, click on the **MySQL** node in your environment
2. Click **"Open in Browser"** to access phpMyAdmin (or use your preferred MySQL client)
3. Note down the following credentials from the email sent by Virtuozzo or from the dashboard:
   - **Host**: Typically `node<ID>-<env-name>.<provider-domain>`
   - **User**: Default is usually `root`
   - **Password**: Check the email or dashboard for the auto-generated password
   - **Port**: `3306` (default)
4. Create the database:
   - In phpMyAdmin, click on "Databases" tab
   - Enter database name: `ticketing`
   - Select collation: `utf8mb4_unicode_ci`
   - Click **"Create"**

### Step 3: Deploy Application

#### Option A: Deploy via Git (Recommended)

1. In your environment, click on the **Node.js** node
2. Click the **"Add"** button and select **"VCS"** (Version Control System)
3. In the deployment dialog:
   - **URL**: Enter your Git repository URL (e.g., `https://github.com/yourusername/ticketing.git`)
   - **Branch**: Enter `main` (or your deployment branch)
   - **Context**: Leave as `ROOT` or set to your app folder
   - **Check Interval**: Set to 1 minute for auto-deployment on push (optional)
4. Click **"Add"**
5. Wait for the deployment to complete (check the deployment log in the dashboard)

#### Option B: Deploy via Archive Upload

1. Build your application locally:
   ```bash
   cd client && npm run build
   cd ..
   ```
2. Create a zip archive of your entire project (excluding `node_modules`)
3. In your environment, click on the **Node.js** node
4. Click **"Deployment Manager"**
5. Click **"Upload"** and select your zip file
6. Once uploaded, click **"Deploy to"** and select your environment
7. Click **"Deploy"**

### Step 4: Configure Environment Variables

1. Click on the **Node.js** node in your environment
2. Click the **"Config"** button (gear icon)
3. Navigate to the **"Variables"** section in the left menu
4. Add the following environment variables by clicking **"Add"**:

   ```env
   # Database Configuration
   DB_HOST=node<ID>-<env-name>.<provider-domain>
   DB_USER=root
   DB_PASSWORD=<mysql-password-from-step-2>
   DB_NAME=ticketing
   DB_PORT=3306
   
   # Server Configuration
   PORT=3000
   NODE_ENV=production
   
   # CORS Configuration
   CORS_ORIGIN=https://<env-name>.<provider-domain>
   ```

   **Note**: Replace the placeholders with your actual values:
   - `<ID>`: Your node ID (visible in the dashboard)
   - `<env-name>`: Your environment name
   - `<provider-domain>`: Your Virtuozzo provider's domain
   - `<mysql-password-from-step-2>`: The MySQL password from Step 2

5. Click **"Save"** at the bottom
6. **Restart** the Node.js node for the changes to take effect:
   - Click on the **"Restart Node(s)"** button next to your Node.js node

### Step 5: Initialize Database

The database tables will be created automatically when the application starts for the first time. The application includes automatic database initialization that will:

1. Connect to your MySQL database using the environment variables
2. Create all required tables (`events`, `seats`, `bookings`)
3. Set up the proper schema with foreign key relationships
4. Initialize the database structure

You can verify the initialization by:
- Checking the application logs in the Virtuozzo dashboard
- Looking for messages indicating successful database connection
- Verifying tables exist in phpMyAdmin

**Note**: If the application fails to start, check the logs by clicking on the **"Log"** button next to your Node.js node.

### Step 6: Access Application

Your application will be available at the following URLs:

- **Main Application**: `https://<env-name>.<provider-domain>`
  - Example: `https://ticketing-app.jls-sto1.elastx.net`
  
- **Admin Panel**: `https://<env-name>.<provider-domain>/admin`
  - Use this URL to manage events, view bookings, and configure the system
  
- **API Endpoints**: `https://<env-name>.<provider-domain>/api`
  - Base URL for all API requests
  
- **Health Check**: `https://<env-name>.<provider-domain>/api/health`
  - Returns `{"status":"ok","message":"Ticketing API is running"}` when the app is healthy

**Where to find your exact URL:**
1. In the Virtuozzo dashboard, look at your environment
2. The URL is displayed next to the **"Open in Browser"** button
3. It follows the pattern: `https://<env-name>.<provider-domain>`

**To enable a custom domain:**
1. Click **"Settings"** in your environment
2. Navigate to **"Custom Domains"**
3. Click **"Bind"** and enter your domain name
4. Follow the DNS configuration instructions provided
5. Update the `CORS_ORIGIN` environment variable to match your custom domain

## Post-Deployment Steps

### Verify Deployment

1. **Check health endpoint:**
   - Open your browser and navigate to: `https://<env-name>.<provider-domain>/api/health`
   - You should see: `{"status":"ok","message":"Ticketing API is running"}`
   - Or use curl from terminal:
     ```bash
     curl https://<env-name>.<provider-domain>/api/health
     ```

2. **Test the application:**
   - Access your frontend: `https://<env-name>.<provider-domain>`
   - Navigate to the admin panel: `https://<env-name>.<provider-domain>/admin`
   - Try creating a test event to verify database connectivity

3. **Check application logs:**
   - In the Virtuozzo dashboard, click on your Node.js node
   - Click the **"Log"** button to view real-time logs
   - Look for any errors or warnings
   - Verify successful database connection messages

### Monitoring

**Using Virtuozzo Dashboard:**
- **Resource Monitoring**: View CPU, RAM, and disk usage in real-time on the dashboard
- **Application Logs**: Access logs through the Log viewer for debugging
- **Statistics**: Check detailed statistics for load, memory, and network usage
- **Alerts**: Set up email alerts for resource usage thresholds in the environment settings

**Health Check Monitoring:**
- Use the `/api/health` endpoint for uptime monitoring
- Configure external monitoring services (like UptimeRobot) to ping this endpoint
- Set up alerts if the health check fails

### Scaling

Virtuozzo makes it easy to scale your application:

**Vertical Scaling (Increase Resources):**
1. Click on your Node.js or MySQL node
2. Use the slider to adjust **cloudlets** (resource units)
3. Changes take effect immediately without downtime
4. Recommended: 4-8 cloudlets for Node.js, 2-4 for MySQL under moderate load

**Horizontal Scaling (Add Instances):**
1. In the topology, increase the number of Node.js instances
2. Virtuozzo automatically configures load balancing
3. Useful for handling higher traffic volumes

**Database Scaling:**
- Increase MySQL cloudlets for better database performance
- Monitor database statistics in the dashboard
- Consider adding read replicas for high-traffic applications

### SSL/HTTPS

Virtuozzo automatically provides **free SSL certificates** for your environment:

1. **Built-in SSL**: Your application is automatically accessible via HTTPS
2. **SSL Certificate**: Managed by Virtuozzo, auto-renewed
3. **Verification**: Ensure all URLs use `https://` protocol
4. **CORS Configuration**: Make sure `CORS_ORIGIN` uses `https://` URLs

**For Custom Domains:**
1. Bind your custom domain in the environment settings
2. Virtuozzo will automatically provision an SSL certificate via Let's Encrypt
3. Certificate renewal is handled automatically

### Frontend Deployment

You have two options for the frontend:

**Option 1: Serve from the backend (already configured)**
- The application is configured to serve the built React frontend from the Node.js server
- Build the frontend: `cd client && npm run build`
- The build output is served automatically from the Express server
- Single environment deployment - simpler to manage

**Option 2: Deploy frontend separately (for advanced users)**
- Deploy frontend to a separate environment or CDN
- Update `CORS_ORIGIN` environment variable to match the frontend URL
- Provides better separation of concerns and independent scaling

### Backup Strategy

**Automated Backups in Virtuozzo:**
1. Click on your MySQL node
2. Go to **"Add-ons"** or **"Backup"** section
3. Enable automated backups:
   - Select backup frequency (daily recommended for production)
   - Set retention period (7-30 days)
   - Choose backup storage location
4. Backups can be restored through the dashboard with one click

**Manual Backup:**
1. Click on the MySQL node
2. Select **"Export"** to download a database dump
3. Store backups in a secure location
4. Test restore procedures periodically

**Best Practices:**
- Schedule daily automated backups for production environments
- Keep at least 7 days of backup history
- Test database restoration at least once a month
- Store critical backups off-platform for disaster recovery

## Troubleshooting

### Database Connection Issues

If you see database connection errors in the logs:

1. **Verify environment variables:**
   - Click on the Node.js node → Config → Variables
   - Check that `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_PORT` are correctly set
   - Ensure there are no extra spaces or special characters

2. **Check MySQL node accessibility:**
   - Verify the MySQL node is running (green status in dashboard)
   - The Node.js and MySQL nodes should be in the same environment
   - Internal communication between nodes is automatic in Virtuozzo

3. **Verify database credentials:**
   - Access phpMyAdmin through the MySQL node
   - Confirm the database `ticketing` exists
   - Test connection with the credentials

4. **Check MySQL user permissions:**
   - In phpMyAdmin, go to User Accounts
   - Ensure the user has all privileges on the `ticketing` database
   - Run: `GRANT ALL PRIVILEGES ON ticketing.* TO 'root'@'%';`

5. **Review Node.js logs:**
   - Click the **"Log"** button on the Node.js node
   - Look for specific MySQL error messages
   - Common errors: "Access denied", "Unknown database", "Connection timeout"

### Application Won't Start

If the Node.js application fails to start:

1. **Check the logs:**
   - View logs in the Virtuozzo dashboard
   - Look for npm install errors or missing dependencies
   - Check for syntax errors in your code

2. **Verify Node.js version:**
   - Ensure you're using Node.js 18 or higher
   - Check the version in the environment topology

3. **Check environment variables:**
   - Ensure `PORT` is not hardcoded in your application
   - The app should use `process.env.PORT || 3000`

4. **Restart the node:**
   - Click **"Restart Node(s)"** button
   - Wait for the restart to complete
   - Check logs again for new error messages

### CORS Errors

If the frontend can't connect to the backend API:

1. **Verify CORS_ORIGIN:**
   - Must match the frontend URL exactly
   - Include the protocol: `https://`
   - No trailing slash: ❌ `https://app.example.com/` → ✅ `https://app.example.com`
   - Example: `CORS_ORIGIN=https://ticketing-app.jls-sto1.elastx.net`

2. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for CORS-related errors
   - Verify the request URL matches your backend

3. **Restart after changes:**
   - After updating `CORS_ORIGIN`, restart the Node.js node
   - Clear browser cache or use incognito mode to test

### Port Issues

If you see port binding errors:

1. **Don't hardcode the port:**
   - Virtuozzo sets the `PORT` environment variable automatically
   - Your code should use: `const port = process.env.PORT || 3000;`

2. **Check port conflicts:**
   - View the environment topology
   - Ensure no other service is using the same port

3. **Verify Node.js configuration:**
   - Check `server/index.js` for correct port usage
   - Restart the node after any changes

### Memory Issues

If the application crashes due to out-of-memory errors:

1. **Check resource usage:**
   - View statistics in the Virtuozzo dashboard
   - Look for memory usage spikes

2. **Increase cloudlets:**
   - Click on the Node.js node
   - Increase the maximum cloudlets allocation
   - Start with 4-8 cloudlets for moderate usage

3. **Optimize your application:**
   - Review database queries for efficiency
   - Implement pagination for large datasets
   - Add caching where appropriate

4. **Check for memory leaks:**
   - Monitor memory usage over time
   - Look for steadily increasing memory consumption
   - Review recent code changes

### Deployment Failures

If Git deployment fails:

1. **Check deployment logs:**
   - In the dashboard, view the deployment history
   - Click on the failed deployment to see detailed logs

2. **Verify repository access:**
   - Ensure the Git repository URL is correct
   - For private repositories, add SSH keys or access tokens
   - Check branch name is correct

3. **Check build process:**
   - Ensure `package.json` has correct dependencies
   - Verify build scripts are properly configured
   - Check for post-install script errors

4. **Try manual deployment:**
   - Use archive upload method as an alternative
   - This helps isolate if the issue is with Git integration

### Performance Issues

If the application is slow:

1. **Monitor resources:**
   - Check CPU and memory usage in the dashboard
   - Identify resource bottlenecks

2. **Database optimization:**
   - Review slow query logs in MySQL
   - Add indexes to frequently queried columns
   - Increase MySQL cloudlets if needed

3. **Enable caching:**
   - Implement Redis cache for frequently accessed data
   - Add a Redis node to your environment

4. **Check network:**
   - Verify there are no network issues
   - Test latency between nodes

## Support

For deployment and technical issues:

**Virtuozzo Platform Support:**
- Access the Virtuozzo documentation: [https://docs.jelastic.com/](https://docs.jelastic.com/)
- Contact your Virtuozzo hosting provider's support team
- Check the Virtuozzo Community forum for solutions

**Application Support:**
- Review application logs in the Virtuozzo dashboard
- Test locally with production-like environment variables
- Check the Troubleshooting section above
- Create an issue on the GitHub repository for application-specific bugs

**Useful Resources:**
- [Virtuozzo Node.js Documentation](https://docs.jelastic.com/nodejs-center)
- [Virtuozzo MySQL Documentation](https://docs.jelastic.com/mysql-hosting)
- [Virtuozzo Deployment Guide](https://docs.jelastic.com/deployment-guide)

## Security Checklist

Before going to production, ensure:

- [ ] All environment variables are set properly (not hardcoded in code)
- [ ] Database credentials are secure and complex
- [ ] HTTPS is enabled (automatic in Virtuozzo)
- [ ] CORS is properly configured with specific origin (not `*`)
- [ ] Database backups are enabled and tested
- [ ] Application logs are being monitored
- [ ] Dependencies are up to date (`npm audit` shows no critical vulnerabilities)
- [ ] MySQL root password has been changed from default
- [ ] Database access is restricted to the application server only
- [ ] Environment has appropriate resource limits set
- [ ] Monitoring and alerts are configured for critical failures

## Additional Tips

### Environment Best Practices

1. **Use separate environments:**
   - Create a staging environment for testing
   - Keep production environment isolated
   - Test changes in staging before deploying to production

2. **Resource allocation:**
   - Start with minimal cloudlets and scale up as needed
   - Monitor resource usage for the first few days
   - Adjust based on actual usage patterns

3. **Automatic updates:**
   - Enable auto-deploy from Git for staging environment
   - Use manual deployment for production
   - Test thoroughly in staging before production deployment

### Cost Optimization

1. **Use dynamic cloudlets:**
   - Pay only for resources you actually use
   - Set minimum cloudlets low, maximum based on peak needs
   - Virtuozzo auto-scales within your defined range

2. **Monitor usage:**
   - Regular check resource consumption
   - Identify and fix resource leaks
   - Remove unused environments

3. **Database optimization:**
   - Keep database size optimized
   - Archive old data regularly
   - Use appropriate cloudlet allocation for your database load

### Quick Reference Commands

**Check application logs:**
- Click Node.js node → Log button

**Restart application:**
- Click Node.js node → Restart button

**View environment variables:**
- Click Node.js node → Config → Variables

**Access database:**
- Click MySQL node → Open in Browser (phpMyAdmin)

**Update deployment:**
- Click Node.js node → Deployment (if using Git)
- Or upload new archive via Deployment Manager

---

**Congratulations!** Your Ticketing System is now deployed on Virtuozzo Application Platform. 🎉

For questions or issues, refer to the Troubleshooting section or contact support.
