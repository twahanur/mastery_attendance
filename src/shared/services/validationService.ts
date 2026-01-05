import { prisma } from '../config/database';
import Joi from 'joi';

export interface PasswordRules {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
  specialCharacters: string;
}

export interface UsernameRules {
  minLength: number;
  maxLength: number;
  allowSpecial: boolean;
}

export interface ValidationRules {
  password: PasswordRules;
  username: UsernameRules;
}

export class ValidationService {
  private cachedRules: ValidationRules | null = null;
  private lastCacheFetch = 0;
  private cacheDuration = 60000; // 1 minute

  /**
   * Fetch validation rules from database
   */
  async getValidationRules(): Promise<ValidationRules> {
    const now = Date.now();

    // Use cache if available and not expired
    if (this.cachedRules && (now - this.lastCacheFetch) < this.cacheDuration) {
      return this.cachedRules;
    }

    try {
      const [
        minLength,
        requireUppercase,
        requireLowercase,
        requireNumber,
        requireSpecial,
        specialChars,
        usernameMin,
        usernameMax,
        usernameAllowSpecial
      ] = await Promise.all([
        prisma.adminSettings.findUnique({ where: { key: 'password_min_length' } }),
        prisma.adminSettings.findUnique({ where: { key: 'password_require_uppercase' } }),
        prisma.adminSettings.findUnique({ where: { key: 'password_require_lowercase' } }),
        prisma.adminSettings.findUnique({ where: { key: 'password_require_number' } }),
        prisma.adminSettings.findUnique({ where: { key: 'password_require_special' } }),
        prisma.adminSettings.findUnique({ where: { key: 'password_special_characters' } }),
        prisma.adminSettings.findUnique({ where: { key: 'username_min_length' } }),
        prisma.adminSettings.findUnique({ where: { key: 'username_max_length' } }),
        prisma.adminSettings.findUnique({ where: { key: 'username_allow_special' } })
      ]);

      this.cachedRules = {
        password: {
          minLength: minLength?.value as number ?? 8,
          requireUppercase: requireUppercase?.value as boolean ?? true,
          requireLowercase: requireLowercase?.value as boolean ?? true,
          requireNumber: requireNumber?.value as boolean ?? true,
          requireSpecial: requireSpecial?.value as boolean ?? true,
          specialCharacters: specialChars?.value as string ?? '!@#$%^&*()_+-=[]{}|;:,.<>?'
        },
        username: {
          minLength: usernameMin?.value as number ?? 3,
          maxLength: usernameMax?.value as number ?? 30,
          allowSpecial: usernameAllowSpecial?.value as boolean ?? false
        }
      };

      this.lastCacheFetch = now;
      return this.cachedRules;
    } catch (error) {
      console.error('Error fetching validation rules:', error);
      // Return defaults on error
      return {
        password: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumber: true,
          requireSpecial: true,
          specialCharacters: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        },
        username: {
          minLength: 3,
          maxLength: 30,
          allowSpecial: false
        }
      };
    }
  }

  /**
   * Validate password against dynamic rules
   */
  async validatePassword(password: string): Promise<{ valid: boolean; errors: string[] }> {
    const rules = await this.getValidationRules();
    const errors: string[] = [];

    if (password.length < rules.password.minLength) {
      errors.push(`Password must be at least ${rules.password.minLength} characters long`);
    }

    if (rules.password.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (rules.password.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (rules.password.requireNumber && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (rules.password.requireSpecial) {
      const specialCharsRegex = new RegExp(`[${rules.password.specialCharacters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
      if (!specialCharsRegex.test(password)) {
        errors.push(`Password must contain at least one special character (${rules.password.specialCharacters})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate username against dynamic rules
   */
  async validateUsername(username: string): Promise<{ valid: boolean; errors: string[] }> {
    const rules = await this.getValidationRules();
    const errors: string[] = [];

    if (username.length < rules.username.minLength) {
      errors.push(`Username must be at least ${rules.username.minLength} characters long`);
    }

    if (username.length > rules.username.maxLength) {
      errors.push(`Username cannot exceed ${rules.username.maxLength} characters`);
    }

    if (!rules.username.allowSpecial && !/^[a-zA-Z0-9]+$/.test(username)) {
      errors.push('Username can only contain letters and numbers');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate dynamic Joi schema for password validation
   */
  async getPasswordSchema(): Promise<Joi.StringSchema> {
    const rules = await this.getValidationRules();
    let schema = Joi.string().min(rules.password.minLength).required();

    const messages: any = {
      'string.min': `Password must be at least ${rules.password.minLength} characters long`,
      'any.required': 'Password is required'
    };

    // Add custom validation for complex rules
    schema = schema.custom((value, helpers) => {
      const errors: string[] = [];

      if (rules.password.requireUppercase && !/[A-Z]/.test(value)) {
        errors.push('Password must contain at least one uppercase letter');
      }

      if (rules.password.requireLowercase && !/[a-z]/.test(value)) {
        errors.push('Password must contain at least one lowercase letter');
      }

      if (rules.password.requireNumber && !/\d/.test(value)) {
        errors.push('Password must contain at least one number');
      }

      if (rules.password.requireSpecial) {
        const specialCharsRegex = new RegExp(`[${rules.password.specialCharacters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
        if (!specialCharsRegex.test(value)) {
          errors.push(`Password must contain at least one special character`);
        }
      }

      if (errors.length > 0) {
        return helpers.error('password.complexity', { errors });
      }

      return value;
    }, 'password complexity validation');

    return schema.messages({
      ...messages,
      'password.complexity': '{{#errors}}'
    });
  }

  /**
   * Generate dynamic Joi schema for username validation
   */
  async getUsernameSchema(): Promise<Joi.StringSchema> {
    const rules = await this.getValidationRules();
    
    let schema = Joi.string()
      .min(rules.username.minLength)
      .max(rules.username.maxLength)
      .required();

    if (!rules.username.allowSpecial) {
      schema = schema.alphanum();
    }

    return schema.messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': `Username must be at least ${rules.username.minLength} characters long`,
      'string.max': `Username cannot exceed ${rules.username.maxLength} characters`,
      'any.required': 'Username is required'
    });
  }

  /**
   * Clear cached rules (useful after updating settings)
   */
  clearCache(): void {
    this.cachedRules = null;
  }

  /**
   * Update password validation rules
   */
  async updatePasswordRules(rules: Partial<PasswordRules>): Promise<void> {
    const updates: Promise<any>[] = [];

    if (rules.minLength !== undefined) {
      updates.push(
        prisma.adminSettings.update({
          where: { key: 'password_min_length' },
          data: { value: rules.minLength }
        })
      );
    }

    if (rules.requireUppercase !== undefined) {
      updates.push(
        prisma.adminSettings.update({
          where: { key: 'password_require_uppercase' },
          data: { value: rules.requireUppercase }
        })
      );
    }

    if (rules.requireLowercase !== undefined) {
      updates.push(
        prisma.adminSettings.update({
          where: { key: 'password_require_lowercase' },
          data: { value: rules.requireLowercase }
        })
      );
    }

    if (rules.requireNumber !== undefined) {
      updates.push(
        prisma.adminSettings.update({
          where: { key: 'password_require_number' },
          data: { value: rules.requireNumber }
        })
      );
    }

    if (rules.requireSpecial !== undefined) {
      updates.push(
        prisma.adminSettings.update({
          where: { key: 'password_require_special' },
          data: { value: rules.requireSpecial }
        })
      );
    }

    if (rules.specialCharacters !== undefined) {
      updates.push(
        prisma.adminSettings.update({
          where: { key: 'password_special_characters' },
          data: { value: rules.specialCharacters }
        })
      );
    }

    await Promise.all(updates);
    this.clearCache();
  }

  /**
   * Update username validation rules
   */
  async updateUsernameRules(rules: Partial<UsernameRules>): Promise<void> {
    const updates: Promise<any>[] = [];

    if (rules.minLength !== undefined) {
      updates.push(
        prisma.adminSettings.update({
          where: { key: 'username_min_length' },
          data: { value: rules.minLength }
        })
      );
    }

    if (rules.maxLength !== undefined) {
      updates.push(
        prisma.adminSettings.update({
          where: { key: 'username_max_length' },
          data: { value: rules.maxLength }
        })
      );
    }

    if (rules.allowSpecial !== undefined) {
      updates.push(
        prisma.adminSettings.update({
          where: { key: 'username_allow_special' },
          data: { value: rules.allowSpecial }
        })
      );
    }

    await Promise.all(updates);
    this.clearCache();
  }
}

// Export singleton instance
export const validationService = new ValidationService();
