# Dynamic Admin Settings - Security Configuration

This document describes the dynamic security settings that can be configured via the admin API.

## Overview

All security settings are now **dynamic** and stored in the database. Changes take effect immediately (within 1 minute due to caching) without requiring application restart.

## Available Settings

### 1. Password Validation Rules

Control password complexity requirements dynamically.

#### Get Password Rules
```http
GET /api/v1/admin/security-settings/password-rules
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "minLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumber": true,
    "requireSpecial": true,
    "specialCharacters": "!@#$%^&*()_+-=[]{}|;:,.<>?"
  }
}
```

#### Update Password Rules
```http
PUT /api/v1/admin/security-settings/password-rules
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "minLength": 10,
  "requireUppercase": true,
  "requireLowercase": true,
  "requireNumber": true,
  "requireSpecial": false
}
```

**Constraints:**
- `minLength`: 6-32 characters
- All boolean fields are optional
- `specialCharacters`: Custom string of allowed special characters

---

### 2. Username Validation Rules

Configure username format requirements.

#### Get Username Rules
```http
GET /api/v1/admin/security-settings/username-rules
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "minLength": 3,
    "maxLength": 30,
    "allowSpecial": false
  }
}
```

#### Update Username Rules
```http
PUT /api/v1/admin/security-settings/username-rules
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "minLength": 5,
  "maxLength": 25,
  "allowSpecial": true
}
```

**Constraints:**
- `minLength`: Minimum 3 characters
- `maxLength`: Maximum 50 characters
- `allowSpecial`: Allow special characters in usernames

---

### 3. Rate Limiting Configuration

Control API rate limiting to prevent abuse.

#### Get Rate Limit Config
```http
GET /api/v1/admin/security-settings/rate-limit
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "maxRequests": 10000,
    "windowMs": 900000
  }
}
```

#### Update Rate Limit Config
```http
PUT /api/v1/admin/security-settings/rate-limit
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "enabled": true,
  "maxRequests": 5000,
  "windowMinutes": 10
}
```

**Parameters:**
- `enabled`: Enable/disable rate limiting
- `maxRequests`: Number of requests allowed (10-100,000)
- `windowMinutes`: Time window in minutes (1-1440)

**Note:** The response uses `windowMs` (milliseconds) but the input uses `windowMinutes` for convenience.

---

### 4. Get All Security Settings

Retrieve all security settings in one call.

```http
GET /api/v1/admin/security-settings/all
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "passwordRules": {
      "minLength": 8,
      "requireUppercase": true,
      "requireLowercase": true,
      "requireNumber": true,
      "requireSpecial": true,
      "specialCharacters": "!@#$%^&*()_+-=[]{}|;:,.<>?"
    },
    "usernameRules": {
      "minLength": 3,
      "maxLength": 30,
      "allowSpecial": false
    },
    "rateLimiting": {
      "enabled": true,
      "maxRequests": 10000,
      "windowMs": 900000
    }
  }
}
```

---

## Database Settings

All settings are stored in the `AdminSettings` table with these keys:

### Password Settings
- `password_min_length` - Minimum password length (default: 8)
- `password_require_uppercase` - Require uppercase letter (default: true)
- `password_require_lowercase` - Require lowercase letter (default: true)
- `password_require_number` - Require number (default: true)
- `password_require_special` - Require special character (default: true)
- `password_special_characters` - Allowed special characters

### Username Settings
- `username_min_length` - Minimum username length (default: 3)
- `username_max_length` - Maximum username length (default: 30)
- `username_allow_special` - Allow special characters (default: false)

### Rate Limiting Settings
- `enable_api_rate_limiting` - Enable/disable rate limiting (default: true)
- `api_rate_limit_max_requests` - Max requests per window (default: 10000)
- `api_rate_limit_window_minutes` - Time window in minutes (default: 15)

---

## Caching

Settings are cached for **1 minute** to reduce database queries. After updating settings:
- Changes take effect within 60 seconds
- The cache is automatically cleared after updates
- No application restart required

---

## Impact on User Registration

When users register or admins create employees:
- Password validation uses dynamic rules from database
- Username validation uses dynamic rules from database
- All validation messages are auto-generated based on current rules

### Example Error Messages

With `minLength: 10` and `requireSpecial: true`:
```json
{
  "success": false,
  "message": "Password must be at least 10 characters long"
}
```

---

## Backward Compatibility

The system maintains backward compatibility:
- Old validation schemas still exist as fallbacks
- If database fetch fails, default values are used
- Environment variables are used as last resort

---

## Security Best Practices

1. **Password Requirements:**
   - Minimum 8 characters (increase for higher security)
   - Enable all complexity requirements for production
   - Regularly review and update special character list

2. **Rate Limiting:**
   - Keep enabled in production
   - Adjust limits based on your traffic patterns
   - Monitor rate limit violations

3. **Username Rules:**
   - Disable special characters to prevent injection attacks
   - Set reasonable min/max lengths
   - Consider allowing only alphanumeric for simplicity

---

## Migration from Static to Dynamic

### Before (Static - Hardcoded)
```typescript
password: Joi.string().min(6).required()
```

### After (Dynamic - Database)
```typescript
password: await validationService.getPasswordSchema()
```

All validation now reads from the database automatically!

---

## Testing

Test the dynamic settings with these scenarios:

1. **Update password rules** to require 12+ characters
2. **Create a new user** - verify validation uses new rules
3. **Disable rate limiting** - verify unlimited requests allowed
4. **Re-enable with low limits** - verify rate limiting works

---

## Troubleshooting

### Settings not taking effect?
- Wait up to 60 seconds for cache to expire
- Check database values directly
- Verify admin authentication

### Validation too strict/loose?
- Review current settings via GET endpoints
- Adjust rules incrementally
- Test with sample data before production changes

### Rate limit errors?
- Check current limits
- Consider increasing window or max requests
- Verify your usage patterns

---

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/admin/security-settings/password-rules` | GET | Get password rules |
| `/admin/security-settings/password-rules` | PUT | Update password rules |
| `/admin/security-settings/username-rules` | GET | Get username rules |
| `/admin/security-settings/username-rules` | PUT | Update username rules |
| `/admin/security-settings/rate-limit` | GET | Get rate limit config |
| `/admin/security-settings/rate-limit` | PUT | Update rate limit config |
| `/admin/security-settings/all` | GET | Get all security settings |

All endpoints require **ADMIN** role authentication.
