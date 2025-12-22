# Attendance Tracker API - Complete Postman Collection

This directory contains a comprehensive Postman collection for the Advanced Attendance Tracker API, including all recent features and improvements.

## 📋 Collection Contents

### 🗂️ Main Collection
**File**: `Attendance_Tracker_Complete.postman_collection.json`

The collection is organized into the following categories:

#### 🔧 System Status
- **Health Check** - Verify API status and connectivity

#### 🔐 Authentication  
- **Admin Login (Unified)** - Login as administrator using unified endpoint
- **Employee Login (Unified)** - Login as employee using unified endpoint

#### 👥 User Management
- **Dashboard Statistics** - Get comprehensive dashboard stats (Admin only)
- **Get All Employees** - List all employees (Admin only)
- **Get Departments with Employees** - Department breakdown with employee lists
- **Get Sections with Employees** - Section breakdown with employee lists  
- **Create Employee** - Add new employee (Admin only)
- **Get Employee by ID** - Retrieve specific employee details
- **Update Employee** - Modify employee information
- **Delete Employee** - Remove employee from system

#### 📋 Attendance Management
- **Mark Attendance (Simplified)** - Mark attendance with simplified format (date + mood only)
- **Update Attendance (Check Out)** - Add check-out time and notes
- **My Attendance Records** - Get personal attendance history with pagination
- **Get Attendance by Date** - Retrieve attendance for specific date
- **My Attendance Stats** - Personal attendance statistics

#### 📊 Advanced Reports & Analytics
- **Attendance Summary** - Quick overview statistics
- **Daily Report** - JSON and PDF formats for daily attendance
- **Weekly Report** - JSON and PDF formats for weekly analysis  
- **Monthly Report** - JSON and PDF formats for monthly insights
- **Employee Report** - Individual employee analysis (Admin and Employee access)
- **Department Comparison** - Department-wise attendance comparison

#### 📧 Email Notification System
- **Email System Status** - Check notification system status

#### 🧪 Testing & Examples
- **Complete Workflow Test** - Step-by-step testing scenario
- **Sample Requests** - Example requests with different parameters

## 🌍 Environment Files

### Production Environment
**File**: `Attendance_Tracker_Production.postman_environment.json`
- **Base URL**: `https://masteryattendenceserver-92cqa0muq-twahanurs-projects.vercel.app/api/v1`
- Pre-configured for production testing

### Local Development Environment  
**File**: `Attendance_Tracker_Local.postman_environment.json`
- **Base URL**: `http://localhost:3000/api/v1`
- Pre-configured for local development

## 🚀 Quick Start Guide

### 1. Import Collection & Environment
1. Open Postman
2. Click **Import** → **Files**
3. Select all three files:
   - `Attendance_Tracker_Complete.postman_collection.json`
   - `Attendance_Tracker_Production.postman_environment.json` 
   - `Attendance_Tracker_Local.postman_environment.json`

### 2. Select Environment
- For production testing: Select **"Attendance Tracker - Production Environment"**
- For local development: Select **"Attendance Tracker - Local Development"**

### 3. Authentication Flow
1. **Admin Login**: Use "🔑 Admin Login (Unified)" request
   - Email: `admin@company.com`
   - Password: `admin123`
   - Token automatically saved to `adminToken` variable

2. **Employee Login**: Use "👤 Employee Login (Unified)" request  
   - Employee ID: `EMP001`
   - Password: `employee123`
   - Token automatically saved to `employeeToken` variable

### 4. Test Complete Workflow
Navigate to **🧪 Testing & Examples** → **🎯 Complete Workflow Test** and run requests sequentially:
1. Step 1: Admin Login
2. Step 2: Create Test Employee
3. Step 3: Employee Login
4. Step 4: Mark Attendance
5. Step 5: Generate Daily Report
6. Step 6: Cleanup - Delete Test Employee

## 🔍 Key Features

### ✨ Automated Features
- **Token Management**: Authentication tokens automatically captured and used
- **Date Variables**: Current date and date ranges auto-populated
- **Response Validation**: Automatic JSON/PDF response validation
- **Error Logging**: Failed requests logged with details

### 📊 Report Formats
- **JSON Reports**: Structured data for integration
- **PDF Reports**: Professional formatted documents for sharing
- **Date Ranges**: Flexible date range queries for all reports

### 🔒 Role-Based Access
- **Admin Access**: Full system access including all reports and user management
- **Employee Access**: Personal data access with own attendance reports

### 🎯 Simplified Attendance
- **Minimal Input**: Only date and mood required for attendance marking
- **Automatic Times**: Check-in time auto-recorded
- **Mood Tracking**: HAPPY, NEUTRAL, TIRED, STRESSED mood options
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