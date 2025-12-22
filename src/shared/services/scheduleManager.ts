import cron from 'node-cron';
import { attendanceScheduler } from './attendanceScheduler';

export class ScheduleManager {
  private static instance: ScheduleManager;
  private isStarted = false;

  private constructor() {}

  static getInstance(): ScheduleManager {
    if (!ScheduleManager.instance) {
      ScheduleManager.instance = new ScheduleManager();
    }
    return ScheduleManager.instance;
  }

  startSchedules(): void {
    if (this.isStarted) {
      console.log('Schedule manager is already running');
      return;
    }

    console.log('Starting schedule manager...');

    // Daily attendance reminder at 1:00 PM (13:00)
    cron.schedule('0 13 * * 1-5', async () => {
      console.log('Running daily attendance reminder job at 1:00 PM');
      await attendanceScheduler.sendDailyAttendanceReminders();
    }, {
      timezone: 'Asia/Dhaka' // Adjust timezone as needed
    });

    // Weekly report every Monday at 9:00 AM
    cron.schedule('0 9 * * 1', async () => {
      console.log('Running weekly attendance summary job');
      await attendanceScheduler.sendWeeklyAttendanceSummary();
    }, {
      timezone: 'Asia/Dhaka'
    });

    // Daily absentee summary for admin at 6:00 PM
    cron.schedule('0 18 * * 1-5', async () => {
      console.log('Running end-of-day attendance summary');
      await attendanceScheduler.sendDailyAttendanceReminders();
    }, {
      timezone: 'Asia/Dhaka'
    });

    this.isStarted = true;
    console.log('✅ Schedule manager started successfully');
    console.log('📅 Scheduled jobs:');
    console.log('  - Daily attendance reminders: 1:00 PM (weekdays)');
    console.log('  - Weekly summary reports: Monday 9:00 AM');
    console.log('  - End-of-day summaries: 6:00 PM (weekdays)');
  }

  stop(): void {
    if (!this.isStarted) {
      console.log('Schedule manager is not running');
      return;
    }

    cron.getTasks().forEach(task => task.destroy());
    this.isStarted = false;
    console.log('❌ Schedule manager stopped');
  }

  getStatus(): { isRunning: boolean; activeJobs: number } {
    const activeJobs = cron.getTasks().size;
    return {
      isRunning: this.isStarted,
      activeJobs
    };
  }
}