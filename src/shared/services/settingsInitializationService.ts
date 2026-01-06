import { prisma } from '../config/database';

/**
 * Settings Initialization Service
 * Ensures all required settings exist in the database with default values
 */
export class SettingsInitializationService {
  
  /**
   * Initialize all required settings with defaults
   * This should be called on application startup
   */
  async initializeAllSettings(): Promise<void> {
    console.log('🔧 Initializing admin settings...');

    try {
      await Promise.all([
        this.initializeSecuritySettings(),
        this.initializeUserSettings(),
        this.initializeEmailSettings(),
        this.initializeCompanySettings(),
        this.initializeAttendanceSettings()
      ]);

      console.log('✅ Admin settings initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing settings:', error);
      throw error;
    }
  }

  /**
   * Initialize security settings (password rules, rate limiting, etc.)
   */
  private async initializeSecuritySettings(): Promise<void> {
    const securitySettings = [
      { key: 'password_min_length', value: 8, category: 'security', description: 'Minimum password length required' },
      { key: 'password_require_uppercase', value: true, category: 'security', description: 'Require at least one uppercase letter' },
      { key: 'password_require_lowercase', value: true, category: 'security', description: 'Require at least one lowercase letter' },
      { key: 'password_require_number', value: true, category: 'security', description: 'Require at least one number' },
      { key: 'password_require_special', value: true, category: 'security', description: 'Require at least one special character' },
      { key: 'password_special_characters', value: '!@#$%^&*()_+-=[]{}|;:,.<>?', category: 'security', description: 'Allowed special characters for passwords' },
      { key: 'username_min_length', value: 3, category: 'security', description: 'Minimum username length' },
      { key: 'username_max_length', value: 30, category: 'security', description: 'Maximum username length' },
      { key: 'username_allow_special', value: false, category: 'security', description: 'Allow special characters in usernames' },
      { key: 'enable_api_rate_limiting', value: true, category: 'security', description: 'Enable or disable API rate limiting' },
      { key: 'api_rate_limit_max_requests', value: 10000, category: 'security', description: 'Maximum API requests allowed per window' },
      { key: 'api_rate_limit_window_minutes', value: 15, category: 'security', description: 'Time window for rate limiting in minutes' }
    ];

    await this.upsertSettings(securitySettings);
  }

  /**
   * Initialize user management settings
   */
  private async initializeUserSettings(): Promise<void> {
    const userSettings = [
      {
        key: 'user.passwordPolicy',
        value: {
          minLength: 8,
          maxLength: 128,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true,
          preventCommonPasswords: true,
          preventUserInfo: true,
          expirationDays: 90,
          historyCount: 5
        },
        category: 'user',
        description: 'Password security requirements and policies'
      },
      {
        key: 'user.registrationPolicy',
        value: {
          allowSelfRegistration: false,
          requireEmailVerification: true,
          requireAdminApproval: true,
          allowedEmailDomains: [],
          blockedEmailDomains: [],
          defaultRole: 'EMPLOYEE',
          autoActivateAccounts: false,
          requireInvitation: true
        },
        category: 'user',
        description: 'User registration and account creation policies'
      },
      {
        key: 'user.lockoutRules',
        value: {
          enabled: true,
          maxFailedAttempts: 5,
          lockoutDurationMinutes: 30,
          resetFailedAttemptsAfterMinutes: 60,
          notifyAdminOnLockout: true,
          allowSelfUnlock: false,
          progressiveDelay: true
        },
        category: 'user',
        description: 'Account lockout and security policies'
      },
      {
        key: 'user.sessionSettings',
        value: {
          sessionTimeoutMinutes: 480,
          allowMultipleSessions: true,
          forceLogoutOnPasswordChange: true,
          rememberMeDays: 30,
          requireReauthForSensitive: true
        },
        category: 'user',
        description: 'User session and authentication settings'
      }
    ];

    await this.upsertSettings(userSettings);
  }

  /**
   * Initialize email settings
   */
  private async initializeEmailSettings(): Promise<void> {
    const emailSettings = [
      {
        key: 'email.smtp',
        value: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
          from: process.env.EMAIL_FROM || 'noreply@attendance.com'
        },
        category: 'email',
        description: 'SMTP server configuration for email sending'
      },
      {
        key: 'email.notifications',
        value: {
          timezone: 'Asia/Dhaka',
          dailyReminder: {
            enabled: true,
            cronExpression: '0 13 * * 1-5'
          },
          weeklyReport: {
            enabled: true,
            cronExpression: '0 9 * * 1'
          },
          endOfDay: {
            enabled: true,
            cronExpression: '0 18 * * 1-5'
          }
        },
        category: 'email',
        description: 'Email notification scheduling configuration'
      }
    ];

    await this.upsertSettings(emailSettings);

    // Initialize default email templates
    const defaultTemplates = [
      {
        key: 'email.templates.attendanceReminder',
        value: {
          subject: '🕐 Attendance Reminder - Please Mark Your Attendance',
          html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #2563eb;">Attendance Reminder</h2><p>Dear {{employeeName}},</p><p>This is a friendly reminder to mark your attendance for today ({{date}}).</p><p>Please log into the attendance system to record your presence.</p><p>Best regards,<br>HR Team</p></div>',
          text: 'Dear {{employeeName}}, This is a reminder to mark your attendance for {{date}}. Please log into the attendance system.'
        },
        category: 'email',
        description: 'Email template for attendance reminders'
      },
      {
        key: 'email.templates.absenteeReport',
        value: {
          subject: '📊 Daily Absentee Report - {{date}}',
          html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #dc2626;">Daily Absentee Report</h2><p>Date: {{date}}</p><p>Total Absent Employees: {{absentCount}}</p><p>Absent Employees: {{absenteesList}}</p><p>Please review and take necessary action.</p></div>',
          text: 'Daily Absentee Report for {{date}}. Total: {{absentCount}}. Employees: {{absenteesList}}'
        },
        category: 'email',
        description: 'Email template for daily absentee reports'
      },
      {
        key: 'email.templates.weeklyReport',
        value: {
          subject: '📈 Weekly Attendance Report - {{weekStartDate}} to {{weekEndDate}}',
          html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #059669;">Weekly Attendance Report</h2><p>Week: {{weekStartDate}} to {{weekEndDate}}</p><p>Total Employees: {{totalEmployees}}</p><p>Average Attendance: {{averageAttendance}}%</p><p>Please find the detailed report attached.</p></div>',
          text: 'Weekly Attendance Report: {{weekStartDate}} to {{weekEndDate}}. Average: {{averageAttendance}}%'
        },
        category: 'email',
        description: 'Email template for weekly attendance reports'
      }
    ];

    await this.upsertSettings(defaultTemplates);
  }

  /**
   * Initialize company settings
   */
  private async initializeCompanySettings(): Promise<void> {
    const companySettings = [
      { key: 'company_name', value: 'Your Company Ltd.', category: 'company', description: 'Company name displayed throughout the application' },
      { key: 'company_email', value: 'contact@company.com', category: 'company', description: 'Main company email address' },
      { key: 'company_phone', value: '', category: 'company', description: 'Company phone number' },
      { key: 'company_address', value: '', category: 'company', description: 'Company physical address' },
      { key: 'timezone', value: 'Asia/Dhaka', category: 'company', description: 'Company timezone for all date/time operations' }
    ];

    await this.upsertSettings(companySettings);
  }

  /**
   * Initialize attendance settings
   */
  private async initializeAttendanceSettings(): Promise<void> {
    const attendanceSettings = [
      { key: 'working_hours_start', value: '09:00', category: 'attendance', description: 'Standard working hours start time' },
      { key: 'working_hours_end', value: '18:00', category: 'attendance', description: 'Standard working hours end time' },
      { key: 'break_duration', value: 60, category: 'attendance', description: 'Break duration in minutes' },
      { key: 'grace_period', value: 15, category: 'attendance', description: 'Grace period for late arrival in minutes' },
      { key: 'working_days', value: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], category: 'attendance', description: 'Standard working days of the week' },
      { key: 'minimum_working_hours', value: 8, category: 'attendance', description: 'Minimum required working hours per day' }
    ];

    await this.upsertSettings(attendanceSettings);
  }

  /**
   * Helper method to upsert multiple settings
   */
  private async upsertSettings(settings: Array<{ key: string; value: any; category: string; description: string }>): Promise<void> {
    for (const setting of settings) {
      await prisma.adminSettings.upsert({
        where: { key: setting.key },
        update: {}, // Don't update if exists - preserve user changes
        create: {
          key: setting.key,
          value: setting.value,
          category: setting.category,
          description: setting.description,
          isActive: true
        }
      });
    }
  }

  /**
   * Reset a specific category to defaults
   */
  async resetCategoryToDefaults(category: string): Promise<void> {
    // Delete existing settings for this category
    await prisma.adminSettings.deleteMany({
      where: { category }
    });

    // Re-initialize based on category
    switch (category) {
      case 'security':
        await this.initializeSecuritySettings();
        break;
      case 'user':
        await this.initializeUserSettings();
        break;
      case 'email':
        await this.initializeEmailSettings();
        break;
      case 'company':
        await this.initializeCompanySettings();
        break;
      case 'attendance':
        await this.initializeAttendanceSettings();
        break;
      default:
        throw new Error(`Unknown category: ${category}`);
    }

    console.log(`✅ Reset ${category} settings to defaults`);
  }

  /**
   * Get initialization status
   */
  async getInitializationStatus(): Promise<{ initialized: boolean; settingsCounts: Record<string, number> }> {
    const settings = await prisma.adminSettings.groupBy({
      by: ['category'],
      _count: {
        _all: true
      }
    });

    const settingsCounts: Record<string, number> = {};
    settings.forEach(s => {
      settingsCounts[s.category] = s._count._all;
    });

    const requiredCategories = ['security', 'user', 'email', 'company', 'attendance'];
    const initialized = requiredCategories.every(cat => (settingsCounts[cat] || 0) > 0);

    return { initialized, settingsCounts };
  }
}

// Export singleton instance
export const settingsInitializationService = new SettingsInitializationService();
