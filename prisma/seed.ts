import { PrismaClient, Role, Mood, Shift } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.attendance.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.adminSettings.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // Seed Admin Settings first
  console.log('⚙️  Creating admin settings...');
  
  // Company settings
  const companySettings = [
    {
      key: 'company_name',
      value: 'TechCorp Solutions Ltd.',
      category: 'company',
      description: 'Company name displayed throughout the application'
    },
    {
      key: 'company_email',
      value: 'contact@techcorp.com',
      category: 'company',
      description: 'Main company email address'
    },
    {
      key: 'company_phone',
      value: '+880-1700-000000',
      category: 'company',
      description: 'Company phone number'
    },
    {
      key: 'company_address',
      value: 'House #123, Road #456, Gulshan-2, Dhaka-1212, Bangladesh',
      category: 'company',
      description: 'Company physical address'
    },
    {
      key: 'company_website',
      value: 'https://www.techcorp.com',
      category: 'company',
      description: 'Company website URL'
    },
    {
      key: 'timezone',
      value: 'Asia/Dhaka',
      category: 'company',
      description: 'Company timezone for all date/time operations'
    }
  ];

  // Working hours and schedule settings
  const workingHoursSettings = [
    {
      key: 'working_hours_start',
      value: '09:00',
      category: 'attendance',
      description: 'Standard working hours start time'
    },
    {
      key: 'working_hours_end',
      value: '18:00',
      category: 'attendance',
      description: 'Standard working hours end time'
    },
    {
      key: 'break_duration',
      value: 60,
      category: 'attendance',
      description: 'Break duration in minutes'
    },
    {
      key: 'grace_period',
      value: 15,
      category: 'attendance',
      description: 'Grace period for late arrival in minutes'
    },
    {
      key: 'working_days',
      value: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      category: 'attendance',
      description: 'Standard working days of the week'
    },
    {
      key: 'overtime_rate',
      value: 1.5,
      category: 'attendance',
      description: 'Overtime pay rate multiplier'
    },
    {
      key: 'minimum_working_hours',
      value: 8,
      category: 'attendance',
      description: 'Minimum required working hours per day'
    }
  ];

  // Email/SMTP settings
  const emailSettings = [
    {
      key: 'smtp_host',
      value: 'smtp.gmail.com',
      category: 'email',
      description: 'SMTP server host'
    },
    {
      key: 'smtp_port',
      value: 587,
      category: 'email',
      description: 'SMTP server port'
    },
    {
      key: 'smtp_secure',
      value: true,
      category: 'email',
      description: 'Use secure connection for SMTP'
    },
    {
      key: 'smtp_user',
      value: 'noreply@techcorp.com',
      category: 'email',
      description: 'SMTP authentication username'
    },
    {
      key: 'smtp_password',
      value: 'your-app-password-here',
      category: 'email',
      description: 'SMTP authentication password'
    },
    {
      key: 'email_from_address',
      value: 'noreply@techcorp.com',
      category: 'email',
      description: 'From email address for outgoing emails'
    },
    {
      key: 'email_from_name',
      value: 'TechCorp Attendance System',
      category: 'email',
      description: 'From name for outgoing emails'
    },
    {
      key: 'admin_emails',
      value: ['admin@techcorp.com', 'hr@techcorp.com'],
      category: 'email',
      description: 'Admin email addresses for notifications'
    },
    {
      key: 'daily_reminder_time',
      value: '13:00',
      category: 'email',
      description: 'Time to send daily attendance reminders'
    },
    {
      key: 'end_of_day_report_time',
      value: '18:30',
      category: 'email',
      description: 'Time to send end of day reports'
    },
    {
      key: 'weekly_report_day',
      value: 1,
      category: 'email',
      description: 'Day of week to send weekly reports (1=Monday)'
    },
    {
      key: 'weekly_report_time',
      value: '09:00',
      category: 'email',
      description: 'Time to send weekly reports'
    },
    {
      key: 'enable_email_notifications',
      value: true,
      category: 'email',
      description: 'Enable email notifications system wide'
    },
    {
      key: 'enable_daily_reminders',
      value: true,
      category: 'email',
      description: 'Enable daily attendance reminder emails'
    },
    {
      key: 'enable_weekly_reports',
      value: true,
      category: 'email',
      description: 'Enable weekly attendance report emails'
    }
  ];

  // System settings (excluding password settings to avoid duplicates)
  const systemSettings = [
    {
      key: 'session_timeout',
      value: 8,
      category: 'system',
      description: 'User session timeout in hours'
    },
    {
      key: 'max_login_attempts',
      value: 5,
      category: 'system',
      description: 'Maximum login attempts before account lockout'
    },
    {
      key: 'lockout_duration',
      value: 30,
      category: 'system',
      description: 'Account lockout duration in minutes'
    },
    {
      key: 'backup_retention_days',
      value: 30,
      category: 'system',
      description: 'Number of days to retain backup files'
    },
    {
      key: 'enable_api_rate_limiting',
      value: true,
      category: 'security',
      description: 'Enable or disable API rate limiting'
    },
    {
      key: 'api_rate_limit_max_requests',
      value: 10000,
      category: 'security',
      description: 'Maximum API requests allowed per window'
    },
    {
      key: 'api_rate_limit_window_minutes',
      value: 15,
      category: 'security',
      description: 'Time window for rate limiting in minutes'
    }
  ];

  // Password validation settings (keys must match validationService expectations)
  const passwordSettings = [
    {
      key: 'password_min_length',
      value: 8,
      category: 'security',
      description: 'Minimum password length required'
    },
    {
      key: 'password_require_uppercase',
      value: true,
      category: 'security',
      description: 'Require at least one uppercase letter'
    },
    {
      key: 'password_require_lowercase',
      value: true,
      category: 'security',
      description: 'Require at least one lowercase letter'
    },
    {
      key: 'password_require_number',
      value: true,
      category: 'security',
      description: 'Require at least one number'
    },
    {
      key: 'password_require_special',
      value: true,
      category: 'security',
      description: 'Require at least one special character'
    },
    {
      key: 'password_special_characters',
      value: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      category: 'security',
      description: 'Allowed special characters for passwords'
    },
    {
      key: 'username_min_length',
      value: 3,
      category: 'security',
      description: 'Minimum username length'
    },
    {
      key: 'username_max_length',
      value: 30,
      category: 'security',
      description: 'Maximum username length'
    },
    {
      key: 'username_allow_special',
      value: false,
      category: 'security',
      description: 'Allow special characters in usernames'
    }
  ];

  // Report settings
  const reportSettings = [
    {
      key: 'default_report_format',
      value: 'PDF',
      category: 'reports',
      description: 'Default format for generated reports'
    },
    {
      key: 'include_attendance_charts',
      value: true,
      category: 'reports',
      description: 'Include charts in attendance reports'
    },
    {
      key: 'report_date_format',
      value: 'DD/MM/YYYY',
      category: 'reports',
      description: 'Date format used in reports'
    },
    {
      key: 'auto_generate_monthly_reports',
      value: true,
      category: 'reports',
      description: 'Automatically generate monthly reports'
    },
    {
      key: 'monthly_report_generation_day',
      value: 1,
      category: 'reports',
      description: 'Day of month to generate monthly reports'
    }
  ];

  // User management settings (used by UserSettingsService)
  const userManagementSettings = [
    {
      key: 'user.passwordPolicy',
      value: {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        preventCommonPasswords: true,
        preventUserInfo: true,
        expirationDays: 90,
        historyCount: 5
      },
      category: 'user',
      description: 'Password security requirements and policies'
    },
    {
      key: 'user.registrationPolicy',
      value: {
        allowSelfRegistration: false,
        requireEmailVerification: true,
        requireAdminApproval: true,
        allowedEmailDomains: [],
        blockedEmailDomains: [],
        defaultRole: 'EMPLOYEE',
        autoActivateAccounts: false,
        requireInvitation: true
      },
      category: 'user',
      description: 'User registration and account creation policies'
    },
    {
      key: 'user.lockoutRules',
      value: {
        enabled: true,
        maxFailedAttempts: 5,
        lockoutDurationMinutes: 30,
        resetFailedAttemptsAfterMinutes: 60,
        notifyAdminOnLockout: true,
        allowSelfUnlock: false,
        progressiveDelay: true
      },
      category: 'user',
      description: 'Account lockout and security policies'
    },
    {
      key: 'user.sessionSettings',
      value: {
        sessionTimeoutMinutes: 480,
        allowMultipleSessions: true,
        forceLogoutOnPasswordChange: true,
        rememberMeDays: 30,
        requireReauthForSensitive: true
      },
      category: 'user',
      description: 'User session and authentication settings'
    },
    {
      key: 'user.profileFields',
      value: [
        { fieldName: 'firstName', required: true, visible: true, editable: true, fieldType: 'text', validation: { minLength: 1, maxLength: 50 } },
        { fieldName: 'lastName', required: true, visible: true, editable: true, fieldType: 'text', validation: { minLength: 1, maxLength: 50 } },
        { fieldName: 'email', required: true, visible: true, editable: true, fieldType: 'email' },
        { fieldName: 'phone', required: false, visible: true, editable: true, fieldType: 'phone' },
        { fieldName: 'department', required: false, visible: true, editable: true, fieldType: 'select', validation: { options: ['HR', 'IT', 'Finance', 'Operations', 'Administration', 'Engineering'] } },
        { fieldName: 'position', required: false, visible: true, editable: true, fieldType: 'text' },
        { fieldName: 'startDate', required: false, visible: true, editable: true, fieldType: 'date' }
      ],
      category: 'user',
      description: 'User profile field configuration and validation rules'
    }
  ];

  // Email notification settings (used by EmailSettingsService)
  const emailNotificationSettings = [
    {
      key: 'email.smtp',
      value: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.EMAIL_FROM || 'noreply@attendance.com'
      },
      category: 'email',
      description: 'SMTP server configuration for email sending'
    },
    {
      key: 'email.notifications',
      value: {
        timezone: 'Asia/Dhaka',
        dailyReminder: {
          enabled: true,
          cronExpression: '0 13 * * 1-5'
        },
        weeklyReport: {
          enabled: true,
          cronExpression: '0 9 * * 1'
        },
        endOfDay: {
          enabled: true,
          cronExpression: '0 18 * * 1-5'
        }
      },
      category: 'email',
      description: 'Email notification scheduling configuration'
    }
  ];

  // Combine all settings
  const allSettings = [
    ...companySettings,
    ...workingHoursSettings,
    ...emailSettings,
    ...systemSettings,
    ...passwordSettings,
    ...reportSettings,
    ...userManagementSettings,
    ...emailNotificationSettings
  ];

  // Create admin settings (using upsert to avoid duplicates)
  for (const setting of allSettings) {
    await prisma.adminSettings.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        category: setting.category,
        description: setting.description,
        isActive: true
      },
      create: {
        key: setting.key,
        value: setting.value,
        category: setting.category,
        description: setting.description,
        isActive: true
      }
    });
  }

  console.log(`✅ Created ${allSettings.length} admin settings`);

  // Create Admin User
  console.log('👑 Creating admin user...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@company.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN,
      isActive: true,
      employeeId: 'ADMIN001',
      section: 'Administration',
      department: 'Management'
    }
  });

  // Realistic names for employees
  const employeeNames = [
    { firstName: 'Ahmed', lastName: 'Rahman' },
    { firstName: 'Fatima', lastName: 'Khan' },
    { firstName: 'Mohammad', lastName: 'Hassan' },
    { firstName: 'Ayesha', lastName: 'Ahmed' },
    { firstName: 'Omar', lastName: 'Ali' },
    { firstName: 'Zara', lastName: 'Sheikh' },
    { firstName: 'Hassan', lastName: 'Mahmud' },
    { firstName: 'Nadia', lastName: 'Sultana' },
    { firstName: 'Imran', lastName: 'Hossain' },
    { firstName: 'Sadia', lastName: 'Begum' },
    { firstName: 'Karim', lastName: 'Uddin' },
    { firstName: 'Rashida', lastName: 'Khatun' },
    { firstName: 'Tariq', lastName: 'Islam' },
    { firstName: 'Mariam', lastName: 'Akter' },
    { firstName: 'Nasir', lastName: 'Ahmed' },
    { firstName: 'Samira', lastName: 'Rahman' },
    { firstName: 'Fahad', lastName: 'Khan' },
    { firstName: 'Ruma', lastName: 'Begum' },
    { firstName: 'Salim', lastName: 'Miah' },
    { firstName: 'Sabina', lastName: 'Yasmin' },
    { firstName: 'Rafiq', lastName: 'Uddin' },
    { firstName: 'Nasreen', lastName: 'Sultana' },
    { firstName: 'Jahangir', lastName: 'Alam' },
    { firstName: 'Shireen', lastName: 'Akhter' },
    { firstName: 'Mizanur', lastName: 'Rahman' },
    { firstName: 'Roksana', lastName: 'Begum' },
    { firstName: 'Abdur', lastName: 'Razzaq' },
    { firstName: 'Nasima', lastName: 'Khatun' },
    { firstName: 'Kamrul', lastName: 'Hasan' },
    { firstName: 'Shahida', lastName: 'Begum' },
    { firstName: 'Mostafa', lastName: 'Karim' },
    { firstName: 'Rehana', lastName: 'Parvin' },
    { firstName: 'Shamsul', lastName: 'Haque' },
    { firstName: 'Maksuda', lastName: 'Begum' },
    { firstName: 'Aminul', lastName: 'Islam' }
  ];

  const departments = [
    'IT', 'HR', 'Finance', 'Marketing', 'Operations', 
    'Sales', 'Customer Service', 'Quality Assurance', 'R&D'
  ];

  const sections = [
    'Development', 'Testing', 'Support', 'Analysis', 'Design',
    'Recruitment', 'Training', 'Payroll', 'Administration',
    'Accounting', 'Audit', 'Planning', 'Digital Marketing',
    'Content', 'SEO', 'Operations Management', 'Logistics',
    'Inside Sales', 'Field Sales', 'Account Management',
    'Technical Support', 'Customer Relations', 'Manual Testing',
    'Automation Testing', 'Performance Testing', 'Research',
    'Product Development'
  ];

  // Create employees
  console.log('👥 Creating employees...');
  const employees = [];
  
  for (let i = 0; i < employeeNames.length; i++) {
    const employeeNumber = String(i + 1).padStart(3, '0');
    const employee = await prisma.user.create({
      data: {
        email: `user${i + 1}@company.com`,
        username: `user${i + 1}`,
        password: hashedPassword,
        firstName: employeeNames[i].firstName,
        lastName: employeeNames[i].lastName,
        role: Role.EMPLOYEE,
        isActive: true,
        employeeId: `EMP${employeeNumber}`,
        section: sections[Math.floor(Math.random() * sections.length)],
        department: departments[Math.floor(Math.random() * departments.length)]
      }
    });
    employees.push(employee);
  }

  console.log(`✅ Created ${employees.length} employees`);

  // Generate attendance data from June 2025 to December 2025
  console.log('📅 Generating attendance data...');
  
  const moods = [
    Mood.EXCELLENT,
    Mood.GOOD, 
    Mood.AVERAGE,
    Mood.POOR,
    Mood.TERRIBLE
  ];

  const shifts = [
    Shift.MORNING,
    Shift.AFTERNOON,
    Shift.EVENING
  ];

  // Generate dates from June 1, 2025 to December 24, 2025 (weekdays only)
  const startDate = new Date('2025-06-01');
  const endDate = new Date('2025-12-24');
  const attendanceData = [];

  for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
    // Skip weekends
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      continue;
    }

    // Skip some holidays
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    
    // Skip some common holidays (simplified)
    if (
      (month === 8 && day === 15) || // Independence Day
      (month === 12 && day === 16) || // Victory Day
      (month === 12 && day === 25)    // Christmas
    ) {
      continue;
    }

    for (const employee of employees) {
      // 85% attendance rate (some employees will be absent)
      if (Math.random() < 0.85) {
        const checkInTime = new Date(currentDate);
        checkInTime.setHours(9, Math.floor(Math.random() * 60)); // 9:00-9:59 AM
        
        const checkOutTime = new Date(checkInTime);
        checkOutTime.setHours(checkInTime.getHours() + 8 + Math.floor(Math.random() * 2)); // 8-9 hours later
        
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const shift = shifts[Math.floor(Math.random() * shifts.length)];
        
        // Weight moods realistically
        let selectedMood = mood;
        const moodRandom = Math.random();
        if (moodRandom < 0.3) selectedMood = Mood.EXCELLENT;
        else if (moodRandom < 0.6) selectedMood = Mood.GOOD;
        else if (moodRandom < 0.8) selectedMood = Mood.AVERAGE;
        else if (moodRandom < 0.95) selectedMood = Mood.POOR;
        else selectedMood = Mood.TERRIBLE;

        attendanceData.push({
          userId: employee.id,
          date: new Date(currentDate),
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeId: employee.employeeId || `EMP${String(employees.indexOf(employee) + 1).padStart(3, '0')}`,
          section: employee.section || 'General',
          shift: shift,
          mood: selectedMood,
          checkInTime,
          checkOutTime: Math.random() < 0.9 ? checkOutTime : null,
          notes: Math.random() < 0.1 ? 'Regular work day' : null
        });
      }
    }
  }

  // Batch insert attendance records
  console.log('💾 Inserting attendance records...');
  const batchSize = 1000;
  for (let i = 0; i < attendanceData.length; i += batchSize) {
    const batch = attendanceData.slice(i, i + batchSize);
    await prisma.attendance.createMany({
      data: batch,
      skipDuplicates: true
    });
    console.log(`Inserted ${Math.min(i + batchSize, attendanceData.length)}/${attendanceData.length} attendance records`);
  }

  // Create some password reset tokens for testing
  console.log('🔑 Creating sample password reset tokens...');
  await prisma.passwordReset.create({
    data: {
      userId: employees[0].id, // First employee
      token: 'sample-reset-token-123',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    }
  });

  // Summary
  const totalUsers = await prisma.user.count();
  const totalAttendance = await prisma.attendance.count();
  const totalSettings = await prisma.adminSettings.count();
  const totalWorkingDays = attendanceData.length / employees.length;

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Seeding Summary:');
  console.log(`👑 Admin users: 1`);
  console.log(`👥 Employees: ${employees.length}`);
  console.log(`📝 Total users: ${totalUsers}`);
  console.log(`📅 Attendance records: ${totalAttendance}`);
  console.log(`⚙️  Admin settings: ${totalSettings}`);
  console.log(`🗓️  Working days covered: ~${Math.floor(totalWorkingDays)} days`);
  console.log(`📈 Average attendance rate: ~85%`);
  console.log(`🔐 Password for all users: Password@123`);
  console.log(`📧 Admin email: admin@company.com`);
  console.log(`📧 Employee emails: user1@company.com to user${employees.length}@company.com`);
  
  console.log('\n🔑 Login Credentials:');
  console.log('Admin: admin@company.com / Password@123');
  console.log('Employee examples:');
  console.log('  - EMP001 / Password@123 (user1@company.com)');
  console.log('  - EMP002 / Password@123 (user2@company.com)');
  console.log('  - ... and so on');
  
  console.log('\n📝 Sample Employee IDs:');
  employees.slice(0, 5).forEach((emp, index) => {
    console.log(`  - ${emp.employeeId}: ${emp.firstName} ${emp.lastName} (${emp.department} - ${emp.section})`);
  });
  console.log(`  - ... and ${employees.length - 5} more employees`);
  
  console.log('\n⚙️  Settings Categories Seeded:');
  console.log('  - Company Settings: Basic company information');
  console.log('  - Attendance Settings: Working hours, grace periods, etc.');
  console.log('  - Email Settings: SMTP configuration and notification schedules');
  console.log('  - System Settings: Security, sessions, and system preferences');
  console.log('  - Report Settings: Default report configurations');
  
  console.log('\n🏢 Company Details:');
  console.log('  - Name: TechCorp Solutions Ltd.');
  console.log('  - Email: contact@techcorp.com');
  console.log('  - Phone: +880-1700-000000');
  console.log('  - Website: https://www.techcorp.com');
  console.log('  - Timezone: Asia/Dhaka');
  console.log('  - Working Hours: 09:00 - 18:00');
  console.log('  - Working Days: Monday to Friday');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });