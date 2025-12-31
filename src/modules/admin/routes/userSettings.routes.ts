import { Router } from 'express';
import { UserSettingsController } from '../controllers/userSettings.controller';
import { authenticateToken } from '../../../shared/middleware/auth';
import { roleGuard } from '../../../shared/middleware/roleGuard';
import { Role } from '../../../types';
import {
  validatePasswordPolicy,
  validatePasswordRequest,
  validateRegistrationPolicy,
  validateEmailRequest,
  validateLockoutRules,
  validateProfileField,
  validateProfileFields,
  validateSessionSettings
} from '../validation/userSettings.validation';

const router: Router = Router();
const userSettingsController = new UserSettingsController();

// Apply authentication and admin role requirement to all routes
router.use(authenticateToken);
router.use(roleGuard({ roles: [Role.ADMIN] }));

// Password Policy Routes
router.get('/password-policy', userSettingsController.getPasswordPolicy);
router.put('/password-policy', validatePasswordPolicy, userSettingsController.updatePasswordPolicy);
router.post('/password-policy/validate', validatePasswordRequest, userSettingsController.validatePassword);
router.get('/password-policy/requirements', userSettingsController.getPasswordRequirements);

// Registration Policy Routes
router.get('/registration-policy', userSettingsController.getRegistrationPolicy);
router.put('/registration-policy', validateRegistrationPolicy, userSettingsController.updateRegistrationPolicy);
router.post('/registration-policy/validate-email', validateEmailRequest, userSettingsController.validateRegistrationEmail);
router.get('/registration-policy/check', userSettingsController.checkRegistrationAllowed);

// Account Lockout Rules
router.get('/lockout-rules', userSettingsController.getLockoutRules);
router.put('/lockout-rules', validateLockoutRules, userSettingsController.updateLockoutRules);

// Profile Field Configuration
router.get('/profile-fields', userSettingsController.getProfileFields);
router.put('/profile-fields', validateProfileFields, userSettingsController.updateProfileFields);
router.post('/profile-fields', validateProfileField, userSettingsController.addProfileField);
router.delete('/profile-fields/:fieldName', userSettingsController.removeProfileField);

// Session Settings
router.get('/session-settings', userSettingsController.getSessionSettings);
router.put('/session-settings', validateSessionSettings, userSettingsController.updateSessionSettings);

// Bulk Operations
router.get('/all', userSettingsController.getAllUserSettings);
router.post('/reset', userSettingsController.resetToDefaults);

export { router as userSettingsRoutes };