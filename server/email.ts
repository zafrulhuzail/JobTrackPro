import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Email templates
export function createApplicationReminderEmail(companyName: string, position: string, daysSinceApplication: number) {
  return {
    subject: `Follow-up Reminder: ${position} at ${companyName}`,
    text: `Hi there!

It's been ${daysSinceApplication} days since you applied for the ${position} position at ${companyName}. 

Consider following up with the hiring manager or recruiter to show your continued interest in the role.

Best of luck with your job search!

- JobTracker`,
    html: `
      <h2>Follow-up Reminder</h2>
      <p>Hi there!</p>
      <p>It's been <strong>${daysSinceApplication} days</strong> since you applied for the <strong>${position}</strong> position at <strong>${companyName}</strong>.</p>
      <p>Consider following up with the hiring manager or recruiter to show your continued interest in the role.</p>
      <p>Best of luck with your job search!</p>
      <p>- JobTracker</p>
    `
  };
}

export function createInterviewReminderEmail(companyName: string, position: string, interviewDate?: string) {
  return {
    subject: `Interview Reminder: ${position} at ${companyName}`,
    text: `Hi there!

This is a reminder about your upcoming interview for the ${position} position at ${companyName}.

${interviewDate ? `Interview Date: ${interviewDate}` : 'Please check your calendar for the exact time.'}

Good luck with your interview!

- JobTracker`,
    html: `
      <h2>Interview Reminder</h2>
      <p>Hi there!</p>
      <p>This is a reminder about your upcoming interview for the <strong>${position}</strong> position at <strong>${companyName}</strong>.</p>
      ${interviewDate ? `<p><strong>Interview Date:</strong> ${interviewDate}</p>` : '<p>Please check your calendar for the exact time.</p>'}
      <p>Good luck with your interview!</p>
      <p>- JobTracker</p>
    `
  };
}

export function createWeeklySummaryEmail(stats: {
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
  responseRate: number;
}, recentApplications: Array<{companyName: string; position: string; status: string}>) {
  return {
    subject: 'Your Weekly Job Search Summary',
    text: `Your Weekly Job Search Summary

Here's your job search progress this week:

📊 Statistics:
- Total Applications: ${stats.totalApplications}
- Pending Applications: ${stats.pendingApplications}
- Interviews Scheduled: ${stats.interviewsScheduled}
- Response Rate: ${stats.responseRate}%

Recent Activity:
${recentApplications.map(app => `• ${app.position} at ${app.companyName} - ${app.status}`).join('\n')}

Keep up the great work!

- JobTracker`,
    html: `
      <h2>Your Weekly Job Search Summary</h2>
      <p>Here's your job search progress this week:</p>
      
      <h3>📊 Statistics</h3>
      <ul>
        <li><strong>Total Applications:</strong> ${stats.totalApplications}</li>
        <li><strong>Pending Applications:</strong> ${stats.pendingApplications}</li>
        <li><strong>Interviews Scheduled:</strong> ${stats.interviewsScheduled}</li>
        <li><strong>Response Rate:</strong> ${stats.responseRate}%</li>
      </ul>
      
      <h3>Recent Activity</h3>
      <ul>
        ${recentApplications.map(app => `<li><strong>${app.position}</strong> at ${app.companyName} - <em>${app.status}</em></li>`).join('')}
      </ul>
      
      <p>Keep up the great work!</p>
      <p>- JobTracker</p>
    `
  };
}