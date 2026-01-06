import express, { Router } from 'express';
import { getEmailSystemStatus, sendTestEmail } from './admin.controller';
import { authenticateToken } from '../../shared/middleware/auth';
import { roleGuard } from '../../shared/middleware/roleGuard';
import { userSettingsRoutes } from "./routes/userSettings.routes";
import securitySettingsRoutes from './routes/securitySettings.routes';
import emailSettingsRoutes from './routes/emailSettings.routes';
import scheduleSettingsRoutes from './routes/scheduleSettings.routes';
import adminSettingsRoutes from './routes/adminSettings.routes';
import { Role } from '../../types';

const router: Router = express.Router();

// Email system status (Admin only)
router.get('/email-status', authenticateToken, roleGuard({ roles: [Role.ADMIN] }), getEmailSystemStatus);

// Send test email (Admin only)
router.post('/test-email', authenticateToken, roleGuard({ roles: [Role.ADMIN] }), sendTestEmail);

// Unified Admin Settings (all settings in one place)
router.use('/settings', adminSettingsRoutes);

// User Management Settings
router.use('/user-settings', userSettingsRoutes);

// Security Settings (Password validation, Rate limiting, etc.)
router.use('/security-settings', securitySettingsRoutes);

// Email Settings (SMTP, Templates, Schedules)
router.use('/email-settings', emailSettingsRoutes);

// Schedule Settings (Automated reminders and reports)
router.use('/schedule-settings', scheduleSettingsRoutes);

export default router;