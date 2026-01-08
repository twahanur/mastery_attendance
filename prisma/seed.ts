import { PrismaClient, Role, Mood, Shift } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.attendance.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.adminSettings.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // Seed Admin Settings first
  console.log('⚙️  Creating admin settings...');
  
  // Company settings
  const companySettings = [
    {
      key: 'company_name',
      value: 'TechCorp Solutions Ltd.',
      category: 'company',
      description: 'Company name displayed throughout the application'
    },
    {
      key: 'company_email',
      value: 'contact@techcorp.com',
      category: 'company',
      description: 'Main company email address'
    },
    {
      key: 'support_email',
      value: 'support@techcorp.com',
      category: 'company',
      description: 'Support email for user inquiries'
    },
    {
      key: 'login_url',
      value: 'http://localhost:3000/login',
      category: 'company',
      description: 'Login page URL for the application'
    },
    {
      key: 'company_phone',
      value: '+880-1700-000000',
      category: 'company',
      description: 'Company phone number'
    },
    {
      key: 'company_address',
      value: 'House #123, Road #456, Gulshan-2, Dhaka-1212, Bangladesh',
      category: 'company',
      description: 'Company physical address'
    },
    {
      key: 'company_website',
      value: 'https://www.techcorp.com',
      category: 'company',
      description: 'Company website URL'
    },
    {
      key: 'company_logo',
      value: '',
      category: 'company',
      description: 'Company logo URL or base64 image'
    },
    {
      key: 'timezone',
      value: 'Asia/Dhaka',
      category: 'company',
      description: 'Company timezone for all date/time operations'
    },
    {
      key: 'working_hours',
      value: {
        startTime: '09:00',
        endTime: '18:00',
        breakDuration: 60,
        gracePeriod: 15
      },
      category: 'company',
      description: 'Standard working hours and break configuration'
    },
    {
      key: 'company_holidays',
      value: ['2026-02-21', '2026-03-26', '2026-12-16', '2026-12-25'],
      category: 'company',
      description: 'List of company holidays (YYYY-MM-DD format)'
    },
    {
      key: 'holiday_entries',
      value: {
        '2026-02-21': 'International Mother Language Day',
        '2026-03-26': 'Independence Day',
        '2026-12-16': 'Victory Day',
        '2026-12-25': 'Christmas'
      },
      category: 'company',
      description: 'Holiday names keyed by date'
    }
  ];

  // Working hours and schedule settings (legacy individual keys for backward compatibility)
  const workingHoursSettings = [
    {
      key: 'working_hours_start',
      value: '09:00',
      category: 'attendance',
      description: 'Standard working hours start time'
    },
    {
      key: 'working_hours_end',
      value: '18:00',
      category: 'attendance',
      description: 'Standard working hours end time'
    },
    {
      key: 'break_duration',
      value: 60,
      category: 'attendance',
      description: 'Break duration in minutes'
    },
    {
      key: 'grace_period',
      value: 15,
      category: 'attendance',
      description: 'Grace period for late arrival in minutes'
    },
    {
      key: 'working_days',
      value: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      category: 'attendance',
      description: 'Standard working days of the week'
    },
    {
      key: 'overtime_rate',
      value: 1.5,
      category: 'attendance',
      description: 'Overtime pay rate multiplier'
    },
    {
      key: 'minimum_working_hours',
      value: 8,
      category: 'attendance',
      description: 'Minimum required working hours per day'
    },
    {
      key: 'late_threshold_minutes',
      value: 15,
      category: 'attendance',
      description: 'Minutes after which an employee is considered late'
    },
    {
      key: 'early_leave_threshold_minutes',
      value: 30,
      category: 'attendance',
      description: 'Minutes before end time that counts as early leave'
    }
  ];

  // Email/SMTP settings
  const emailSettings = [
    {
      key: 'smtp_host',
      value: 'smtp.gmail.com',
      category: 'email',
      description: 'SMTP server host'
    },
    {
      key: 'smtp_port',
      value: 587,
      category: 'email',
      description: 'SMTP server port'
    },
    {
      key: 'smtp_secure',
      value: false,
      category: 'email',
      description: 'Use secure connection for SMTP'
    },
    {
      key: 'smtp_user',
      value: 'noreply@techcorp.com',
      category: 'email',
      description: 'SMTP authentication username'
    },
    {
      key: 'smtp_password',
      value: 'your-app-password-here',
      category: 'email',
      description: 'SMTP authentication password'
    },
    {
      key: 'email_from_address',
      value: 'noreply@techcorp.com',
      category: 'email',
      description: 'From email address for outgoing emails'
    },
    {
      key: 'email_from_name',
      value: 'TechCorp Attendance System',
      category: 'email',
      description: 'From name for outgoing emails'
    },
    {
      key: 'admin_emails',
      value: ['admin@techcorp.com', 'hr@techcorp.com'],
      category: 'email',
      description: 'Admin email addresses for notifications'
    },
    {
      key: 'daily_reminder_time',
      value: '13:00',
      category: 'email',
      description: 'Time to send daily attendance reminders'
    },
    {
      key: 'end_of_day_report_time',
      value: '18:30',
      category: 'email',
      description: 'Time to send end of day reports'
    },
    {
      key: 'weekly_report_day',
      value: 1,
      category: 'email',
      description: 'Day of week to send weekly reports (1=Monday)'
    },
    {
      key: 'weekly_report_time',
      value: '09:00',
      category: 'email',
      description: 'Time to send weekly reports'
    },
    {
      key: 'enable_email_notifications',
      value: true,
      category: 'email',
      description: 'Enable email notifications system wide'
    },
    {
      key: 'enable_daily_reminders',
      value: true,
      category: 'email',
      description: 'Enable daily attendance reminder emails'
    },
    {
      key: 'enable_weekly_reports',
      value: true,
      category: 'email',
      description: 'Enable weekly attendance report emails'
    },
    // SMTP config object used by EmailSettingsService in settings module
    {
      key: 'smtp_config',
      value: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || 'noreply@techcorp.com',
        pass: process.env.SMTP_PASS || 'your-app-password-here',
        fromEmail: process.env.EMAIL_FROM || 'noreply@techcorp.com',
        fromName: 'TechCorp Attendance System'
      },
      category: 'email',
      description: 'Complete SMTP configuration object for email service'
    }
  ];

  // System settings (excluding password settings to avoid duplicates)
  const systemSettings = [
    {
      key: 'session_timeout',
      value: 8,
      category: 'system',
      description: 'User session timeout in hours'
    },
    {
      key: 'max_login_attempts',
      value: 5,
      category: 'system',
      description: 'Maximum login attempts before account lockout'
    },
    {
      key: 'lockout_duration',
      value: 30,
      category: 'system',
      description: 'Account lockout duration in minutes'
    },
    {
      key: 'backup_retention_days',
      value: 30,
      category: 'system',
      description: 'Number of days to retain backup files'
    },
    {
      key: 'enable_api_rate_limiting',
      value: true,
      category: 'security',
      description: 'Enable or disable API rate limiting'
    },
    {
      key: 'api_rate_limit_max_requests',
      value: 10000,
      category: 'security',
      description: 'Maximum API requests allowed per window'
    },
    {
      key: 'api_rate_limit_window_minutes',
      value: 15,
      category: 'security',
      description: 'Time window for rate limiting in minutes'
    }
  ];

  // Password validation settings (keys must match validationService expectations)
  const passwordSettings = [
    {
      key: 'password_min_length',
      value: 8,
      category: 'security',
      description: 'Minimum password length required'
    },
    {
      key: 'password_require_uppercase',
      value: true,
      category: 'security',
      description: 'Require at least one uppercase letter'
    },
    {
      key: 'password_require_lowercase',
      value: true,
      category: 'security',
      description: 'Require at least one lowercase letter'
    },
    {
      key: 'password_require_number',
      value: true,
      category: 'security',
      description: 'Require at least one number'
    },
    {
      key: 'password_require_special',
      value: true,
      category: 'security',
      description: 'Require at least one special character'
    },
    {
      key: 'password_special_characters',
      value: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      category: 'security',
      description: 'Allowed special characters for passwords'
    },
    {
      key: 'username_min_length',
      value: 3,
      category: 'security',
      description: 'Minimum username length'
    },
    {
      key: 'username_max_length',
      value: 30,
      category: 'security',
      description: 'Maximum username length'
    },
    {
      key: 'username_allow_special',
      value: false,
      category: 'security',
      description: 'Allow special characters in usernames'
    }
  ];

  // Report settings
  const reportSettings = [
    {
      key: 'default_report_format',
      value: 'PDF',
      category: 'reports',
      description: 'Default format for generated reports'
    },
    {
      key: 'include_attendance_charts',
      value: true,
      category: 'reports',
      description: 'Include charts in attendance reports'
    },
    {
      key: 'report_date_format',
      value: 'DD/MM/YYYY',
      category: 'reports',
      description: 'Date format used in reports'
    },
    {
      key: 'auto_generate_monthly_reports',
      value: true,
      category: 'reports',
      description: 'Automatically generate monthly reports'
    },
    {
      key: 'monthly_report_generation_day',
      value: 1,
      category: 'reports',
      description: 'Day of month to generate monthly reports'
    }
  ];

  // User management settings (used by UserSettingsService)
  const userManagementSettings = [
    {
      key: 'user.passwordPolicy',
      value: {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        preventCommonPasswords: true,
        preventUserInfo: true,
        expirationDays: 90,
        historyCount: 5
      },
      category: 'user',
      description: 'Password security requirements and policies'
    },
    {
      key: 'user.registrationPolicy',
      value: {
        allowSelfRegistration: false,
        requireEmailVerification: true,
        requireAdminApproval: true,
        allowedEmailDomains: [],
        blockedEmailDomains: [],
        defaultRole: 'EMPLOYEE',
        autoActivateAccounts: false,
        requireInvitation: true
      },
      category: 'user',
      description: 'User registration and account creation policies'
    },
    {
      key: 'user.lockoutRules',
      value: {
        enabled: true,
        maxFailedAttempts: 5,
        lockoutDurationMinutes: 30,
        resetFailedAttemptsAfterMinutes: 60,
        notifyAdminOnLockout: true,
        allowSelfUnlock: false,
        progressiveDelay: true
      },
      category: 'user',
      description: 'Account lockout and security policies'
    },
    {
      key: 'user.sessionSettings',
      value: {
        sessionTimeoutMinutes: 480,
        allowMultipleSessions: true,
        forceLogoutOnPasswordChange: true,
        rememberMeDays: 30,
        requireReauthForSensitive: true
      },
      category: 'user',
      description: 'User session and authentication settings'
    },
    {
      key: 'user.profileFields',
      value: [
        { fieldName: 'firstName', required: true, visible: true, editable: true, fieldType: 'text', validation: { minLength: 1, maxLength: 50 } },
        { fieldName: 'lastName', required: true, visible: true, editable: true, fieldType: 'text', validation: { minLength: 1, maxLength: 50 } },
        { fieldName: 'email', required: true, visible: true, editable: true, fieldType: 'email' },
        { fieldName: 'phone', required: false, visible: true, editable: true, fieldType: 'phone' },
        { fieldName: 'department', required: false, visible: true, editable: true, fieldType: 'select', validation: { options: ['HR', 'IT', 'Finance', 'Operations', 'Administration', 'Engineering'] } },
        { fieldName: 'position', required: false, visible: true, editable: true, fieldType: 'text' },
        { fieldName: 'startDate', required: false, visible: true, editable: true, fieldType: 'date' }
      ],
      category: 'user',
      description: 'User profile field configuration and validation rules'
    }
  ];

  // Email notification settings (used by EmailSettingsService)
  const emailNotificationSettings = [
    {
      key: 'email.smtp',
      value: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.EMAIL_FROM || 'noreply@attendance.com'
      },
      category: 'email',
      description: 'SMTP server configuration for email sending'
    },
    {
      key: 'email.notifications',
      value: {
        timezone: 'Asia/Dhaka',
        dailyReminder: {
          enabled: true,
          cronExpression: '0 13 * * 1-5'
        },
        weeklyReport: {
          enabled: true,
          cronExpression: '0 9 * * 1'
        },
        endOfDay: {
          enabled: true,
          cronExpression: '0 18 * * 1-5'
        }
      },
      category: 'email',
      description: 'Email notification scheduling configuration'
    },
    // Email templates used by EmailSettingsService
    {
      key: 'email.templates.attendanceReminder',
      value: {
        subject: '⏰ Attendance Reminder - {{date}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;"><h1 style="color: white; margin: 0;">{{companyName}}</h1></div><div style="padding: 30px; background: #f9f9f9;"><h2 style="color: #333;">Hello {{employeeName}}! 👋</h2><p style="color: #666; font-size: 16px; line-height: 1.6;">This is a friendly reminder that you haven\'t marked your attendance for today (<strong>{{date}}</strong>).</p><p style="color: #666; font-size: 16px; line-height: 1.6;">Please mark your attendance as soon as possible to maintain accurate records.</p><div style="text-align: center; margin: 30px 0;"><a href="{{loginUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Mark Attendance Now</a></div><p style="color: #999; font-size: 14px;">Current time: {{time}}</p></div><div style="background: #333; padding: 20px; text-align: center;"><p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p></div></div>'
      },
      category: 'email',
      description: 'Email template for daily attendance reminders'
    },
    {
      key: 'email.templates.weeklyReport',
      value: {
        subject: '📊 Weekly Attendance Report - {{weekStart}} to {{weekEnd}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; text-align: center;"><h1 style="color: white; margin: 0;">{{companyName}}</h1><p style="color: white; margin: 5px 0 0 0;">Weekly Attendance Report</p></div><div style="padding: 30px; background: #f9f9f9;"><h2 style="color: #333;">Week: {{weekStart}} - {{weekEnd}}</h2><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;"><div style="background: #4CAF50; padding: 20px; border-radius: 10px; text-align: center;"><h3 style="color: white; margin: 0;">{{totalPresent}}</h3><p style="color: white; margin: 5px 0 0 0;">Total Present</p></div><div style="background: #f44336; padding: 20px; border-radius: 10px; text-align: center;"><h3 style="color: white; margin: 0;">{{totalAbsent}}</h3><p style="color: white; margin: 5px 0 0 0;">Total Absent</p></div><div style="background: #ff9800; padding: 20px; border-radius: 10px; text-align: center;"><h3 style="color: white; margin: 0;">{{totalLate}}</h3><p style="color: white; margin: 5px 0 0 0;">Late Arrivals</p></div><div style="background: #2196F3; padding: 20px; border-radius: 10px; text-align: center;"><h3 style="color: white; margin: 0;">{{attendanceRate}}%</h3><p style="color: white; margin: 5px 0 0 0;">Attendance Rate</p></div></div><div style="background: white; padding: 20px; border-radius: 10px;">{{reportDetails}}</div></div><div style="background: #333; padding: 20px; text-align: center;"><p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p></div></div>'
      },
      category: 'email',
      description: 'Email template for weekly attendance reports'
    },
    {
      key: 'email.templates.passwordReset',
      value: {
        subject: '🔐 Password Reset Request - {{companyName}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; text-align: center;"><h1 style="color: white; margin: 0;">Password Reset</h1></div><div style="padding: 30px; background: #f9f9f9;"><h2 style="color: #333;">Hello {{employeeName}},</h2><p style="color: #666; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password.</p><div style="text-align: center; margin: 30px 0;"><a href="{{resetLink}}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a></div><p style="color: #666; font-size: 14px;">This link will expire in <strong>{{expiryTime}}</strong>.</p><p style="color: #999; font-size: 12px;">If you didn\'t request this, please ignore this email or contact support if you have concerns.</p><div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;"><p style="color: #856404; margin: 0; font-size: 12px;"><strong>Reset Token:</strong> {{resetToken}}</p></div></div><div style="background: #333; padding: 20px; text-align: center;"><p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p></div></div>'
      },
      category: 'email',
      description: 'Email template for password reset requests'
    },
    {
      key: 'email.templates.welcome',
      value: {
        subject: '🎉 Welcome to {{companyName}}!',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;"><h1 style="color: white; margin: 0;">Welcome to {{companyName}}! 🎉</h1></div><div style="padding: 30px; background: #f9f9f9;"><h2 style="color: #333;">Hello {{employeeName}}! 👋</h2><p style="color: #666; font-size: 16px; line-height: 1.6;">We\'re excited to have you on board! Your account has been created successfully.</p><div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;"><h3 style="color: #667eea; margin-top: 0;">Your Login Details</h3><p><strong>Email:</strong> {{email}}</p><p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px;">{{temporaryPassword}}</code></p></div><p style="color: #f44336; font-size: 14px;">⚠️ Please change your password after your first login.</p><div style="text-align: center; margin: 30px 0;"><a href="{{loginUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a></div></div><div style="background: #333; padding: 20px; text-align: center;"><p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p></div></div>'
      },
      category: 'email',
      description: 'Email template for new user welcome messages'
    },
    {
      key: 'email.templates.endOfDayReport',
      value: {
        subject: '🌅 End of Day Summary - {{date}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 20px; text-align: center;"><h1 style="color: white; margin: 0;">{{companyName}}</h1><p style="color: white; margin: 5px 0 0 0;">End of Day Summary</p></div><div style="padding: 30px; background: #f9f9f9;"><h2 style="color: #333;">Today\'s Summary - {{date}}</h2><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;"><div style="background: #4CAF50; padding: 20px; border-radius: 10px; text-align: center;"><h3 style="color: white; margin: 0;">{{totalPresent}}</h3><p style="color: white; margin: 5px 0 0 0;">Present</p></div><div style="background: #f44336; padding: 20px; border-radius: 10px; text-align: center;"><h3 style="color: white; margin: 0;">{{totalAbsent}}</h3><p style="color: white; margin: 5px 0 0 0;">Absent</p></div><div style="background: #ff9800; padding: 20px; border-radius: 10px; text-align: center;"><h3 style="color: white; margin: 0;">{{totalLate}}</h3><p style="color: white; margin: 5px 0 0 0;">Late</p></div><div style="background: #9C27B0; padding: 20px; border-radius: 10px; text-align: center;"><h3 style="color: white; margin: 0;">{{totalEarlyLeave}}</h3><p style="color: white; margin: 5px 0 0 0;">Early Leave</p></div></div><div style="background: white; padding: 20px; border-radius: 10px;"><h3 style="color: #333; margin-top: 0;">Department Breakdown</h3>{{departmentBreakdown}}</div></div><div style="background: #333; padding: 20px; text-align: center;"><p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p></div></div>'
      },
      category: 'email',
      description: 'Email template for end of day attendance reports'
    },
    // Additional email templates for full dynamic email support
    {
      key: 'email.templates.absenteeReport',
      value: {
        subject: '📋 Daily Absentee Report - {{date}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; text-align: center;"><h1 style="color: white; margin: 0;">{{companyName}}</h1><p style="color: white; margin: 5px 0 0 0;">Daily Absentee Report</p></div><div style="padding: 30px; background: #f9f9f9;"><h2 style="color: #333;">Attendance Summary for {{date}}</h2><div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;"><h3 style="color: #f5576c; margin-top: 0;">Total Absent: {{totalAbsent}}</h3>{{absenteeList}}</div><div style="background: white; padding: 20px; border-radius: 10px;"><h3 style="color: #333; margin-top: 0;">Department Summary</h3>{{departmentSummary}}</div></div><div style="background: #333; padding: 20px; text-align: center;"><p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p></div></div>'
      },
      category: 'email',
      description: 'Email template for daily absentee reports to admin'
    },
    {
      key: 'email.templates.monthlyReport',
      value: {
        subject: '📅 Monthly Attendance Report - {{month}} {{year}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 20px; text-align: center;"><h1 style="color: #333; margin: 0;">{{companyName}}</h1><p style="color: #333; margin: 5px 0 0 0;">Monthly Attendance Report</p></div><div style="padding: 30px; background: #f9f9f9;"><h2 style="color: #333;">{{month}} {{year}} Summary</h2><div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;"><p><strong>Total Working Days:</strong> {{totalWorkingDays}}</p><p><strong>Average Attendance:</strong> {{averageAttendance}}%</p></div><div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;"><h3 style="margin-top: 0;">🏆 Top Performers</h3>{{topPerformers}}</div><div style="background: white; padding: 20px; border-radius: 10px;">{{reportDetails}}</div></div><div style="background: #333; padding: 20px; text-align: center;"><p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p></div></div>'
      },
      category: 'email',
      description: 'Email template for monthly attendance reports'
    },
    {
      key: 'email.templates.passwordChanged',
      value: {
        subject: '✅ Password Changed Successfully - {{companyName}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 20px; text-align: center;"><h1 style="color: white; margin: 0;">Password Changed ✅</h1></div><div style="padding: 30px; background: #f9f9f9;"><h2 style="color: #333;">Hello {{employeeName}},</h2><p style="color: #666; font-size: 16px; line-height: 1.6;">Your password has been successfully changed on <strong>{{changeTime}}</strong>.</p><div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;"><p style="color: #155724; margin: 0;">✅ Your account is now secured with the new password.</p></div><p style="color: #666; font-size: 14px;">If you did not make this change, please contact our support team immediately at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p></div><div style="background: #333; padding: 20px; text-align: center;"><p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p></div></div>'
      },
      category: 'email',
      description: 'Email template for password change confirmation'
    },
    {
      key: 'email.templates.accountLocked',
      value: {
        subject: '🔒 Account Locked - {{companyName}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%); padding: 20px; text-align: center;"><h1 style="color: white; margin: 0;">Account Locked 🔒</h1></div><div style="padding: 30px; background: #f9f9f9;"><h2 style="color: #333;">Hello {{employeeName}},</h2><p style="color: #666; font-size: 16px; line-height: 1.6;">Your account has been temporarily locked due to multiple failed login attempts.</p><div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;"><p style="color: #721c24; margin: 0;"><strong>Locked at:</strong> {{lockTime}}<br><strong>Unlock time:</strong> {{unlockTime}}</p></div><p style="color: #666; font-size: 14px;">If you need immediate access, please contact our support team at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p></div><div style="background: #333; padding: 20px; text-align: center;"><p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p></div></div>'
      },
      category: 'email',
      description: 'Email template for account lockout notification'
    },
    {
      key: 'email.templates.leaveRequest',
      value: {
        subject: '📝 Leave Request from {{employeeName}} - {{companyName}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;"><h1 style="color: white; margin: 0;">New Leave Request</h1></div><div style="padding: 30px; background: #f9f9f9;"><h2 style="color: #333;">Leave Request Details</h2><div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;"><p><strong>Employee:</strong> {{employeeName}}</p><p><strong>Leave Type:</strong> {{leaveType}}</p><p><strong>From:</strong> {{startDate}}</p><p><strong>To:</strong> {{endDate}}</p><p><strong>Reason:</strong> {{reason}}</p></div><div style="text-align: center; margin: 30px 0;"><a href="{{approvalUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Request</a></div></div><div style="background: #333; padding: 20px; text-align: center;"><p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p></div></div>'
      },
      category: 'email',
      description: 'Email template for leave request notifications'
    },
    {
      key: 'email.templates.leaveApproved',
      value: {
        subject: '✅ Leave Approved - {{companyName}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 20px; text-align: center;"><h1 style="color: white; margin: 0;">Leave Approved ✅</h1></div><div style="padding: 30px; background: #f9f9f9;"><h2 style="color: #333;">Good news, {{employeeName}}!</h2><p style="color: #666; font-size: 16px; line-height: 1.6;">Your leave request has been approved.</p><div style="background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0;"><p><strong>Leave Type:</strong> {{leaveType}}</p><p><strong>From:</strong> {{startDate}}</p><p><strong>To:</strong> {{endDate}}</p><p><strong>Approved by:</strong> {{approvedBy}}</p></div></div><div style="background: #333; padding: 20px; text-align: center;"><p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p></div></div>'
      },
      category: 'email',
      description: 'Email template for leave approval notification'
    },
    {
      key: 'email.templates.leaveRejected',
      value: {
        subject: '❌ Leave Request Rejected - {{companyName}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%); padding: 20px; text-align: center;"><h1 style="color: white; margin: 0;">Leave Request Rejected</h1></div><div style="padding: 30px; background: #f9f9f9;"><h2 style="color: #333;">Hello {{employeeName}},</h2><p style="color: #666; font-size: 16px; line-height: 1.6;">Unfortunately, your leave request has been rejected.</p><div style="background: #f8d7da; padding: 20px; border-radius: 10px; margin: 20px 0;"><p><strong>Leave Type:</strong> {{leaveType}}</p><p><strong>From:</strong> {{startDate}}</p><p><strong>To:</strong> {{endDate}}</p><p><strong>Rejected by:</strong> {{rejectedBy}}</p><p><strong>Reason:</strong> {{rejectionReason}}</p></div></div><div style="background: #333; padding: 20px; text-align: center;"><p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p></div></div>'
      },
      category: 'email',
      description: 'Email template for leave rejection notification'
    }
  ];

  // Combine all settings
  const allSettings = [
    ...companySettings,
    ...workingHoursSettings,
    ...emailSettings,
    ...systemSettings,
    ...passwordSettings,
    ...reportSettings,
    ...userManagementSettings,
    ...emailNotificationSettings
  ];

  // Create admin settings (using upsert to avoid duplicates)
  for (const setting of allSettings) {
    await prisma.adminSettings.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        category: setting.category,
        description: setting.description,
        isActive: true
      },
      create: {
        key: setting.key,
        value: setting.value,
        category: setting.category,
        description: setting.description,
        isActive: true
      }
    });
  }

  console.log(`✅ Created ${allSettings.length} admin settings`);

  // Create Admin User
  console.log('👑 Creating admin user...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@company.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN,
      isActive: true,
      employeeId: 'ADMIN001',
      section: 'Administration',
      department: 'Management'
    }
  });

  // Realistic names for employees
  const employeeNames = [
    { firstName: 'Ahmed', lastName: 'Rahman' },
    { firstName: 'Fatima', lastName: 'Khan' },
    { firstName: 'Mohammad', lastName: 'Hassan' },
    { firstName: 'Ayesha', lastName: 'Ahmed' },
    { firstName: 'Omar', lastName: 'Ali' },
    { firstName: 'Zara', lastName: 'Sheikh' },
    { firstName: 'Hassan', lastName: 'Mahmud' },
    { firstName: 'Nadia', lastName: 'Sultana' },
    { firstName: 'Imran', lastName: 'Hossain' },
    { firstName: 'Sadia', lastName: 'Begum' },
    { firstName: 'Karim', lastName: 'Uddin' },
    { firstName: 'Rashida', lastName: 'Khatun' },
    { firstName: 'Tariq', lastName: 'Islam' },
    { firstName: 'Mariam', lastName: 'Akter' },
    { firstName: 'Nasir', lastName: 'Ahmed' },
    { firstName: 'Samira', lastName: 'Rahman' },
    { firstName: 'Fahad', lastName: 'Khan' },
    { firstName: 'Ruma', lastName: 'Begum' },
    { firstName: 'Salim', lastName: 'Miah' },
    { firstName: 'Sabina', lastName: 'Yasmin' },
    { firstName: 'Rafiq', lastName: 'Uddin' },
    { firstName: 'Nasreen', lastName: 'Sultana' },
    { firstName: 'Jahangir', lastName: 'Alam' },
    { firstName: 'Shireen', lastName: 'Akhter' },
    { firstName: 'Mizanur', lastName: 'Rahman' },
    { firstName: 'Roksana', lastName: 'Begum' },
    { firstName: 'Abdur', lastName: 'Razzaq' },
    { firstName: 'Nasima', lastName: 'Khatun' },
    { firstName: 'Kamrul', lastName: 'Hasan' },
    { firstName: 'Shahida', lastName: 'Begum' },
    { firstName: 'Mostafa', lastName: 'Karim' },
    { firstName: 'Rehana', lastName: 'Parvin' },
    { firstName: 'Shamsul', lastName: 'Haque' },
    { firstName: 'Maksuda', lastName: 'Begum' },
    { firstName: 'Aminul', lastName: 'Islam' }
  ];

  const departments = [
    'IT', 'HR', 'Finance', 'Marketing', 'Operations', 
    'Sales', 'Customer Service', 'Quality Assurance', 'R&D'
  ];

  const sections = [
    'Development', 'Testing', 'Support', 'Analysis', 'Design',
    'Recruitment', 'Training', 'Payroll', 'Administration',
    'Accounting', 'Audit', 'Planning', 'Digital Marketing',
    'Content', 'SEO', 'Operations Management', 'Logistics',
    'Inside Sales', 'Field Sales', 'Account Management',
    'Technical Support', 'Customer Relations', 'Manual Testing',
    'Automation Testing', 'Performance Testing', 'Research',
    'Product Development'
  ];

  // Create employees
  console.log('👥 Creating employees...');
  const employees = [];
  
  for (let i = 0; i < employeeNames.length; i++) {
    const employeeNumber = String(i + 1).padStart(3, '0');
    const employee = await prisma.user.create({
      data: {
        email: `user${i + 1}@company.com`,
        username: `user${i + 1}`,
        password: hashedPassword,
        firstName: employeeNames[i].firstName,
        lastName: employeeNames[i].lastName,
        role: Role.EMPLOYEE,
        isActive: true,
        employeeId: `EMP${employeeNumber}`,
        section: sections[Math.floor(Math.random() * sections.length)],
        department: departments[Math.floor(Math.random() * departments.length)]
      }
    });
    employees.push(employee);
  }

  console.log(`✅ Created ${employees.length} employees`);

  // Generate attendance data from July 2025 to January 2026
  console.log('📅 Generating attendance data...');
  
  const moods = [
    Mood.EXCELLENT,
    Mood.GOOD, 
    Mood.AVERAGE,
    Mood.POOR,
    Mood.TERRIBLE
  ];

  const shifts = [
    Shift.MORNING,
    Shift.AFTERNOON,
    Shift.EVENING
  ];

  // Generate dates from July 1, 2025 to January 7, 2026 (weekdays only)
  const startDate = new Date('2025-07-01');
  const endDate = new Date('2026-01-07');
  const attendanceData = [];

  for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
    // Skip weekends
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      continue;
    }

    // Skip holidays (based on common Bangladesh holidays)
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();
    
    // Skip common holidays
    if (
      (year === 2025 && month === 8 && day === 15) ||  // Independence Day (India) / National Mourning Day
      (year === 2025 && month === 12 && day === 16) || // Victory Day
      (year === 2025 && month === 12 && day === 25) || // Christmas
      (year === 2026 && month === 1 && day === 1)      // New Year's Day
    ) {
      continue;
    }

    for (const employee of employees) {
      // 85% attendance rate (some employees will be absent)
      if (Math.random() < 0.85) {
        const checkInTime = new Date(currentDate);
        checkInTime.setHours(9, Math.floor(Math.random() * 60)); // 9:00-9:59 AM
        
        const checkOutTime = new Date(checkInTime);
        checkOutTime.setHours(checkInTime.getHours() + 8 + Math.floor(Math.random() * 2)); // 8-9 hours later
        
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const shift = shifts[Math.floor(Math.random() * shifts.length)];
        
        // Weight moods realistically
        let selectedMood = mood;
        const moodRandom = Math.random();
        if (moodRandom < 0.3) selectedMood = Mood.EXCELLENT;
        else if (moodRandom < 0.6) selectedMood = Mood.GOOD;
        else if (moodRandom < 0.8) selectedMood = Mood.AVERAGE;
        else if (moodRandom < 0.95) selectedMood = Mood.POOR;
        else selectedMood = Mood.TERRIBLE;

        attendanceData.push({
          userId: employee.id,
          date: new Date(currentDate),
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeId: employee.employeeId || `EMP${String(employees.indexOf(employee) + 1).padStart(3, '0')}`,
          section: employee.section || 'General',
          shift: shift,
          mood: selectedMood,
          checkInTime,
          checkOutTime: Math.random() < 0.9 ? checkOutTime : null,
          notes: Math.random() < 0.1 ? 'Regular work day' : null
        });
      }
    }
  }

  // Batch insert attendance records
  console.log('💾 Inserting attendance records...');
  const batchSize = 1000;
  for (let i = 0; i < attendanceData.length; i += batchSize) {
    const batch = attendanceData.slice(i, i + batchSize);
    await prisma.attendance.createMany({
      data: batch,
      skipDuplicates: true
    });
    console.log(`Inserted ${Math.min(i + batchSize, attendanceData.length)}/${attendanceData.length} attendance records`);
  }

  // Create some password reset tokens for testing
  console.log('🔑 Creating sample password reset tokens...');
  await prisma.passwordReset.create({
    data: {
      userId: employees[0].id, // First employee
      token: 'sample-reset-token-123',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    }
  });

  // Summary
  const totalUsers = await prisma.user.count();
  const totalAttendance = await prisma.attendance.count();
  const totalSettings = await prisma.adminSettings.count();
  const totalWorkingDays = attendanceData.length / employees.length;

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Seeding Summary:');
  console.log(`👑 Admin users: 1`);
  console.log(`👥 Employees: ${employees.length}`);
  console.log(`📝 Total users: ${totalUsers}`);
  console.log(`📅 Attendance records: ${totalAttendance}`);
  console.log(`⚙️  Admin settings: ${totalSettings}`);
  console.log(`🗓️  Date range: July 2025 - January 2026`);
  console.log(`🗓️  Working days covered: ~${Math.floor(totalWorkingDays)} days`);
  console.log(`📈 Average attendance rate: ~85%`);
  console.log(`🔐 Password for all users: Password@123`);
  console.log(`📧 Admin email: admin@company.com`);
  console.log(`📧 Employee emails: user1@company.com to user${employees.length}@company.com`);
  
  console.log('\n🔑 Login Credentials:');
  console.log('Admin: admin@company.com / Password@123');
  console.log('Employee examples:');
  console.log('  - EMP001 / Password@123 (user1@company.com)');
  console.log('  - EMP002 / Password@123 (user2@company.com)');
  console.log('  - ... and so on');
  
  console.log('\n📝 Sample Employee IDs:');
  employees.slice(0, 5).forEach((emp, index) => {
    console.log(`  - ${emp.employeeId}: ${emp.firstName} ${emp.lastName} (${emp.department} - ${emp.section})`);
  });
  console.log(`  - ... and ${employees.length - 5} more employees`);
  
  console.log('\n⚙️  Settings Categories Seeded:');
  console.log('  - Company Settings: Company profile, working hours, holidays');
  console.log('  - Attendance Settings: Working hours, grace periods, thresholds');
  console.log('  - Email Settings: SMTP configuration, notification schedules, templates');
  console.log('  - Security Settings: Password policies, rate limiting, lockout rules');
  console.log('  - User Settings: Registration policy, session settings, profile fields');
  console.log('  - Report Settings: Default report configurations');
  
  console.log('\n🏢 Company Details:');
  console.log('  - Name: TechCorp Solutions Ltd.');
  console.log('  - Email: contact@techcorp.com');
  console.log('  - Phone: +880-1700-000000');
  console.log('  - Website: https://www.techcorp.com');
  console.log('  - Timezone: Asia/Dhaka');
  console.log('  - Working Hours: 09:00 - 18:00');
  console.log('  - Working Days: Monday to Friday');
  
  console.log('\n📧 Email Templates Seeded:');
  console.log('  - attendanceReminder: Daily attendance reminder');
  console.log('  - weeklyReport: Weekly attendance report');
  console.log('  - passwordReset: Password reset request');
  console.log('  - welcome: New user welcome message');
  console.log('  - endOfDayReport: End of day attendance report');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });