import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { authenticateToken } from '../../shared/middleware/auth';
import { adminOrEmployee } from '../../shared/middleware/roleGuard';

const router: Router = Router();
const attendanceController = new AttendanceController();

// All attendance routes require authentication
router.use(authenticateToken);
router.use(adminOrEmployee);

// Attendance management routes
router.post('/mark', attendanceController.markAttendance.bind(attendanceController));
router.post('/absent', attendanceController.markAbsence.bind(attendanceController));
router.put('/:attendanceId', attendanceController.updateAttendance.bind(attendanceController));
router.get('/my-records', attendanceController.getMyAttendanceRecords.bind(attendanceController));
router.get('/current-month-summary', attendanceController.getCurrentMonthSummary.bind(attendanceController));
router.get('/month-summary', attendanceController.getMonthSummary.bind(attendanceController));
router.get('/chart', attendanceController.getAttendanceChart.bind(attendanceController));
router.get('/today', attendanceController.checkTodayAttendance.bind(attendanceController));
router.get('/date/:date', attendanceController.checkDateAttendance.bind(attendanceController));
router.get('/stats', attendanceController.getAttendanceStats.bind(attendanceController));
router.delete('/date/:date', attendanceController.deleteAttendance.bind(attendanceController));

export default router;