import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  baseUrl: string
): Promise<boolean> {
  try {
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    await mailService.send({
      to: email,
      from: 'huzailakazaf@gmail.com',
      subject: 'Reset Your JobTracker Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Reset Your Password</h2>
          <p>We received a request to reset your password for your JobTracker account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">JobTracker - Job Application Tracking</p>
        </div>
      `,
      text: `
        Reset Your JobTracker Password
        
        We received a request to reset your password for your JobTracker account.
        
        Click this link to reset your password: ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request this password reset, you can safely ignore this email.
      `
    });
    
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}