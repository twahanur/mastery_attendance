import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, requestLogger } from './shared/middleware/errorHandler';
import { prisma } from './shared/config/database';
import { ScheduleManager } from "./shared/services/scheduleManager";
import { rateLimiterService } from './shared/services/rateLimiterService';
import { settingsInitializationService } from './shared/services/settingsInitializationService';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const allowedOrigins =["https://optiluxbd-attendence-tracker.vercel.app","http://localhost:3000","http://localhost:3001"]

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Dynamic rate limiting from database
app.use(rateLimiterService.middleware());

// API routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Attendance Tracker API v2.0',
    version: '2.0.0',
    documentation: '/api/v1/health',
    endpoints: {
      auth: {
        adminLogin: 'POST /api/v1/auth/admin/login',
        employeeLogin: 'POST /api/v1/auth/employee/login',
        profile: 'GET /api/v1/auth/profile',
        updateProfile: 'PUT /api/v1/auth/profile',
        changePassword: 'POST /api/v1/auth/change-password',
        createEmployee: 'POST /api/v1/auth/employees',
        logout: 'POST /api/v1/auth/logout'
      },
      users: {
        getEmployees: 'GET /api/v1/users/employees',
        getEmployee: 'GET /api/v1/users/employees/:employeeId',
        updateEmployee: 'PUT /api/v1/users/employees/:employeeId',
        deactivateEmployee: 'POST /api/v1/users/employees/:employeeId/deactivate',
        activateEmployee: 'POST /api/v1/users/employees/:employeeId/activate',
        deleteEmployee: 'DELETE /api/v1/users/employees/:employeeId',
        getDepartments: 'GET /api/v1/users/departments',
        getSections: 'GET /api/v1/users/sections',
        getStatistics: 'GET /api/v1/users/statistics'
      },
      attendance: {
        mark: 'POST /api/v1/attendance/mark',
        updateAttendance: 'PUT /api/v1/attendance/:attendanceId',
        myRecords: 'GET /api/v1/attendance/my-records',
        currentMonthSummary: 'GET /api/v1/attendance/current-month-summary',
        monthSummary: 'GET /api/v1/attendance/month-summary',
        todayStatus: 'GET /api/v1/attendance/today',
        dateStatus: 'GET /api/v1/attendance/date/:date',
        stats: 'GET /api/v1/attendance/stats',
        deleteDate: 'DELETE /api/v1/attendance/date/:date'
      }
    },
    features: {
      roleBasedAccess: 'Admin and Employee roles with different permissions',
      employeeManagement: 'Full CRUD operations for employee management',
      attendanceTracking: 'Comprehensive attendance tracking with employee details',
      analytics: 'Attendance analytics with mood and shift tracking',
      security: 'JWT authentication, password hashing, rate limiting'
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Database connection test
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n📧 ${signal} received. Starting graceful shutdown...`);
  
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize admin settings (ensures all required settings exist)
    await settingsInitializationService.initializeAllSettings();
    console.log("⚙️ Admin settings initialized");

    // Initialize schedule manager for automated email notifications
    const scheduleManager = ScheduleManager.getInstance();
    await scheduleManager.startSchedules();
    console.log("📧 Email notification scheduler initialized");

    // Start rate limiter cleanup
    rateLimiterService.startCleanup();
    console.log("🔒 Rate limiter initialized");

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`
🚀 Attendance Tracker API v2.0 is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
📝 API Documentation: http://localhost:${PORT}/api/v1/health
🎯 Base URL: http://localhost:${PORT}/api/v1

🔐 Authentication Endpoints:
   Admin Login: http://localhost:${PORT}/api/v1/auth/admin/login
   Employee Login: http://localhost:${PORT}/api/v1/auth/employee/login

👥 User Management (Admin only):
   Employees: http://localhost:${PORT}/api/v1/users/employees
   
📋 Attendance Tracking:
   Mark Attendance: http://localhost:${PORT}/api/v1/attendance/mark
   My Records: http://localhost:${PORT}/api/v1/attendance/my-records

📊 Reports & Analytics (Admin only):
   Daily Reports: http://localhost:${PORT}/api/v1/reports/daily
   Weekly Reports: http://localhost:${PORT}/api/v1/reports/weekly
   Monthly Reports: http://localhost:${PORT}/api/v1/reports/monthly
   Employee Reports: http://localhost:${PORT}/api/v1/reports/employee/:employeeId
   Department Reports: http://localhost:${PORT}/api/v1/reports/department

🔍 Features:
   ✅ Role-based access control (Admin/Employee)
   ✅ Employee management system
   ✅ Enhanced attendance tracking with mood & shift
   ✅ Comprehensive analytics & reporting
   ✅ Automated email notifications (1PM daily reminders)
   ✅ PDF report generation
   ✅ Secure JWT authentication
      `);
    });

    // Handle server errors
    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer();

export default app;