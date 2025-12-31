import { SettingsService } from '../settings/settings.service';
import { ValidationError } from '../../types';

export interface CompanyProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  logo?: string;
  website?: string;
}

export interface WorkingHours {
  startTime: string;     // "09:00"
  endTime: string;       // "18:00"
  breakDuration: number; // minutes
  gracePeriod: number;   // minutes
}

export interface WorkingDaySchedule {
  workingDays: string[];
  holidays: string[];
  customSchedules?: Record<string, WorkingHours>;
}

export class CompanySettingsService {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  /**
   * Get complete company profile
   */
  async getCompanyProfile(): Promise<CompanyProfile> {
    const [name, email, phone, address, timezone, logo, website] = await Promise.all([
      this.settingsService.getSetting('company_name'),
      this.settingsService.getSetting('company_email'),
      this.settingsService.getSetting('company_phone'),
      this.settingsService.getSetting('company_address'),
      this.settingsService.getSetting('timezone'),
      this.settingsService.getSetting('company_logo'),
      this.settingsService.getSetting('company_website')
    ]);

    return {
      name: name || 'Your Company Ltd.',
      email: email || '',
      phone: phone || '',
      address: address || '',
      timezone: timezone || 'Asia/Dhaka',
      logo: logo || '',
      website: website || ''
    };
  }

  /**
   * Update company profile
   */
  async updateCompanyProfile(profile: Partial<CompanyProfile>): Promise<CompanyProfile> {
    const updates = [];

    if (profile.name !== undefined) {
      updates.push({ key: 'company_name', value: profile.name });
    }
    if (profile.email !== undefined) {
      updates.push({ key: 'company_email', value: profile.email });
    }
    if (profile.phone !== undefined) {
      updates.push({ key: 'company_phone', value: profile.phone });
    }
    if (profile.address !== undefined) {
      updates.push({ key: 'company_address', value: profile.address });
    }
    if (profile.timezone !== undefined) {
      updates.push({ key: 'timezone', value: profile.timezone });
    }
    if (profile.logo !== undefined) {
      updates.push({ key: 'company_logo', value: profile.logo });
    }
    if (profile.website !== undefined) {
      updates.push({ key: 'company_website', value: profile.website });
    }

    if (updates.length > 0) {
      await this.settingsService.bulkUpdateSettings(updates);
    }

    return this.getCompanyProfile();
  }

  /**
   * Get working hours configuration
   */
  async getWorkingHours(): Promise<WorkingHours> {
    const workingHours = await this.settingsService.getSetting('working_hours');
    
    return {
      startTime: workingHours?.startTime || '09:00',
      endTime: workingHours?.endTime || '18:00',
      breakDuration: workingHours?.breakDuration || 60,
      gracePeriod: workingHours?.gracePeriod || 15
    };
  }

  /**
   * Update working hours configuration
   */
  async updateWorkingHours(hours: Partial<WorkingHours>): Promise<WorkingHours> {
    const currentHours = await this.getWorkingHours();
    
    const newHours = {
      ...currentHours,
      ...hours
    };

    // Validate working hours
    this.validateWorkingHours(newHours);

    await this.settingsService.upsertSetting(
      'working_hours',
      newHours,
      'company',
      'Standard working hours and break configuration'
    );

    return newHours;
  }

  /**
   * Get working days schedule
   */
  async getWorkingDays(): Promise<string[]> {
    const workingDays = await this.settingsService.getSetting('working_days');
    return workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  }

  /**
   * Update working days
   */
  async updateWorkingDays(workingDays: string[]): Promise<string[]> {
    this.validateWorkingDays(workingDays);

    await this.settingsService.upsertSetting(
      'working_days',
      workingDays,
      'company',
      'Days of the week that are considered working days'
    );

    return workingDays;
  }

  /**
   * Get company holidays
   */
  async getHolidays(): Promise<string[]> {
    const holidays = await this.settingsService.getSetting('company_holidays');
    return holidays || [];
  }

  /**
   * Update company holidays
   */
  async updateHolidays(holidays: string[]): Promise<string[]> {
    // Validate holiday dates
    for (const holiday of holidays) {
      if (!this.isValidDate(holiday)) {
        throw new ValidationError(`Invalid holiday date: ${holiday}. Use YYYY-MM-DD format.`);
      }
    }

    await this.settingsService.upsertSetting(
      'company_holidays',
      holidays,
      'company',
      'List of company holidays (YYYY-MM-DD format)'
    );

    return holidays;
  }

  /**
   * Add a single holiday
   */
  async addHoliday(date: string, name?: string): Promise<string[]> {
    if (!this.isValidDate(date)) {
      throw new ValidationError(`Invalid date: ${date}. Use YYYY-MM-DD format.`);
    }

    const currentHolidays = await this.getHolidays();
    const holidayEntries = await this.getHolidayEntries();

    // Add to holidays list
    if (!currentHolidays.includes(date)) {
      currentHolidays.push(date);
      currentHolidays.sort(); // Keep sorted
    }

    // Add to holiday entries with names
    if (name) {
      holidayEntries[date] = name;
      await this.settingsService.upsertSetting(
        'holiday_entries',
        holidayEntries,
        'company',
        'Holiday dates with their names'
      );
    }

    await this.updateHolidays(currentHolidays);
    return currentHolidays;
  }

  /**
   * Remove a holiday
   */
  async removeHoliday(date: string): Promise<string[]> {
    const currentHolidays = await this.getHolidays();
    const holidayEntries = await this.getHolidayEntries();
    
    const updatedHolidays = currentHolidays.filter(h => h !== date);
    delete holidayEntries[date];
    
    await this.settingsService.upsertSetting(
      'holiday_entries',
      holidayEntries,
      'company',
      'Holiday dates with their names'
    );
    
    await this.updateHolidays(updatedHolidays);
    return updatedHolidays;
  }

  /**
   * Get holiday entries with names
   */
  async getHolidayEntries(): Promise<Record<string, string>> {
    const entries = await this.settingsService.getSetting('holiday_entries');
    return entries || {};
  }

  /**
   * Check if a date is a company holiday
   */
  async isHoliday(date: string): Promise<boolean> {
    const holidays = await this.getHolidays();
    return holidays.includes(date);
  }

  /**
   * Check if a date is a working day
   */
  async isWorkingDay(date: string): Promise<boolean> {
    // Check if it's a holiday
    if (await this.isHoliday(date)) {
      return false;
    }

    // Check if it's a configured working day
    const workingDays = await this.getWorkingDays();
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    return workingDays.includes(dayName);
  }

  /**
   * Get complete company schedule information
   */
  async getCompanySchedule(): Promise<{
    workingHours: WorkingHours;
    workingDays: string[];
    holidays: string[];
    holidayEntries: Record<string, string>;
    timezone: string;
  }> {
    const [workingHours, workingDays, holidays, holidayEntries, profile] = await Promise.all([
      this.getWorkingHours(),
      this.getWorkingDays(),
      this.getHolidays(),
      this.getHolidayEntries(),
      this.getCompanyProfile()
    ]);

    return {
      workingHours,
      workingDays,
      holidays,
      holidayEntries,
      timezone: profile.timezone
    };
  }

  /**
   * Initialize default company settings
   */
  async initializeCompanyDefaults(): Promise<void> {
    const defaults = [
      {
        key: 'company_name',
        value: 'Your Company Ltd.',
        category: 'company',
        description: 'Company name displayed throughout the application'
      },
      {
        key: 'company_email',
        value: 'contact@company.com',
        category: 'company',
        description: 'Primary contact email for the company'
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
        key: 'company_holidays',
        value: [],
        category: 'company',
        description: 'List of company holidays (YYYY-MM-DD format)'
      },
      {
        key: 'holiday_entries',
        value: {},
        category: 'company',
        description: 'Holiday dates with their names'
      }
    ];

    const updates = defaults.map(d => ({ key: d.key, value: d.value }));
    await this.settingsService.bulkUpdateSettings(updates);
  }

  // Private validation methods

  private validateWorkingHours(hours: WorkingHours): void {
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(hours.startTime)) {
      throw new ValidationError('Start time must be in HH:MM format (24-hour)');
    }
    
    if (!timeRegex.test(hours.endTime)) {
      throw new ValidationError('End time must be in HH:MM format (24-hour)');
    }

    // Validate start time is before end time
    const [startHour, startMin] = hours.startTime.split(':').map(Number);
    const [endHour, endMin] = hours.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (startMinutes >= endMinutes) {
      throw new ValidationError('Start time must be before end time');
    }

    // Validate break duration
    if (hours.breakDuration < 0 || hours.breakDuration > 480) {
      throw new ValidationError('Break duration must be between 0 and 480 minutes');
    }

    // Validate grace period
    if (hours.gracePeriod < 0 || hours.gracePeriod > 60) {
      throw new ValidationError('Grace period must be between 0 and 60 minutes');
    }
  }

  private validateWorkingDays(workingDays: string[]): void {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    if (workingDays.length === 0) {
      throw new ValidationError('At least one working day must be selected');
    }

    if (workingDays.length > 7) {
      throw new ValidationError('Cannot have more than 7 working days');
    }

    const invalidDays = workingDays.filter(day => !validDays.includes(day));
    if (invalidDays.length > 0) {
      throw new ValidationError(`Invalid working days: ${invalidDays.join(', ')}`);
    }

    // Check for duplicates
    if (new Set(workingDays).size !== workingDays.length) {
      throw new ValidationError('Working days must be unique');
    }
  }

  private isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0];
  }
}