import Joi from 'joi';
import { Role, Shift, Mood } from '../../types';

// Auth validation schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  })
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username can only contain letters and numbers',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username cannot exceed 30 characters',
    'any.required': 'Username is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().max(50).optional().messages({
    'string.max': 'First name cannot exceed 50 characters'
  }),
  lastName: Joi.string().max(50).optional().messages({
    'string.max': 'Last name cannot exceed 50 characters'
  })
});

export const createEmployeeSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username can only contain letters and numbers',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username cannot exceed 30 characters',
    'any.required': 'Username is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  employeeId: Joi.string().alphanum().min(3).max(20).required().messages({
    'string.alphanum': 'Employee ID can only contain letters and numbers',
    'string.min': 'Employee ID must be at least 3 characters long',
    'string.max': 'Employee ID cannot exceed 20 characters',
    'any.required': 'Employee ID is required'
  }),
  section: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Section must be at least 2 characters long',
    'string.max': 'Section cannot exceed 50 characters',
    'any.required': 'Section is required'
  }),
  department: Joi.string().max(50).optional().messages({
    'string.max': 'Department cannot exceed 50 characters'
  }),
  designation: Joi.string().max(50).optional().messages({
    'string.max': 'Designation cannot exceed 50 characters'
  }),
  phoneNumber: Joi.string().pattern(/^[+]?[1-9][\d\s\-\(\)]{7,15}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  address: Joi.string().max(200).optional().messages({
    'string.max': 'Address cannot exceed 200 characters'
  }),
  dateOfJoining: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    'string.pattern.base': 'Date of joining must be in YYYY-MM-DD format'
  })
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters'
  }),
  lastName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters'
  })
});

export const updateEmployeeSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters'
  }),
  lastName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters'
  }),
  section: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Section must be at least 2 characters long',
    'string.max': 'Section cannot exceed 50 characters'
  }),
  department: Joi.string().max(50).optional().allow('').messages({
    'string.max': 'Department cannot exceed 50 characters'
  }),
  designation: Joi.string().max(50).optional().allow('').messages({
    'string.max': 'Designation cannot exceed 50 characters'
  }),
  phoneNumber: Joi.string().pattern(/^[+]?[1-9][\d\s\-\(\)]{7,15}$/).optional().allow('').messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  address: Joi.string().max(200).optional().allow('').messages({
    'string.max': 'Address cannot exceed 200 characters'
  }),
  isActive: Joi.boolean().optional()
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required().messages({
    'string.min': 'Current password must be at least 6 characters long',
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required'
  })
});

// Password reset validation schemas
export const requestPasswordResetSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  newPassword: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'New password is required'
  })
});

export const verifyResetTokenSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  })
});