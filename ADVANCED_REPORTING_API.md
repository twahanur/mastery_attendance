# Attendance Tracker API - Advanced Reporting & Email Notifications

## Overview
The Attendance Tracker API now includes comprehensive reporting capabilities and automated email notification system. This documentation covers the new advanced features implemented.

---

## 📧 Email Notification System

### Automated Daily Reminders
- **Schedule**: Every day at 1:00 PM
- **Recipients**: Employees who haven't marked attendance for the current day
- **Content**: Professional reminder email with company branding
- **Activation**: Automatically starts when the server starts

### Email Configuration
Set the following environment variables in your `.env` file:
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@company.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@company.com
FROM_NAME=Attendance Tracker
```

---

## 📊 Advanced Reporting System

### Authentication Required
All report endpoints require authentication. Include JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🗓️ Daily Reports

### Get Daily Report (JSON)
```http
GET /api/v1/reports/daily?date=2024-01-15
```

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format. Defaults to today.

**Response Example:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "totalEmployees": 50,
    "presentCount": 42,
    "absentCount": 8,
    "attendancePercentage": 84,
    "presentEmployees": [...],
    "absentEmployees": [
      {
        "employeeId": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "section": "Development",
        "department": "IT"
      }
    ],
    "lateArrivals": [...],
    "shiftDistribution": {
      "MORNING": 25,
      "EVENING": 17
    },
    "moodDistribution": {
      "HAPPY": 30,
      "NEUTRAL": 10,
      "TIRED": 2
    }
  }
}
```

### Download Daily Report (PDF)
```http
GET /api/v1/reports/daily/pdf?date=2024-01-15
```
Returns a PDF file for download.

---

## 📅 Weekly Reports

### Get Weekly Report (JSON)
```http
GET /api/v1/reports/weekly?startDate=2024-01-08
```

**Query Parameters:**
- `startDate` (optional): Week start date in YYYY-MM-DD format. Defaults to current week.

**Response Example:**
```json
{
  "success": true,
  "data": {
    "weekStart": "2024-01-08",
    "weekEnd": "2024-01-14",
    "totalEmployees": 50,
    "averageAttendance": 87,
    "dailyStats": [
      {
        "date": "2024-01-08",
        "dayName": "Monday",
        "presentCount": 45,
        "absentCount": 5,
        "attendancePercentage": 90
      }
    ],
    "perfectAttendees": [...],
    "frequentAbsentees": [...],
    "departmentStats": [...]
  }
}
```

### Download Weekly Report (PDF)
```http
GET /api/v1/reports/weekly/pdf?startDate=2024-01-08
```

---

## 🗓️ Monthly Reports

### Get Monthly Report (JSON)
```http
GET /api/v1/reports/monthly?year=2024&month=1
```

**Query Parameters:**
- `year` (optional): Year (default: current year)
- `month` (optional): Month 1-12 (default: current month)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 1,
    "monthName": "January",
    "totalEmployees": 50,
    "totalWorkingDays": 22,
    "averageAttendance": 89,
    "employeeStats": [
      {
        "employeeId": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "section": "Development",
        "attendanceDays": 20,
        "absentDays": 2,
        "attendancePercentage": 91
      }
    ],
    "departmentStats": [...]
  }
}
```

### Download Monthly Report (PDF)
```http
GET /api/v1/reports/monthly/pdf?year=2024&month=1
```

---

## 👤 Employee-Specific Reports

### Get Employee Report (JSON)
```http
GET /api/v1/reports/employee/EMP001?startDate=2024-01-01&endDate=2024-01-31
```

**Path Parameters:**
- `employeeId`: Employee ID

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Access Control:**
- **Admins**: Can view any employee's report
- **Employees**: Can only view their own report

**Response Example:**
```json
{
  "success": true,
  "data": {
    "employee": {
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "section": "Development",
      "department": "IT"
    },
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "statistics": {
      "workingDays": 22,
      "presentDays": 20,
      "absentDays": 2,
      "attendancePercentage": 91
    },
    "attendances": [...],
    "moodAnalysis": {
      "distribution": [
        { "mood": "HAPPY", "count": 15, "percentage": 75 },
        { "mood": "NEUTRAL", "count": 5, "percentage": 25 }
      ],
      "dominantMood": "HAPPY"
    },
    "punctualityAnalysis": {
      "punctualityPercentage": 95,
      "onTime": 19,
      "late": 1,
      "averageLateBy": "5 minutes"
    }
  }
}
```

### Download Employee Report (PDF)
```http
GET /api/v1/reports/employee/EMP001/pdf?startDate=2024-01-01&endDate=2024-01-31
```

---

## 🏢 Department Comparison Reports

### Get Department Report (JSON)
```http
GET /api/v1/reports/department?startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "department": "IT",
      "totalEmployees": 25,
      "totalAttendances": 520,
      "attendancePercentage": 94
    },
    {
      "department": "HR",
      "totalEmployees": 8,
      "totalAttendances": 168,
      "attendancePercentage": 95
    }
  ]
}
```

### Download Department Report (PDF)
```http
GET /api/v1/reports/department/pdf?startDate=2024-01-01&endDate=2024-01-31
```

---

## 📈 Attendance Summary

### Get Quick Summary Statistics
```http
GET /api/v1/reports/summary
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "today": {
      "date": "2024-01-15",
      "presentCount": 42,
      "absentCount": 8,
      "attendancePercentage": 84
    },
    "thisWeek": {
      "averageAttendance": 87,
      "bestDay": "Monday (95%)",
      "worstDay": "Friday (78%)"
    },
    "thisMonth": {
      "averageAttendance": 89,
      "totalWorkingDays": 22,
      "perfectAttendees": 15
    },
    "trends": {
      "comparedToLastWeek": "+2.5%",
      "comparedToLastMonth": "+1.8%"
    }
  }
}
```

---

## 🔐 Access Control

### Admin Access
Admins can access all reporting endpoints and view all data.

### Employee Access
Employees have limited access:
- Can only view their own employee-specific reports
- Cannot access daily, weekly, monthly, or department reports
- Cannot access summary statistics

---

## 📧 Email Notification Features

### Daily Attendance Reminders
- **Trigger**: 1:00 PM every day (configurable)
- **Recipients**: Employees who haven't marked attendance
- **Content**: Professional HTML email with:
  - Employee name personalization
  - Current date
  - Attendance marking URL
  - Company branding
  - Mobile-friendly design

### Weekly Reports (Future Feature)
- Automated weekly summary reports sent to admins
- Department-wise performance analysis
- Trend notifications

---

## 🛠️ Technical Implementation

### Email Service Architecture
```typescript
// Email service with HTML templates
EmailService.sendAttendanceReminder(employee)
EmailService.sendWeeklyReport(reportData, recipientEmails)
```

### Scheduled Jobs
```typescript
// Cron job configuration
ScheduleManager.getInstance().startSchedules()
// Runs daily at 1:00 PM: '0 13 * * 1-5'
```

### PDF Generation
- Uses Puppeteer for high-quality PDF generation
- Professional formatting with company branding
- Charts and graphs for visual data representation
- Downloadable attachments for email reports

### Database Optimization
- Efficient queries for large datasets
- Indexed attendance tables for fast report generation
- Aggregated statistics for dashboard performance

---

## 🚀 Deployment Notes

### Environment Variables
Ensure all email configuration variables are set in production:
```env
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@company.com
SMTP_PASS=your-secure-app-password
FROM_EMAIL=noreply@yourcompany.com
FROM_NAME=Your Company Attendance System
```

### Vercel Configuration
The system is ready for Vercel deployment with:
- Serverless function compatibility
- Email sending capabilities
- PDF generation support
- Automated scheduling (note: may require external cron service in production)

### Performance Considerations
- Report generation is optimized for up to 1000+ employees
- PDF generation may take 5-10 seconds for large datasets
- Email sending is batched to prevent rate limiting
- Database queries are optimized with proper indexing

---

## 📞 Support & Maintenance

### Monitoring Email Delivery
- Check SMTP logs for delivery issues
- Monitor email bounce rates
- Verify email templates render correctly

### Report Performance
- Monitor report generation times
- Check PDF file sizes
- Optimize database queries if needed

### Scheduled Jobs
- Verify cron jobs are running correctly
- Check server logs for scheduling errors
- Monitor email notification success rates

---

This comprehensive reporting and notification system provides enterprise-level features for attendance tracking with professional email communications and detailed analytics.