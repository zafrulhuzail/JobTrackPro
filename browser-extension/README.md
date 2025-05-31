# JobTracker Browser Extension

This Chrome extension automatically extracts job posting details from popular job boards and saves them directly to your JobTracker application.

## Features

- **Auto-extraction**: Automatically detects and extracts job details from:
  - LinkedIn Jobs
  - Indeed
  - Glassdoor
  - Google Careers
  - Apple Jobs
  - Microsoft Careers
  - Netflix Jobs
  - Lever (ATS)
  - Greenhouse (ATS)
  - And many more job sites

- **One-click saving**: Extract job details and save to your JobTracker with a single click
- **Smart detection**: Visual indicator appears on supported job posting pages
- **Customizable server**: Configure your JobTracker server URL

## Installation

1. **Download the extension files** to your computer
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the `browser-extension` folder
5. **Pin the extension** to your toolbar for easy access

## Usage

1. **Navigate to a job posting** on any supported job board
2. **Look for the blue "JobTracker" indicator** in the top-right corner of the page
3. **Click the extension icon** in your browser toolbar
4. **Review the extracted details** (edit if needed)
5. **Set your JobTracker server URL** in the settings (first time only)
6. **Click "Save Application"** to add it to your JobTracker

## Setup Your Server URL

On first use, you'll need to configure your JobTracker server URL:
- Open the extension popup
- In the "JobTracker Server URL" field, enter your app's URL
- For Replit deployments, this will be something like: `https://your-app-name.replit.app`
- For local development: `http://localhost:5000`

## Supported Job Boards

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
- Any site using Lever or Greenhouse ATS

## Authentication

Make sure you're logged into your JobTracker application in the same browser before using the extension. The extension uses your existing login session to save applications.

## Troubleshooting

**"Please log in to your JobTracker account first"**
- Open your JobTracker app in a new tab and log in
- Try saving the application again

**"Error connecting to JobTracker server"**
- Check that your server URL is correct
- Ensure your JobTracker app is running and accessible

**"Could not extract job details from this page"**
- The page might not be supported yet
- Try manually filling in the details in the extension popup
- The extension works best on actual job posting pages (not search results)

## Privacy

This extension only accesses job posting pages and communicates with your configured JobTracker server. No data is sent to third parties.