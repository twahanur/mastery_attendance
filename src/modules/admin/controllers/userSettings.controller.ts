import { Request, Response } from 'express';
import { UserSettingsService } from '../services/userSettings.service';

export class UserSettingsController {
  private userSettingsService: UserSettingsService;

  constructor() {
    this.userSettingsService = new UserSettingsService();
  }

  // Password Policy Management
  getPasswordPolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const policy = await this.userSettingsService.getPasswordPolicy();
      res.json({
        success: true,
        data: policy
      });
    } catch (error) {
      console.error('Error fetching password policy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch password policy'
      });
    }
  };

  updatePasswordPolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const policy = await this.userSettingsService.updatePasswordPolicy(req.body);
      res.json({
        success: true,
        data: policy,
        message: 'Password policy updated successfully'
      });
    } catch (error) {
      console.error('Error updating password policy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update password policy'
      });
    }
  };

  validatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { password, userInfo } = req.body;
      
      if (!password) {
        res.status(400).json({
          success: false,
          message: 'Password is required'
        });
        return;
      }

      const validation = await this.userSettingsService.validatePassword(password, userInfo);
      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Error validating password:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate password'
      });
    }
  };

  getPasswordRequirements = async (req: Request, res: Response): Promise<void> => {
    try {
      const requirements = await this.userSettingsService.getPasswordStrengthRequirements();
      res.json({
        success: true,
        data: requirements
      });
    } catch (error) {
      console.error('Error fetching password requirements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch password requirements'
      });
    }
  };

  // Registration Policy Management
  getRegistrationPolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const policy = await this.userSettingsService.getRegistrationPolicy();
      res.json({
        success: true,
        data: policy
      });
    } catch (error) {
      console.error('Error fetching registration policy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch registration policy'
      });
    }
  };

  updateRegistrationPolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const policy = await this.userSettingsService.updateRegistrationPolicy(req.body);
      res.json({
        success: true,
        data: policy,
        message: 'Registration policy updated successfully'
      });
    } catch (error) {
      console.error('Error updating registration policy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update registration policy'
      });
    }
  };

  validateRegistrationEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      const validation = await this.userSettingsService.validateRegistrationEmail(email);
      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Error validating registration email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate registration email'
      });
    }
  };

  checkRegistrationAllowed = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.query;
      const result = await this.userSettingsService.isRegistrationAllowed(email as string);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error checking registration status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check registration status'
      });
    }
  };

  // Account Lockout Rules
  getLockoutRules = async (req: Request, res: Response): Promise<void> => {
    try {
      const rules = await this.userSettingsService.getLockoutRules();
      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      console.error('Error fetching lockout rules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lockout rules'
      });
    }
  };

  updateLockoutRules = async (req: Request, res: Response): Promise<void> => {
    try {
      const rules = await this.userSettingsService.updateLockoutRules(req.body);
      res.json({
        success: true,
        data: rules,
        message: 'Lockout rules updated successfully'
      });
    } catch (error) {
      console.error('Error updating lockout rules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update lockout rules'
      });
    }
  };

  // Profile Field Configuration
  getProfileFields = async (req: Request, res: Response): Promise<void> => {
    try {
      const fields = await this.userSettingsService.getProfileFields();
      res.json({
        success: true,
        data: fields
      });
    } catch (error) {
      console.error('Error fetching profile fields:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile fields'
      });
    }
  };

  updateProfileFields = async (req: Request, res: Response): Promise<void> => {
    try {
      const fields = await this.userSettingsService.updateProfileFields(req.body);
      res.json({
        success: true,
        data: fields,
        message: 'Profile fields updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile fields:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile fields'
      });
    }
  };

  addProfileField = async (req: Request, res: Response): Promise<void> => {
    try {
      const fields = await this.userSettingsService.addProfileField(req.body);
      res.json({
        success: true,
        data: fields,
        message: 'Profile field added successfully'
      });
    } catch (error) {
      console.error('Error adding profile field:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add profile field'
      });
    }
  };

  removeProfileField = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fieldName } = req.params;
      const fields = await this.userSettingsService.removeProfileField(fieldName);
      res.json({
        success: true,
        data: fields,
        message: 'Profile field removed successfully'
      });
    } catch (error) {
      console.error('Error removing profile field:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove profile field'
      });
    }
  };

  // Session Settings
  getSessionSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const settings = await this.userSettingsService.getSessionSettings();
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error fetching session settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch session settings'
      });
    }
  };

  updateSessionSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const settings = await this.userSettingsService.updateSessionSettings(req.body);
      res.json({
        success: true,
        data: settings,
        message: 'Session settings updated successfully'
      });
    } catch (error) {
      console.error('Error updating session settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update session settings'
      });
    }
  };

  // Bulk Operations
  getAllUserSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const settings = await this.userSettingsService.getAllUserSettings();
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error fetching all user settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user settings'
      });
    }
  };

  resetToDefaults = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.userSettingsService.resetToDefaults();
      res.json({
        success: true,
        message: 'User settings reset to defaults successfully'
      });
    } catch (error) {
      console.error('Error resetting user settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset user settings'
      });
    }
  };
}