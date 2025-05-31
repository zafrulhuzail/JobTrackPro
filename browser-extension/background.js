// Background script for the JobTracker extension
// Handles extension lifecycle and communication between components

chrome.runtime.onInstalled.addListener(() => {
  console.log('JobTracker extension installed');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openPopup') {
    // Open the extension popup programmatically
    chrome.action.openPopup();
  }
  
  // Allow async response
  return true;
});

// Update extension icon based on page detection
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    updateExtensionIcon(tab.url, tabId);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    updateExtensionIcon(tab.url, activeInfo.tabId);
  }
});

function updateExtensionIcon(url, tabId) {
  const isJobSite = isJobPostingPage(url);
  
  // Update icon based on whether this is a job posting page
  chrome.action.setIcon({
    tabId: tabId,
    path: {
      16: isJobSite ? 'icon16-active.png' : 'icon16.png',
      48: isJobSite ? 'icon48-active.png' : 'icon48.png',
      128: isJobSite ? 'icon128-active.png' : 'icon128.png'
    }
  });
  
  // Update title
  chrome.action.setTitle({
    tabId: tabId,
    title: isJobSite 
      ? 'JobTracker - Click to extract job details' 
      : 'JobTracker - No job posting detected'
  });
}

function isJobPostingPage(url) {
  const jobSitePatterns = [
    'linkedin.com/jobs',
    'indeed.com/viewjob',
    'glassdoor.com/job-listing',
    'jobs.lever.co',
    'boards.greenhouse.io',
    'careers.google.com',
    'jobs.apple.com',
    'careers.microsoft.com',
    'jobs.netflix.com',
    'careers.stripe.com',
    'jobs.spotify.com',
    'uber.com/careers',
    'tesla.com/careers',
    'metacareers.com',
    'careers.airbnb.com'
  ];
  
  return jobSitePatterns.some(pattern => url.includes(pattern));
}