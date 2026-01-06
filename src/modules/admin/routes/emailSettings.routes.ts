import { Router } from 'express';
import { emailSettingsController } from '../controllers/emailSettings.controller';
import { authenticateToken } from '../../../shared/middleware/auth';
import { roleGuard } from '../../../shared/middleware/roleGuard';
import { Role } from '../../../types';

const router: Router = Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(roleGuard({ roles: [Role.ADMIN] }));

// SMTP Configuration
router.get('/smtp', emailSettingsController.getSMTPConfig);
router.put('/smtp', emailSettingsController.updateSMTPConfig);
router.post('/smtp/test', emailSettingsController.testSMTPConnection);

// Notification Schedule
router.get('/schedule', emailSettingsController.getNotificationSchedule);
router.put('/schedule', emailSettingsController.updateNotificationSchedule);

// Email Templates
router.get('/templates', emailSettingsController.getAllTemplates);
router.get('/templates/:templateType', emailSettingsController.getTemplate);
router.put('/templates/:templateType', emailSettingsController.updateTemplate);
router.delete('/templates/:templateType', emailSettingsController.deleteTemplate);
router.post('/templates/init-defaults', emailSettingsController.initializeDefaultTemplates);

// Test Email
router.post('/test', emailSettingsController.sendTestEmail);

// Get all email settings at once
router.get('/all', emailSettingsController.getAllEmailSettings);

export default router;
