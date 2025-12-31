import { SettingsService } from '../../settings/settings.service';

interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  preventCommonPasswords: boolean;
  preventUserInfo: boolean;
  expirationDays: number;
  historyCount: number;
}

interface RegistrationPolicy {
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  requireAdminApproval: boolean;
  allowedEmailDomains: string[];
  blockedEmailDomains: string[];
  defaultRole: 'EMPLOYEE' | 'ADMIN';
  autoActivateAccounts: boolean;
  requireInvitation: boolean;
}

interface AccountLockoutRules {
  enabled: boolean;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  resetFailedAttemptsAfterMinutes: number;
  notifyAdminOnLockout: boolean;
  allowSelfUnlock: boolean;
  progressiveDelay: boolean;
}

interface ProfileFieldConfig {
  fieldName: string;
  required: boolean;
  visible: boolean;
  editable: boolean;
  fieldType: 'text' | 'email' | 'phone' | 'date' | 'select' | 'textarea';
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    options?: string[];
  };
  defaultValue?: string;
}

interface UserSessionSettings {
  sessionTimeoutMinutes: number;
  allowMultipleSessions: boolean;
  forceLogoutOnPasswordChange: boolean;
  rememberMeDays: number;
  requireReauthForSensitive: boolean;
}

export class UserSettingsService {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  // Password Policy Management
  async getPasswordPolicy(): Promise<PasswordPolicy> {
    const policy = await this.settingsService.getSetting('user.passwordPolicy');
    
    return policy?.value || {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: false,
      preventCommonPasswords: true,
      preventUserInfo: true,
      expirationDays: 90,
      historyCount: 5
    };
  }

  async updatePasswordPolicy(policy: Partial<PasswordPolicy>): Promise<PasswordPolicy> {
    const currentPolicy = await this.getPasswordPolicy();
    const updatedPolicy = { ...currentPolicy, ...policy };
    
    await this.settingsService.updateSetting('user.passwordPolicy', {
      value: updatedPolicy,
      description: 'Password security requirements and policies'
    });

    return updatedPolicy;
  }

  async validatePassword(password: string, userInfo?: { email?: string; name?: string }): Promise<{ valid: boolean; errors: string[] }> {
    const policy = await this.getPasswordPolicy();
    const errors: string[] = [];

    // Length validation
    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }
    if (password.length > policy.maxLength) {
      errors.push(`Password must not exceed ${policy.maxLength} characters`);
    }

    // Character requirements
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (policy.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one symbol');
    }

    // Common password check
    if (policy.preventCommonPasswords) {
      const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123', 'admin', 'letmein'];
      if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('Password is too common, please choose a different one');
      }
    }

    // User info check
    if (policy.preventUserInfo && userInfo) {
      const userInfoValues = [userInfo.email?.split('@')[0], userInfo.name].filter(Boolean);
      for (const info of userInfoValues) {
        if (info && password.toLowerCase().includes(info.toLowerCase())) {
          errors.push('Password should not contain personal information');
          break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Registration Policy Management
  async getRegistrationPolicy(): Promise<RegistrationPolicy> {
    const policy = await this.settingsService.getSetting('user.registrationPolicy');
    
    return policy?.value || {
      allowSelfRegistration: false,
      requireEmailVerification: true,
      requireAdminApproval: true,
      allowedEmailDomains: [],
      blockedEmailDomains: [],
      defaultRole: 'EMPLOYEE',
      autoActivateAccounts: false,
      requireInvitation: true
    };
  }

  async updateRegistrationPolicy(policy: Partial<RegistrationPolicy>): Promise<RegistrationPolicy> {
    const currentPolicy = await this.getRegistrationPolicy();
    const updatedPolicy = { ...currentPolicy, ...policy };
    
    await this.settingsService.updateSetting('user.registrationPolicy', {
      value: updatedPolicy,
      description: 'User registration and account creation policies'
    });

    return updatedPolicy;
  }

  async validateRegistrationEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
    const policy = await this.getRegistrationPolicy();
    const domain = email.split('@')[1]?.toLowerCase();

    if (!domain) {
      return { valid: false, reason: 'Invalid email format' };
    }

    // Check blocked domains
    if (policy.blockedEmailDomains.includes(domain)) {
      return { valid: false, reason: 'Email domain is not allowed' };
    }

    // Check allowed domains (if specified)
    if (policy.allowedEmailDomains.length > 0 && !policy.allowedEmailDomains.includes(domain)) {
      return { valid: false, reason: 'Email domain is not in the allowed list' };
    }

    return { valid: true };
  }

  // Account Lockout Rules
  async getLockoutRules(): Promise<AccountLockoutRules> {
    const rules = await this.settingsService.getSetting('user.lockoutRules');
    
    return rules?.value || {
      enabled: true,
      maxFailedAttempts: 5,
      lockoutDurationMinutes: 30,
      resetFailedAttemptsAfterMinutes: 60,
      notifyAdminOnLockout: true,
      allowSelfUnlock: false,
      progressiveDelay: true
    };
  }

  async updateLockoutRules(rules: Partial<AccountLockoutRules>): Promise<AccountLockoutRules> {
    const currentRules = await this.getLockoutRules();
    const updatedRules = { ...currentRules, ...rules };
    
    await this.settingsService.updateSetting('user.lockoutRules', {
      value: updatedRules,
      description: 'Account lockout and security policies'
    });

    return updatedRules;
  }

  // Profile Field Configuration
  async getProfileFields(): Promise<ProfileFieldConfig[]> {
    const fields = await this.settingsService.getSetting('user.profileFields');
    
    return fields?.value || [
      { fieldName: 'firstName', required: true, visible: true, editable: true, fieldType: 'text', validation: { minLength: 1, maxLength: 50 } },
      { fieldName: 'lastName', required: true, visible: true, editable: true, fieldType: 'text', validation: { minLength: 1, maxLength: 50 } },
      { fieldName: 'email', required: true, visible: true, editable: true, fieldType: 'email' },
      { fieldName: 'phone', required: false, visible: true, editable: true, fieldType: 'phone' },
      { fieldName: 'department', required: false, visible: true, editable: true, fieldType: 'select', validation: { options: ['HR', 'IT', 'Finance', 'Operations'] } },
      { fieldName: 'position', required: false, visible: true, editable: true, fieldType: 'text' },
      { fieldName: 'startDate', required: false, visible: true, editable: true, fieldType: 'date' }
    ];
  }

  async updateProfileFields(fields: ProfileFieldConfig[]): Promise<ProfileFieldConfig[]> {
    await this.settingsService.updateSetting('user.profileFields', {
      value: fields,
      description: 'User profile field configuration and validation rules'
    });

    return fields;
  }

  async addProfileField(field: ProfileFieldConfig): Promise<ProfileFieldConfig[]> {
    const currentFields = await this.getProfileFields();
    const updatedFields = [...currentFields, field];
    return this.updateProfileFields(updatedFields);
  }

  async removeProfileField(fieldName: string): Promise<ProfileFieldConfig[]> {
    const currentFields = await this.getProfileFields();
    const updatedFields = currentFields.filter(field => field.fieldName !== fieldName);
    return this.updateProfileFields(updatedFields);
  }

  // Session Settings
  async getSessionSettings(): Promise<UserSessionSettings> {
    const settings = await this.settingsService.getSetting('user.sessionSettings');
    
    return settings?.value || {
      sessionTimeoutMinutes: 480, // 8 hours
      allowMultipleSessions: true,
      forceLogoutOnPasswordChange: true,
      rememberMeDays: 30,
      requireReauthForSensitive: true
    };
  }

  async updateSessionSettings(settings: Partial<UserSessionSettings>): Promise<UserSessionSettings> {
    const currentSettings = await this.getSessionSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    await this.settingsService.updateSetting('user.sessionSettings', {
      value: updatedSettings,
      description: 'User session and authentication settings'
    });

    return updatedSettings;
  }

  // Bulk Operations
  async getAllUserSettings(): Promise<{
    passwordPolicy: PasswordPolicy;
    registrationPolicy: RegistrationPolicy;
    lockoutRules: AccountLockoutRules;
    profileFields: ProfileFieldConfig[];
    sessionSettings: UserSessionSettings;
  }> {
    const [passwordPolicy, registrationPolicy, lockoutRules, profileFields, sessionSettings] = await Promise.all([
      this.getPasswordPolicy(),
      this.getRegistrationPolicy(),
      this.getLockoutRules(),
      this.getProfileFields(),
      this.getSessionSettings()
    ]);

    return {
      passwordPolicy,
      registrationPolicy,
      lockoutRules,
      profileFields,
      sessionSettings
    };
  }

  async resetToDefaults(): Promise<void> {
    const defaultKeys = [
      'user.passwordPolicy',
      'user.registrationPolicy',
      'user.lockoutRules',
      'user.profileFields',
      'user.sessionSettings'
    ];

    await this.settingsService.bulkDelete(defaultKeys);
    console.log('✅ User settings reset to defaults');
  }

  // User Management Utilities
  async isRegistrationAllowed(email?: string): Promise<{ allowed: boolean; reason?: string }> {
    const policy = await this.getRegistrationPolicy();
    
    if (!policy.allowSelfRegistration) {
      return { allowed: false, reason: 'Self-registration is disabled' };
    }

    if (email) {
      const emailValidation = await this.validateRegistrationEmail(email);
      if (!emailValidation.valid) {
        return { allowed: false, reason: emailValidation.reason };
      }
    }

    return { allowed: true };
  }

  async getPasswordStrengthRequirements(): Promise<string[]> {
    const policy = await this.getPasswordPolicy();
    const requirements: string[] = [];

    requirements.push(`At least ${policy.minLength} characters long`);
    if (policy.maxLength < 128) {
      requirements.push(`No more than ${policy.maxLength} characters`);
    }
    if (policy.requireUppercase) requirements.push('Contains uppercase letters');
    if (policy.requireLowercase) requirements.push('Contains lowercase letters');
    if (policy.requireNumbers) requirements.push('Contains numbers');
    if (policy.requireSymbols) requirements.push('Contains symbols');
    if (policy.preventCommonPasswords) requirements.push('Not a common password');
    if (policy.preventUserInfo) requirements.push('Does not contain personal information');

    return requirements;
  }
}