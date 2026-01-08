# Dynamic Email Templates & Schedule Management

## Overview

This document describes the fully dynamic email template system and schedule management implemented in the Attendance Tracker API. Administrators can configure all email templates and scheduled job timings directly from the database without any code changes.

---

## Table of Contents

1. [Email Template System](#email-template-system)
2. [Schedule Management](#schedule-management)
3. [Admin Settings Keys](#admin-settings-keys)
4. [Template Variables Reference](#template-variables-reference)
5. [API Usage Examples](#api-usage-examples)
6. [Default Templates](#default-templates)

---

## Email Template System

### Architecture

The email service (`src/shared/services/emailService.ts`) is designed to be fully dynamic:

1. **Templates are stored in the database** under the `AdminSettings` table with keys prefixed by `email.templates.*`
2. **Variable substitution** uses `{{variableName}}` syntax
3. **Fallback templates** are provided in code if database templates don't exist
4. **SMTP configuration** is loaded from `smtp_config` setting

### Supported Email Template Types

| Template Type | Database Key | Description |
|--------------|--------------|-------------|
| `ATTENDANCE_REMINDER` | `email.templates.attendanceReminder` | Daily reminder for employees who haven't marked attendance |
| `ABSENTEE_REPORT` | `email.templates.absenteeReport` | Daily report sent to admin with absent employee list |
| `WEEKLY_REPORT` | `email.templates.weeklyReport` | Weekly attendance summary for admin |
| `END_OF_DAY_REPORT` | `email.templates.endOfDayReport` | End of day attendance summary |
| `MONTHLY_REPORT` | `email.templates.monthlyReport` | Monthly attendance report |
| `WELCOME` | `email.templates.welcome` | Welcome email for new employees |
| `PASSWORD_RESET` | `email.templates.passwordReset` | Password reset request email |
| `PASSWORD_CHANGED` | `email.templates.passwordChanged` | Password change confirmation |
| `ACCOUNT_LOCKED` | `email.templates.accountLocked` | Account lockout notification |
| `LEAVE_REQUEST` | `email.templates.leaveRequest` | Leave request notification to manager |
| `LEAVE_APPROVED` | `email.templates.leaveApproved` | Leave approval notification |
| `LEAVE_REJECTED` | `email.templates.leaveRejected` | Leave rejection notification |

### Template Structure

Each template in the database should be a JSON object with:

```json
{
  "subject": "Email Subject - {{variable}}",
  "body": "<html>Email HTML body with {{variable}}</html>"
}
```

### Example: Updating a Template via API

```bash
# Update the attendance reminder template
curl -X PUT http://localhost:5000/api/v1/admin/settings/email.templates.attendanceReminder \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": {
      "subject": "⏰ Please Mark Your Attendance - {{date}}",
      "body": "<div style=\"font-family: Arial;\"><h2>Hello {{employeeName}}!</h2><p>Please mark your attendance for {{date}}.</p><a href=\"{{loginUrl}}\">Mark Now</a></div>"
    }
  }'
```

---

## Schedule Management

### Architecture

The schedule manager (`src/shared/services/scheduleManager.ts`) dynamically loads all scheduling configuration from the database:

1. **Cron expressions** are stored in `email.notifications` setting
2. **Timezone** is configurable via the same setting
3. **Jobs can be updated at runtime** without server restart
4. **Manual triggers** are available for testing

### Scheduled Jobs

| Job Name | Default Cron | Description |
|----------|--------------|-------------|
| `dailyReminder` | `0 13 * * 1-5` | 1:00 PM Mon-Fri - Attendance reminders |
| `weeklyReport` | `0 9 * * 1` | 9:00 AM Monday - Weekly report |
| `endOfDay` | `0 18 * * 1-5` | 6:00 PM Mon-Fri - End of day summary |

### Configuration Structure

The `email.notifications` setting controls all schedules:

```json
{
  "timezone": "Asia/Dhaka",
  "dailyReminder": {
    "enabled": true,
    "cronExpression": "0 13 * * 1-5"
  },
  "weeklyReport": {
    "enabled": true,
    "cronExpression": "0 9 * * 1"
  },
  "endOfDay": {
    "enabled": true,
    "cronExpression": "0 18 * * 1-5"
  }
}
```

### Updating Schedules via API

```bash
# Update email notification schedules
curl -X PUT http://localhost:5000/api/v1/admin/settings/email.notifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": {
      "timezone": "Asia/Dhaka",
      "dailyReminder": {
        "enabled": true,
        "cronExpression": "0 14 * * 1-5"
      },
      "weeklyReport": {
        "enabled": true,
        "cronExpression": "0 10 * * 1"
      },
      "endOfDay": {
        "enabled": true,
        "cronExpression": "0 19 * * 1-5"
      }
    }
  }'
```

### Cron Expression Reference

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 7, 0 and 7 are Sunday)
│ │ │ │ │
* * * * *
```

**Examples:**
- `0 9 * * 1-5` - 9:00 AM, Monday through Friday
- `0 18 * * *` - 6:00 PM every day
- `30 8 1 * *` - 8:30 AM on the 1st of every month
- `0 */2 * * *` - Every 2 hours

---

## Admin Settings Keys

### Company Settings

| Key | Type | Description |
|-----|------|-------------|
| `company_name` | string | Company name displayed in emails |
| `company_email` | string | Main company email |
| `support_email` | string | Support email for user inquiries |
| `login_url` | string | Login page URL for email links |
| `timezone` | string | Company timezone (e.g., "Asia/Dhaka") |

### SMTP Configuration

| Key | Type | Description |
|-----|------|-------------|
| `smtp_config` | object | Complete SMTP configuration |

**smtp_config structure:**
```json
{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "user": "your-email@gmail.com",
  "pass": "your-app-password",
  "from": "Company Name <noreply@company.com>"
}
```

---

## Template Variables Reference

### Attendance Reminder
| Variable | Description |
|----------|-------------|
| `{{employeeName}}` | Employee's full name |
| `{{date}}` | Current date |
| `{{time}}` | Current time |
| `{{companyName}}` | Company name |
| `{{loginUrl}}` | Login page URL |

### Absentee Report
| Variable | Description |
|----------|-------------|
| `{{date}}` | Report date |
| `{{totalAbsent}}` | Number of absent employees |
| `{{absenteeList}}` | HTML list of absent employees |
| `{{departmentSummary}}` | Department-wise summary |
| `{{companyName}}` | Company name |

### Weekly Report
| Variable | Description |
|----------|-------------|
| `{{weekStart}}` | Week start date |
| `{{weekEnd}}` | Week end date |
| `{{totalPresent}}` | Total present count |
| `{{totalAbsent}}` | Total absent count |
| `{{totalLate}}` | Total late arrivals |
| `{{attendanceRate}}` | Attendance percentage |
| `{{reportDetails}}` | Detailed report HTML |
| `{{companyName}}` | Company name |

### End of Day Report
| Variable | Description |
|----------|-------------|
| `{{date}}` | Report date |
| `{{totalPresent}}` | Present count |
| `{{totalAbsent}}` | Absent count |
| `{{totalLate}}` | Late count |
| `{{totalEarlyLeave}}` | Early leave count |
| `{{departmentBreakdown}}` | Department-wise breakdown |
| `{{companyName}}` | Company name |

### Welcome Email
| Variable | Description |
|----------|-------------|
| `{{employeeName}}` | New employee's name |
| `{{email}}` | Employee's email |
| `{{temporaryPassword}}` | Temporary password |
| `{{loginUrl}}` | Login page URL |
| `{{companyName}}` | Company name |

### Password Reset
| Variable | Description |
|----------|-------------|
| `{{employeeName}}` | Employee's name |
| `{{resetLink}}` | Password reset URL |
| `{{resetToken}}` | Reset token |
| `{{expiryTime}}` | Link expiry time |
| `{{companyName}}` | Company name |

### Password Changed
| Variable | Description |
|----------|-------------|
| `{{employeeName}}` | Employee's name |
| `{{changeTime}}` | Time of password change |
| `{{supportEmail}}` | Support email |
| `{{companyName}}` | Company name |

### Account Locked
| Variable | Description |
|----------|-------------|
| `{{employeeName}}` | Employee's name |
| `{{lockTime}}` | Time account was locked |
| `{{unlockTime}}` | When account will unlock |
| `{{supportEmail}}` | Support email |
| `{{companyName}}` | Company name |

### Leave Request
| Variable | Description |
|----------|-------------|
| `{{employeeName}}` | Requesting employee's name |
| `{{leaveType}}` | Type of leave |
| `{{startDate}}` | Leave start date |
| `{{endDate}}` | Leave end date |
| `{{reason}}` | Leave reason |
| `{{approvalUrl}}` | Approval page URL |
| `{{companyName}}` | Company name |

### Leave Approved
| Variable | Description |
|----------|-------------|
| `{{employeeName}}` | Employee's name |
| `{{leaveType}}` | Type of leave |
| `{{startDate}}` | Leave start date |
| `{{endDate}}` | Leave end date |
| `{{approvedBy}}` | Approver's name |
| `{{companyName}}` | Company name |

### Leave Rejected
| Variable | Description |
|----------|-------------|
| `{{employeeName}}` | Employee's name |
| `{{leaveType}}` | Type of leave |
| `{{startDate}}` | Leave start date |
| `{{endDate}}` | Leave end date |
| `{{rejectedBy}}` | Rejector's name |
| `{{rejectionReason}}` | Reason for rejection |
| `{{companyName}}` | Company name |

---

## API Usage Examples

### Email Service Methods

```typescript
import { emailService } from './shared/services/emailService';

// Send attendance reminder
await emailService.sendAttendanceReminder(
  'employee@company.com',
  'John Doe',
  '2026-01-08'
);

// Send welcome email
await emailService.sendWelcomeEmail(
  'newemployee@company.com',
  'Jane Smith',
  'TempPass123!'
);

// Send password reset
await emailService.sendPasswordResetEmail(
  'employee@company.com',
  'John Doe',
  'reset-token-123',
  'https://app.company.com/reset?token=reset-token-123',
  '1 hour'
);

// Send weekly report
await emailService.sendWeeklyReport(
  'admin@company.com',
  '2026-01-01',
  '2026-01-07',
  {
    totalPresent: 150,
    totalAbsent: 10,
    totalLate: 5,
    attendanceRate: 93.75
  },
  '<p>Detailed report content...</p>'
);

// Generic send with any template type
await emailService.sendEmail('recipient@company.com', 'WELCOME', {
  employeeName: 'John Doe',
  email: 'john@company.com',
  temporaryPassword: 'Pass123!'
});
```

### Schedule Manager Methods

```typescript
import { scheduleManager } from './shared/services/scheduleManager';

// Get current schedule status
const status = scheduleManager.getStatus();
console.log(status);
// { dailyReminder: { scheduled: true, cron: '0 13 * * 1-5' }, ... }

// Update a specific schedule
await scheduleManager.updateSchedule('dailyReminder', '0 14 * * 1-5');

// Update timezone
await scheduleManager.updateTimezone('Asia/Kolkata');

// Manually trigger a job (for testing)
await scheduleManager.triggerJob('dailyReminder');

// Refresh all schedules from database
await scheduleManager.refreshSchedules();
```

---

## Default Templates

All templates have beautiful, modern HTML defaults with gradient headers and responsive design. These are used when no custom template is configured in the database.

### Template Design Features

- **Gradient Headers**: Eye-catching colored headers with company name
- **Responsive Layout**: Works on all email clients
- **Clear CTAs**: Prominent action buttons
- **Statistics Cards**: Visual stats display for reports
- **Consistent Branding**: Company name and footer in all templates

### Customization Tips

1. **Keep variable placeholders**: Always include `{{companyName}}` for branding
2. **Test emails**: Use `emailService.sendTestEmail()` to verify templates
3. **Mobile-friendly**: Use inline CSS for better email client support
4. **Image hosting**: Host images externally, don't embed base64 in templates

---

## Files Modified

| File | Changes |
|------|---------|
| `src/shared/services/emailService.ts` | Complete rewrite with 12 template types, dynamic loading, variable substitution |
| `src/shared/services/scheduleManager.ts` | Dynamic cron scheduling, runtime updates, job triggering |
| `src/shared/services/attendanceScheduler.ts` | Updated to use new email service signatures |
| `prisma/seed.ts` | Added 77 settings including all email templates |

---

## Seeded Settings Count

- **Total Admin Settings**: 77
- **Company Settings**: 12
- **Email/SMTP Settings**: 25
- **Security Settings**: 15
- **User Settings**: 5
- **Report Settings**: 5
- **Attendance Settings**: 9
- **Email Templates**: 12

---

## Troubleshooting

### Emails not sending
1. Check `smtp_config` setting is properly configured
2. Verify SMTP credentials are correct
3. Check server logs for error messages

### Schedules not running
1. Verify `email.notifications` setting exists
2. Check timezone is correct
3. Ensure `enabled: true` for desired jobs

### Template variables not replaced
1. Ensure variable names match exactly (case-sensitive)
2. Check template JSON is valid
3. Verify `body` field exists in template (not `html`)

---

*Last Updated: January 8, 2026*
