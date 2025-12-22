# Postman Collection for Attendance Tracker API

This directory contains Postman collection and environment files for testing the Attendance Tracker API.

## Files

- `Attendance_Tracker_API.postman_collection.json` - Main collection with all API endpoints
- `Attendance_Tracker_Local.postman_environment.json` - Environment variables for local development

## Setup Instructions

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Import both files:
   - `Attendance_Tracker_API.postman_collection.json`
   - `Attendance_Tracker_Local.postman_environment.json`

### 2. Select Environment

1. In Postman, click the environment dropdown (top right)
2. Select **"Attendance Tracker - Local"**

### 3. Start the API Server

Make sure your attendance tracker API is running:

```bash
cd /path/to/attendance-tracker
npm run dev
```

The server should be running on `http://localhost:3000`

## Testing Workflow

### Step 1: Health Check
- Run **Health Check** to verify the API is running

### Step 2: Authentication Setup

**Create Admin User (if not exists):**
You need to create an admin user first. You can do this by running the database seeding script or manually inserting into the database.

**For Testing, Create Sample Data:**

1. **Admin Login:**
   - Use **Authentication > Admin Login**
   - Default credentials: `admin@company.com` / `admin123`
   - This will automatically set the `adminToken` environment variable

2. **Create Employee:**
   - Use **Authentication > Create Employee (Admin Only)**
   - This creates a sample employee for testing

3. **Employee Login:**
   - Use **Authentication > Employee Login**
   - Use the employee credentials you just created
   - This will automatically set the `employeeToken` environment variable

### Step 4: Test Password Reset (Optional)

**Reset Password Flow:**
1. **Forgot Password:**
   - Use **Authentication > Forgot Password**
   - Enter email address to receive reset instructions
   - Check your email for the reset link

2. **Verify Token:**
   - Use **Authentication > Verify Reset Token**
   - Extract token from the reset email link
   - Verify the token is valid

3. **Reset Password:**
   - Use **Authentication > Reset Password**
   - Use the same token with your new password
   - Login with new credentials

### Step 5: Test Employee Management (Admin Only)

With admin token active:
- **Get All Employees** - List all employees
- **Get Employee by ID** - Get specific employee details
- **Update Employee** - Modify employee information
- **Deactivate/Activate Employee** - Change employee status
- **Get Departments/Sections** - Retrieve organizational data
- **Get Employee Statistics** - View analytics

### Step 6: Test Attendance Management

With either admin or employee token:
- **Mark Attendance** - Create attendance record
- **Update Attendance** - Add check-out time
- **Get My Attendance Records** - View personal records
- **Check Today's Attendance** - Verify today's status
- **Get Attendance Statistics** - View personal analytics

## API Endpoints Overview

### Authentication (`/api/v1/auth`)
- `POST /admin/login` - Admin login
- `POST /employee/login` - Employee login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change password
- `POST /employees` - Create employee (Admin only)
- `POST /logout` - Logout user
- `POST /forgot-password` - Request password reset
- `POST /verify-reset-token` - Verify reset token
- `POST /reset-password` - Reset password with token

### Employee Management (`/api/v1/users`) - Admin Only
- `GET /employees` - List employees with pagination
- `GET /employees/:id` - Get employee details
- `PUT /employees/:id` - Update employee
- `POST /employees/:id/activate` - Activate employee
- `POST /employees/:id/deactivate` - Deactivate employee
- `DELETE /employees/:id` - Delete employee
- `GET /departments` - Get all departments
- `GET /sections` - Get all sections
- `GET /statistics` - Get employee statistics

### Attendance Management (`/api/v1/attendance`)
- `POST /mark` - Mark attendance
- `PUT /:attendanceId` - Update attendance record
- `GET /my-records` - Get personal attendance records
- `GET /current-month-summary` - Current month summary
- `GET /month-summary` - Specific month summary
- `GET /today` - Check today's attendance
- `GET /date/:date` - Check specific date attendance
- `GET /stats` - Personal attendance statistics
- `DELETE /date/:date` - Delete attendance by date

## Environment Variables

The collection uses these environment variables:

- `baseUrl` - API base URL (`http://localhost:3000/api/v1`)
- `authToken` - Current authentication token
- `adminToken` - Admin user token
- `employeeToken` - Employee user token
- `employeeId` - Sample employee ID for testing
- `attendanceId` - Attendance record ID for updates

## Authentication Flow

1. **Admin Flow:**
   - Login as admin → Get admin token
   - Create/manage employees
   - View all attendance data

2. **Employee Flow:**
   - Login as employee → Get employee token
   - Mark personal attendance
   - View personal records and statistics

## Sample Data

### Admin User
```json
{
  "email": "admin@company.com",
  "password": "admin123"
}
```

### Sample Employee
```json
{
  "email": "john.doe@company.com",
  "username": "john.doe",
  "employeeId": "EMP001",
  "password": "employee123",
  "firstName": "John",
  "lastName": "Doe",
  "section": "Development",
  "department": "IT",
  "designation": "Software Engineer"
}
```

### Sample Attendance
```json
{
  "date": "2024-12-22",
  "employeeName": "John Doe",
  "employeeId": "EMP001",
  "section": "Development",
  "shift": "MORNING",
  "mood": "GOOD",
  "checkInTime": "09:00",
  "notes": "On time arrival"
}
```

## Enums Reference

### Shift Types
- `MORNING`
- `AFTERNOON` 
- `EVENING`
- `NIGHT`

### Mood Types
- `EXCELLENT`
- `GOOD`
- `AVERAGE`
- `POOR`
- `TERRIBLE`

### Role Types
- `ADMIN`
- `EMPLOYEE`

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Testing Tips

1. **Use Scripts:** The collection includes test scripts that automatically save tokens
2. **Check Environment:** Always verify the correct environment is selected
3. **Sequential Testing:** Follow the authentication flow before testing protected endpoints
4. **Token Management:** Tokens are automatically managed through environment variables
5. **Date Formats:** Use YYYY-MM-DD format for dates and HH:MM for times

## Troubleshooting

1. **Connection Refused:** Ensure the API server is running on port 3000
2. **Authentication Failed:** Check if the admin user exists in the database
3. **Invalid Token:** Re-login to refresh the authentication token
4. **Database Errors:** Verify database connection and run migrations
5. **CORS Issues:** Check CORS configuration in the API server

For additional support, check the API logs and database connectivity.