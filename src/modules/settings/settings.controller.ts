import { Request, Response } from 'express';
import { SettingsService, SettingsFilter } from './settings.service';
import { 
  ValidationError, 
  NotFoundError, 
  ConflictError,
  AuthenticatedRequest 
} from '../../types';

export class SettingsController {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  /**
   * Get all admin settings with optional filtering
   * GET /api/v1/settings
   */
  async getAllSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filter: SettingsFilter = {
        category: req.query.category as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        search: req.query.search as string
      };

      const settings = await this.settingsService.getAllSettings(filter);

      res.status(200).json({
        success: true,
        message: 'Settings retrieved successfully',
        data: settings,
        count: settings.length
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a specific setting by key
   * GET /api/v1/settings/:key
   */
  async getSetting(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const includeMetadata = req.query.metadata === 'true';

      if (includeMetadata) {
        const setting = await this.settingsService.getSettingWithMetadata(key);
        res.status(200).json({
          success: true,
          message: 'Setting retrieved successfully',
          data: setting
        });
      } else {
        const value = await this.settingsService.getSetting(key);
        res.status(200).json({
          success: true,
          message: 'Setting value retrieved successfully',
          data: { key, value }
        });
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error fetching setting:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch setting',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Get settings by category
   * GET /api/v1/settings/category/:category
   */
  async getSettingsByCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const settings = await this.settingsService.getSettingsByCategory(category);

      res.status(200).json({
        success: true,
        message: `Settings for category '${category}' retrieved successfully`,
        data: settings
      });
    } catch (error) {
      console.error('Error fetching settings by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings by category',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create a new admin setting
   * POST /api/v1/settings
   */
  async createSetting(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { key, value, category, description } = req.body;

      if (!key || !category) {
        res.status(400).json({
          success: false,
          message: 'Key and category are required',
          errors: {
            key: !key ? 'Key is required' : undefined,
            category: !category ? 'Category is required' : undefined
          }
        });
        return;
      }

      const setting = await this.settingsService.createSetting({
        key,
        value,
        category,
        description
      });

      res.status(201).json({
        success: true,
        message: 'Setting created successfully',
        data: setting
      });
    } catch (error) {
      if (error instanceof ConflictError) {
        res.status(409).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error creating setting:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create setting',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Update an existing admin setting
   * PUT /api/v1/settings/:key
   */
  async updateSetting(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { value, description, isActive } = req.body;

      const setting = await this.settingsService.updateSetting(key, {
        value,
        description,
        isActive
      });

      res.status(200).json({
        success: true,
        message: 'Setting updated successfully',
        data: setting
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error updating setting:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update setting',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Upsert a setting (create or update)
   * PUT /api/v1/settings/:key/upsert
   */
  async upsertSetting(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { value, category, description } = req.body;

      if (!category) {
        res.status(400).json({
          success: false,
          message: 'Category is required for upsert operation'
        });
        return;
      }

      const setting = await this.settingsService.upsertSetting(key, value, category, description);

      res.status(200).json({
        success: true,
        message: 'Setting upserted successfully',
        data: setting
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error upserting setting:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to upsert setting',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Bulk update multiple settings
   * POST /api/v1/settings/bulk
   */
  async bulkUpdateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { settings } = req.body;

      if (!settings || !Array.isArray(settings)) {
        res.status(400).json({
          success: false,
          message: 'Settings array is required',
          example: {
            settings: [
              { key: 'company_name', value: 'My Company' },
              { key: 'timezone', value: 'Asia/Dhaka' }
            ]
          }
        });
        return;
      }

      const updatedSettings = await this.settingsService.bulkUpdateSettings(settings);

      res.status(200).json({
        success: true,
        message: `${updatedSettings.length} settings updated successfully`,
        data: updatedSettings
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error bulk updating settings:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to bulk update settings',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Delete a setting
   * DELETE /api/v1/settings/:key
   */
  async deleteSetting(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { key } = req.params;

      await this.settingsService.deleteSetting(key);

      res.status(200).json({
        success: true,
        message: 'Setting deleted successfully'
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error deleting setting:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to delete setting',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Initialize default settings (useful for first-time setup)
   * POST /api/v1/settings/initialize
   */
  async initializeDefaults(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const defaultSettings = [
        {
          key: 'company_name',
          value: 'Your Company Ltd.',
          category: 'company',
          description: 'Company name displayed throughout the application'
        },
        {
          key: 'timezone',
          value: 'Asia/Dhaka',
          category: 'company',
          description: 'Default timezone for the application'
        },
        {
          key: 'working_hours',
          value: {
            startTime: '09:00',
            endTime: '18:00',
            breakDuration: 60,
            gracePeriod: 15
          },
          category: 'company',
          description: 'Standard working hours and break configuration'
        },
        {
          key: 'working_days',
          value: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          category: 'company',
          description: 'Days of the week that are considered working days'
        },
        {
          key: 'notification_schedule',
          value: {
            dailyReminderTime: '13:00',
            endOfDayReportTime: '18:30',
            weeklyReportDay: 1,
            weeklyReportTime: '09:00'
          },
          category: 'email',
          description: 'Schedule for automated notifications and reports'
        },
        {
          key: 'attendance_policy',
          value: {
            gracePeriodMinutes: 15,
            maxLatePerMonth: 3,
            minWorkingHours: 8,
            maxWorkingHours: 12,
            consecutiveAbsentAlertDays: 3
          },
          category: 'attendance',
          description: 'Attendance rules and validation policies'
        }
      ];

      const results = [];
      for (const setting of defaultSettings) {
        try {
          const created = await this.settingsService.upsertSetting(
            setting.key,
            setting.value,
            setting.category,
            setting.description
          );
          results.push(created);
        } catch (error) {
          console.error(`Failed to create default setting ${setting.key}:`, error);
        }
      }

      res.status(200).json({
        success: true,
        message: `${results.length} default settings initialized`,
        data: results
      });
    } catch (error) {
      console.error('Error initializing default settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize default settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}