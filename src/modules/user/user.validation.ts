import Joi from 'joi';

// Pagination and filtering schemas
export const getUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  search: Joi.string().max(50).optional().messages({
    'string.max': 'Search term cannot exceed 50 characters'
  }),
  department: Joi.string().max(50).optional().messages({
    'string.max': 'Department filter cannot exceed 50 characters'
  }),
  section: Joi.string().max(50).optional().messages({
    'string.max': 'Section filter cannot exceed 50 characters'
  }),
  isActive: Joi.boolean().optional()
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