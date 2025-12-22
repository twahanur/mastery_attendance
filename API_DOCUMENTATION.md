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

## Notes
- Password is automatically hashed using bcrypt before storage
- Employee role is automatically set to "EMPLOYEE"
- Account is active by default (`isActive: true`)
- The `createdBy` field stores the admin's ID who created this employee
- All date fields are stored in UTC and returned in ISO 8601 format
- Phone number validation accepts international formats with country codes