import Joi from 'joi';

// Working hours validation schema
const workingHoursSchema = Joi.object({
  startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
    .messages({
      'string.pattern.base': 'Start time must be in HH:MM format (24-hour)',
      'any.required': 'Start time is required'
    }),
  endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
    .messages({
      'string.pattern.base': 'End time must be in HH:MM format (24-hour)',
      'any.required': 'End time is required'
    }),
  breakDuration: Joi.number().integer().min(0).max(480).default(60)
    .messages({
      'number.min': 'Break duration must be at least 0 minutes',
      'number.max': 'Break duration cannot exceed 480 minutes (8 hours)',
      'number.integer': 'Break duration must be a whole number'
    }),
  gracePeriod: Joi.number().integer().min(0).max(60).default(15)
    .messages({
      'number.min': 'Grace period must be at least 0 minutes',
      'number.max': 'Grace period cannot exceed 60 minutes',
      'number.integer': 'Grace period must be a whole number'
    })
});

// SMTP configuration validation schema
const smtpConfigSchema = Joi.object({
  host: Joi.string().hostname().required()
    .messages({
      'string.hostname': 'SMTP host must be a valid hostname',
      'any.required': 'SMTP host is required'
    }),
  port: Joi.number().integer().min(1).max(65535).required()
    .messages({
      'number.min': 'SMTP port must be between 1 and 65535',
      'number.max': 'SMTP port must be between 1 and 65535',
      'any.required': 'SMTP port is required'
    }),
  user: Joi.string().email().required()
    .messages({
      'string.email': 'SMTP user must be a valid email address',
      'any.required': 'SMTP user is required'
    }),
  pass: Joi.string().min(1).required()
    .messages({
      'string.min': 'SMTP password is required',
      'any.required': 'SMTP password is required'
    }),
  fromEmail: Joi.string().email().required()
    .messages({
      'string.email': 'From email must be a valid email address',
      'any.required': 'From email is required'
    }),
  fromName: Joi.string().min(1).max(100).default('Company Attendance System')
    .messages({
      'string.min': 'From name cannot be empty',
      'string.max': 'From name cannot exceed 100 characters'
    })
});

// Notification schedule validation schema
const notificationScheduleSchema = Joi.object({
  dailyReminderTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
    .messages({
      'string.pattern.base': 'Daily reminder time must be in HH:MM format (24-hour)',
      'any.required': 'Daily reminder time is required'
    }),
  endOfDayReportTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
    .messages({
      'string.pattern.base': 'End of day report time must be in HH:MM format (24-hour)',
      'any.required': 'End of day report time is required'
    }),
  weeklyReportDay: Joi.number().integer().min(0).max(6).required()
    .messages({
      'number.min': 'Weekly report day must be between 0 (Sunday) and 6 (Saturday)',
      'number.max': 'Weekly report day must be between 0 (Sunday) and 6 (Saturday)',
      'any.required': 'Weekly report day is required'
    }),
  weeklyReportTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
    .messages({
      'string.pattern.base': 'Weekly report time must be in HH:MM format (24-hour)',
      'any.required': 'Weekly report time is required'
    })
});

// Attendance policy validation schema
const attendancePolicySchema = Joi.object({
  gracePeriodMinutes: Joi.number().integer().min(0).max(60).required()
    .messages({
      'number.min': 'Grace period must be at least 0 minutes',
      'number.max': 'Grace period cannot exceed 60 minutes',
      'any.required': 'Grace period is required'
    }),
  maxLatePerMonth: Joi.number().integer().min(0).max(31).required()
    .messages({
      'number.min': 'Max late days must be at least 0',
      'number.max': 'Max late days cannot exceed 31',
      'any.required': 'Max late days per month is required'
    }),
  minWorkingHours: Joi.number().min(1).max(24).required()
    .messages({
      'number.min': 'Minimum working hours must be at least 1',
      'number.max': 'Minimum working hours cannot exceed 24',
      'any.required': 'Minimum working hours is required'
    }),
  maxWorkingHours: Joi.number().min(1).max(24).required()
    .messages({
      'number.min': 'Maximum working hours must be at least 1',
      'number.max': 'Maximum working hours cannot exceed 24',
      'any.required': 'Maximum working hours is required'
    }),
  consecutiveAbsentAlertDays: Joi.number().integer().min(1).max(30).required()
    .messages({
      'number.min': 'Consecutive absent alert must be at least 1 day',
      'number.max': 'Consecutive absent alert cannot exceed 30 days',
      'any.required': 'Consecutive absent alert days is required'
    })
});

// Email template validation schema
const emailTemplateSchema = Joi.object({
  subject: Joi.string().min(1).max(200).required()
    .messages({
      'string.min': 'Email subject cannot be empty',
      'string.max': 'Email subject cannot exceed 200 characters',
      'any.required': 'Email subject is required'
    }),
  htmlBody: Joi.string().min(1).required()
    .messages({
      'string.min': 'Email HTML body cannot be empty',
      'any.required': 'Email HTML body is required'
    }),
  textBody: Joi.string().allow('').optional()
});

// Main setting validation schemas by key
export const settingValidationSchemas: Record<string, Joi.Schema> = {
  // Company Settings
  company_name: Joi.string().min(1).max(100).required()
    .messages({
      'string.min': 'Company name cannot be empty',
      'string.max': 'Company name cannot exceed 100 characters',
      'any.required': 'Company name is required'
    }),

  company_email: Joi.string().email().allow('')
    .messages({
      'string.email': 'Company email must be a valid email address'
    }),

  company_phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).allow('')
    .messages({
      'string.pattern.base': 'Company phone must be a valid phone number'
    }),

  company_address: Joi.string().max(500).allow('')
    .messages({
      'string.max': 'Company address cannot exceed 500 characters'
    }),

  timezone: Joi.string().required()
    .messages({
      'any.required': 'Timezone is required'
    }),

  working_hours: workingHoursSchema,

  working_days: Joi.array()
    .items(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'))
    .min(1)
    .max(7)
    .unique()
    .required()
    .messages({
      'array.min': 'At least one working day must be selected',
      'array.max': 'Cannot have more than 7 working days',
      'array.unique': 'Working days must be unique',
      'any.only': 'Working days must be valid day names',
      'any.required': 'Working days are required'
    }),

  // Email Settings
  smtp_config: smtpConfigSchema,

  notification_schedule: notificationScheduleSchema,

  // Attendance Settings
  attendance_policy: attendancePolicySchema,

  // Email Templates
  emailTemplateAttendanceReminder: emailTemplateSchema,
  email_template_welcome: emailTemplateSchema,
  email_template_password_reset: emailTemplateSchema,

  // System Settings
  app_name: Joi.string().min(1).max(100)
    .messages({
      'string.min': 'App name cannot be empty',
      'string.max': 'App name cannot exceed 100 characters'
    }),

  theme: Joi.string().valid('light', 'dark').default('light')
    .messages({
      'any.only': 'Theme must be either "light" or "dark"'
    }),

  date_format: Joi.string().valid('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD').default('DD/MM/YYYY')
    .messages({
      'any.only': 'Date format must be DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD'
    }),

  time_format: Joi.string().valid('12', '24').default('24')
    .messages({
      'any.only': 'Time format must be "12" or "24"'
    }),

  records_per_page: Joi.number().integer().min(10).max(100).default(20)
    .messages({
      'number.min': 'Records per page must be at least 10',
      'number.max': 'Records per page cannot exceed 100',
      'number.integer': 'Records per page must be a whole number'
    })
};

// Create setting validation schema
export const createSettingSchema = Joi.object({
  key: Joi.string().min(1).max(100).required()
    .pattern(/^[a-z0-9_]+$/)
    .messages({
      'string.min': 'Setting key cannot be empty',
      'string.max': 'Setting key cannot exceed 100 characters',
      'string.pattern.base': 'Setting key can only contain lowercase letters, numbers, and underscores',
      'any.required': 'Setting key is required'
    }),

  value: Joi.any().required()
    .messages({
      'any.required': 'Setting value is required'
    }),

  category: Joi.string().valid('company', 'email', 'attendance', 'system', 'ui').required()
    .messages({
      'any.only': 'Category must be one of: company, email, attendance, system, ui',
      'any.required': 'Category is required'
    }),

  description: Joi.string().max(500).allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

// Update setting validation schema
export const updateSettingSchema = Joi.object({
  value: Joi.any(),
  description: Joi.string().max(500).allow(''),
  isActive: Joi.boolean()
}).min(1)
  .messages({
    'object.min': 'At least one field (value, description, or isActive) must be provided'
  });

// Bulk update validation schema
export const bulkUpdateSchema = Joi.object({
  settings: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().required(),
        value: Joi.any().required()
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': 'At least one setting must be provided',
      'array.max': 'Cannot update more than 50 settings at once',
      'any.required': 'Settings array is required'
    })
});

/**
 * Validate setting value based on its key
 */
export function validateSettingValue(key: string, value: any): { error?: string; value?: any } {
  const schema = settingValidationSchemas[key];
  
  if (!schema) {
    return { value }; // No specific validation for this key
  }

  const result = schema.validate(value);
  
  if (result.error) {
    return { error: result.error.details[0].message };
  }

  return { value: result.value };
}

/**
 * Get all available setting categories
 */
export const settingCategories = ['company', 'email', 'attendance', 'system', 'ui'] as const;

/**
 * Get all predefined setting keys with their categories
 */
export const predefinedSettings = {
  company: [
    'company_name',
    'company_email', 
    'company_phone',
    'company_address',
    'timezone',
    'working_hours',
    'working_days'
  ],
  email: [
    'smtp_config',
    'notification_schedule',
    'emailTemplateAttendanceReminder',
    'email_template_welcome',
    'email_template_password_reset'
  ],
  attendance: [
    'attendance_policy'
  ],
  system: [
    'app_name',
    'theme',
    'date_format',
    'time_format',
    'records_per_page'
  ],
  ui: []
} as const;