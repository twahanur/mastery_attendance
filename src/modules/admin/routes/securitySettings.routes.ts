import { Router } from 'express';
import { securitySettingsController } from '../controllers/securitySettings.controller';
import { authenticateToken } from '../../../shared/middleware/auth';
import { roleGuard } from '../../../shared/middleware/roleGuard';
import { Role } from '../../../types';

const router: Router = Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(roleGuard({ roles: [Role.ADMIN] }));

// Password validation rules
router.get('/password-rules', securitySettingsController.getPasswordRules.bind(securitySettingsController));
router.put('/password-rules', securitySettingsController.updatePasswordRules.bind(securitySettingsController));

// Username validation rules
router.get('/username-rules', securitySettingsController.getUsernameRules.bind(securitySettingsController));
router.put('/username-rules', securitySettingsController.updateUsernameRules.bind(securitySettingsController));

// Rate limiting configuration
router.get('/rate-limit', securitySettingsController.getRateLimitConfig.bind(securitySettingsController));
router.put('/rate-limit', securitySettingsController.updateRateLimitConfig.bind(securitySettingsController));

// Get all security settings
router.get('/all', securitySettingsController.getAllSecuritySettings.bind(securitySettingsController));

export default router;
