import { Request, Response } from 'express';
import { UserService } from './user.service';
import { getUsersQuerySchema, updateEmployeeSchema } from './user.validation';
import {
  ApiResponse,
  PaginatedResponse,
  UpdateEmployeeRequest,
  ValidationError
} from '../../types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get all employees (Admin only)
   */
  async getEmployees(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = getUsersQuerySchema.validate(req.query);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || "Validation error",
        );
      }

      const { page, limit } = value;
      const result = await this.userService.getEmployees(value);

      const totalPages = Math.ceil(result.totalCount / limit);

      const response: PaginatedResponse<typeof result> = {
        success: true,
        message: "Employees retrieved successfully",
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
        message: error.message || "Failed to get employees",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get employee by ID (Admin only)
   */
  async getEmployeeById(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;

      if (!employeeId) {
        throw new ValidationError("Employee ID is required");
      }

      const employee = await this.userService.getEmployeeById(employeeId);

      const response: ApiResponse = {
        success: true,
        message: "Employee retrieved successfully",
        data: { employee },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to get employee",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Update employee details (Admin only)
   */
  async updateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;

      if (!employeeId) {
        throw new ValidationError("Employee ID is required");
      }

      const { error, value } = updateEmployeeSchema.validate(req.body);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || "Validation error",
        );
      }

      const updateData: UpdateEmployeeRequest = value;
      const employee = await this.userService.updateEmployee(
        employeeId,
        updateData,
      );

      const response: ApiResponse = {
        success: true,
        message: "Employee updated successfully",
        data: { employee },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to update employee",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Deactivate employee (Admin only)
   */
  async deactivateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;

      if (!employeeId) {
        throw new ValidationError("Employee ID is required");
      }

      const employee = await this.userService.deactivateEmployee(employeeId);

      const response: ApiResponse = {
        success: true,
        message: "Employee deactivated successfully",
        data: { employee },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to deactivate employee",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Activate employee (Admin only)
   */
  async activateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;

      if (!employeeId) {
        throw new ValidationError("Employee ID is required");
      }

      const employee = await this.userService.activateEmployee(employeeId);

      const response: ApiResponse = {
        success: true,
        message: "Employee activated successfully",
        data: { employee },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to activate employee",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Delete employee (Admin only)
   */
  async deleteEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;

      if (!employeeId) {
        throw new ValidationError("Employee ID is required");
      }

      await this.userService.deleteEmployee(employeeId);

      const response: ApiResponse = {
        success: true,
        message: "Employee deleted successfully",
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to delete employee",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get departments list (Admin only)
   */
  async getDepartments(req: Request, res: Response): Promise<void> {
    try {
      const departments = await this.userService.getDepartments();

      const response: ApiResponse = {
        success: true,
        message: "Departments retrieved successfully",
        data: { departments },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to get departments",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get sections list (Admin only)
   */
  async getSections(req: Request, res: Response): Promise<void> {
    try {
      const sections = await this.userService.getSections();

      const response: ApiResponse = {
        success: true,
        message: "Sections retrieved successfully",
        data: { sections },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to get sections",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get dashboard statistics (Admin only)
   */
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const dashboardStats = await this.userService.getDashboardStats();

      const response: ApiResponse = {
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: { dashboard: dashboardStats },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to get dashboard statistics",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get employee statistics (Admin only)
   */
  async getEmployeeStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.userService.getEmployeeStats();

      const response: ApiResponse = {
        success: true,
        message: "Employee statistics retrieved successfully",
        data: { stats },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || "Failed to get employee statistics",
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  }
}