import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import attendanceRoutes from '../modules/attendance/attendance.routes';
import { reportRoutes } from "../modules/reports/report.routes";
import adminRoutes from '../modules/admin/admin.routes';
import settingsRoutes from "../modules/settings/settings.routes";
import { EmailSettingsService } from '../modules/admin/services/emailSettings.service';
import { SettingsService } from "../modules/settings/settings.service";

const router: Router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Email system status check (public for testing)
router.get('/email-check', async (req, res) => {
  try {
    const emailSettingsService = new EmailSettingsService();
    const settingsService = new SettingsService();

    // Read DB-backed SMTP config (falls back to env/defaults if not present)
    const dbSetting = await settingsService.getSetting('email.smtp');
    const config = await emailSettingsService.getSMTPConfig();

    // Consider SMTP configured only when we have credentials
    const smtpConfigured = Boolean(config?.user && config?.pass);

    res.status(200).json({
      success: true,
      message: 'Email system configuration check',
      data: {
        smtpConfigured,
        source: dbSetting ? 'database' : 'env/default',
        configuration: {
          host: config?.host || null,
          port: config?.port ?? null,
          secure: Boolean(config?.secure),
          user: config?.user ? '✅ Present' : '❌ Missing',
          pass: config?.pass ? '✅ Present' : '❌ Missing',
          from: config?.from || null
        },
        environmentVariables: {
          SMTP_HOST: process.env.SMTP_HOST ? '✅ Present' : '❌ Missing',
          SMTP_USER: process.env.SMTP_USER ? '✅ Present' : '❌ Missing',
          SMTP_PASS: process.env.SMTP_PASS ? '✅ Present' : '❌ Missing',
          EMAIL_FROM: process.env.EMAIL_FROM ? '✅ Present' : 'Using default (noreply@attendance.com)'
        },
        scheduledJobs: {
          dailyReminder: '1:00 PM (Monday-Friday)',
          weeklyReport: '9:00 AM (Monday)',
          dailySummary: '6:00 PM (Monday-Friday)'
        },
        timezone: 'Asia/Dhaka'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Email configuration check failed',
      error: error?.message || 'Unknown error'
    });
  }
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/attendance', attendanceRoutes);
router.use("/reports", reportRoutes);
router.use('/admin', adminRoutes);
router.use("/settings", settingsRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

export default router;