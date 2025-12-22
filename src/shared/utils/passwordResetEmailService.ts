import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface PasswordResetEmailData {
  userName: string;
  resetLink: string;
  expiresIn: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, data: PasswordResetEmailData): Promise<boolean> {
    try {
      const html = this.generatePasswordResetHTML(data);
      const text = this.generatePasswordResetText(data);

      const mailOptions: EmailOptions = {
        to: email,
        subject: 'Password Reset Request - Attendance Tracker',
        html,
        text,
      };

      await this.sendEmail(mailOptions);
      console.log(`Password reset email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error(`Failed to send password reset email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send general email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@mastery.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Generate password reset HTML email template
   */
  private generatePasswordResetHTML(data: PasswordResetEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #007bff;
            color: white;
            border-radius: 10px 10px 0 0;
            margin: -20px -20px 20px -20px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          
          <p>Hello ${data.userName},</p>
          
          <p>We received a request to reset your password for your Attendance Tracker account. If you made this request, please click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${data.resetLink}" class="button">Reset My Password</a>
          </div>
          
          <p>Alternatively, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
            ${data.resetLink}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important Security Information:</strong>
            <ul>
              <li>This link will expire in ${data.expiresIn}</li>
              <li>This link can only be used once</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If you're having trouble with the button above, contact your system administrator for assistance.</p>
          
          <div class="footer">
            <p>Best regards,<br>
            The Attendance Tracker Team</p>
            
            <p><small>This is an automated message. Please do not reply to this email.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate password reset plain text email
   */
  private generatePasswordResetText(data: PasswordResetEmailData): string {
    return `
Password Reset Request - Attendance Tracker

Hello ${data.userName},

We received a request to reset your password for your Attendance Tracker account.

Reset Link: ${data.resetLink}

Important Security Information:
- This link will expire in ${data.expiresIn}
- This link can only be used once
- If you didn't request this password reset, please ignore this email
- Never share this link with anyone

If you're having trouble with the link above, contact your system administrator for assistance.

Best regards,
The Attendance Tracker Team

This is an automated message. Please do not reply to this email.
    `.trim();
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection test successful');
      return true;
    } catch (error) {
      console.error('Email service connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();