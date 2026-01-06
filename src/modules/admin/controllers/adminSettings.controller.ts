import { Request, Response } from 'express';
import { UserSettingsService } from '../services/userSettings.service';
import { EmailSettingsService } from '../services/emailSettings.service';
import { validationService } from '../../../shared/services/validationService';
import { rateLimiterService } from '../../../shared/services/rateLimiterService';
import { ScheduleManager } from '../../../shared/services/scheduleManager';
import { SettingsService } from '../../settings/settings.service';

/**
 * Unified Admin Settings Controller
 * Provides a single interface for managing all admin-controllable settings
 */
export class AdminSettingsController {
  private userSettingsService: UserSettingsService;
  private emailSettingsService: EmailSettingsService;
  private settingsService: SettingsService;

  constructor() {
    this.userSettingsService = new UserSettingsService();
    this.emailSettingsService = new EmailSettingsService();
    this.settingsService = new SettingsService();
  }

  /**
   * Get all admin settings in a unified format
   */
  getAllSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const [
        userSettings,
        securitySettings,
        emailSettings,
        scheduleStatus,
        companySettings,
        attendanceSettings
      ] = await Promise.all([
        this.userSettingsService.getAllUserSettings(),
        this.getSecuritySettings(),
        this.getEmailSettings(),
        this.getScheduleStatus(),
        this.settingsService.getSettingsByCategory('company'),
        this.settingsService.getSettingsByCategory('attendance')
      ]);

      res.json({
        success: true,
        data: {
          user: userSettings,
          security: securitySettings,
          email: emailSettings,
          schedule: scheduleStatus,
          company: companySettings,
          attendance: attendanceSettings
        }
      });
    } catch (error) {
      console.error('Error fetching all settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings'
      });
    }
  };

  /**
   * Get settings by category
   */
  getSettingsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category } = req.params;

      let data: any;

      switch (category) {
        case 'user':
          data = await this.userSettingsService.getAllUserSettings();
          break;
        case 'security':
          data = await this.getSecuritySettings();
          break;
        case 'email':
          data = await this.getEmailSettings();
          break;
        case 'schedule':
          data = await this.getScheduleStatus();
          break;
        case 'company':
          data = await this.settingsService.getSettingsByCategory('company');
          break;
        case 'attendance':
          data = await this.settingsService.getSettingsByCategory('attendance');
          break;
        default:
          data = await this.settingsService.getSettingsByCategory(category);
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error fetching settings by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings'
      });
    }
  };

  /**
   * Initialize all default settings
   */
  initializeDefaults = async (req: Request, res: Response): Promise<void> => {
    try {
      // Initialize email templates
      await this.emailSettingsService.initializeDefaultTemplates();

      // Initialize other defaults by fetching them (this triggers default creation)
      await Promise.all([
        this.userSettingsService.getPasswordPolicy(),
        this.userSettingsService.getRegistrationPolicy(),
        this.userSettingsService.getLockoutRules(),
        this.userSettingsService.getSessionSettings(),
        this.emailSettingsService.getNotificationSchedule(),
        validationService.getValidationRules(),
        rateLimiterService.getConfig()
      ]);

      res.json({
        success: true,
        message: 'Default settings initialized successfully'
      });
    } catch (error) {
      console.error('Error initializing defaults:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize default settings'
      });
    }
  };

  /**
   * Get dashboard overview for admin
   */
  getDashboardOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      const scheduleManager = ScheduleManager.getInstance();

      const [
        passwordPolicy,
        lockoutRules,
        notificationSchedule,
        rateLimitConfig
      ] = await Promise.all([
        this.userSettingsService.getPasswordPolicy(),
        this.userSettingsService.getLockoutRules(),
        this.emailSettingsService.getNotificationSchedule(),
        rateLimiterService.getConfig()
      ]);

      res.json({
        success: true,
        data: {
          security: {
            passwordMinLength: passwordPolicy.minLength,
            passwordRequiresSymbols: passwordPolicy.requireSymbols,
            accountLockoutEnabled: lockoutRules.enabled,
            maxFailedAttempts: lockoutRules.maxFailedAttempts,
            lockoutDurationMinutes: lockoutRules.lockoutDurationMinutes,
            rateLimitingEnabled: rateLimitConfig.enabled
          },
          notifications: {
            dailyReminderEnabled: notificationSchedule.dailyReminder.enabled,
            weeklyReportEnabled: notificationSchedule.weeklyReport.enabled,
            endOfDayEnabled: notificationSchedule.endOfDay.enabled,
            timezone: notificationSchedule.timezone
          },
          scheduler: scheduleManager.getStatus()
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard overview'
      });
    }
  };

  // Private helper methods
  private async getSecuritySettings(): Promise<any> {
    const [validationRules, rateLimitConfig] = await Promise.all([
      validationService.getValidationRules(),
      rateLimiterService.getConfig()
    ]);

    return {
      passwordRules: validationRules.password,
      usernameRules: validationRules.username,
      rateLimit: rateLimitConfig
    };
  }

  private async getEmailSettings(): Promise<any> {
    const [smtpConfig, notificationSchedule, templates] = await Promise.all([
      this.emailSettingsService.getSMTPConfig(),
      this.emailSettingsService.getNotificationSchedule(),
      this.emailSettingsService.getAllTemplates()
    ]);

    return {
      smtp: {
        ...smtpConfig,
        pass: smtpConfig.pass ? '********' : ''
      },
      notificationSchedule,
      templates: Object.keys(templates)
    };
  }

  private getScheduleStatus(): any {
    const scheduleManager = ScheduleManager.getInstance();
    return scheduleManager.getStatus();
  }
}

export const adminSettingsController = new AdminSettingsController();
