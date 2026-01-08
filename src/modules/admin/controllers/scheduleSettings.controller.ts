import { Request, Response } from 'express';
import { ScheduleManager } from '../../../shared/services/scheduleManager';
import { EmailSettingsService } from '../services/emailSettings.service';

export class ScheduleSettingsController {
  private emailSettingsService: EmailSettingsService;

  constructor() {
    this.emailSettingsService = new EmailSettingsService();
  }

  /**
   * Get current schedule status
   */
  getScheduleStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const scheduleManager = ScheduleManager.getInstance();
      const status = scheduleManager.getStatus();
      const settings = await this.emailSettingsService.getNotificationSchedule();

      res.json({
        success: true,
        data: {
          ...status,
          settings
        }
      });
    } catch (error) {
      console.error('Error fetching schedule status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch schedule status'
      });
    }
  };

  /**
   * Start all scheduled jobs
   */
  startSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
      const scheduleManager = ScheduleManager.getInstance();
      await scheduleManager.startSchedules();

      const status = scheduleManager.getStatus();

      res.json({
        success: true,
        message: 'Schedules started successfully',
        data: status
      });
    } catch (error) {
      console.error('Error starting schedules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start schedules'
      });
    }
  };

  /**
   * Stop all scheduled jobs
   */
  stopSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
      const scheduleManager = ScheduleManager.getInstance();
      scheduleManager.stop();

      res.json({
        success: true,
        message: 'Schedules stopped successfully'
      });
    } catch (error) {
      console.error('Error stopping schedules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to stop schedules'
      });
    }
  };

  /**
   * Reload schedules with current settings
   */
  reloadSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
      const scheduleManager = ScheduleManager.getInstance();
      await scheduleManager.reloadSchedules();

      const status = scheduleManager.getStatus();

      res.json({
        success: true,
        message: 'Schedules reloaded successfully',
        data: status
      });
    } catch (error) {
      console.error('Error reloading schedules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reload schedules'
      });
    }
  };

  /**
   * Update schedule settings and reload
   */
  updateScheduleSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { timezone, dailyReminder, weeklyReport, endOfDay } = req.body;

      // Validate cron expressions if provided
      const cronRegex = /^(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)$/;
      
      if (dailyReminder?.cronExpression && !cronRegex.test(dailyReminder.cronExpression)) {
        res.status(400).json({
          success: false,
          message: 'Invalid cron expression for dailyReminder'
        });
        return;
      }

      if (weeklyReport?.cronExpression && !cronRegex.test(weeklyReport.cronExpression)) {
        res.status(400).json({
          success: false,
          message: 'Invalid cron expression for weeklyReport'
        });
        return;
      }

      if (endOfDay?.cronExpression && !cronRegex.test(endOfDay.cronExpression)) {
        res.status(400).json({
          success: false,
          message: 'Invalid cron expression for endOfDay'
        });
        return;
      }

      // Update settings
      const updatedSettings = await this.emailSettingsService.updateNotificationSchedule({
        ...(timezone && { timezone }),
        ...(dailyReminder && { dailyReminder }),
        ...(weeklyReport && { weeklyReport }),
        ...(endOfDay && { endOfDay })
      });

      // Reload schedules with new settings
      const scheduleManager = ScheduleManager.getInstance();
      await scheduleManager.reloadSchedules();

      res.json({
        success: true,
        message: 'Schedule settings updated and reloaded successfully',
        data: {
          settings: updatedSettings,
          status: scheduleManager.getStatus()
        }
      });
    } catch (error) {
      console.error('Error updating schedule settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update schedule settings'
      });
    }
  };

  /**
   * Enable/disable specific schedule
   */
  toggleSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scheduleType } = req.params;
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'enabled must be a boolean value'
        });
        return;
      }

      const validTypes = ['dailyReminder', 'weeklyReport', 'endOfDay'];
      if (!validTypes.includes(scheduleType)) {
        res.status(400).json({
          success: false,
          message: `Invalid schedule type. Must be one of: ${validTypes.join(', ')}`
        });
        return;
      }

      const currentSettings = await this.emailSettingsService.getNotificationSchedule();
      const updatePayload: Record<string, any> = {};
      
      // Get the current schedule type settings
      const currentScheduleType = currentSettings[scheduleType as keyof typeof currentSettings];
      if (typeof currentScheduleType === 'object' && currentScheduleType !== null) {
        updatePayload[scheduleType] = {
          ...currentScheduleType,
          enabled
        };
      } else {
        updatePayload[scheduleType] = { enabled };
      }

      const updatedSettings = await this.emailSettingsService.updateNotificationSchedule(updatePayload);

      // Reload schedules
      const scheduleManager = ScheduleManager.getInstance();
      await scheduleManager.reloadSchedules();

      res.json({
        success: true,
        message: `${scheduleType} ${enabled ? 'enabled' : 'disabled'} successfully`,
        data: updatedSettings
      });
    } catch (error) {
      console.error('Error toggling schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle schedule'
      });
    }
  };

  /**
   * Manually trigger a scheduled job (admin testing)
   */
  triggerJob = async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobName } = req.params as { jobName: 'dailyReminder' | 'weeklyReport' | 'endOfDay' };
      const valid = ['dailyReminder', 'weeklyReport', 'endOfDay'];
      if (!valid.includes(jobName)) {
        res.status(400).json({ success: false, message: `Invalid jobName. Use one of: ${valid.join(', ')}` });
        return;
      }

      const scheduleManager = ScheduleManager.getInstance();
      const result = await scheduleManager.triggerJob(jobName);

      res.json({ success: result.success, message: result.message });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to trigger job' });
    }
  };
}

export const scheduleSettingsController = new ScheduleSettingsController();
