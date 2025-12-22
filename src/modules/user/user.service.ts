import { prisma } from '../../shared/config/database';
import {
  SafeUser,
  EmployeeListResponse,
  UpdateEmployeeRequest,
  PaginationParams,
  Role,
  NotFoundError
} from '../../types';

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
      isActive
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      role: Role.EMPLOYEE
    };

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (department) {
      whereClause.department = { contains: department, mode: 'insensitive' };
    }

    if (section) {
      whereClause.section = { contains: section, mode: 'insensitive' };
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
          createdBy: true
        },
        orderBy: [
          { isActive: 'desc' },
          { firstName: 'asc' },
          { lastName: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.user.count({
        where: whereClause
      })
    ]);

    return {
      employees,
      totalCount
    };
  }

  /**
   * Get employee by ID (Admin only)
   */
  async getEmployeeById(employeeId: string): Promise<SafeUser> {
    const employee = await prisma.user.findFirst({
      where: {
        id: employeeId,
        role: Role.EMPLOYEE
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
        createdBy: true
      }
    });

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    return employee;
  }

  /**
   * Update employee details (Admin only)
   */
  async updateEmployee(employeeId: string, data: UpdateEmployeeRequest): Promise<SafeUser> {
    // Check if employee exists
    const existingEmployee = await prisma.user.findFirst({
      where: {
        id: employeeId,
        role: Role.EMPLOYEE
      }
    });

    if (!existingEmployee) {
      throw new NotFoundError('Employee not found');
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
        createdBy: true
      }
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
        role: Role.EMPLOYEE
      }
    });

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id: employeeId },
      data: { isActive: false }
    });
  }

  /**
   * Get departments list (Admin only)
   */
  async getDepartments(): Promise<string[]> {
    const departments = await prisma.user.findMany({
      where: {
        role: Role.EMPLOYEE,
        department: { not: null }
      },
      select: { department: true },
      distinct: ['department']
    });

    return departments
      .map(d => d.department)
      .filter(d => d !== null && d.trim() !== '') as string[];
  }

  /**
   * Get sections list (Admin only)
   */
  async getSections(): Promise<string[]> {
    const sections = await prisma.user.findMany({
      where: {
        role: Role.EMPLOYEE,
        section: { not: null }
      },
      select: { section: true },
      distinct: ['section']
    });

    return sections
      .map(s => s.section)
      .filter(s => s !== null && s.trim() !== '') as string[];
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
      recentJoinees
    ] = await Promise.all([
      prisma.user.count({
        where: { role: Role.EMPLOYEE }
      }),
      prisma.user.count({
        where: { role: Role.EMPLOYEE, isActive: true }
      }),
      prisma.user.count({
        where: { role: Role.EMPLOYEE, isActive: false }
      }),
      this.getDepartments(),
      this.getSections(),
      prisma.user.findMany({
        where: {
          role: Role.EMPLOYEE,
          dateOfJoining: { not: null }
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
          createdBy: true
        },
        orderBy: { dateOfJoining: 'desc' },
        take: 5
      })
    ]);

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      departmentCount: departments.length,
      sectionCount: sections.length,
      recentJoinees
    };
  }
}