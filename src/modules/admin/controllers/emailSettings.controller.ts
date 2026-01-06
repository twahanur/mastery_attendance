import { Request, Response } from 'express';
import { EmailSettingsService } from '../services/emailSettings.service';
import { ScheduleManager } from '../../../shared/services/scheduleManager';
import { emailService } from '../../../shared/services/emailService';

export class EmailSettingsController {
  private emailSettingsService: EmailSettingsService;

  constructor() {
    this.emailSettingsService = new EmailSettingsService();
  }

  /**
   * Get current SMTP configuration
   */
  getSMTPConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const config = await this.emailSettingsService.getSMTPConfig();
      
      // Mask password for security
      const maskedConfig = {
        ...config,
        pass: config.pass ? '********' : ''
      };

      res.json({
        success: true,
        data: maskedConfig
      });
    } catch (error) {
      console.error('Error fetching SMTP config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch SMTP configuration'
      });
    }
  };

  /**
   * Update SMTP configuration
   */
  updateSMTPConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const config = await this.emailSettingsService.updateSMTPConfig(req.body);
      
      // Reload email service with new settings
      await emailService.reloadSettings();

      // Mask password in response
      const maskedConfig = {
        ...config,
        pass: config.pass ? '********' : ''
      };

      res.json({
        success: true,
        data: maskedConfig,
        message: 'SMTP configuration updated successfully'
      });
    } catch (error) {
      console.error('Error updating SMTP config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update SMTP configuration'
      });
    }
  };

  /**
   * Test SMTP connection
   */
  testSMTPConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.emailSettingsService.testSMTPConnection();
      
      res.json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      console.error('Error testing SMTP connection:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test SMTP connection'
      });
    }
  };

  /**
   * Get notification schedule settings
   */
  getNotificationSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const schedule = await this.emailSettingsService.getNotificationSchedule();
      
      res.json({
        success: true,
        data: schedule
      });
    } catch (error) {
      console.error('Error fetching notification schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notification schedule'
      });
    }
  };

  /**
   * Update notification schedule settings
   */
  updateNotificationSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const schedule = await this.emailSettingsService.updateNotificationSchedule(req.body);
      
      // Restart schedule manager with new settings
      try {
        const scheduleManager = ScheduleManager.getInstance();
        await scheduleManager.reloadSchedules();
      } catch (scheduleError) {
        console.warn('Warning: Could not reload schedules:', scheduleError);
      }

      res.json({
        success: true,
        data: schedule,
        message: 'Notification schedule updated successfully'
      });
    } catch (error) {
      console.error('Error updating notification schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification schedule'
      });
    }
  };

  /**
   * Get all email templates
   */
  getAllTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      const templates = await this.emailSettingsService.getAllTemplates();
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error fetching email templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch email templates'
      });
    }
  };

  /**
   * Get a specific email template
   */
  getTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateType } = req.params;
      const template = await this.emailSettingsService.getTemplate(templateType);
      
      if (!template) {
        res.status(404).json({
          success: false,
          message: `Template '${templateType}' not found`
        });
        return;
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error fetching email template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch email template'
      });
    }
  };

  /**
   * Update or create an email template
   */
  updateTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateType } = req.params;
      const { subject, html, text } = req.body;

      if (!subject || !html || !text) {
        res.status(400).json({
          success: false,
          message: 'Template must include subject, html, and text fields'
        });
        return;
      }

      const template = await this.emailSettingsService.updateTemplate(templateType, {
        subject,
        html,
        text
      });

      res.json({
        success: true,
        data: template,
        message: `Template '${templateType}' updated successfully`
      });
    } catch (error) {
      console.error('Error updating email template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update email template'
      });
    }
  };

  /**
   * Delete an email template
   */
  deleteTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateType } = req.params;
      await this.emailSettingsService.deleteTemplate(templateType);

      res.json({
        success: true,
        message: `Template '${templateType}' deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting email template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete email template'
      });
    }
  };

  /**
   * Initialize default email templates
   */
  initializeDefaultTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.emailSettingsService.initializeDefaultTemplates();

      res.json({
        success: true,
        message: 'Default email templates initialized successfully'
      });
    } catch (error) {
      console.error('Error initializing default templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize default templates'
      });
    }
  };

  /**
   * Send a test email
   */
  sendTestEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { to, templateType } = req.body;

      if (!to) {
        res.status(400).json({
          success: false,
          message: 'Recipient email address is required'
        });
        return;
      }

      // Use the email service to send a test email
      await emailService.sendAttendanceReminder(to, 'Test User', 'TEST001');

      res.json({
        success: true,
        message: `Test email sent successfully to ${to}`
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get all email settings at once
   */
  getAllEmailSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const [smtpConfig, notificationSchedule, templates] = await Promise.all([
        this.emailSettingsService.getSMTPConfig(),
        this.emailSettingsService.getNotificationSchedule(),
        this.emailSettingsService.getAllTemplates()
      ]);

      // Mask password
      const maskedSmtp = {
        ...smtpConfig,
        pass: smtpConfig.pass ? '********' : ''
      };

      res.json({
        success: true,
        data: {
          smtp: maskedSmtp,
          notificationSchedule,
          templates
        }
      });
    } catch (error) {
      console.error('Error fetching all email settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch email settings'
      });
    }
  };
}

export const emailSettingsController = new EmailSettingsController();
