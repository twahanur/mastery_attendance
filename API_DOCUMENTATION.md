# Attendance Tracker API Documentation

**Base URL:** `http://localhost:5000/api/v1`

**Version:** 2.0

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Attendance Management](#2-attendance-management)
3. [User Management](#3-user-management)
4. [Reports](#4-reports)
5. [Admin Settings](#5-admin-settings)
6. [Security Settings](#6-security-settings)
7. [Email Settings](#7-email-settings)
8. [User Settings](#8-user-settings)
9. [Schedule Settings](#9-schedule-settings)
10. [Settings Management](#10-settings-management)

---

## Common Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "error": null
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## Authentication Header

For protected routes, include the JWT token:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication

### 1.1 Login

Unified login for both admin and employees.

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@company.com",
      "username": "admin",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "employeeId": null,
      "section": null,
      "department": null,
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.2 Request Password Reset

**Endpoint:** `POST /auth/forgot-password`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@company.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "data": {
    "expiresAt": "2026-01-08T12:00:00.000Z"
  }
}
```

---

### 1.3 Verify Reset Token

**Endpoint:** `POST /auth/verify-reset-token`

**Access:** Public

**Request Body:**
```json
{
  "token": "abc123def456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "valid": true,
    "email": "user@company.com"
  }
}
```

---

### 1.4 Reset Password

**Endpoint:** `POST /auth/reset-password`

**Access:** Public

**Request Body:**
```json
{
  "token": "abc123def456",
  "newPassword": "NewPassword@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 1.5 Get Profile

**Endpoint:** `GET /auth/profile`

**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@company.com",
      "username": "user1",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE",
      "employeeId": "EMP001",
      "section": "Development",
      "department": "IT",
      "designation": "Software Engineer",
      "phoneNumber": "+880-1700-000001",
      "address": "Dhaka, Bangladesh",
      "dateOfJoining": "2025-01-01",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 1.6 Update Profile

**Endpoint:** `PUT /auth/profile`

**Access:** Authenticated

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+880-1700-000002",
  "address": "New Address, Dhaka"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { ... }
  }
}
```

---

### 1.7 Change Password

**Endpoint:** `POST /auth/change-password`

**Access:** Authenticated

**Request Body:**
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 1.8 Logout

**Endpoint:** `POST /auth/logout`

**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.9 Create Employee (Admin Only)

**Endpoint:** `POST /auth/employees`

**Access:** Admin Only

**Request Body:**
```json
{
  "email": "newuser@company.com",
  "username": "newuser",
  "password": "Password@123",
  "firstName": "New",
  "lastName": "User",
  "employeeId": "EMP100",
  "section": "Development",
  "department": "IT",
  "designation": "Junior Developer",
  "phoneNumber": "+880-1700-000100",
  "address": "Dhaka, Bangladesh",
  "dateOfJoining": "2026-01-08"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employee": {
      "id": "uuid",
      "email": "newuser@company.com",
      "username": "newuser",
      "firstName": "New",
      "lastName": "User",
      "role": "EMPLOYEE",
      "employeeId": "EMP100",
      "section": "Development",
      "department": "IT",
      "isActive": true
    }
  }
}
```

---

## 2. Attendance Management

### 2.1 Mark Attendance

**Endpoint:** `POST /attendance/mark`

**Access:** Authenticated (Employee/Admin)

**Request Body:**
```json
{
  "mood": "HAPPY",
  "date": "2026-01-08",
  "notes": "Working from office today"
}
```

**Mood Options:** `HAPPY`, `NEUTRAL`, `SAD`, `STRESSED`, `EXCITED`

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "attendance": {
      "id": "uuid",
      "date": "2026-01-08",
      "employeeName": "John Doe",
      "employeeId": "EMP001",
      "section": "Development",
      "shift": "MORNING",
      "mood": "HAPPY",
      "checkInTime": "2026-01-08T09:00:00.000Z",
      "checkOutTime": null,
      "notes": "Working from office today",
      "status": "PRESENT"
    }
  }
}
```

---

### 2.2 Mark Absence

**Endpoint:** `POST /attendance/absent`

**Access:** Authenticated (Employee/Admin)

**Request Body:**
```json
{
  "date": "2026-01-08",
  "reason": "Sick leave - fever"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Absence recorded successfully",
  "data": {
    "attendance": {
      "id": "uuid",
      "date": "2026-01-08",
      "status": "ABSENT",
      "notes": "Sick leave - fever"
    }
  }
}
```

---

### 2.3 Update Attendance (Check-out)

**Endpoint:** `PUT /attendance/:attendanceId`

**Access:** Authenticated (Employee/Admin)

**Request Body:**
```json
{
  "checkOutTime": "2026-01-08T18:00:00.000Z",
  "notes": "Completed all tasks"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "data": {
    "attendance": {
      "id": "uuid",
      "checkOutTime": "2026-01-08T18:00:00.000Z",
      "notes": "Completed all tasks"
    }
  }
}
```

---

### 2.4 Get My Attendance Records

**Endpoint:** `GET /attendance/my-records`

**Access:** Authenticated

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Records per page |
| startDate | string | - | Filter from date (YYYY-MM-DD) |
| endDate | string | - | Filter to date (YYYY-MM-DD) |
| mood | string | - | Filter by mood |
| shift | string | - | Filter by shift |

**Response:**
```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": {
    "records": [
      {
        "id": "uuid",
        "date": "2026-01-08",
        "mood": "HAPPY",
        "shift": "MORNING",
        "checkInTime": "2026-01-08T09:00:00.000Z",
        "checkOutTime": "2026-01-08T18:00:00.000Z",
        "status": "PRESENT"
      }
    ],
    "totalCount": 100
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### 2.5 Get Current Month Summary

**Endpoint:** `GET /attendance/current-month-summary`

**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "message": "Current month attendance summary retrieved successfully",
  "data": {
    "summary": {
      "month": "2026-01",
      "year": 2026,
      "totalDays": 31,
      "workingDays": 22,
      "attendedDays": 18,
      "absentDays": 4,
      "attendancePercentage": 81.82,
      "moodDistribution": {
        "HAPPY": 10,
        "NEUTRAL": 5,
        "STRESSED": 3
      },
      "shiftDistribution": {
        "MORNING": 15,
        "AFTERNOON": 3
      }
    }
  }
}
```

---

### 2.6 Get Month Summary

**Endpoint:** `GET /attendance/month-summary`

**Access:** Authenticated

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| month | number | No | Month (1-12) |
| year | number | No | Year (e.g., 2026) |

**Response:**
```json
{
  "success": true,
  "message": "Monthly attendance summary retrieved successfully",
  "data": {
    "summary": {
      "month": "2025-12",
      "year": 2025,
      "totalDays": 31,
      "attendedDays": 20,
      "attendancePercentage": 90.91
    }
  }
}
```

---

### 2.7 Check Today's Attendance

**Endpoint:** `GET /attendance/today`

**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "message": "Today attendance status retrieved successfully",
  "data": {
    "isMarked": true,
    "date": "2026-01-08",
    "attendance": {
      "id": "uuid",
      "checkInTime": "2026-01-08T09:00:00.000Z",
      "checkOutTime": null,
      "mood": "HAPPY"
    }
  }
}
```

---

### 2.8 Check Date Attendance

**Endpoint:** `GET /attendance/date/:date`

**Access:** Authenticated

**URL Parameter:** `date` - Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "message": "Date attendance status retrieved",
  "data": {
    "isMarked": true,
    "date": "2026-01-07",
    "attendance": { ... }
  }
}
```

---

### 2.9 Get Attendance Statistics

**Endpoint:** `GET /attendance/stats`

**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "message": "Attendance statistics retrieved",
  "data": {
    "stats": {
      "totalRecords": 250,
      "presentDays": 230,
      "absentDays": 20,
      "averageCheckIn": "09:15:00",
      "averageCheckOut": "18:30:00",
      "averageWorkingHours": 9.25
    }
  }
}
```

---

### 2.10 Get Attendance Chart Data

**Endpoint:** `GET /attendance/chart`

**Access:** Authenticated

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | month | `week`, `month`, `year` |

**Response:**
```json
{
  "success": true,
  "message": "Chart data retrieved",
  "data": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "present": [1, 1, 1, 0, 1],
    "absent": [0, 0, 0, 1, 0]
  }
}
```

---

### 2.11 Delete Attendance

**Endpoint:** `DELETE /attendance/date/:date`

**Access:** Authenticated

**URL Parameter:** `date` - Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "message": "Attendance record deleted successfully"
}
```

---

## 3. User Management

### 3.1 Get All Employees

**Endpoint:** `GET /users/employees`

**Access:** Admin Only

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Records per page |
| search | string | - | Search by name/email/employeeId |
| department | string | - | Filter by department |
| section | string | - | Filter by section |
| isActive | boolean | - | Filter by active status |

**Response:**
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": {
    "employees": [
      {
        "id": "uuid",
        "email": "user1@company.com",
        "username": "user1",
        "firstName": "John",
        "lastName": "Doe",
        "role": "EMPLOYEE",
        "employeeId": "EMP001",
        "section": "Development",
        "department": "IT",
        "designation": "Software Engineer",
        "isActive": true
      }
    ],
    "totalCount": 35
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 35,
    "totalPages": 4
  }
}
```

---

### 3.2 Get Employee by ID

**Endpoint:** `GET /users/employees/:employeeId`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Employee retrieved successfully",
  "data": {
    "employee": {
      "id": "uuid",
      "email": "user1@company.com",
      "username": "user1",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE",
      "employeeId": "EMP001",
      "section": "Development",
      "department": "IT",
      "designation": "Software Engineer",
      "phoneNumber": "+880-1700-000001",
      "address": "Dhaka, Bangladesh",
      "dateOfJoining": "2025-01-01",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-08T00:00:00.000Z"
    }
  }
}
```

---

### 3.3 Update Employee

**Endpoint:** `PUT /users/employees/:employeeId`

**Access:** Admin Only

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "section": "QA",
  "department": "IT",
  "designation": "Senior Engineer",
  "phoneNumber": "+880-1700-000002",
  "address": "New Address",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "employee": { ... }
  }
}
```

---

### 3.4 Deactivate Employee

**Endpoint:** `POST /users/employees/:employeeId/deactivate`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Employee deactivated successfully",
  "data": {
    "employee": {
      "id": "uuid",
      "isActive": false
    }
  }
}
```

---

### 3.5 Activate Employee

**Endpoint:** `POST /users/employees/:employeeId/activate`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Employee activated successfully",
  "data": {
    "employee": {
      "id": "uuid",
      "isActive": true
    }
  }
}
```

---

### 3.6 Delete Employee

**Endpoint:** `DELETE /users/employees/:employeeId`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

---

### 3.7 Get Dashboard Stats

**Endpoint:** `GET /users/dashboard`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved",
  "data": {
    "totalEmployees": 35,
    "totalAttendedToday": 30,
    "totalNotAttendedToday": 5,
    "attendancePercentageToday": 85.71,
    "notAttendedEmployees": [
      {
        "id": "uuid",
        "firstName": "Jane",
        "lastName": "Doe",
        "employeeId": "EMP010"
      }
    ],
    "recentAttendances": [...]
  }
}
```

---

### 3.8 Get Departments

**Endpoint:** `GET /users/departments`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Departments retrieved successfully",
  "data": {
    "departments": [
      {
        "name": "IT",
        "employeeCount": 15
      },
      {
        "name": "HR",
        "employeeCount": 5
      }
    ]
  }
}
```

---

### 3.9 Get Sections

**Endpoint:** `GET /users/sections`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Sections retrieved successfully",
  "data": {
    "sections": [
      {
        "name": "Development",
        "employeeCount": 10
      },
      {
        "name": "QA",
        "employeeCount": 5
      }
    ]
  }
}
```

---

### 3.10 Get Employee Statistics

**Endpoint:** `GET /users/statistics`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Employee statistics retrieved",
  "data": {
    "totalEmployees": 35,
    "activeEmployees": 33,
    "inactiveEmployees": 2,
    "departmentDistribution": {
      "IT": 15,
      "HR": 5,
      "Finance": 8,
      "Marketing": 7
    }
  }
}
```

---

## 4. Reports

### 4.1 Get Daily Report

**Endpoint:** `GET /reports/daily`

**Access:** Admin Only

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date | string | No | Date (YYYY-MM-DD), defaults to today |

**Response:**
```json
{
  "success": true,
  "message": "Daily report generated",
  "data": {
    "date": "2026-01-08",
    "totalEmployees": 35,
    "presentCount": 30,
    "absentCount": 5,
    "attendanceRate": 85.71,
    "lateCount": 3,
    "earlyLeaveCount": 2,
    "departmentBreakdown": {
      "IT": { "present": 13, "absent": 2 },
      "HR": { "present": 5, "absent": 0 }
    },
    "attendanceRecords": [...]
  }
}
```

---

### 4.2 Download Daily Report PDF

**Endpoint:** `GET /reports/daily/pdf`

**Access:** Admin Only

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date | string | No | Date (YYYY-MM-DD) |

**Response:** PDF file download

---

### 4.3 Get Weekly Report

**Endpoint:** `GET /reports/weekly`

**Access:** Admin Only

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | Week start date |
| endDate | string | No | Week end date |

**Response:**
```json
{
  "success": true,
  "message": "Weekly report generated",
  "data": {
    "weekStart": "2026-01-06",
    "weekEnd": "2026-01-10",
    "totalEmployees": 35,
    "averageAttendance": 88.5,
    "dailyBreakdown": [
      {
        "date": "2026-01-06",
        "present": 32,
        "absent": 3
      }
    ],
    "topAttendees": [...],
    "frequentAbsentees": [...]
  }
}
```

---

### 4.4 Download Weekly Report PDF

**Endpoint:** `GET /reports/weekly/pdf`

**Access:** Admin Only

**Response:** PDF file download

---

### 4.5 Get Monthly Report

**Endpoint:** `GET /reports/monthly`

**Access:** Admin Only

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| month | number | No | Month (1-12) |
| year | number | No | Year |

**Response:**
```json
{
  "success": true,
  "message": "Monthly report generated",
  "data": {
    "month": 1,
    "year": 2026,
    "totalWorkingDays": 22,
    "averageAttendance": 87.3,
    "employeeStats": [...],
    "departmentStats": [...],
    "trends": [...]
  }
}
```

---

### 4.6 Download Monthly Report PDF

**Endpoint:** `GET /reports/monthly/pdf`

**Access:** Admin Only

**Response:** PDF file download

---

### 4.7 Get Employee Report

**Endpoint:** `GET /reports/employee/:employeeId`

**Access:** Admin or Self

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | Start date |
| endDate | string | No | End date |

**Response:**
```json
{
  "success": true,
  "message": "Employee report generated",
  "data": {
    "employee": {
      "id": "uuid",
      "name": "John Doe",
      "employeeId": "EMP001"
    },
    "period": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "statistics": {
      "totalDays": 22,
      "presentDays": 20,
      "absentDays": 2,
      "attendanceRate": 90.91,
      "lateDays": 3,
      "averageWorkingHours": 8.5
    },
    "attendanceRecords": [...]
  }
}
```

---

### 4.8 Download Employee Report PDF

**Endpoint:** `GET /reports/employee/:employeeId/pdf`

**Access:** Admin or Self

**Response:** PDF file download

---

### 4.9 Get Department Report

**Endpoint:** `GET /reports/department`

**Access:** Admin Only

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | Start date |
| endDate | string | No | End date |
| department | string | No | Specific department |

**Response:**
```json
{
  "success": true,
  "message": "Department report generated",
  "data": {
    "departments": [
      {
        "name": "IT",
        "employeeCount": 15,
        "averageAttendance": 92.5,
        "topPerformers": [...],
        "needsImprovement": [...]
      }
    ],
    "comparison": {
      "bestDepartment": "IT",
      "worstDepartment": "Marketing"
    }
  }
}
```

---

### 4.10 Download Department Report PDF

**Endpoint:** `GET /reports/department/pdf`

**Access:** Admin Only

**Response:** PDF file download

---

### 4.11 Get Attendance Summary

**Endpoint:** `GET /reports/summary`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Attendance summary retrieved",
  "data": {
    "overall": {
      "totalRecords": 5000,
      "averageAttendance": 88.5
    },
    "thisMonth": {
      "attendanceRate": 90.2,
      "trend": "up"
    },
    "lastMonth": {
      "attendanceRate": 87.1
    }
  }
}
```

---

### 4.12 Get Day-wise Attendance

**Endpoint:** `GET /reports/day-wise`

**Access:** Admin Only

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| startDate | string | - | Start date (YYYY-MM-DD) |
| endDate | string | - | End date (YYYY-MM-DD) |
| limit | number | 30 | Number of days (max 100) |

**Response:**
```json
{
  "success": true,
  "message": "Day-wise attendance retrieved",
  "data": {
    "days": [
      {
        "date": "2026-01-08",
        "presentList": [
          { "employeeId": "EMP001", "name": "John Doe" }
        ],
        "absentList": [
          { "employeeId": "EMP010", "name": "Jane Doe" }
        ],
        "presentCount": 30,
        "absentCount": 5
      }
    ]
  }
}
```

---

## 5. Admin Settings

### 5.1 Get All Settings

**Endpoint:** `GET /admin/settings/all`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "All settings retrieved",
  "data": {
    "settings": [
      {
        "id": "uuid",
        "key": "company_name",
        "value": "TechCorp Solutions Ltd.",
        "category": "company",
        "description": "Company name",
        "isActive": true
      }
    ],
    "totalCount": 77
  }
}
```

---

### 5.2 Get Settings by Category

**Endpoint:** `GET /admin/settings/category/:category`

**Access:** Admin Only

**Categories:** `company`, `attendance`, `email`, `security`, `reports`, `user`, `system`

**Response:**
```json
{
  "success": true,
  "message": "Category settings retrieved",
  "data": {
    "category": "company",
    "settings": [
      {
        "key": "company_name",
        "value": "TechCorp Solutions Ltd."
      }
    ]
  }
}
```

---

### 5.3 Get Dashboard Overview

**Endpoint:** `GET /admin/settings/dashboard`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Dashboard overview retrieved",
  "data": {
    "totalSettings": 77,
    "activeSettings": 75,
    "categories": {
      "company": 12,
      "email": 25,
      "security": 15
    }
  }
}
```

---

### 5.4 Initialize Default Settings

**Endpoint:** `POST /admin/settings/initialize`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Default settings initialized",
  "data": {
    "created": 77,
    "updated": 0
  }
}
```

---

## 6. Security Settings

### 6.1 Get Password Rules

**Endpoint:** `GET /admin/security-settings/password-rules`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Password rules retrieved",
  "data": {
    "rules": {
      "minLength": 8,
      "maxLength": 128,
      "requireUppercase": true,
      "requireLowercase": true,
      "requireNumbers": true,
      "requireSymbols": true,
      "preventCommonPasswords": true
    }
  }
}
```

---

### 6.2 Update Password Rules

**Endpoint:** `PUT /admin/security-settings/password-rules`

**Access:** Admin Only

**Request Body:**
```json
{
  "minLength": 10,
  "requireUppercase": true,
  "requireLowercase": true,
  "requireNumbers": true,
  "requireSymbols": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password rules updated"
}
```

---

### 6.3 Get Username Rules

**Endpoint:** `GET /admin/security-settings/username-rules`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Username rules retrieved",
  "data": {
    "rules": {
      "minLength": 3,
      "maxLength": 30,
      "allowSpecialCharacters": false
    }
  }
}
```

---

### 6.4 Update Username Rules

**Endpoint:** `PUT /admin/security-settings/username-rules`

**Access:** Admin Only

**Request Body:**
```json
{
  "minLength": 5,
  "maxLength": 25,
  "allowSpecialCharacters": false
}
```

---

### 6.5 Get Rate Limit Config

**Endpoint:** `GET /admin/security-settings/rate-limit`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Rate limit configuration retrieved",
  "data": {
    "config": {
      "enabled": true,
      "maxRequests": 10000,
      "windowMinutes": 15
    }
  }
}
```

---

### 6.6 Update Rate Limit Config

**Endpoint:** `PUT /admin/security-settings/rate-limit`

**Access:** Admin Only

**Request Body:**
```json
{
  "enabled": true,
  "maxRequests": 5000,
  "windowMinutes": 10
}
```

---

### 6.7 Get All Security Settings

**Endpoint:** `GET /admin/security-settings/all`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "All security settings retrieved",
  "data": {
    "passwordRules": { ... },
    "usernameRules": { ... },
    "rateLimitConfig": { ... }
  }
}
```

---

## 7. Email Settings

### 7.1 Get SMTP Configuration

**Endpoint:** `GET /admin/email-settings/smtp`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "SMTP configuration retrieved",
  "data": {
    "smtp": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "user": "noreply@company.com",
      "from": "Company <noreply@company.com>"
    }
  }
}
```

---

### 7.2 Update SMTP Configuration

**Endpoint:** `PUT /admin/email-settings/smtp`

**Access:** Admin Only

**Request Body:**
```json
{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "user": "noreply@company.com",
  "pass": "your-app-password",
  "from": "Company <noreply@company.com>"
}
```

---

### 7.3 Test SMTP Connection

**Endpoint:** `POST /admin/email-settings/smtp/test`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "SMTP connection successful"
}
```

---

### 7.4 Get Notification Schedule

**Endpoint:** `GET /admin/email-settings/schedule`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Notification schedule retrieved",
  "data": {
    "schedule": {
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
  }
}
```

---

### 7.5 Update Notification Schedule

**Endpoint:** `PUT /admin/email-settings/schedule`

**Access:** Admin Only

**Request Body:**
```json
{
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
```

---

### 7.6 Get All Email Templates

**Endpoint:** `GET /admin/email-settings/templates`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Email templates retrieved",
  "data": {
    "templates": [
      {
        "type": "attendanceReminder",
        "subject": "⏰ Attendance Reminder - {{date}}",
        "hasCustomTemplate": true
      },
      {
        "type": "weeklyReport",
        "subject": "📊 Weekly Report",
        "hasCustomTemplate": false
      }
    ]
  }
}
```

---

### 7.7 Get Specific Template

**Endpoint:** `GET /admin/email-settings/templates/:templateType`

**Access:** Admin Only

**Template Types:** `attendanceReminder`, `weeklyReport`, `passwordReset`, `welcome`, `endOfDayReport`, `absenteeReport`, `monthlyReport`, `passwordChanged`, `accountLocked`, `leaveRequest`, `leaveApproved`, `leaveRejected`

**Response:**
```json
{
  "success": true,
  "message": "Template retrieved",
  "data": {
    "template": {
      "type": "attendanceReminder",
      "subject": "⏰ Attendance Reminder - {{date}}",
      "body": "<div>...</div>",
      "variables": ["employeeName", "date", "time", "companyName", "loginUrl"]
    }
  }
}
```

---

### 7.8 Update Email Template

**Endpoint:** `PUT /admin/email-settings/templates/:templateType`

**Access:** Admin Only

**Request Body:**
```json
{
  "subject": "⏰ Please Mark Attendance - {{date}}",
  "body": "<div style='font-family: Arial;'><h2>Hello {{employeeName}}</h2><p>Please mark your attendance for {{date}}.</p></div>"
}
```

---

### 7.9 Delete Email Template

**Endpoint:** `DELETE /admin/email-settings/templates/:templateType`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Template deleted, will use default"
}
```

---

### 7.10 Initialize Default Templates

**Endpoint:** `POST /admin/email-settings/templates/init-defaults`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Default templates initialized",
  "data": {
    "templatesCreated": 12
  }
}
```

---

### 7.11 Send Test Email

**Endpoint:** `POST /admin/email-settings/test`

**Access:** Admin Only

**Request Body:**
```json
{
  "to": "test@example.com",
  "templateType": "attendanceReminder"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

---

### 7.12 Get All Email Settings

**Endpoint:** `GET /admin/email-settings/all`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "All email settings retrieved",
  "data": {
    "smtp": { ... },
    "schedule": { ... },
    "templates": [ ... ]
  }
}
```

---

## 8. User Settings

### 8.1 Get Password Policy

**Endpoint:** `GET /admin/user-settings/password-policy`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Password policy retrieved",
  "data": {
    "policy": {
      "minLength": 8,
      "maxLength": 128,
      "requireUppercase": true,
      "requireLowercase": true,
      "requireNumbers": true,
      "requireSymbols": true,
      "preventCommonPasswords": true,
      "preventUserInfo": true,
      "expirationDays": 90,
      "historyCount": 5
    }
  }
}
```

---

### 8.2 Update Password Policy

**Endpoint:** `PUT /admin/user-settings/password-policy`

**Access:** Admin Only

**Request Body:**
```json
{
  "minLength": 10,
  "expirationDays": 60,
  "historyCount": 3
}
```

---

### 8.3 Validate Password

**Endpoint:** `POST /admin/user-settings/password-policy/validate`

**Access:** Admin Only

**Request Body:**
```json
{
  "password": "TestPassword@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password validation result",
  "data": {
    "isValid": true,
    "errors": []
  }
}
```

---

### 8.4 Get Registration Policy

**Endpoint:** `GET /admin/user-settings/registration-policy`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Registration policy retrieved",
  "data": {
    "policy": {
      "allowSelfRegistration": false,
      "requireEmailVerification": true,
      "requireAdminApproval": true,
      "allowedEmailDomains": [],
      "blockedEmailDomains": [],
      "defaultRole": "EMPLOYEE",
      "autoActivateAccounts": false,
      "requireInvitation": true
    }
  }
}
```

---

### 8.5 Update Registration Policy

**Endpoint:** `PUT /admin/user-settings/registration-policy`

**Access:** Admin Only

**Request Body:**
```json
{
  "allowSelfRegistration": true,
  "requireEmailVerification": true,
  "allowedEmailDomains": ["company.com"]
}
```

---

### 8.6 Get Lockout Rules

**Endpoint:** `GET /admin/user-settings/lockout-rules`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Lockout rules retrieved",
  "data": {
    "rules": {
      "enabled": true,
      "maxFailedAttempts": 5,
      "lockoutDurationMinutes": 30,
      "resetFailedAttemptsAfterMinutes": 60,
      "notifyAdminOnLockout": true,
      "allowSelfUnlock": false,
      "progressiveDelay": true
    }
  }
}
```

---

### 8.7 Update Lockout Rules

**Endpoint:** `PUT /admin/user-settings/lockout-rules`

**Access:** Admin Only

**Request Body:**
```json
{
  "maxFailedAttempts": 3,
  "lockoutDurationMinutes": 60
}
```

---

### 8.8 Get Profile Fields

**Endpoint:** `GET /admin/user-settings/profile-fields`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Profile fields retrieved",
  "data": {
    "fields": [
      {
        "fieldName": "firstName",
        "required": true,
        "visible": true,
        "editable": true,
        "fieldType": "text",
        "validation": { "minLength": 1, "maxLength": 50 }
      }
    ]
  }
}
```

---

### 8.9 Update Profile Fields

**Endpoint:** `PUT /admin/user-settings/profile-fields`

**Access:** Admin Only

**Request Body:**
```json
{
  "fields": [
    {
      "fieldName": "phoneNumber",
      "required": true,
      "visible": true,
      "editable": true,
      "fieldType": "phone"
    }
  ]
}
```

---

### 8.10 Get Session Settings

**Endpoint:** `GET /admin/user-settings/session-settings`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Session settings retrieved",
  "data": {
    "settings": {
      "sessionTimeoutMinutes": 480,
      "allowMultipleSessions": true,
      "forceLogoutOnPasswordChange": true,
      "rememberMeDays": 30,
      "requireReauthForSensitive": true
    }
  }
}
```

---

### 8.11 Update Session Settings

**Endpoint:** `PUT /admin/user-settings/session-settings`

**Access:** Admin Only

**Request Body:**
```json
{
  "sessionTimeoutMinutes": 240,
  "allowMultipleSessions": false
}
```

---

### 8.12 Get All User Settings

**Endpoint:** `GET /admin/user-settings/all`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "All user settings retrieved",
  "data": {
    "passwordPolicy": { ... },
    "registrationPolicy": { ... },
    "lockoutRules": { ... },
    "profileFields": [ ... ],
    "sessionSettings": { ... }
  }
}
```

---

### 8.13 Reset to Defaults

**Endpoint:** `POST /admin/user-settings/reset`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "User settings reset to defaults"
}
```

---

## 9. Schedule Settings

### 9.1 Get Schedule Status

**Endpoint:** `GET /admin/schedule-settings/status`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Schedule status retrieved",
  "data": {
    "isRunning": true,
    "timezone": "Asia/Dhaka",
    "jobs": {
      "dailyReminder": {
        "enabled": true,
        "cronExpression": "0 13 * * 1-5",
        "status": "scheduled",
        "nextRun": "2026-01-09T13:00:00.000Z"
      },
      "weeklyReport": {
        "enabled": true,
        "cronExpression": "0 9 * * 1",
        "status": "scheduled"
      },
      "endOfDay": {
        "enabled": true,
        "cronExpression": "0 18 * * 1-5",
        "status": "scheduled"
      }
    }
  }
}
```

---

### 9.2 Start Schedules

**Endpoint:** `POST /admin/schedule-settings/start`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Schedules started successfully"
}
```

---

### 9.3 Stop Schedules

**Endpoint:** `POST /admin/schedule-settings/stop`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Schedules stopped successfully"
}
```

---

### 9.4 Reload Schedules

**Endpoint:** `POST /admin/schedule-settings/reload`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Schedules reloaded from database"
}
```

---

### 9.5 Update Schedule Settings

**Endpoint:** `PUT /admin/schedule-settings/settings`

**Access:** Admin Only

**Request Body:**
```json
{
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
    "enabled": false,
    "cronExpression": "0 18 * * 1-5"
  }
}
```

---

### 9.6 Toggle Schedule

**Endpoint:** `PUT /admin/schedule-settings/toggle/:scheduleType`

**Access:** Admin Only

**Schedule Types:** `dailyReminder`, `weeklyReport`, `endOfDay`

**Request Body:**
```json
{
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Schedule toggled successfully",
  "data": {
    "scheduleType": "dailyReminder",
    "enabled": true
  }
}
```

---

## 10. Settings Management

### 10.1 Get All Settings

**Endpoint:** `GET /settings`

**Access:** Admin Only

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |
| isActive | boolean | Filter by active status |

**Response:**
```json
{
  "success": true,
  "message": "Settings retrieved",
  "data": {
    "settings": [
      {
        "id": "uuid",
        "key": "company_name",
        "value": "TechCorp Solutions Ltd.",
        "category": "company",
        "description": "Company name",
        "isActive": true
      }
    ]
  }
}
```

---

### 10.2 Get Setting by Key

**Endpoint:** `GET /settings/:key`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Setting retrieved",
  "data": {
    "setting": {
      "id": "uuid",
      "key": "company_name",
      "value": "TechCorp Solutions Ltd.",
      "category": "company"
    }
  }
}
```

---

### 10.3 Create Setting

**Endpoint:** `POST /settings`

**Access:** Admin Only

**Request Body:**
```json
{
  "key": "custom_setting",
  "value": "Custom Value",
  "category": "custom",
  "description": "A custom setting"
}
```

---

### 10.4 Update Setting

**Endpoint:** `PUT /settings/:key`

**Access:** Admin Only

**Request Body:**
```json
{
  "value": "New Value",
  "description": "Updated description"
}
```

---

### 10.5 Upsert Setting

**Endpoint:** `PUT /settings/:key/upsert`

**Access:** Admin Only

**Request Body:**
```json
{
  "value": "Value",
  "category": "custom",
  "description": "Create or update"
}
```

---

### 10.6 Delete Setting

**Endpoint:** `DELETE /settings/:key`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Setting deleted successfully"
}
```

---

### 10.7 Bulk Update Settings

**Endpoint:** `POST /settings/bulk`

**Access:** Admin Only

**Request Body:**
```json
{
  "settings": [
    { "key": "company_name", "value": "New Company Name" },
    { "key": "timezone", "value": "Asia/Kolkata" }
  ]
}
```

---

### 10.8 Initialize Default Settings

**Endpoint:** `POST /settings/initialize`

**Access:** Admin Only

**Response:**
```json
{
  "success": true,
  "message": "Default settings initialized",
  "data": {
    "created": 77,
    "updated": 0
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation Error |
| 401 | Unauthorized - Invalid/Missing Token |
| 403 | Forbidden - Insufficient Permissions |
| 404 | Not Found |
| 409 | Conflict - Duplicate Resource |
| 429 | Too Many Requests - Rate Limited |
| 500 | Internal Server Error |

---

## Rate Limiting

Default limits (configurable via admin settings):
- **Max Requests:** 10,000 per window
- **Window:** 15 minutes

When rate limited, response includes:
```json
{
  "success": false,
  "message": "Too many requests",
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 900
}
```

---

*Last Updated: January 8, 2026*
