import { Request, Response } from 'express';
import { 
  EmailSettingsService, 
  SMTPConfig, 
  EmailTemplate, 
  NotificationSchedule, 
  EmailNotificationSettings 
} from './emailSettings.service';
import { ValidationError, AuthenticatedRequest } from '../../types';

export class EmailSettingsController {
  private emailSettingsService: EmailSettingsService;

  constructor() {
    this.emailSettingsService = new EmailSettingsService();
  }

  /**
   * Get SMTP configuration
   * GET /api/v1/settings/email/smtp
   */
  async getSMTPConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const smtpConfig = await this.emailSettingsService.getSMTPConfig();
      
      // Hide sensitive information
      const safeConfig = {
        ...smtpConfig,
        pass: '***hidden***'
      };

      res.status(200).json({
        success: true,
        message: 'SMTP configuration retrieved successfully',
        data: safeConfig
      });
    } catch (error) {
      console.error('Error fetching SMTP config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch SMTP configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update SMTP configuration
   * PUT /api/v1/settings/email/smtp
   */
  async updateSMTPConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const smtpData: Partial<SMTPConfig> = req.body;

      const updatedConfig = await this.emailSettingsService.updateSMTPConfig(smtpData);
      
      // Hide sensitive information
      const safeConfig = {
        ...updatedConfig,
        pass: '***hidden***'
      };

      res.status(200).json({
        success: true,
        message: 'SMTP configuration updated successfully',
        data: safeConfig
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error updating SMTP config:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update SMTP configuration',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Test SMTP connection
   * POST /api/v1/settings/email/smtp/test
   */
  async testSMTPConnection(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.emailSettingsService.testSMTPConnection();

      res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message,
        data: result.details
      });
    } catch (error) {
      console.error('Error testing SMTP connection:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test SMTP connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get email template
   * GET /api/v1/settings/email/templates/:templateName
   */
  async getEmailTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { templateName } = req.params;
      const template = await this.emailSettingsService.getEmailTemplate(templateName);

      res.status(200).json({
        success: true,
        message: 'Email template retrieved successfully',
        data: { templateName, template }
      });
    } catch (error) {
      console.error('Error fetching email template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch email template',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update email template
   * PUT /api/v1/settings/email/templates/:templateName
   */
  async updateEmailTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { templateName } = req.params;
      const templateData: Partial<EmailTemplate> = req.body;

      const updatedTemplate = await this.emailSettingsService.updateEmailTemplate(templateName, templateData);

      res.status(200).json({
        success: true,
        message: 'Email template updated successfully',
        data: { templateName, template: updatedTemplate }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error updating email template:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update email template',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Get all email templates
   * GET /api/v1/settings/email/templates
   */
  async getAllEmailTemplates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const templates = await this.emailSettingsService.getAllEmailTemplates();

      res.status(200).json({
        success: true,
        message: 'Email templates retrieved successfully',
        data: templates,
        count: Object.keys(templates).length
      });
    } catch (error) {
      console.error('Error fetching email templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch email templates',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get notification schedule
   * GET /api/v1/settings/email/schedule
   */
  async getNotificationSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const schedule = await this.emailSettingsService.getNotificationSchedule();

      res.status(200).json({
        success: true,
        message: 'Notification schedule retrieved successfully',
        data: schedule
      });
    } catch (error) {
      console.error('Error fetching notification schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notification schedule',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update notification schedule
   * PUT /api/v1/settings/email/schedule
   */
  async updateNotificationSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const scheduleData: Partial<NotificationSchedule> = req.body;

      const updatedSchedule = await this.emailSettingsService.updateNotificationSchedule(scheduleData);

      res.status(200).json({
        success: true,
        message: 'Notification schedule updated successfully',
        data: updatedSchedule,
        note: 'Schedule changes require server restart to take effect'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error updating notification schedule:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update notification schedule',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Get email notification settings
   * GET /api/v1/settings/email/notifications
   */
  async getEmailNotificationSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const settings = await this.emailSettingsService.getEmailNotificationSettings();

      res.status(200).json({
        success: true,
        message: 'Email notification settings retrieved successfully',
        data: settings
      });
    } catch (error) {
      console.error('Error fetching email notification settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch email notification settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update email notification settings
   * PUT /api/v1/settings/email/notifications
   */
  async updateEmailNotificationSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const settingsData: Partial<EmailNotificationSettings> = req.body;

      const updatedSettings = await this.emailSettingsService.updateEmailNotificationSettings(settingsData);

      res.status(200).json({
        success: true,
        message: 'Email notification settings updated successfully',
        data: updatedSettings
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error updating email notification settings:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update email notification settings',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Get complete email configuration
   * GET /api/v1/settings/email/complete
   */
  async getCompleteEmailConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const config = await this.emailSettingsService.getCompleteEmailConfig();
      
      // Hide sensitive SMTP password
      config.smtp.pass = '***hidden***';

      res.status(200).json({
        success: true,
        message: 'Complete email configuration retrieved successfully',
        data: config
      });
    } catch (error) {
      console.error('Error fetching complete email config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complete email configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Initialize email default settings
   * POST /api/v1/settings/email/initialize
   */
  async initializeEmailDefaults(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await this.emailSettingsService.initializeEmailDefaults();
      const config = await this.emailSettingsService.getCompleteEmailConfig();
      
      // Hide sensitive SMTP password
      config.smtp.pass = '***hidden***';

      res.status(200).json({
        success: true,
        message: 'Email default settings initialized successfully',
        data: config
      });
    } catch (error) {
      console.error('Error initializing email defaults:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize email defaults',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Send test email
   * POST /api/v1/settings/email/test
   */
  async sendTestEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { recipientEmail, templateName } = req.body;

      if (!recipientEmail) {
        res.status(400).json({
          success: false,
          message: 'Recipient email is required',
          example: { recipientEmail: 'test@company.com', templateName: 'attendance_reminder' }
        });
        return;
      }

      // Get email configuration
      const smtpConfig = await this.emailSettingsService.getSMTPConfig();
      const template = await this.emailSettingsService.getEmailTemplate(templateName || 'attendance_reminder');

      // Create test data
      const testData = {
        employeeName: 'Test Employee',
        employeeId: 'TEST001',
        currentTime: new Date().toLocaleString(),
        attendanceUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/attendance`,
        companyName: 'Test Company'
      };

      // Replace variables in template
      let subject = template.subject;
      let htmlBody = template.htmlBody;
      let textBody = template.textBody;

      for (const [key, value] of Object.entries(testData)) {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        htmlBody = htmlBody.replace(new RegExp(placeholder, 'g'), value);
        textBody = textBody.replace(new RegExp(placeholder, 'g'), value);
      }

      // Send test email using nodemailer
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass
        }
      });

      const startTime = Date.now();
      await transporter.sendMail({
        from: `${smtpConfig.fromName} <${smtpConfig.fromEmail}>`,
        to: recipientEmail,
        subject,
        html: htmlBody,
        text: textBody
      });
      const duration = Date.now() - startTime;

      res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        data: {
          recipientEmail,
          templateName: templateName || 'attendance_reminder',
          executionTime: `${duration}ms`,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}