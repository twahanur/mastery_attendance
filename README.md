# Attendance Tracker API v2.0

A comprehensive backend API for employee attendance tracking with role-based access control, built using PostgreSQL, Prisma ORM, and TypeScript (Node.js) in a modular architecture.

## 🚀 Features

### 🔐 Role-Based Authentication
- ✅ **Admin Login**: Separate login for administrators
- ✅ **Employee Login**: Dedicated employee authentication
- ✅ **JWT-based Security**: Secure token authentication with role verification
- ✅ **Password Security**: bcrypt hashing with 12 salt rounds

### 👥 Employee Management (Admin Only)
- ✅ **Create Employees**: Admin can create employee accounts with complete details
- ✅ **Employee CRUD**: Full Create, Read, Update, Delete operations
- ✅ **Employee Search**: Filter by name, department, section, status
- ✅ **Employee Status**: Activate/Deactivate employee accounts
- ✅ **Department/Section Management**: Get lists of departments and sections

### 📋 Enhanced Attendance Tracking
- ✅ **Rich Attendance Data**: Name, Employee ID, Section, Shift, Mood tracking
- ✅ **Time Tracking**: Check-in and check-out times
- ✅ **One Attendance Per Day**: Database-level constraint prevents duplicates
- ✅ **Date Validation**: Proper YYYY-MM-DD format with future date prevention
- ✅ **Notes Support**: Optional notes for attendance records

### 📊 Advanced Analytics
- ✅ **Mood Distribution**: Track employee mood patterns (Excellent, Good, Average, Poor, Terrible)
- ✅ **Shift Analysis**: Monitor shift patterns (Morning, Afternoon, Evening, Night)
- ✅ **Monthly Summaries**: Comprehensive attendance statistics
- ✅ **Working Hours**: Calculate average working hours from check-in/out times
- ✅ **Attendance Statistics**: Total days, current month data, trends

### 🏗️ Modular Architecture
- ✅ **Module-Based Structure**: Organized by feature modules (Auth, User, Attendance)
- ✅ **Separation of Concerns**: Controllers, Services, Routes, Validation per module
- ✅ **Shared Components**: Common utilities and middleware
- ✅ **Scalable Design**: Easy to extend and maintain

## 🛠️ Tech Stack

- **Backend**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Date Handling**: date-fns
- **Security**: Helmet.js, CORS, Rate Limiting

## 📁 Project Structure

```
src/
├── modules/                    # Feature modules
│   ├── auth/                   # Authentication module
│   │   ├── controller.ts
│   │   ├── service.ts
│   │   ├── routes.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   ├── user/                   # User management module
│   │   ├── controller.ts
│   │   ├── service.ts
│   │   ├── routes.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   └── attendance/             # Attendance module
│       ├── controller.ts
│       ├── service.ts
│       ├── routes.ts
│       ├── validation.ts
│       └── index.ts
├── shared/                     # Shared components
│   ├── config/                 # Database and configuration
│   ├── middleware/             # Express middleware
│   │   ├── auth.ts            # JWT authentication
│   │   ├── roleGuard.ts       # Role-based access control
│   │   └── errorHandler.ts    # Error handling
│   └── utils/                  # Utility functions
│       ├── authUtils.ts       # JWT & password utilities
│       └── dateUtils.ts       # Date handling utilities
├── types/                      # TypeScript type definitions
├── routes/                     # Main route configuration
└── index.ts                    # Application entry point
```

## 📚 API Endpoints

### 🔐 Authentication Module
```
POST   /api/v1/auth/admin/login          # Admin login
POST   /api/v1/auth/employee/login       # Employee login  
GET    /api/v1/auth/profile              # Get user profile
PUT    /api/v1/auth/profile              # Update user profile
POST   /api/v1/auth/change-password      # Change password
POST   /api/v1/auth/employees            # Create employee (Admin only)
POST   /api/v1/auth/logout               # User logout
```

### 👥 User Management Module (Admin Only)
```
GET    /api/v1/users/employees           # Get all employees (with filters)
GET    /api/v1/users/employees/:id       # Get employee by ID
PUT    /api/v1/users/employees/:id       # Update employee details
POST   /api/v1/users/employees/:id/activate    # Activate employee
POST   /api/v1/users/employees/:id/deactivate  # Deactivate employee
DELETE /api/v1/users/employees/:id       # Delete employee (soft delete)
GET    /api/v1/users/departments         # Get departments list
GET    /api/v1/users/sections            # Get sections list
GET    /api/v1/users/statistics          # Get employee statistics
```

### 📋 Attendance Module
```
POST   /api/v1/attendance/mark           # Mark attendance with employee details
PUT    /api/v1/attendance/:id            # Update attendance (check-out time)
GET    /api/v1/attendance/my-records     # Get attendance records (with filters)
GET    /api/v1/attendance/current-month-summary   # Current month summary
GET    /api/v1/attendance/month-summary            # Specific month summary
GET    /api/v1/attendance/today          # Check today's attendance status
GET    /api/v1/attendance/date/:date     # Check specific date attendance
GET    /api/v1/attendance/stats          # Get comprehensive attendance stats
DELETE /api/v1/attendance/date/:date     # Delete attendance record
```

### 🏥 Health & Monitoring
```
GET    /api/v1/health                    # API health status
GET    /                                 # API documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Setup project:**
```bash
cd attendance-tracker-api
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database configuration
```

3. **Setup database:**
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations  
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

4. **Start the server:**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## ⚙️ Environment Variables

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/attendance_tracker?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="development"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"
```

## 📊 Database Schema

### User Model (Roles: ADMIN, EMPLOYEE)
- `id`: Unique identifier
- `email`: User email (unique)
- `username`: Username (unique)
- `password`: Hashed password
- `role`: User role (ADMIN/EMPLOYEE)
- `employeeId`: Employee ID (unique)
- `firstName`, `lastName`: Names
- `section`, `department`, `designation`: Work details
- `phoneNumber`, `address`: Contact info
- `dateOfJoining`: Joining date
- `isActive`: Account status
- `createdBy`: Admin who created the account

### Attendance Model
- `id`: Unique identifier
- `userId`: Foreign key to User
- `date`: Attendance date (YYYY-MM-DD)
- `employeeName`: Employee full name
- `employeeId`: Employee ID for attendance record
- `section`: Employee section
- `shift`: Work shift (MORNING, AFTERNOON, EVENING, NIGHT)
- `mood`: Employee mood (EXCELLENT, GOOD, AVERAGE, POOR, TERRIBLE)
- `checkInTime`, `checkOutTime`: Time tracking
- `notes`: Optional notes
- **Unique Constraint**: (userId, date) - prevents duplicate attendance

## 🔧 API Usage Examples

### 1. Admin Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "adminpassword"
  }'
```

### 2. Create Employee (Admin Only)
```bash
curl -X POST http://localhost:3000/api/v1/auth/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "email": "john@company.com",
    "username": "john_doe",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe",
    "employeeId": "EMP001",
    "section": "IT Department",
    "department": "Technology",
    "designation": "Software Developer"
  }'
```

### 3. Employee Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/employee/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "password": "securepassword"
  }'
```

### 4. Mark Attendance (Employee)
```bash
curl -X POST http://localhost:3000/api/v1/attendance/mark \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer EMPLOYEE_JWT_TOKEN" \
  -d '{
    "employeeName": "John Doe",
    "employeeId": "EMP001",
    "section": "IT Department",
    "shift": "MORNING",
    "mood": "GOOD",
    "checkInTime": "09:00",
    "notes": "Started work on new project"
  }'
```

### 5. Get Employee List (Admin Only)
```bash
curl -X GET "http://localhost:3000/api/v1/users/employees?page=1&limit=10&department=Technology" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 6. Get Attendance Analytics
```bash
curl -X GET http://localhost:3000/api/v1/attendance/stats \
  -H "Authorization: Bearer EMPLOYEE_JWT_TOKEN"
```

## 🔒 Security Features

- **Role-Based Access Control**: Admin and Employee roles with different permissions
- **JWT Authentication**: Secure token-based authentication with role verification
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet.js**: Security headers for protection against common vulnerabilities
- **Input Validation**: Comprehensive request validation using Joi
- **Database Constraints**: Unique constraints and proper relationships

## 📈 Advanced Features

### Mood Tracking
Track employee moods to monitor workplace satisfaction:
- **EXCELLENT**: Great day, high productivity
- **GOOD**: Normal productive day
- **AVERAGE**: Regular day
- **POOR**: Not feeling great
- **TERRIBLE**: Bad day, low productivity

### Shift Management
Support for multiple work shifts:
- **MORNING**: 6 AM - 2 PM
- **AFTERNOON**: 2 PM - 10 PM  
- **EVENING**: 10 PM - 6 AM
- **NIGHT**: Custom night shifts

### Analytics & Reporting
- Monthly attendance summaries with percentages
- Mood distribution analysis
- Shift pattern analysis  
- Average working hours calculation
- Employee productivity insights

## 🛡️ Access Control Matrix

| Feature | Admin | Employee |
|---------|-------|----------|
| Login | ✅ | ✅ |
| Create Employees | ✅ | ❌ |
| View All Employees | ✅ | ❌ |
| Update Employee Details | ✅ | ❌ |
| Mark Attendance | ✅ | ✅ |
| View Own Attendance | ✅ | ✅ |
| View All Attendance | ✅ | ❌ |
| Delete Attendance | ✅ | ❌ |
| Employee Statistics | ✅ | ❌ |

## 🚦 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:reset` - Reset database (development only)

### Module Development
Each module follows the same structure:
```
module/
├── controller.ts    # Request handlers
├── service.ts      # Business logic
├── routes.ts       # Route definitions  
├── validation.ts   # Input validation schemas
└── index.ts        # Module exports
```

To add a new module:
1. Create the module directory under `src/modules/`
2. Implement controller, service, routes, and validation
3. Add the module routes to `src/routes/index.ts`
4. Update types in `src/types/index.ts` if needed

## 📜 License

MIT License - see LICENSE file for details.