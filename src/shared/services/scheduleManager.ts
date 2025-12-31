import cron, { ScheduledTask } from 'node-cron';
import { attendanceScheduler } from './attendanceScheduler';
import { EmailSettingsService } from "../../modules/admin/services/emailSettings.service";

export class ScheduleManager {
  private static instance: ScheduleManager;
  private isStarted = false;
  private scheduledJobs: Map<string, ScheduledTask> = new Map();
  private emailSettingsService: EmailSettingsService;

  private constructor() {
    this.emailSettingsService = new EmailSettingsService();
  }

  static getInstance(): ScheduleManager {
    if (!ScheduleManager.instance) {
      ScheduleManager.instance = new ScheduleManager();
    }
    return ScheduleManager.instance;
  }

  async startSchedules(): Promise<void> {
    if (this.isStarted) {
      console.log("Schedule manager is already running");
      return;
    }

    console.log("Starting schedule manager...");

    try {
      // Get notification schedules from settings
      const scheduleSettings =
        await this.emailSettingsService.getNotificationSchedule();

      if (scheduleSettings.dailyReminder.enabled) {
        const dailyReminderJob = cron.schedule(
          scheduleSettings.dailyReminder.cronExpression,
          async () => {
            console.log("Running daily attendance reminder job");
            await attendanceScheduler.sendDailyAttendanceReminders();
          },
          {
            timezone: scheduleSettings.timezone,
          },
        );
        this.scheduledJobs.set("dailyReminder", dailyReminderJob);
        console.log(
          `📝 Daily reminder scheduled: ${scheduleSettings.dailyReminder.cronExpression}`,
        );
      }

      if (scheduleSettings.weeklyReport.enabled) {
        const weeklyReportJob = cron.schedule(
          scheduleSettings.weeklyReport.cronExpression,
          async () => {
            console.log("Running weekly attendance summary job");
            await attendanceScheduler.sendWeeklyAttendanceSummary();
          },
          {
            timezone: scheduleSettings.timezone,
          },
        );
        this.scheduledJobs.set("weeklyReport", weeklyReportJob);
        console.log(
          `📊 Weekly report scheduled: ${scheduleSettings.weeklyReport.cronExpression}`,
        );
      }

      if (scheduleSettings.endOfDay.enabled) {
        const endOfDayJob = cron.schedule(
          scheduleSettings.endOfDay.cronExpression,
          async () => {
            console.log("Running end-of-day attendance summary");
            await attendanceScheduler.sendDailyAttendanceReminders();
          },
          {
            timezone: scheduleSettings.timezone,
          },
        );
        this.scheduledJobs.set("endOfDay", endOfDayJob);
        console.log(
          `🌅 End-of-day summary scheduled: ${scheduleSettings.endOfDay.cronExpression}`,
        );
      }

      this.isStarted = true;
      console.log("✅ Schedule manager started successfully");
      console.log(`📅 Timezone: ${scheduleSettings.timezone}`);
      console.log(`🔄 Active jobs: ${this.scheduledJobs.size}`);
    } catch (error) {
      console.error("❌ Error starting schedules:", error);
      // Fallback to default schedules
      this.startDefaultSchedules();
    }
  }

  private startDefaultSchedules(): void {
    console.log("⚠️ Starting with default schedules...");

    // Default schedules - fallback when settings are not available
    const dailyReminderJob = cron.schedule(
      "0 13 * * 1-5",
      async () => {
        console.log("Running daily attendance reminder job at 1:00 PM");
        await attendanceScheduler.sendDailyAttendanceReminders();
      },
      {
        timezone: "Asia/Dhaka",
      },
    );

    const weeklyReportJob = cron.schedule(
      "0 9 * * 1",
      async () => {
        console.log("Running weekly attendance summary job");
        await attendanceScheduler.sendWeeklyAttendanceSummary();
      },
      {
        timezone: "Asia/Dhaka",
      },
    );

    const endOfDayJob = cron.schedule(
      "0 18 * * 1-5",
      async () => {
        console.log("Running end-of-day attendance summary");
        await attendanceScheduler.sendDailyAttendanceReminders();
      },
      {
        timezone: "Asia/Dhaka",
      },
    );

    this.scheduledJobs.set("dailyReminder", dailyReminderJob);
    this.scheduledJobs.set("weeklyReport", weeklyReportJob);
    this.scheduledJobs.set("endOfDay", endOfDayJob);

    this.isStarted = true;
    console.log("✅ Default schedules started");
  }

  stop(): void {
    if (!this.isStarted) {
      console.log("Schedule manager is not running");
      return;
    }

    // Stop all tracked jobs
    this.scheduledJobs.forEach((job, name) => {
      job.destroy();
      console.log(`🔴 Stopped job: ${name}`);
    });

    this.scheduledJobs.clear();
    this.isStarted = false;
    console.log("❌ Schedule manager stopped");
  }

  async reloadSchedules(): Promise<void> {
    console.log("🔄 Reloading schedules...");
    this.stop();
    await this.startSchedules();
  }

  getStatus(): { isRunning: boolean; activeJobs: number; jobDetails: Array<{ name: string; status: string }> } {
    const jobDetails = Array.from(this.scheduledJobs.entries()).map(([name, job]) => {
      const statusValue = typeof job.getStatus === 'function' ? job.getStatus() : 'unknown';
      const status = statusValue instanceof Promise ? 'unknown' : statusValue;

      return { name, status };
    });

    return {
      isRunning: this.isStarted,
      activeJobs: this.scheduledJobs.size,
      jobDetails,
    };
  }
}