import { prisma } from '../../shared/config/database';
import { 
  LoginRequest, 
  RegisterRequest, 
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  AuthResponse, 
  SafeUser,
  Role,
  AuthenticationError,
  ConflictError,
  ValidationError,
  NotFoundError,
  PasswordResetRequest,
  ResetPasswordRequest,
  VerifyResetTokenRequest,
  PasswordResetResponse,
  ChangePasswordRequest
} from '../../types';
import { hashPassword, comparePassword, generateToken } from '../../shared/utils/authUtils';
import { validateAndParseDate } from '../../shared/utils/dateUtils';
import { emailService } from '../../shared/utils/passwordResetEmailService';
import { UserSettingsService } from '../admin/services/userSettings.service';
import crypto from 'crypto';

export class AuthService {
  private userSettingsService: UserSettingsService;

  constructor() {
    this.userSettingsService = new UserSettingsService();
  }
  /**
   * Unified login for both admin and employee users
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      await this.handleFailedLogin(email); // Track failed attempts even for non-existent users
      throw new AuthenticationError("Invalid credentials");
    }

    // Check account lockout status
    const lockoutCheck = await this.checkAccountLockout(user.id);
    if (lockoutCheck.isLocked) {
      throw new AuthenticationError(
        `Account is locked. ${lockoutCheck.message || 'Please contact administrator.'}`
      );
    }

    // Check if employee account is active
    if (user.role === Role.EMPLOYEE && !user.isActive) {
      throw new AuthenticationError(
        "Account is inactive. Please contact administrator.",
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(email, user.id);
      throw new AuthenticationError("Invalid credentials");
    }

    // Reset failed login attempts on successful login
    await this.resetFailedLoginAttempts(user.id);

    const safeUser: SafeUser = this.createSafeUser(user);
    const token = generateToken(safeUser);

    return { user: safeUser, token };
  }

  /**
   * Admin login - legacy method (use login instead)
   * @deprecated Use login method instead
   */
  /**
   * Admin login - legacy method (use login instead)
   * @deprecated Use login method instead
   */
  async adminLogin(data: LoginRequest): Promise<AuthResponse> {
    return this.login(data);
  }

  /**
   * Employee login - legacy method (use login instead)
   * @deprecated Use login method instead
   */
  async employeeLogin(data: LoginRequest): Promise<AuthResponse> {
    return this.login(data);
  }

  /**
   * Create employee (Admin only)
   */
  async createEmployee(
    data: CreateEmployeeRequest,
    adminId: string,
  ): Promise<SafeUser> {
    const {
      email,
      username,
      password,
      firstName,
      lastName,
      employeeId,
      section,
      department,
      designation,
      phoneNumber,
      address,
      dateOfJoining,
    } = data;

    // Check if user already exists with email, username, or employeeId
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }, { employeeId }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictError("Email already registered");
      }
      if (existingUser.username === username) {
        throw new ConflictError("Username already taken");
      }
      if (existingUser.employeeId === employeeId) {
        throw new ConflictError("Employee ID already exists");
      }
    }

    // Parse date of joining if provided
    let joiningDate: Date | undefined;
    if (dateOfJoining) {
      const dateValidation = validateAndParseDate(dateOfJoining);
      if (!dateValidation.isValidDate || !dateValidation.parsedDate) {
        throw new ValidationError(
          "Invalid date of joining format. Please use YYYY-MM-DD",
        );
      }
      joiningDate = dateValidation.parsedDate;
    }

    // Validate password strength
    const passwordValidation = await this.validatePasswordStrength(password, {
      email,
      name: `${firstName} ${lastName}`
    });
    
    if (!passwordValidation.valid) {
      throw new ValidationError(
        `Password does not meet requirements: ${passwordValidation.errors.join(', ')}`
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create employee
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: Role.EMPLOYEE,
        firstName,
        lastName,
        employeeId,
        section,
        department: department || null,
        designation: designation || null,
        phoneNumber: phoneNumber || null,
        address: address || null,
        dateOfJoining: joiningDate || null,
        createdBy: adminId,
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

    return user;
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: Partial<Pick<CreateEmployeeRequest, "firstName" | "lastName">>,
  ): Promise<SafeUser> {
    const user = await prisma.user.update({
      where: { id: userId },
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

    return user;
  }

  /**
   * Update employee details (Admin only)
   */
  async updateEmployee(
    employeeId: string,
    data: UpdateEmployeeRequest,
  ): Promise<SafeUser> {
    const user = await prisma.user.update({
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

    return user;
  }

  /**
   * Deactivate employee (Admin only)
   */
  async deactivateEmployee(employeeId: string): Promise<void> {
    await prisma.user.update({
      where: { id: employeeId },
      data: { isActive: false },
    });
  }

  /**
   * Activate employee (Admin only)
   */
  async activateEmployee(employeeId: string): Promise<void> {
    await prisma.user.update({
      where: { id: employeeId },
      data: { isActive: true },
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(
    data: PasswordResetRequest,
  ): Promise<PasswordResetResponse> {
    const { email } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email, isActive: true },
    });

    if (!user) {
      // For security, don't reveal if email exists
      return {
        message:
          "If this email exists in our system, you will receive password reset instructions.",
      };
    }

    // Invalidate any existing password reset tokens for this user
    await prisma.passwordReset.updateMany({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
      data: { used: true },
    });

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expiration time (1 hour from now)
    const expiresAt = new Date();
    const expiresInMinutes =
      parseInt(process.env.PASSWORD_RESET_EXPIRES_IN?.replace("h", "") || "1") *
      60;
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    // Save reset token to database
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
        used: false,
      },
    });

    // Generate reset link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(user.email, {
      userName:
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.username,
      resetLink,
      expiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || "1 hour",
    });

    if (!emailSent) {
      throw new Error(
        "Failed to send password reset email. Please try again later.",
      );
    }

    return {
      message:
        "If this email exists in our system, you will receive password reset instructions.",
      expiresAt,
    };
  }

  /**
   * Verify password reset token
   */
  async verifyResetToken(
    data: VerifyResetTokenRequest,
  ): Promise<{ valid: boolean; message: string }> {
    const { token } = data;

    // Hash the provided token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token: hashedToken,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!resetRecord) {
      return {
        valid: false,
        message: "Invalid or expired reset token.",
      };
    }

    return {
      valid: true,
      message: "Reset token is valid.",
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<{ message: string }> {
    const { token, newPassword } = data;

    // Hash the provided token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token: hashedToken,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new ValidationError("Invalid or expired reset token.");
    }

    if (!resetRecord.user.isActive) {
      throw new ValidationError(
        "This account is deactivated. Please contact your administrator.",
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    return {
      message:
        "Password has been reset successfully. You can now login with your new password.",
    };
  }

  /**
   * Change password (for authenticated users)
   */
  async changePassword(
    userId: string,
    data: ChangePasswordRequest,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError("Current password is incorrect.");
    }

    // Check if new password is different from current
    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      throw new ValidationError(
        "New password must be different from current password.",
      );
    }

    // Validate new password strength
    const passwordValidation = await this.validatePasswordStrength(newPassword, {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    });
    
    if (!passwordValidation.valid) {
      throw new ValidationError(
        `New password does not meet requirements: ${passwordValidation.errors.join(', ')}`
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: "Password changed successfully.",
    };
  }

  /**
   * Check if account is locked due to failed login attempts
   */
  private async checkAccountLockout(userId: string): Promise<{ isLocked: boolean; message?: string }> {
    try {
      const lockoutRules = await this.userSettingsService.getLockoutRules();
      
      if (!lockoutRules.enabled) {
        return { isLocked: false };
      }

      // Check for existing lockout record
      const lockoutRecord = await prisma.adminSettings.findFirst({
        where: {
          key: `lockout.${userId}`,
          category: 'security'
        }
      });

      if (!lockoutRecord) {
        return { isLocked: false };
      }

      const lockoutData = lockoutRecord.value as {
        failedAttempts: number;
        lastFailedAttempt: string;
        lockedUntil?: string;
      };

      // Check if currently locked
      if (lockoutData.lockedUntil) {
        const lockoutExpiry = new Date(lockoutData.lockedUntil);
        if (new Date() < lockoutExpiry) {
          const remainingMinutes = Math.ceil((lockoutExpiry.getTime() - new Date().getTime()) / (1000 * 60));
          return { 
            isLocked: true, 
            message: `Account locked for ${remainingMinutes} more minutes.` 
          };
        }
      }

      // Check if failed attempts should be reset
      const lastFailedAttempt = new Date(lockoutData.lastFailedAttempt);
      const resetAfterMinutes = lockoutRules.resetFailedAttemptsAfterMinutes;
      const resetTime = new Date(lastFailedAttempt.getTime() + (resetAfterMinutes * 60 * 1000));
      
      if (new Date() > resetTime) {
        // Reset failed attempts
        await this.resetFailedLoginAttempts(userId);
        return { isLocked: false };
      }

      return { isLocked: false };
    } catch (error) {
      console.error('Error checking account lockout:', error);
      return { isLocked: false }; // Fail open for system stability
    }
  }

  /**
   * Handle failed login attempt
   */
  private async handleFailedLogin(email: string, userId?: string): Promise<void> {
    try {
      const lockoutRules = await this.userSettingsService.getLockoutRules();
      
      if (!lockoutRules.enabled || !userId) {
        return;
      }

      const lockoutKey = `lockout.${userId}`;
      
      // Get existing lockout record
      const existingRecord = await prisma.adminSettings.findFirst({
        where: {
          key: lockoutKey,
          category: 'security'
        }
      });

      const currentData = existingRecord?.value as {
        failedAttempts: number;
        lastFailedAttempt: string;
        lockedUntil?: string;
      } || { failedAttempts: 0, lastFailedAttempt: new Date().toISOString() };

      const newFailedAttempts = currentData.failedAttempts + 1;
      const now = new Date().toISOString();

      let lockedUntil: string | undefined;
      if (newFailedAttempts >= lockoutRules.maxFailedAttempts) {
        const lockoutDuration = lockoutRules.lockoutDurationMinutes * 60 * 1000;
        lockedUntil = new Date(Date.now() + lockoutDuration).toISOString();

        // Notify admin if enabled
        if (lockoutRules.notifyAdminOnLockout) {
          await this.notifyAdminAccountLocked(email, userId);
        }
      }

      const updatedData = {
        failedAttempts: newFailedAttempts,
        lastFailedAttempt: now,
        ...(lockedUntil && { lockedUntil })
      };

      if (existingRecord) {
        await prisma.adminSettings.update({
          where: { id: existingRecord.id },
          data: { value: updatedData }
        });
      } else {
        await prisma.adminSettings.create({
          data: {
            key: lockoutKey,
            value: updatedData,
            category: 'security',
            description: `Login attempt tracking for user ${userId}`
          }
        });
      }
    } catch (error) {
      console.error('Error handling failed login:', error);
    }
  }

  /**
   * Reset failed login attempts for a user
   */
  private async resetFailedLoginAttempts(userId: string): Promise<void> {
    try {
      const lockoutKey = `lockout.${userId}`;
      
      await prisma.adminSettings.deleteMany({
        where: {
          key: lockoutKey,
          category: 'security'
        }
      });
    } catch (error) {
      console.error('Error resetting failed login attempts:', error);
    }
  }

  /**
   * Notify admin about account lockout
   */
  private async notifyAdminAccountLocked(email: string, userId: string): Promise<void> {
    // This would integrate with the email service to send notifications
    // Implementation depends on email service integration
    console.log(`Account locked for user ${email} (ID: ${userId})`);
  }

  /**
   * Enhanced password validation using user settings
   */
  async validatePasswordStrength(password: string, userInfo?: { email?: string; name?: string }): Promise<{ valid: boolean; errors: string[] }> {
    return this.userSettingsService.validatePassword(password, userInfo);
  }

  /**
   * Check if registration is allowed for an email
   */
  async validateRegistration(email: string): Promise<{ allowed: boolean; reason?: string }> {
    const emailValidation = await this.userSettingsService.validateRegistrationEmail(email);
    if (!emailValidation.valid) {
      return { allowed: false, reason: emailValidation.reason };
    }

    return this.userSettingsService.isRegistrationAllowed(email);
  }

  /**
   * Create safe user object (without password)
   */
  private createSafeUser(user: any): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}