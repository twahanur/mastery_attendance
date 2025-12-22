import { prisma } from '../../shared/config/database';
import {
  SafeUser,
  EmployeeListResponse,
  UpdateEmployeeRequest,
  PaginationParams,
  Role,
  NotFoundError,
  DepartmentWithEmployees,
  SectionWithEmployees,
  DashboardStats,
  AttendanceResponse,
} from "../../types";

export class UserService {
  /**
   * Get all employees with filtering and pagination (Admin only)
   */
  async getEmployees(params: PaginationParams): Promise<EmployeeListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      section,
      isActive,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      role: Role.EMPLOYEE,
    };

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
      ];
    }

    if (department) {
      whereClause.department = { contains: department, mode: "insensitive" };
    }

    if (section) {
      whereClause.section = { contains: section, mode: "insensitive" };
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    // Get employees with pagination
    const [employees, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          section: true,
          department: true,
          designation: true,
          phoneNumber: true,
          address: true,
          dateOfJoining: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
        },
        orderBy: [
          { isActive: "desc" },
          { firstName: "asc" },
          { lastName: "asc" },
        ],
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    return {
      employees,
      totalCount,
    };
  }

  /**
   * Get employee by ID (Admin only)
   */
  async getEmployeeById(employeeId: string): Promise<SafeUser> {
    const employee = await prisma.user.findFirst({
      where: {
        id: employeeId,
        role: Role.EMPLOYEE,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        section: true,
        department: true,
        designation: true,
        phoneNumber: true,
        address: true,
        dateOfJoining: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
    });

    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    return employee;
  }

  /**
   * Update employee details (Admin only)
   */
  async updateEmployee(
    employeeId: string,
    data: UpdateEmployeeRequest,
  ): Promise<SafeUser> {
    // Check if employee exists
    const existingEmployee = await prisma.user.findFirst({
      where: {
        id: employeeId,
        role: Role.EMPLOYEE,
      },
    });

    if (!existingEmployee) {
      throw new NotFoundError("Employee not found");
    }

    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        section: true,
        department: true,
        designation: true,
        phoneNumber: true,
        address: true,
        dateOfJoining: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
    });

    return updatedEmployee;
  }

  /**
   * Deactivate employee (Admin only)
   */
  async deactivateEmployee(employeeId: string): Promise<SafeUser> {
    return this.updateEmployee(employeeId, { isActive: false });
  }

  /**
   * Activate employee (Admin only)
   */
  async activateEmployee(employeeId: string): Promise<SafeUser> {
    return this.updateEmployee(employeeId, { isActive: true });
  }

  /**
   * Delete employee (Admin only) - soft delete by deactivating
   */
  async deleteEmployee(employeeId: string): Promise<void> {
    const employee = await prisma.user.findFirst({
      where: {
        id: employeeId,
        role: Role.EMPLOYEE,
      },
    });

    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id: employeeId },
      data: { isActive: false },
    });
  }

  /**
   * Get departments list with employees (Admin only)
   */
  async getDepartments(): Promise<DepartmentWithEmployees[]> {
    // Get all employees grouped by department
    const employees = await prisma.user.findMany({
      where: {
        role: Role.EMPLOYEE,
        department: { not: null },
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        section: true,
        department: true,
        designation: true,
        phoneNumber: true,
        address: true,
        dateOfJoining: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
      orderBy: [
        { department: "asc" },
        { firstName: "asc" },
        { lastName: "asc" },
      ],
    });

    // Group employees by department
    const departmentMap = new Map<string, SafeUser[]>();

    employees.forEach((employee) => {
      const dept = employee.department!;
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, []);
      }
      departmentMap.get(dept)!.push(employee as SafeUser);
    });

    // Convert to array format
    const departments: DepartmentWithEmployees[] = Array.from(
      departmentMap.entries(),
    )
      .map(([name, employees]) => ({
        name,
        employees,
        employeeCount: employees.length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return departments;
  }

  /**
   * Get sections list with employees (Admin only)
   */
  async getSections(): Promise<SectionWithEmployees[]> {
    // Get all employees grouped by section
    const employees = await prisma.user.findMany({
      where: {
        role: Role.EMPLOYEE,
        section: { not: null },
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        section: true,
        department: true,
        designation: true,
        phoneNumber: true,
        address: true,
        dateOfJoining: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
      orderBy: [{ section: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
    });

    // Group employees by section
    const sectionMap = new Map<string, SafeUser[]>();

    employees.forEach((employee) => {
      const sect = employee.section!;
      if (!sectionMap.has(sect)) {
        sectionMap.set(sect, []);
      }
      sectionMap.get(sect)!.push(employee as SafeUser);
    });

    // Convert to array format
    const sections: SectionWithEmployees[] = Array.from(sectionMap.entries())
      .map(([name, employees]) => ({
        name,
        employees,
        employeeCount: employees.length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return sections;
  }

  /**
   * Get employee statistics (Admin only)
   */
  async getEmployeeStats(): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    departmentCount: number;
    sectionCount: number;
    recentJoinees: SafeUser[];
  }> {
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      departments,
      sections,
      recentJoinees,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: Role.EMPLOYEE },
      }),
      prisma.user.count({
        where: { role: Role.EMPLOYEE, isActive: true },
      }),
      prisma.user.count({
        where: { role: Role.EMPLOYEE, isActive: false },
      }),
      this.getDepartments(),
      this.getSections(),
      prisma.user.findMany({
        where: {
          role: Role.EMPLOYEE,
          dateOfJoining: { not: null },
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          section: true,
          department: true,
          designation: true,
          phoneNumber: true,
          address: true,
          dateOfJoining: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
        },
        orderBy: { dateOfJoining: "desc" },
        take: 5,
      }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      departmentCount: departments.length,
      sectionCount: sections.length,
      recentJoinees,
    };
  }

  /**
   * Get dashboard statistics (Admin only)
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get total active employees
    const totalEmployees = await prisma.user.count({
      where: {
        role: Role.EMPLOYEE,
        isActive: true,
      },
    });

    // Get today's attendances
    const todayAttendances = await prisma.attendance.findMany({
      where: {
        date: today,
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
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter attendances for active employees only
    const activeAttendances = todayAttendances.filter(
      (att) => att.user.isActive,
    );
    const totalAttendedToday = activeAttendances.length;
    const totalNotAttendedToday = totalEmployees - totalAttendedToday;
    const attendancePercentageToday =
      totalEmployees > 0
        ? Math.round((totalAttendedToday / totalEmployees) * 100)
        : 0;

    // Get employees who haven't marked attendance today
    const attendedUserIds = activeAttendances.map((att) => att.user.id);
    const notAttendedEmployees = await prisma.user.findMany({
      where: {
        role: Role.EMPLOYEE,
        isActive: true,
        id: {
          notIn: attendedUserIds,
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        section: true,
        department: true,
        designation: true,
        phoneNumber: true,
        address: true,
        dateOfJoining: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
      orderBy: [{ section: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
    });

    // Format recent attendances
    const recentAttendances: AttendanceResponse[] = activeAttendances
      .slice(0, 10)
      .map((att) => ({
        id: att.id,
        date: att.date.toISOString().split("T")[0],
        employeeName: att.employeeName,
        employeeId: att.employeeId,
        section: att.section,
        shift: att.shift,
        mood: att.mood,
        checkInTime: att.checkInTime,
        checkOutTime: att.checkOutTime,
        notes: att.notes,
        createdAt: att.createdAt,
      }));

    return {
      totalEmployees,
      totalAttendedToday,
      totalNotAttendedToday,
      attendancePercentageToday,
      notAttendedEmployees: notAttendedEmployees as SafeUser[],
      recentAttendances,
    };
  }
}