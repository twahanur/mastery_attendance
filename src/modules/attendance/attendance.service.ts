import { prisma } from '../../shared/config/database';
import {
  MarkAttendanceRequest,
  MarkAbsenceRequest,
  AttendanceResponse,
  AttendanceSummary,
  AttendanceDatesResponse,
  ConflictError,
  ValidationError,
  NotFoundError,
  Shift,
  Mood,
  Role
} from '../../types';
import {
  getCurrentDateString,
  validateAndParseDate,
  getCurrentMonthRange,
  getMonthRange,
  getCurrentMonthYear,
  formatDateToString,
  isFutureDate
} from '../../shared/utils/dateUtils';
import { CompanySettingsService } from "../settings/companySettings.service";

export class AttendanceService {
  private companySettings: CompanySettingsService;

  constructor() {
    this.companySettings = new CompanySettingsService();
  }
  /**
   * Mark attendance for a user on a specific date (simplified version)
   * Employee details are fetched from the authenticated user's profile
   */
  async markAttendance(
    userId: string,
    data: MarkAttendanceRequest,
  ): Promise<AttendanceResponse> {
    const { date: dateString, mood, notes } = data;

    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        employeeId: true,
        section: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.isActive) {
      throw new ValidationError("User account is inactive");
    }

    // Validate required user fields
    if (!user.employeeId) {
      throw new ValidationError(
        "Employee ID not set in profile. Please contact administrator",
      );
    }

    if (!user.section) {
      throw new ValidationError(
        "Section not set in profile. Please contact administrator",
      );
    }

    // Construct employee name
    const employeeName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown";

    // Determine shift based on current time
    const currentHour = new Date().getHours();
    let shift: Shift;
    if (currentHour >= 6 && currentHour < 14) {
      shift = Shift.MORNING;
    } else if (currentHour >= 14 && currentHour < 18) {
      shift = Shift.AFTERNOON;
    } else if (currentHour >= 18 && currentHour < 22) {
      shift = Shift.EVENING;
    } else {
      shift = Shift.NIGHT;
    }

    // Use current date if no date provided
    const attendanceDate = dateString || getCurrentDateString();

    // Validate the date format
    const dateValidation = validateAndParseDate(attendanceDate);
    if (
      !dateValidation.isValidDate ||
      !dateValidation.parsedDate ||
      !dateValidation.formattedDate
    ) {
      throw new ValidationError(
        "Invalid date format. Please use YYYY-MM-DD format",
      );
    }

    // Prevent future date attendance
    if (isFutureDate(dateValidation.parsedDate)) {
      throw new ValidationError("Cannot mark attendance for future dates");
    }

    // Validate working day (check against company settings)
    await this.validateWorkingDay(attendanceDate);

    // Auto-set check-in time to current time
    const checkInDateTime = new Date();

    try {
      // Create attendance record with unique constraint handling
      const attendance = await prisma.attendance.create({
        data: {
          userId,
          date: dateValidation.parsedDate,
          employeeName,
          employeeId: user.employeeId,
          section: user.section,
          shift,
          mood,
          checkInTime: checkInDateTime,
          notes: notes || null,
        },
        select: {
          id: true,
          date: true,
          employeeName: true,
          employeeId: true,
          section: true,
          shift: true,
          mood: true,
          checkInTime: true,
          checkOutTime: true,
          notes: true,
          createdAt: true,
        },
      });

      return {
        id: attendance.id,
        date: dateValidation.formattedDate,
        employeeName: attendance.employeeName,
        employeeId: attendance.employeeId,
        section: attendance.section,
        shift: attendance.shift,
        mood: attendance.mood,
        checkInTime: attendance.checkInTime || null,
        checkOutTime: attendance.checkOutTime || null,
        notes: attendance.notes || null,
        createdAt: attendance.createdAt,
      };
    } catch (error: any) {
      // Handle unique constraint violation (duplicate attendance)
      if (
        error.code === "P2002" &&
        error.meta?.target?.includes("user_date_unique")
      ) {
        throw new ConflictError(
          `Attendance already marked for ${dateValidation.formattedDate}`,
        );
      }
      throw error;
    }
  }

  /**
   * Update attendance (e.g., add check-out time)
   */
  async updateAttendance(
    userId: string,
    attendanceId: string,
    checkOutTime?: string,
    notes?: string,
  ): Promise<AttendanceResponse> {
    // Find the attendance record
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        userId,
      },
    });

    if (!existingAttendance) {
      throw new NotFoundError("Attendance record not found");
    }

    // Parse check-out time if provided
    let checkOutDateTime: Date | null = null;
    if (checkOutTime) {
      const timeParts = checkOutTime.split(":");
      if (timeParts.length !== 2) {
        throw new ValidationError(
          "Invalid check-out time format. Please use HH:MM format",
        );
      }

      const hours = parseInt(timeParts[0]!, 10);
      const minutes = parseInt(timeParts[1]!, 10);

      if (
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        throw new ValidationError(
          "Invalid check-out time format. Please use HH:MM format",
        );
      }

      checkOutDateTime = new Date(existingAttendance.date);
      checkOutDateTime.setHours(hours, minutes, 0, 0);

      // Validate that check-out time is after check-in time
      if (
        existingAttendance.checkInTime &&
        checkOutDateTime <= existingAttendance.checkInTime
      ) {
        throw new ValidationError("Check-out time must be after check-in time");
      }
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        ...(checkOutDateTime && { checkOutTime: checkOutDateTime }),
        ...(notes && { notes }),
      },
      select: {
        id: true,
        date: true,
        employeeName: true,
        employeeId: true,
        section: true,
        shift: true,
        mood: true,
        checkInTime: true,
        checkOutTime: true,
        notes: true,
        createdAt: true,
      },
    });

    return {
      id: updatedAttendance.id,
      date: formatDateToString(updatedAttendance.date),
      employeeName: updatedAttendance.employeeName,
      employeeId: updatedAttendance.employeeId,
      section: updatedAttendance.section,
      shift: updatedAttendance.shift,
      mood: updatedAttendance.mood,
      checkInTime: updatedAttendance.checkInTime || null,
      checkOutTime: updatedAttendance.checkOutTime || null,
      notes: updatedAttendance.notes || null,
      createdAt: updatedAttendance.createdAt,
    };
  }

  /**
   * Get all attendance records for a user with filtering
   */
  async getUserAttendanceRecords(
    userId: string,
    page: number = 1,
    limit: number = 50,
    filters: {
      startDate?: string;
      endDate?: string;
      section?: string;
      shift?: Shift;
      mood?: Mood;
    } = {},
  ): Promise<AttendanceDatesResponse> {
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = { userId };

    if (filters.startDate) {
      const startValidation = validateAndParseDate(filters.startDate);
      if (startValidation.isValidDate && startValidation.parsedDate) {
        whereClause.date = {
          ...whereClause.date,
          gte: startValidation.parsedDate,
        };
      }
    }

    if (filters.endDate) {
      const endValidation = validateAndParseDate(filters.endDate);
      if (endValidation.isValidDate && endValidation.parsedDate) {
        whereClause.date = {
          ...whereClause.date,
          lte: endValidation.parsedDate,
        };
      }
    }

    if (filters.section) {
      whereClause.section = { contains: filters.section, mode: "insensitive" };
    }

    if (filters.shift) {
      whereClause.shift = filters.shift;
    }

    if (filters.mood) {
      whereClause.mood = filters.mood;
    }

    // Get attendance records with pagination
    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where: whereClause,
        select: {
          id: true,
          date: true,
          employeeName: true,
          employeeId: true,
          section: true,
          shift: true,
          mood: true,
          checkInTime: true,
          checkOutTime: true,
          notes: true,
          createdAt: true,
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.attendance.count({
        where: whereClause,
      }),
    ]);

    const dates: AttendanceResponse[] = attendances.map((attendance) => ({
      id: attendance.id,
      date: formatDateToString(attendance.date),
      employeeName: attendance.employeeName,
      employeeId: attendance.employeeId,
      section: attendance.section,
      shift: attendance.shift,
      mood: attendance.mood,
      checkInTime: attendance.checkInTime || null,
      checkOutTime: attendance.checkOutTime || null,
      notes: attendance.notes || null,
      createdAt: attendance.createdAt,
    }));

    return {
      dates,
      totalCount: total,
    };
  }

  /**
   * Get attendance summary for current month with mood and shift distribution
   */
  async getCurrentMonthSummary(userId: string): Promise<AttendanceSummary> {
    const { month, year, monthString } = getCurrentMonthYear();
    const { start, end, totalDays } = getMonthRange(year, month);

    const [attendedDays, attendances] = await Promise.all([
      prisma.attendance.count({
        where: {
          userId,
          date: {
            gte: start,
            lte: end,
          },
        },
      }),
      prisma.attendance.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lte: end,
          },
        },
        select: {
          mood: true,
          shift: true,
        },
      }),
    ]);

    const attendancePercentage =
      totalDays > 0 ? (attendedDays / totalDays) * 100 : 0;

    // Calculate mood distribution
    const moodDistribution: { [key in Mood]: number } = {
      [Mood.EXCELLENT]: 0,
      [Mood.GOOD]: 0,
      [Mood.AVERAGE]: 0,
      [Mood.POOR]: 0,
      [Mood.TERRIBLE]: 0,
    };

    // Calculate shift distribution
    const shiftDistribution: { [key in Shift]: number } = {
      [Shift.MORNING]: 0,
      [Shift.AFTERNOON]: 0,
      [Shift.EVENING]: 0,
      [Shift.NIGHT]: 0,
    };

    attendances.forEach((attendance) => {
      moodDistribution[attendance.mood]++;
      shiftDistribution[attendance.shift]++;
    });

    return {
      totalDays,
      attendedDays,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      month: monthString,
      year,
      moodDistribution,
      shiftDistribution,
    };
  }

  /**
   * Get attendance summary for a specific month and year
   */
  async getMonthSummary(
    userId: string,
    year: number,
    month: number,
  ): Promise<AttendanceSummary> {
    const { start, end, totalDays } = getMonthRange(year, month);

    const [attendedDays, attendances] = await Promise.all([
      prisma.attendance.count({
        where: {
          userId,
          date: {
            gte: start,
            lte: end,
          },
        },
      }),
      prisma.attendance.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lte: end,
          },
        },
        select: {
          mood: true,
          shift: true,
        },
      }),
    ]);

    const attendancePercentage =
      totalDays > 0 ? (attendedDays / totalDays) * 100 : 0;

    // Calculate mood distribution
    const moodDistribution: { [key in Mood]: number } = {
      [Mood.EXCELLENT]: 0,
      [Mood.GOOD]: 0,
      [Mood.AVERAGE]: 0,
      [Mood.POOR]: 0,
      [Mood.TERRIBLE]: 0,
    };

    // Calculate shift distribution
    const shiftDistribution: { [key in Shift]: number } = {
      [Shift.MORNING]: 0,
      [Shift.AFTERNOON]: 0,
      [Shift.EVENING]: 0,
      [Shift.NIGHT]: 0,
    };

    attendances.forEach((attendance) => {
      moodDistribution[attendance.mood]++;
      shiftDistribution[attendance.shift]++;
    });

    return {
      totalDays,
      attendedDays,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      month: `${year}-${month.toString().padStart(2, "0")}`,
      year,
      moodDistribution,
      shiftDistribution,
    };
  }

  /**
   * Check if attendance is already marked for today
   */
  async isTodayAttendanceMarked(userId: string): Promise<boolean> {
    const todayDate = getCurrentDateString();
    const dateValidation = validateAndParseDate(todayDate);

    if (!dateValidation.isValidDate || !dateValidation.parsedDate) {
      return false;
    }

    const attendance = await prisma.attendance.findUnique({
      where: {
        user_date_unique: {
          userId,
          date: dateValidation.parsedDate,
        },
      },
    });

    return attendance !== null;
  }

  /**
   * Get attendance record for a specific date
   */
  async getDateAttendance(
    userId: string,
    dateString: string,
  ): Promise<AttendanceResponse | null> {
    const dateValidation = validateAndParseDate(dateString);

    if (!dateValidation.isValidDate || !dateValidation.parsedDate) {
      throw new ValidationError(
        "Invalid date format. Please use YYYY-MM-DD format",
      );
    }

    const attendance = await prisma.attendance.findUnique({
      where: {
        user_date_unique: {
          userId,
          date: dateValidation.parsedDate,
        },
      },
      select: {
        id: true,
        date: true,
        employeeName: true,
        employeeId: true,
        section: true,
        shift: true,
        mood: true,
        checkInTime: true,
        checkOutTime: true,
        notes: true,
        createdAt: true,
      },
    });

    if (!attendance) {
      return null;
    }

    return {
      id: attendance.id,
      date: formatDateToString(attendance.date),
      employeeName: attendance.employeeName,
      employeeId: attendance.employeeId,
      section: attendance.section,
      shift: attendance.shift,
      mood: attendance.mood,
      checkInTime: attendance.checkInTime || null,
      checkOutTime: attendance.checkOutTime || null,
      notes: attendance.notes || null,
      createdAt: attendance.createdAt,
    };
  }

  /**
   * Delete attendance for a specific date
   */
  async deleteAttendance(userId: string, dateString: string): Promise<void> {
    const dateValidation = validateAndParseDate(dateString);

    if (!dateValidation.isValidDate || !dateValidation.parsedDate) {
      throw new ValidationError(
        "Invalid date format. Please use YYYY-MM-DD format",
      );
    }

    const attendance = await prisma.attendance.findUnique({
      where: {
        user_date_unique: {
          userId,
          date: dateValidation.parsedDate,
        },
      },
    });

    if (!attendance) {
      throw new NotFoundError(`No attendance record found for ${dateString}`);
    }

    await prisma.attendance.delete({
      where: {
        id: attendance.id,
      },
    });
  }

  /**
   * Get attendance statistics for a user
   */
  async getUserAttendanceStats(userId: string): Promise<{
    totalAttendanceDays: number;
    currentMonthAttendance: AttendanceSummary;
    moodStats: { [key in Mood]: number };
    shiftStats: { [key in Shift]: number };
    averageWorkingHours?: number;
  }> {
    // Get total attendance days
    const totalAttendanceDays = await prisma.attendance.count({
      where: { userId },
    });

    // Get current month summary
    const currentMonthAttendance = await this.getCurrentMonthSummary(userId);

    // Get all-time mood and shift statistics
    const allAttendances = await prisma.attendance.findMany({
      where: { userId },
      select: {
        mood: true,
        shift: true,
        checkInTime: true,
        checkOutTime: true,
      },
    });

    // Calculate mood distribution
    const moodStats: { [key in Mood]: number } = {
      [Mood.EXCELLENT]: 0,
      [Mood.GOOD]: 0,
      [Mood.AVERAGE]: 0,
      [Mood.POOR]: 0,
      [Mood.TERRIBLE]: 0,
    };

    // Calculate shift distribution
    const shiftStats: { [key in Shift]: number } = {
      [Shift.MORNING]: 0,
      [Shift.AFTERNOON]: 0,
      [Shift.EVENING]: 0,
      [Shift.NIGHT]: 0,
    };

    // Calculate average working hours
    let totalWorkingHours = 0;
    let daysWithBothTimes = 0;

    allAttendances.forEach((attendance) => {
      moodStats[attendance.mood]++;
      shiftStats[attendance.shift]++;

      if (attendance.checkInTime && attendance.checkOutTime) {
        const workingHours =
          (attendance.checkOutTime.getTime() -
            attendance.checkInTime.getTime()) /
          (1000 * 60 * 60);
        totalWorkingHours += workingHours;
        daysWithBothTimes++;
      }
    });

    const averageWorkingHours =
      daysWithBothTimes > 0
        ? Math.round((totalWorkingHours / daysWithBothTimes) * 100) / 100
        : undefined;

    const result = {
      totalAttendanceDays,
      currentMonthAttendance,
      moodStats,
      shiftStats,
      ...(averageWorkingHours !== undefined && { averageWorkingHours }),
    };

    return result;
  }

  /**
   * Validate if the given date is a working day according to company settings
   */
  private async validateWorkingDay(dateString: string): Promise<void> {
    try {
      const isWorkingDay = await this.companySettings.isWorkingDay(dateString);

      if (!isWorkingDay) {
        const isHoliday = await this.companySettings.isHoliday(dateString);
        const dayName = new Date(dateString).toLocaleDateString("en-US", {
          weekday: "long",
        });

        if (isHoliday) {
          throw new ValidationError(
            `Cannot mark attendance on holiday (${dateString})`,
          );
        } else {
          throw new ValidationError(
            `Cannot mark attendance on non-working day: ${dayName} (${dateString})`,
          );
        }
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      // If company settings are not configured, allow attendance
      console.warn(
        "Company settings not configured, allowing attendance for any day:",
        error,
      );
    }
  }

  /**
   * Get company working hours for validation
   */
  async getWorkingHours() {
    try {
      return await this.companySettings.getWorkingHours();
    } catch (error) {
      console.warn(
        "Could not fetch working hours from settings, using defaults:",
        error,
      );
      return {
        startTime: "09:00",
        endTime: "18:00",
        breakDuration: 60,
        gracePeriod: 15,
      };
    }
  }

  /**
   * Check if current time is within working hours (with grace period)
   */
  async isWithinWorkingHours(): Promise<{
    isWithin: boolean;
    message?: string;
  }> {
    try {
      const workingHours = await this.getWorkingHours();
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      // Convert times to minutes for comparison
      const [startHour, startMin] = workingHours.startTime
        .split(":")
        .map(Number);
      const [endHour, endMin] = workingHours.endTime.split(":").map(Number);
      const [currentHour, currentMin] = currentTime.split(":").map(Number);

      const startMinutes = startHour * 60 + startMin - workingHours.gracePeriod; // Include grace period
      const endMinutes = endHour * 60 + endMin;
      const currentMinutes = currentHour * 60 + currentMin;

      const isWithin =
        currentMinutes >= startMinutes && currentMinutes <= endMinutes;

      if (!isWithin) {
        if (currentMinutes < startMinutes) {
          return {
            isWithin: false,
            message: `Too early. Working hours start at ${workingHours.startTime} (with ${workingHours.gracePeriod} min grace period)`,
          };
        } else {
          return {
            isWithin: false,
            message: `Too late. Working hours end at ${workingHours.endTime}`,
          };
        }
      }

      return { isWithin: true };
    } catch (error) {
      console.warn(
        "Could not validate working hours, allowing attendance:",
        error,
      );
      return { isWithin: true };
    }
  }

  /**
   * Record an absence with a required reason. Uses notes to store the reason
   * and keeps check-in/out times empty to distinguish from present attendance.
   */
  async markAbsence(
    userId: string,
    data: MarkAbsenceRequest,
  ): Promise<AttendanceResponse> {
    const { date: dateString, reason } = data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        employeeId: true,
        section: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.isActive) {
      throw new ValidationError("User account is inactive");
    }

    if (!user.employeeId) {
      throw new ValidationError(
        "Employee ID not set in profile. Please contact administrator",
      );
    }

    if (!user.section) {
      throw new ValidationError(
        "Section not set in profile. Please contact administrator",
      );
    }

    const employeeName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown";

    const currentHour = new Date().getHours();
    let shift: Shift;
    if (currentHour >= 6 && currentHour < 14) {
      shift = Shift.MORNING;
    } else if (currentHour >= 14 && currentHour < 18) {
      shift = Shift.AFTERNOON;
    } else if (currentHour >= 18 && currentHour < 22) {
      shift = Shift.EVENING;
    } else {
      shift = Shift.NIGHT;
    }

    const absenceDate = dateString || getCurrentDateString();
    const dateValidation = validateAndParseDate(absenceDate);
    if (
      !dateValidation.isValidDate ||
      !dateValidation.parsedDate ||
      !dateValidation.formattedDate
    ) {
      throw new ValidationError(
        "Invalid date format. Please use YYYY-MM-DD format",
      );
    }

    if (isFutureDate(dateValidation.parsedDate)) {
      throw new ValidationError("Cannot mark absence for future dates");
    }

    await this.validateWorkingDay(absenceDate);

    const existing = await prisma.attendance.findUnique({
      where: {
        user_date_unique: {
          userId,
          date: dateValidation.parsedDate,
        },
      },
    });

    if (existing) {
      throw new ConflictError(
        `Attendance already marked for ${dateValidation.formattedDate}`,
      );
    }

    const absenceNotes = reason.trim();
    if (!absenceNotes) {
      throw new ValidationError("Reason for absence cannot be empty");
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: dateValidation.parsedDate,
        employeeName,
        employeeId: user.employeeId,
        section: user.section,
        shift,
        // Mood is required by schema; use POOR to denote absence explicitly
        mood: Mood.POOR,
        notes: absenceNotes,
        checkInTime: null,
        checkOutTime: null,
      },
      select: {
        id: true,
        date: true,
        employeeName: true,
        employeeId: true,
        section: true,
        shift: true,
        mood: true,
        checkInTime: true,
        checkOutTime: true,
        notes: true,
        createdAt: true,
      },
    });

    return {
      id: attendance.id,
      date: dateValidation.formattedDate,
      employeeName: attendance.employeeName,
      employeeId: attendance.employeeId,
      section: attendance.section,
      shift: attendance.shift,
      mood: attendance.mood,
      checkInTime: attendance.checkInTime || null,
      checkOutTime: attendance.checkOutTime || null,
      notes: attendance.notes || null,
      createdAt: attendance.createdAt,
    };
  }

  /**
   * Get attendance chart data for visualization
   * Returns daily aggregated attendance data for the specified number of days
   */
  async getChartData(days: number = 90): Promise<Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
    total: number;
  }>> {
    // Calculate start date
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get total active employees
    const totalEmployees = await prisma.user.count({
      where: {
        role: Role.EMPLOYEE,
        isActive: true,
      },
    });

    // Get working hours to determine late arrivals
    const workingHours = await this.companySettings.getWorkingHours();
    
    // Parse the start time to get hours and minutes
    const [startHour, startMinute] = workingHours.startTime.split(':').map(Number);
    const gracePeriodMinutes = workingHours.gracePeriod || 15;

    // Get all attendance records in the date range
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        user: {
          role: Role.EMPLOYEE,
          isActive: true,
        },
      },
      select: {
        date: true,
        checkInTime: true,
        notes: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group records by date
    const recordsByDate = new Map<string, Array<{
      checkInTime: Date | null;
      notes: string | null;
    }>>();

    attendanceRecords.forEach(record => {
      const dateStr = record.date.toISOString().split('T')[0];
      if (!recordsByDate.has(dateStr)) {
        recordsByDate.set(dateStr, []);
      }
      recordsByDate.get(dateStr)!.push({
        checkInTime: record.checkInTime,
        notes: record.notes,
      });
    });

    // Generate data for each day in the range
    const chartData: Array<{
      date: string;
      present: number;
      absent: number;
      late: number;
      total: number;
    }> = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      // You may want to make this configurable based on company working days
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const records = recordsByDate.get(dateStr) || [];
        
        let present = 0;
        let late = 0;
        let absent = 0;

        records.forEach(record => {
          // If there's a checkInTime, the employee was present
          if (record.checkInTime) {
            present++;
            
            // Check if they were late
            const checkInDate = new Date(record.checkInTime);
            const checkInHour = checkInDate.getHours();
            const checkInMinute = checkInDate.getMinutes();
            
            // Calculate minutes from start of day
            const checkInTotalMinutes = checkInHour * 60 + checkInMinute;
            const startTotalMinutes = startHour * 60 + startMinute;
            const lateThreshold = startTotalMinutes + gracePeriodMinutes;
            
            if (checkInTotalMinutes > lateThreshold) {
              late++;
            }
          } else {
            // No check-in time means absence (marked via markAbsence)
            absent++;
          }
        });

        // Calculate remaining absences (employees who didn't mark attendance at all)
        const totalMarked = records.length;
        const notMarked = totalEmployees - totalMarked;
        absent += notMarked;

        chartData.push({
          date: dateStr,
          present,
          absent,
          late,
          total: totalEmployees,
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return chartData;
  }
}