import { Request, Response } from 'express';
import { CompanySettingsService, CompanyProfile, WorkingHours } from './companySettings.service';
import { ValidationError, AuthenticatedRequest } from '../../types';

export class CompanySettingsController {
  private companySettingsService: CompanySettingsService;

  constructor() {
    this.companySettingsService = new CompanySettingsService();
  }

  /**
   * Get company profile
   * GET /api/v1/settings/company/profile
   */
  async getCompanyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = await this.companySettingsService.getCompanyProfile();

      res.status(200).json({
        success: true,
        message: 'Company profile retrieved successfully',
        data: profile
      });
    } catch (error) {
      console.error('Error fetching company profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update company profile
   * PUT /api/v1/settings/company/profile
   */
  async updateCompanyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profileData: Partial<CompanyProfile> = req.body;

      const updatedProfile = await this.companySettingsService.updateCompanyProfile(profileData);

      res.status(200).json({
        success: true,
        message: 'Company profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error updating company profile:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update company profile',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Get working hours configuration
   * GET /api/v1/settings/company/working-hours
   */
  async getWorkingHours(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const workingHours = await this.companySettingsService.getWorkingHours();

      res.status(200).json({
        success: true,
        message: 'Working hours retrieved successfully',
        data: workingHours
      });
    } catch (error) {
      console.error('Error fetching working hours:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch working hours',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update working hours configuration
   * PUT /api/v1/settings/company/working-hours
   */
  async updateWorkingHours(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const hoursData: Partial<WorkingHours> = req.body;

      const updatedHours = await this.companySettingsService.updateWorkingHours(hoursData);

      res.status(200).json({
        success: true,
        message: 'Working hours updated successfully',
        data: updatedHours
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error updating working hours:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update working hours',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Get working days
   * GET /api/v1/settings/company/working-days
   */
  async getWorkingDays(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const workingDays = await this.companySettingsService.getWorkingDays();

      res.status(200).json({
        success: true,
        message: 'Working days retrieved successfully',
        data: { workingDays }
      });
    } catch (error) {
      console.error('Error fetching working days:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch working days',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update working days
   * PUT /api/v1/settings/company/working-days
   */
  async updateWorkingDays(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { workingDays } = req.body;

      if (!workingDays || !Array.isArray(workingDays)) {
        res.status(400).json({
          success: false,
          message: 'workingDays array is required',
          example: {
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        });
        return;
      }

      const updatedWorkingDays = await this.companySettingsService.updateWorkingDays(workingDays);

      res.status(200).json({
        success: true,
        message: 'Working days updated successfully',
        data: { workingDays: updatedWorkingDays }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error updating working days:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update working days',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Get company holidays
   * GET /api/v1/settings/company/holidays
   */
  async getHolidays(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const holidays = await this.companySettingsService.getHolidays();
      const holidayEntries = await this.companySettingsService.getHolidayEntries();

      res.status(200).json({
        success: true,
        message: 'Company holidays retrieved successfully',
        data: {
          holidays,
          holidayEntries,
          count: holidays.length
        }
      });
    } catch (error) {
      console.error('Error fetching holidays:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch holidays',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update company holidays (bulk)
   * PUT /api/v1/settings/company/holidays
   */
  async updateHolidays(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { holidays } = req.body;

      if (!holidays || !Array.isArray(holidays)) {
        res.status(400).json({
          success: false,
          message: 'holidays array is required',
          example: {
            holidays: ['2025-01-01', '2025-12-25']
          }
        });
        return;
      }

      const updatedHolidays = await this.companySettingsService.updateHolidays(holidays);

      res.status(200).json({
        success: true,
        message: 'Company holidays updated successfully',
        data: {
          holidays: updatedHolidays,
          count: updatedHolidays.length
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error updating holidays:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update holidays',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Add a single holiday
   * POST /api/v1/settings/company/holidays
   */
  async addHoliday(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { date, name } = req.body;

      if (!date) {
        res.status(400).json({
          success: false,
          message: 'date is required',
          example: {
            date: '2025-01-01',
            name: 'New Year Day (optional)'
          }
        });
        return;
      }

      const updatedHolidays = await this.companySettingsService.addHoliday(date, name);

      res.status(201).json({
        success: true,
        message: 'Holiday added successfully',
        data: {
          holidays: updatedHolidays,
          addedHoliday: { date, name },
          count: updatedHolidays.length
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error adding holiday:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to add holiday',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Remove a holiday
   * DELETE /api/v1/settings/company/holidays/:date
   */
  async removeHoliday(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { date } = req.params;

      const updatedHolidays = await this.companySettingsService.removeHoliday(date);

      res.status(200).json({
        success: true,
        message: 'Holiday removed successfully',
        data: {
          holidays: updatedHolidays,
          removedDate: date,
          count: updatedHolidays.length
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error removing holiday:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to remove holiday',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Check if a date is a working day
   * GET /api/v1/settings/company/check-working-day/:date
   */
  async checkWorkingDay(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { date } = req.params;

      const isWorkingDay = await this.companySettingsService.isWorkingDay(date);
      const isHoliday = await this.companySettingsService.isHoliday(date);

      res.status(200).json({
        success: true,
        message: 'Working day check completed',
        data: {
          date,
          isWorkingDay,
          isHoliday,
          dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
        }
      });
    } catch (error) {
      console.error('Error checking working day:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check working day',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get complete company schedule information
   * GET /api/v1/settings/company/schedule
   */
  async getCompanySchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const schedule = await this.companySettingsService.getCompanySchedule();

      res.status(200).json({
        success: true,
        message: 'Company schedule retrieved successfully',
        data: schedule
      });
    } catch (error) {
      console.error('Error fetching company schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company schedule',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Initialize company default settings
   * POST /api/v1/settings/company/initialize
   */
  async initializeCompanyDefaults(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await this.companySettingsService.initializeCompanyDefaults();

      const profile = await this.companySettingsService.getCompanyProfile();
      const schedule = await this.companySettingsService.getCompanySchedule();

      res.status(200).json({
        success: true,
        message: 'Company default settings initialized successfully',
        data: {
          profile,
          schedule
        }
      });
    } catch (error) {
      console.error('Error initializing company defaults:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize company defaults',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}