# Quick Start Guide for Postman Testing

## Prerequisites
- Node.js and npm installed
- Postman application installed
- Database connection configured

## Step 1: Setup the Database and Admin User

```bash
# Navigate to project directory
cd /home/twahanur/programming/official/mastery/Attendence

# Install dependencies (if not already done)
npm install

# Run database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Create initial admin user
npm run setup:admin
```

## Step 2: Start the Server

```bash
# Start the development server
npm run dev
```

The server should start on `http://localhost:3000`

## Step 3: Import Postman Collection

1. Open Postman
2. Click **Import** → **Upload Files**
3. Import these files:
   - `postman/Attendance_Tracker_API.postman_collection.json`
   - `postman/Attendance_Tracker_Local.postman_environment.json`
4. Select the **"Attendance Tracker - Local"** environment

## Step 4: Test the API

### Quick Test Sequence:

1. **Health Check**
   - Run `Health Check` request
   - Should return `200 OK` with API status

2. **Admin Login**
   - Run `Authentication > Admin Login`
   - Uses: `admin@company.com` / `admin123`
   - Automatically saves `adminToken` to environment

3. **Create Employee**
   - Run `Authentication > Create Employee (Admin Only)`
   - Creates sample employee: `john.doe@company.com` / `employee123`

4. **Employee Login**
   - Run `Authentication > Employee Login` 
   - Uses employee ID: `EMP001` / `employee123`
   - Automatically saves `employeeToken` to environment

5. **Mark Attendance**
   - Run `Attendance Management > Mark Attendance`
   - Creates today's attendance record

6. **Check Attendance**
   - Run `Attendance Management > Check Today's Attendance`
   - Verifies the record was created

## Default Credentials

**Admin:**
- Email: `admin@company.com`
- Password: `admin123`

**Employee (after creation):**
- Employee ID: `EMP001`
- Password: `employee123`

## Troubleshooting

- **Server not starting:** Check database connection in `.env` file
- **Admin login fails:** Run `npm run setup:admin` to create admin user
- **Database errors:** Ensure database is running and migrations are applied
- **Postman 401 errors:** Check that correct environment is selected and tokens are set

## Environment Variables

Make sure your `.env` file has:
```
# Database
DATABASE_URL=your_database_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@mastery.com

# Password Reset
PASSWORD_RESET_EXPIRES_IN=1h
FRONTEND_URL=http://localhost:3000
```

**Email Setup Notes:**
- For Gmail, use your Gmail address and create an App Password
- Enable 2-factor authentication on Gmail first
- Generate App Password in Gmail Security settings
- Use the App Password (not your regular password) in `EMAIL_PASS`

For detailed API documentation, see `postman/README.md`