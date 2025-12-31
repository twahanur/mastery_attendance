import { Router, RequestHandler } from 'express';
import { CompanySettingsController } from './companySettings.controller';
import { authenticateToken } from '../../shared/middleware/auth';
import { adminOnly } from '../../shared/middleware/roleGuard';

const router: Router = Router();
const companyController = new CompanySettingsController();

const route = (handler: (...args: any[]) => Promise<void>): RequestHandler =>
	(req, res, next) => {
		Promise.resolve(handler(req, res, next)).catch(next);
	};

// Apply authentication and admin-only access to all routes
router.use(authenticateToken);
router.use(adminOnly);

/**
 * Company Settings Management Routes
 * All routes require admin authentication
 */

// Initialize company default settings
router.post('/initialize', route(companyController.initializeCompanyDefaults.bind(companyController)));

// Company Profile Management
router.get('/profile', route(companyController.getCompanyProfile.bind(companyController)));
router.put('/profile', route(companyController.updateCompanyProfile.bind(companyController)));

// Working Hours Management
router.get('/working-hours', route(companyController.getWorkingHours.bind(companyController)));
router.put('/working-hours', route(companyController.updateWorkingHours.bind(companyController)));

// Working Days Management
router.get('/working-days', route(companyController.getWorkingDays.bind(companyController)));
router.put('/working-days', route(companyController.updateWorkingDays.bind(companyController)));

// Holiday Management
router.get('/holidays', route(companyController.getHolidays.bind(companyController)));
router.put('/holidays', route(companyController.updateHolidays.bind(companyController)));
router.post('/holidays', route(companyController.addHoliday.bind(companyController)));
router.delete('/holidays/:date', route(companyController.removeHoliday.bind(companyController)));

// Utility Endpoints
router.get('/check-working-day/:date', route(companyController.checkWorkingDay.bind(companyController)));
router.get('/schedule', route(companyController.getCompanySchedule.bind(companyController)));

export default router;