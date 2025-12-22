import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticateToken } from '../../shared/middleware/auth';
import { adminOnly } from '../../shared/middleware/roleGuard';

const router: Router = Router();
const userController = new UserController();

// All user management routes require admin authentication
router.use(authenticateToken);
router.use(adminOnly);

// Employee management routes
router.get('/employees', userController.getEmployees.bind(userController));
router.get('/employees/:employeeId', userController.getEmployeeById.bind(userController));
router.put('/employees/:employeeId', userController.updateEmployee.bind(userController));
router.post('/employees/:employeeId/deactivate', userController.deactivateEmployee.bind(userController));
router.post('/employees/:employeeId/activate', userController.activateEmployee.bind(userController));
router.delete('/employees/:employeeId', userController.deleteEmployee.bind(userController));

// Data endpoints
router.get("/dashboard", userController.getDashboardStats.bind(userController));
router.get('/departments', userController.getDepartments.bind(userController));
router.get('/sections', userController.getSections.bind(userController));
router.get('/statistics', userController.getEmployeeStats.bind(userController));

export default router;