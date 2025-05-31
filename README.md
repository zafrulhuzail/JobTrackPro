# JobTracker Pro

A comprehensive job application tracking system that helps you manage and monitor your job search process. Track applications, set reminders, analyze your progress, and automatically extract job details from popular job boards using the included browser extension.

## Features

### Core Application
- **Application Management**: Add, edit, and track job applications with detailed information
- **Smart Dashboard**: View application statistics, progress charts, and quick insights
- **Multiple Views**: Switch between table and card views for your applications
- **Data Export**: Export your application data to CSV for external analysis
- **User Authentication**: Secure login with email/password or Google OAuth integration
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Browser Extension
- **Auto-Extraction**: Automatically detect and extract job details from 15+ job boards
- **Supported Sites**: LinkedIn, Indeed, Glassdoor, Google Careers, Apple Jobs, Microsoft, Netflix, and more
- **One-Click Save**: Extract job details and save directly to your JobTracker with a single click
- **Smart Detection**: Visual indicators appear on supported job posting pages
- **Cross-Platform**: Works with any site using Lever or Greenhouse ATS platforms

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local and Google OAuth strategies
- **Deployment**: Optimized for Replit hosting

## Quick Start

### 1. Set Up the Application

```bash
# Install dependencies
npm install

# Set up your database URL
export DATABASE_URL="your_postgresql_connection_string"

# Push database schema
npm run db:push

# Start the application
npm run dev
```

The application will be available at `http://localhost:5000`.

### 2. Install Browser Extension

1. Navigate to `chrome://extensions/` in Chrome
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked" and select the `browser-extension` folder
4. Pin the extension to your toolbar for easy access

### 3. Configure Extension

1. Open the extension popup
2. Set your JobTracker server URL:
   - Local development: `http://localhost:5000`
   - Replit deployment: `https://your-app-name.replit.dev`
3. Make sure you're logged into your JobTracker app in the same browser

## Usage

### Managing Applications

1. **Add Applications**: Click "Add Application" to manually enter job details
2. **Edit Applications**: Click any application to view and edit details
3. **Track Progress**: Use status updates to monitor your application pipeline
4. **Export Data**: Use the export feature in Settings to download your data

### Using the Browser Extension

1. Navigate to any job posting on supported job boards
2. Look for the blue "JobTracker" indicator on the page
3. Click the extension icon in your toolbar
4. Review auto-extracted details (edit if needed)
5. Click "Save Application" to add to your tracker

### Supported Job Boards

- LinkedIn Jobs
- Indeed
- Glassdoor
- Google Careers
- Apple Jobs
- Microsoft Careers
- Netflix Jobs
- Stripe Careers
- Spotify Jobs
- Uber Careers
- Tesla Careers
- Meta Careers
- Airbnb Careers
- Any site using Lever ATS
- Any site using Greenhouse ATS

## Environment Variables

Required environment variables:

```bash
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your_session_secret_key
```

Optional (for Google OAuth):
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Database Schema

The application uses three main tables:

- **users**: User accounts and authentication
- **applications**: Job application tracking data
- **sessions**: User session management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user info

### Applications
- `GET /api/applications` - List user's applications
- `POST /api/applications` - Create new application
- `GET /api/applications/:id` - Get specific application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `GET /api/applications/stats` - Get application statistics

## Development

### Local Development Setup

1. Install PostgreSQL locally
2. Create a database: `createdb jobtracker`
3. Set environment variables in your shell profile
4. Run database migrations: `npm run db:push`
5. Start development server: `npm run dev`

### Using Replit Database Locally

```bash
# Get database URL from your Replit environment
export DATABASE_URL="postgresql://username:password@host/database"
npm run dev
```

## Deployment

### Replit Deployment
1. Push your code to Replit
2. The database is automatically provisioned
3. Set any required environment variables
4. Deploy using Replit's deployment features

### Other Platforms
1. Set up PostgreSQL database
2. Configure environment variables
3. Run `npm run db:push` to set up schema
4. Deploy using your preferred platform

## Browser Extension Development

The extension is located in the `browser-extension` folder and includes:

- `manifest.json` - Extension configuration
- `content.js` - Page content extraction logic
- `popup.js` - Extension popup interface
- `background.js` - Background service worker
- `popup.html` - Extension popup UI

To modify the extension:
1. Make changes to the extension files
2. Reload the extension in Chrome
3. Test on supported job posting sites

## Troubleshooting

### Common Issues

**"Error connecting to JobTracker server"**
- Check that your app is running and accessible
- Verify the server URL in the extension settings
- Ensure you're logged into your JobTracker account

**"Registration failed" / "Login failed"**
- Verify database connection is working
- Check that all required fields are filled
- Ensure DATABASE_URL environment variable is set

**Extension not detecting job pages**
- Verify you're on an actual job posting page (not search results)
- Check if the site is in the supported list
- Try refreshing the page and reopening the extension

**Local development database errors**
- Set the DATABASE_URL environment variable
- Ensure PostgreSQL is running
- Run `npm run db:push` to create tables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the browser extension README for extension-specific issues
3. Ensure all environment variables are properly configured