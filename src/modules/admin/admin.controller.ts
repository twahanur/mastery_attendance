import { Request, Response } from 'express';
import { emailService } from '../../shared/services/emailService';
import { ScheduleManager } from '../../shared/services/scheduleManager';

/**
 * Check email notification system status
 */
export const getEmailSystemStatus = async (req: Request, res: Response) => {
  try {
    const scheduleManager = ScheduleManager.getInstance();
    
    // Check if SMTP environment variables are configured
    const smtpConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

    const status = {
      smtpConfigured,
      scheduleManagerActive: scheduleManager ? true : false,
      environmentVariables: {
        SMTP_HOST: process.env.SMTP_HOST ? '✅ Configured' : '❌ Missing',
        SMTP_USER: process.env.SMTP_USER ? '✅ Configured' : '❌ Missing',
        SMTP_PASS: process.env.SMTP_PASS ? '✅ Configured' : '❌ Missing',
        EMAIL_FROM: process.env.EMAIL_FROM || 'Default: noreply@attendance.com',
        SMTP_PORT: process.env.SMTP_PORT || 'Default: 587',
        SMTP_SECURE: process.env.SMTP_SECURE || 'Default: false'
      },
      scheduledJobs: {
        dailyReminder: '1:00 PM (Monday-Friday)',
        weeklyReport: '9:00 AM (Monday)',
        dailySummary: '6:00 PM (Monday-Friday)'
      },
      timezone: 'Asia/Dhaka',
      lastChecked: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Email system status retrieved successfully',
      data: status
    });

  } catch (error) {
    console.error('Error checking email system status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check email system status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Send test email (Admin only)
 */
export const sendTestEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, employeeId } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
      return;
    }

    await emailService.sendAttendanceReminder(
      email,
      name || 'Test User',
      employeeId || 'TEST001'
    );

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      data: {
        recipient: email,
        type: 'attendanceReminder',
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};