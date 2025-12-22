import { Request, Response, NextFunction } from 'express';
import { Role, AuthorizationError, RoleGuardOptions } from '../../types';

/**
 * Role-based access control middleware
 */
export function roleGuard(options: RoleGuardOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AuthorizationError('User not authenticated');
      }

      const { roles, allowSelf = false } = options;
      
      // Check if user has required role
      const hasRequiredRole = roles.includes(user.role);
      
      // If checking for self access (e.g., user accessing their own data)
      if (allowSelf && req.params.userId === user.id) {
        return next();
      }
      
      if (!hasRequiredRole) {
        throw new AuthorizationError(
          `Access denied. Required roles: ${roles.join(', ')}`
        );
      }
      
      next();
    } catch (error: any) {
      const statusCode = error.statusCode || 403;
      const message = error.message || 'Insufficient permissions';
      
      res.status(statusCode).json({
        success: false,
        message,
        error: 'Access denied'
      });
    }
  };
}

/**
 * Admin only access
 */
export const adminOnly = roleGuard({ roles: [Role.ADMIN] });

/**
 * Admin or Employee access
 */
export const adminOrEmployee = roleGuard({ roles: [Role.ADMIN, Role.EMPLOYEE] });

/**
 * Admin or Self access (user can access their own data)
 */
export const adminOrSelf = roleGuard({ 
  roles: [Role.ADMIN], 
  allowSelf: true 
});

/**
 * Check if user is admin
 */
export function isAdmin(user: any): boolean {
  return user?.role === Role.ADMIN;
}

/**
 * Check if user is employee
 */
export function isEmployee(user: any): boolean {
  return user?.role === Role.EMPLOYEE;
}

/**
 * Check if user can access resource (admin or owns the resource)
 */
export function canAccessResource(user: any, resourceUserId: string): boolean {
  return isAdmin(user) || user?.id === resourceUserId;
}