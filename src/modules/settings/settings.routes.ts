import { Router, RequestHandler } from 'express';
import { SettingsController } from './settings.controller';
import { authenticateToken } from '../../shared/middleware/auth';
import { adminOnly } from '../../shared/middleware/roleGuard';
import companySettingsRoutes from './companySettings.routes';
import emailSettingsRoutes from './emailSettings.routes';

const router: Router = Router();
const settingsController = new SettingsController();

const route = (handler: (...args: any[]) => Promise<void>): RequestHandler =>
	(req, res, next) => {
		Promise.resolve(handler(req, res, next)).catch(next);
	};

// Apply authentication and admin-only access to all routes
router.use(authenticateToken);
router.use(adminOnly);

// Company-specific settings (nested routes)
router.use('/company', companySettingsRoutes);

// Email-specific settings (nested routes)
router.use('/email', emailSettingsRoutes);

/**
 * General Admin Settings Management Routes
 * All routes require admin authentication
 */

// Initialize default settings (one-time setup)
router.post('/initialize', route(settingsController.initializeDefaults.bind(settingsController)));

// Get all settings with filtering
router.get('/', route(settingsController.getAllSettings.bind(settingsController)));

// Get settings by category
router.get('/category/:category', route(settingsController.getSettingsByCategory.bind(settingsController)));

// Bulk update multiple settings
router.post('/bulk', route(settingsController.bulkUpdateSettings.bind(settingsController)));

// Get specific setting by key
router.get('/:key', route(settingsController.getSetting.bind(settingsController)));

// Create new setting
router.post('/', route(settingsController.createSetting.bind(settingsController)));

// Update existing setting
router.put('/:key', route(settingsController.updateSetting.bind(settingsController)));

// Upsert setting (create or update)
router.put('/:key/upsert', route(settingsController.upsertSetting.bind(settingsController)));

// Delete setting
router.delete('/:key', route(settingsController.deleteSetting.bind(settingsController)));

export default router;