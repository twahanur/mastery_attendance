import { Request, Response } from 'express';
import { AttendanceService } from './attendance.service';
import { 
  markAttendanceSchema, 
  markAbsenceSchema,
  updateAttendanceSchema,
  paginationSchema, 
  attendanceFilterSchema,
  monthYearSchema 
} from './attendance.validation';
import { 
  ApiResponse, 
  ValidationError, 
  PaginatedResponse,
  MarkAttendanceRequest,
  MarkAbsenceRequest 
} from '../../types';

export class AttendanceController {
  private attendanceService: AttendanceService;

  constructor() {
    this.attendanceService = new AttendanceService();
  }

  /**
   * Mark attendance for the current user (simplified version)
   * Only requires mood and optional date - other fields calculated from user profile
   */
  async markAttendance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Validate request body
      const { error, value } = markAttendanceSchema.validate(req.body);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || "Validation error",
        );
      }

      const attendanceData: MarkAttendanceRequest = value;
      const attendance = await this.attendanceService.markAttendance(
        userId,
        attendanceData,
      );

      const response: ApiResponse = {
        success: true,
        message: "Attendance marked successfully",
        data: { attendance },
      };

      res.status(201).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to mark attendance",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Record an absence for the current user with a required reason
   */
  async markAbsence(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const { error, value } = markAbsenceSchema.validate(req.body);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || "Validation error",
        );
      }

      const absenceData: MarkAbsenceRequest = value;
      const attendance = await this.attendanceService.markAbsence(
        userId,
        absenceData,
      );

      const response: ApiResponse = {
        success: true,
        message: "Absence recorded successfully",
        data: { attendance },
      };

      res.status(201).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to record absence",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Update attendance (e.g., add check-out time)
   */
  async updateAttendance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { attendanceId } = req.params;

      if (!attendanceId) {
        throw new ValidationError("Attendance ID is required");
      }

      // Validate request body
      const { error, value } = updateAttendanceSchema.validate(req.body);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || "Validation error",
        );
      }

      const { checkOutTime, notes } = value;
      const attendance = await this.attendanceService.updateAttendance(
        userId,
        attendanceId,
        checkOutTime,
        notes,
      );

      const response: ApiResponse = {
        success: true,
        message: "Attendance updated successfully",
        data: { attendance },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to update attendance",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get all attendance records for the current user
   */
  async getMyAttendanceRecords(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Validate query parameters
      const { error, value } = attendanceFilterSchema.validate(req.query);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || "Validation error",
        );
      }

      const { page, limit, startDate, endDate, section, shift, mood } = value;
      const result = await this.attendanceService.getUserAttendanceRecords(
        userId,
        page,
        limit,
        { startDate, endDate, section, shift, mood },
      );

      const totalPages = Math.ceil(result.totalCount / limit);

      const response: PaginatedResponse<typeof result> = {
        success: true,
        message: "Attendance records retrieved successfully",
        data: result,
        pagination: {
          page,
          limit,
          total: result.totalCount,
          totalPages,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to get attendance records",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get attendance summary for current month
   */
  async getCurrentMonthSummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const summary = await this.attendanceService.getCurrentMonthSummary(
        userId,
      );

      const response: ApiResponse = {
        success: true,
        message: "Current month attendance summary retrieved successfully",
        data: { summary },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to get current month summary",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get attendance summary for specific month and year
   */
  async getMonthSummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Validate month and year parameters
      const { error, value } = monthYearSchema.validate(req.query);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || "Validation error",
        );
      }

      const { month, year } = value;

      // Use current date if month/year not provided
      const currentDate = new Date();
      const targetMonth = month || currentDate.getMonth() + 1;
      const targetYear = year || currentDate.getFullYear();

      const summary = await this.attendanceService.getMonthSummary(
        userId,
        targetYear,
        targetMonth,
      );

      const response: ApiResponse = {
        success: true,
        message: "Monthly attendance summary retrieved successfully",
        data: { summary },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to get monthly summary",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Check if today's attendance is marked
   */
  async checkTodayAttendance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const isMarked = await this.attendanceService.isTodayAttendanceMarked(
        userId,
      );

      const response: ApiResponse = {
        success: true,
        message: "Today attendance status retrieved successfully",
        data: {
          isMarked,
          date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to check today attendance",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Check attendance for a specific date
   */
  async checkDateAttendance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { date } = req.params;

      if (!date) {
        throw new ValidationError("Date parameter is required");
      }

      const attendance = await this.attendanceService.getDateAttendance(
        userId,
        date,
      );
      const isMarked = attendance !== null;

      const response: ApiResponse = {
        success: true,
        message: "Date attendance status retrieved successfully",
        data: {
          isMarked,
          date,
          attendance,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to check date attendance",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get user attendance statistics
   */
  async getAttendanceStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await this.attendanceService.getUserAttendanceStats(userId);

      const response: ApiResponse = {
        success: true,
        message: "Attendance statistics retrieved successfully",
        data: { stats },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to get attendance statistics",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Delete attendance for a specific date
   */
  async deleteAttendance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { date } = req.params;

      if (!date) {
        throw new ValidationError("Date parameter is required");
      }

      await this.attendanceService.deleteAttendance(userId, date);

      const response: ApiResponse = {
        success: true,
        message: `Attendance for ${date} deleted successfully`,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to delete attendance",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get attendance chart data for visualization
   * Returns aggregated daily attendance data for the specified number of days
   */
  async getAttendanceChart(req: Request, res: Response): Promise<void> {
    try {
      // Parse days from query parameter, default to 90
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 90;

      // Validate days parameter
      if (isNaN(days) || days < 1 || days > 365) {
        throw new ValidationError("Days must be a number between 1 and 365");
      }

      const chartData = await this.attendanceService.getChartData(days);

      const response: ApiResponse = {
        success: true,
        message: "Attendance chart data retrieved successfully",
        data: {
          chartData,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to get attendance chart data",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }
}