import { Router } from 'express';
import { ReportController } from './report.controller';
import { authenticateToken } from '../../shared/middleware/auth';
import { roleGuard } from '../../shared/middleware/roleGuard';
import { Role } from '../../types';

const router: Router = Router();
const reportController = new ReportController();

// Apply authentication to all report routes
router.use(authenticateToken);

/**
 * @route GET /reports/daily
 * @desc Generate daily attendance report
 * @access Admin only
 */
router.get('/daily', 
  roleGuard({ roles: [Role.ADMIN] }), 
  reportController.getDailyReport.bind(reportController)
);

/**
 * @route GET /reports/daily/pdf
 * @desc Download daily attendance report as PDF
 * @access Admin only
 */
router.get('/daily/pdf', 
  roleGuard({ roles: [Role.ADMIN] }), 
  reportController.downloadDailyReportPDF.bind(reportController)
);

/**
 * @route GET /reports/weekly
 * @desc Generate weekly attendance report
 * @access Admin only
 */
router.get('/weekly', 
  roleGuard({ roles: [Role.ADMIN] }), 
  reportController.getWeeklyReport.bind(reportController)
);

/**
 * @route GET /reports/weekly/pdf
 * @desc Download weekly attendance report as PDF
 * @access Admin only
 */
router.get('/weekly/pdf', 
  roleGuard({ roles: [Role.ADMIN] }), 
  reportController.downloadWeeklyReportPDF.bind(reportController)
);

/**
 * @route GET /reports/monthly
 * @desc Generate monthly attendance report
 * @access Admin only
 */
router.get('/monthly', 
  roleGuard({ roles: [Role.ADMIN] }), 
  reportController.getMonthlyReport.bind(reportController)
);

/**
 * @route GET /reports/monthly/pdf
 * @desc Download monthly attendance report as PDF
 * @access Admin only
 */
router.get('/monthly/pdf', 
  roleGuard({ roles: [Role.ADMIN] }), 
  reportController.downloadMonthlyReportPDF.bind(reportController)
);

/**
 * @route GET /reports/employee/:employeeId
 * @desc Generate employee-specific attendance report
 * @access Admin and Employee (employee can only view their own report)
 */
router.get('/employee/:employeeId', 
  reportController.getEmployeeReport.bind(reportController)
);

/**
 * @route GET /reports/employee/:employeeId/pdf
 * @desc Download employee-specific attendance report as PDF
 * @access Admin and Employee (employee can only view their own report)
 */
router.get('/employee/:employeeId/pdf', 
  reportController.downloadEmployeeReportPDF.bind(reportController)
);

/**
 * @route GET /reports/department
 * @desc Generate department comparison report
 * @access Admin only
 */
router.get('/department', 
  roleGuard({ roles: [Role.ADMIN] }), 
  reportController.getDepartmentReport.bind(reportController)
);

/**
 * @route GET /reports/department/pdf
 * @desc Download department comparison report as PDF
 * @access Admin only
 */
router.get('/department/pdf', 
  roleGuard({ roles: [Role.ADMIN] }), 
  reportController.downloadDepartmentReportPDF.bind(reportController)
);

/**
 * @route GET /reports/summary
 * @desc Get attendance summary statistics
 * @access Admin only
 */
router.get('/summary', 
  roleGuard({ roles: [Role.ADMIN] }), 
  reportController.getAttendanceSummary.bind(reportController)
);

/**
 * @route GET /reports/day-wise
 * @desc Get day-wise attendance data with present/absent lists
 * @access Admin only
 * @query startDate - Start date (YYYY-MM-DD)
 * @query endDate - End date (YYYY-MM-DD)  
 * @query limit - Number of days to return (default: 30, max: 100)
 */
router.get('/day-wise',
  roleGuard({ roles: [Role.ADMIN] }),
  reportController.getDayWiseAttendance.bind(reportController)
);

export { router as reportRoutes };