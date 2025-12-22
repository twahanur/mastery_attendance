import { prisma } from '../../shared/config/database';
import { Role, Shift, Mood } from '../../types';
import puppeteer from 'puppeteer';

export interface DailyReportData {
  date: string;
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
  presentEmployees: any[];
  absentEmployees: any[];
  shiftDistribution: Record<Shift, number>;
  moodDistribution: Record<Mood, number>;
  lateArrivals: any[];
  earlyDepartures: any[];
}

export interface WeeklyReportData {
  weekStart: string;
  weekEnd: string;
  totalEmployees: number;
  dailyStats: any[];
  averageAttendance: number;
  perfectAttendees: any[];
  frequentAbsentees: any[];
  departmentStats: any[];
}

export interface MonthlyReportData {
  year: number;
  month: number;
  monthName: string;
  totalEmployees: number;
  totalWorkingDays: number;
  averageAttendance: number;
  employeeStats: any[];
  departmentStats: any[];
  trends: any[];
}

export class ReportService {
  /**
   * Generate daily attendance report
   */
  async generateDailyReport(date: string): Promise<DailyReportData> {
    const reportDate = new Date(date);
    reportDate.setHours(0, 0, 0, 0);

    // Get total active employees
    const totalEmployees = await prisma.user.count({
      where: {
        role: Role.EMPLOYEE,
        isActive: true
      }
    });

    // Get today's attendances with user details
    const attendances = await prisma.attendance.findMany({
      where: {
        date: reportDate
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            section: true,
            department: true,
            isActive: true
          }
        }
      },
      orderBy: {
        checkInTime: 'asc'
      }
    });

    // Filter for active employees
    const activeAttendances = attendances.filter(att => att.user.isActive);
    const presentCount = activeAttendances.length;
    const absentCount = totalEmployees - presentCount;
    const attendancePercentage = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

    // Get absent employees
    const presentUserIds = activeAttendances.map(att => att.userId);
    const absentEmployees = await prisma.user.findMany({
      where: {
        role: Role.EMPLOYEE,
        isActive: true,
        id: {
          notIn: presentUserIds
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        section: true,
        department: true
      },
      orderBy: [
        { section: 'asc' },
        { firstName: 'asc' }
      ]
    });

    // Calculate distributions
    const shiftDistribution = activeAttendances.reduce((acc, att) => {
      acc[att.shift] = (acc[att.shift] || 0) + 1;
      return acc;
    }, {} as Record<Shift, number>);

    const moodDistribution = activeAttendances.reduce((acc, att) => {
      acc[att.mood] = (acc[att.mood] || 0) + 1;
      return acc;
    }, {} as Record<Mood, number>);

    // Find late arrivals (after 9:00 AM)
    const lateArrivals = activeAttendances.filter(att => {
      if (!att.checkInTime) return false;
      const checkInHour = att.checkInTime.getHours();
      const checkInMinute = att.checkInTime.getMinutes();
      return checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0);
    }).map(att => ({
      ...att,
      user: att.user,
      lateBy: this.calculateLateDuration(att.checkInTime!)
    }));

    // Find early departures (before 5:00 PM if check-out exists)
    const earlyDepartures = activeAttendances.filter(att => {
      if (!att.checkOutTime) return false;
      const checkOutHour = att.checkOutTime.getHours();
      return checkOutHour < 17;
    }).map(att => ({
      ...att,
      user: att.user,
      earlyBy: this.calculateEarlyDuration(att.checkOutTime!)
    }));

    return {
      date,
      totalEmployees,
      presentCount,
      absentCount,
      attendancePercentage,
      presentEmployees: activeAttendances.map(att => ({
        ...att.user,
        checkInTime: att.checkInTime,
        checkOutTime: att.checkOutTime,
        shift: att.shift,
        mood: att.mood
      })),
      absentEmployees,
      shiftDistribution,
      moodDistribution,
      lateArrivals,
      earlyDepartures
    };
  }

  /**
   * Generate weekly attendance report
   */
  async generateWeeklyReport(startDate: string): Promise<WeeklyReportData> {
    const weekStart = new Date(startDate);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const totalEmployees = await prisma.user.count({
      where: {
        role: Role.EMPLOYEE,
        isActive: true
      }
    });

    // Get daily stats for the week
    const dailyStats = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + i);
      
      const dayAttendances = await prisma.attendance.count({
        where: {
          date: currentDate,
          user: { isActive: true }
        }
      });

      dailyStats.push({
        date: currentDate.toISOString().split('T')[0],
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        presentCount: dayAttendances,
        absentCount: totalEmployees - dayAttendances,
        attendancePercentage: totalEmployees > 0 ? Math.round((dayAttendances / totalEmployees) * 100) : 0
      });
    }

    const averageAttendance = Math.round(
      dailyStats.reduce((sum, day) => sum + day.attendancePercentage, 0) / 7
    );

    // Find perfect attendees (attended all 7 days)
    const weekAttendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd
        },
        user: { isActive: true }
      }
    });

    const attendanceByUser = weekAttendances.reduce((acc, att) => {
      acc[att.userId] = (acc[att.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const perfectAttendeeIds = Object.entries(attendanceByUser)
      .filter(([_, count]) => count === 7)
      .map(([userId, _]) => userId);

    const perfectAttendees = await prisma.user.findMany({
      where: {
        id: { in: perfectAttendeeIds }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        section: true,
        department: true
      }
    });

    // Find frequent absentees (missed 3+ days)
    const frequentAbsenteeIds = Object.entries(attendanceByUser)
      .filter(([_, count]) => count <= 4)
      .map(([userId, _]) => userId);

    const frequentAbsentees = await prisma.user.findMany({
      where: {
        id: { in: frequentAbsenteeIds },
        role: Role.EMPLOYEE,
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        section: true,
        department: true
      }
    });

    // Department stats
    const departmentStats = await this.getDepartmentAttendanceStats(weekStart, weekEnd);

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalEmployees,
      dailyStats,
      averageAttendance,
      perfectAttendees,
      frequentAbsentees,
      departmentStats
    };
  }

  /**
   * Generate monthly attendance report
   */
  async generateMonthlyReport(year: number, month: number): Promise<MonthlyReportData> {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    const monthName = monthStart.toLocaleDateString('en-US', { month: 'long' });

    const totalEmployees = await prisma.user.count({
      where: {
        role: Role.EMPLOYEE,
        isActive: true
      }
    });

    const totalWorkingDays = this.calculateWorkingDays(monthStart, monthEnd);

    // Get all employees with their monthly stats
    const employees = await prisma.user.findMany({
      where: {
        role: Role.EMPLOYEE,
        isActive: true
      },
      include: {
        attendances: {
          where: {
            date: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }
      }
    });

    const employeeStats = employees.map(emp => {
      const attendanceDays = emp.attendances.length;
      const attendancePercentage = totalWorkingDays > 0 ? Math.round((attendanceDays / totalWorkingDays) * 100) : 0;
      
      return {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        employeeId: emp.employeeId,
        section: emp.section,
        department: emp.department,
        attendanceDays,
        absentDays: totalWorkingDays - attendanceDays,
        attendancePercentage
      };
    });

    const averageAttendance = Math.round(
      employeeStats.reduce((sum, emp) => sum + emp.attendancePercentage, 0) / employeeStats.length || 0
    );

    const departmentStats = await this.getDepartmentAttendanceStats(monthStart, monthEnd);

    return {
      year,
      month,
      monthName,
      totalEmployees,
      totalWorkingDays,
      averageAttendance,
      employeeStats: employeeStats.sort((a, b) => b.attendancePercentage - a.attendancePercentage),
      departmentStats,
      trends: [] // Can be implemented later with historical data
    };
  }

  /**
   * Generate employee-specific report
   */
  async generateEmployeeReport(employeeId: string, startDate: string, endDate: string): Promise<any> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const employee = await prisma.user.findUnique({
      where: { employeeId },
      include: {
        attendances: {
          where: {
            date: {
              gte: start,
              lte: end
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const workingDays = this.calculateWorkingDays(start, end);
    const presentDays = employee.attendances.length;
    const absentDays = workingDays - presentDays;
    const attendancePercentage = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;

    return {
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeId: employee.employeeId,
        section: employee.section,
        department: employee.department
      },
      period: { startDate, endDate },
      statistics: {
        totalDays,
        workingDays,
        presentDays,
        absentDays,
        attendancePercentage
      },
      attendances: employee.attendances,
      moodAnalysis: this.analyzeMoodTrends(employee.attendances),
      punctualityAnalysis: this.analyzePunctuality(employee.attendances)
    };
  }

  /**
   * Generate department comparison report
   */
  async generateDepartmentReport(startDate: string, endDate: string): Promise<any> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return await this.getDepartmentAttendanceStats(start, end);
  }

  // Helper methods for PDF generation
  async generateDailyReportPDF(reportData: DailyReportData, date: string): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const html = this.generateDailyReportHTML(reportData, date);
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    await browser.close();
    return Buffer.from(pdfBuffer);
  }

  async generateWeeklyReportPDF(reportData: WeeklyReportData, startDate: string): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const html = this.generateWeeklyReportHTML(reportData);
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    await browser.close();
    return Buffer.from(pdfBuffer);
  }

  async generateMonthlyReportPDF(reportData: MonthlyReportData, year: string, month: string): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const html = this.generateMonthlyReportHTML(reportData);
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    await browser.close();
    return Buffer.from(pdfBuffer);
  }

  async generateEmployeeReportPDF(reportData: any, employeeId: string, startDate: string, endDate: string): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const html = this.generateEmployeeReportHTML(reportData);
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    await browser.close();
    return Buffer.from(pdfBuffer);
  }

  async generateDepartmentReportPDF(reportData: any, startDate: string, endDate: string): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const html = this.generateDepartmentReportHTML(reportData, startDate, endDate);
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    await browser.close();
    return Buffer.from(pdfBuffer);
  }

  // Helper methods
  private calculateLateDuration(checkInTime: Date): string {
    const standardTime = new Date(checkInTime);
    standardTime.setHours(9, 0, 0, 0);
    
    if (checkInTime <= standardTime) return '0 minutes';
    
    const diffMs = checkInTime.getTime() - standardTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  }

  private calculateEarlyDuration(checkOutTime: Date): string {
    const standardTime = new Date(checkOutTime);
    standardTime.setHours(17, 0, 0, 0);
    
    if (checkOutTime >= standardTime) return '0 minutes';
    
    const diffMs = standardTime.getTime() - checkOutTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  }

  private calculateWorkingDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  private async getDepartmentAttendanceStats(start: Date, end: Date): Promise<any[]> {
    const departments = await prisma.user.groupBy({
      by: ['department'],
      where: {
        role: Role.EMPLOYEE,
        isActive: true,
        department: { not: null }
      },
      _count: { id: true }
    });

    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        if (!dept.department) return null;

        const attendances = await prisma.attendance.count({
          where: {
            date: {
              gte: start,
              lte: end
            },
            user: {
              department: dept.department,
              isActive: true
            }
          }
        });

        const workingDays = this.calculateWorkingDays(start, end);
        const possibleAttendances = dept._count.id * workingDays;
        const attendancePercentage = possibleAttendances > 0 ? 
          Math.round((attendances / possibleAttendances) * 100) : 0;

        return {
          department: dept.department,
          totalEmployees: dept._count.id,
          totalAttendances: attendances,
          attendancePercentage
        };
      })
    );

    return departmentStats.filter(Boolean);
  }

  private analyzeMoodTrends(attendances: any[]): any {
    const moodCounts = attendances.reduce((acc, att) => {
      acc[att.mood] = (acc[att.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalDays = attendances.length;
    const moodPercentages = Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count: count as number,
      percentage: totalDays > 0 ? Math.round((count as number / totalDays) * 100) : 0
    }));

    return {
      distribution: moodPercentages,
      dominantMood: moodPercentages.sort((a, b) => b.count - a.count)[0]?.mood || 'N/A'
    };
  }

  private analyzePunctuality(attendances: any[]): any {
    const lateArrivals = attendances.filter(att => {
      if (!att.checkInTime) return false;
      const checkInHour = att.checkInTime.getHours();
      const checkInMinute = att.checkInTime.getMinutes();
      return checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0);
    });

    const onTimeArrivals = attendances.length - lateArrivals.length;
    const punctualityPercentage = attendances.length > 0 ? 
      Math.round((onTimeArrivals / attendances.length) * 100) : 0;

    return {
      totalDays: attendances.length,
      onTime: onTimeArrivals,
      late: lateArrivals.length,
      punctualityPercentage,
      averageLateBy: this.calculateAverageLateTime(lateArrivals)
    };
  }

  private calculateAverageLateTime(lateArrivals: any[]): string {
    if (lateArrivals.length === 0) return '0 minutes';

    const totalLateMinutes = lateArrivals.reduce((sum, att) => {
      const standardTime = new Date(att.checkInTime);
      standardTime.setHours(9, 0, 0, 0);
      const diffMs = att.checkInTime.getTime() - standardTime.getTime();
      return sum + Math.floor(diffMs / (1000 * 60));
    }, 0);

    const avgMinutes = Math.floor(totalLateMinutes / lateArrivals.length);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  }

  // HTML template generators (simplified versions)
  private generateDailyReportHTML(reportData: DailyReportData, date: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Attendance Report - ${date}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-box { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Daily Attendance Report</h1>
            <h2>${date}</h2>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <h3>${reportData.totalEmployees}</h3>
              <p>Total Employees</p>
            </div>
            <div class="stat-box">
              <h3>${reportData.presentCount}</h3>
              <p>Present</p>
            </div>
            <div class="stat-box">
              <h3>${reportData.absentCount}</h3>
              <p>Absent</p>
            </div>
            <div class="stat-box">
              <h3>${reportData.attendancePercentage}%</h3>
              <p>Attendance Rate</p>
            </div>
          </div>

          <h3>Absent Employees (${reportData.absentEmployees.length})</h3>
          <table>
            <thead>
              <tr><th>Employee ID</th><th>Name</th><th>Section</th><th>Department</th></tr>
            </thead>
            <tbody>
              ${reportData.absentEmployees.map(emp => `
                <tr>
                  <td>${emp.employeeId}</td>
                  <td>${emp.firstName} ${emp.lastName}</td>
                  <td>${emp.section}</td>
                  <td>${emp.department || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${reportData.lateArrivals.length > 0 ? `
            <h3>Late Arrivals (${reportData.lateArrivals.length})</h3>
            <table>
              <thead>
                <tr><th>Employee ID</th><th>Name</th><th>Check-in Time</th><th>Late By</th></tr>
              </thead>
              <tbody>
                ${reportData.lateArrivals.map(att => `
                  <tr>
                    <td>${att.user.employeeId}</td>
                    <td>${att.user.firstName} ${att.user.lastName}</td>
                    <td>${att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString() : 'N/A'}</td>
                    <td>${att.lateBy}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          <p><em>Generated on: ${new Date().toLocaleString()}</em></p>
        </body>
      </html>
    `;
  }

  private generateWeeklyReportHTML(reportData: WeeklyReportData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Weekly Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-box { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Weekly Attendance Report</h1>
            <h2>${reportData.weekStart} to ${reportData.weekEnd}</h2>
          </div>

          <div class="stats">
            <div class="stat-box">
              <h3>${reportData.totalEmployees}</h3>
              <p>Total Employees</p>
            </div>
            <div class="stat-box">
              <h3>${reportData.averageAttendance}%</h3>
              <p>Average Attendance</p>
            </div>
            <div class="stat-box">
              <h3>${reportData.perfectAttendees.length}</h3>
              <p>Perfect Attendance</p>
            </div>
          </div>

          <h3>Daily Statistics</h3>
          <table>
            <thead>
              <tr><th>Date</th><th>Day</th><th>Present</th><th>Absent</th><th>Attendance %</th></tr>
            </thead>
            <tbody>
              ${reportData.dailyStats.map(day => `
                <tr>
                  <td>${day.date}</td>
                  <td>${day.dayName}</td>
                  <td>${day.presentCount}</td>
                  <td>${day.absentCount}</td>
                  <td>${day.attendancePercentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <p><em>Generated on: ${new Date().toLocaleString()}</em></p>
        </body>
      </html>
    `;
  }

  private generateMonthlyReportHTML(reportData: MonthlyReportData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Monthly Attendance Report - ${reportData.monthName} ${reportData.year}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-box { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Monthly Attendance Report</h1>
            <h2>${reportData.monthName} ${reportData.year}</h2>
          </div>

          <div class="stats">
            <div class="stat-box">
              <h3>${reportData.totalEmployees}</h3>
              <p>Total Employees</p>
            </div>
            <div class="stat-box">
              <h3>${reportData.totalWorkingDays}</h3>
              <p>Working Days</p>
            </div>
            <div class="stat-box">
              <h3>${reportData.averageAttendance}%</h3>
              <p>Average Attendance</p>
            </div>
          </div>

          <h3>Employee Attendance Summary</h3>
          <table>
            <thead>
              <tr><th>Employee ID</th><th>Name</th><th>Section</th><th>Days Present</th><th>Attendance %</th></tr>
            </thead>
            <tbody>
              ${reportData.employeeStats.slice(0, 20).map(emp => `
                <tr>
                  <td>${emp.employeeId}</td>
                  <td>${emp.firstName} ${emp.lastName}</td>
                  <td>${emp.section}</td>
                  <td>${emp.attendanceDays}/${reportData.totalWorkingDays}</td>
                  <td>${emp.attendancePercentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <p><em>Generated on: ${new Date().toLocaleString()}</em></p>
        </body>
      </html>
    `;
  }

  private generateEmployeeReportHTML(reportData: any): string {
    const emp = reportData.employee;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Employee Report - ${emp.firstName} ${emp.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .employee-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-box { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Employee Attendance Report</h1>
          </div>

          <div class="employee-info">
            <h2>${emp.firstName} ${emp.lastName}</h2>
            <p><strong>Employee ID:</strong> ${emp.employeeId}</p>
            <p><strong>Section:</strong> ${emp.section}</p>
            <p><strong>Department:</strong> ${emp.department || 'N/A'}</p>
            <p><strong>Period:</strong> ${reportData.period.startDate} to ${reportData.period.endDate}</p>
          </div>

          <div class="stats">
            <div class="stat-box">
              <h3>${reportData.statistics.workingDays}</h3>
              <p>Working Days</p>
            </div>
            <div class="stat-box">
              <h3>${reportData.statistics.presentDays}</h3>
              <p>Days Present</p>
            </div>
            <div class="stat-box">
              <h3>${reportData.statistics.absentDays}</h3>
              <p>Days Absent</p>
            </div>
            <div class="stat-box">
              <h3>${reportData.statistics.attendancePercentage}%</h3>
              <p>Attendance Rate</p>
            </div>
          </div>

          <h3>Mood Analysis</h3>
          <p><strong>Dominant Mood:</strong> ${reportData.moodAnalysis.dominantMood}</p>

          <h3>Punctuality Analysis</h3>
          <p><strong>Punctuality Rate:</strong> ${reportData.punctualityAnalysis.punctualityPercentage}%</p>
          <p><strong>On Time:</strong> ${reportData.punctualityAnalysis.onTime} days</p>
          <p><strong>Late:</strong> ${reportData.punctualityAnalysis.late} days</p>

          <p><em>Generated on: ${new Date().toLocaleString()}</em></p>
        </body>
      </html>
    `;
  }

  private generateDepartmentReportHTML(reportData: any[], startDate: string, endDate: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Department Comparison Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Department Comparison Report</h1>
            <h2>${startDate} to ${endDate}</h2>
          </div>

          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Total Employees</th>
                <th>Total Attendances</th>
                <th>Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.map(dept => `
                <tr>
                  <td>${dept.department}</td>
                  <td>${dept.totalEmployees}</td>
                  <td>${dept.totalAttendances}</td>
                  <td>${dept.attendancePercentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <p><em>Generated on: ${new Date().toLocaleString()}</em></p>
        </body>
      </html>
    `;
  }
}