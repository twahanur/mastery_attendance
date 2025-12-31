import { Router, RequestHandler } from 'express';
import { EmailSettingsController } from './emailSettings.controller';
import { authenticateToken } from '../../shared/middleware/auth';
import { adminOnly } from '../../shared/middleware/roleGuard';

const router: Router = Router();
const emailController = new EmailSettingsController();

const route = (handler: (...args: any[]) => Promise<void>): RequestHandler =>
	(req, res, next) => {
		Promise.resolve(handler(req, res, next)).catch(next);
	};

// Apply authentication and admin-only access to all routes
router.use(authenticateToken);
router.use(adminOnly);

/**
 * Email Settings Management Routes
 * All routes require admin authentication
 */

// Initialize email default settings
router.post('/initialize', route(emailController.initializeEmailDefaults.bind(emailController)));

// Complete email configuration
router.get('/complete', route(emailController.getCompleteEmailConfig.bind(emailController)));

// SMTP Configuration
router.get('/smtp', route(emailController.getSMTPConfig.bind(emailController)));
router.put('/smtp', route(emailController.updateSMTPConfig.bind(emailController)));
router.post('/smtp/test', route(emailController.testSMTPConnection.bind(emailController)));

// Email Templates
router.get('/templates', route(emailController.getAllEmailTemplates.bind(emailController)));
router.get('/templates/:templateName', route(emailController.getEmailTemplate.bind(emailController)));
router.put('/templates/:templateName', route(emailController.updateEmailTemplate.bind(emailController)));

// Notification Schedule
router.get('/schedule', route(emailController.getNotificationSchedule.bind(emailController)));
router.put('/schedule', route(emailController.updateNotificationSchedule.bind(emailController)));

// Email Notification Settings
router.get('/notifications', route(emailController.getEmailNotificationSettings.bind(emailController)));
router.put('/notifications', route(emailController.updateEmailNotificationSettings.bind(emailController)));

// Test Email
router.post('/test', route(emailController.sendTestEmail.bind(emailController)));

export default router;