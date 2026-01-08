import { prisma } from '../config/database';
import { Role, SafeUser } from '../../types';
import { emailService } from './emailService';

export class AttendanceSchedulerService {
  /**
   * Check for employees who haven't marked attendance by 1 PM and send reminder emails
   */
  async sendDailyAttendanceReminders(): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      console.log('Checking for employees who haven\'t marked attendance by 1 PM...');

      // Get all active employees
      const activeEmployees = await prisma.user.findMany({
        where: {
          role: Role.EMPLOYEE,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          section: true,
          department: true
        }
      });

      // Get today's attendances
      const todayAttendances = await prisma.attendance.findMany({
        where: {
          date: today
        },
        select: {
          userId: true
        }
      });

      // Get IDs of employees who have already marked attendance
      const attendedUserIds = todayAttendances.map(att => att.userId);

      // Filter employees who haven't marked attendance
      const absentEmployees = activeEmployees.filter(emp => !attendedUserIds.includes(emp.id));

      console.log(`Found ${absentEmployees.length} employees who haven't marked attendance`);

      // Send reminder emails to absent employees
      const emailPromises = absentEmployees.map(async (employee) => {
        try {
          const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Employee';
          await emailService.sendAttendanceReminder(
            employee.email,
            employeeName,
            employee.employeeId || 'N/A'
          );
          console.log(`Reminder sent to ${employee.email}`);
        } catch (error) {
          console.error(`Failed to send reminder to ${employee.email}:`, error);
        }
      });

      await Promise.allSettled(emailPromises);

      // Send summary to admin if there are absent employees
      if (absentEmployees.length > 0) {
        await this.sendAdminAbsenteeReport(absentEmployees, today.toISOString().split('T')[0]);
      }

    } catch (error) {
      console.error('Error in sendDailyAttendanceReminders:', error);
    }
  }

  /**
   * Send daily absentee report to admin
   */
  private async sendAdminAbsenteeReport(absentEmployees: any[], date: string): Promise<void> {
    try {
      // Get admin email (assuming first admin user)
      const admin = await prisma.user.findFirst({
        where: {
          role: Role.ADMIN,
          isActive: true
        },
        select: {
          email: true
        }
      });

      if (admin && admin.email) {
        // Format absentee list for email
        const absenteeListHtml = absentEmployees.length > 0 
          ? `<ul>${absentEmployees.map(emp => 
              `<li>${emp.firstName} ${emp.lastName} (${emp.employeeId}) - ${emp.department || 'N/A'}</li>`
            ).join('')}</ul>`
          : '<p>No absences recorded.</p>';
        
        await emailService.sendDailyAbsenteeReport(
          admin.email, 
          date, 
          absentEmployees.length, 
          absenteeListHtml
        );
        console.log(`Absentee report sent to admin: ${admin.email}`);
      }
    } catch (error) {
      console.error('Failed to send admin absentee report:', error);
    }
  }

  /**
   * Send weekly attendance summary
   */
  async sendWeeklyAttendanceSummary(): Promise<void> {
    try {
      console.log('Generating weekly attendance summary...');

      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(today);
      weekEnd.setHours(23, 59, 59, 999);

      // Get total active employees
      const totalEmployees = await prisma.user.count({
        where: {
          role: Role.EMPLOYEE,
          isActive: true
        }
      });

      // Get week's attendances
      const weekAttendances = await prisma.attendance.findMany({
        where: {
          date: {
            gte: weekStart,
            lte: weekEnd
          }
        }
      });

      // Calculate statistics
      const totalPossibleAttendances = totalEmployees * 7; // 7 days
      const actualAttendances = weekAttendances.length;
      const averageAttendance = totalPossibleAttendances > 0 
        ? Math.round((actualAttendances / totalPossibleAttendances) * 100) 
        : 0;

      // Count perfect attendance (employees who attended all 7 days)
      const attendanceByUser = weekAttendances.reduce((acc, att) => {
        acc[att.userId] = (acc[att.userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const perfectAttendance = Object.values(attendanceByUser).filter(count => count === 7).length;

      const reportData = {
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        totalEmployees,
        averageAttendance,
        perfectAttendance,
        totalAttendances: actualAttendances
      };

      // Send to admin
      const admin = await prisma.user.findFirst({
        where: {
          role: Role.ADMIN,
          isActive: true
        },
        select: {
          email: true
        }
      });

      if (admin && admin.email) {
        await emailService.sendWeeklyReport(
          admin.email,
          reportData.weekStart,
          reportData.weekEnd,
          {
            totalPresent: reportData.totalAttendances,
            totalAbsent: (reportData.totalEmployees * 7) - reportData.totalAttendances,
            totalLate: 0, // Can be calculated if needed
            attendanceRate: reportData.averageAttendance
          },
          `<p>Perfect attendance: ${reportData.perfectAttendance} employees</p>`
        );
        console.log(`Weekly report sent to admin: ${admin.email}`);
      }

    } catch (error) {
      console.error('Error in sendWeeklyAttendanceSummary:', error);
    }
  }

  /**
   * Send end of day attendance report
   */
  async sendEndOfDayReport(): Promise<void> {
    try {
      console.log('Generating end-of-day attendance report...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateString = today.toISOString().split('T')[0];

      // Get all active employees
      const totalEmployees = await prisma.user.count({
        where: {
          role: Role.EMPLOYEE,
          isActive: true
        }
      });

      // Get today's attendances
      const todayAttendances = await prisma.attendance.findMany({
        where: {
          date: today
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              employeeId: true,
              department: true,
              section: true
            }
          }
        }
      });

      // Get employees who haven't checked out yet
      const notCheckedOut = todayAttendances.filter(att => !att.checkOutTime);

      // Calculate mood distribution
      const moodDistribution = todayAttendances.reduce((acc, att) => {
        acc[att.mood] = (acc[att.mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate shift distribution
      const shiftDistribution = todayAttendances.reduce((acc, att) => {
        acc[att.shift] = (acc[att.shift] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const reportData = {
        date: dateString,
        totalEmployees,
        presentCount: todayAttendances.length,
        absentCount: totalEmployees - todayAttendances.length,
        attendanceRate: totalEmployees > 0 
          ? Math.round((todayAttendances.length / totalEmployees) * 100) 
          : 0,
        notCheckedOutCount: notCheckedOut.length,
        moodDistribution,
        shiftDistribution,
        notCheckedOut: notCheckedOut.map(att => ({
          name: `${att.user.firstName || ''} ${att.user.lastName || ''}`.trim(),
          employeeId: att.employeeId,
          department: att.user.department,
          checkInTime: att.checkInTime?.toISOString()
        }))
      };

      // Send to admin
      const admin = await prisma.user.findFirst({
        where: {
          role: Role.ADMIN,
          isActive: true
        },
        select: {
          email: true
        }
      });

      if (admin && admin.email) {
        // Build department breakdown HTML
        const departmentBreakdownHtml = Object.entries(shiftDistribution)
          .map(([shift, count]) => `<p><strong>${shift}:</strong> ${count} employees</p>`)
          .join('');
        
        await emailService.sendEndOfDayReport(
          admin.email,
          reportData.date,
          {
            totalPresent: reportData.presentCount,
            totalAbsent: reportData.absentCount,
            totalLate: 0, // Can be calculated if needed
            totalEarlyLeave: 0 // Can be calculated if needed
          },
          departmentBreakdownHtml + 
            `<p><strong>Not checked out:</strong> ${reportData.notCheckedOutCount}</p>`
        );
        console.log(`End-of-day report sent to admin: ${admin.email}`);
      }

    } catch (error) {
      console.error('Error in sendEndOfDayReport:', error);
    }
  }
}

export const attendanceScheduler = new AttendanceSchedulerService();