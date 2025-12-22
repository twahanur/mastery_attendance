# Attendance Tracker API - Complete Test Guide

## 📖 Overview
This document provides comprehensive testing instructions for the Advanced Attendance Tracker API using the complete Postman collection that includes all recent enhancements.

## 🛠️ Quick Setup

### Import to Postman
1. Import `Attendance_Tracker_Complete.postman_collection.json`
2. Import `Attendance_Tracker_Production.postman_environment.json`
3. Import `Attendance_Tracker_Local.postman_environment.json`
4. Select appropriate environment

## 🔥 Instant Test Workflow

### 1. System Verification
```
Health Check → Verify API is running
```

### 2. Admin Authentication & Dashboard
```
Admin Login (Unified) → Dashboard Statistics → Review system overview
```

### 3. Employee Management Testing
```
Get All Employees → Create Employee → Get Employee by ID → Update Employee
```

### 4. Employee Authentication & Attendance
```
Employee Login (Unified) → Mark Attendance → My Attendance Records → My Stats
```

### 5. Advanced Reporting
```
Daily Report (JSON) → Daily Report (PDF) → Weekly Report → Monthly Report
```

### 6. Role-based Report Access
```
Admin: Employee Report → Employee: My Report → Department Comparison
```

## 📊 New Features Testing

### Simplified Attendance Marking
```json
{
  "date": "2024-12-23",
  "mood": "HAPPY"
}
```
Only date and mood required - check-in time auto-recorded!

### Advanced PDF Reports
Test all PDF endpoints:
- `/reports/daily/pdf`
- `/reports/weekly/pdf` 
- `/reports/monthly/pdf`
- `/reports/employee/:id/pdf`
- `/reports/department/pdf`

### Unified Login System
Single endpoint for both admin and employee login:
- Admin: Use email + password
- Employee: Use employeeId + password

### Department & Section Analytics
- `/users/departments` - Get departments with employee lists
- `/users/sections` - Get sections with employee lists
- Perfect for organizational reporting!

## 🎯 Testing Scenarios

### Scenario A: New Employee Onboarding
1. Admin creates employee
2. Employee logs in for first time  
3. Employee marks first attendance
4. Admin generates employee report
5. Verify all data is correctly captured

### Scenario B: Monthly Reporting Cycle
1. Generate monthly report (JSON)
2. Download monthly report (PDF)
3. Compare department performance
4. Export individual employee reports
5. Validate data accuracy

### Scenario C: System Administration
1. Check dashboard statistics
2. Review all employees
3. Update employee information
4. Generate system-wide reports
5. Monitor attendance patterns

## 🔍 Advanced Testing Tips

### Date Range Testing
Update environment variables:
- `currentDate`: Today's date
- `startDate`: Report period start
- `endDate`: Report period end
- `year`: Current year
- `month`: Current month

### PDF Response Validation
```javascript
pm.test('PDF response is valid', () => {
    pm.expect(pm.response.headers.get('Content-Type')).to.include('application/pdf');
    pm.expect(pm.response.responseSize).to.be.above(1000);
});
```

### Token Management
Tokens are automatically captured and managed:
- `adminToken`: Admin authentication
- `employeeToken`: Employee authentication
- `authToken`: Current active token

## 🚨 Common Issues & Solutions

### Issue: Authentication Failed
**Solution**: Verify environment selection and credentials

### Issue: PDF Not Downloading
**Solution**: Check Content-Type header, save response as file

### Issue: Report Generation Failed
**Solution**: Verify date formats (YYYY-MM-DD) and admin access

### Issue: Employee Not Found
**Solution**: Create employee first or check employee ID format

## 📈 Performance Testing

### Response Time Validation
All requests include automatic performance testing:
```javascript
pm.test('Response time under 30 seconds', () => {
    pm.expect(pm.response.responseTime).to.be.below(30000);
});
```

### Bulk Testing
Use the "Complete Workflow Test" folder to run comprehensive tests:
1. Admin Login
2. Create Test Employee  
3. Employee Login
4. Mark Attendance
5. Generate Reports
6. Cleanup

## 🔐 Security Testing

### Role-based Access
- Test admin-only endpoints with employee token (should fail)
- Test employee access to own data only
- Verify token expiration handling

### Data Validation
- Test with invalid date formats
- Test with missing required fields
- Test with invalid employee IDs

## 📋 API Coverage Summary

| Feature | Endpoints | Testing Status |
|---------|-----------|----------------|
| Authentication | 2 | ✅ Complete |
| User Management | 8 | ✅ Complete |
| Attendance | 5 | ✅ Complete |
| Advanced Reports | 12 | ✅ Complete |
| Email System | 1 | ✅ Complete |
| System Status | 1 | ✅ Complete |

**Total Endpoints**: 29
**Test Coverage**: 100%

## 🎉 Ready to Test!

Your complete Postman collection includes:
- ✅ 29 comprehensive API endpoints
- ✅ Automated token management  
- ✅ PDF report generation
- ✅ Role-based access testing
- ✅ Complete workflow scenarios
- ✅ Production and local environments

Start with the **Complete Workflow Test** for a full system validation!