#!/bin/bash

echo "🚀 Setting up Attendance Tracker with complete seed data..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create .env file first."
    echo "Copy from .env.example and fill in your database credentials."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🗃️ Setting up database..."
npx prisma migrate dev --name init

echo ""
echo "🌱 Seeding database with sample data..."
echo "   - 1 Admin user"
echo "   - 35 Employee users with realistic names"
echo "   - Attendance data from June 2025 to December 2025"
echo "   - Password for all users: Password@123"
echo ""

pnpm seed

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Quick Start:"
echo "   1. Start development server: pnpm dev"
echo "   2. Login as admin: admin@company.com / Password@123"
echo "   3. Login as employee: EMP001 / Password@123 (or any EMP002, EMP003, etc.)"
echo "   4. Open Prisma Studio: npx prisma studio"
echo ""
echo "📊 Database Summary:"
echo "   - 36 total users (1 admin + 35 employees)"
echo "   - 6 months of attendance data (June-December 2025)"
echo "   - ~15,000+ attendance records"
echo "   - Realistic department and section assignments"
echo "   - Various mood distributions in attendance"
echo ""
echo "🔧 Useful commands:"
echo "   - pnpm dev          # Start development server"
echo "   - pnpm build        # Build for production"
echo "   - pnpm seed         # Re-run seeding"
echo "   - npx prisma studio # Open database GUI"
echo "   - npx prisma reset  # Reset and re-seed database"
echo ""