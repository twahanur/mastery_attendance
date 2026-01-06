import { prisma } from '../../shared/config/database';
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError 
} from '../../types';

export interface AdminSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSettingRequest {
  key: string;
  value: any;
  category: string;
  description?: string;
}

export interface UpdateSettingRequest {
  value: any;
  description?: string;
  isActive?: boolean;
}

export interface SettingsFilter {
  category?: string;
  isActive?: boolean;
  search?: string;
}

export class SettingsService {
  
  /**
   * Get all admin settings with optional filtering
   */
  async getAllSettings(filter: SettingsFilter = {}): Promise<AdminSetting[]> {
    const whereClause: any = {};

    if (filter.category) {
      whereClause.category = filter.category;
    }

    if (filter.isActive !== undefined) {
      whereClause.isActive = filter.isActive;
    }

    if (filter.search) {
      whereClause.OR = [
        { key: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } }
      ];
    }

    const settings = await prisma.adminSettings.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    return settings;
  }

  /**
   * Get a specific setting by key
   * Returns the full setting object with value property for compatibility
   */
  async getSetting(key: string): Promise<{ value: any } | null> {
    const setting = await prisma.adminSettings.findUnique({
      where: { key }
    });

    if (!setting || !setting.isActive) {
      // Return default value wrapped in object if it exists
      const defaultValue = this.getDefaultValue(key);
      if (defaultValue !== null) {
        return { value: defaultValue };
      }
      return null;
    }

    return { value: setting.value };
  }

  /**
   * Get raw setting value by key (for direct value access)
   */
  async getSettingValue(key: string): Promise<any> {
    const setting = await this.getSetting(key);
    return setting?.value ?? null;
  }

  /**
   * Get setting with metadata (includes created date, description, etc.)
   */
  async getSettingWithMetadata(key: string): Promise<AdminSetting> {
    const setting = await prisma.adminSettings.findUnique({
      where: { key }
    });

    if (!setting) {
      throw new NotFoundError(`Setting with key '${key}' not found`);
    }

    return setting;
  }

  /**
   * Create a new admin setting
   */
  async createSetting(data: CreateSettingRequest): Promise<AdminSetting> {
    // Check if setting already exists
    const existingSetting = await prisma.adminSettings.findUnique({
      where: { key: data.key }
    });

    if (existingSetting) {
      throw new ConflictError(`Setting with key '${data.key}' already exists`);
    }

    // Validate setting value based on key
    this.validateSettingValue(data.key, data.value);

    const setting = await prisma.adminSettings.create({
      data: {
        key: data.key,
        value: data.value,
        category: data.category,
        description: data.description
      }
    });

    // Trigger any side effects for this setting change
    await this.handleSettingChange(data.key, data.value);

    return setting;
  }

  /**
   * Update an existing admin setting (creates if it doesn't exist)
   */
  async updateSetting(key: string, data: UpdateSettingRequest): Promise<AdminSetting> {
    // Validate new setting value
    this.validateSettingValue(key, data.value);

    const existingSetting = await prisma.adminSettings.findUnique({
      where: { key }
    });

    let updatedSetting: AdminSetting;

    if (existingSetting) {
      updatedSetting = await prisma.adminSettings.update({
        where: { key },
        data: {
          value: data.value,
          description: data.description ?? existingSetting.description,
          isActive: data.isActive ?? existingSetting.isActive
        }
      });
    } else {
      // Create the setting if it doesn't exist
      const category = this.getCategoryForKey(key);
      updatedSetting = await prisma.adminSettings.create({
        data: {
          key,
          value: data.value,
          category,
          description: data.description || this.getDescriptionForKey(key),
          isActive: data.isActive ?? true
        }
      });
    }

    // Trigger any side effects for this setting change
    await this.handleSettingChange(key, data.value);

    return updatedSetting;
  }

  /**
   * Upsert a setting (create if doesn't exist, update if exists)
   */
  async upsertSetting(key: string, value: any, category: string, description?: string): Promise<AdminSetting> {
    this.validateSettingValue(key, value);

    const setting = await prisma.adminSettings.upsert({
      where: { key },
      create: {
        key,
        value,
        category,
        description
      },
      update: {
        value,
        description: description || undefined
      }
    });

    // Trigger any side effects for this setting change
    await this.handleSettingChange(key, value);

    return setting;
  }

  /**
   * Delete a setting
   */
  async deleteSetting(key: string): Promise<void> {
    const existingSetting = await prisma.adminSettings.findUnique({
      where: { key }
    });

    if (!existingSetting) {
      throw new NotFoundError(`Setting with key '${key}' not found`);
    }

    await prisma.adminSettings.delete({
      where: { key }
    });
  }

  /**
   * Bulk delete settings by keys
   */
  async bulkDelete(keys: string[]): Promise<void> {
    if (!keys.length) return;

    await prisma.adminSettings.deleteMany({
      where: {
        key: {
          in: keys
        }
      }
    });
  }

  /**
   * Get settings by category
   */
  async getSettingsByCategory(category: string): Promise<Record<string, any>> {
    const settings = await prisma.adminSettings.findMany({
      where: { 
        category,
        isActive: true
      }
    });

    const result: Record<string, any> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return result;
  }

  /**
   * Bulk update multiple settings
   */
  async bulkUpdateSettings(updates: Array<{ key: string; value: any }>): Promise<AdminSetting[]> {
    const results: AdminSetting[] = [];

    for (const update of updates) {
      try {
        this.validateSettingValue(update.key, update.value);
        
        const setting = await prisma.adminSettings.upsert({
          where: { key: update.key },
          create: {
            key: update.key,
            value: update.value,
            category: this.getCategoryForKey(update.key),
            description: this.getDescriptionForKey(update.key)
          },
          update: {
            value: update.value
          }
        });

        results.push(setting);

        // Trigger side effects
        await this.handleSettingChange(update.key, update.value);
      } catch (error) {
        console.error(`Failed to update setting ${update.key}:`, error);
        throw new ValidationError(`Failed to update setting ${update.key}: ${error}`);
      }
    }

    return results;
  }

  /**
   * Get default value for a setting key
   */
  private getDefaultValue(key: string): any {
    const defaults: Record<string, any> = {
      // Company Settings
      'company_name': 'Your Company Ltd.',
      'company_email': 'contact@company.com',
      'company_phone': '',
      'company_address': '',
      'timezone': 'Asia/Dhaka',

      // Working Hours
      'working_hours': {
        startTime: '09:00',
        endTime: '18:00',
        breakDuration: 60,
        gracePeriod: 15
      },
      'working_days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],

      // Email Settings
      'smtp_config': {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        fromEmail: process.env.EMAIL_FROM || 'noreply@company.com',
        fromName: 'Company Attendance System'
      },

      // Notification Schedule
      'notification_schedule': {
        dailyReminderTime: '13:00',
        endOfDayReportTime: '18:30',
        weeklyReportDay: 1,
        weeklyReportTime: '09:00'
      },

      // Attendance Policy
      'attendance_policy': {
        gracePeriodMinutes: 15,
        maxLatePerMonth: 3,
        minWorkingHours: 8,
        maxWorkingHours: 12,
        consecutiveAbsentAlertDays: 3
      }
    };

    return defaults[key] || null;
  }

  /**
   * Get category for a setting key
   */
  private getCategoryForKey(key: string): string {
    const categoryMap: Record<string, string> = {
      'company_name': 'company',
      'company_email': 'company',
      'company_phone': 'company',
      'company_address': 'company',
      'timezone': 'company',
      'working_hours': 'company',
      'working_days': 'company',
      'smtp_config': 'email',
      'notification_schedule': 'email',
      'attendance_policy': 'attendance'
    };

    return categoryMap[key] || 'system';
  }

  /**
   * Get description for a setting key
   */
  private getDescriptionForKey(key: string): string {
    const descriptions: Record<string, string> = {
      'company_name': 'Company name displayed throughout the application',
      'company_email': 'Primary contact email for the company',
      'company_phone': 'Company phone number',
      'company_address': 'Company physical address',
      'timezone': 'Default timezone for the application',
      'working_hours': 'Standard working hours and break configuration',
      'working_days': 'Days of the week that are considered working days',
      'smtp_config': 'Email server configuration for sending notifications',
      'notification_schedule': 'Schedule for automated notifications and reports',
      'attendance_policy': 'Attendance rules and validation policies'
    };

    return descriptions[key] || '';
  }

  /**
   * Validate setting value based on key and expected type
   */
  private validateSettingValue(key: string, value: any): void {
    switch (key) {
      case 'company_name':
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          throw new ValidationError('Company name must be a non-empty string');
        }
        break;

      case 'company_email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new ValidationError('Company email must be a valid email address');
        }
        break;

      case 'timezone':
        // Basic timezone validation - you might want to use a proper timezone library
        if (value && typeof value !== 'string') {
          throw new ValidationError('Timezone must be a string');
        }
        break;

      case 'working_hours':
        if (value && typeof value === 'object') {
          const { startTime, endTime, breakDuration, gracePeriod } = value;
          if (!startTime || !endTime) {
            throw new ValidationError('Working hours must include startTime and endTime');
          }
          if (breakDuration && (breakDuration < 0 || breakDuration > 480)) {
            throw new ValidationError('Break duration must be between 0 and 480 minutes');
          }
          if (gracePeriod && (gracePeriod < 0 || gracePeriod > 60)) {
            throw new ValidationError('Grace period must be between 0 and 60 minutes');
          }
        }
        break;

      case 'working_days':
        if (value && Array.isArray(value)) {
          const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const invalidDays = value.filter(day => !validDays.includes(day));
          if (invalidDays.length > 0) {
            throw new ValidationError(`Invalid working days: ${invalidDays.join(', ')}`);
          }
        }
        break;
    }
  }

  /**
   * Handle side effects when a setting changes
   */
  private async handleSettingChange(key: string, value: any): Promise<void> {
    try {
      switch (key) {
        case 'notification_schedule':
          // Restart the schedule manager with new timings
          console.log('🔄 Notification schedule updated, restart required for changes to take effect');
          // TODO: Implement dynamic schedule restart
          break;

        case 'smtp_config':
          // Test SMTP connection
          console.log('📧 SMTP configuration updated');
          // TODO: Implement SMTP connection test
          break;

        case 'working_hours':
        case 'attendance_policy':
          console.log('⏰ Attendance policy updated');
          // TODO: Notify attendance service of policy changes
          break;

        default:
          console.log(`⚙️  Setting '${key}' updated successfully`);
      }
    } catch (error) {
      console.error(`Failed to handle setting change for ${key}:`, error);
      // Don't throw error here to avoid breaking the setting update
    }
  }
}