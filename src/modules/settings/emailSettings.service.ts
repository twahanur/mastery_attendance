import { SettingsService } from './settings.service';
import { ValidationError } from '../../types';
import nodemailer from 'nodemailer';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
  variables?: string[];
}

export interface NotificationSchedule {
  dailyReminderTime: string;      // "13:00"
  endOfDayReportTime: string;     // "18:30"
  weeklyReportDay: number;        // 1 (Monday)
  weeklyReportTime: string;       // "09:00"
  enableDailyReminders: boolean;
  enableEndOfDayReports: boolean;
  enableWeeklyReports: boolean;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  adminEmails: string[];
  hrEmails: string[];
  bccEmails: string[];
  maxEmailsPerHour: number;
  retryAttempts: number;
  retryDelayMinutes: number;
}

export class EmailSettingsService {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  /**
   * Get SMTP configuration
   */
  async getSMTPConfig(): Promise<SMTPConfig> {
    const setting = await this.settingsService.getSetting('smtp_config');
    const smtpConfig = setting?.value;
    
    return {
      host: smtpConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: smtpConfig?.port || parseInt(process.env.SMTP_PORT || '587'),
      secure: smtpConfig?.secure || process.env.SMTP_SECURE === 'true',
      user: smtpConfig?.user || process.env.SMTP_USER || '',
      pass: smtpConfig?.pass || process.env.SMTP_PASS || '',
      fromEmail: smtpConfig?.fromEmail || process.env.EMAIL_FROM || 'noreply@company.com',
      fromName: smtpConfig?.fromName || 'Company Attendance System'
    };
  }

  /**
   * Update SMTP configuration
   */
  async updateSMTPConfig(config: Partial<SMTPConfig>): Promise<SMTPConfig> {
    const currentConfig = await this.getSMTPConfig();
    const newConfig = { ...currentConfig, ...config };
    
    // Validate SMTP configuration
    await this.validateSMTPConfig(newConfig);
    
    await this.settingsService.upsertSetting(
      'smtp_config',
      newConfig,
      'email',
      'Email server configuration for sending notifications'
    );

    return newConfig;
  }

  /**
   * Test SMTP connection
   */
  async testSMTPConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const smtpConfig = await this.getSMTPConfig();
      
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass
        }
      });

      await transporter.verify();
      
      return {
        success: true,
        message: 'SMTP connection successful',
        details: {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.user
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'SMTP connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get email template
   */
  async getEmailTemplate(templateName: string): Promise<EmailTemplate> {
    const setting = await this.settingsService.getSetting(`email_template_${templateName}`);
    const template = setting?.value;
    
    if (!template) {
      return this.getDefaultEmailTemplate(templateName);
    }

    return {
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody || '',
      variables: template.variables || []
    };
  }

  /**
   * Update email template
   */
  async updateEmailTemplate(templateName: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const currentTemplate = await this.getEmailTemplate(templateName);
    const newTemplate = { ...currentTemplate, ...template };
    
    // Validate template
    this.validateEmailTemplate(newTemplate);
    
    await this.settingsService.upsertSetting(
      `email_template_${templateName}`,
      newTemplate,
      'email',
      `Email template for ${templateName} notifications`
    );

    return newTemplate;
  }

  /**
   * Get all available email templates
   */
  async getAllEmailTemplates(): Promise<Record<string, EmailTemplate>> {
    const templateNames = [
      'attendance_reminder',
      'daily_absentee_report',
      'weekly_report',
      'welcome_employee',
      'password_reset',
      'account_activation',
      'system_notification'
    ];

    const templates: Record<string, EmailTemplate> = {};
    
    for (const name of templateNames) {
      templates[name] = await this.getEmailTemplate(name);
    }

    return templates;
  }

  /**
   * Get notification schedule
   */
  async getNotificationSchedule(): Promise<NotificationSchedule> {
    const setting = await this.settingsService.getSetting('notification_schedule');
    const schedule = setting?.value;
    
    return {
      dailyReminderTime: schedule?.dailyReminderTime || '13:00',
      endOfDayReportTime: schedule?.endOfDayReportTime || '18:30',
      weeklyReportDay: schedule?.weeklyReportDay || 1, // Monday
      weeklyReportTime: schedule?.weeklyReportTime || '09:00',
      enableDailyReminders: schedule?.enableDailyReminders !== false,
      enableEndOfDayReports: schedule?.enableEndOfDayReports !== false,
      enableWeeklyReports: schedule?.enableWeeklyReports !== false
    };
  }

  /**
   * Update notification schedule
   */
  async updateNotificationSchedule(schedule: Partial<NotificationSchedule>): Promise<NotificationSchedule> {
    const currentSchedule = await this.getNotificationSchedule();
    const newSchedule = { ...currentSchedule, ...schedule };
    
    // Validate schedule times
    this.validateNotificationSchedule(newSchedule);
    
    await this.settingsService.upsertSetting(
      'notification_schedule',
      newSchedule,
      'email',
      'Schedule for automated notifications and reports'
    );

    return newSchedule;
  }

  /**
   * Get email notification settings
   */
  async getEmailNotificationSettings(): Promise<EmailNotificationSettings> {
    const setting = await this.settingsService.getSetting('email_notification_settings');
    const settings = setting?.value;
    
    return {
      enabled: settings?.enabled !== false,
      adminEmails: settings?.adminEmails || [],
      hrEmails: settings?.hrEmails || [],
      bccEmails: settings?.bccEmails || [],
      maxEmailsPerHour: settings?.maxEmailsPerHour || 100,
      retryAttempts: settings?.retryAttempts || 3,
      retryDelayMinutes: settings?.retryDelayMinutes || 5
    };
  }

  /**
   * Update email notification settings
   */
  async updateEmailNotificationSettings(settings: Partial<EmailNotificationSettings>): Promise<EmailNotificationSettings> {
    const currentSettings = await this.getEmailNotificationSettings();
    const newSettings = { ...currentSettings, ...settings };
    
    // Validate email addresses
    this.validateEmailNotificationSettings(newSettings);
    
    await this.settingsService.upsertSetting(
      'email_notification_settings',
      newSettings,
      'email',
      'General email notification configuration'
    );

    return newSettings;
  }

  /**
   * Get complete email configuration
   */
  async getCompleteEmailConfig(): Promise<{
    smtp: SMTPConfig;
    schedule: NotificationSchedule;
    settings: EmailNotificationSettings;
    templates: Record<string, EmailTemplate>;
  }> {
    const [smtp, schedule, settings, templates] = await Promise.all([
      this.getSMTPConfig(),
      this.getNotificationSchedule(),
      this.getEmailNotificationSettings(),
      this.getAllEmailTemplates()
    ]);

    return { smtp, schedule, settings, templates };
  }

  /**
   * Initialize default email settings
   */
  async initializeEmailDefaults(): Promise<void> {
    type SettingSeed = {
      key: string;
      value: any;
      category: string;
      description: string;
    };

    const defaults: SettingSeed[] = [
      {
        key: 'smtp_config',
        value: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
          fromEmail: process.env.EMAIL_FROM || 'noreply@company.com',
          fromName: 'Company Attendance System'
        },
        category: 'email',
        description: 'Email server configuration for sending notifications'
      },
      {
        key: 'notification_schedule',
        value: {
          dailyReminderTime: '13:00',
          endOfDayReportTime: '18:30',
          weeklyReportDay: 1,
          weeklyReportTime: '09:00',
          enableDailyReminders: true,
          enableEndOfDayReports: true,
          enableWeeklyReports: true
        },
        category: 'email',
        description: 'Schedule for automated notifications and reports'
      },
      {
        key: 'email_notification_settings',
        value: {
          enabled: true,
          adminEmails: [],
          hrEmails: [],
          bccEmails: [],
          maxEmailsPerHour: 100,
          retryAttempts: 3,
          retryDelayMinutes: 5
        },
        category: 'email',
        description: 'General email notification configuration'
      }
    ];

    // Initialize default templates
    const templateDefaults = [
      'attendance_reminder',
      'daily_absentee_report',
      'weekly_report',
      'welcome_employee',
      'password_reset'
    ];

    for (const templateName of templateDefaults) {
      defaults.push({
        key: `email_template_${templateName}`,
        value: this.getDefaultEmailTemplate(templateName),
        category: 'email',
        description: `Email template for ${templateName} notifications`
      });
    }

    const updates = defaults.map(d => ({ key: d.key, value: d.value }));
    await this.settingsService.bulkUpdateSettings(updates);
  }

  // Private validation methods

  private async validateSMTPConfig(config: SMTPConfig): Promise<void> {
    if (!config.host || !config.user || !config.pass) {
      throw new ValidationError('SMTP host, user, and password are required');
    }

    if (!this.isValidEmail(config.user)) {
      throw new ValidationError('SMTP user must be a valid email address');
    }

    if (!this.isValidEmail(config.fromEmail)) {
      throw new ValidationError('From email must be a valid email address');
    }

    if (config.port < 1 || config.port > 65535) {
      throw new ValidationError('SMTP port must be between 1 and 65535');
    }
  }

  private validateEmailTemplate(template: EmailTemplate): void {
    if (!template.subject || template.subject.trim().length === 0) {
      throw new ValidationError('Email template subject is required');
    }

    if (!template.htmlBody || template.htmlBody.trim().length === 0) {
      throw new ValidationError('Email template HTML body is required');
    }

    if (template.subject.length > 200) {
      throw new ValidationError('Email subject cannot exceed 200 characters');
    }
  }

  private validateNotificationSchedule(schedule: NotificationSchedule): void {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(schedule.dailyReminderTime)) {
      throw new ValidationError('Daily reminder time must be in HH:MM format');
    }

    if (!timeRegex.test(schedule.endOfDayReportTime)) {
      throw new ValidationError('End of day report time must be in HH:MM format');
    }

    if (!timeRegex.test(schedule.weeklyReportTime)) {
      throw new ValidationError('Weekly report time must be in HH:MM format');
    }

    if (schedule.weeklyReportDay < 0 || schedule.weeklyReportDay > 6) {
      throw new ValidationError('Weekly report day must be between 0 (Sunday) and 6 (Saturday)');
    }
  }

  private validateEmailNotificationSettings(settings: EmailNotificationSettings): void {
    // Validate admin emails
    for (const email of settings.adminEmails) {
      if (!this.isValidEmail(email)) {
        throw new ValidationError(`Invalid admin email: ${email}`);
      }
    }

    // Validate HR emails
    for (const email of settings.hrEmails) {
      if (!this.isValidEmail(email)) {
        throw new ValidationError(`Invalid HR email: ${email}`);
      }
    }

    // Validate BCC emails
    for (const email of settings.bccEmails) {
      if (!this.isValidEmail(email)) {
        throw new ValidationError(`Invalid BCC email: ${email}`);
      }
    }

    if (settings.maxEmailsPerHour < 1 || settings.maxEmailsPerHour > 1000) {
      throw new ValidationError('Max emails per hour must be between 1 and 1000');
    }

    if (settings.retryAttempts < 0 || settings.retryAttempts > 10) {
      throw new ValidationError('Retry attempts must be between 0 and 10');
    }

    if (settings.retryDelayMinutes < 1 || settings.retryDelayMinutes > 60) {
      throw new ValidationError('Retry delay must be between 1 and 60 minutes');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private getDefaultEmailTemplate(templateName: string): EmailTemplate {
    const templates: Record<string, EmailTemplate> = {
      attendance_reminder: {
        subject: '🕐 Attendance Reminder - Please Mark Your Attendance',
        htmlBody: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f8f9fa; padding: 30px; }
                .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; }
                .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🕐 Attendance Reminder</h1>
                </div>
                <div class="content">
                  <h2>Hello {{employeeName}},</h2>
                  <p><strong>Employee ID:</strong> {{employeeId}}</p>
                  <div class="warning">
                    <strong>⚠️ ATTENDANCE NOT MARKED</strong><br>
                    We notice that you haven't marked your attendance for today yet.
                  </div>
                  <p><strong>Current Time:</strong> {{currentTime}}</p>
                  <a href="{{attendanceUrl}}" class="button">Mark Attendance Now</a>
                </div>
              </div>
            </body>
          </html>
        `,
        textBody: 'Hello {{employeeName}}, Please mark your attendance for today. Visit {{attendanceUrl}}',
        variables: ['employeeName', 'employeeId', 'currentTime', 'attendanceUrl']
      },

      daily_absentee_report: {
        subject: '📊 Daily Absentee Report - {{date}}',
        htmlBody: `
          <h2>Daily Absentee Report</h2>
          <p><strong>Date:</strong> {{date}}</p>
          <p><strong>Total Employees:</strong> {{totalEmployees}}</p>
          <p><strong>Absent Employees:</strong> {{absentCount}}</p>
          <div>{{absenteeList}}</div>
        `,
        textBody: 'Daily Absentee Report for {{date}}. {{absentCount}} employees are absent today.',
        variables: ['date', 'totalEmployees', 'absentCount', 'absenteeList']
      },

      weekly_report: {
        subject: '📈 Weekly Attendance Report - Week of {{weekStart}}',
        htmlBody: `
          <h2>Weekly Attendance Report</h2>
          <p><strong>Week:</strong> {{weekStart}} to {{weekEnd}}</p>
          <p><strong>Average Attendance:</strong> {{averageAttendance}}%</p>
          <div>{{reportDetails}}</div>
        `,
        textBody: 'Weekly attendance report for {{weekStart}} to {{weekEnd}}',
        variables: ['weekStart', 'weekEnd', 'averageAttendance', 'reportDetails']
      },

      welcome_employee: {
        subject: '👋 Welcome to {{companyName}} - Your Account is Ready',
        htmlBody: `
          <h2>Welcome to {{companyName}}!</h2>
          <p>Hello {{employeeName}},</p>
          <p>Your employee account has been created successfully.</p>
          <p><strong>Employee ID:</strong> {{employeeId}}</p>
          <p><strong>Login Email:</strong> {{email}}</p>
          <p>Please use the temporary password provided separately to log in.</p>
        `,
        textBody: 'Welcome to {{companyName}}! Your employee account is ready.',
        variables: ['companyName', 'employeeName', 'employeeId', 'email']
      },

      password_reset: {
        subject: '🔒 Password Reset Request - {{companyName}}',
        htmlBody: `
          <h2>Password Reset Request</h2>
          <p>Hello {{userName}},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="{{resetLink}}">Reset Password</a>
          <p>This link will expire in {{expiresIn}}.</p>
        `,
        textBody: 'Password reset requested. Link: {{resetLink}} (expires in {{expiresIn}})',
        variables: ['userName', 'resetLink', 'expiresIn', 'companyName']
      }
    };

    return templates[templateName] || {
      subject: `{{templateName}} Notification`,
      htmlBody: '<p>Default template for {{templateName}}</p>',
      textBody: 'Default template for {{templateName}}',
      variables: ['templateName']
    };
  }
}