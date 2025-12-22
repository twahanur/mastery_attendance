import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { 
  loginSchema, 
  createEmployeeSchema, 
  updateProfileSchema,
  changePasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyResetTokenSchema
} from './auth.validation';
import { 
  LoginRequest, 
  CreateEmployeeRequest,
  ApiResponse, 
  ValidationError,
  Role,
  PasswordResetRequest,
  ResetPasswordRequest,
  VerifyResetTokenRequest,
  ChangePasswordRequest
} from '../../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Admin login
   */
  async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details?.[0]?.message || "Validation error");
      }

      const loginData: LoginRequest = value;
      const result = await this.authService.adminLogin(loginData);

      const response: ApiResponse = {
        success: true,
        message: 'Admin login successful',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Admin login failed',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Employee login
   */
  async employeeLogin(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details?.[0]?.message || "Validation error");
      }

      const loginData: LoginRequest = value;
      const result = await this.authService.employeeLogin(loginData);

      const response: ApiResponse = {
        success: true,
        message: 'Employee login successful',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Employee login failed',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Create employee (Admin only)
   */
  async createEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createEmployeeSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details?.[0]?.message || "Validation error");
      }

      const adminId = req.user!.id;
      const employeeData: CreateEmployeeRequest = value;
      const employee = await this.authService.createEmployee(employeeData, adminId);

      const response: ApiResponse = {
        success: true,
        message: 'Employee created successfully',
        data: { employee }
      };

      res.status(201).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create employee',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await this.authService.getUserProfile(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Profile retrieved successfully',
        data: { user }
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get profile',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { error, value } = updateProfileSchema.validate(req.body);
      
      if (error) {
        throw new ValidationError(error.details?.[0]?.message || "Validation error");
      }

      const user = await this.authService.updateProfile(userId, value);

      const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update profile',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Change password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { error, value } = changePasswordSchema.validate(req.body);
      
      if (error) {
        throw new ValidationError(error.details?.[0]?.message || "Validation error");
      }

      const { currentPassword, newPassword } = value;
      const changePasswordData: ChangePasswordRequest = { currentPassword, newPassword };
      const result = await this.authService.changePassword(userId, changePasswordData);

      const response: ApiResponse = {
        success: true,
        message: result.message
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to change password',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Logout user (client-side token removal)
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const response: ApiResponse = {
        success: true,
        message: 'Logout successful'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Logout failed',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = requestPasswordResetSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details?.[0]?.message || "Validation error");
      }

      const resetData: PasswordResetRequest = value;
      const result = await this.authService.requestPasswordReset(resetData);

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: { expiresAt: result.expiresAt }
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Password reset request failed',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Verify reset token
   */
  async verifyResetToken(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = verifyResetTokenSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details?.[0]?.message || "Validation error");
      }

      const tokenData: VerifyResetTokenRequest = value;
      const result = await this.authService.verifyResetToken(tokenData);

      const response: ApiResponse = {
        success: result.valid,
        message: result.message
      };

      const statusCode = result.valid ? 200 : 400;
      res.status(statusCode).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Token verification failed',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = resetPasswordSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details?.[0]?.message || "Validation error");
      }

      const resetData: ResetPasswordRequest = value;
      const result = await this.authService.resetPassword(resetData);

      const response: ApiResponse = {
        success: true,
        message: result.message
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Password reset failed',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  }
}