import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateToken } from '../../shared/middleware/auth';
import { adminOnly } from '../../shared/middleware/roleGuard';

const router: Router = Router();
const authController = new AuthController();

// Public routes
router.post("/login", authController.login.bind(authController));

// Legacy routes for backward compatibility
router.post("/admin/login", authController.login.bind(authController));
router.post("/employee/login", authController.login.bind(authController));

// Password reset routes (public)
router.post('/forgot-password', authController.requestPasswordReset.bind(authController));
router.post('/verify-reset-token', authController.verifyResetToken.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));

// Protected routes (require authentication)
router.use(authenticateToken);

// User profile routes
router.get('/profile', authController.getProfile.bind(authController));
router.put('/profile', authController.updateProfile.bind(authController));
router.post('/change-password', authController.changePassword.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Admin only routes
router.post('/employees', adminOnly, authController.createEmployee.bind(authController));

export default router;