# Admin Settings Control Documentation

This document describes all the admin-controllable settings in the Attendance Tracker system.

## Overview

The admin can control various aspects of the system through settings APIs:
- **Password Validation Rules** - Control password complexity requirements
- **Username Rules** - Control username format requirements
- **Rate Limiting** - Control API rate limiting
- **User Policies** - Control registration, lockout, and session policies
- **Email Configuration** - SMTP settings, templates, and notification schedules
- **Schedule Management** - Control automated reminders and reports

## API Endpoints

### Unified Admin Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/settings/all` | Get all settings at once |
| GET | `/api/v1/admin/settings/category/:category` | Get settings by category |
| GET | `/api/v1/admin/settings/dashboard` | Get dashboard overview |
| POST | `/api/v1/admin/settings/initialize` | Initialize default settings |

### Security Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/security-settings/password-rules` | Get password validation rules |
| PUT | `/api/v1/admin/security-settings/password-rules` | Update password validation rules |
| GET | `/api/v1/admin/security-settings/username-rules` | Get username validation rules |
| PUT | `/api/v1/admin/security-settings/username-rules` | Update username validation rules |
| GET | `/api/v1/admin/security-settings/rate-limit` | Get rate limit configuration |
| PUT | `/api/v1/admin/security-settings/rate-limit` | Update rate limit configuration |
| GET | `/api/v1/admin/security-settings/all` | Get all security settings |

### User Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/user-settings/password-policy` | Get password policy |
| PUT | `/api/v1/admin/user-settings/password-policy` | Update password policy |
| POST | `/api/v1/admin/user-settings/validate-password` | Validate a password against policy |
| GET | `/api/v1/admin/user-settings/password-requirements` | Get password requirements list |
| GET | `/api/v1/admin/user-settings/registration-policy` | Get registration policy |
| PUT | `/api/v1/admin/user-settings/registration-policy` | Update registration policy |
| GET | `/api/v1/admin/user-settings/lockout-rules` | Get account lockout rules |
| PUT | `/api/v1/admin/user-settings/lockout-rules` | Update account lockout rules |
| GET | `/api/v1/admin/user-settings/session-settings` | Get session settings |
| PUT | `/api/v1/admin/user-settings/session-settings` | Update session settings |
| GET | `/api/v1/admin/user-settings/profile-fields` | Get profile field configuration |
| PUT | `/api/v1/admin/user-settings/profile-fields` | Update profile field configuration |
| GET | `/api/v1/admin/user-settings/all` | Get all user settings |
| POST | `/api/v1/admin/user-settings/reset-defaults` | Reset all user settings to defaults |

### Email Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/email-settings/smtp` | Get SMTP configuration |
| PUT | `/api/v1/admin/email-settings/smtp` | Update SMTP configuration |
| POST | `/api/v1/admin/email-settings/smtp/test` | Test SMTP connection |
| GET | `/api/v1/admin/email-settings/schedule` | Get notification schedule |
| PUT | `/api/v1/admin/email-settings/schedule` | Update notification schedule |
| GET | `/api/v1/admin/email-settings/templates` | Get all email templates |
| GET | `/api/v1/admin/email-settings/templates/:templateType` | Get specific template |
| PUT | `/api/v1/admin/email-settings/templates/:templateType` | Update template |
| DELETE | `/api/v1/admin/email-settings/templates/:templateType` | Delete template |
| POST | `/api/v1/admin/email-settings/templates/init-defaults` | Initialize default templates |
| POST | `/api/v1/admin/email-settings/test` | Send test email |
| GET | `/api/v1/admin/email-settings/all` | Get all email settings |

### Schedule Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/schedule-settings/status` | Get schedule status |
| POST | `/api/v1/admin/schedule-settings/start` | Start all schedules |
| POST | `/api/v1/admin/schedule-settings/stop` | Stop all schedules |
| POST | `/api/v1/admin/schedule-settings/reload` | Reload schedules with current settings |
| PUT | `/api/v1/admin/schedule-settings/settings` | Update schedule settings |
| PUT | `/api/v1/admin/schedule-settings/toggle/:scheduleType` | Enable/disable specific schedule |

## Request/Response Examples

### Update Password Rules

```json
// PUT /api/v1/admin/security-settings/password-rules
{
  "minLength": 10,
  "requireUppercase": true,
  "requireLowercase": true,
  "requireNumber": true,
  "requireSpecial": true
}
```

### Update SMTP Configuration

```json
// PUT /api/v1/admin/email-settings/smtp
{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "user": "your-email@gmail.com",
  "pass": "your-app-password",
  "from": "noreply@yourcompany.com"
}
```

### Update Notification Schedule

```json
// PUT /api/v1/admin/schedule-settings/settings
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

### Update Account Lockout Rules

```json
// PUT /api/v1/admin/user-settings/lockout-rules
{
  "enabled": true,
  "maxFailedAttempts": 5,
  "lockoutDurationMinutes": 30,
  "resetFailedAttemptsAfterMinutes": 60,
  "notifyAdminOnLockout": true
}
```

## How Settings Are Applied

### Password Validation
Password validation rules are applied:
- When creating a new employee (`POST /api/v1/auth/employees`)
- When changing password (`POST /api/v1/auth/change-password`)
- When resetting password (`POST /api/v1/auth/reset-password`)

### Account Lockout
Lockout rules are applied:
- During login attempts (`POST /api/v1/auth/admin/login`, `POST /api/v1/auth/employee/login`)
- Failed attempts are tracked and lockout is enforced automatically

### Email Notifications
Email settings are used by:
- Attendance scheduler service for daily reminders
- Weekly report generation
- Password reset emails
- Admin notifications

### Rate Limiting
Rate limiting is applied:
- To all API endpoints
- Based on configured max requests and time window
- Can be enabled/disabled by admin

## Settings Categories

| Category | Description |
|----------|-------------|
| `security` | Password rules, rate limiting, username rules |
| `user` | Password policy, registration policy, lockout rules, session settings |
| `email` | SMTP config, templates, notification schedules |
| `company` | Company profile, working hours, timezone |
| `attendance` | Working days, grace periods, minimum hours |

## Default Values

All settings have sensible defaults that are automatically applied if not explicitly configured:

- **Password min length**: 8 characters
- **Require uppercase**: true
- **Require lowercase**: true
- **Require numbers**: true
- **Require special characters**: true
- **Max failed attempts**: 5
- **Lockout duration**: 30 minutes
- **Daily reminder**: 1:00 PM (Monday-Friday)
- **Weekly report**: 9:00 AM (Monday)
- **End of day summary**: 6:00 PM (Monday-Friday)
- **Timezone**: Asia/Dhaka
