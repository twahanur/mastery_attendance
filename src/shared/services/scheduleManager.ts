import cron, { ScheduledTask } from 'node-cron';
import { attendanceScheduler } from './attendanceScheduler';
import { EmailSettingsService } from "../../modules/admin/services/emailSettings.service";
import { SettingsService } from "../../modules/settings/settings.service";

interface ScheduleConfig {
  enabled: boolean;
  cronExpression: string;
}

interface NotificationScheduleSettings {
  timezone: string;
  dailyReminder: ScheduleConfig;
  weeklyReport: ScheduleConfig;
  endOfDay: ScheduleConfig;
}

interface ScheduleJobInfo {
  name: string;
  status: string;
  cronExpression: string;
  enabled: boolean;
  nextRun?: string;
}

export class ScheduleManager {
  private static instance: ScheduleManager;
  private isStarted = false;
  private scheduledJobs: Map<string, ScheduledTask> = new Map();
  private jobConfigs: Map<string, ScheduleConfig & { cronExpression: string }> = new Map();
  private emailSettingsService: EmailSettingsService;
  private settingsService: SettingsService;
  private currentTimezone: string = 'Asia/Dhaka';

  private constructor() {
    this.emailSettingsService = new EmailSettingsService();
    this.settingsService = new SettingsService();
  }

  static getInstance(): ScheduleManager {
    if (!ScheduleManager.instance) {
      ScheduleManager.instance = new ScheduleManager();
    }
    return ScheduleManager.instance;
  }

  /**
   * Fetch schedule settings from database
   */
  private async getScheduleSettings(): Promise<NotificationScheduleSettings> {
    try {
      // First try to get from email settings service (email.notifications)
      const scheduleSettings = await this.emailSettingsService.getNotificationSchedule();
      
      if (scheduleSettings && scheduleSettings.timezone) {
        return scheduleSettings;
      }

      // Fallback: Build from individual settings
      const [
        timezone,
        dailyReminderTime,
        enableDailyReminders,
        weeklyReportDay,
        weeklyReportTime,
        enableWeeklyReports,
        endOfDayReportTime,
        enableEndOfDayReports
      ] = await Promise.all([
        this.settingsService.getSettingValue('timezone'),
        this.settingsService.getSettingValue('daily_reminder_time'),
        this.settingsService.getSettingValue('enable_daily_reminders'),
        this.settingsService.getSettingValue('weekly_report_day'),
        this.settingsService.getSettingValue('weekly_report_time'),
        this.settingsService.getSettingValue('enable_weekly_reports'),
        this.settingsService.getSettingValue('end_of_day_report_time'),
        this.settingsService.getSettingValue('enable_email_notifications')
      ]);

      return {
        timezone: timezone || 'Asia/Dhaka',
        dailyReminder: {
          enabled: enableDailyReminders !== false,
          cronExpression: this.timeToCron(dailyReminderTime || '13:00', '1-5')
        },
        weeklyReport: {
          enabled: enableWeeklyReports !== false,
          cronExpression: this.timeToCron(weeklyReportTime || '09:00', String(weeklyReportDay || 1))
        },
        endOfDay: {
          enabled: enableEndOfDayReports !== false,
          cronExpression: this.timeToCron(endOfDayReportTime || '18:00', '1-5')
        }
      };
    } catch (error) {
      console.error('Error fetching schedule settings:', error);
      // Return defaults only if database fetch fails completely
      return this.getDefaultSettings();
    }
  }

  /**
   * Convert time string (HH:MM) to cron expression
   */
  private timeToCron(time: string, dayOfWeek: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    return `${minutes || 0} ${hours || 0} * * ${dayOfWeek}`;
  }

  /**
   * Get default settings as last resort fallback
   */
  private getDefaultSettings(): NotificationScheduleSettings {
    return {
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
    };
  }

  async startSchedules(): Promise<void> {
    if (this.isStarted) {
      console.log("Schedule manager is already running");
      return;
    }

    console.log("Starting schedule manager...");

    try {
      // Fetch all settings from database
      const scheduleSettings = await this.getScheduleSettings();
      this.currentTimezone = scheduleSettings.timezone;

      // Schedule daily reminder
      if (scheduleSettings.dailyReminder.enabled) {
        this.scheduleJob(
          'dailyReminder',
          scheduleSettings.dailyReminder.cronExpression,
          async () => {
            console.log(`[${new Date().toISOString()}] Running daily attendance reminder job`);
            await attendanceScheduler.sendDailyAttendanceReminders();
          },
          scheduleSettings.timezone,
          scheduleSettings.dailyReminder
        );
        console.log(`📝 Daily reminder scheduled: ${scheduleSettings.dailyReminder.cronExpression}`);
      }

      // Schedule weekly report
      if (scheduleSettings.weeklyReport.enabled) {
        this.scheduleJob(
          'weeklyReport',
          scheduleSettings.weeklyReport.cronExpression,
          async () => {
            console.log(`[${new Date().toISOString()}] Running weekly attendance summary job`);
            await attendanceScheduler.sendWeeklyAttendanceSummary();
          },
          scheduleSettings.timezone,
          scheduleSettings.weeklyReport
        );
        console.log(`📊 Weekly report scheduled: ${scheduleSettings.weeklyReport.cronExpression}`);
      }

      // Schedule end-of-day report
      if (scheduleSettings.endOfDay.enabled) {
        this.scheduleJob(
          'endOfDay',
          scheduleSettings.endOfDay.cronExpression,
          async () => {
            console.log(`[${new Date().toISOString()}] Running end-of-day attendance summary`);
            await attendanceScheduler.sendEndOfDayReport();
          },
          scheduleSettings.timezone,
          scheduleSettings.endOfDay
        );
        console.log(`🌅 End-of-day summary scheduled: ${scheduleSettings.endOfDay.cronExpression}`);
      }

      this.isStarted = true;
      console.log("✅ Schedule manager started successfully");
      console.log(`📅 Timezone: ${scheduleSettings.timezone}`);
      console.log(`🔄 Active jobs: ${this.scheduledJobs.size}`);

    } catch (error) {
      console.error("❌ Error starting schedules:", error);
      throw error;
    }
  }

  /**
   * Schedule a job with configuration tracking
   */
  private scheduleJob(
    name: string,
    cronExpression: string,
    task: () => Promise<void>,
    timezone: string,
    config: ScheduleConfig
  ): void {
    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      console.error(`❌ Invalid cron expression for ${name}: ${cronExpression}`);
      return;
    }

    const job = cron.schedule(cronExpression, task, { timezone });
    this.scheduledJobs.set(name, job);
    this.jobConfigs.set(name, { ...config, cronExpression });
  }

  /**
   * Update a specific schedule dynamically
   */
  async updateSchedule(
    jobName: string,
    config: { cronExpression?: string; enabled?: boolean }
  ): Promise<boolean> {
    try {
      const existingJob = this.scheduledJobs.get(jobName);
      const existingConfig = this.jobConfigs.get(jobName);

      // Stop existing job if it exists
      if (existingJob) {
        existingJob.stop();
        this.scheduledJobs.delete(jobName);
      }

      const newConfig = {
        enabled: config.enabled ?? existingConfig?.enabled ?? true,
        cronExpression: config.cronExpression ?? existingConfig?.cronExpression ?? ''
      };

      if (!newConfig.enabled || !newConfig.cronExpression) {
        console.log(`⏸️ Job ${jobName} disabled or no cron expression`);
        this.jobConfigs.set(jobName, newConfig);
        return true;
      }

      // Validate cron expression
      if (!cron.validate(newConfig.cronExpression)) {
        console.error(`❌ Invalid cron expression: ${newConfig.cronExpression}`);
        return false;
      }

      // Get the task for this job
      const task = this.getTaskForJob(jobName);
      if (!task) {
        console.error(`❌ Unknown job: ${jobName}`);
        return false;
      }

      // Schedule new job
      const job = cron.schedule(newConfig.cronExpression, task, {
        timezone: this.currentTimezone
      });

      this.scheduledJobs.set(jobName, job);
      this.jobConfigs.set(jobName, newConfig);

      console.log(`✅ Updated ${jobName}: ${newConfig.cronExpression}`);
      return true;

    } catch (error) {
      console.error(`❌ Error updating schedule ${jobName}:`, error);
      return false;
    }
  }

  /**
   * Get task function for a job name
   */
  private getTaskForJob(jobName: string): (() => Promise<void>) | null {
    switch (jobName) {
      case 'dailyReminder':
        return async () => {
          console.log(`[${new Date().toISOString()}] Running daily attendance reminder job`);
          await attendanceScheduler.sendDailyAttendanceReminders();
        };
      case 'weeklyReport':
        return async () => {
          console.log(`[${new Date().toISOString()}] Running weekly attendance summary job`);
          await attendanceScheduler.sendWeeklyAttendanceSummary();
        };
      case 'endOfDay':
        return async () => {
          console.log(`[${new Date().toISOString()}] Running end-of-day attendance summary`);
          await attendanceScheduler.sendEndOfDayReport();
        };
      default:
        return null;
    }
  }

  /**
   * Update timezone for all jobs
   */
  async updateTimezone(timezone: string): Promise<void> {
    console.log(`🌍 Updating timezone to: ${timezone}`);
    this.currentTimezone = timezone;
    await this.reloadSchedules();
  }

  stop(): void {
    if (!this.isStarted) {
      console.log("Schedule manager is not running");
      return;
    }

    // Stop all tracked jobs
    this.scheduledJobs.forEach((job, name) => {
      job.stop();
      console.log(`🔴 Stopped job: ${name}`);
    });

    this.scheduledJobs.clear();
    this.jobConfigs.clear();
    this.isStarted = false;
    console.log("❌ Schedule manager stopped");
  }

  async reloadSchedules(): Promise<void> {
    console.log("🔄 Reloading schedules from database...");
    this.stop();
    await this.startSchedules();
    console.log("✅ Schedules reloaded successfully");
  }

  /**
   * Get detailed status of all scheduled jobs
   */
  getStatus(): {
    isRunning: boolean;
    activeJobs: number;
    timezone: string;
    jobDetails: ScheduleJobInfo[];
  } {
    const jobDetails: ScheduleJobInfo[] = [];

    this.jobConfigs.forEach((config, name) => {
      const job = this.scheduledJobs.get(name);
      let status = 'disabled';
      
      if (job) {
        try {
          const jobStatus = job.getStatus?.();
          status = jobStatus === 'scheduled' || jobStatus === 'running' ? 'active' : String(jobStatus);
        } catch {
          status = job ? 'active' : 'stopped';
        }
      }

      jobDetails.push({
        name,
        status,
        cronExpression: config.cronExpression,
        enabled: config.enabled,
        nextRun: this.getNextRunTime(config.cronExpression)
      });
    });

    return {
      isRunning: this.isStarted,
      activeJobs: this.scheduledJobs.size,
      timezone: this.currentTimezone,
      jobDetails
    };
  }

  /**
   * Calculate next run time from cron expression (approximate)
   */
  private getNextRunTime(cronExpression: string): string {
    try {
      // Parse cron expression: minute hour dayOfMonth month dayOfWeek
      const parts = cronExpression.split(' ');
      if (parts.length < 5) return 'Invalid cron';

      const [minute, hour, , , dayOfWeek] = parts;
      const now = new Date();
      
      // Simple calculation for daily schedules
      const scheduledHour = parseInt(hour) || 0;
      const scheduledMinute = parseInt(minute) || 0;
      
      const next = new Date(now);
      next.setHours(scheduledHour, scheduledMinute, 0, 0);
      
      // If time has passed today, move to next valid day
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }

      // Adjust for day of week restrictions
      if (dayOfWeek !== '*') {
        const allowedDays = dayOfWeek.includes('-') 
          ? this.expandDayRange(dayOfWeek)
          : dayOfWeek.split(',').map(Number);
        
        while (!allowedDays.includes(next.getDay())) {
          next.setDate(next.getDate() + 1);
        }
      }

      return next.toISOString();
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Expand day range (e.g., "1-5" -> [1,2,3,4,5])
   */
  private expandDayRange(range: string): number[] {
    const [start, end] = range.split('-').map(Number);
    const days: number[] = [];
    for (let i = start; i <= end; i++) {
      days.push(i);
    }
    return days;
  }

  /**
   * Manually trigger a job for testing
   */
  async triggerJob(jobName: string): Promise<{ success: boolean; message: string }> {
    try {
      const task = this.getTaskForJob(jobName);
      if (!task) {
        return { success: false, message: `Unknown job: ${jobName}` };
      }

      console.log(`🔧 Manually triggering job: ${jobName}`);
      await task();
      return { success: true, message: `Job ${jobName} executed successfully` };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message };
    }
  }

  /**
   * Get current timezone
   */
  getTimezone(): string {
    return this.currentTimezone;
  }

  /**
   * Check if a specific job is running
   */
  isJobActive(jobName: string): boolean {
    return this.scheduledJobs.has(jobName);
  }
}