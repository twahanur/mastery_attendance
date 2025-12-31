import Joi from 'joi';

// Password Policy Validation
export const passwordPolicySchema = Joi.object({
  minLength: Joi.number().integer().min(4).max(50).optional(),
  maxLength: Joi.number().integer().min(8).max(256).optional(),
  requireUppercase: Joi.boolean().optional(),
  requireLowercase: Joi.boolean().optional(),
  requireNumbers: Joi.boolean().optional(),
  requireSymbols: Joi.boolean().optional(),
  preventCommonPasswords: Joi.boolean().optional(),
  preventUserInfo: Joi.boolean().optional(),
  expirationDays: Joi.number().integer().min(0).max(365).optional(),
  historyCount: Joi.number().integer().min(0).max(20).optional()
});

// Password Validation Request
export const passwordValidationSchema = Joi.object({
  password: Joi.string().required(),
  userInfo: Joi.object({
    email: Joi.string().email().optional(),
    name: Joi.string().optional()
  }).optional()
});

// Registration Policy Validation
export const registrationPolicySchema = Joi.object({
  allowSelfRegistration: Joi.boolean().optional(),
  requireEmailVerification: Joi.boolean().optional(),
  requireAdminApproval: Joi.boolean().optional(),
  allowedEmailDomains: Joi.array().items(Joi.string().domain()).optional(),
  blockedEmailDomains: Joi.array().items(Joi.string().domain()).optional(),
  defaultRole: Joi.string().valid('EMPLOYEE', 'ADMIN').optional(),
  autoActivateAccounts: Joi.boolean().optional(),
  requireInvitation: Joi.boolean().optional()
});

// Email Validation Request
export const emailValidationSchema = Joi.object({
  email: Joi.string().email().required()
});

// Account Lockout Rules Validation
export const lockoutRulesSchema = Joi.object({
  enabled: Joi.boolean().optional(),
  maxFailedAttempts: Joi.number().integer().min(1).max(20).optional(),
  lockoutDurationMinutes: Joi.number().integer().min(1).max(1440).optional(), // Max 24 hours
  resetFailedAttemptsAfterMinutes: Joi.number().integer().min(1).max(1440).optional(),
  notifyAdminOnLockout: Joi.boolean().optional(),
  allowSelfUnlock: Joi.boolean().optional(),
  progressiveDelay: Joi.boolean().optional()
});

// Profile Field Configuration Validation
export const profileFieldSchema = Joi.object({
  fieldName: Joi.string().min(1).max(50).pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/).required(),
  required: Joi.boolean().required(),
  visible: Joi.boolean().required(),
  editable: Joi.boolean().required(),
  fieldType: Joi.string().valid('text', 'email', 'phone', 'date', 'select', 'textarea').required(),
  validation: Joi.object({
    pattern: Joi.string().optional(),
    minLength: Joi.number().integer().min(0).optional(),
    maxLength: Joi.number().integer().min(1).optional(),
    options: Joi.array().items(Joi.string()).optional()
  }).optional(),
  defaultValue: Joi.string().optional()
});

export const profileFieldsSchema = Joi.array().items(profileFieldSchema);

// Session Settings Validation
export const sessionSettingsSchema = Joi.object({
  sessionTimeoutMinutes: Joi.number().integer().min(5).max(1440).optional(), // 5 min to 24 hours
  allowMultipleSessions: Joi.boolean().optional(),
  forceLogoutOnPasswordChange: Joi.boolean().optional(),
  rememberMeDays: Joi.number().integer().min(1).max(365).optional(),
  requireReauthForSensitive: Joi.boolean().optional()
});

// Validation Middleware Factory
export const validateSchema = (schema: Joi.Schema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Custom validation functions
export const validatePasswordPolicy = validateSchema(passwordPolicySchema);
export const validatePasswordRequest = validateSchema(passwordValidationSchema);
export const validateRegistrationPolicy = validateSchema(registrationPolicySchema);
export const validateEmailRequest = validateSchema(emailValidationSchema);
export const validateLockoutRules = validateSchema(lockoutRulesSchema);
export const validateProfileField = validateSchema(profileFieldSchema);
export const validateProfileFields = validateSchema(profileFieldsSchema);
export const validateSessionSettings = validateSchema(sessionSettingsSchema);