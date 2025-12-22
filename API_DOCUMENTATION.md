# Unified Login API Documentation

## Overview
Single login API endpoint that works for both admin and employee users. The system automatically determines user permissions based on their role.

## Endpoint
```
POST /api/v1/auth/login
```

## Authentication
- **Required**: None (this is a public endpoint)
- **Returns**: JWT token for authenticated requests

## Request Body

### Login Request Object Structure
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

### Field Validation Rules
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | string | ✅ | Valid email format | User's email address |
| `password` | string | ✅ | Min 6 characters | User's password |

### Example Request
```json
{
  "email": "admin@company.com",
  "password": "admin123"
}
```

### Example Employee Request
```json
{
  "email": "john.doe@company.com", 
  "password": "employee123"
}
```

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cm123abc456def789",
      "email": "john.doe@company.com",
      "username": "johndoe",
      "role": "EMPLOYEE",
      "firstName": "John",
      "lastName": "Doe",
      "employeeId": "EMP001",
      "section": "Engineering",
      "department": "Information Technology",
      "designation": "Software Engineer",
      "phoneNumber": "+1234567890",
      "address": "123 Main Street, City, State 12345",
      "dateOfJoining": "2025-01-15T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2025-12-23T12:00:00.000Z",
      "updatedAt": "2025-12-23T12:00:00.000Z",
      "createdBy": "cm456def789ghi012"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTEyM2FiYzQ1NmRlZjc4OSIsImVtYWlsIjoiam9obi5kb2VAY29tcGFueS5jb20iLCJ1c2VybmFtZSI6ImpvaG5kb2UiLCJyb2xlIjoiRU1QTE9ZRUUiLCJpYXQiOjE3MzQ5NDY4MDAsImV4cCI6MTczNTU1MTYwMH0.xyz123abc"
  }
}
```

### Admin Login Response Example
```json
{
  "success": true,
  "message": "Login successful", 
  "data": {
    "user": {
      "id": "cm456def789ghi012",
      "email": "admin@company.com",
      "username": "admin",
      "role": "ADMIN",
      "firstName": "Admin",
      "lastName": "User",
      "employeeId": null,
      "section": null,
      "department": "Administration",
      "designation": "System Administrator",
      "phoneNumber": "+1234567890",
      "address": null,
      "dateOfJoining": null,
      "isActive": true,
      "createdAt": "2025-12-23T12:00:00.000Z",
      "updatedAt": "2025-12-23T12:00:00.000Z",
      "createdBy": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTQ1NmRlZjc4OWdoaTAxMiIsImVtYWlsIjoiYWRtaW5AY29tcGFueS5jb20iLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzM0OTQ2ODAwLCJleHAiOjE3MzU1NTE2MDB9.abc456xyz"
  }
}
```

## Error Responses

### Invalid Credentials (401)
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "Invalid credentials"
}
```

### Inactive Account (401)
```json
{
  "success": false,
  "message": "Account is inactive. Please contact administrator.",
  "error": "Account is inactive. Please contact administrator."
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "Email is required",
  "error": "Email is required"
}
```

## Legacy Endpoints (Backward Compatibility)

For backward compatibility, the old separate login endpoints still work:

### Admin Login (Legacy)
```
POST /api/v1/auth/admin/login
```

### Employee Login (Legacy) 
```
POST /api/v1/auth/employee/login
```

**Note**: These legacy endpoints use the same unified login logic internally.

## cURL Example
```bash
# Unified login (recommended)
curl -X POST https://masteryattendence.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@company.com",
    "password": "employee123"
  }'

# Admin login  
curl -X POST https://masteryattendence.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com", 
    "password": "admin123"
  }'
```

## JavaScript/TypeScript Example
```javascript
const login = async (email, password) => {
  try {
    const response = await fetch('https://masteryattendence.vercel.app/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Store token for future requests
      localStorage.setItem('authToken', result.data.token);
      console.log('Login successful:', result.data.user);
      
      // Check user role for UI routing
      if (result.data.user.role === 'ADMIN') {
        // Redirect to admin dashboard
      } else {
        // Redirect to employee dashboard  
      }
      
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Usage
login('john.doe@company.com', 'employee123');
```

## Using the JWT Token
Once logged in, include the JWT token in the Authorization header for protected endpoints:

```javascript
// Making authenticated requests
const makeAuthenticatedRequest = async (endpoint, method = 'GET', data = null) => {
  const token = localStorage.getItem('authToken');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`https://masteryattendence.vercel.app/api/v1${endpoint}`, options);
  return response.json();
};

// Examples
const profile = await makeAuthenticatedRequest('/auth/profile');
const attendance = await makeAuthenticatedRequest('/attendance/mark', 'POST', { mood: 'GOOD' });
```

---

# Employee Creation API Documentation

## Overview
This API allows administrators to create new employees in the attendance tracking system.

## Endpoint
```
POST /api/v1/auth/employees
```

## Authentication
- **Required**: Admin JWT Token
- **Header**: `Authorization: Bearer <admin_jwt_token>`

## Request Body

### Full Request Object Structure
```json
{
  "email": "string (required)",
  "username": "string (required)", 
  "password": "string (required)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "employeeId": "string (required)",
  "section": "string (required)",
  "department": "string (optional)",
  "designation": "string (optional)",
  "phoneNumber": "string (optional)",
  "address": "string (optional)",
  "dateOfJoining": "string (optional, YYYY-MM-DD format)"
}
```

### Field Validation Rules
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | string | ✅ | Valid email format, unique | Employee's email address |
| `username` | string | ✅ | 3-30 chars, alphanumeric, unique | Login username |
| `password` | string | ✅ | Min 6 characters | Login password (will be hashed) |
| `firstName` | string | ✅ | 2-50 characters | Employee's first name |
| `lastName` | string | ✅ | 2-50 characters | Employee's last name |
| `employeeId` | string | ✅ | 3-20 chars, alphanumeric, unique | Company employee ID |
| `section` | string | ✅ | 2-50 characters | Department section/team |
| `department` | string | ❌ | Max 50 characters | Company department |
| `designation` | string | ❌ | Max 50 characters | Job title/position |
| `phoneNumber` | string | ❌ | Valid phone format (+1234567890) | Contact number |
| `address` | string | ❌ | Max 200 characters | Employee address |
| `dateOfJoining` | string | ❌ | YYYY-MM-DD format | Date employee joined |

### Example Request
```json
{
  "email": "john.doe@company.com",
  "username": "johndoe",
  "password": "securepass123",
  "firstName": "John",
  "lastName": "Doe",
  "employeeId": "EMP001",
  "section": "Engineering",
  "department": "Information Technology",
  "designation": "Software Engineer",
  "phoneNumber": "+1234567890",
  "address": "123 Main Street, City, State 12345",
  "dateOfJoining": "2025-01-15"
}
```
```

---

# Mark Attendance API Documentation

## Overview
Simplified attendance marking API that only requires mood and optional date. Employee details are automatically calculated from the authenticated user's profile.

## Endpoint
```
POST /api/v1/attendance/mark
```

## Authentication
- **Required**: Employee JWT Token
- **Header**: `Authorization: Bearer <employee_jwt_token>`

## Request Body

### Simplified Request Object Structure
```json
{
  "mood": "string (required)",
  "date": "string (optional, YYYY-MM-DD format)",
  "notes": "string (optional)"
}
```

### Field Validation Rules
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `mood` | string | ✅ | One of: EXCELLENT, GOOD, AVERAGE, POOR, TERRIBLE | Employee's mood for the day |
| `date` | string | ❌ | YYYY-MM-DD format, defaults to today | Date for attendance |
| `notes` | string | ❌ | Max 500 characters | Additional notes |

### Auto-Calculated Fields
The following fields are automatically calculated by the backend:
- **employeeName**: From user's firstName + lastName in profile
- **employeeId**: From user's profile
- **section**: From user's profile  
- **shift**: Based on current time:
  - MORNING (06:00-13:59)
  - AFTERNOON (14:00-17:59)  
  - EVENING (18:00-21:59)
  - NIGHT (22:00-05:59)
- **checkInTime**: Current timestamp

### Example Request
```json
{
  "mood": "GOOD",
  "notes": "Feeling productive today"
}
```

### Example Request with Date
```json
{
  "mood": "EXCELLENT", 
  "date": "2025-12-23",
  "notes": "Great day at work"
}
```

## Response

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "attendance": {
      "id": "cm123abc456def789",
      "date": "2025-12-23T00:00:00.000Z",
      "employeeName": "John Doe",
      "employeeId": "EMP001", 
      "section": "Engineering",
      "shift": "MORNING",
      "mood": "GOOD",
      "checkInTime": "2025-12-23T08:30:15.123Z",
      "checkOutTime": null,
      "notes": "Feeling productive today",
      "createdAt": "2025-12-23T08:30:15.123Z"
    }
  }
}
```

## Response

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employee": {
      "id": "cm123abc456def789",
      "email": "john.doe@company.com",
      "username": "johndoe",
      "role": "EMPLOYEE",
      "firstName": "John",
      "lastName": "Doe",
      "employeeId": "EMP001",
      "section": "Engineering",
      "department": "Information Technology",
      "designation": "Software Engineer",
      "phoneNumber": "+1234567890",
      "address": "123 Main Street, City, State 12345",
      "dateOfJoining": "2025-01-15T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2025-12-23T12:00:00.000Z",
      "updatedAt": "2025-12-23T12:00:00.000Z",
      "createdBy": "cm456def789ghi012"
    }
  }
}
```

### Full Employee Object Structure (Prisma Model)
```typescript
interface Employee {
  id: string;                    // Unique identifier (cuid)
  email: string;                 // Unique email address
  username: string;              // Unique username
  password: string;              // Hashed password (not returned in API)
  role: "ADMIN" | "EMPLOYEE";    // User role (always EMPLOYEE for created employees)
  firstName: string | null;      // First name
  lastName: string | null;       // Last name
  employeeId: string | null;     // Unique employee ID
  section: string | null;        // Department section
  department: string | null;     // Company department
  designation: string | null;    // Job title/position
  phoneNumber: string | null;    // Contact phone number
  address: string | null;        // Employee address
  dateOfJoining: Date | null;    // Date employee joined company
  isActive: boolean;             // Account status (default: true)
  createdAt: Date;               // Record creation timestamp
  updatedAt: Date;               // Last update timestamp
  createdBy: string | null;      // ID of admin who created this employee
  
  // Relations (not included in API response by default)
  attendances: Attendance[];     // Employee's attendance records
  createdUsers: User[];          // Users this admin created (if admin)
  creator: User | null;          // Admin who created this user
  passwordResets: PasswordReset[]; // Password reset requests
}
```

### Error Responses

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Email is required",
  "error": "Email is required"
}
```

#### Unauthorized (401)
```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "Invalid or missing token"
}
```

#### Forbidden (403)
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "error": "Admin access required"
}
```

#### Conflict Error (409)
```json
{
  "success": false,
  "message": "Email already registered",
  "error": "Email already registered"
}
```

### Common Conflict Scenarios
- **Email already exists**: Another user has the same email
- **Username already taken**: Username is not unique
- **Employee ID already exists**: Employee ID is already assigned

## cURL Example
```bash
curl -X POST https://masteryattendence.vercel.app/api/v1/auth/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "email": "john.doe@company.com",
    "username": "johndoe",
    "password": "securepass123",
    "firstName": "John",
    "lastName": "Doe",
    "employeeId": "EMP001",
    "section": "Engineering",
    "department": "Information Technology",
    "designation": "Software Engineer",
    "phoneNumber": "+1234567890",
    "address": "123 Main Street, City, State 12345",
    "dateOfJoining": "2025-01-15"
  }'
```

## JavaScript/TypeScript Example
```javascript
const createEmployee = async (employeeData, adminToken) => {
  try {
    const response = await fetch('https://masteryattendence.vercel.app/api/v1/auth/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(employeeData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Employee created:', result.data.employee);
      return result.data.employee;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

// Usage
const employeeData = {
  email: "john.doe@company.com",
  username: "johndoe",
  password: "securepass123",
  firstName: "John",
  lastName: "Doe",
  employeeId: "EMP001",
  section: "Engineering",
  department: "Information Technology",
  designation: "Software Engineer",
  phoneNumber: "+1234567890",
  address: "123 Main Street, City, State 12345",
  dateOfJoining: "2025-01-15"
};

createEmployee(employeeData, 'your-admin-jwt-token');
```

## Related Enums

### Role Enum
```typescript
enum Role {
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE"
}
```

### Shift Enum (for attendance)
```typescript
enum Shift {
  MORNING = "MORNING",
  AFTERNOON = "AFTERNOON", 
  EVENING = "EVENING",
  NIGHT = "NIGHT"
}
```

### Mood Enum (for attendance)
```typescript
enum Mood {
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  AVERAGE = "AVERAGE", 
  POOR = "POOR",
  TERRIBLE = "TERRIBLE"
}
```

---

# Dashboard Statistics API Documentation

## Overview
Comprehensive dashboard API that provides overall attendance statistics, employee information, and daily attendance insights for administrators.

## Endpoint
```
GET /api/v1/users/dashboard
```

## Authentication
- **Required**: Admin JWT Token
- **Header**: `Authorization: Bearer <admin_jwt_token>`

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "dashboard": {
      "totalEmployees": 45,
      "totalAttendedToday": 38,
      "totalNotAttendedToday": 7,
      "attendancePercentageToday": 84,
      "notAttendedEmployees": [
        {
          "id": "cm123abc456def789",
          "email": "john.smith@company.com",
          "username": "johnsmith",
          "role": "EMPLOYEE",
          "firstName": "John",
          "lastName": "Smith",
          "employeeId": "EMP005",
          "section": "Marketing",
          "department": "Sales & Marketing",
          "designation": "Marketing Specialist",
          "phoneNumber": "+1234567891",
          "address": "456 Oak Avenue",
          "dateOfJoining": "2024-12-01T00:00:00.000Z",
          "isActive": true,
          "createdAt": "2024-12-01T09:00:00.000Z",
          "updatedAt": "2024-12-01T09:00:00.000Z",
          "createdBy": "cm456def789ghi012"
        }
      ],
      "recentAttendances": [
        {
          "id": "att123def456ghi789",
          "date": "2025-12-23",
          "employeeName": "Jane Doe",
          "employeeId": "EMP002",
          "section": "Engineering",
          "shift": "MORNING",
          "mood": "GOOD",
          "checkInTime": "2025-12-23T08:30:00.000Z",
          "checkOutTime": null,
          "notes": "Ready for the day",
          "createdAt": "2025-12-23T08:30:15.000Z"
        },
        {
          "id": "att456ghi789jkl012",
          "date": "2025-12-23",
          "employeeName": "Mike Johnson",
          "employeeId": "EMP003",
          "section": "Design",
          "shift": "MORNING",
          "mood": "EXCELLENT", 
          "checkInTime": "2025-12-23T08:45:00.000Z",
          "checkOutTime": null,
          "notes": "Excited about new project",
          "createdAt": "2025-12-23T08:45:22.000Z"
        }
      ]
    }
  }
}
```

### Dashboard Data Structure
| Field | Type | Description |
|-------|------|-------------|
| `totalEmployees` | number | Total number of active employees |
| `totalAttendedToday` | number | Number of employees who marked attendance today |
| `totalNotAttendedToday` | number | Number of employees who haven't marked attendance today |
| `attendancePercentageToday` | number | Attendance percentage for today (rounded) |
| `notAttendedEmployees` | SafeUser[] | List of employees who haven't marked attendance today |
| `recentAttendances` | AttendanceResponse[] | Last 10 attendance records for today |

### Employee Object (SafeUser) 
```typescript
interface SafeUser {
  id: string;
  email: string;
  username: string;
  role: "ADMIN" | "EMPLOYEE";
  firstName: string | null;
  lastName: string | null;
  employeeId: string | null;
  section: string | null;
  department: string | null;
  designation: string | null;
  phoneNumber: string | null;
  address: string | null;
  dateOfJoining: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
}
```

### Attendance Object
```typescript
interface AttendanceResponse {
  id: string;
  date: string; // YYYY-MM-DD format
  employeeName: string;
  employeeId: string;
  section: string;
  shift: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  mood: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR" | "TERRIBLE";
  checkInTime: Date | null;
  checkOutTime: Date | null;
  notes: string | null;
  createdAt: Date;
}
```

## Error Responses

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "Invalid or missing token"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Insufficient permissions", 
  "error": "Admin access required"
}
```

## cURL Example
```bash
curl -X GET https://masteryattendence.vercel.app/api/v1/users/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

## JavaScript/TypeScript Example
```javascript
const getDashboardStats = async (adminToken) => {
  try {
    const response = await fetch('https://masteryattendence.vercel.app/api/v1/users/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      const { dashboard } = result.data;
      console.log('Dashboard Stats:', dashboard);
      
      console.log(`Attendance Today: ${dashboard.totalAttendedToday}/${dashboard.totalEmployees} (${dashboard.attendancePercentageToday}%)`);
      console.log(`Absent Employees: ${dashboard.totalNotAttendedToday}`);
      
      // Process absent employees
      dashboard.notAttendedEmployees.forEach(employee => {
        console.log(`${employee.employeeId} - ${employee.firstName} ${employee.lastName} (${employee.section})`);
      });
      
      return dashboard;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    throw error;
  }
};

// Usage
getDashboardStats('your-admin-jwt-token');
```

## Use Cases
- **Admin Dashboard**: Display real-time attendance overview
- **Daily Reports**: Generate daily attendance summaries  
- **Employee Tracking**: Monitor who hasn't marked attendance
- **Analytics**: Track attendance patterns and percentages
- **Notifications**: Send reminders to employees who haven't checked in

## Notes
- Only active employees are counted in statistics
- Date calculations are based on server timezone
- Recent attendances are limited to 10 most recent entries
- Absent employees list is sorted by section, then by name
- Attendance percentage is rounded to the nearest whole number

## Notes
- Password is automatically hashed using bcrypt before storage
- Employee role is automatically set to "EMPLOYEE"
- Account is active by default (`isActive: true`)
- The `createdBy` field stores the admin's ID who created this employee
- All date fields are stored in UTC and returned in ISO 8601 format
- Phone number validation accepts international formats with country codes