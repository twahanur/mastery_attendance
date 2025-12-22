import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: Role.ADMIN }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@company.com';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'System';
    const adminLastName = process.env.ADMIN_LAST_NAME || 'Administrator';
    const adminEmployeeId = process.env.ADMIN_EMPLOYEE_ID || 'ADM001';
    const adminSection = process.env.ADMIN_SECTION || 'Administration';
    const adminDepartment = process.env.ADMIN_DEPARTMENT || 'Management';
    const adminDesignation = process.env.ADMIN_DESIGNATION || 'System Administrator';
    const adminPhone = process.env.ADMIN_PHONE || '+1234567890';
    const adminAddress = process.env.ADMIN_ADDRESS || '123 Admin Street';

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        password: hashedPassword,
        role: Role.ADMIN,
        firstName: adminFirstName,
        lastName: adminLastName,
        employeeId: adminEmployeeId,
        section: adminSection,
        department: adminDepartment,
        designation: adminDesignation,
        phoneNumber: adminPhone,
        address: adminAddress,
        dateOfJoining: new Date('2024-01-01'),
        isActive: true,
        createdBy: null // Self-created
      }
    });

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      username: adminUser.username,
      role: adminUser.role
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
createAdminUser();