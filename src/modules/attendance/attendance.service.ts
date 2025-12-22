import { prisma } from '../../shared/config/database';
import {
  MarkAttendanceRequest,
  AttendanceResponse,
  AttendanceSummary,
  AttendanceDatesResponse,
  ConflictError,
  ValidationError,
  NotFoundError,
  Shift,
  Mood
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

export class AttendanceService {
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
}