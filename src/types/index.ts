import { User, Attendance, Role, Shift, Mood } from '@prisma/client';
import { Request } from "express";

// Export Prisma enums
export { Role, Shift, Mood };

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateEmployeeRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  section: string;
  department?: string;
  designation?: string;
  phoneNumber?: string;
  address?: string;
  dateOfJoining?: string;
}

export interface AuthResponse {
  user: SafeUser;
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: Role;
}

// Password reset related types
export interface PasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyResetTokenRequest {
  token: string;
}

export interface PasswordResetResponse {
  message: string;
  expiresAt?: Date;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Attendance related types
export interface MarkAttendanceRequest {
  date?: string; // Optional, defaults to today in YYYY-MM-DD format
  mood: Mood;
  notes?: string;
}

export interface MarkAbsenceRequest {
  date?: string; // Optional, defaults to today in YYYY-MM-DD format
  reason: string;
}

// Legacy interface for backward compatibility
export interface MarkAttendanceRequestLegacy {
  date?: string; // Optional, defaults to today in YYYY-MM-DD format
  employeeName: string;
  employeeId: string;
  section: string;
  shift: Shift;
  mood: Mood;
  checkInTime?: string;
  notes?: string;
}

export interface AttendanceResponse {
  id: string;
  date: string; // YYYY-MM-DD format
  employeeName: string;
  employeeId: string;
  section: string;
  shift: Shift;
  mood: Mood;
  checkInTime?: Date | null;
  checkOutTime?: Date | null;
  notes?: string | null;
  createdAt: Date;
}

export interface AttendanceSummary {
  totalDays: number;
  attendedDays: number;
  attendancePercentage: number;
  month: string; // YYYY-MM format
  year: number;
  moodDistribution?: {
    [key in Mood]: number;
  };
  shiftDistribution?: {
    [key in Shift]: number;
  };
}

export interface AttendanceDatesResponse {
  dates: AttendanceResponse[];
  totalCount: number;
}

// User management types
export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  section?: string;
  department?: string;
  designation?: string;
  phoneNumber?: string;
  address?: string;
  isActive?: boolean;
}

export interface EmployeeListResponse {
  employees: SafeUser[];
  totalCount: number;
}

export interface DepartmentWithEmployees {
  name: string;
  employees: SafeUser[];
  employeeCount: number;
}

export interface SectionWithEmployees {
  name: string;
  employees: SafeUser[];
  employeeCount: number;
}

export interface DashboardStats {
  totalEmployees: number;
  totalAttendedToday: number;
  totalNotAttendedToday: number;
  attendancePercentageToday: number;
  notAttendedEmployees: SafeUser[];
  recentAttendances: AttendanceResponse[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  section?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Extended Request interface for authenticated routes
export interface AuthenticatedRequest extends Request {
  user: SafeUser;
}

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

// Database models without password
export type SafeUser = Omit<User, 'password'>;
export type UserWithAttendances = User & {
  attendances: Attendance[];
};
export type SafeUserWithAttendances = Omit<UserWithAttendances, 'password'>;

// Validation schemas
export interface DateValidation {
  isValidDate: boolean;
  parsedDate?: Date;
  formattedDate?: string;
}

// Role-based access types
export interface RoleGuardOptions {
  roles: Role[];
  allowSelf?: boolean; // Allow user to access their own data
}

// Error types
export class CustomError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'CustomError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class ConflictError extends CustomError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}