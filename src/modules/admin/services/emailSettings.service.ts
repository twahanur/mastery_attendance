import { SettingsService } from '../../settings/settings.service';

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface NotificationSchedule {
  timezone: string;
  dailyReminder: {
    enabled: boolean;
    cronExpression: string;
  };
  weeklyReport: {
    enabled: boolean;
    cronExpression: string;
  };
  endOfDay: {
    enabled: boolean;
    cronExpression: string;
  };
}

export class EmailSettingsService {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  // SMTP Configuration
  async getSMTPConfig(): Promise<SMTPConfig> {
    const setting = await this.settingsService.getSetting('email.smtp');
    
    return setting?.value || {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.EMAIL_FROM || 'noreply@attendance.com'
    };
  }

  async updateSMTPConfig(config: Partial<SMTPConfig>): Promise<SMTPConfig> {
    const currentConfig = await this.getSMTPConfig();
    const updatedConfig = { ...currentConfig, ...config };
    
    await this.settingsService.updateSetting('email.smtp', {
      value: updatedConfig,
      description: 'SMTP server configuration for email sending'
    });

    return updatedConfig;
  }

  // Email Templates
  async getTemplate(templateType: string): Promise<EmailTemplate | null> {
    const setting = await this.settingsService.getSetting(`email.templates.${templateType}`);
    return setting?.value || null;
  }

  async updateTemplate(templateType: string, template: EmailTemplate): Promise<EmailTemplate> {
    await this.settingsService.updateSetting(`email.templates.${templateType}`, {
      value: template,
      description: `Email template for ${templateType}`
    });

    return template;
  }

  async deleteTemplate(templateType: string): Promise<void> {
    await this.settingsService.deleteSetting(`email.templates.${templateType}`);
  }

  async getAllTemplates(): Promise<Record<string, EmailTemplate>> {
    const settings = await this.settingsService.getSettingsByCategory('email');
    const templates: Record<string, EmailTemplate> = {};

    // getSettingsByCategory returns an object with key-value pairs
    Object.entries(settings).forEach(([key, value]) => {
      if (key.startsWith('email.templates.')) {
        const templateType = key.replace('email.templates.', '');
        templates[templateType] = value;
      }
    });

    return templates;
  }

  // Notification Schedule
  async getNotificationSchedule(): Promise<NotificationSchedule> {
    const setting = await this.settingsService.getSetting('email.notifications');
    
    return setting?.value || {
      timezone: 'Asia/Dhaka',
      dailyReminder: {
        enabled: true,
        cronExpression: '0 13 * * 1-5' // 1 PM weekdays
      },
      weeklyReport: {
        enabled: true,
        cronExpression: '0 9 * * 1' // Monday 9 AM
      },
      endOfDay: {
        enabled: true,
        cronExpression: '0 18 * * 1-5' // 6 PM weekdays
      }
    };
  }

  async updateNotificationSchedule(schedule: Partial<NotificationSchedule>): Promise<NotificationSchedule> {
    const currentSchedule = await this.getNotificationSchedule();
    const updatedSchedule = { ...currentSchedule, ...schedule };
    
    await this.settingsService.updateSetting('email.notifications', {
      value: updatedSchedule,
      description: 'Email notification scheduling configuration'
    });

    return updatedSchedule;
  }

  // Utility Methods
  async testSMTPConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const config = await this.getSMTPConfig();
      
      // Basic validation
      if (!config.host || !config.user || !config.pass) {
        return {
          success: false,
          message: 'SMTP configuration is incomplete'
        };
      }

      return {
        success: true,
        message: 'SMTP configuration appears valid'
      };
    } catch (error) {
      return {
        success: false,
        message: `SMTP test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async initializeDefaultTemplates(): Promise<void> {
    const defaultTemplates = {
      attendanceReminder: {
        subject: '🕐 Attendance Reminder - Please Mark Your Attendance',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Attendance Reminder</h2>
            <p>Dear {{employeeName}},</p>
            <p>This is a friendly reminder to mark your attendance for today ({{date}}).</p>
            <p>Please log into the attendance system to record your presence.</p>
            <p>Best regards,<br>HR Team</p>
          </div>
        `,
        text: 'Dear {{employeeName}}, This is a reminder to mark your attendance for {{date}}. Please log into the attendance system.'
      },
      absenteeReport: {
        subject: '📊 Daily Absentee Report - {{date}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Daily Absentee Report</h2>
            <p>Date: {{date}}</p>
            <p>Total Absent Employees: {{absentCount}}</p>
            <p>Absent Employees: {{absenteesList}}</p>
            <p>Please review and take necessary action.</p>
          </div>
        `,
        text: 'Daily Absentee Report for {{date}}. Total: {{absentCount}}. Employees: {{absenteesList}}'
      },
      weeklyReport: {
        subject: '📈 Weekly Attendance Report - {{weekStartDate}} to {{weekEndDate}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Weekly Attendance Report</h2>
            <p>Week: {{weekStartDate}} to {{weekEndDate}}</p>
            <p>Total Employees: {{totalEmployees}}</p>
            <p>Average Attendance: {{averageAttendance}}%</p>
            <p>Please find the detailed report attached.</p>
          </div>
        `,
        text: 'Weekly Attendance Report: {{weekStartDate}} to {{weekEndDate}}. Average: {{averageAttendance}}%'
      }
    };

    for (const [templateType, template] of Object.entries(defaultTemplates)) {
      const existingTemplate = await this.getTemplate(templateType);
      if (!existingTemplate) {
        await this.updateTemplate(templateType, template);
      }
    }
  }
}