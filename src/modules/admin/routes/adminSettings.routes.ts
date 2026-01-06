import { Router } from 'express';
import { adminSettingsController } from '../controllers/adminSettings.controller';
import { authenticateToken } from '../../../shared/middleware/auth';
import { roleGuard } from '../../../shared/middleware/roleGuard';
import { Role } from '../../../types';

const router: Router = Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(roleGuard({ roles: [Role.ADMIN] }));

// Get all settings at once
router.get('/all', adminSettingsController.getAllSettings);

// Get settings by category
router.get('/category/:category', adminSettingsController.getSettingsByCategory);

// Dashboard overview
router.get('/dashboard', adminSettingsController.getDashboardOverview);

// Initialize defaults
router.post('/initialize', adminSettingsController.initializeDefaults);

export default router;
