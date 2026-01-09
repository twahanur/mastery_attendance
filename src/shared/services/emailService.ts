import nodemailer from 'nodemailer';
import { prisma } from '../config/database';

// ============================================================================
// EMAIL TEMPLATE TYPES - These define what templates the admin can configure
// ============================================================================
export const EMAIL_TEMPLATE_TYPES = {
  // Attendance Related
  attendanceReminder: {
    key: 'email.templates.attendanceReminder',
    name: 'Daily Attendance Reminder',
    description: 'Sent to employees who haven\'t marked attendance',
    variables: ['employeeName', 'date', 'time', 'companyName', 'loginUrl'],
  },
  absenteeReport: {
    key: 'email.templates.absenteeReport',
    name: 'Daily Absentee Report',
    description: 'Sent to admin with list of absent employees',
    variables: ['date', 'totalAbsent', 'absenteeList', 'companyName', 'departmentSummary'],
  },
  weeklyReport: {
    key: 'email.templates.weeklyReport',
    name: 'Weekly Attendance Report',
    description: 'Weekly summary sent to admin',
    variables: ['weekStart', 'weekEnd', 'totalPresent', 'totalAbsent', 'totalLate', 'attendanceRate', 'companyName', 'reportDetails'],
  },
  endOfDayReport: {
    key: 'email.templates.endOfDayReport',
    name: 'End of Day Summary',
    description: 'Daily summary sent at end of work day',
    variables: ['date', 'totalPresent', 'totalAbsent', 'totalLate', 'totalEarlyLeave', 'companyName', 'departmentBreakdown'],
  },
  monthlyReport: {
    key: 'email.templates.monthlyReport',
    name: 'Monthly Attendance Report',
    description: 'Monthly summary sent to admin',
    variables: ['month', 'year', 'totalWorkingDays', 'averageAttendance', 'topPerformers', 'companyName', 'reportDetails'],
  },

  // User Account Related
  welcome: {
    key: 'email.templates.welcome',
    name: 'Welcome Email',
    description: 'Sent when a new employee account is created',
    variables: ['employeeName', 'email', 'temporaryPassword', 'loginUrl', 'companyName'],
  },
  passwordReset: {
    key: 'email.templates.passwordReset',
    name: 'Password Reset',
    description: 'Sent when password reset is requested',
    variables: ['employeeName', 'resetLink', 'resetToken', 'expiryTime', 'companyName'],
  },
  passwordChanged: {
    key: 'email.templates.passwordChanged',
    name: 'Password Changed Confirmation',
    description: 'Sent after password is successfully changed',
    variables: ['employeeName', 'changeTime', 'companyName', 'supportEmail'],
  },
  accountLocked: {
    key: 'email.templates.accountLocked',
    name: 'Account Locked',
    description: 'Sent when account is locked due to failed attempts',
    variables: ['employeeName', 'lockTime', 'unlockTime', 'supportEmail', 'companyName'],
  },

  // Leave Related
  leaveRequest: {
    key: 'email.templates.leaveRequest',
    name: 'Leave Request Notification',
    description: 'Sent to manager when leave is requested',
    variables: ['employeeName', 'leaveType', 'startDate', 'endDate', 'reason', 'approvalUrl', 'companyName'],
  },
  leaveApproved: {
    key: 'email.templates.leaveApproved',
    name: 'Leave Approved',
    description: 'Sent when leave request is approved',
    variables: ['employeeName', 'leaveType', 'startDate', 'endDate', 'approvedBy', 'companyName'],
  },
  leaveRejected: {
    key: 'email.templates.leaveRejected',
    name: 'Leave Rejected',
    description: 'Sent when leave request is rejected',
    variables: ['employeeName', 'leaveType', 'startDate', 'endDate', 'rejectedBy', 'rejectionReason', 'companyName'],
  },
  custom: {
    key: 'email.templates.custom',
    name: 'Custom Message',
    description: 'Manually sent custom subject and body',
    variables: ['customSubject', 'customBody', 'employeeName', 'companyName', 'supportEmail'],
  },
} as const;

// ============================================================================
// DEFAULT TEMPLATES - Used as fallback when admin hasn't configured custom templates
// ============================================================================
const DEFAULT_TEMPLATES: Record<string, { subject: string; body: string }> = {
  'email.templates.attendance_Reminder': {
    subject: '⏰ Attendance Reminder - {{date}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">{{companyName}}</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello {{employeeName}}! 👋</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            This is a friendly reminder that you haven't marked your attendance for today (<strong>{{date}}</strong>).
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Please mark your attendance as soon as possible to maintain accurate records.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{loginUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Mark Attendance Now
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">Current time: {{time}}</p>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p>
        </div>
      </div>
    `,
  },
  'email.templates.absentee_Report': {
    subject: '📋 Daily Absentee Report - {{date}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">{{companyName}}</h1>
          <p style="color: white; margin: 5px 0 0 0;">Daily Absentee Report</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Attendance Summary for {{date}}</h2>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #f5576c; margin-top: 0;">Total Absent: {{totalAbsent}}</h3>
            {{absenteeList}}
          </div>
          <div style="background: white; padding: 20px; border-radius: 10px;">
            <h3 style="color: #333; margin-top: 0;">Department Summary</h3>
            {{departmentSummary}}
          </div>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p>
        </div>
      </div>
    `,
  },
  'email.templates.weekly_Report': {
    subject: '📊 Weekly Attendance Report - {{weekStart}} to {{weekEnd}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">{{companyName}}</h1>
          <p style="color: white; margin: 5px 0 0 0;">Weekly Attendance Report</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Week: {{weekStart}} - {{weekEnd}}</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div style="background: #4CAF50; padding: 20px; border-radius: 10px; text-align: center;">
              <h3 style="color: white; margin: 0;">{{totalPresent}}</h3>
              <p style="color: white; margin: 5px 0 0 0;">Total Present</p>
            </div>
            <div style="background: #f44336; padding: 20px; border-radius: 10px; text-align: center;">
              <h3 style="color: white; margin: 0;">{{totalAbsent}}</h3>
              <p style="color: white; margin: 5px 0 0 0;">Total Absent</p>
            </div>
            <div style="background: #ff9800; padding: 20px; border-radius: 10px; text-align: center;">
              <h3 style="color: white; margin: 0;">{{totalLate}}</h3>
              <p style="color: white; margin: 5px 0 0 0;">Late Arrivals</p>
            </div>
            <div style="background: #2196F3; padding: 20px; border-radius: 10px; text-align: center;">
              <h3 style="color: white; margin: 0;">{{attendanceRate}}%</h3>
              <p style="color: white; margin: 5px 0 0 0;">Attendance Rate</p>
            </div>
          </div>
          <div style="background: white; padding: 20px; border-radius: 10px;">
            {{reportDetails}}
          </div>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p>
        </div>
      </div>
    `,
  },
  'email.templates.endOfDay_Report': {
    subject: '🌅 End of Day Summary - {{date}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">{{companyName}}</h1>
          <p style="color: white; margin: 5px 0 0 0;">End of Day Summary</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Today's Summary - {{date}}</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div style="background: #4CAF50; padding: 20px; border-radius: 10px; text-align: center;">
              <h3 style="color: white; margin: 0;">{{totalPresent}}</h3>
              <p style="color: white; margin: 5px 0 0 0;">Present</p>
            </div>
            <div style="background: #f44336; padding: 20px; border-radius: 10px; text-align: center;">
              <h3 style="color: white; margin: 0;">{{totalAbsent}}</h3>
              <p style="color: white; margin: 5px 0 0 0;">Absent</p>
            </div>
            <div style="background: #ff9800; padding: 20px; border-radius: 10px; text-align: center;">
              <h3 style="color: white; margin: 0;">{{totalLate}}</h3>
              <p style="color: white; margin: 5px 0 0 0;">Late</p>
            </div>
            <div style="background: #9C27B0; padding: 20px; border-radius: 10px; text-align: center;">
              <h3 style="color: white; margin: 0;">{{totalEarlyLeave}}</h3>
              <p style="color: white; margin: 5px 0 0 0;">Early Leave</p>
            </div>
          </div>
          <div style="background: white; padding: 20px; border-radius: 10px;">
            <h3 style="color: #333; margin-top: 0;">Department Breakdown</h3>
            {{departmentBreakdown}}
          </div>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p>
        </div>
      </div>
    `,
  },
  'email.templates.monthlyReport': {
    subject: '📅 Monthly Attendance Report - {{month}} {{year}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">{{companyName}}</h1>
          <p style="color: #333; margin: 5px 0 0 0;">Monthly Attendance Report</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">{{month}} {{year}} Summary</h2>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Total Working Days:</strong> {{totalWorkingDays}}</p>
            <p><strong>Average Attendance:</strong> {{averageAttendance}}%</p>
          </div>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">🏆 Top Performers</h3>
            {{topPerformers}}
          </div>
          <div style="background: white; padding: 20px; border-radius: 10px;">
            {{reportDetails}}
          </div>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p>
        </div>
      </div>
    `,
  },
  'email.templates.welcome': {
    subject: '🎉 Welcome to {{companyName}}!',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to {{companyName}}! 🎉</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello {{employeeName}}! 👋</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We're excited to have you on board! Your account has been created successfully.
          </p>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Your Login Details</h3>
            <p><strong>Email:</strong> {{email}}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px;">{{temporaryPassword}}</code></p>
          </div>
          <p style="color: #f44336; font-size: 14px;">⚠️ Please change your password after your first login.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{loginUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Login Now
            </a>
          </div>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p>
        </div>
      </div>
    `,
  },
  'email.templates.password_Reset': {
    subject: '🔐 Password Reset Request - {{companyName}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello {{employeeName}},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetLink}}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will expire in <strong>{{expiryTime}}</strong>.
          </p>
          <p style="color: #999; font-size: 12px;">
            If you didn't request this, please ignore this email or contact support if you have concerns.
          </p>
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="color: #856404; margin: 0; font-size: 12px;">
              <strong>Reset Token:</strong> {{resetToken}}
            </p>
          </div>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p>
        </div>
      </div>
    `,
  },
  'email.templates.password_Changed': {
    subject: '✅ Password Changed Successfully - {{companyName}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Changed ✅</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello {{employeeName}},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your password has been successfully changed on <strong>{{changeTime}}</strong>.
          </p>
          <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #155724; margin: 0;">
              ✅ Your account is now secured with the new password.
            </p>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you did not make this change, please contact our support team immediately at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.
          </p>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p>
        </div>
      </div>
    `,
  },
  'email.templates.account_Locked': {
    subject: '🔒 Account Locked - {{companyName}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Account Locked 🔒</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello {{employeeName}},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your account has been temporarily locked due to multiple failed login attempts.
          </p>
          <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #721c24; margin: 0;">
              <strong>Locked at:</strong> {{lockTime}}<br>
              <strong>Unlock time:</strong> {{unlockTime}}
            </p>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you need immediate access, please contact our support team at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.
          </p>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p>
        </div>
      </div>
    `,
  },
  'email.templates.leave_Request': {
    subject: '📝 Leave Request from {{employeeName}} - {{companyName}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Leave Request</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Leave Request Details</h2>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Employee:</strong> {{employeeName}}</p>
            <p><strong>Leave Type:</strong> {{leaveType}}</p>
            <p><strong>From:</strong> {{startDate}}</p>
            <p><strong>To:</strong> {{endDate}}</p>
            <p><strong>Reason:</strong> {{reason}}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{approvalUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Review Request
            </a>
          </div>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p>
        </div>
      </div>
    `,
  },
  'email.templates.leave_Approved': {
    subject: '✅ Leave Approved - {{companyName}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Leave Approved ✅</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Good news, {{employeeName}}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your leave request has been approved.
          </p>
          <div style="background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Leave Type:</strong> {{leaveType}}</p>
            <p><strong>From:</strong> {{startDate}}</p>
            <p><strong>To:</strong> {{endDate}}</p>
            <p><strong>Approved by:</strong> {{approvedBy}}</p>
          </div>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p>
        </div>
      </div>
    `,
  },
  'email.templates.leave_Rejected': {
    subject: '❌ Leave Request Rejected - {{companyName}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Leave Request Rejected</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello {{employeeName}},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Unfortunately, your leave request has been rejected.
          </p>
          <div style="background: #f8d7da; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Leave Type:</strong> {{leaveType}}</p>
            <p><strong>From:</strong> {{startDate}}</p>
            <p><strong>To:</strong> {{endDate}}</p>
            <p><strong>Rejected by:</strong> {{rejectedBy}}</p>
            <p><strong>Reason:</strong> {{rejectionReason}}</p>
          </div>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">© {{companyName}} - Attendance Management System</p>
        </div>
      </div>
    `,
  },
  'email.templates.custom': {
    subject: '{{customSubject}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <div style="padding: 16px 0; text-align: center;">
          <h2 style="margin: 0; color: #333;">{{companyName}}</h2>
          <p style="margin: 4px 0; color: #666;">Hello {{employeeName}},</p>
        </div>
        <div style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
          {{customBody}}
        </div>
        <div style="padding: 12px 0; text-align: center; color: #999; font-size: 12px;">
          Need help? Contact <a href="mailto:{{supportEmail}}" style="color: #2563eb;">{{supportEmail}}</a>
        </div>
      </div>
    `,
  },
};

// ============================================================================
// EMAIL SERVICE CLASS
// ============================================================================
class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private companyName: string = 'Company';
  private supportEmail: string = 'support@company.com';
  private loginUrl: string = 'http://localhost:3000/login';

  // Initialize transporter from database settings
  async initializeTransporter(): Promise<void> {
    try {
      // Prefer new key 'email.smtp', fall back to legacy 'smtp_config'
      const smtpEmailKey = await prisma.adminSettings.findFirst({
        where: { key: 'email.smtp', isActive: true },
      });
    console.log("smtp email key", smtpEmailKey? smtpEmailKey.value : "not found")
      const smtpLegacyKey = !smtpEmailKey
        ? await prisma.adminSettings.findFirst({ where: { key: 'smtp_config', isActive: true } })
        : null;
    console.log("smtp legacy key", smtpLegacyKey? smtpLegacyKey.value : "not found")

      if ((smtpEmailKey && smtpEmailKey.value) || (smtpLegacyKey && smtpLegacyKey.value)) {
        const raw = (smtpEmailKey?.value ?? smtpLegacyKey?.value) as any;
        const config = typeof raw === 'string' ? JSON.parse(raw) : raw;
        console.log(config)
        this.transporter = nodemailer.createTransport({
          host: config.host,
          port: Number(config.port) || 587,
          secure: Boolean(config.secure),
          auth: {
            user: config.user,
            pass: config.pass,
          },
        });
        console.log('✅ Email transporter initialized from database settings', smtpEmailKey ? '(email.smtp)' : '(smtp_config)');
      } else {
        // Fallback to environment variables
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        console.log('📧 Email transporter initialized from environment variables');
      }

      // Load company settings
      await this.loadCompanySettings();
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error);
    }
  }

  // Load company settings from database
  private async loadCompanySettings(): Promise<void> {
    try {
      const companyNameSetting = await prisma.adminSettings.findFirst({
        where: { key: 'company_name', isActive: true },
      });
      if (companyNameSetting && companyNameSetting.value) {
        this.companyName = String(companyNameSetting.value);
      }

      const supportEmailSetting = await prisma.adminSettings.findFirst({
        where: { key: 'support_email', isActive: true },
      });
      if (supportEmailSetting && supportEmailSetting.value) {
        this.supportEmail = String(supportEmailSetting.value);
      }

      const loginUrlSetting = await prisma.adminSettings.findFirst({
        where: { key: 'login_url', isActive: true },
      });
      if (loginUrlSetting && loginUrlSetting.value) {
        this.loginUrl = String(loginUrlSetting.value);
      }
    } catch (error) {
      console.error('Failed to load company settings:', error);
    }
  }

  // Get template from database or use default
  private async getTemplate(templateKey: string): Promise<{ subject: string; body: string }> {
    try {
      const templateSetting = await prisma.adminSettings.findFirst({
        where: { key: templateKey, isActive: true },
      });

      if (templateSetting && templateSetting.value) {
        const template = typeof templateSetting.value === 'string' 
          ? JSON.parse(templateSetting.value) 
          : templateSetting.value;
        return {
          subject: template.subject || DEFAULT_TEMPLATES[templateKey]?.subject || 'Notification',
          body: template.body || DEFAULT_TEMPLATES[templateKey]?.body || '',
        };
      }
    } catch (error) {
      console.error(`Failed to get template ${templateKey}:`, error);
    }

    // Return default template
    return DEFAULT_TEMPLATES[templateKey] || { subject: 'Notification', body: '' };
  }

  // Process template by replacing variables
  private processTemplate(template: string, variables: Record<string, string>): string {
    let processed = template;
    
    // Add default variables
    variables.companyName = variables.companyName || this.companyName;
    variables.supportEmail = variables.supportEmail || this.supportEmail;
    variables.loginUrl = variables.loginUrl || this.loginUrl;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value || '');
    }
    
    return processed;
  }

  // Parse SMTP error for user-friendly message
  private parseSMTPError(error: any): string {
    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('Daily user sending limit exceeded')) {
      return 'Gmail daily sending limit exceeded. Please try again tomorrow or upgrade your Gmail account.';
    }
    if (errorMessage.includes('535') || errorMessage.includes('authentication failed')) {
      return 'SMTP authentication failed. Please check your email credentials.';
    }
    if (errorMessage.includes('Invalid login')) {
      return 'Invalid SMTP username or password.';
    }
    if (errorMessage.includes('Connection timeout')) {
      return 'SMTP connection timeout. Please check your server settings.';
    }
    if (errorMessage.includes('ECONNREFUSED')) {
      return 'Unable to connect to SMTP server. Please verify host and port.';
    }
    if (errorMessage.includes('Recipient address rejected')) {
      return 'Invalid recipient email address.';
    }
    
    return errorMessage;
  }

  // Generic send email method
  async sendEmail(
    to: string,
    templateType: keyof typeof EMAIL_TEMPLATE_TYPES,
    variables: Record<string, string>
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const templateConfig = EMAIL_TEMPLATE_TYPES[templateType];
      const template = await this.getTemplate(templateConfig.key);

      const subject = this.processTemplate(template.subject, variables);
      const html = this.processTemplate(template.body, variables);

      const fromEmail = await this.getFromEmail();

      await this.transporter?.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
      });

      console.log(`✅ Email sent: ${templateType} to ${to}`);
      return true;
    } catch (error: any) {
      const userMessage = this.parseSMTPError(error);
      console.error(`❌ Failed to send email ${templateType}:`, error);
      throw new Error(`Email sending failed: ${userMessage}`);
    }
  }

  // Send a fully custom email without using a predefined template
  async sendCustomEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const fromEmail = await this.getFromEmail();

      await this.transporter?.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
        text,
      });

      console.log(`✅ Custom email sent to ${to}`);
      return true;
    } catch (error: any) {
      const userMessage = this.parseSMTPError(error);
      console.error('❌ Failed to send custom email:', error);
      throw new Error(`Email sending failed: ${userMessage}`);
    }
  }

  // Get from email address
  private async getFromEmail(): Promise<string> {
    try {
      const smtpEmailKey = await prisma.adminSettings.findFirst({
        where: { key: 'email.smtp', isActive: true },
      });
      const smtpLegacyKey = !smtpEmailKey
        ? await prisma.adminSettings.findFirst({ where: { key: 'smtp_config', isActive: true } })
        : null;

      const raw = (smtpEmailKey?.value ?? smtpLegacyKey?.value) as any;
      if (raw) {
        const config = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return config.from || `${this.companyName} <${config.user}>`;
      }
    } catch (error) {
      console.error('Failed to get from email:', error);
    }

    return process.env.SMTP_FROM || `${this.companyName} <noreply@company.com>`;
  }

  // ============================================================================
  // CONVENIENCE METHODS FOR SPECIFIC EMAIL TYPES
  // ============================================================================

  // Attendance Reminder
  async sendAttendanceReminder(
    email: string,
    employeeName: string,
    date: string
  ): Promise<boolean> {
    return this.sendEmail(email, 'attendanceReminder', {
      employeeName,
      date,
      time: new Date().toLocaleTimeString(),
    });
  }

  // Daily Absentee Report
  async sendDailyAbsenteeReport(
    adminEmail: string,
    date: string,
    totalAbsent: number,
    absenteeList: string,
    departmentSummary: string = ''
  ): Promise<boolean> {
    return this.sendEmail(adminEmail, 'absenteeReport', {
      date,
      totalAbsent: totalAbsent.toString(),
      absenteeList,
      departmentSummary,
    });
  }

  // Weekly Report
  async sendWeeklyReport(
    adminEmail: string,
    weekStart: string,
    weekEnd: string,
    stats: {
      totalPresent: number;
      totalAbsent: number;
      totalLate: number;
      attendanceRate: number;
    },
    reportDetails: string = ''
  ): Promise<boolean> {
    return this.sendEmail(adminEmail, 'weeklyReport', {
      weekStart,
      weekEnd,
      totalPresent: stats.totalPresent.toString(),
      totalAbsent: stats.totalAbsent.toString(),
      totalLate: stats.totalLate.toString(),
      attendanceRate: stats.attendanceRate.toFixed(1),
      reportDetails,
    });
  }

  // End of Day Report
  async sendEndOfDayReport(
    adminEmail: string,
    date: string,
    stats: {
      totalPresent: number;
      totalAbsent: number;
      totalLate: number;
      totalEarlyLeave: number;
    },
    departmentBreakdown: string = ''
  ): Promise<boolean> {
    return this.sendEmail(adminEmail, 'endOfDayReport', {
      date,
      totalPresent: stats.totalPresent.toString(),
      totalAbsent: stats.totalAbsent.toString(),
      totalLate: stats.totalLate.toString(),
      totalEarlyLeave: stats.totalEarlyLeave.toString(),
      departmentBreakdown,
    });
  }

  // Monthly Report
  async sendMonthlyReport(
    adminEmail: string,
    month: string,
    year: string,
    stats: {
      totalWorkingDays: number;
      averageAttendance: number;
    },
    topPerformers: string = '',
    reportDetails: string = ''
  ): Promise<boolean> {
    return this.sendEmail(adminEmail, 'monthlyReport', {
      month,
      year,
      totalWorkingDays: stats.totalWorkingDays.toString(),
      averageAttendance: stats.averageAttendance.toFixed(1),
      topPerformers,
      reportDetails,
    });
  }

  // Welcome Email
  async sendWelcomeEmail(
    email: string,
    employeeName: string,
    temporaryPassword: string
  ): Promise<boolean> {
    return this.sendEmail(email, 'welcome', {
      employeeName,
      email,
      temporaryPassword,
    });
  }

  // Password Reset
  async sendPasswordResetEmail(
    email: string,
    employeeName: string,
    resetToken: string,
    resetLink: string,
    expiryTime: string = '1 hour'
  ): Promise<boolean> {
    return this.sendEmail(email, 'passwordReset', {
      employeeName,
      resetToken,
      resetLink,
      expiryTime,
    });
  }

  // Password Changed
  async sendPasswordChangedEmail(
    email: string,
    employeeName: string
  ): Promise<boolean> {
    return this.sendEmail(email, 'passwordChanged', {
      employeeName,
      changeTime: new Date().toLocaleString(),
    });
  }

  // Account Locked
  async sendAccountLockedEmail(
    email: string,
    employeeName: string,
    unlockTime: string
  ): Promise<boolean> {
    return this.sendEmail(email, 'accountLocked', {
      employeeName,
      lockTime: new Date().toLocaleString(),
      unlockTime,
    });
  }

  // Leave Request
  async sendLeaveRequestEmail(
    managerEmail: string,
    employeeName: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    reason: string,
    approvalUrl: string
  ): Promise<boolean> {
    return this.sendEmail(managerEmail, 'leaveRequest', {
      employeeName,
      leaveType,
      startDate,
      endDate,
      reason,
      approvalUrl,
    });
  }

  // Leave Approved
  async sendLeaveApprovedEmail(
    email: string,
    employeeName: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    approvedBy: string
  ): Promise<boolean> {
    return this.sendEmail(email, 'leaveApproved', {
      employeeName,
      leaveType,
      startDate,
      endDate,
      approvedBy,
    });
  }

  // Leave Rejected
  async sendLeaveRejectedEmail(
    email: string,
    employeeName: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<boolean> {
    return this.sendEmail(email, 'leaveRejected', {
      employeeName,
      leaveType,
      startDate,
      endDate,
      rejectedBy,
      rejectionReason,
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  // Get all template types for admin UI
  getTemplateTypes(): typeof EMAIL_TEMPLATE_TYPES {
    return EMAIL_TEMPLATE_TYPES;
  }

  // Refresh transporter (call when SMTP settings change)
  async refreshTransporter(): Promise<void> {
    this.transporter = null;
    await this.initializeTransporter();
  }

  // Backwards-compatible alias used by controllers
  async reloadSettings(): Promise<void> {
    await this.refreshTransporter();
    await this.loadCompanySettings();
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }
      await this.transporter?.verify();
      console.log('✅ Email connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email connection failed:', error);
      return false;
    }
  }

  // Send test email
  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail(to, 'attendanceReminder', {
      employeeName: 'Test User',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Initialize on import
emailService.initializeTransporter().catch(console.error);
