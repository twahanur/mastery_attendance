import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../types';

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  // Handle Prisma errors
  if (error.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this data already exists';
  } else if (error.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  } else if (error.code === 'P2003') {
    statusCode = 400;
    message = 'Foreign key constraint failed';
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode
    });
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found middleware
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`
  };

  res.status(404).json(response);
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Request:', logData);
    }
  });
  
  next();
}

/**
 * Rate limiting helper (basic implementation)
 */
export function createRateLimiter(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  const requests = new Map();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userData = requests.get(key);
    
    if (now > userData.resetTime) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userData.count >= maxRequests) {
      const response: ApiResponse = {
        success: false,
        message: 'Too many requests, please try again later',
        error: 'Rate limit exceeded'
      };
      
      res.status(429).json(response);
      return;
    }

    userData.count++;
    next();
  };
}