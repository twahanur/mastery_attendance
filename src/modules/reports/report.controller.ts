import { Request, Response } from 'express';
import { ReportService } from './report.service';
import { ApiResponse, ValidationError, Role } from '../../types';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  /**
   * Generate daily attendance report
   */
  async getDailyReport(req: Request, res: Response): Promise<void> {
    try {
      const { date, format = 'json' } = req.query;
      
      if (!date || typeof date !== 'string') {
        throw new ValidationError('Date parameter is required (YYYY-MM-DD format)');
      }

      const reportData = await this.reportService.generateDailyReport(date);

      if (format === 'pdf') {
        const pdfBuffer = await this.reportService.generateDailyReportPDF(reportData, date);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="daily-report-${date}.pdf"`);
        res.send(pdfBuffer);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Daily report generated successfully',
        data: { report: reportData, date }
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to generate daily report',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Download daily report as PDF
   */
  async downloadDailyReportPDF(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.query;
      const reportDate = date as string || new Date().toISOString().split('T')[0];

      // Generate report data
      const reportData = await this.reportService.generateDailyReport(reportDate);

      // Generate PDF
      const pdfBuffer = await this.reportService.generateDailyReportPDF(reportData, reportDate);

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="daily-report-${reportDate}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Daily PDF report generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate daily PDF report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate weekly attendance report
   */
  async getWeeklyReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, format = 'json' } = req.query;
      
      if (!startDate || typeof startDate !== 'string') {
        throw new ValidationError('Start date parameter is required (YYYY-MM-DD format)');
      }

      const reportData = await this.reportService.generateWeeklyReport(startDate);

      if (format === 'pdf') {
        const pdfBuffer = await this.reportService.generateWeeklyReportPDF(reportData, startDate);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="weekly-report-${startDate}.pdf"`);
        res.send(pdfBuffer);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Weekly report generated successfully',
        data: { report: reportData, startDate }
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to generate weekly report',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Download weekly report as PDF
   */
  async downloadWeeklyReportPDF(req: Request, res: Response): Promise<void> {
    try {
      const { startDate } = req.query;
      const weekStartDate = startDate as string || this.getCurrentWeekStart();

      // Generate report data
      const reportData = await this.reportService.generateWeeklyReport(weekStartDate);

      // Generate PDF
      const pdfBuffer = await this.reportService.generateWeeklyReportPDF(reportData, weekStartDate);

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="weekly-report-${weekStartDate}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Weekly PDF report generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate weekly PDF report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate monthly attendance report
   */
  async getMonthlyReport(req: Request, res: Response): Promise<void> {
    try {
      const { year, month, format = 'json' } = req.query;
      
      if (!year || !month) {
        throw new ValidationError('Year and month parameters are required');
      }

      const reportData = await this.reportService.generateMonthlyReport(
        parseInt(year as string), 
        parseInt(month as string)
      );

      if (format === 'pdf') {
        const pdfBuffer = await this.reportService.generateMonthlyReportPDF(reportData, year as string, month as string);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${year}-${month}.pdf"`);
        res.send(pdfBuffer);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Monthly report generated successfully',
        data: { report: reportData, year, month }
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to generate monthly report',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Generate employee attendance report
   */
  async getEmployeeReport(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate, format = 'json' } = req.query;
      
      if (!startDate || !endDate) {
        throw new ValidationError('Start date and end date parameters are required');
      }

      const reportData = await this.reportService.generateEmployeeReport(
        employeeId,
        startDate as string,
        endDate as string
      );

      if (format === 'pdf') {
        const pdfBuffer = await this.reportService.generateEmployeeReportPDF(reportData, employeeId, startDate as string, endDate as string);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="employee-report-${employeeId}-${startDate}-${endDate}.pdf"`);
        res.send(pdfBuffer);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Employee report generated successfully',
        data: { report: reportData, employeeId, startDate, endDate }
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to generate employee report',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Generate department comparison report
   */
  async getDepartmentReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, format = 'json' } = req.query;
      
      if (!startDate || !endDate) {
        throw new ValidationError('Start date and end date parameters are required');
      }

      const reportData = await this.reportService.generateDepartmentReport(
        startDate as string,
        endDate as string
      );

      if (format === 'pdf') {
        const pdfBuffer = await this.reportService.generateDepartmentReportPDF(reportData, startDate as string, endDate as string);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="department-report-${startDate}-${endDate}.pdf"`);
        res.send(pdfBuffer);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Department report generated successfully',
        data: { report: reportData, startDate, endDate }
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to generate department report',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Download monthly report as PDF
   */
  async downloadMonthlyReportPDF(req: Request, res: Response): Promise<void> {
    try {
      const { year, month } = req.query;
      const currentDate = new Date();
      const reportYear = year ? parseInt(year as string) : currentDate.getFullYear();
      const reportMonth = month ? parseInt(month as string) : currentDate.getMonth() + 1;

      // Validate month
      if (reportMonth < 1 || reportMonth > 12) {
        res.status(400).json({
          success: false,
          message: 'Invalid month. Must be between 1 and 12'
        });
        return;
      }

      // Generate report data
      const reportData = await this.reportService.generateMonthlyReport(reportYear, reportMonth);

      // Generate PDF
      const pdfBuffer = await this.reportService.generateMonthlyReportPDF(reportData, reportYear.toString(), reportMonth.toString());

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${reportYear}-${reportMonth.toString().padStart(2, '0')}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Monthly PDF report generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate monthly PDF report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Download employee report as PDF
   */
  async downloadEmployeeReportPDF(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
        return;
      }

      // Check if employee can access this report
      const user = (req as any).user;
      if (user.role === Role.EMPLOYEE && user.employeeId !== employeeId) {
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own reports'
        });
        return;
      }

      // Generate report data
      const reportData = await this.reportService.generateEmployeeReport(
        employeeId, 
        startDate as string, 
        endDate as string
      );

      // Generate PDF
      const pdfBuffer = await this.reportService.generateEmployeeReportPDF(
        reportData, 
        employeeId, 
        startDate as string, 
        endDate as string
      );

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="employee-report-${employeeId}-${startDate}-${endDate}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Employee PDF report generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate employee PDF report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Download department report as PDF
   */
  async downloadDepartmentReportPDF(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
        return;
      }

      // Generate report data
      const reportData = await this.reportService.generateDepartmentReport(
        startDate as string, 
        endDate as string
      );

      // Generate PDF
      const pdfBuffer = await this.reportService.generateDepartmentReportPDF(
        reportData, 
        startDate as string, 
        endDate as string
      );

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="department-report-${startDate}-${endDate}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Department PDF report generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate department PDF report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get attendance summary statistics
   */
  async getAttendanceSummary(req: Request, res: Response): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's stats
      const todayStats = await this.reportService.generateDailyReport(today);
      
      // Get current week start
      const currentWeekStart = this.getCurrentWeekStart();
      const weekStats = await this.reportService.generateWeeklyReport(currentWeekStart);
      
      // Get current month stats
      const currentDate = new Date();
      const monthStats = await this.reportService.generateMonthlyReport(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      );

      const summary = {
        today: {
          date: today,
          presentCount: todayStats.presentCount,
          absentCount: todayStats.absentCount,
          attendancePercentage: todayStats.attendancePercentage
        },
        thisWeek: {
          averageAttendance: weekStats.averageAttendance,
          bestDay: this.getBestWorstDay(weekStats.dailyStats, 'best'),
          worstDay: this.getBestWorstDay(weekStats.dailyStats, 'worst')
        },
        thisMonth: {
          averageAttendance: monthStats.averageAttendance,
          totalWorkingDays: monthStats.totalWorkingDays,
          perfectAttendees: weekStats.perfectAttendees.length
        },
        trends: {
          comparedToLastWeek: 'Data not available', // Could be implemented with historical data
          comparedToLastMonth: 'Data not available'
        }
      };

      const response: ApiResponse = {
        success: true,
        message: 'Attendance summary retrieved successfully',
        data: summary
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Summary generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate attendance summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper method for summary
  private getBestWorstDay(dailyStats: any[], type: 'best' | 'worst'): string {
    if (!dailyStats.length) return 'N/A';
    
    const sorted = dailyStats.sort((a, b) => 
      type === 'best' ? b.attendancePercentage - a.attendancePercentage : a.attendancePercentage - b.attendancePercentage
    );
    
    const day = sorted[0];
    return `${day.dayName} (${day.attendancePercentage}%)`;
  }

  // Helper method to get current week start date
  private getCurrentWeekStart(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
    const monday = new Date(now);
    monday.setDate(monday.getDate() + diff);
    return monday.toISOString().split('T')[0];
  }

  /**
   * Get day-wise attendance data with present/absent lists
   */
  async getDayWiseAttendance(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, limit = '30' } = req.query;
      
      // Validate parameters
      if (!startDate || !endDate) {
        throw new ValidationError('Both startDate and endDate parameters are required (YYYY-MM-DD format)');
      }

      if (typeof startDate !== 'string' || typeof endDate !== 'string') {
        throw new ValidationError('Date parameters must be strings in YYYY-MM-DD format');
      }

      const limitNumber = parseInt(limit as string, 10);
      if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
        throw new ValidationError('Limit must be a number between 1 and 100');
      }

      const dayWiseData = await this.reportService.generateDayWiseAttendance(
        startDate,
        endDate,
        limitNumber
      );

      const response: ApiResponse = {
        success: true,
        message: 'Day-wise attendance data retrieved successfully',
        data: {
          period: { startDate, endDate },
          totalDays: dayWiseData.length,
          dayWiseAttendance: dayWiseData
        }
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve day-wise attendance data',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }
}