import { Router } from 'express';
import { scheduleSettingsController } from '../controllers/scheduleSettings.controller';
import { authenticateToken } from '../../../shared/middleware/auth';
import { roleGuard } from '../../../shared/middleware/roleGuard';
import { Role } from '../../../types';

const router: Router = Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(roleGuard({ roles: [Role.ADMIN] }));

// Schedule Status and Control
router.get('/status', scheduleSettingsController.getScheduleStatus);
router.post('/start', scheduleSettingsController.startSchedules);
router.post('/stop', scheduleSettingsController.stopSchedules);
router.post('/reload', scheduleSettingsController.reloadSchedules);

// Schedule Settings
router.put('/settings', scheduleSettingsController.updateScheduleSettings);
router.put('/toggle/:scheduleType', scheduleSettingsController.toggleSchedule);

// Manual trigger for testing
router.post('/trigger/:jobName', scheduleSettingsController.triggerJob);

export default router;
