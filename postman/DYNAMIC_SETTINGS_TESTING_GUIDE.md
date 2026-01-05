# Dynamic Settings Postman Collection

## Overview
This Postman collection provides comprehensive testing for the newly implemented dynamic admin settings features:
- **Rate Limiter Configuration**: Dynamically control API rate limiting from the database
- **Password Validation Rules**: Configure password complexity requirements on-the-fly
- **Username Validation Rules**: Adjust username requirements dynamically

## Features Tested

### 1. Rate Limiter Settings
- Get current rate limit configuration
- Update rate limiting rules (max requests, time window)
- Enable/disable rate limiting
- Test rate limit enforcement

### 2. Password Validation Settings
- Fetch current password rules
- Update password complexity requirements:
  - Minimum length
  - Uppercase requirement
  - Lowercase requirement
  - Number requirement
  - Special character requirement
  - Custom special character set
- Test password validation with employee creation

### 3. Username Validation Settings
- Get username validation rules
- Configure username length limits
- Allow/disallow special characters in usernames

## Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Dynamic_Settings_API.postman_collection.json`
4. Collection will appear in your workspace

### 2. Set Base URL
The collection uses a variable `{{baseUrl}}` set to `http://localhost:5000/api/v1` by default.

To change:
- Click on the collection name
- Go to **Variables** tab
- Update `baseUrl` value

### 3. Authenticate
Before testing admin endpoints:
1. Run **🔐 Authentication > Admin Login**
2. The token will be automatically saved to `{{adminToken}}`
3. All subsequent admin requests will use this token

## Testing Workflow

### Quick Test Sequence

#### 1. Authentication
```
Run: Admin Login
Expected: Status 200, token saved
```

#### 2. Check Current Rate Limit Settings
```
Run: Get Rate Limit Config
Expected: Returns current configuration with enabled, maxRequests, windowMinutes
```

#### 3. Update Rate Limiter
```
Run: Update Rate Limit Config
Body: 
{
  "enabled": true,
  "maxRequests": 5000,
  "windowMinutes": 10
}
Expected: Status 200, settings updated
```

#### 4. Check Password Rules
```
Run: Get Password Validation Rules
Expected: Returns password validation requirements
```

#### 5. Test Strict Password Rules
```
Run: Strict Password Rules
Expected: Updates to require 12+ chars with all character types

Then Run: Test - Create Employee (Weak Password)
Expected: Status 400, validation error
```

#### 6. Test Lenient Password Rules
```
Run: Simple Password Rules (Testing)
Expected: Updates to only require 6 chars

Then Run: Test - Create Employee (Weak Password)
Expected: Should succeed now (or update the password to match new rules)
```

## Testing Scenarios

### Scenario 1: Rate Limiting
1. Set strict rate limit (100 req / 5 min)
2. Run Health Check endpoint repeatedly
3. Verify 429 error after limit reached
4. Wait for window to expire
5. Verify requests work again

### Scenario 2: Password Complexity
1. Set simple rules (min 6, no special requirements)
2. Create employee with simple password
3. Verify success
4. Set strict rules (min 12, all requirements)
5. Try creating employee with simple password
6. Verify failure with detailed error message

### Scenario 3: Dynamic Updates
1. Get current password rules
2. Update rules
3. Wait ~1 minute (cache expiry)
4. Create employee to test new rules
5. Verify new rules are applied

## Collection Structure

```
📁 Dynamic Settings API
├── 🔐 Authentication
│   ├── Admin Login (saves token)
│   └── Employee Login
├── ⚡ Rate Limiter Settings
│   ├── Get Rate Limit Config
│   ├── Update Rate Limit Config
│   ├── Disable Rate Limiting
│   ├── Strict Rate Limiting (100 req/5min)
│   └── Restore Default Rate Limiting
├── 🔒 Password Validation Settings
│   ├── Get Password Validation Rules
│   ├── Update Password Rules
│   ├── Simple Password Rules (Testing)
│   ├── Strict Password Rules
│   └── Restore Default Password Rules
├── 👤 Username Validation Settings
│   ├── Get Username Validation Rules
│   ├── Update Username Rules
│   ├── Allow Special Characters in Username
│   └── Restore Default Username Rules
├── 🧪 Testing Dynamic Validation
│   ├── Test - Create Employee (Valid Password)
│   ├── Test - Create Employee (Weak Password)
│   ├── Test - Password Reset (Valid)
│   ├── Test - Password Reset (Invalid)
│   └── Test - Change Password (Valid)
├── 📊 All Admin Settings
│   ├── Get All Settings
│   ├── Get Security Settings
│   ├── Get System Settings
│   └── Get Specific Setting
└── 🧪 Rate Limit Testing
    └── Health Check (Rate Limit Test)
```

## Environment Variables

The collection uses these variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `baseUrl` | API base URL | `http://localhost:5000/api/v1` |
| `adminToken` | Admin JWT token | Auto-set on login |
| `employeeToken` | Employee JWT token | Auto-set on login |

## Expected Responses

### Success Response (200)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter"
  ]
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "error": "Rate limit exceeded"
}
```

### Unauthorized Error (401)
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "No token provided"
}
```

## Notes

### Cache Behavior
- Settings are cached for 1 minute to improve performance
- Changes may take up to 1 minute to apply
- Force immediate refresh by restarting the server

### Rate Limiter Behavior
- Tracks requests per IP address
- Window is sliding (not fixed)
- Memory cleanup runs every minute
- Disabling rate limiter allows unlimited requests

### Password Validation
- Rules are validated on:
  - Employee creation
  - Password reset
  - Password change
- Existing users are not affected by rule changes
- Only new passwords must meet current rules

### Username Validation
- Applied only during user creation
- Existing usernames remain valid
- Special character setting affects new registrations only

## Troubleshooting

### Token Expired
- Run Admin Login again to refresh token

### 429 Too Many Requests
- Wait for rate limit window to expire
- Or update rate limit settings to allow more requests

### Validation Rules Not Applied
- Wait 1 minute for cache to expire
- Verify settings were saved to database
- Check server logs for errors

### Settings Not Persisting
- Ensure database connection is active
- Check admin permissions
- Verify AdminSettings table exists

## Advanced Testing

### Load Testing Rate Limiter
Use Postman Collection Runner:
1. Select "Rate Limit Testing" folder
2. Set iterations to 1000
3. Set delay to 0ms
4. Run collection
5. Verify rate limiting kicks in

### Testing Cache Expiration
1. Get current rules
2. Update rules in database directly
3. Wait 1 minute
4. Test - verify new rules applied
5. Update via API
6. Test immediately - verify instant application

## Integration with CI/CD

This collection can be used in automated testing:

```bash
# Run collection with Newman
newman run Dynamic_Settings_API.postman_collection.json \
  --environment your-environment.json \
  --reporters cli,json
```

## Support

For issues or questions:
- Check server logs for detailed error messages
- Verify database settings using "Get All Settings" endpoint
- Ensure admin token is valid and not expired
- Review API documentation for endpoint requirements
