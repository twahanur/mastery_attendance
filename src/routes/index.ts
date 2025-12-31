import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import attendanceRoutes from '../modules/attendance/attendance.routes';
import { reportRoutes } from "../modules/reports/report.routes";
import adminRoutes from '../modules/admin/admin.routes';
import settingsRoutes from "../modules/settings/settings.routes";

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
router.get('/email-check', (req, res) => {
  const smtpConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  res.status(200).json({
    success: true,
    message: 'Email system configuration check',
    data: {
      smtpConfigured,
      environmentVariables: {
        SMTP_HOST: process.env.SMTP_HOST ? '✅ Configured' : '❌ Missing',
        SMTP_USER: process.env.SMTP_USER ? '✅ Configured' : '❌ Missing', 
        SMTP_PASS: process.env.SMTP_PASS ? '✅ Configured' : '❌ Missing',
        EMAIL_FROM: process.env.EMAIL_FROM || 'Default: noreply@attendance.com'
      },
      scheduledJobs: {
        dailyReminder: '1:00 PM (Monday-Friday)',
        weeklyReport: '9:00 AM (Monday)', 
        dailySummary: '6:00 PM (Monday-Friday)'
      },
      timezone: 'Asia/Dhaka'
    }
  });
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