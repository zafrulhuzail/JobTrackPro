// Initialize popup when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved server URL
  const result = await chrome.storage.sync.get(['serverUrl']);
  const serverUrlInput = document.getElementById('serverUrl');
  if (result.serverUrl) {
    serverUrlInput.value = result.serverUrl;
  } else {
    // Default to current domain
    serverUrlInput.value = window.location.origin.includes('replit.dev') 
      ? window.location.origin 
      : 'https://jobtrackpro-production.up.railway.app';
  }

  // Save server URL when changed
  serverUrlInput.addEventListener('change', async () => {
    await chrome.storage.sync.set({ serverUrl: serverUrlInput.value });
  });

  // Extract details button
  document.getElementById('extractBtn').addEventListener('click', extractJobDetails);
  
  // Save application button
  document.getElementById('saveBtn').addEventListener('click', saveApplication);

  // Auto-extract details when popup opens
  extractJobDetails();
});

async function extractJobDetails() {
  showStatus('Extracting job details...', 'info');
  
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Execute content script to extract job details
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractJobFromPage,
    });

    if (result.result) {
      const jobData = result.result;
      
      // Populate form fields
      document.getElementById('company').value = jobData.company || '';
      document.getElementById('position').value = jobData.position || '';
      document.getElementById('location').value = jobData.location || '';
      document.getElementById('department').value = jobData.department || '';
      document.getElementById('notes').value = jobData.notes || `Applied via ${jobData.source || 'job board'}`;
      
      showStatus('Job details extracted successfully!', 'success');
    } else {
      showStatus('Could not extract job details from this page', 'error');
    }
  } catch (error) {
    console.error('Error extracting job details:', error);
    showStatus('Error extracting job details', 'error');
  }
}

async function saveApplication() {
  const serverUrl = document.getElementById('serverUrl').value;
  
  if (!serverUrl) {
    showStatus('Please set your JobTracker server URL', 'error');
    return;
  }

  const jobData = {
    companyName: document.getElementById('company').value,
    position: document.getElementById('position').value,
    location: document.getElementById('location').value,
    department: document.getElementById('department').value,
    notes: document.getElementById('notes').value,
    status: 'applied',
    applicationDate: new Date().toISOString().split('T')[0],
    jobUrl: ''
  };

  // Get current tab URL
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    jobData.jobUrl = tab.url;
  } catch (error) {
    console.error('Could not get tab URL:', error);
  }

  // Validate required fields
  if (!jobData.companyName || !jobData.position) {
    showStatus('Company and Position are required', 'error');
    return;
  }

  showStatus('Saving application...', 'info');

  try {
    const response = await fetch(`${serverUrl}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(jobData)
    });

    if (response.ok) {
      showStatus('Application saved successfully!', 'success');
      // Close popup after 2 seconds
      setTimeout(() => {
        window.close();
      }, 2000);
    } else if (response.status === 401) {
      showStatus('Please log in to your JobTracker account first', 'error');
    } else {
      showStatus('Failed to save application', 'error');
    }
  } catch (error) {
    console.error('Error saving application:', error);
    showStatus('Error connecting to JobTracker server', 'error');
  }
}

function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  statusEl.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }
}

// This function will be injected into the current page
function extractJobFromPage() {
  const url = window.location.href;
  let jobData = { source: 'Unknown' };

  // LinkedIn Jobs
  if (url.includes('linkedin.com/jobs')) {
    jobData.source = 'LinkedIn';
    jobData.company = document.querySelector('.job-details-jobs-unified-top-card__company-name a, .jobs-unified-top-card__company-name a')?.textContent?.trim();
    jobData.position = document.querySelector('.job-details-jobs-unified-top-card__job-title h1, .jobs-unified-top-card__job-title h1')?.textContent?.trim();
    jobData.location = document.querySelector('.job-details-jobs-unified-top-card__primary-description-container .jobs-unified-top-card__bullet, .jobs-unified-top-card__primary-description-container .jobs-unified-top-card__bullet')?.textContent?.trim();
  }
  
  // Indeed
  else if (url.includes('indeed.com')) {
    jobData.source = 'Indeed';
    jobData.company = document.querySelector('[data-testid="inlineHeader-companyName"] a, .jobsearch-CompanyInfoContainer a')?.textContent?.trim();
    jobData.position = document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"], .jobsearch-JobInfoHeader-title')?.textContent?.trim();
    jobData.location = document.querySelector('[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle')?.textContent?.trim();
  }
  
  // Glassdoor
  else if (url.includes('glassdoor.com')) {
    jobData.source = 'Glassdoor';
    jobData.company = document.querySelector('.employer-name, [data-test="employer-name"]')?.textContent?.trim();
    jobData.position = document.querySelector('.job-title, [data-test="job-title"]')?.textContent?.trim();
    jobData.location = document.querySelector('.job-location, [data-test="job-location"]')?.textContent?.trim();
  }
  
  // Google Careers
  else if (url.includes('careers.google.com')) {
    jobData.source = 'Google Careers';
    jobData.company = 'Google';
    jobData.position = document.querySelector('.gc-job-detail__title, h1')?.textContent?.trim();
    jobData.location = document.querySelector('.gc-job-detail__location')?.textContent?.trim();
  }
  
  // Apple Jobs
  else if (url.includes('jobs.apple.com')) {
    jobData.source = 'Apple Jobs';
    jobData.company = 'Apple';
    jobData.position = document.querySelector('.hero-headline, h1')?.textContent?.trim();
    jobData.location = document.querySelector('.hero-location')?.textContent?.trim();
  }
  
  // Microsoft Careers
  else if (url.includes('careers.microsoft.com')) {
    jobData.source = 'Microsoft Careers';
    jobData.company = 'Microsoft';
    jobData.position = document.querySelector('.job-title, h1')?.textContent?.trim();
    jobData.location = document.querySelector('.job-location')?.textContent?.trim();
  }
  
  // Lever (common ATS)
  else if (url.includes('jobs.lever.co')) {
    jobData.source = 'Lever';
    jobData.company = document.querySelector('.main-header-text a, .company-name')?.textContent?.trim();
    jobData.position = document.querySelector('.posting-headline h2, .posting-title')?.textContent?.trim();
    jobData.location = document.querySelector('.posting-categories .location, .posting-location')?.textContent?.trim();
  }
  
  // Greenhouse (common ATS)
  else if (url.includes('boards.greenhouse.io')) {
    jobData.source = 'Greenhouse';
    jobData.company = document.querySelector('.company-name, header h1')?.textContent?.trim();
    jobData.position = document.querySelector('.app-title, .job-title')?.textContent?.trim();
    jobData.location = document.querySelector('.location, .job-location')?.textContent?.trim();
  }

  // Fallback: try to extract from common HTML patterns
  if (!jobData.company || !jobData.position) {
    // Try common patterns
    jobData.company = jobData.company || document.querySelector('h1, .company, .employer, [class*="company"]')?.textContent?.trim();
    jobData.position = jobData.position || document.querySelector('h1, .title, .job-title, [class*="title"]')?.textContent?.trim();
    jobData.location = jobData.location || document.querySelector('.location, [class*="location"]')?.textContent?.trim();
  }

  // Clean up extracted text
  Object.keys(jobData).forEach(key => {
    if (typeof jobData[key] === 'string') {
      jobData[key] = jobData[key].replace(/\s+/g, ' ').trim();
    }
  });

  return jobData;
}