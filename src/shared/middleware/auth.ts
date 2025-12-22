import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/authUtils';
import { prisma } from '../config/database';
import { AuthenticationError, NotFoundError } from '../../types';

/**
 * Middleware to authenticate JWT tokens
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new AuthenticationError('Access token is required');
    }

    // Verify the token
    const payload = verifyToken(token);

    // Fetch user from database to ensure user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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
        createdBy: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error: any) {
    const statusCode = error.statusCode || 401;
    const message = error.message || 'Authentication failed';
    
    res.status(statusCode).json({
      success: false,
      message,
      error: 'Authentication failed'
    });
  }
}

/**
 * Optional authentication middleware - doesn't throw error if no token
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = verifyToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
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
          createdBy: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
}