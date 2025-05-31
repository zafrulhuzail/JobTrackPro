// Content script that runs on job posting pages
// This script can communicate with the popup and background script

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobData') {
    const jobData = extractJobFromCurrentPage();
    sendResponse(jobData);
  }
});

function extractJobFromCurrentPage() {
  const url = window.location.href;
  let jobData = { 
    source: getJobBoardName(url),
    url: url
  };

  // LinkedIn Jobs
  if (url.includes('linkedin.com/jobs')) {
    jobData.company = getTextContent([
      '.job-details-jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name'
    ]);
    
    jobData.position = getTextContent([
      '.job-details-jobs-unified-top-card__job-title h1',
      '.jobs-unified-top-card__job-title h1',
      '.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title'
    ]);
    
    jobData.location = getTextContent([
      '.job-details-jobs-unified-top-card__primary-description-container .jobs-unified-top-card__bullet',
      '.jobs-unified-top-card__primary-description-container .jobs-unified-top-card__bullet',
      '.job-details-jobs-unified-top-card__bullet',
      '.jobs-unified-top-card__bullet'
    ]);
  }
  
  // Indeed
  else if (url.includes('indeed.com')) {
    jobData.company = getTextContent([
      '[data-testid="inlineHeader-companyName"] a',
      '.jobsearch-CompanyInfoContainer a',
      '[data-testid="inlineHeader-companyName"]',
      '.jobsearch-InlineCompanyRating + a'
    ]);
    
    jobData.position = getTextContent([
      '[data-testid="jobsearch-JobInfoHeader-title"]',
      '.jobsearch-JobInfoHeader-title',
      'h1[data-jk]'
    ]);
    
    jobData.location = getTextContent([
      '[data-testid="job-location"]',
      '.jobsearch-JobInfoHeader-subtitle',
      '[data-testid="jobsearch-JobInfoHeader-subtitle"]'
    ]);
  }
  
  // Glassdoor
  else if (url.includes('glassdoor.com')) {
    jobData.company = getTextContent([
      '.employer-name',
      '[data-test="employer-name"]',
      '.employerName'
    ]);
    
    jobData.position = getTextContent([
      '.job-title',
      '[data-test="job-title"]',
      '.jobTitle'
    ]);
    
    jobData.location = getTextContent([
      '.job-location',
      '[data-test="job-location"]',
      '.jobLocation'
    ]);
  }
  
  // Company-specific career pages
  else if (url.includes('careers.google.com')) {
    jobData.company = 'Google';
    jobData.position = getTextContent(['.gc-job-detail__title', 'h1']);
    jobData.location = getTextContent(['.gc-job-detail__location']);
  }
  
  else if (url.includes('jobs.apple.com')) {
    jobData.company = 'Apple';
    jobData.position = getTextContent(['.hero-headline', 'h1']);
    jobData.location = getTextContent(['.hero-location']);
  }
  
  else if (url.includes('careers.microsoft.com')) {
    jobData.company = 'Microsoft';
    jobData.position = getTextContent(['.job-title', 'h1']);
    jobData.location = getTextContent(['.job-location']);
  }
  
  else if (url.includes('jobs.netflix.com')) {
    jobData.company = 'Netflix';
    jobData.position = getTextContent(['h1', '.job-title']);
    jobData.location = getTextContent(['.job-location', '.location']);
  }
  
  // ATS platforms
  else if (url.includes('jobs.lever.co')) {
    jobData.company = getTextContent([
      '.main-header-text a',
      '.company-name',
      'header a'
    ]);
    jobData.position = getTextContent([
      '.posting-headline h2',
      '.posting-title',
      'h2'
    ]);
    jobData.location = getTextContent([
      '.posting-categories .location',
      '.posting-location',
      '.location'
    ]);
  }
  
  else if (url.includes('boards.greenhouse.io')) {
    jobData.company = getTextContent([
      '.company-name',
      'header h1',
      '.app-title'
    ]);
    jobData.position = getTextContent([
      '.app-title',
      '.job-title',
      'h1'
    ]);
    jobData.location = getTextContent([
      '.location',
      '.job-location'
    ]);
  }

  // Generic fallback patterns
  if (!jobData.company || !jobData.position) {
    // Try meta tags first
    jobData.company = jobData.company || 
      document.querySelector('meta[property="og:site_name"]')?.content ||
      document.querySelector('meta[name="author"]')?.content;
    
    jobData.position = jobData.position || 
      document.querySelector('meta[property="og:title"]')?.content ||
      document.title;
    
    // Try common class patterns
    if (!jobData.company) {
      jobData.company = getTextContent([
        '.company',
        '.employer',
        '[class*="company"]',
        '[class*="employer"]'
      ]);
    }
    
    if (!jobData.position) {
      jobData.position = getTextContent([
        'h1',
        '.title',
        '.job-title',
        '[class*="title"]',
        '[class*="job"]'
      ]);
    }
    
    if (!jobData.location) {
      jobData.location = getTextContent([
        '.location',
        '[class*="location"]',
        '[class*="address"]'
      ]);
    }
  }

  // Clean up extracted data
  Object.keys(jobData).forEach(key => {
    if (typeof jobData[key] === 'string') {
      jobData[key] = cleanText(jobData[key]);
    }
  });

  // Extract department from position if possible
  if (jobData.position && !jobData.department) {
    const commonDepartments = [
      'Engineering', 'Marketing', 'Sales', 'Product', 'Design', 
      'Operations', 'Finance', 'Legal', 'HR', 'Data', 'Security'
    ];
    
    for (const dept of commonDepartments) {
      if (jobData.position.toLowerCase().includes(dept.toLowerCase())) {
        jobData.department = dept;
        break;
      }
    }
  }

  return jobData;
}

function getTextContent(selectors) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      return element.textContent.trim();
    }
  }
  return '';
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\n\r\t]/g, ' ')
    .trim();
}

function getJobBoardName(url) {
  if (url.includes('linkedin.com')) return 'LinkedIn';
  if (url.includes('indeed.com')) return 'Indeed';
  if (url.includes('glassdoor.com')) return 'Glassdoor';
  if (url.includes('careers.google.com')) return 'Google Careers';
  if (url.includes('jobs.apple.com')) return 'Apple Jobs';
  if (url.includes('careers.microsoft.com')) return 'Microsoft Careers';
  if (url.includes('jobs.netflix.com')) return 'Netflix Jobs';
  if (url.includes('jobs.lever.co')) return 'Lever';
  if (url.includes('boards.greenhouse.io')) return 'Greenhouse';
  return new URL(url).hostname;
}

// Add visual indicator when extension is active
function addExtensionIndicator() {
  if (document.getElementById('jobtracker-indicator')) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'jobtracker-indicator';
  indicator.innerHTML = '📋 JobTracker';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #2563eb;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    cursor: pointer;
  `;
  
  indicator.addEventListener('click', () => {
    // This will trigger the popup to open
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });
  
  document.body.appendChild(indicator);
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    indicator.style.opacity = '0.3';
  }, 3000);
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addExtensionIndicator);
} else {
  addExtensionIndicator();
}