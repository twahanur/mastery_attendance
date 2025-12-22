import express, { Router } from 'express';
import { getEmailSystemStatus, sendTestEmail } from './admin.controller';
import { authenticateToken } from '../../shared/middleware/auth';
import { roleGuard } from '../../shared/middleware/roleGuard';
import { Role } from '../../types';

const router: Router = express.Router();

// Email system status (Admin only)
router.get('/email-status', authenticateToken, roleGuard({ roles: [Role.ADMIN] }), getEmailSystemStatus);

// Send test email (Admin only)
router.post('/test-email', authenticateToken, roleGuard({ roles: [Role.ADMIN] }), sendTestEmail);

export default router;