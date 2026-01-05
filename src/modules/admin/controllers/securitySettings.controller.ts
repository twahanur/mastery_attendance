import { Request, Response } from 'express';
import { validationService, PasswordRules, UsernameRules } from '../../../shared/services/validationService';
import { rateLimiterService } from '../../../shared/services/rateLimiterService';

export class SecuritySettingsController {
  /**
   * Get current password validation rules
   */
  async getPasswordRules(req: Request, res: Response): Promise<void> {
    try {
      const rules = await validationService.getValidationRules();
      
      res.status(200).json({
        success: true,
        data: rules.password
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch password validation rules',
        error: error.message
      });
    }
  }

  /**
   * Update password validation rules
   */
  async updatePasswordRules(req: Request, res: Response): Promise<void> {
    try {
      const rules: Partial<PasswordRules> = req.body;

      // Validate input
      if (rules.minLength !== undefined && (rules.minLength < 6 || rules.minLength > 32)) {
        res.status(400).json({
          success: false,
          message: 'Minimum password length must be between 6 and 32'
        });
        return;
      }

      await validationService.updatePasswordRules(rules);

      res.status(200).json({
        success: true,
        message: 'Password validation rules updated successfully',
        data: await validationService.getValidationRules()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update password validation rules',
        error: error.message
      });
    }
  }

  /**
   * Get current username validation rules
   */
  async getUsernameRules(req: Request, res: Response): Promise<void> {
    try {
      const rules = await validationService.getValidationRules();
      
      res.status(200).json({
        success: true,
        data: rules.username
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch username validation rules',
        error: error.message
      });
    }
  }

  /**
   * Update username validation rules
   */
  async updateUsernameRules(req: Request, res: Response): Promise<void> {
    try {
      const rules: Partial<UsernameRules> = req.body;

      // Validate input
      if (rules.minLength !== undefined && rules.minLength < 3) {
        res.status(400).json({
          success: false,
          message: 'Minimum username length must be at least 3'
        });
        return;
      }

      if (rules.maxLength !== undefined && rules.maxLength > 50) {
        res.status(400).json({
          success: false,
          message: 'Maximum username length cannot exceed 50'
        });
        return;
      }

      await validationService.updateUsernameRules(rules);

      res.status(200).json({
        success: true,
        message: 'Username validation rules updated successfully',
        data: await validationService.getValidationRules()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update username validation rules',
        error: error.message
      });
    }
  }

  /**
   * Get current rate limit configuration
   */
  async getRateLimitConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await rateLimiterService.getConfig();
      
      res.status(200).json({
        success: true,
        data: config
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rate limit configuration',
        error: error.message
      });
    }
  }

  /**
   * Update rate limit configuration
   */
  async updateRateLimitConfig(req: Request, res: Response): Promise<void> {
    try {
      const { enabled, maxRequests, windowMinutes } = req.body;
      const updateData: any = {};

      if (enabled !== undefined) {
        updateData.enabled = enabled;
      }

      if (maxRequests !== undefined) {
        if (maxRequests < 10 || maxRequests > 100000) {
          res.status(400).json({
            success: false,
            message: 'Max requests must be between 10 and 100000'
          });
          return;
        }
        updateData.maxRequests = maxRequests;
      }

      if (windowMinutes !== undefined) {
        if (windowMinutes < 1 || windowMinutes > 1440) {
          res.status(400).json({
            success: false,
            message: 'Window must be between 1 and 1440 minutes (24 hours)'
          });
          return;
        }
        updateData.windowMs = windowMinutes * 60 * 1000;
      }

      await rateLimiterService.updateConfig(updateData);

      res.status(200).json({
        success: true,
        message: 'Rate limit configuration updated successfully',
        data: await rateLimiterService.getConfig()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update rate limit configuration',
        error: error.message
      });
    }
  }

  /**
   * Get all security settings at once
   */
  async getAllSecuritySettings(req: Request, res: Response): Promise<void> {
    try {
      const [validationRules, rateLimitConfig] = await Promise.all([
        validationService.getValidationRules(),
        rateLimiterService.getConfig()
      ]);

      res.status(200).json({
        success: true,
        data: {
          passwordRules: validationRules.password,
          usernameRules: validationRules.username,
          rateLimiting: rateLimitConfig
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security settings',
        error: error.message
      });
    }
  }
}

export const securitySettingsController = new SecuritySettingsController();
