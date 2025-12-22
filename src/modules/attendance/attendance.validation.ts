import Joi from 'joi';
import { Shift, Mood } from '../../types';

// Attendance validation schemas
export const markAttendanceSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    'string.pattern.base': 'Date must be in YYYY-MM-DD format'
  }),
  employeeName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Employee name must be at least 2 characters long',
    'string.max': 'Employee name cannot exceed 100 characters',
    'any.required': 'Employee name is required'
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
  shift: Joi.string().valid(...Object.values(Shift)).required().messages({
    'any.only': `Shift must be one of: ${Object.values(Shift).join(', ')}`,
    'any.required': 'Shift is required'
  }),
  mood: Joi.string().valid(...Object.values(Mood)).required().messages({
    'any.only': `Mood must be one of: ${Object.values(Mood).join(', ')}`,
    'any.required': 'Mood is required'
  }),
  checkInTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional().messages({
    'string.pattern.base': 'Check-in time must be in HH:MM format'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Notes cannot exceed 500 characters'
  })
});

export const updateAttendanceSchema = Joi.object({
  checkOutTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional().messages({
    'string.pattern.base': 'Check-out time must be in HH:MM format'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Notes cannot exceed 500 characters'
  })
});

// Query parameter validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});

export const attendanceFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    'string.pattern.base': 'Start date must be in YYYY-MM-DD format'
  }),
  endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    'string.pattern.base': 'End date must be in YYYY-MM-DD format'
  }),
  section: Joi.string().max(50).optional(),
  shift: Joi.string().valid(...Object.values(Shift)).optional(),
  mood: Joi.string().valid(...Object.values(Mood)).optional(),
  employeeId: Joi.string().alphanum().optional()
});

export const monthYearSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).optional().messages({
    'number.integer': 'Month must be an integer',
    'number.min': 'Month must be between 1 and 12',
    'number.max': 'Month must be between 1 and 12'
  }),
  year: Joi.number().integer().min(2000).max(2100).optional().messages({
    'number.integer': 'Year must be an integer',
    'number.min': 'Year must be at least 2000',
    'number.max': 'Year cannot exceed 2100'
  })
});